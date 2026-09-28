import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { POINT_VALUES, POINT_ACTIONS } from '../../common/helpers/points-const';

// Re-export point constants for backward compatibility
export { POINT_VALUES, POINT_ACTIONS };

/**
 * Points Service
 * 
 * Handles user points management including:
 * - Adding points for different activities
 * - Retrieving total points and breakdown
 */
@Injectable()
export class PointsService extends BaseService {
  protected readonly logger = new Logger(PointsService.name);
  
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Add points for a user activity
   * 
   * @param userId - The user ID
   * @param actionType - The type of action (topic_completion, cp_completion, ap_submission)
   * @param referenceId - ID of the item that was completed
   * @param points - The number of points to add
   * @returns Promise with the created user points record
   */
  async addPoints(userId: string, actionType: string, referenceId: string, points: number) {
    this.logger.log(`Adding ${points} points to user ${userId} for ${actionType} - ref: ${referenceId}`);
    
    const pointsData = {
      user_id: userId,
      action_type: actionType,
      reference_id: referenceId,
      points: points
    };
    
    return this.create('user_points', pointsData);
  }
  
  /**
   * Get total points for a user
   * 
   * @param userId - The user ID
   * @returns Promise with the total points
   */
  async getTotalPoints(userId: string) {
    this.logger.log(`Getting total points for user ${userId}`);
    
    const { data, error } = await this.supabaseService.client
      .from('user_points')
      .select('points')
      .eq('user_id', userId);
      
    if (error) {
      this.logger.error(`Error getting total points: ${error.message}`);
      throw new Error(`Failed to get total points: ${error.message}`);
    }
    
    // Sum up all points
    const totalPoints = data.reduce((sum, record) => sum + record.points, 0);
    
    return totalPoints;
  }
  
  /**
   * Get points breakdown by action type
   * 
   * @param userId - The user ID
   * @returns Promise with the points breakdown by action type
   */
  async getPointsBreakdown(userId: string) {
    this.logger.log(`Getting points breakdown for user ${userId}`);
    
    const { data, error } = await this.supabaseService.client
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
      
    if (error) {
      this.logger.error(`Error getting points breakdown: ${error.message}`);
      throw new Error(`Failed to get points breakdown: ${error.message}`);
    }
    
    // Create a breakdown by action_type
    const breakdown = {};
    
    // Group by action_type
    data.forEach(record => {
      const actionType = record.action_type;
      
      if (!breakdown[actionType]) {
        breakdown[actionType] = {
          total: 0,
          activities: []
        };
      }
      
      breakdown[actionType].total += record.points;
      breakdown[actionType].activities.push({
        id: record.id,
        reference_id: record.reference_id,
        points: record.points,
        earned_at: record.earned_at
      });
    });
    
    return {
      total: data.reduce((sum, record) => sum + record.points, 0),
      breakdown
    };
  }

  /**
   * Delete points for a specific action
   * 
   * @param userId - The user ID
   * @param actionType - The type of action (topic_completion, cp_completion, ap_submission)
   * @param referenceId - ID of the item that was completed
   * @returns Promise with the deletion result
   */
  async deletePointsForAction(userId: string, actionType: string, referenceId: string) {
    this.logger.log(`Deleting points for user ${userId}, action ${actionType}, reference ${referenceId}`);
    
    // Find the points record
    const { data, error: findError } = await this.supabaseService.client
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .eq('action_type', actionType)
      .eq('reference_id', referenceId)
      .maybeSingle();
      
    if (findError) {
      this.logger.error(`Error finding points record: ${findError.message}`);
      throw new Error(`Failed to find points record: ${findError.message}`);
    }
    
    // If no record found, nothing to delete
    if (!data) {
      this.logger.warn(`No points record found for deletion: ${userId}, ${actionType}, ${referenceId}`);
      return { success: true, message: 'No points record found for deletion' };
    }
    
    // Delete the points record
    const { error: deleteError } = await this.supabaseService.client
      .from('user_points')
      .delete()
      .eq('id', data.id);
      
    if (deleteError) {
      this.logger.error(`Error deleting points record: ${deleteError.message}`);
      throw new Error(`Failed to delete points record: ${deleteError.message}`);
    }
    
    return { 
      success: true, 
      message: `Successfully deleted ${data.points} points for ${actionType}`
    };
  }
} 