import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  Logger,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { CohortSessionsService } from './cohort-sessions.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionAttendanceDto,
  SessionSummaryDto,
  LearnerNotesDto,
  UpdateLearnerNotesDto,
  SessionResourceDto,
  CreateSessionResourceDto,
  UpdateSessionResourceDto,
  ResourceType
} from './dto';
import { AuthenticatedRequest } from '../../common/types';
import { COLUMNS } from '../../common/helpers/string-const';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

/**
 * Cohort Sessions Controller
 * Handles API endpoints for cohort session management
 */
@ApiTags('cohort-sessions')
@Controller('cohort-sessions')
@UseGuards(SupabaseAuthGuard)
export class CohortSessionsController {
  private readonly logger = new Logger(CohortSessionsController.name);

  constructor(private readonly cohortSessionsService: CohortSessionsService) {}

  /**
   * Get all cohort sessions with optional filters
   * @param cohortId - Optional cohort ID filter
   * @param trainerId - Optional trainer ID filter
   * @param status - Optional status filter
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns List of cohort sessions
   */
  @Get()
  @ApiOperation({ summary: 'Get all cohort sessions' })
  @ApiQuery({ name: 'cohortId', required: false, description: 'Filter by cohort ID' })
  @ApiQuery({ name: 'trainerId', required: false, description: 'Filter by trainer ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (scheduled/live/completed/cancelled)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO format)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findAllSessions(
    @Query('cohortId') cohortId?: string,
    @Query('trainerId') trainerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log('Retrieving all cohort sessions');
    return this.cohortSessionsService.findAllSessions({
      cohortId,
      trainerId,
      status,
      startDate,
      endDate
    });
  }

  /**
   * Get a cohort session by ID
   * @param id - Session ID
   * @returns Session with details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a cohort session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Session retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findSessionById(@Param('id') id: string) {
    this.logger.log(`Retrieving session with ID: ${id}`);
    return this.cohortSessionsService.findSessionById(id);
  }

  /**
   * Create a new cohort session
   * @param createSessionDto - Session data
   * @returns Created session
   */
  @Post()
  @ApiOperation({ summary: 'Create a new cohort session' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Session created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    this.logger.log('Creating new cohort session');
    return this.cohortSessionsService.createSession(createSessionDto);
  }

  /**
   * Update a cohort session
   * @param id - Session ID
   * @param updateSessionDto - Updated session data
   * @returns Updated session
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a cohort session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Session updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateSession(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto
  ) {
    this.logger.log(`Updating session with ID: ${id}`);
    return this.cohortSessionsService.updateSession(id, updateSessionDto);
  }

  /**
   * Delete a cohort session
   * @param id - Session ID
   * @returns Deleted session
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cohort session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Session deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async deleteSession(@Param('id') id: string) {
    this.logger.log(`Deleting session with ID: ${id}`);
    return this.cohortSessionsService.deleteSession(id);
  }

  /**
   * Get attendance records for a session
   * @param id - Session ID
   * @returns Session attendance records
   */
  @Get(':id/attendance')
  @ApiOperation({ summary: 'Get attendance records for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attendance records retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getSessionAttendance(@Param('id') id: string) {
    this.logger.log(`Retrieving attendance for session with ID: ${id}`);
    return this.cohortSessionsService.getSessionAttendance(id);
  }

  /**
   * Record attendance for a session
   * @param id - Session ID
   * @param sessionAttendanceDto - Attendance data
   * @returns Updated attendance records
   */
  @Post(':id/attendance')
  @ApiOperation({ summary: 'Record attendance for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Attendance recorded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async recordSessionAttendance(
    @Param('id') id: string,
    @Body() sessionAttendanceDto: SessionAttendanceDto
  ) {
    this.logger.log(`Recording attendance for session with ID: ${id}`);
    return this.cohortSessionsService.recordSessionAttendance(id, sessionAttendanceDto);
  }

  /**
   * Get summary for a session
   * @param id - Session ID
   * @returns Session summary
   */
  @Get(':id/summary')
  @ApiOperation({ summary: 'Get summary for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Summary retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session or summary not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getSessionSummary(@Param('id') id: string) {
    this.logger.log(`Retrieving summary for session with ID: ${id}`);
    return this.cohortSessionsService.getSessionSummary(id);
  }

  /**
   * Add or update summary for a session
   * @param id - Session ID
   * @param sessionSummaryDto - Summary data
   * @returns Updated summary
   */
  @Post(':id/summary')
  @ApiOperation({ summary: 'Add or update summary for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Summary updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateSessionSummary(
    @Param('id') id: string,
    @Body() sessionSummaryDto: SessionSummaryDto
  ) {
    this.logger.log(`Updating summary for session with ID: ${id}`);
    return this.cohortSessionsService.updateSessionSummary(id, sessionSummaryDto);
  }

  /**
   * Get all sessions for a cohort
   * @param cohortId - Cohort ID
   * @param status - Optional status filter
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns List of sessions for the cohort
   */
  @Get('cohort/:cohortId')
  @ApiOperation({ summary: 'Get all sessions for a cohort' })
  @ApiParam({ name: 'cohortId', description: 'Cohort ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (scheduled/live/completed/cancelled)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO format)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cohort not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getCohortSessions(
    @Param('cohortId') cohortId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Retrieving sessions for cohort with ID: ${cohortId}`);
    return this.cohortSessionsService.findAllSessions({
      cohortId,
      status,
      startDate,
      endDate
    });
  }

  /**
   * Get all sessions for a trainer
   * @param trainerId - Trainer ID
   * @param status - Optional status filter
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns List of sessions for the trainer
   */
  @Get('trainer/:trainerId')
  @ApiOperation({ summary: 'Get all sessions for a trainer' })
  @ApiParam({ name: 'trainerId', description: 'Trainer ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (scheduled/live/completed/cancelled)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO format)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getTrainerSessions(
    @Param('trainerId') trainerId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Retrieving sessions for trainer with ID: ${trainerId}`);
    return this.cohortSessionsService.findAllSessions({
      trainerId,
      status,
      startDate,
      endDate
    });
  }

  /**
   * Get all learner notes for a session
   * @param id - Session ID
   * @returns List of learner notes for the session
   */
  @Get(':id/learner-notes')
  @ApiOperation({ summary: 'Get all learner notes for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Learner notes retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getSessionLearnerNotes(@Param('id') id: string) {
    this.logger.log(`Retrieving learner notes for session with ID: ${id}`);
    return this.cohortSessionsService.getSessionLearnerNotes(id);
  }

  /**
   * Get learner notes for a specific user in a session
   * @param id - Session ID
   * @param userId - User ID
   * @returns Learner notes for the user in the session
   */
  @Get(':id/learner-notes/:userId')
  @ApiOperation({ summary: 'Get learner notes for a specific user in a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Learner notes retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session or notes not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getUserSessionNotes(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest
  ) {
    // If userId is 'me', use the authenticated user's ID
    let actualUserId = userId;
    if (userId === 'me' && req.user) {
      actualUserId = req.user[COLUMNS.ID];
      this.logger.log(`Using authenticated user ID: ${actualUserId} instead of 'me'`);
    }
    
    this.logger.log(`Retrieving learner notes for session ${id} and user ${actualUserId}`);
    return this.cohortSessionsService.getUserSessionNotes(id, actualUserId);
  }

  /**
   * Add or update learner notes for a session
   * @param id - Session ID
   * @param learnerNotesDto - Learner notes data
   * @returns Created or updated learner notes
   */
  @Post(':id/learner-notes')
  @ApiOperation({ summary: 'Add learner notes for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Learner notes added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async addLearnerNotes(
    @Param('id') id: string,
    @Body() learnerNotesDto: LearnerNotesDto,
    @Req() req: AuthenticatedRequest
  ) {
    this.logger.log(`Adding learner notes for session with ID: ${id}`);
    this.logger.log(`Request user object exists: ${!!req.user}`);
    this.logger.log(`Request user ID: ${req.user?.[COLUMNS.ID] || 'not available'}`);
    this.logger.log(`DTO user_id: ${learnerNotesDto.user_id}`);
    
    // If user_id is 'me', use the authenticated user's ID
    if (learnerNotesDto.user_id === 'me' && req.user) {
      const actualUserId = req.user[COLUMNS.ID];
      this.logger.log(`Using authenticated user ID: ${actualUserId} instead of 'me'`);
      learnerNotesDto.user_id = actualUserId;
    }
    
    return this.cohortSessionsService.addLearnerNotes(id, learnerNotesDto);
  }

  /**
   * Update learner notes for a specific user in a session
   * @param id - Session ID
   * @param userId - User ID
   * @param updateLearnerNotesDto - Updated notes data
   * @returns Updated learner notes
   */
  @Put(':id/learner-notes/:userId')
  @ApiOperation({ summary: 'Update learner notes for a specific user in a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Learner notes updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session or notes not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateLearnerNotes(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateLearnerNotesDto: UpdateLearnerNotesDto,
    @Req() req: AuthenticatedRequest
  ) {
    // If userId is 'me', use the authenticated user's ID
    let actualUserId = userId;
    if (userId === 'me' && req.user) {
      actualUserId = req.user[COLUMNS.ID];
      this.logger.log(`Using authenticated user ID: ${actualUserId} instead of 'me'`);
    }
    
    this.logger.log(`Updating learner notes for session ${id} and user ${actualUserId}`);
    return this.cohortSessionsService.updateLearnerNotes(id, actualUserId, updateLearnerNotesDto);
  }

  /**
   * Get all resources for a session
   * @param id - Session ID
   * @returns List of session resources
   */
  @Get(':id/resources')
  @ApiOperation({ summary: 'Get all resources for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resources retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getSessionResources(@Param('id') id: string) {
    this.logger.log(`Retrieving resources for session with ID: ${id}`);
    return this.cohortSessionsService.getSessionResources(id);
  }

  /**
   * Add a resource to a session
   * @param id - Session ID
   * @param createSessionResourceDto - Resource data
   * @returns Created resource
   */
  @Post(':id/resources')
  @ApiOperation({ summary: 'Add a resource to a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Resource added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async addSessionResource(
    @Param('id') id: string,
    @Body() createSessionResourceDto: SessionResourceDto
  ) {
    this.logger.log(`Adding resource for session with ID: ${id}`);
    // Create a full DTO with session_id included
    const fullDto: CreateSessionResourceDto = {
      ...createSessionResourceDto,
      session_id: id
    };
    return this.cohortSessionsService.addSessionResource(fullDto);
  }

  /**
   * Update a session resource
   * @param id - Session ID
   * @param resourceId - Resource ID
   * @param updateSessionResourceDto - Updated resource data
   * @returns Updated resource
   */
  @Put(':id/resources/:resourceId')
  @ApiOperation({ summary: 'Update a session resource' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiParam({ name: 'resourceId', description: 'Resource ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session or resource not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateSessionResource(
    @Param('id') id: string,
    @Param('resourceId') resourceId: string,
    @Body() updateSessionResourceDto: UpdateSessionResourceDto
  ) {
    this.logger.log(`Updating resource with ID: ${resourceId} for session with ID: ${id}`);
    return this.cohortSessionsService.updateSessionResource(resourceId, updateSessionResourceDto);
  }

  /**
   * Delete a session resource
   * @param id - Session ID
   * @param resourceId - Resource ID
   * @returns Deleted resource
   */
  @Delete(':id/resources/:resourceId')
  @ApiOperation({ summary: 'Delete a session resource' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiParam({ name: 'resourceId', description: 'Resource ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session or resource not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async deleteSessionResource(
    @Param('id') id: string,
    @Param('resourceId') resourceId: string
  ) {
    this.logger.log(`Deleting resource with ID: ${resourceId} for session with ID: ${id}`);
    return this.cohortSessionsService.deleteSessionResource(resourceId);
  }

  /**
   * Upload a resource file for a session
   * @param id - Session ID
   * @param file - Uploaded file
   * @param resourceType - Type of resource
   * @param externalLink - Optional external link
   * @returns Created resource
   */
  @Post(':id/resources/upload')
  @ApiOperation({ summary: 'Upload a resource file for a session' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Resource file uploaded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request or invalid file' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSessionResource(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max
        ],
      }),
    ) file: Express.Multer.File,
    @Query('resourceType') resourceType: ResourceType,
    @Query('externalLink') externalLink?: string,
  ) {
    this.logger.log(`Uploading resource file for session with ID: ${id}`);
    return this.cohortSessionsService.uploadSessionResourceFile(id, file, resourceType, externalLink);
  }
} 