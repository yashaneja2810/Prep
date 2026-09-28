import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

// PPT interface based on backend API
export interface PPT {
  id: string
  topic_id: string
  title: string
  description?: string
  file_url: string
  file_name: string
  file_size: number
  created_at?: string
  updated_at?: string
}

// API endpoints using constants
const ENDPOINTS = {
  PPTS: API_ENDPOINTS.PPT_BY_ID, // /api/ppt
  PPT_BY_TOPIC: (topicId: string) => `${API_ENDPOINTS.PPT_BY_TOPIC}/${topicId}/ppt`, // /api/topics/:topicId/ppt
  PPT_BY_ID: (id: string) => `${API_ENDPOINTS.PPT_BY_ID}/${id}`, // /api/ppt/:id
  PPT_UPLOAD: API_ENDPOINTS.PPT_UPLOAD, // /api/ppt/upload
}

// Types for API requests
export interface CreatePPTDto {
  topic_id: string
  title: string
  description?: string
}

export interface UpdatePPTDto {
  topic_id?: string
  title?: string
  description?: string
}

// Create a new PPT
export const createPPT = async (data: CreatePPTDto): Promise<PPT> => {
  return await apiRequest.post<PPT>(ENDPOINTS.PPTS, data)
}

// Get all PPTs
export const getAllPPTs = async (): Promise<PPT[]> => {
  return await apiRequest.get<PPT[]>(ENDPOINTS.PPTS)
}

// Get PPT by ID
export const getPPTById = async (id: string): Promise<PPT> => {
  return await apiRequest.get<PPT>(ENDPOINTS.PPT_BY_ID(id))
}

// Get PPTs by topic ID
export const getPPTsByTopicId = async (topicId: string): Promise<PPT[]> => {
  return await apiRequest.get<PPT[]>(ENDPOINTS.PPT_BY_TOPIC(topicId))
}

// Update PPT
export const updatePPT = async (id: string, data: UpdatePPTDto): Promise<PPT> => {
  return await apiRequest.put<PPT>(ENDPOINTS.PPT_BY_ID(id), data)
}

// Delete PPT
export const deletePPT = async (id: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.PPT_BY_ID(id))
}

// Upload PPT file
export interface UploadPPTResponse {
  url: string
  fileName: string
}

export const uploadPPT = async (file: File): Promise<UploadPPTResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  return await apiRequest.post<UploadPPTResponse>(ENDPOINTS.PPT_UPLOAD, formData)
}

// Upload topic PPT file with metadata
export const uploadTopicPPT = async (topicId: string, file: File, title: string, description?: string): Promise<PPT> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('topic_id', topicId)
  formData.append('title', title)
  if (description) {
    formData.append('description', description)
  }
  return await apiRequest.post<PPT>(ENDPOINTS.PPT_UPLOAD, formData)
}

// Validation function for PPT
export const validatePPT = (pptData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Topic ID validation (required for create)
  if (!isUpdate && !pptData.topic_id) {
    errors.topic_id = 'Topic ID is required'
  }

  // Title validation
  if (!isUpdate && !pptData.title) {
    errors.title = 'Title is required'
  } else if (pptData.title && pptData.title.length > 255) {
    errors.title = 'Title is too long (max 255 characters)'
  }

  // Description validation
  if (pptData.description && pptData.description.length > 1000) {
    errors.description = 'Description is too long (max 1000 characters)'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions
export const isValidPPTFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/vnd.openxmlformats-officedocument.presentationml.template',
    // PDF format
    'application/pdf',
    // Word document formats
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-word.document.macroEnabled.12',
    'application/vnd.ms-word.template.macroEnabled.12'
  ]
  return validTypes.includes(file.type)
}

export const getPPTFileSize = (file: File): number => {
  return file.size / (1024 * 1024) // Convert to MB
}

// SWR keys for caching
export const PPTS_SWR_KEY = 'ppts'
export const PPT_BY_ID_SWR_KEY = (id: string): string => `ppt_${id}`
export const PPTS_BY_TOPIC_SWR_KEY = (topicId: string): string => `topic_${topicId}_ppts` 