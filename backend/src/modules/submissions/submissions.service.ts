import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { PointsService } from '../points/points.service';
import { POINT_VALUES, POINT_ACTIONS } from '../../common/helpers/points-const';

/**
 * Submissions Service
 * 
 * Handles submissions for Application Problems (APs)
 */
@Injectable()
export class SubmissionsService extends BaseService {
  protected readonly logger = new Logger(SubmissionsService.name);
  
  constructor(
    supabaseService: SupabaseService,
    private readonly pointsService: PointsService
  ) {
    super(supabaseService);
  }
  
  /**
   * Submit an AP solution
   * 
   * @param userId - User ID
   * @param apId - AP ID
   * @param submissionCode - The code submission
   * @returns Promise with the submission record
   */
  async submitAp(userId: string, apId: string, submissionCode: string) {
    this.logger.log(`User ${userId} submitting solution for AP ${apId}`);
    
    try {
      // Verify the AP exists
      await this.verifyApExists(apId);
      
      // Validate the submission (this is a simple check, actual validation would be more complex)
      const isCorrect = await this.validateApSubmission(apId, submissionCode);
      
      // Get the next attempt number
      const attemptNumber = await this.getNextAttemptNumber(userId, apId);
      
      // Create submission record
      const submissionData = {
        user_id: userId,
        ap_id: apId,
        submission_code: submissionCode,
        is_correct: isCorrect,
        attempt_number: attemptNumber
      };
      
      // Use proper type annotation for the submission
      const submission = await this.create('ap_submissions', submissionData) as { id: string };
      
      // Award points regardless of correctness as per requirements
      await this.pointsService.addPoints(
        userId,
        POINT_ACTIONS.AP_SUBMISSION,
        submission.id, // Now properly typed
        POINT_VALUES.AP_SUBMISSION
      );
      
      return { submission, isCorrect };
    } catch (error) {
      this.logger.error(`Error submitting AP solution: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Verify that an AP exists in the database
   * 
   * @param apId - The AP ID to check
   */
  private async verifyApExists(apId: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from('aps')
      .select('id')
      .eq('id', apId)
      .single();
      
    if (error || !data) {
      throw new NotFoundException(`Application Problem with ID ${apId} not found`);
    }
  }
  
  /**
   * Get the next attempt number for a user's AP submission
   * 
   * @param userId - User ID
   * @param apId - AP ID
   * @returns Next attempt number (starting from 1)
   */
  private async getNextAttemptNumber(userId: string, apId: string): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('ap_submissions')
      .select('attempt_number')
      .eq('user_id', userId)
      .eq('ap_id', apId)
      .order('attempt_number', { ascending: false })
      .limit(1);
      
    if (error) {
      throw new Error(`Error getting attempt number: ${error.message}`);
    }
    
    // If no previous attempts, return 1
    if (data.length === 0) {
      return 1;
    }
    
    // Otherwise, increment the highest attempt number
    return data[0].attempt_number + 1;
  }
  
  /**
   * Validate an AP submission
   * 
   * This is a stub implementation - in a real system, this would run tests against the submission
   * 
   * @param apId - AP ID
   * @param submissionCode - The code to validate
   * @returns Boolean indicating if the submission is correct
   */
  private async validateApSubmission(apId: string, submissionCode: string): Promise<boolean> {
    // Get the AP to check against expected output
    const { data, error } = await this.supabaseService.client
      .from('aps')
      .select('expected_output')
      .eq('id', apId)
      .single();
      
    if (error || !data) {
      throw new Error(`Error validating submission: ${error ? error.message : 'AP not found'}`);
    }
    
    // In a real implementation, this would run the code against test cases
    // For simplicity, we'll assume a basic check where if the submission contains the expected output, it's correct
    // This is just a placeholder - real validation would be much more sophisticated
    
    const expectedOutput = data.expected_output;
    if (!expectedOutput) {
      // If there's no expected output defined, default to considering it correct
      return true;
    }
    
    // Very simple check - in a real system this would be proper test execution
    return submissionCode.includes(expectedOutput);
  }
  
  /**
   * Get all AP submissions for a user
   * 
   * @param userId - User ID
   * @returns Promise with array of AP submissions
   */
  async getUserApSubmissions(userId: string) {
    this.logger.log(`Getting AP submissions for user ${userId}`);
    
    try {
      const { data, error } = await this.supabaseService.client
        .from('ap_submissions')
        .select(`
          *,
          aps:ap_id (*)
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });
        
      if (error) {
        throw new Error(`Error fetching AP submissions: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      this.logger.error(`Error getting AP submissions: ${error.message}`, error.stack);
      throw error;
    }
  }
} 