import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TABLES, MESSAGES, COLUMNS, QUERY, ORDER_OPTIONS } from '../../common/helpers/string-const';

/**
 * Topics Service
 * Implements Topics business logic
 * Following Task 3.2 requirements from tasks.md
 */
@Injectable()
export class TopicsService extends BaseService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a new topic
   * Required by Task 3.2
   * @param createTopicDto - Topic creation data
   * @returns Promise with created topic
   */
  async createTopic(createTopicDto: CreateTopicDto) {
    this.logger.log(`Creating topic with code: ${createTopicDto.topic_code}`);

    try {
      // Check if topic_code already exists
      const existingTopic = await this.findTopicByCode(createTopicDto.topic_code);
      if (existingTopic) {
        throw new ConflictException(`Topic with code ${createTopicDto.topic_code} already exists`);
      }
    } catch (error) {
      // If it's not a NotFoundException, re-throw the error
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      // If it's NotFoundException, the topic doesn't exist, which is what we want
    }

    const topicData = {
      ...createTopicDto,
      [COLUMNS.CREATED_AT]: new Date().toISOString(),
      [COLUMNS.UPDATED_AT]: new Date().toISOString(),
    };

    return this.create(TABLES.TOPICS, topicData);
  }

  /**
   * Find all topics
   * Required by Task 3.2
   * @returns Promise with array of topics
   */
  async findAllTopics() {
    this.logger.log('Fetching all topics');
    return this.findAll(TABLES.TOPICS, QUERY.SELECT_ALL, COLUMNS.CREATED_AT, false); // Order by created_at descending
  }

  /**
   * Find topic by ID
   * Required by Task 3.2
   * @param id - Topic ID
   * @returns Promise with found topic
   */
  async findTopicById(id: string) {
    this.logger.log(`Finding topic by ID: ${id}`);
    
    try {
      return await this.findById(TABLES.TOPICS, id);
    } catch (error) {
      this.logger.error(`Topic not found with ID: ${id}`);
      throw new NotFoundException(MESSAGES.TOPIC_NOT_FOUND);
    }
  }

  /**
   * Find topic by topic_code
   * @param topicCode - Topic code
   * @returns Promise with found topic or null if not found
   */
  async findTopicByCode(topicCode: string) {
    this.logger.log(`Finding topic by code: ${topicCode}`);
    
    // Use limit(1) instead of single() to avoid errors when no rows found
    const query = this.supabaseService.client
      .from(TABLES.TOPICS)
      .select(QUERY.SELECT_ALL)
      .eq(COLUMNS.TOPIC_CODE, topicCode)
      .limit(QUERY.SINGLE_RECORD);

    try {
      const result = await this.executeQuery(query, `Failed to find topic with code ${topicCode}`);
      
      // If result is an array and has items, return the first one
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }
      
      // If no results found, return null
      return null;
    } catch (error) {
      this.logger.error(`Error finding topic by code ${topicCode}:`, error.message);
      return null; // Return null instead of throwing error
    }
  }

  /**
   * Update topic by ID
   * @param id - Topic ID
   * @param updateTopicDto - Update data
   * @returns Promise with updated topic
   */
  async updateTopic(id: string, updateTopicDto: UpdateTopicDto) {
    this.logger.log(`Updating topic with ID: ${id}`);

    // First check if topic exists
    await this.findTopicById(id);

    // If updating topic_code, check for conflicts
    if (updateTopicDto.topic_code) {
      const existingTopic: any = await this.findTopicByCode(updateTopicDto.topic_code);
      if (existingTopic && existingTopic.id !== id) {
        throw new ConflictException(`Topic with code ${updateTopicDto.topic_code} already exists`);
      }
    }

    const updateData = {
      ...updateTopicDto,
      [COLUMNS.UPDATED_AT]: new Date().toISOString(),
    };

    try {
      return await this.update(TABLES.TOPICS, id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update topic with ID: ${id}`, error.stack);
      throw new Error(MESSAGES.TOPIC_UPDATE_ERROR);
    }
  }

  /**
   * Delete topic by ID
   * @param id - Topic ID
   * @returns Promise with deletion result
   */
  async deleteTopic(id: string) {
    this.logger.log(`Deleting topic with ID: ${id}`);

    // First check if topic exists
    await this.findTopicById(id);

    try {
      await this.delete(TABLES.TOPICS, id);
      this.logger.log(`Successfully deleted topic with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete topic with ID: ${id}`, error.stack);
      throw new Error(MESSAGES.TOPIC_DELETE_ERROR);
    }
  }

  /**
   * Find topics by status
   * @param status - Topic status
   * @returns Promise with array of topics
   */
  async findTopicsByStatus(status: string) {
    this.logger.log(`Finding topics with status: ${status}`);
    
    const query = this.supabaseService.client
      .from(TABLES.TOPICS)
      .select(QUERY.SELECT_ALL)
      .eq(COLUMNS.STATUS, status)
      .order(COLUMNS.CREATED_AT, ORDER_OPTIONS.DESCENDING);

    return this.executeQuery(query, `Failed to fetch topics with status ${status}`);
  }
} 