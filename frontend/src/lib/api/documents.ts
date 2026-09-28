import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

export interface Document {
  id: string
  topic_id: string
  content: string
  created_at?: string
  updated_at?: string
}

export interface DocumentMetadata {
  title: string
  type: string
  content: string
}

// API endpoints using constants
const ENDPOINTS = {
  DOCUMENTS: API_ENDPOINTS.DOCUMENTS,
  DOCUMENT_BY_ID: (id: string) => `${API_ENDPOINTS.DOCUMENT_BY_ID}/${id}`,
  DOCUMENTS_BY_TOPIC: (topicId: string) => `${API_ENDPOINTS.DOCUMENTS_BY_TOPIC}/${topicId}/documents`
}

// Types for API requests
export interface CreateDocumentDto {
  topic_id: string
  content: string
}

export interface UpdateDocumentDto {
  topic_id?: string
  content?: string
}

// Create a new document
export const createDocument = async (data: CreateDocumentDto): Promise<Document> => {
  return await apiRequest.post<Document>(ENDPOINTS.DOCUMENTS, data)
}

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  return await apiRequest.get<Document[]>(ENDPOINTS.DOCUMENTS)
}

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document> => {
  return await apiRequest.get<Document>(ENDPOINTS.DOCUMENT_BY_ID(id))
}

// Get documents by topic ID
export const getDocumentsByTopicId = async (topicId: string): Promise<Document[]> => {
  return await apiRequest.get<Document[]>(ENDPOINTS.DOCUMENTS_BY_TOPIC(topicId))
}

// Update document
export const updateDocument = async (id: string, data: UpdateDocumentDto): Promise<Document> => {
  return await apiRequest.put<Document>(ENDPOINTS.DOCUMENT_BY_ID(id), data)
}

// Delete document
export const deleteDocument = async (id: string): Promise<void> => {
  return await apiRequest.delete<void>(ENDPOINTS.DOCUMENT_BY_ID(id))
}

// Parse document content to extract metadata
// If parsing fails, returns default metadata
export const parseDocumentContent = (content: string): DocumentMetadata => {
  try {
    const parsed = JSON.parse(content)
    if (typeof parsed === 'object' && parsed.title && parsed.type && parsed.content) {
      return parsed as DocumentMetadata
    }
  } catch (e) {
    // Parsing failed, treat the entire content as raw content
  }
  
  // Default metadata
  return {
    title: "Untitled Document",
    type: "text",
    content: content
  }
}

// Validation function for document
export const validateDocument = (documentData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Topic ID validation (required for create)
  if (!isUpdate && !documentData.topic_id) {
    errors.topic_id = 'Topic ID is required'
  }

  // Content validation (required for create)
  if (!isUpdate && !documentData.content) {
    errors.content = 'Content is required'
  } else if (documentData.content && documentData.content.length > 100000) {
    errors.content = 'Content is too large (max 100,000 characters)'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions for document data
export const isValidDocumentContent = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content)
    return typeof parsed === 'object' && !!parsed.title && !!parsed.type && !!parsed.content
  } catch (e) {
    return false
  }
}

// SWR keys for caching
export const DOCUMENTS_SWR_KEY = SWR_KEYS.DOCUMENTS
export const DOCUMENT_BY_ID_SWR_KEY = (id: string): string => `${SWR_KEYS.DOCUMENT_BY_ID}_${id}`
export const DOCUMENTS_BY_TOPIC_SWR_KEY = (topicId: string): string => `${SWR_KEYS.DOCUMENTS_BY_TOPIC}_${topicId}` 