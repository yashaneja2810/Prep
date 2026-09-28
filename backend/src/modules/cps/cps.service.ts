import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateCpDto } from './dto/create-cp.dto';
import { CreateCpsBatchDto } from './dto/create-cps-batch.dto';
import { UpdateCpDto } from './dto/update-cp.dto';
import {
  TABLES,
  MESSAGES,
  DIFFICULTY,
  COLUMNS,
  QUERY,
  ORDER_OPTIONS,
} from '../../common/helpers/string-const';

/**
 * CPs Service
 * Implements Concept Practice business logic
 * Following Task 7.3 requirements from tasks.md
 */
@Injectable()
export class CpsService extends BaseService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a single concept practice
   * @param topicId - Topic ID to associate with
   * @param createCpDto - CP creation data
   * @returns Promise with created CP
   */
  async createCP(topicId: string, createCpDto: CreateCpDto) {
    this.logger.log(`Creating CP for topic: ${topicId}`);

    // Validate topic exists
    await this.validateTopicExists(topicId);

    // Validate difficulty if provided
    if (
      createCpDto.difficulty &&
      !Object.values(DIFFICULTY).includes(createCpDto.difficulty)
    ) {
      throw new BadRequestException(MESSAGES.CP_INVALID_DIFFICULTY);
    }

    // Database will auto-generate UUID for the id field
    const cpData = {
      ...createCpDto,
      topic_id: topicId,
      difficulty: createCpDto.difficulty || DIFFICULTY.EASY, // Default to Easy if not provided
    };

    try {
      return await this.create(TABLES.CPS, cpData);
    } catch (error) {
      this.logger.error(`Failed to create CP: ${error.message}`, error.stack);
      throw new Error(MESSAGES.CP_CREATE_ERROR);
    }
  }

  /**
   * Create multiple concept practices in a batch
   * Required by Task 7.3
   * @param createCpsBatchDto - Batch CP creation data
   * @returns Promise with created CPs
   */
  async createCPsBatch(createCpsBatchDto: CreateCpsBatchDto) {
    this.logger.log(
      `Creating batch of ${createCpsBatchDto.cps.length} CPs for topic: ${createCpsBatchDto.topic_id}`,
    );

    // Validate topic exists
    await this.validateTopicExists(createCpsBatchDto.topic_id);

    // Validate all difficulties if provided
    for (const cp of createCpsBatchDto.cps) {
      if (cp.difficulty && !Object.values(DIFFICULTY).includes(cp.difficulty)) {
        throw new BadRequestException(
          `${MESSAGES.CP_INVALID_DIFFICULTY} for CP: ${cp.title}`,
        );
      }
    }

    // Prepare batch data - database will auto-generate UUIDs for id field
    const batchData = createCpsBatchDto.cps.map((cp) => ({
      ...cp,
      topic_id: createCpsBatchDto.topic_id,
      difficulty: cp.difficulty || DIFFICULTY.EASY, // Default to Easy if not provided
      // The database will auto-generate the UUID for the id field
    }));

    try {
      this.logger.debug(
        `Batch data being inserted:`,
        JSON.stringify(batchData, null, 2),
      );

      const query = this.supabaseService.client
        .from(TABLES.CPS)
        .insert(batchData)
        .select('*');

      const result = await this.executeQuery(query, MESSAGES.CP_CREATE_ERROR);

      this.logger.log(
        `Successfully created batch of ${Array.isArray(result) ? result.length : 1} CPs`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to create CP batch. Error: ${error.message}`);
      this.logger.error(`Batch data was:`, JSON.stringify(batchData, null, 2));
      this.logger.error(`Full error stack:`, error.stack);
      throw new Error(`${MESSAGES.CP_CREATE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find CPs by topic ID
   * Required by Task 7.3
   * @param topicId - Topic ID
   * @returns Promise with array of CPs
   */
  async findCPsByTopicId(topicId: string) {
    this.logger.log(`Finding CPs for topic: ${topicId}`);

    // Validate topic exists
    await this.validateTopicExists(topicId);

    const query = this.supabaseService.client
      .from(TABLES.CPS)
      .select(QUERY.SELECT_ALL)
      .eq(COLUMNS.TOPIC_ID, topicId)
      .order(COLUMNS.ID, ORDER_OPTIONS.DESCENDING);

    try {
      return await this.executeQuery(
        query,
        `Failed to fetch CPs for topic ${topicId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to find CPs for topic ${topicId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find CP by ID
   * Required by Task 7.3
   * @param id - CP ID
   * @returns Promise with found CP
   */
  async findCPById(id: string) {
    this.logger.log(`Finding CP by ID: ${id}`);

    try {
      return await this.findById(TABLES.CPS, id);
    } catch (error) {
      this.logger.error(`CP not found with ID: ${id}`);
      throw new NotFoundException(MESSAGES.CP_NOT_FOUND);
    }
  }

  /**
   * Find all CPs
   * @returns Promise with array of all CPs
   */
  async findAllCPs() {
    this.logger.log('Fetching all CPs');
    return this.findAll(TABLES.CPS, QUERY.SELECT_ALL, COLUMNS.ID, false); // Order by id descending
  }

  /**
   * Update CP by ID
   * Required by Task 7.3
   * @param id - CP ID
   * @param updateCpDto - Update data
   * @returns Promise with updated CP
   */
  async updateCP(id: string, updateCpDto: UpdateCpDto) {
    this.logger.log(`Updating CP with ID: ${id}`);

    // First check if CP exists
    await this.findCPById(id);

    // Validate difficulty if provided
    if (
      updateCpDto.difficulty &&
      !Object.values(DIFFICULTY).includes(updateCpDto.difficulty)
    ) {
      throw new BadRequestException(MESSAGES.CP_INVALID_DIFFICULTY);
    }

    const updateData = {
      ...updateCpDto,
    };

    try {
      return await this.update(TABLES.CPS, id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update CP with ID: ${id}`, error.stack);
      throw new Error(MESSAGES.CP_UPDATE_ERROR);
    }
  }

  /**
   * Delete CP by ID
   * Required by Task 7.3
   * @param id - CP ID
   * @returns Promise with deletion result
   */
  async deleteCP(id: string) {
    this.logger.log(`Deleting CP with ID: ${id}`);

    // First check if CP exists
    await this.findCPById(id);

    try {
      await this.delete(TABLES.CPS, id);
      this.logger.log(`Successfully deleted CP with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete CP with ID: ${id}`, error.stack);
      throw new Error(MESSAGES.CP_DELETE_ERROR);
    }
  }

  /**
   * Validate that a topic exists
   * @param topicId - Topic ID to validate
   * @private
   */
  private async validateTopicExists(topicId: string): Promise<void> {
    try {
      const query = this.supabaseService.client
        .from(TABLES.TOPICS)
        .select(COLUMNS.ID)
        .eq(COLUMNS.ID, topicId)
        .single();

      const result = await this.executeQuery(query, 'Failed to validate topic');

      if (!result) {
        throw new NotFoundException(MESSAGES.CP_INVALID_TOPIC);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to validate topic ${topicId}: ${error.message}`,
      );
      throw new NotFoundException(MESSAGES.CP_INVALID_TOPIC);
    }
  }
}
