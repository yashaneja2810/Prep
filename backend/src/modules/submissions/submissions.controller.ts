import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { createdResponse, successResponse } from '../../common/helpers/api-response.helper';
import { ApSubmissionDto } from './dto/ap-submission.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AuthenticatedRequest } from '../../common/types';
import { COLUMNS } from '../../common/helpers/string-const';

/**
 * Submissions Controller
 * Handles API endpoints for user submissions
 */
@ApiTags('Submissions')
@Controller('submissions')
@UseGuards(SupabaseAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /**
   * Get AP submissions for a user
   * GET /api/submissions/ap
   */
  @Get('ap')
  @ApiOperation({ summary: 'Get all AP submissions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'AP submissions retrieved successfully'
  })
  async getUserApSubmissions(@Req() req: AuthenticatedRequest) {
    const userId = req.user[COLUMNS.ID];
    const submissions = await this.submissionsService.getUserApSubmissions(userId);
    
    return successResponse(
      submissions,
      'AP submissions retrieved successfully'
    );
  }

  /**
   * Submit AP solution
   * POST /api/submissions/ap
   */
  @Post('ap')
  @ApiOperation({ summary: 'Submit a solution for an application problem' })
  @ApiResponse({
    status: 201,
    description: 'AP solution submitted successfully'
  })
  async submitAp(
    @Req() req: AuthenticatedRequest,
    @Body() submissionData: Omit<ApSubmissionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { ap_id, submission_code } = submissionData;
    const result = await this.submissionsService.submitAp(userId, ap_id, submission_code);
    
    return createdResponse(
      result, 
      result.isCorrect 
        ? 'Solution is correct! AP submission successful.' 
        : 'Solution is incorrect, but submission was recorded.'
    );
  }
}