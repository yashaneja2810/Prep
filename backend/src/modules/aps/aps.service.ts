import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateApDto } from './dto/create-ap.dto';
import { UpdateApDto } from './dto/update-ap.dto';
import { CreateBatchApDto, BatchApItemDto } from './dto/create-batch-ap.dto';
import { TABLES, MESSAGES, DIFFICULTY, COLUMNS, QUERY, ORDER_OPTIONS } from '../../common/helpers/string-const';

/**
 * Application Problems Service
 * Handles CRUD operations for Application Problems (APS)
 * Based on schema from new_supabase.txt
 */
@Injectable()
export class ApsService extends BaseService {

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a single application problem
   * @param topicId - Topic ID to associate with
   * @param createApDto - AP creation data
   * @returns Promise with created AP
   */
  async createAP(topicId: string, createApDto: CreateApDto) {
    this.logger.log(`Creating AP for topic: ${topicId}`);

    // Validate topic exists
    await this.validateTopicExists(topicId);

    // Validate difficulty if provided
    if (createApDto.difficulty && !Object.values(DIFFICULTY).includes(createApDto.difficulty as any)) {
      throw new BadRequestException(MESSAGES.AP_INVALID_DIFFICULTY);
    }

    // Database will auto-generate UUID for the id field
    const apData = {
      ...createApDto,
      topic_id: topicId,
      difficulty: createApDto.difficulty || DIFFICULTY.EASY, // Default to Easy if not provided
    };

    try {
      return await this.create(TABLES.APS, apData);
    } catch (error) {
      this.logger.error(`Failed to create AP: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Create multiple application problems in batch for a specific topic
   * @param createBatchApDto - Batch AP creation data
   * @returns Promise with array of created APs
   */
  async createBatchAPs(createBatchApDto: CreateBatchApDto) {
    this.logger.log(`Creating batch APs for topic: ${createBatchApDto.topic_id}`);

    // Validate topic exists
    await this.validateTopicExists(createBatchApDto.topic_id);

    // Validate all difficulties if provided
    for (const ap of createBatchApDto.aps) {
      if (ap.difficulty && !Object.values(DIFFICULTY).includes(ap.difficulty as any)) {
        throw new BadRequestException(`${MESSAGES.AP_INVALID_DIFFICULTY}: ${ap.difficulty} for AP "${ap.title}"`);
      }
    }

    // Transform batch data to individual AP records
    const apsData = createBatchApDto.aps.map((ap: BatchApItemDto) => ({
      topic_id: createBatchApDto.topic_id,
      title: ap.title,
      instruction: ap.instructions.join('\n'), // Convert array to string with newlines
      objective: ap.objectives.join('\n'), // Convert array to string with newlines
      input: ap.input || null,
      expected_output: ap.expected_output,
      difficulty: ap.difficulty || DIFFICULTY.EASY, // Default to Easy if not provided
    }));

    try {
      // Use Supabase's batch insert functionality
      const query = this.supabaseService.client
        .from(TABLES.APS)
        .insert(apsData)
        .select('*');

      const result = await this.executeQuery(query, 'Failed to create batch APs') as any[];
      
      this.logger.log(`Successfully created ${result.length} APs for topic: ${createBatchApDto.topic_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create batch APs: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Get all application problems
   * @returns Promise with array of APs
   */
  async findAllAPs() {
    this.logger.log('Fetching all APs');
    
    try {
      return await this.findAll(TABLES.APS, QUERY.SELECT_ALL, COLUMNS.ID, false);
    } catch (error) {
      this.logger.error(`Failed to fetch APs: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Get all application problems by topic ID
   * @param topicId - Topic ID to filter by
   * @returns Promise with array of APs for the topic
   */
  async findAPsByTopicId(topicId: string) {
    this.logger.log(`Fetching APs for topic: ${topicId}`);
    
    try {
      const query = this.supabaseService.client
        .from(TABLES.APS)
        .select(QUERY.SELECT_ALL)
        .eq(COLUMNS.TOPIC_ID, topicId)
        .order('created_at', { ascending: false });

      return await this.executeQuery(query, `Failed to fetch APs for topic ${topicId}`);
    } catch (error) {
      this.logger.error(`Failed to fetch APs for topic ${topicId}: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Get a single application problem by ID
   * @param id - AP ID
   * @returns Promise with AP data
   */
  async findAPById(id: string) {
    this.logger.log(`Fetching AP with ID: ${id}`);
    
    try {
      return await this.findById(TABLES.APS, id);
    } catch (error) {
      this.logger.error(`Failed to fetch AP: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Update an application problem
   * @param id - AP ID
   * @param updateApDto - AP update data
   * @returns Promise with updated AP
   */
  async updateAP(id: string, updateApDto: UpdateApDto) {
    this.logger.log(`Updating AP with ID: ${id}`);

    // Validate AP exists
    await this.findAPById(id);

    // Validate difficulty if provided
    if (updateApDto.difficulty && !Object.values(DIFFICULTY).includes(updateApDto.difficulty as any)) {
      throw new BadRequestException(MESSAGES.AP_INVALID_DIFFICULTY);
    }

    // Only validate topic_id if it's provided and is a non-empty string
    if (updateApDto.topic_id !== undefined && updateApDto.topic_id !== null && typeof updateApDto.topic_id === 'string' && updateApDto.topic_id.trim() !== '') {
      await this.validateTopicExists(updateApDto.topic_id.trim());
    }

    // Create a clean update object, excluding undefined/null topic_id
    const updateData = { ...updateApDto };
    if (updateApDto.topic_id === undefined || updateApDto.topic_id === null || updateApDto.topic_id === '') {
      delete updateData.topic_id;
    }

    try {
      return await this.update(TABLES.APS, id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update AP: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Delete an application problem
   * @param id - AP ID
   * @returns Promise with success message
   */
  async deleteAP(id: string) {
    this.logger.log(`Deleting AP with ID: ${id}`);

    // Validate AP exists
    await this.findAPById(id);

    try {
      await this.delete(TABLES.APS, id);
      return { message: 'Application problem deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete AP: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }

  /**
   * Validate that a topic exists
   * @param topicId - Topic ID to validate
   * @throws BadRequestException if topic doesn't exist
   */
  private async validateTopicExists(topicId: string) {
    try {
      const query = this.supabaseService.client
        .from(TABLES.TOPICS)
        .select(COLUMNS.ID)
        .eq(COLUMNS.ID, topicId)
        .single();

      const result = await this.executeQuery(query, 'Failed to validate topic');
      
      if (!result) {
        throw new BadRequestException(MESSAGES.AP_INVALID_TOPIC);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to validate topic: ${error.message}`, error.stack);
      // Re-throw the original error to preserve Supabase error details
      throw error;
    }
  }
} 