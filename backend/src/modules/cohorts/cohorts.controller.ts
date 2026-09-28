import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CohortsService } from './cohorts.service';
import {
  CreateCohortDto,
  UpdateCohortDto,
  AddTrainersToCohortDto,
  AddLearnersToCohortDto,
} from './dto';
import { UserWithProfile } from '../../common/types/auth.types';

/**
 * Cohorts Controller
 * Handles API endpoints for cohort management
 */
@ApiTags('cohorts')
@Controller('cohorts')
export class CohortsController {
  private readonly logger = new Logger(CohortsController.name);

  constructor(private readonly cohortsService: CohortsService) {}

  /**
   * Create a new cohort
   * @param createCohortDto - Cohort data
   * @returns The created cohort
   */
  @Post()
  @ApiOperation({ summary: 'Create a new cohort' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cohort created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async createCohort(@Body() createCohortDto: CreateCohortDto) {
    this.logger.log(`Creating new cohort with code: ${createCohortDto.cohort_code}`);
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.createCohort(createCohortDto, mockUser);
  }

  /**
   * Get all cohorts
   * @param scope - Optional scope filter
   * @param status - Optional status filter
   * @param programId - Optional program ID filter
   * @returns List of cohorts
   */
  @Get()
  @ApiOperation({ summary: 'Get all cohorts' })
  @ApiQuery({ name: 'scope', required: false, description: 'Filter by scope (direct/organization)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (upcoming/active/completed/cancelled)' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cohorts retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findAllCohorts(
    @Query('scope') scope?: string,
    @Query('status') status?: string,
    @Query('programId') programId?: string,
  ) {
    this.logger.log('Retrieving all cohorts');
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.findAllCohorts(mockUser, { scope, status, programId });
  }

  /**
   * Get a cohort by ID
   * @param id - Cohort ID
   * @returns Cohort with details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a cohort by ID' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cohort retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findCohortById(@Param('id') id: string) {
    this.logger.log(`Retrieving cohort with ID: ${id}`);
    return this.cohortsService.findCohortById(id);
  }

  /**
   * Update a cohort
   * @param id - Cohort ID
   * @param updateCohortDto - Updated cohort data
   * @returns Updated cohort
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a cohort' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cohort updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateCohort(
    @Param('id') id: string,
    @Body() updateCohortDto: UpdateCohortDto,
  ) {
    this.logger.log(`Updating cohort with ID: ${id}`);
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.updateCohort(id, updateCohortDto, mockUser);
  }

  /**
   * Delete a cohort
   * @param id - Cohort ID
   * @returns Success response
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cohort' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cohort deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async deleteCohort(@Param('id') id: string) {
    this.logger.log(`Deleting cohort with ID: ${id}`);
    return this.cohortsService.deleteCohort(id);
  }

  /**
   * Get trainers for a cohort
   * @param cohortId - Cohort ID
   * @returns List of trainers
   */
  @Get(':id/trainers')
  @ApiOperation({ summary: 'Get trainers for a cohort' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trainers retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getCohortTrainers(@Param('id') cohortId: string) {
    this.logger.log(`Retrieving trainers for cohort with ID: ${cohortId}`);
    return this.cohortsService.getCohortTrainers(cohortId);
  }

  /**
   * Add trainers to a cohort
   * @param cohortId - Cohort ID
   * @param addTrainersDto - Trainer data
   * @returns Success response
   */
  @Post(':id/trainers')
  @ApiOperation({ summary: 'Add trainers to a cohort' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trainers added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async addTrainersToCohort(
    @Param('id') cohortId: string,
    @Body() addTrainersDto: AddTrainersToCohortDto,
  ) {
    this.logger.log(`Adding trainers to cohort with ID: ${cohortId}`);
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.addTrainersToCohort(cohortId, addTrainersDto, mockUser);
  }

  /**
   * Remove a trainer from a cohort
   * @param cohortId - Cohort ID
   * @param trainerId - Trainer ID
   * @returns Success response
   */
  @Delete(':cohortId/trainers/:trainerId')
  @ApiOperation({ summary: 'Remove a trainer from a cohort' })
  @ApiParam({ name: 'cohortId', description: 'Cohort ID' })
  @ApiParam({ name: 'trainerId', description: 'Trainer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trainer removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Trainer not found in cohort' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async removeTrainerFromCohort(
    @Param('cohortId') cohortId: string,
    @Param('trainerId') trainerId: string,
  ) {
    this.logger.log(`Removing trainer ${trainerId} from cohort ${cohortId}`);
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.removeTrainerFromCohort(cohortId, trainerId, mockUser);
  }

  /**
   * Get learners for a cohort
   * @param cohortId - Cohort ID
   * @returns List of learners
   */
  @Get(':id/learners')
  @ApiOperation({ summary: 'Get learners for a cohort' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Learners retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getCohortLearners(@Param('id') cohortId: string) {
    this.logger.log(`Retrieving learners for cohort with ID: ${cohortId}`);
    return this.cohortsService.getCohortLearners(cohortId);
  }

  /**
   * Add learners to a cohort
   * @param cohortId - Cohort ID
   * @param addLearnersDto - Learner data
   * @returns Success response
   */
  @Post(':id/learners')
  @ApiOperation({ summary: 'Add learners to a cohort' })
  @ApiParam({ name: 'id', description: 'Cohort ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Learners added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async addLearnersToCohort(
    @Param('id') cohortId: string,
    @Body() addLearnersDto: AddLearnersToCohortDto,
  ) {
    this.logger.log(`Adding learners to cohort with ID: ${cohortId}`);
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.addLearnersToCohort(cohortId, addLearnersDto, mockUser);
  }

  /**
   * Remove a learner from a cohort
   * @param cohortId - Cohort ID
   * @param learnerId - Learner ID
   * @returns Success response
   */
  @Delete(':cohortId/learners/:learnerId')
  @ApiOperation({ summary: 'Remove a learner from a cohort' })
  @ApiParam({ name: 'cohortId', description: 'Cohort ID' })
  @ApiParam({ name: 'learnerId', description: 'Learner ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Learner removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Learner not found in cohort' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async removeLearnerFromCohort(
    @Param('cohortId') cohortId: string,
    @Param('learnerId') learnerId: string,
  ) {
    this.logger.log(`Removing learner ${learnerId} from cohort ${cohortId}`);
    const mockUser: UserWithProfile = {
      id: 'system',
      email: 'system@example.com',
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: [{
        id: '1',
        role_id: 1,
        role_name: 'admin',
        description: 'System Administrator',
        is_active: true,
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      }],
      organizations: []
    };
    return this.cohortsService.removeLearnerFromCohort(cohortId, learnerId, mockUser);
  }
} 