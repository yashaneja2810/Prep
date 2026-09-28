import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { PointsService } from '../points/points.service';
import { POINT_VALUES, POINT_ACTIONS } from '../../common/helpers/points-const';

/**
 * Completions Service
 * 
 * Handles tracking completions of various types:
 * - Topics
 * - Concept Practice (CP)
 * - Objectives
 * - Outcomes
 */
@Injectable()
export class CompletionsService extends BaseService {
  protected readonly logger = new Logger(CompletionsService.name);
  
  constructor(
    supabaseService: SupabaseService,
    private readonly pointsService: PointsService
  ) {
    super(supabaseService);
  }
  
  /**
   * Mark a topic as completed
   * 
   * @param userId - User ID
   * @param topicId - Topic ID 
   * @returns Promise with the completion record
   */
  async markTopicCompleted(userId: string, topicId: string) {
    this.logger.log(`Marking topic ${topicId} as completed for user ${userId}`);
    
    try {
      // Verify the topic exists
      await this.verifyResourceExists('topics', topicId);
      
      // Check if already completed
      const alreadyCompleted = await this.isAlreadyCompleted('topic_completions', userId, topicId);
      if (alreadyCompleted) {
        return { alreadyCompleted: true, completion: alreadyCompleted };
      }
      
      // Create completion record
      const completionData = {
        user_id: userId,
        topic_id: topicId
      };
      
      const completion = await this.create('topic_completions', completionData);
      
      // Add points
      await this.pointsService.addPoints(
        userId,
        POINT_ACTIONS.TOPIC_COMPLETION,
        topicId,
        POINT_VALUES.TOPIC_COMPLETION
      );
      
      return { alreadyCompleted: false, completion };
    } catch (error) {
      this.logger.error(`Error marking topic completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Delete a topic completion
   * 
   * @param userId - User ID
   * @param topicId - Topic ID 
   * @returns Promise with deletion result
   */
  async deleteTopicCompletion(userId: string, topicId: string) {
    this.logger.log(`Deleting topic ${topicId} completion for user ${userId}`);
    
    try {
      // Check if completion exists
      const completion = await this.isAlreadyCompleted('topic_completions', userId, topicId);
      if (!completion) {
        throw new NotFoundException(`Completion for topic ${topicId} not found for user ${userId}`);
      }
      
      // Delete completion record
      const { data, error } = await this.supabaseService.client
        .from('topic_completions')
        .delete()
        .eq('user_id', userId)
        .eq('topic_id', topicId);
        
      if (error) {
        throw new Error(`Error deleting topic completion: ${error.message}`);
      }
      
      // Remove points
      await this.pointsService.deletePointsForAction(
        userId,
        POINT_ACTIONS.TOPIC_COMPLETION,
        topicId
      );
      
      return { success: true, message: 'Topic completion deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting topic completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Mark a CP (concept practice) as completed
   * 
   * @param userId - User ID
   * @param cpId - CP ID
   * @returns Promise with the completion record
   */
  async markCpCompleted(userId: string, cpId: string) {
    this.logger.log(`Marking CP ${cpId} as completed for user ${userId}`);
    
    try {
      // Verify the CP exists
      await this.verifyResourceExists('cps', cpId);
      
      // Check if already completed
      const alreadyCompleted = await this.isAlreadyCompleted('cp_completion', userId, cpId, 'cp_id');
      if (alreadyCompleted) {
        return { alreadyCompleted: true, completion: alreadyCompleted };
      }
      
      // Create completion record
      const completionData = {
        user_id: userId,
        cp_id: cpId
      };
      
      const completion = await this.create('cp_completion', completionData);
      
      // Add points
      await this.pointsService.addPoints(
        userId,
        POINT_ACTIONS.CP_COMPLETION,
        cpId,
        POINT_VALUES.CP_COMPLETION
      );
      
      return { alreadyCompleted: false, completion };
    } catch (error) {
      this.logger.error(`Error marking CP completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Delete a CP completion
   * 
   * @param userId - User ID
   * @param cpId - CP ID 
   * @returns Promise with deletion result
   */
  async deleteCpCompletion(userId: string, cpId: string) {
    this.logger.log(`Deleting CP ${cpId} completion for user ${userId}`);
    
    try {
      // Check if completion exists
      const completion = await this.isAlreadyCompleted('cp_completion', userId, cpId, 'cp_id');
      if (!completion) {
        throw new NotFoundException(`Completion for CP ${cpId} not found for user ${userId}`);
      }
      
      // Delete completion record
      const { data, error } = await this.supabaseService.client
        .from('cp_completion')
        .delete()
        .eq('user_id', userId)
        .eq('cp_id', cpId);
        
      if (error) {
        throw new Error(`Error deleting CP completion: ${error.message}`);
      }
      
      // Remove points
      await this.pointsService.deletePointsForAction(
        userId,
        POINT_ACTIONS.CP_COMPLETION,
        cpId
      );
      
      return { success: true, message: 'CP completion deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting CP completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Mark an objective item as completed
   * 
   * @param userId - User ID
   * @param objectiveItemId - Objective Item ID
   * @returns Promise with the completion record
   */
  async markObjectiveCompleted(userId: string, objectiveItemId: string) {
    this.logger.log(`Marking objective item ${objectiveItemId} as completed for user ${userId}`);
    
    try {
      // Verify the objective item exists
      await this.verifyResourceExists('objective_items', objectiveItemId);
      
      // Check if already completed
      const alreadyCompleted = await this.isAlreadyCompleted(
        'objective_completions', 
        userId, 
        objectiveItemId,
        'objective_item_id'
      );
      
      if (alreadyCompleted) {
        return { alreadyCompleted: true, completion: alreadyCompleted };
      }
      
      // Create completion record
      const completionData = {
        user_id: userId,
        objective_item_id: objectiveItemId
      };
      
      const completion = await this.create('objective_completions', completionData);
      
      // Add points for objective completion
      await this.pointsService.addPoints(
        userId,
        POINT_ACTIONS.OBJECTIVE_COMPLETION,
        objectiveItemId,
        POINT_VALUES.OBJECTIVE_COMPLETION
      );
      
      return { alreadyCompleted: false, completion };
    } catch (error) {
      this.logger.error(`Error marking objective completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Delete an objective completion
   * 
   * @param userId - User ID
   * @param objectiveItemId - Objective Item ID 
   * @returns Promise with deletion result
   */
  async deleteObjectiveCompletion(userId: string, objectiveItemId: string) {
    this.logger.log(`Deleting objective ${objectiveItemId} completion for user ${userId}`);
    
    try {
      // Check if completion exists
      const completion = await this.isAlreadyCompleted(
        'objective_completions', 
        userId, 
        objectiveItemId,
        'objective_item_id'
      );
      
      if (!completion) {
        throw new NotFoundException(`Completion for objective ${objectiveItemId} not found for user ${userId}`);
      }
      
      // Delete completion record
      const { data, error } = await this.supabaseService.client
        .from('objective_completions')
        .delete()
        .eq('user_id', userId)
        .eq('objective_item_id', objectiveItemId);
        
      if (error) {
        throw new Error(`Error deleting objective completion: ${error.message}`);
      }
      
      // Remove points for objective completion
      await this.pointsService.deletePointsForAction(
        userId,
        POINT_ACTIONS.OBJECTIVE_COMPLETION,
        objectiveItemId
      );
      
      return { success: true, message: 'Objective completion deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting objective completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Mark an outcome item as completed
   * 
   * @param userId - User ID
   * @param outcomeItemId - Outcome Item ID
   * @returns Promise with the completion record
   */
  async markOutcomeCompleted(userId: string, outcomeItemId: string) {
    this.logger.log(`Marking outcome item ${outcomeItemId} as completed for user ${userId}`);
    
    try {
      // Verify the outcome item exists
      await this.verifyResourceExists('outcome_items', outcomeItemId);
      
      // Check if already completed
      const alreadyCompleted = await this.isAlreadyCompleted(
        'outcome_completions', 
        userId, 
        outcomeItemId,
        'outcome_item_id'
      );
      
      if (alreadyCompleted) {
        return { alreadyCompleted: true, completion: alreadyCompleted };
      }
      
      // Create completion record
      const completionData = {
        user_id: userId,
        outcome_item_id: outcomeItemId
      };
      
      const completion = await this.create('outcome_completions', completionData);
      
      // Add points for outcome completion
      await this.pointsService.addPoints(
        userId,
        POINT_ACTIONS.OUTCOME_COMPLETION,
        outcomeItemId,
        POINT_VALUES.OUTCOME_COMPLETION
      );
      
      return { alreadyCompleted: false, completion };
    } catch (error) {
      this.logger.error(`Error marking outcome completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Delete an outcome completion
   * 
   * @param userId - User ID
   * @param outcomeItemId - Outcome Item ID 
   * @returns Promise with deletion result
   */
  async deleteOutcomeCompletion(userId: string, outcomeItemId: string) {
    this.logger.log(`Deleting outcome ${outcomeItemId} completion for user ${userId}`);
    
    try {
      // Check if completion exists
      const completion = await this.isAlreadyCompleted(
        'outcome_completions', 
        userId, 
        outcomeItemId,
        'outcome_item_id'
      );
      
      if (!completion) {
        throw new NotFoundException(`Completion for outcome ${outcomeItemId} not found for user ${userId}`);
      }
      
      // Delete completion record
      const { data, error } = await this.supabaseService.client
        .from('outcome_completions')
        .delete()
        .eq('user_id', userId)
        .eq('outcome_item_id', outcomeItemId);
        
      if (error) {
        throw new Error(`Error deleting outcome completion: ${error.message}`);
      }
      
      // Remove points for outcome completion
      await this.pointsService.deletePointsForAction(
        userId,
        POINT_ACTIONS.OUTCOME_COMPLETION,
        outcomeItemId
      );
      
      return { success: true, message: 'Outcome completion deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting outcome completion: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Verify that a resource exists in the database
   * 
   * @param tableName - The table name to check
   * @param resourceId - The resource ID to check
   */
  private async verifyResourceExists(tableName: string, resourceId: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from(tableName)
      .select('id')
      .eq('id', resourceId)
      .single();
      
    if (error || !data) {
      throw new NotFoundException(`${tableName.slice(0, -1)} with ID ${resourceId} not found`);
    }
  }
  
  /**
   * Check if a completion already exists
   * 
   * @param tableName - The completions table to check
   * @param userId - User ID
   * @param resourceId - Resource ID
   * @param resourceIdColumn - Column name for the resource ID (default: 'topic_id')
   * @returns The existing completion or null
   */
  private async isAlreadyCompleted(
    tableName: string, 
    userId: string, 
    resourceId: string,
    resourceIdColumn: string = 'topic_id'
  ): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .eq(resourceIdColumn, resourceId)
      .maybeSingle();
      
    if (error) {
      throw new Error(`Error checking completion status: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get all topic completions for a user
   * 
   * @param userId - User ID
   * @returns Promise with array of topic completions
   */
  async getUserTopicCompletions(userId: string) {
    this.logger.log(`Getting topic completions for user ${userId}`);
    
    try {
      const { data, error } = await this.supabaseService.client
        .from('topic_completions')
        .select(`
          *,
          topics:topic_id (*)
        `)
        .eq('user_id', userId);
        
      if (error) {
        throw new Error(`Error fetching topic completions: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      this.logger.error(`Error getting topic completions: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Get all CP completions for a user
   * 
   * @param userId - User ID
   * @returns Promise with array of CP completions
   */
  async getUserCpCompletions(userId: string) {
    this.logger.log(`Getting CP completions for user ${userId}`);
    
    try {
      const { data, error } = await this.supabaseService.client
        .from('cp_completion')
        .select(`
          *,
          cps:cp_id (*)
        `)
        .eq('user_id', userId);
        
      if (error) {
        throw new Error(`Error fetching CP completions: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      this.logger.error(`Error getting CP completions: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Get all objective completions for a user
   * 
   * @param userId - User ID
   * @returns Promise with array of objective completions
   */
  async getUserObjectiveCompletions(userId: string) {
    this.logger.log(`Getting objective completions for user ${userId}`);
    
    try {
      const { data, error } = await this.supabaseService.client
        .from('objective_completions')
        .select(`
          *,
          objective_items:objective_item_id (*)
        `)
        .eq('user_id', userId);
        
      if (error) {
        throw new Error(`Error fetching objective completions: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      this.logger.error(`Error getting objective completions: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Get all outcome completions for a user
   * 
   * @param userId - User ID
   * @returns Promise with array of outcome completions
   */
  async getUserOutcomeCompletions(userId: string) {
    this.logger.log(`Getting outcome completions for user ${userId}`);
    
    try {
      const { data, error } = await this.supabaseService.client
        .from('outcome_completions')
        .select(`
          *,
          outcome_items:outcome_item_id (*)
        `)
        .eq('user_id', userId);
        
      if (error) {
        throw new Error(`Error fetching outcome completions: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      this.logger.error(`Error getting outcome completions: ${error.message}`, error.stack);
      throw error;
    }
  }
} 