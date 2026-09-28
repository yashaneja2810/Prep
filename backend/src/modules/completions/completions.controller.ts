import { Controller, Post, Delete, Body, UseGuards, Param, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CompletionsService } from './completions.service';
import { successResponse, createdResponse } from '../../common/helpers/api-response.helper';
import { TopicCompletionDto } from './dto/topic-completion.dto';
import { CpCompletionDto } from './dto/cp-completion.dto';
import { ObjectiveCompletionDto } from './dto/objective-completion.dto';
import { OutcomeCompletionDto } from './dto/outcome-completion.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AuthenticatedRequest } from '../../common/types';
import { COLUMNS } from '../../common/helpers/string-const';

/**
 * Completions Controller
 * Handles API endpoints for marking various resources as completed
 */
@ApiTags('Completions')
@Controller('completions')
@UseGuards(SupabaseAuthGuard)
export class CompletionsController {
  constructor(private readonly completionsService: CompletionsService) {}

  /**
   * Get topic completions for a user
   * GET /api/completions/topic
   */
  @Get('topic')
  @ApiOperation({ summary: 'Get all topic completions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Topic completions retrieved successfully'
  })
  async getUserTopicCompletions(@Req() req: AuthenticatedRequest) {
    const userId = req.user[COLUMNS.ID];
    const completions = await this.completionsService.getUserTopicCompletions(userId);
    
    return successResponse(
      completions,
      'Topic completions retrieved successfully'
    );
  }

  /**
   * Mark topic as completed
   * POST /api/completions/topic
   */
  @Post('topic')
  @ApiOperation({ summary: 'Mark a topic as completed' })
  @ApiResponse({
    status: 201,
    description: 'Topic marked as completed successfully'
  })
  async markTopicCompleted(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<TopicCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { topic_id } = completionData;
    const result = await this.completionsService.markTopicCompleted(userId, topic_id);

    if (result.alreadyCompleted) {
      return successResponse(
        result.completion, 
        'Topic was already marked as completed'
      );
    }
    
    return createdResponse(
      result.completion, 
      'Topic marked as completed successfully'
    );
  }
  
  /**
   * Delete topic completion
   * DELETE /api/completions/topic
   */
  @Delete('topic')
  @ApiOperation({ summary: 'Remove a topic completion' })
  @ApiResponse({
    status: 200,
    description: 'Topic completion removed successfully'
  })
  async deleteTopicCompletion(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<TopicCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { topic_id } = completionData;
    const result = await this.completionsService.deleteTopicCompletion(userId, topic_id);
    
    return successResponse(
      result,
      'Topic completion removed successfully'
    );
  }

  /**
   * Get CP completions for a user
   * GET /api/completions/cp
   */
  @Get('cp')
  @ApiOperation({ summary: 'Get all concept practice completions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'CP completions retrieved successfully'
  })
  async getUserCpCompletions(@Req() req: AuthenticatedRequest) {
    const userId = req.user[COLUMNS.ID];
    const completions = await this.completionsService.getUserCpCompletions(userId);
    
    return successResponse(
      completions,
      'Concept practice completions retrieved successfully'
    );
  }

  /**
   * Mark CP as completed
   * POST /api/completions/cp
   */
  @Post('cp')
  @ApiOperation({ summary: 'Mark a concept practice as completed' })
  @ApiResponse({
    status: 201,
    description: 'Concept practice marked as completed successfully'
  })
  async markCpCompleted(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<CpCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { cp_id } = completionData;
    const result = await this.completionsService.markCpCompleted(userId, cp_id);

    if (result.alreadyCompleted) {
      return successResponse(
        result.completion, 
        'Concept practice was already marked as completed'
      );
    }
    
    return createdResponse(
      result.completion, 
      'Concept practice marked as completed successfully'
    );
  }
  
  /**
   * Delete CP completion
   * DELETE /api/completions/cp
   */
  @Delete('cp')
  @ApiOperation({ summary: 'Remove a concept practice completion' })
  @ApiResponse({
    status: 200,
    description: 'Concept practice completion removed successfully'
  })
  async deleteCpCompletion(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<CpCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { cp_id } = completionData;
    const result = await this.completionsService.deleteCpCompletion(userId, cp_id);
    
    return successResponse(
      result,
      'Concept practice completion removed successfully'
    );
  }

  /**
   * Get objective completions for a user
   * GET /api/completions/objective
   */
  @Get('objective')
  @ApiOperation({ summary: 'Get all objective completions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Objective completions retrieved successfully'
  })
  async getUserObjectiveCompletions(@Req() req: AuthenticatedRequest) {
    const userId = req.user[COLUMNS.ID];
    const completions = await this.completionsService.getUserObjectiveCompletions(userId);
    
    return successResponse(
      completions,
      'Objective completions retrieved successfully'
    );
  }

  /**
   * Mark objective as completed
   * POST /api/completions/objective
   */
  @Post('objective')
  @ApiOperation({ summary: 'Mark an objective item as completed' })
  @ApiResponse({
    status: 201,
    description: 'Objective item marked as completed successfully'
  })
  async markObjectiveCompleted(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<ObjectiveCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { objective_item_id } = completionData;
    const result = await this.completionsService.markObjectiveCompleted(userId, objective_item_id);

    if (result.alreadyCompleted) {
      return successResponse(
        result.completion, 
        'Objective item was already marked as completed'
      );
    }
    
    return createdResponse(
      result.completion, 
      'Objective item marked as completed successfully'
    );
  }
  
  /**
   * Delete objective completion
   * DELETE /api/completions/objective
   */
  @Delete('objective')
  @ApiOperation({ summary: 'Remove an objective item completion' })
  @ApiResponse({
    status: 200,
    description: 'Objective item completion removed successfully'
  })
  async deleteObjectiveCompletion(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<ObjectiveCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { objective_item_id } = completionData;
    const result = await this.completionsService.deleteObjectiveCompletion(userId, objective_item_id);
    
    return successResponse(
      result,
      'Objective item completion removed successfully'
    );
  }

  /**
   * Get outcome completions for a user
   * GET /api/completions/outcomes
   */
  @Get('outcomes')
  @ApiOperation({ summary: 'Get all outcome completions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Outcome completions retrieved successfully'
  })
  async getUserOutcomeCompletions(@Req() req: AuthenticatedRequest) {
    const userId = req.user[COLUMNS.ID];
    const completions = await this.completionsService.getUserOutcomeCompletions(userId);
    
    return successResponse(
      completions,
      'Outcome completions retrieved successfully'
    );
  }

  /**
   * Mark outcome as completed
   * POST /api/completions/outcomes
   */
  @Post('outcomes')
  @ApiOperation({ summary: 'Mark an outcome item as completed' })
  @ApiResponse({
    status: 201,
    description: 'Outcome item marked as completed successfully'
  })
  async markOutcomeCompleted(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<OutcomeCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { outcome_item_id } = completionData;
    const result = await this.completionsService.markOutcomeCompleted(userId, outcome_item_id);

    if (result.alreadyCompleted) {
      return successResponse(
        result.completion, 
        'Outcome item was already marked as completed'
      );
    }
    
    return createdResponse(
      result.completion, 
      'Outcome item marked as completed successfully'
    );
  }
  
  /**
   * Delete outcome completion
   * DELETE /api/completions/outcomes
   */
  @Delete('outcomes')
  @ApiOperation({ summary: 'Remove an outcome item completion' })
  @ApiResponse({
    status: 200,
    description: 'Outcome item completion removed successfully'
  })
  async deleteOutcomeCompletion(
    @Req() req: AuthenticatedRequest,
    @Body() completionData: Omit<OutcomeCompletionDto, 'user_id'>
  ) {
    const userId = req.user[COLUMNS.ID];
    const { outcome_item_id } = completionData;
    const result = await this.completionsService.deleteOutcomeCompletion(userId, outcome_item_id);
    
    return successResponse(
      result,
      'Outcome item completion removed successfully'
    );
  }
} 