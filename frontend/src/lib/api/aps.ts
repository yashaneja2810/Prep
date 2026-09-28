import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS } from '@/helpers/string_const'

// Application Problem (AP) interface based on the backend API documentation
export interface AP {
  id: string
  topic_id: string
  title: string
  difficulty?: string
  input?: string
  expected_output?: string
  instruction: string
  objective: string
  created_at?: string
  updated_at?: string
}

// API endpoints using constants
const ENDPOINTS = {
  APS: API_ENDPOINTS.APS,
  APS_BY_TOPIC: (topicId: string) => `${API_ENDPOINTS.APS_BY_TOPIC}/${topicId}`,
  APS_BATCH: API_ENDPOINTS.APS_BATCH,
  AP_BY_ID: (id: string) => `${API_ENDPOINTS.AP_BY_ID}/${id}`,
}

// Types for API requests
export interface CreateAPDto {
  topic_id: string
  title: string
  difficulty?: string
  input?: string
  expected_output?: string
  instruction: string
  objective: string
}

export interface CreateAPsBatchDto {
  topic_id: string
  aps: {
    title: string
    difficulty?: string
    input?: string
    expected_output?: string
    instructions: string[]
    objectives: string[]
  }[]
}

export interface UpdateAPDto {
  title?: string
  difficulty?: string
  input?: string
  expected_output?: string
  instruction?: string
  objective?: string
}

// SWR keys for data fetching
export const APS_SWR_KEY = '/api/aps'
export const APS_BY_TOPIC_SWR_KEY = (topicId: string): string => `/api/aps/topics/${topicId}`
export const AP_BY_ID_SWR_KEY = (id: string): string => `/api/aps/${id}`

// Get all application problems - Admin, Super Admin, Trainer
export const getAllAPs = async (): Promise<AP[]> => {
  return await apiRequest.get<AP[]>(ENDPOINTS.APS)
}

// Get application problems by topic ID - Admin, Super Admin, Trainer, Learner
export const getAPsByTopicId = async (topicId: string): Promise<AP[]> => {
  return await apiRequest.get<AP[]>(
    ENDPOINTS.APS_BY_TOPIC(topicId)
  )
}

// Get application problem by ID - Admin, Super Admin, Trainer, Learner
export const getAPById = async (id: string): Promise<AP> => {
  return await apiRequest.get<AP>(
    ENDPOINTS.AP_BY_ID(id)
  )
}

// Create application problem - Admin, Super Admin, Trainer
export const createAP = async (
  apData: CreateAPDto
): Promise<AP> => {
  return await apiRequest.post<AP>(
    ENDPOINTS.APS,
    apData
  )
}

// Create application problems in batch - Admin, Super Admin, Trainer
export const createAPsBatch = async (
  batchData: CreateAPsBatchDto
): Promise<AP[]> => {
  return await apiRequest.post<AP[]>(
    ENDPOINTS.APS_BATCH,
    batchData
  )
}

// Update application problem by ID - Admin, Super Admin, Trainer
export const updateAPById = async (
  id: string,
  apData: UpdateAPDto
): Promise<AP> => {
  return await apiRequest.patch<AP>(
    ENDPOINTS.AP_BY_ID(id),
    apData
  )
}

// Delete application problem by ID - Admin, Super Admin
export const deleteAPById = async (id: string): Promise<void> => {
  await apiRequest.delete<void>(
    ENDPOINTS.AP_BY_ID(id)
  )
}

// Validation function for application problem
export const validateAP = (apData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Topic ID validation (required for create)
  if (!isUpdate && !apData.topic_id) {
    errors.topic_id = 'Topic ID is required'
  }

  // Title validation (required for create)
  if (!isUpdate && !apData.title) {
    errors.title = 'Title is required'
  } else if (apData.title && (apData.title.length < 1 || apData.title.length > 255)) {
    errors.title = 'Title must be between 1 and 255 characters'
  }

  // Instruction validation (required for create)
  if (!isUpdate && !apData.instruction) {
    errors.instruction = 'Instruction is required'
  }

  // Objective validation (required for create)
  if (!isUpdate && !apData.objective) {
    errors.objective = 'Objective is required'
  }

  return errors
}

// Format difficulty level for display
export const formatDifficulty = (difficulty: string | undefined): string => {
  if (!difficulty) return 'Not specified'
  
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
} 