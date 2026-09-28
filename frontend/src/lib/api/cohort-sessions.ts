import { apiRequest } from '@/helpers/request';
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const';

// Define interfaces for the API responses
export interface CohortSession {
  id: string;
  cohort_id: string;
  title: string;
  description?: string;
  session_date: string;
  session_time?: string;
  duration_minutes: number;
  trainer_id: string;
  meeting_link?: string;
  recording_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  cohort?: {
    id: string;
    cohort_code: string;
    title: string;
  };
  trainer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SessionAttendance {
  id: string;
  session_id: string;
  cohort_learner_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  cohort_learner?: {
    id: string;
    user_id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface SessionSummary {
  id: string;
  session_id: string;
  topics_covered?: string;
  action_points?: string;
  quick_recap?: string;
  summary?: string;
  notes?: string;
  class_files_url?: string;
  recording_link?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Create Session DTO
export interface CreateSessionDto {
  cohort_id: string;
  title: string;
  description?: string;
  session_date: string;
  session_time?: string;
  duration_minutes: number;
  trainer_id: string;
  meeting_link?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

// Update Session DTO
export interface UpdateSessionDto {
  title?: string;
  description?: string;
  session_date?: string;
  session_time?: string;
  duration_minutes?: number;
  trainer_id?: string;
  meeting_link?: string;
  recording_link?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

// Session Attendance DTO
export interface SessionAttendanceDto {
  attendance: {
    cohort_learner_id: string;
    status: 'present' | 'absent' | 'late' | 'excused';
  }[];
}

// Session Summary DTO
export interface SessionSummaryDto {
  topics_covered?: string;
  action_points?: string;
  quick_recap?: string;
  summary?: string;
  notes?: string;
  class_files_url?: string;
  recording_link?: string;
}

// Learner Notes interfaces
export interface LearnerNotes {
  id: string;
  session_id: string;
  user_id: string;
  notes_url?: string;  // File URL from the session-notes bucket (legacy field)
  notes_upd?: string;  // New field for file URL
  uploaded_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface LearnerNotesDto {
  session_id: string;
  user_id: string;
  notes_content: string;  // Can be text or base64 encoded file data
}

export interface UpdateLearnerNotesDto {
  notes_content: string;  // Can be text or base64 encoded file data
}

export interface SessionResource {
  id: string;
  session_id: string;
  resource_type: 'video' | 'document' | 'code' | 'image' | 'other';
  file_url?: string;
  external_link?: string;
  created_at: string;
  updated_at?: string;
}

export interface SessionResourceDto {
  resource_type: 'video' | 'document' | 'code' | 'image' | 'other';
  file_url?: string;
  external_link?: string;
}

// API endpoints using constants
const ENDPOINTS = {
  // Cohort sessions
  COHORT_SESSIONS: API_ENDPOINTS.COHORT_SESSIONS,
  COHORT_SESSION_BY_ID: (id: string) => `${API_ENDPOINTS.COHORT_SESSION_BY_ID}/${id}`,
  COHORT_SESSIONS_BY_COHORT: (cohortId: string) => `${API_ENDPOINTS.COHORT_SESSIONS}/cohort/${cohortId}`,
  SESSIONS_BY_TRAINER: (trainerId: string) => `${API_ENDPOINTS.COHORT_SESSIONS}/trainer/${trainerId}`,
  
  // Session attendance
  SESSION_ATTENDANCE: (sessionId: string) => `${API_ENDPOINTS.SESSION_ATTENDANCE}/${sessionId}/attendance`,
  
  // Session summary
  SESSION_SUMMARY: (sessionId: string) => `${API_ENDPOINTS.SESSION_SUMMARY}/${sessionId}/summary`,
  
  // Learner notes
  SESSION_LEARNER_NOTES: (sessionId: string) => `${API_ENDPOINTS.COHORT_SESSIONS}/${sessionId}/learner-notes`,
  USER_SESSION_NOTES: (sessionId: string, userId: string) => `${API_ENDPOINTS.COHORT_SESSIONS}/${sessionId}/learner-notes/${userId}`,
  
  // Session resources
  SESSION_RESOURCES: (sessionId: string) => `${API_ENDPOINTS.SESSION_RESOURCES}/${sessionId}/resources`,
  SESSION_RESOURCE: (sessionId: string, resourceId: string) => `${API_ENDPOINTS.SESSION_RESOURCES}/${sessionId}/resources/${resourceId}`,
}

// SWR keys
export const COHORT_SESSIONS_SWR_KEY = SWR_KEYS.COHORT_SESSIONS
export const COHORT_SESSION_BY_ID_SWR_KEY = (id: string): string => 
  `${SWR_KEYS.COHORT_SESSION_BY_ID}/${id}`
export const COHORT_SESSIONS_BY_COHORT_ID_SWR_KEY = (cohortId: string): string => 
  `${SWR_KEYS.COHORT_SESSIONS_BY_COHORT}/${cohortId}`
export const SESSIONS_BY_TRAINER_ID_SWR_KEY = (trainerId: string): string => 
  `${SWR_KEYS.SESSIONS_BY_TRAINER}/${trainerId}`
export const SESSION_ATTENDANCE_SWR_KEY = (sessionId: string): string => 
  `${SWR_KEYS.SESSION_ATTENDANCE}/${sessionId}`
export const SESSION_SUMMARY_SWR_KEY = (sessionId: string): string => 
  `${SWR_KEYS.SESSION_SUMMARY}/${sessionId}`
export const SESSION_LEARNER_NOTES_SWR_KEY = (sessionId: string): string => 
  `${SWR_KEYS.SESSION_LEARNER_NOTES}/${sessionId}`
export const USER_SESSION_NOTES_SWR_KEY = (sessionId: string, userId: string): string => 
  `${SWR_KEYS.USER_SESSION_NOTES}/${sessionId}/${userId}`
export const SESSION_RESOURCES_SWR_KEY = (sessionId: string): string => 
  `${SWR_KEYS.SESSION_RESOURCES}/${sessionId}`

// API client functions

/**
 * Get all cohort sessions with optional filters
 */
export const getAllCohortSessions = async (filters?: {
  cohortId?: string;
  trainerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<CohortSession[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.cohortId) params.append('cohortId', filters.cohortId);
    if (filters?.trainerId) params.append('trainerId', filters.trainerId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiRequest.get<ApiResponse<CohortSession[]>>(
      `${ENDPOINTS.COHORT_SESSIONS}?${params.toString()}`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching cohort sessions:', error);
    return [];
  }
};

/**
 * Get a cohort session by ID
 */
export const getCohortSessionById = async (id: string): Promise<CohortSession | null> => {
  try {
    const response = await apiRequest.get<ApiResponse<CohortSession>>(
      ENDPOINTS.COHORT_SESSION_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching cohort session ${id}:`, error);
    return null;
  }
};

/**
 * Create a new cohort session
 */
export const createCohortSession = async (sessionData: CreateSessionDto): Promise<CohortSession | null> => {
  try {
    const response = await apiRequest.post<ApiResponse<CohortSession>>(
      ENDPOINTS.COHORT_SESSIONS,
      sessionData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating cohort session:', error);
    return null;
  }
};

/**
 * Update a cohort session
 */
export const updateCohortSession = async (id: string, sessionData: UpdateSessionDto): Promise<CohortSession | null> => {
  try {
    const response = await apiRequest.put<ApiResponse<CohortSession>>(
      ENDPOINTS.COHORT_SESSION_BY_ID(id),
      sessionData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating cohort session ${id}:`, error);
    return null;
  }
};

/**
 * Delete a cohort session
 */
export const deleteCohortSession = async (id: string): Promise<boolean> => {
  try {
    await apiRequest.delete(ENDPOINTS.COHORT_SESSION_BY_ID(id));
    return true;
  } catch (error) {
    console.error(`Error deleting cohort session ${id}:`, error);
    return false;
  }
};

/**
 * Get attendance records for a session
 */
export const getSessionAttendance = async (sessionId: string): Promise<SessionAttendance[]> => {
  try {
    const response = await apiRequest.get<ApiResponse<SessionAttendance[]>>(
      ENDPOINTS.SESSION_ATTENDANCE(sessionId)
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching attendance for session ${sessionId}:`, error);
    return [];
  }
};

/**
 * Record attendance for a session
 */
export const recordSessionAttendance = async (
  sessionId: string,
  attendanceData: SessionAttendanceDto
): Promise<SessionAttendance[] | null> => {
  try {
    const response = await apiRequest.post<ApiResponse<SessionAttendance[]>>(
      ENDPOINTS.SESSION_ATTENDANCE(sessionId),
      attendanceData
    );
    return response.data;
  } catch (error) {
    console.error(`Error recording attendance for session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Get summary for a session
 */
export const getSessionSummary = async (sessionId: string): Promise<SessionSummary | null> => {
  try {
    console.log(`Fetching session summary for session ID: ${sessionId}`);
    const response = await apiRequest.get<ApiResponse<SessionSummary>>(
      ENDPOINTS.SESSION_SUMMARY(sessionId)
    );
    
    console.log(`Session summary API response for ${sessionId}:`, response);
    
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data;
      } else if (
        typeof response === 'object' && 
        response !== null &&
        ('topics_covered' in response || 
         'action_points' in response || 
         'quick_recap' in response)
      ) {
        // The response itself might be the summary object
        return response as unknown as SessionSummary;
      }
    }
    
    console.log(`No summary data found for session ${sessionId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching summary for session ${sessionId}:`, error);
    // Return an empty summary object instead of null to prevent errors
    return {
      id: '',
      session_id: sessionId,
      topics_covered: '',
      action_points: '',
      quick_recap: '',
      summary: '',
      notes: '',
      class_files_url: '',
      recording_link: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

/**
 * Update or create a summary for a session
 */
export const updateSessionSummary = async (
  sessionId: string,
  summaryData: SessionSummaryDto
): Promise<SessionSummary | null> => {
  try {
    const response = await apiRequest.post<ApiResponse<SessionSummary>>(
      ENDPOINTS.SESSION_SUMMARY(sessionId),
      summaryData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating summary for session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Get sessions for a specific cohort
 */
export const getCohortSessions = async (
  cohortId: string,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<CohortSession[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    console.log(`Fetching cohort sessions: ${ENDPOINTS.COHORT_SESSIONS_BY_COHORT(cohortId)}${queryString}`);
    
    const response = await apiRequest.get<ApiResponse<CohortSession[]>>(
      `${ENDPOINTS.COHORT_SESSIONS_BY_COHORT(cohortId)}${queryString}`
    );
    
    // Debug the response
    console.log('Cohort sessions response:', response);
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && 'data' in response) {
      return response.data || [];
    } else {
      console.warn('Unexpected response format from getCohortSessions:', response);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching sessions for cohort ${cohortId}:`, error);
    return [];
  }
};

/**
 * Get sessions for a specific trainer
 */
export const getTrainerSessions = async (
  trainerId: string,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<CohortSession[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiRequest.get<ApiResponse<CohortSession[]>>(
      `${ENDPOINTS.SESSIONS_BY_TRAINER(trainerId)}${queryString}`
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching sessions for trainer ${trainerId}:`, error);
    return [];
  }
};

/**
 * Get learner notes for a session
 */
export const getSessionLearnerNotes = async (sessionId: string): Promise<LearnerNotes[]> => {
  try {
    const response = await apiRequest.get<ApiResponse<LearnerNotes[]>>(
      ENDPOINTS.SESSION_LEARNER_NOTES(sessionId)
    );
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching learner notes for session ${sessionId}:`, error);
    return [];
  }
};

/**
 * Get notes for a specific user in a session
 */
export const getUserSessionNotes = async (sessionId: string, userId: string): Promise<LearnerNotes | null> => {
  try {
    const response = await apiRequest.get<ApiResponse<LearnerNotes>>(
      ENDPOINTS.USER_SESSION_NOTES(sessionId, userId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes for user ${userId} in session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Convert a file to base64 string
 */
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Add learner notes for a session
 */
export const addLearnerNotes = async (
  sessionId: string, 
  notesData: LearnerNotesDto,
  file?: File
): Promise<LearnerNotes | null> => {
  try {
    let data = { ...notesData };
    
    // If a file is provided, convert it to base64
    if (file) {
      const base64 = await fileToBase64(file);
      data.notes_content = base64;
    }
    
    const response = await apiRequest.post<ApiResponse<LearnerNotes>>(
      ENDPOINTS.SESSION_LEARNER_NOTES(sessionId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding learner notes for session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Update learner notes for a session
 */
export const updateLearnerNotes = async (
  sessionId: string,
  userId: string,
  notesData: UpdateLearnerNotesDto,
  file?: File
): Promise<LearnerNotes | null> => {
  try {
    let data = { ...notesData };
    
    // If a file is provided, convert it to base64
    if (file) {
      const base64 = await fileToBase64(file);
      data.notes_content = base64;
    }
    
    const response = await apiRequest.put<ApiResponse<LearnerNotes>>(
      ENDPOINTS.USER_SESSION_NOTES(sessionId, userId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating learner notes for user ${userId} in session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Get resources for a session
 */
export const getSessionResources = async (sessionId: string): Promise<SessionResource[]> => {
  try {
    console.log(`Fetching resources for session ID: ${sessionId}`);
    const response = await apiRequest.get<ApiResponse<SessionResource[]>>(
      ENDPOINTS.SESSION_RESOURCES(sessionId)
    );
    
    console.log(`Session resources API response for ${sessionId}:`, response);
    
    if (response && typeof response === 'object') {
      if ('data' in response) {
        return response.data || [];
      } else if (Array.isArray(response)) {
        // The response itself might be the resources array
        return response;
      }
    }
    
    console.log(`No resources found for session ${sessionId}, returning empty array`);
    return [];
  } catch (error) {
    console.error(`Error fetching resources for session ${sessionId}:`, error);
    return [];
  }
};

/**
 * Add a resource to a session
 */
export const addSessionResource = async (
  sessionId: string,
  resourceData: SessionResourceDto
): Promise<SessionResource | null> => {
  try {
    const response = await apiRequest.post<ApiResponse<SessionResource>>(
      ENDPOINTS.SESSION_RESOURCES(sessionId),
      resourceData
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding resource to session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Update a session resource
 */
export const updateSessionResource = async (
  sessionId: string,
  resourceId: string,
  resourceData: SessionResourceDto
): Promise<SessionResource | null> => {
  try {
    const response = await apiRequest.put<ApiResponse<SessionResource>>(
      ENDPOINTS.SESSION_RESOURCE(sessionId, resourceId),
      resourceData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating resource ${resourceId} for session ${sessionId}:`, error);
    return null;
  }
};

/**
 * Delete a session resource
 */
export const deleteSessionResource = async (
  sessionId: string,
  resourceId: string
): Promise<boolean> => {
  try {
    await apiRequest.delete(ENDPOINTS.SESSION_RESOURCE(sessionId, resourceId));
    return true;
  } catch (error) {
    console.error(`Error deleting resource ${resourceId} for session ${sessionId}:`, error);
    return false;
  }
};

/**
 * Upload a file as a session resource
 */
export const uploadSessionResourceFile = async (
  sessionId: string,
  file: File,
  resourceType: 'video' | 'document' | 'code' | 'image' | 'other',
  externalLink?: string
): Promise<SessionResource | null> => {
  try {
    console.log(`Uploading resource file for session ${sessionId} with type: ${resourceType}`);
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('FormData created with:', {
      sessionId,
      resourceType,
      fileName: file.name,
      fileSize: file.size,
      hasExternalLink: !!externalLink
    });
    
    // Build query string with resourceType and optional externalLink
    let queryParams = `?resourceType=${resourceType}`;
    if (externalLink) {
      queryParams += `&externalLink=${encodeURIComponent(externalLink)}`;
    }
    
    const response = await apiRequest.post<ApiResponse<SessionResource>>(
      `${ENDPOINTS.SESSION_RESOURCES(sessionId)}/upload${queryParams}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } as any // Use type assertion to avoid TypeScript error
    );
    
    console.log(`Upload response:`, response);
    return response.data;
  } catch (error) {
    console.error(`Error uploading resource file to session ${sessionId}:`, error);
    return null;
  }
}; 