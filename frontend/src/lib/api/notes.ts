import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

// Note interface based on backend API
export interface Note {
  id: string
  topic_id: string
  content: string
  created_at?: string
  updated_at?: string
  images?: string[] // Array of image URLs
}

// API endpoints using constants
const ENDPOINTS = {
  NOTES: '/api/notes',
  NOTES_BY_TOPIC: (topicId: string) => `/api/topics/${topicId}/notes`,
  NOTE_BY_ID: (id: string) => `/api/notes/${id}`,
  NOTE_IMAGE_UPLOAD: '/api/notes/upload-image',
  TOPIC_NOTE_IMAGE_UPLOAD: (topicId: string) => `/api/topics/${topicId}/notes/upload-image`,
  NOTE_IMAGE_DELETE: (fileName: string) => `/api/notes/images/${fileName}`
}

// Types for API requests
export interface CreateNoteDto {
  topic_id: string
  content: string
  images?: string[]
}

export interface UpdateNoteDto {
  topic_id?: string
  content?: string
  images?: string[]
}

// Create a new note
export const createNote = async (data: CreateNoteDto): Promise<Note> => {
  return await apiRequest.post<Note>(ENDPOINTS.NOTES, data)
}

// Get all notes
export const getAllNotes = async (): Promise<Note[]> => {
  return await apiRequest.get<Note[]>(ENDPOINTS.NOTES)
}

// Get note by ID
export const getNoteById = async (id: string): Promise<Note> => {
  return await apiRequest.get<Note>(ENDPOINTS.NOTE_BY_ID(id))
}

// Get notes by topic ID
export const getNotesByTopicId = async (topicId: string): Promise<Note[]> => {
  return await apiRequest.get<Note[]>(ENDPOINTS.NOTES_BY_TOPIC(topicId))
}

// Update note
export const updateNote = async (id: string, data: UpdateNoteDto): Promise<Note> => {
  return await apiRequest.put<Note>(ENDPOINTS.NOTE_BY_ID(id), data)
}

// Delete note
export const deleteNote = async (id: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.NOTE_BY_ID(id))
}

// Upload note image
export interface UploadImageResponse {
  url: string
  fileName: string
}

export const uploadNoteImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  return await apiRequest.post<UploadImageResponse>(ENDPOINTS.NOTE_IMAGE_UPLOAD, formData)
}

// Upload topic note image
export const uploadTopicNoteImage = async (topicId: string, file: File): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  return await apiRequest.post<UploadImageResponse>(ENDPOINTS.TOPIC_NOTE_IMAGE_UPLOAD(topicId), formData)
}

// Delete note image
export const deleteNoteImage = async (fileName: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.NOTE_IMAGE_DELETE(fileName))
}

// Validation function for note
export const validateNote = (noteData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Topic ID validation (required for create)
  if (!isUpdate && !noteData.topic_id) {
    errors.topic_id = 'Topic ID is required'
  }

  // Content validation
  if (!isUpdate && !noteData.content) {
    errors.content = 'Content is required'
  } else if (noteData.content && noteData.content.length > 50000) {
    errors.content = 'Content is too large (max 50,000 characters)'
  }

  // Images validation
  if (noteData.images && !Array.isArray(noteData.images)) {
    errors.images = 'Images must be an array'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

export const getImageFileSize = (file: File): number => {
  return file.size / (1024 * 1024) // Convert to MB
}

// SWR keys for caching
export const NOTES_SWR_KEY = 'notes'
export const NOTE_BY_ID_SWR_KEY = (id: string): string => `note_${id}`
export const NOTES_BY_TOPIC_SWR_KEY = (topicId: string): string => `topic_${topicId}_notes` 