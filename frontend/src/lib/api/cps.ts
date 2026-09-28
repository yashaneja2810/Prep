import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS } from '@/helpers/string_const'

// Concept Practice (CP) interface based on the backend API documentation
export interface CP {
  id: string
  topic_id: string
  title: string
  difficulty?: string
  code: string
  output: string
  explanation: string
  created_at?: string
  updated_at?: string
}

// API endpoints using constants
const ENDPOINTS = {
  CPS: API_ENDPOINTS.CPS,
  CPS_BY_TOPIC: (topicId: string) => `${API_ENDPOINTS.CPS_BY_TOPIC}/${topicId}`,
  CP_BY_ID: (id: string) => `${API_ENDPOINTS.CP_BY_ID}/${id}`,
  CP_SINGLE: API_ENDPOINTS.CP_SINGLE
}

// Types for API requests
export interface CreateCPDto {
  topic_id: string
  title: string
  difficulty?: string
  code: string
  output: string
  explanation: string
}

export interface CreateCPsBatchDto {
  topic_id: string
  cps: {
    title: string
    difficulty?: string
    code: string
    output: string
    explanation: string
  }[]
}

export interface UpdateCPDto {
  title?: string
  difficulty?: string
  code?: string
  output?: string
  explanation?: string
}

// SWR keys for data fetching
export const CPS_SWR_KEY = '/api/cps'
export const CPS_BY_TOPIC_SWR_KEY = (topicId: string): string => `/api/cps/topics/${topicId}`
export const CP_BY_ID_SWR_KEY = (id: string): string => `/api/cps/${id}`

// Get all concept practices - Admin, Super Admin, Trainer
export const getAllCPs = async (): Promise<CP[]> => {
  return await apiRequest.get<CP[]>(ENDPOINTS.CPS)
}

// Get concept practices by topic ID - Admin, Super Admin, Trainer, Learner
export const getCPsByTopicId = async (topicId: string): Promise<CP[]> => {
  return await apiRequest.get<CP[]>(
    ENDPOINTS.CPS_BY_TOPIC(topicId)
  )
}

// Get concept practice by ID - Admin, Super Admin, Trainer, Learner
export const getCPById = async (id: string): Promise<CP> => {
  return await apiRequest.get<CP>(
    ENDPOINTS.CP_BY_ID(id)
  )
}

// Create concept practice - Admin, Super Admin, Trainer
export const createCP = async (
  cpData: CreateCPDto
): Promise<CP> => {
  // The backend expects { topic_id, cp } structure
  const topic_id = cpData.topic_id;
  
  // Remove topic_id from the CP data as it will be at the root level
  const { topic_id: _, ...cpFields } = cpData;
  
  return await apiRequest.post<CP>(
    ENDPOINTS.CP_SINGLE,
    {
      topic_id,
      cp: cpFields
    }
  )
}

// Create concept practices in batch - Admin, Super Admin, Trainer
export const createCPsBatch = async (
  batchData: CreateCPsBatchDto
): Promise<CP[]> => {
  return await apiRequest.post<CP[]>(
    ENDPOINTS.CPS,
    batchData
  )
}

// Update concept practice by ID - Admin, Super Admin, Trainer
export const updateCPById = async (
  id: string,
  cpData: UpdateCPDto
): Promise<CP> => {
  return await apiRequest.put<CP>(
    ENDPOINTS.CP_BY_ID(id),
    cpData
  )
}

// Delete concept practice by ID - Admin, Super Admin
export const deleteCPById = async (id: string): Promise<void> => {
  await apiRequest.delete<void>(
    ENDPOINTS.CP_BY_ID(id)
  )
}

// Validation function for concept practice
export const validateCP = (cpData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Topic ID validation (required for create)
  if (!isUpdate && !cpData.topic_id) {
    errors.topic_id = 'Topic ID is required'
  }

  // Title validation (required for create)
  if (!isUpdate && !cpData.title) {
    errors.title = 'Title is required'
  } else if (cpData.title && (cpData.title.length < 1 || cpData.title.length > 255)) {
    errors.title = 'Title must be between 1 and 255 characters'
  }

  // Code validation (required for create)
  if (!isUpdate && !cpData.code) {
    errors.code = 'Code is required'
  }

  // Output validation (required for create)
  if (!isUpdate && !cpData.output) {
    errors.output = 'Output is required'
  }

  // Explanation validation (required for create)
  if (!isUpdate && !cpData.explanation) {
    errors.explanation = 'Explanation is required'
  }

  return errors
}

// Format difficulty level for display
export const formatDifficulty = (difficulty: string | undefined): string => {
  if (!difficulty) return 'Not specified'
  
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
} 