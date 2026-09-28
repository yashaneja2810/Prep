import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS } from '@/helpers/string_const'

// Video interface based on the backend API documentation
export interface Video {
  id: string
  topic_id: string
  title: string
  url: string
  duration: number
  transcript: string
  summary: string
  timestamps: string
  created_at?: string
  updated_at?: string
}

// API endpoints using constants
const ENDPOINTS = {
  VIDEOS: API_ENDPOINTS.VIDEOS,
  VIDEO_BY_ID: (id: string) => `${API_ENDPOINTS.VIDEO_BY_ID}/${id}`,
  VIDEO_UPLOAD: API_ENDPOINTS.VIDEO_UPLOAD,
  VIDEOS_BY_TOPIC: (topicId: string) => `${API_ENDPOINTS.VIDEOS_BY_TOPIC}/${topicId}/videos`
}

// Types for API requests
export interface CreateVideoDto {
  topic_id: string
  title: string
  duration: number
  transcript: string
  summary: string
  timestamps: string
  file: File
}

export interface UpdateVideoDto {
  title?: string
  transcript?: string
  summary?: string
  timestamps?: string
}

// SWR keys for data fetching
export const VIDEOS_SWR_KEY = '/api/videos'
export const VIDEOS_BY_TOPIC_SWR_KEY = (topicId: string): string => `/api/topics/${topicId}/videos`
export const VIDEO_BY_ID_SWR_KEY = (id: string): string => `/api/videos/${id}`

// Get all videos - Admin, Super Admin, Trainer
export const getAllVideos = async (): Promise<Video[]> => {
  return await apiRequest.get<Video[]>(ENDPOINTS.VIDEOS)
}

// Get videos by topic ID - Admin, Super Admin, Trainer, Learner
export const getVideosByTopicId = async (topicId: string): Promise<Video[]> => {
  return await apiRequest.get<Video[]>(
    ENDPOINTS.VIDEOS_BY_TOPIC(topicId)
  )
}

// Get video by ID - Admin, Super Admin, Trainer, Learner
export const getVideoById = async (id: string): Promise<Video> => {
  return await apiRequest.get<Video>(
    ENDPOINTS.VIDEO_BY_ID(id)
  )
}

// Upload video - Admin, Super Admin, Trainer
export const createVideo = async (formData: FormData): Promise<Video> => {
  return await apiRequest.post<Video>(
    ENDPOINTS.VIDEO_UPLOAD,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

// Update video by ID - Admin, Super Admin, Trainer
export const updateVideoById = async (
  id: string,
  videoData: UpdateVideoDto
): Promise<Video> => {
  return await apiRequest.put<Video>(
    ENDPOINTS.VIDEO_BY_ID(id),
    videoData
  )
}

// Delete video by ID - Admin, Super Admin
export const deleteVideoById = async (id: string): Promise<void> => {
  await apiRequest.delete<void>(
    ENDPOINTS.VIDEO_BY_ID(id)
  )
}

// Validation function for video
export const validateVideo = (videoData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Topic ID validation (required for create)
  if (!isUpdate && !videoData.topic_id) {
    errors.topic_id = 'Topic ID is required'
  }

  // Title validation (required for create)
  if (!isUpdate && !videoData.title) {
    errors.title = 'Title is required'
  } else if (videoData.title && (videoData.title.length < 1 || videoData.title.length > 255)) {
    errors.title = 'Title must be between 1 and 255 characters'
  }

  // File validation (required for create)
  if (!isUpdate && !videoData.file) {
    errors.file = 'Video file is required'
  }

  return errors
}

// Format duration in minutes and seconds
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
} 