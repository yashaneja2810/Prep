import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.service';
import { PointsService } from '../points/points.service';
import { POINT_VALUES, POINT_ACTIONS } from '../../common/helpers/points-const';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionSummaryDto,
  SessionAttendanceDto,
  AttendanceItemDto,
  LearnerNotesDto,
  UpdateLearnerNotesDto,
  SessionResourceDto,
  CreateSessionResourceDto,
  UpdateSessionResourceDto
} from './dto';
import { successResponse, errorResponse } from '../../common/helpers/api-response.helper';
import { HTTP_STATUS } from '../../common/helpers/string-const';

// Database table names
const TABLES = {
  COHORT_SESSIONS: 'cohort_sessions',
  SESSION_ATTENDANCE: 'session_attendances',
  SESSION_SUMMARY: 'session_summary',
  SESSION_RESOURCES: 'session_resources',
  COHORT_LEARNERS: 'cohort_learners',
  COHORTS: 'cohorts',
  LEARNER_SESSION_NOTES: 'learner_session_notes',
  USERS: 'users'
};

/**
 * Cohort Sessions Service
 * Handles business logic for cohort sessions
 */
@Injectable()
export class CohortSessionsService {
  private readonly logger = new Logger(CohortSessionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly pointsService: PointsService
  ) {}

  /**
   * Find all sessions with optional filters
   * @param filters - Optional filters for cohortId, trainerId, status, startDate, endDate
   * @returns List of sessions
   */
  async findAllSessions(filters?: {
    cohortId?: string;
    trainerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      this.logger.log('Finding all sessions with filters:', filters);
      
      let query = this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select(`
          *,
          cohort:cohort_id (
            id,
            cohort_code,
            title
          ),
          trainer:trainer_id (
            id,
            first_name,
            last_name,
            email
          )
        `);
      
      // Apply filters
      if (filters?.cohortId) {
        query = query.eq('cohort_id', filters.cohortId);
      }
      
      if (filters?.trainerId) {
        query = query.eq('trainer_id', filters.trainerId);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // Date range filter
      if (filters?.startDate) {
        query = query.gte('session_date', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('session_date', filters.endDate);
      }
      
      // Order by session date
      query = query.order('session_date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Sessions retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding sessions:', error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve sessions', error);
    }
  }

  /**
   * Find a session by ID
   * @param id - Session ID
   * @returns Session with details
   */
  async findSessionById(id: string) {
    try {
      this.logger.log(`Finding session with ID: ${id}`);
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select(`
          *,
          cohort:cohort_id (
            id,
            cohort_code,
            title
          ),
          trainer:trainer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      return successResponse(data, 'Session retrieved successfully');
    } catch (error) {
      this.logger.error(`Error finding session with ID ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve session', error);
    }
  }

  /**
   * Create a new session
   * @param createSessionDto - Session data
   * @returns Created session
   */
  async createSession(createSessionDto: CreateSessionDto) {
    try {
      this.logger.log('Creating new session');
      
      // Verify cohort exists
      const { data: cohort, error: cohortError } = await this.supabaseService.client
        .from(TABLES.COHORTS)
        .select('id')
        .eq('id', createSessionDto.cohort_id)
        .single();
      
      if (cohortError || !cohort) {
        throw new NotFoundException(`Cohort with ID ${createSessionDto.cohort_id} not found`);
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .insert({
          cohort_id: createSessionDto.cohort_id,
          title: createSessionDto.title,
          description: createSessionDto.description,
          session_date: createSessionDto.session_date,
          session_time: createSessionDto.session_time,
          duration_minutes: createSessionDto.duration_minutes,
          trainer_id: createSessionDto.trainer_id,
          meeting_link: createSessionDto.meeting_link,
          status: createSessionDto.status || 'scheduled'
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session created successfully');
    } catch (error) {
      this.logger.error('Error creating session:', error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to create session', error);
    }
  }

  /**
   * Update a session
   * @param id - Session ID
   * @param updateSessionDto - Updated session data
   * @returns Updated session
   */
  async updateSession(id: string, updateSessionDto: UpdateSessionDto) {
    try {
      this.logger.log(`Updating session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .update({
          title: updateSessionDto.title,
          description: updateSessionDto.description,
          session_date: updateSessionDto.session_date,
          session_time: updateSessionDto.session_time,
          duration_minutes: updateSessionDto.duration_minutes,
          trainer_id: updateSessionDto.trainer_id,
          meeting_link: updateSessionDto.meeting_link,
          status: updateSessionDto.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session updated successfully');
    } catch (error) {
      this.logger.error(`Error updating session with ID ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to update session', error);
    }
  }

  /**
   * Delete a session
   * @param id - Session ID
   * @returns Deleted session
   */
  async deleteSession(id: string) {
    try {
      this.logger.log(`Deleting session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Delete related attendance records first
      await this.supabaseService.client
        .from(TABLES.SESSION_ATTENDANCE)
        .delete()
        .eq('session_id', id);
      
      // Delete related resources
      await this.supabaseService.client
        .from(TABLES.SESSION_SUMMARY)
        .delete()
        .eq('session_id', id);
      
      // Delete the session
      const { data, error } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session deleted successfully');
    } catch (error) {
      this.logger.error(`Error deleting session with ID ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to delete session', error);
    }
  }

  /**
   * Get attendance records for a session
   * @param id - Session ID
   * @returns Session attendance records
   */
  async getSessionAttendance(id: string) {
    try {
      this.logger.log(`Getting attendance for session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_ATTENDANCE)
        .select(`
          *,
          cohort_learner:cohort_learner_id (
            id,
            user_id,
            user:user_id (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('session_id', id);
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Attendance records retrieved successfully');
    } catch (error) {
      this.logger.error(`Error getting attendance for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve session attendance', error);
    }
  }

  /**
   * Record attendance for a session
   * @param id - Session ID
   * @param sessionAttendanceDto - Attendance data
   * @returns Updated attendance records
   */
  async recordSessionAttendance(id: string, sessionAttendanceDto: SessionAttendanceDto) {
    try {
      this.logger.log(`Recording attendance for session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id, cohort_id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Verify all cohort_learner_ids belong to the cohort
      const cohortLearnerIds = sessionAttendanceDto.attendance.map(item => item.cohort_learner_id);
      
      const { data: validLearners, error: learnersError } = await this.supabaseService.client
        .from(TABLES.COHORT_LEARNERS)
        .select('id')
        .eq('cohort_id', existingSession.cohort_id)
        .in('id', cohortLearnerIds);
      
      if (learnersError) {
        throw learnersError;
      }
      
      const validLearnerIds = validLearners.map(learner => learner.id);
      const invalidLearners = cohortLearnerIds.filter(id => !validLearnerIds.includes(id));
      
      if (invalidLearners.length > 0) {
        throw new BadRequestException(`Invalid cohort learner IDs: ${invalidLearners.join(', ')}`);
      }
      
      // Delete existing attendance records for this session
      await this.supabaseService.client
        .from(TABLES.SESSION_ATTENDANCE)
        .delete()
        .eq('session_id', id);
      
      // Insert new attendance records
      const attendanceRecords = sessionAttendanceDto.attendance.map((item: AttendanceItemDto) => ({
        session_id: id,
        cohort_learner_id: item.cohort_learner_id,
        status: item.status
      }));
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_ATTENDANCE)
        .insert(attendanceRecords)
        .select();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Attendance recorded successfully');
    } catch (error) {
      this.logger.error(`Error recording attendance for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to record session attendance', error);
    }
  }

  /**
   * Get summary for a session
   * @param id - Session ID
   * @returns Session summary
   */
  async getSessionSummary(id: string) {
    try {
      this.logger.log(`Getting summary for session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_SUMMARY)
        .select('*')
        .eq('session_id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which is not an error in this case
        throw error;
      }
      
      return successResponse(data || {}, 'Summary retrieved successfully');
    } catch (error) {
      this.logger.error(`Error getting summary for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve session summary', error);
    }
  }

  /**
   * Update summary for a session
   * @param id - Session ID
   * @param sessionSummaryDto - Summary data
   * @returns Updated summary
   */
  async updateSessionSummary(id: string, sessionSummaryDto: SessionSummaryDto) {
    try {
      this.logger.log(`Updating summary for session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Check if summary already exists
      const { data: existingResources } = await this.supabaseService.client
        .from(TABLES.SESSION_SUMMARY)
        .select('id')
        .eq('session_id', id)
        .single();
      
      let result;
      
      if (existingResources) {
        // Update existing summary
        const { data, error } = await this.supabaseService.client
          .from(TABLES.SESSION_SUMMARY)
          .update({
            topics_covered: sessionSummaryDto.topics_covered,
            action_points: sessionSummaryDto.action_points,
            quick_recap: sessionSummaryDto.quick_recap,
            summary: sessionSummaryDto.summary,
            notes: sessionSummaryDto.notes,
            class_files_url: sessionSummaryDto.class_files_url,
            recording_link: sessionSummaryDto.recording_link,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', id)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        result = data;
      } else {
        // Create new summary
        const { data, error } = await this.supabaseService.client
          .from(TABLES.SESSION_SUMMARY)
          .insert({
            session_id: id,
            topics_covered: sessionSummaryDto.topics_covered,
            action_points: sessionSummaryDto.action_points,
            quick_recap: sessionSummaryDto.quick_recap,
            summary: sessionSummaryDto.summary,
            notes: sessionSummaryDto.notes,
            class_files_url: sessionSummaryDto.class_files_url,
            recording_link: sessionSummaryDto.recording_link
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        result = data;
      }
      
      return successResponse(result, 'Summary updated successfully');
    } catch (error) {
      this.logger.error(`Error updating summary for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to update session summary', error);
    }
  }

  /**
   * Get all learner notes for a session
   * @param id - Session ID
   * @returns List of learner notes for the session
   */
  async getSessionLearnerNotes(id: string) {
    try {
      this.logger.log(`Getting learner notes for session with ID: ${id}`);
      
      // Verify session exists
      const { data: session, error: sessionError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id, status')
        .eq('id', id)
        .single();
      
      if (sessionError || !session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Get all learner notes for the session
      const { data, error } = await this.supabaseService.client
        .from(TABLES.LEARNER_SESSION_NOTES)
        .select(`
          *,
          user:user_id (
            id, 
            first_name, 
            last_name, 
            email
          )
        `)
        .eq('session_id', id);
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Learner notes retrieved successfully');
    } catch (error) {
      this.logger.error(`Error getting learner notes for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve learner notes', error);
    }
  }

  /**
   * Get learner notes for a specific user in a session
   * @param id - Session ID
   * @param userId - User ID
   * @returns Learner notes for the user in the session
   */
  async getUserSessionNotes(id: string, userId: string) {
    try {
      this.logger.log(`Getting learner notes for session ${id} and user ${userId}`);
      
      // Check if userId is 'me' - this should never happen at this point since the controller should have replaced it
      if (userId === 'me') {
        throw new BadRequestException("Invalid userId 'me' received in service. This should have been replaced with an actual UUID in the controller.");
      }
      
      // Verify session exists
      const { data: session, error: sessionError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id, status')
        .eq('id', id)
        .single();
      
      if (sessionError || !session) {
        this.logger.error(`Session not found: ${JSON.stringify(sessionError)}`);
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      this.logger.log(`Session found with status: ${session.status}`);
      
      // Get learner notes for the specific user
      this.logger.log(`Fetching notes from table: ${TABLES.LEARNER_SESSION_NOTES}`);
      const { data, error } = await this.supabaseService.client
        .from(TABLES.LEARNER_SESSION_NOTES)
        .select('*')
        .eq('session_id', id)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        this.logger.error(`Error fetching notes: ${JSON.stringify(error)}`);
        // If no notes found, return empty notes
        if (error.code === 'PGRST116') {
          this.logger.log('No notes found for this user, returning empty object');
          return successResponse({ 
            session_id: id, 
            user_id: userId, 
            notes_upd: '',
            uploaded_at: null
          }, 'No notes found for this user');
        }
        throw error;
      }
      
      this.logger.log(`Notes found: ${JSON.stringify(data)}`);
      return successResponse(data, 'Learner notes retrieved successfully');
    } catch (error) {
      this.logger.error(`Error getting learner notes for session ${id} and user ${userId}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve learner notes', error);
    }
  }

  /**
   * Extract content type from base64 string
   */
  private extractContentType(base64String: string): string {
    const match = base64String.match(/^data:([^;]+);base64,/);
    return match ? match[1] : 'application/octet-stream';
  }

  /**
   * Add learner notes for a session
   * @param id - Session ID
   * @param learnerNotesDto - Learner notes data
   * @returns Created learner notes
   */
  async addLearnerNotes(id: string, learnerNotesDto: LearnerNotesDto) {
    try {
      this.logger.log(`Adding learner notes for session with ID: ${id}`);
      this.logger.log(`User ID: ${learnerNotesDto.user_id}`);
      this.logger.log(`Notes content length: ${learnerNotesDto.notes_content?.length || 0}`);
      
      // Check if user_id is 'me' - this should never happen at this point since the controller should have replaced it
      if (learnerNotesDto.user_id === 'me') {
        throw new BadRequestException("Invalid user_id 'me' received in service. This should have been replaced with an actual UUID in the controller.");
      }
      
      // Verify session exists and is completed
      const { data: session, error: sessionError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id, status')
        .eq('id', id)
        .single();
      
      if (sessionError || !session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Check if session is completed
      if (session.status !== 'completed') {
        throw new BadRequestException('Learner notes can only be added for completed sessions');
      }
      
      // Check if the notes_content is a file upload (begins with 'data:')
      let finalNotesContent = learnerNotesDto.notes_content;
      
      if (learnerNotesDto.notes_content && learnerNotesDto.notes_content.startsWith('data:')) {
        // Handle file upload to session-notes bucket
        const fileData = learnerNotesDto.notes_content;
        const contentType = this.extractContentType(fileData);
        const fileExtension = contentType.split('/')[1] || 'pdf';
        const fileName = `${id}/${learnerNotesDto.user_id}/${new Date().getTime()}.${fileExtension}`;
        
        // Remove the data:content-type;base64, prefix
        const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
        
        this.logger.log(`Uploading file to session-notes bucket with path: ${fileName}`);
        this.logger.log(`Content type: ${contentType}`);
        
        // Upload file to Supabase Storage with correct content type
        const { data: uploadData, error: uploadError } = await this.supabaseService.client
          .storage
          .from('session-notes')
          .upload(fileName, Buffer.from(base64Data, 'base64'), {
            contentType: contentType,
            upsert: true,
            cacheControl: '3600'
          });
        
        if (uploadError) {
          this.logger.error(`Storage upload error: ${JSON.stringify(uploadError)}`);
          throw new Error(`Failed to upload notes file: ${uploadError.message}`);
        }
        
        this.logger.log(`File uploaded successfully: ${JSON.stringify(uploadData)}`);
        
        // Get public URL for the uploaded file
        const { data: urlData } = await this.supabaseService.client
          .storage
          .from('session-notes')
          .getPublicUrl(fileName, {
            download: true, // This will set Content-Disposition: attachment
            transform: {
              quality: 100 // Preserve original quality
            }
          });
        
        this.logger.log(`Generated public URL: ${urlData.publicUrl}`);
        
        // Store the public URL in notes_upd
        finalNotesContent = urlData.publicUrl;
      }
      
      // Check if notes already exist for this user and session
      this.logger.log(`Checking if notes already exist for session ${id} and user ${learnerNotesDto.user_id}`);
      const { data: existingNotes, error: checkError } = await this.supabaseService.client
        .from(TABLES.LEARNER_SESSION_NOTES)
        .select('id')
        .eq('session_id', id)
        .eq('user_id', learnerNotesDto.user_id)
        .single();
      
      if (checkError) {
        this.logger.log(`Check error: ${JSON.stringify(checkError)}`);
      }
      
      if (!checkError && existingNotes) {
        this.logger.log(`Updating existing notes with ID: ${existingNotes.id}`);
        // Update existing notes - do not award points for updates
        const { data, error } = await this.supabaseService.client
          .from(TABLES.LEARNER_SESSION_NOTES)
          .update({
            notes_upd: finalNotesContent,
            uploaded_at: new Date().toISOString()
          })
          .eq('id', existingNotes.id)
          .select()
          .single();
        
        if (error) {
          this.logger.error(`Update error: ${JSON.stringify(error)}`);
          throw error;
        }
        
        this.logger.log(`Notes updated successfully: ${JSON.stringify(data)}`);
        return successResponse(data, 'Learner notes updated successfully');
      } else {
        this.logger.log(`Creating new notes for session ${id} and user ${learnerNotesDto.user_id}`);
        this.logger.log(`Final notes content: ${finalNotesContent.substring(0, 100)}...`);
        
        // Create new notes
        const { data, error } = await this.supabaseService.client
          .from(TABLES.LEARNER_SESSION_NOTES)
          .insert({
            session_id: id,
            user_id: learnerNotesDto.user_id,
            notes_upd: finalNotesContent
          })
          .select()
          .single();
        
        if (error) {
          this.logger.error(`Insert error: ${JSON.stringify(error)}`);
          throw error;
        }
        
        this.logger.log(`Notes created successfully: ${JSON.stringify(data)}`);
        
        // Award points for submitting notes (only for new submissions)
        await this.pointsService.addPoints(
          learnerNotesDto.user_id,
          POINT_ACTIONS.NOTES_SUBMISSION,
          data.id,
          POINT_VALUES.NOTES_SUBMISSION
        );
        
        return successResponse(data, 'Learner notes added successfully');
      }
    } catch (error) {
      this.logger.error(`Error adding learner notes for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to add learner notes', error);
    }
  }

  /**
   * Update learner notes for a specific user in a session
   * @param id - Session ID
   * @param userId - User ID
   * @param updateLearnerNotesDto - Updated notes data
   * @returns Updated learner notes
   */
  async updateLearnerNotes(id: string, userId: string, updateLearnerNotesDto: UpdateLearnerNotesDto) {
    try {
      this.logger.log(`Updating learner notes for session ${id} and user ${userId}`);
      
      // Check if userId is 'me' - this should never happen at this point since the controller should have replaced it
      if (userId === 'me') {
        throw new BadRequestException("Invalid userId 'me' received in service. This should have been replaced with an actual UUID in the controller.");
      }
      
      // Verify session exists and is completed
      const { data: session, error: sessionError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id, status')
        .eq('id', id)
        .single();
      
      if (sessionError || !session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Check if session is completed
      if (session.status !== 'completed') {
        throw new BadRequestException('Learner notes can only be updated for completed sessions');
      }
      
      // Check if the notes_content is a file upload (begins with 'data:')
      let finalNotesContent = updateLearnerNotesDto.notes_content;
      
      if (updateLearnerNotesDto.notes_content && updateLearnerNotesDto.notes_content.startsWith('data:')) {
        // Handle file upload to session-notes bucket
        const fileData = updateLearnerNotesDto.notes_content;
        const fileName = `${id}/${userId}/${new Date().getTime()}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await this.supabaseService.client
          .storage
          .from('session-notes')
          .upload(fileName, fileData, {
            contentType: 'application/pdf',
            upsert: true
          });
        
        if (uploadError) {
          throw new Error(`Failed to upload notes file: ${uploadError.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = await this.supabaseService.client
          .storage
          .from('session-notes')
          .getPublicUrl(fileName);
        
        // Store the public URL in notes_upd
        finalNotesContent = urlData.publicUrl;
      }
      
      // Get existing notes
      const { data: existingNotes, error: checkError } = await this.supabaseService.client
        .from(TABLES.LEARNER_SESSION_NOTES)
        .select('id')
        .eq('session_id', id)
        .eq('user_id', userId)
        .single();
      
      if (checkError || !existingNotes) {
        // Create new notes if they don't exist
        const { data, error } = await this.supabaseService.client
          .from(TABLES.LEARNER_SESSION_NOTES)
          .insert({
            session_id: id,
            user_id: userId,
            notes_upd: finalNotesContent
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Award points for submitting notes (only for new submissions)
        await this.pointsService.addPoints(
          userId,
          POINT_ACTIONS.NOTES_SUBMISSION,
          data.id,
          POINT_VALUES.NOTES_SUBMISSION
        );
        
        return successResponse(data, 'Learner notes created successfully');
      } else {
        // Update existing notes - do not award points for updates
        const { data, error } = await this.supabaseService.client
          .from(TABLES.LEARNER_SESSION_NOTES)
          .update({
            notes_upd: finalNotesContent,
            uploaded_at: new Date().toISOString()
          })
          .eq('id', existingNotes.id)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        return successResponse(data, 'Learner notes updated successfully');
      }
    } catch (error) {
      this.logger.error(`Error updating learner notes for session ${id} and user ${userId}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to update learner notes', error);
    }
  }

  /**
   * Get all resources for a session
   * @param id - Session ID
   * @returns List of session resources
   */
  async getSessionResources(id: string) {
    try {
      this.logger.log(`Getting resources for session with ID: ${id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .select('*')
        .eq('session_id', id);
      
      if (error) {
        throw error;
      }
      
      return successResponse(data || [], 'Session resources retrieved successfully');
    } catch (error) {
      this.logger.error(`Error getting resources for session ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to retrieve session resources', error);
    }
  }

  /**
   * Add a resource to a session
   * @param createSessionResourceDto - Resource data
   * @returns Created resource
   */
  async addSessionResource(createSessionResourceDto: CreateSessionResourceDto) {
    try {
      this.logger.log(`Adding resource for session with ID: ${createSessionResourceDto.session_id}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', createSessionResourceDto.session_id)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${createSessionResourceDto.session_id} not found`);
      }
      
      // Check if file URL is a data URL (file upload)
      let fileUrl = createSessionResourceDto.file_url;
      
      if (fileUrl && fileUrl.startsWith('data:')) {
        // Handle file upload to session-resources bucket
        const fileData = fileUrl;
        const fileName = `${createSessionResourceDto.session_id}/${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Determine content type from the data URL
        const contentType = this.extractContentType(fileData);
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await this.supabaseService.client
          .storage
          .from('session-resources')
          .upload(fileName, fileData, {
            contentType: contentType || 'application/octet-stream',
            upsert: true
          });
        
        if (uploadError) {
          throw new Error(`Failed to upload resource file: ${uploadError.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = await this.supabaseService.client
          .storage
          .from('session-resources')
          .getPublicUrl(fileName);
        
        // Update the file URL to the public URL
        fileUrl = urlData.publicUrl;
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .insert({
          session_id: createSessionResourceDto.session_id,
          resource_type: createSessionResourceDto.resource_type,
          file_url: fileUrl,
          external_link: createSessionResourceDto.external_link
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session resource added successfully');
    } catch (error) {
      this.logger.error(`Error adding resource for session ${createSessionResourceDto.session_id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to add session resource', error);
    }
  }

  /**
   * Update a session resource
   * @param id - Resource ID
   * @param updateSessionResourceDto - Updated resource data
   * @returns Updated resource
   */
  async updateSessionResource(id: string, updateSessionResourceDto: UpdateSessionResourceDto) {
    try {
      this.logger.log(`Updating resource with ID: ${id}`);
      
      // Verify resource exists
      const { data: existingResource, error: findError } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .select('id, file_url')
        .eq('id', id)
        .single();
      
      if (findError || !existingResource) {
        throw new NotFoundException(`Resource with ID ${id} not found`);
      }
      
      // Check if file URL is a data URL (new file upload)
      let fileUrl = updateSessionResourceDto.file_url;
      
      if (fileUrl && fileUrl.startsWith('data:')) {
        // Handle file upload to session-resources bucket
        const fileData = fileUrl;
        const existingResourceResult = await this.supabaseService.client
          .from(TABLES.SESSION_RESOURCES)
          .select('session_id')
          .eq('id', id)
          .single();
          
        if (existingResourceResult.error || !existingResourceResult.data) {
          throw new Error('Could not retrieve session ID for the resource');
        }
        
        const sessionId = existingResourceResult.data.session_id;
        const fileName = `${sessionId}/${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Determine content type from the data URL
        const contentType = this.extractContentType(fileData);
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await this.supabaseService.client
          .storage
          .from('session-resources')
          .upload(fileName, fileData, {
            contentType: contentType || 'application/octet-stream',
            upsert: true
          });
        
        if (uploadError) {
          throw new Error(`Failed to upload resource file: ${uploadError.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = await this.supabaseService.client
          .storage
          .from('session-resources')
          .getPublicUrl(fileName);
        
        // Update the file URL to the public URL
        fileUrl = urlData.publicUrl;
      }
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .update({
          resource_type: updateSessionResourceDto.resource_type,
          file_url: fileUrl,
          external_link: updateSessionResourceDto.external_link,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session resource updated successfully');
    } catch (error) {
      this.logger.error(`Error updating resource with ID ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to update session resource', error);
    }
  }

  /**
   * Delete a session resource
   * @param id - Resource ID
   * @returns Deleted resource
   */
  async deleteSessionResource(id: string) {
    try {
      this.logger.log(`Deleting resource with ID: ${id}`);
      
      // Verify resource exists
      const { data: existingResource, error: findError } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .select('id, file_url')
        .eq('id', id)
        .single();
      
      if (findError || !existingResource) {
        throw new NotFoundException(`Resource with ID ${id} not found`);
      }
      
      // If there's a file URL, consider deleting the file from storage
      // Note: We're not deleting from storage here to avoid issues with shared files
      // A separate cleanup job could handle orphaned files
      
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session resource deleted successfully');
    } catch (error) {
      this.logger.error(`Error deleting resource with ID ${id}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to delete session resource', error);
    }
  }

  /**
   * Upload a resource file for a session
   * @param sessionId - Session ID
   * @param file - Uploaded file
   * @param resourceType - Type of resource
   * @param externalLink - Optional external link
   * @returns Created resource
   */
  async uploadSessionResourceFile(
    sessionId: string, 
    file: Express.Multer.File,
    resourceType: string,
    externalLink?: string
  ) {
    try {
      this.logger.log(`Uploading file for session with ID: ${sessionId}`);
      
      // Verify session exists
      const { data: existingSession, error: findError } = await this.supabaseService.client
        .from(TABLES.COHORT_SESSIONS)
        .select('id')
        .eq('id', sessionId)
        .single();
      
      if (findError || !existingSession) {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }
      
      // Generate a unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${sessionId}/${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabaseService.client
        .storage
        .from('session-resources')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });
      
      if (uploadError) {
        throw new Error(`Failed to upload resource file: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded file
      const { data: urlData } = await this.supabaseService.client
        .storage
        .from('session-resources')
        .getPublicUrl(fileName);
      
      // Create the resource record
      const { data, error } = await this.supabaseService.client
        .from(TABLES.SESSION_RESOURCES)
        .insert({
          session_id: sessionId,
          resource_type: resourceType,
          file_url: urlData.publicUrl,
          external_link: externalLink
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data, 'Session resource file uploaded successfully');
    } catch (error) {
      this.logger.error(`Error uploading file for session ${sessionId}:`, error);
      return errorResponse(HTTP_STATUS.BAD_REQUEST, 'Failed to upload session resource file', error);
    }
  }
} 