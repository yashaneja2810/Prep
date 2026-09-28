import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { successResponse } from '../../common/helpers/api-response.helper';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AuthenticatedRequest } from '../../common/types';
import { COLUMNS } from '../../common/helpers/string-const';
import { Roles } from '../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../common/helpers/string-const';
import { RolesGuard } from '../../common/guards/roles.guard';

/**
 * Points Controller
 * Handles API endpoints for user points
 */
@ApiTags('Points')
@Controller('points')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * Get user points
   * GET /api/points/me
   */
  @Get('me')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.LEARNER)
  @ApiOperation({ summary: 'Get authenticated user points and breakdown' })
  @ApiResponse({
    status: 200,
    description: 'User points retrieved successfully',
  })
  async getUserPoints(@Req() req: AuthenticatedRequest) {
    const userId = req.user[COLUMNS.ID];
    const pointsData = await this.pointsService.getPointsBreakdown(userId);
    return successResponse(pointsData, 'User points retrieved successfully');
  }
  
  /**
   * Get points for a specific user (for leaderboard purposes)
   * GET /api/points/user/:id
   */
  @Get('user/:id')
  @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.LEARNER)
  @ApiOperation({ summary: 'Get points for a specific user (for leaderboard)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User points retrieved successfully',
  })
  async getSpecificUserPoints(@Param('id') userId: string) {
    const pointsData = await this.pointsService.getPointsBreakdown(userId);
    return successResponse(pointsData, 'User points retrieved successfully');
  }
} 