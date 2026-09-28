import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS } from '@/helpers/string_const'

// Define the main submission interface
export interface ApSubmission {
  id: string
  user_id: string
  ap_id: string
  submission_code: string
  is_correct: boolean
  attempt_number: number
  submitted_at?: string
  // Include AP details when joined in the response
  aps?: {
    id: string
    title: string
    description: string
    expected_output: string
    topic_id: string
    created_at: string
    updated_at: string
  }
}

// API endpoints using constants
const ENDPOINTS = {
  SUBMISSIONS: API_ENDPOINTS.SUBMISSIONS,
  SUBMISSION_BY_ID: (id: string) => `${API_ENDPOINTS.SUBMISSION_BY_ID}/${id}`,
  USER_AP_SUBMISSIONS: `${API_ENDPOINTS.SUBMISSIONS}/ap`
}

// Types for API requests
export interface CreateApSubmissionDto {
  ap_id: string
  submission_code: string
}

// SWR keys for caching
export const SUBMISSIONS_SWR_KEY = '/api/submissions'
export const USER_AP_SUBMISSIONS_SWR_KEY = '/api/submissions/ap'

// Submit an AP solution
export const submitAp = async (data: CreateApSubmissionDto): Promise<{ submission: ApSubmission, isCorrect: boolean }> => {
  return await apiRequest.post<{ submission: ApSubmission, isCorrect: boolean }>(ENDPOINTS.SUBMISSIONS + '/ap', data)
}

// Get all AP submissions for the authenticated user
export const getUserApSubmissions = async (): Promise<ApSubmission[]> => {
  return await apiRequest.get<ApSubmission[]>(ENDPOINTS.USER_AP_SUBMISSIONS)
}

// Validate submission code
export const validateSubmissionCode = (code: string): Record<string, string> | null => {
  const errors: Record<string, string> = {}

  if (!code || code.trim() === '') {
    errors.submission_code = 'Code is required'
  } else if (code.length > 50000) {
    errors.submission_code = 'Code is too large (max 50,000 characters)'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper function to format submission date
export const formatSubmissionDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown date'
  
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to get submission status text
export const getSubmissionStatusText = (isCorrect: boolean): string => {
  return isCorrect ? 'Correct' : 'Incorrect'
}

// Helper function to get submission status color
export const getSubmissionStatusColor = (isCorrect: boolean): string => {
  return isCorrect ? 'green' : 'red'
}