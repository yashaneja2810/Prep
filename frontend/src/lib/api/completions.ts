import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'
import { apiClient } from '@/lib/api/apiClient'

// Base Completion interface
export interface BaseCompletion {
  id: string
  user_id: string
  completed_at: string
  created_at: string
  updated_at: string
}

// Topic Completion interfaces
export interface TopicCompletion extends BaseCompletion {
  topic_id: string
  topic?: {
    id: string
    title: string
    description: string
    [key: string]: any
  }
}

export interface TopicCompletionRequest {
  topic_id: string
  user_id?: string // Made optional since backend will get it from auth
}

// CP (Concept Practice) Completion interfaces
export interface CpCompletion extends BaseCompletion {
  cp_id: string
  cp?: {
    id: string
    title: string
    description: string
    [key: string]: any
  }
}

export interface CpCompletionRequest {
  cp_id: string
  user_id?: string // Made optional since backend will get it from auth
}

// Objective Completion interfaces
export interface ObjectiveCompletion extends BaseCompletion {
  objective_item_id: string
  objective_item?: {
    id: string
    title: string
    description: string
    [key: string]: any
  }
}

export interface ObjectiveCompletionRequest {
  objective_item_id: string
  user_id?: string // Made optional since backend will get it from auth
}

// Outcome Completion interfaces
export interface OutcomeCompletion extends BaseCompletion {
  outcome_item_id: string
  outcome_item?: {
    id: string
    title: string
    description: string
    [key: string]: any
  }
}

export interface OutcomeCompletionRequest {
  outcome_item_id: string
  user_id?: string // Made optional since backend will get it from auth
}

// Response interfaces
export interface CompletionResponse {
  success: boolean
  message: string
  data: any
}

export interface DeleteCompletionResponse {
  success: boolean
  message: string
}

// API endpoints using constants
const ENDPOINTS = {
  // Topic completions
  TOPIC_COMPLETIONS: API_ENDPOINTS.TOPIC_COMPLETIONS,
  
  // CP completions
  CP_COMPLETIONS: API_ENDPOINTS.CP_COMPLETIONS,
  
  // Objective completions
  OBJECTIVE_COMPLETIONS: API_ENDPOINTS.OBJECTIVE_COMPLETIONS,
  
  // Outcome completions
  OUTCOME_COMPLETIONS: API_ENDPOINTS.OUTCOME_COMPLETIONS,
}

// SWR keys
export const TOPIC_COMPLETIONS_SWR_KEY = 'topic_completions'
export const CP_COMPLETIONS_SWR_KEY = 'cp_completions'
export const OBJECTIVE_COMPLETIONS_SWR_KEY = 'objective_completions'
export const OUTCOME_COMPLETIONS_SWR_KEY = 'outcome_completions'

// Helper function for DELETE requests with body
async function deleteWithBody<T>(url: string, data: any): Promise<T> {
  const response = await apiClient({
    method: 'DELETE',
    url,
    data
  })
  return response.data
}

// Topic Completions API functions
/**
 * Get all topic completions for the authenticated user
 */
export const getUserTopicCompletions = async (): Promise<TopicCompletion[]> => {
  try {
    console.log("Calling getUserTopicCompletions API");
    const response = await apiRequest.get<any>(
      ENDPOINTS.TOPIC_COMPLETIONS
    );
    console.log("Topic completions API response:", response);
    
    // Check if we have data in the expected format
    if (Array.isArray(response)) {
      console.log("Response is an array, returning directly");
      return response || [];
    } else if (Array.isArray(response.data)) {
      console.log("Response data is an array, returning directly");
      return response.data || [];
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log("Response has nested data array, returning data.data");
      return response.data.data || [];
    } else {
      console.error("Unexpected response format:", response);
      return [];
    }
  } catch (error) {
    console.error("Error in getUserTopicCompletions:", error);
    throw error;
  }
}

/**
 * Mark a topic as completed
 * @param data - Topic completion request data
 */
export const markTopicCompleted = async (
  data: TopicCompletionRequest
): Promise<TopicCompletion> => {
  const response = await apiRequest.post<{ data: TopicCompletion }>(
    ENDPOINTS.TOPIC_COMPLETIONS,
    data
  )
  return response.data
}

/**
 * Delete a topic completion
 * @param data - Topic completion request data
 */
export const deleteTopicCompletion = async (
  data: TopicCompletionRequest
): Promise<DeleteCompletionResponse> => {
  return await deleteWithBody<DeleteCompletionResponse>(
    ENDPOINTS.TOPIC_COMPLETIONS,
    data
  )
}

// CP Completions API functions
/**
 * Get all CP completions for the authenticated user
 */
export const getUserCpCompletions = async (): Promise<CpCompletion[]> => {
  try {
    console.log("Calling getUserCpCompletions API");
    const response = await apiRequest.get<any>(
      ENDPOINTS.CP_COMPLETIONS
    );
    console.log("CP completions API response:", response);
    
    // Check if we have data in the expected format
    if (Array.isArray(response)) {
      console.log("Response is an array, returning directly");
      return response || [];
    } else if (Array.isArray(response.data)) {
      console.log("Response data is an array, returning directly");
      return response.data || [];
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log("Response has nested data array, returning data.data");
      return response.data.data || [];
    } else {
      console.error("Unexpected response format:", response);
      return [];
    }
  } catch (error) {
    console.error("Error in getUserCpCompletions:", error);
    throw error;
  }
}

/**
 * Mark a concept practice (CP) as completed
 * @param data - CP completion request data
 */
export const markCpCompleted = async (
  data: CpCompletionRequest
): Promise<CpCompletion> => {
  const response = await apiRequest.post<{ data: CpCompletion }>(
    ENDPOINTS.CP_COMPLETIONS,
    data
  )
  return response.data
}

/**
 * Delete a concept practice (CP) completion
 * @param data - CP completion request data
 */
export const deleteCpCompletion = async (
  data: CpCompletionRequest
): Promise<DeleteCompletionResponse> => {
  return await deleteWithBody<DeleteCompletionResponse>(
    ENDPOINTS.CP_COMPLETIONS,
    data
  )
}

// Objective Completions API functions
/**
 * Get all objective completions for the authenticated user
 */
export const getUserObjectiveCompletions = async (): Promise<ObjectiveCompletion[]> => {
  try {
    console.log("Calling getUserObjectiveCompletions API");
    const response = await apiRequest.get<any>(
      ENDPOINTS.OBJECTIVE_COMPLETIONS
    );
    console.log("Objective completions API response:", response);
    
    // Check if we have data in the expected format
    if (Array.isArray(response)) {
      console.log("Response is an array, returning directly");
      return response || [];
    } else if (Array.isArray(response.data)) {
      console.log("Response data is an array, returning directly");
      return response.data || [];
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log("Response has nested data array, returning data.data");
      return response.data.data || [];
    } else {
      console.error("Unexpected response format:", response);
      return [];
    }
  } catch (error) {
    console.error("Error in getUserObjectiveCompletions:", error);
    throw error;
  }
}

/**
 * Mark an objective as completed
 * @param data - Objective completion request data
 */
export const markObjectiveCompleted = async (
  data: ObjectiveCompletionRequest
): Promise<ObjectiveCompletion> => {
  const response = await apiRequest.post<{ data: ObjectiveCompletion }>(
    ENDPOINTS.OBJECTIVE_COMPLETIONS,
    data
  )
  return response.data
}

/**
 * Delete an objective completion
 * @param data - Objective completion request data
 */
export const deleteObjectiveCompletion = async (
  data: ObjectiveCompletionRequest
): Promise<DeleteCompletionResponse> => {
  return await deleteWithBody<DeleteCompletionResponse>(
    ENDPOINTS.OBJECTIVE_COMPLETIONS,
    data
  )
}

// Outcome Completions API functions
/**
 * Get all outcome completions for the authenticated user
 */
export const getUserOutcomeCompletions = async (): Promise<OutcomeCompletion[]> => {
  try {
    console.log("Calling getUserOutcomeCompletions API");
    const response = await apiRequest.get<any>(
      ENDPOINTS.OUTCOME_COMPLETIONS
    );
    console.log("Outcome completions API response:", response);
    
    // Check if we have data in the expected format
    if (Array.isArray(response)) {
      console.log("Response is an array, returning directly");
      return response || [];
    } else if (Array.isArray(response.data)) {
      console.log("Response data is an array, returning directly");
      return response.data || [];
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log("Response has nested data array, returning data.data");
      return response.data.data || [];
    } else {
      console.error("Unexpected response format:", response);
      return [];
    }
  } catch (error) {
    console.error("Error in getUserOutcomeCompletions:", error);
    throw error;
  }
}

/**
 * Mark an outcome as completed
 * @param data - Outcome completion request data
 */
export const markOutcomeCompleted = async (
  data: OutcomeCompletionRequest
): Promise<OutcomeCompletion> => {
  const response = await apiRequest.post<{ data: OutcomeCompletion }>(
    ENDPOINTS.OUTCOME_COMPLETIONS,
    data
  )
  return response.data
}

/**
 * Delete an outcome completion
 * @param data - Outcome completion request data
 */
export const deleteOutcomeCompletion = async (
  data: OutcomeCompletionRequest
): Promise<DeleteCompletionResponse> => {
  return await deleteWithBody<DeleteCompletionResponse>(
    ENDPOINTS.OUTCOME_COMPLETIONS,
    data
  )
}

// Helper functions for checking completion status
export const isTopicCompleted = (topicId: string, completions: TopicCompletion[]): boolean => {
  return completions.some(completion => completion.topic_id === topicId)
}

export const isCpCompleted = (cpId: string, completions: CpCompletion[]): boolean => {
  return completions.some(completion => completion.cp_id === cpId)
}

export const isObjectiveCompleted = (objectiveId: string, completions: ObjectiveCompletion[]): boolean => {
  return completions.some(completion => completion.objective_item_id === objectiveId)
}

export const isOutcomeCompleted = (outcomeId: string, completions: OutcomeCompletion[]): boolean => {
  return completions.some(completion => completion.outcome_item_id === outcomeId)
}

// Helper function for calculating completion percentage
export const calculateCompletionPercentage = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
} 