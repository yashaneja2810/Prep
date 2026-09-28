import { apiRequest } from '@/helpers/request'
import { 
  LearnerProfile, 
  AddLearnerResponse, 
  BatchAddResponse, 
  CompletenessStatus,
  UpdateLearnerProfileData 
} from '@/lib/types/learner'
import { API_ENDPOINTS } from '@/helpers/string_const'

// API endpoints using constants
const ENDPOINTS = {
  LEARNERS: API_ENDPOINTS.LEARNERS,
  LEARNERS_BATCH: API_ENDPOINTS.LEARNERS_BATCH,
  LEARNER_PROFILE: `${API_ENDPOINTS.LEARNER_PROFILE}/me`,
  LEARNER_COMPLETENESS: API_ENDPOINTS.LEARNER_COMPLETENESS,
  LEARNER_BY_ID: (userId: string) => `${API_ENDPOINTS.LEARNER_PROFILE}/${userId}`,
  LEARNER_DEACTIVATE: (userId: string) => `${API_ENDPOINTS.LEARNERS}/${userId}/deactivate`,
  LEARNER_ACTIVATE: (userId: string) => `${API_ENDPOINTS.LEARNERS}/${userId}/activate`,
  LEARNER_DELETE: (userId: string) => `${API_ENDPOINTS.LEARNERS}/${userId}`,
}

// Types for API requests
export interface CreateLearnerData {
  email: string
}

export interface BatchCreateLearnerData {
  emails: string[]
}

// ============= ADMIN FUNCTIONS =============

// Get all learner profiles (Admin only)
export const getAllLearnerProfiles = async (): Promise<LearnerProfile[]> => {
  const learners = await apiRequest.get<any[]>(ENDPOINTS.LEARNERS)
  
  // Transform the response to include legacy compatibility fields
  return transformLearnerProfilesResponse(learners)
}

// Get learner profile by ID (Admin only)
export const getLearnerProfileById = async (userId: string): Promise<LearnerProfile> => {
  const learner = await apiRequest.get<any>(
    ENDPOINTS.LEARNER_BY_ID(userId)
  )
  
  // Transform the response to include legacy compatibility fields
  return transformLearnerProfileResponse(learner)
}

// Add single learner by email (Admin only)
export const addLearnerByEmail = async (email: string): Promise<AddLearnerResponse['data']> => {
  const requestData: CreateLearnerData = { email }
  
  return await apiRequest.post<AddLearnerResponse['data']>(
    ENDPOINTS.LEARNERS,
    requestData
  )
}

// Add multiple learners by email array (Admin only)
export const addLearnersBatch = async (emails: string[]): Promise<BatchAddResponse['data']> => {
  const requestData: BatchCreateLearnerData = { emails }
  
  return await apiRequest.post<BatchAddResponse['data']>(
    ENDPOINTS.LEARNERS_BATCH,
    requestData
  )
}

// Deactivate learner (Admin only)
export const deactivateLearner = async (userId: string): Promise<void> => {
  return await apiRequest.put<void>(
    ENDPOINTS.LEARNER_DEACTIVATE(userId)
  )
}

// Reactivate learner (Admin only)
export const reactivateLearner = async (userId: string): Promise<void> => {
  return await apiRequest.put<void>(
    ENDPOINTS.LEARNER_ACTIVATE(userId)
  )
}

// Permanently delete learner (Admin only, dangerous)
export const permanentlyDeleteLearner = async (userId: string): Promise<void> => {
  return await apiRequest.delete<void>(
    ENDPOINTS.LEARNER_DELETE(userId)
  )
}

// ============= LEARNER SELF-SERVICE FUNCTIONS =============

// Get own profile (Learner only)
export const getOwnProfile = async (): Promise<LearnerProfile> => {
  const learner = await apiRequest.get<any>(ENDPOINTS.LEARNER_PROFILE)
  
  // Transform the response to include legacy compatibility fields
  return transformLearnerProfileResponse(learner)
}

// Update own profile (Learner only)
export const updateOwnProfile = async (data: UpdateLearnerProfileData): Promise<LearnerProfile> => {
  const learner = await apiRequest.put<any>(
    ENDPOINTS.LEARNER_PROFILE,
    data
  )
  
  // Transform the response to include legacy compatibility fields
  return transformLearnerProfileResponse(learner)
}

// Check profile completeness (Learner only)
export const checkProfileCompleteness = async (): Promise<CompletenessStatus> => {
  return await apiRequest.get<CompletenessStatus>(
    ENDPOINTS.LEARNER_COMPLETENESS
  )
}

// ============= VALIDATION HELPERS =============

// Validate email address
export const validateEmailAddress = (email: string): { isValid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true }
}

// Validate email list for batch operations
export const validateEmailList = (emails: string[]): { 
  isValid: boolean; 
  validEmails: string[]; 
  invalidEmails: string[]; 
  errors: string[] 
} => {
  const validEmails: string[] = []
  const invalidEmails: string[] = []
  const errors: string[] = []
  
  if (!emails || emails.length === 0) {
    return { 
      isValid: false, 
      validEmails, 
      invalidEmails, 
      errors: ['At least one email is required'] 
    }
  }
  
  emails.forEach(email => {
    const { isValid, error } = validateEmailAddress(email.trim())
    if (isValid) {
      validEmails.push(email.trim())
    } else {
      invalidEmails.push(email.trim())
      if (error) {
        errors.push(`${email.trim()}: ${error}`)
      }
    }
  })
  
  return {
    isValid: invalidEmails.length === 0,
    validEmails,
    invalidEmails,
    errors
  }
}

// Parse emails from text input (for batch operations)
export const parseEmailsFromText = (text: string): string[] => {
  if (!text || !text.trim()) return []
  
  // Split by common delimiters: newlines, commas, semicolons, spaces
  return text
    .split(/[\n,;]\s*/)
    .map(email => email.trim())
    .filter(email => email.length > 0)
}

// ============= API RESPONSE TRANSFORMATION =============

// Transform API response to include legacy compatibility fields
export const transformLearnerProfileResponse = (learner: any): LearnerProfile => {
  return {
    ...learner,
    // Add legacy compatibility fields
    user: learner.users || learner.user,
    student_details: learner.learner_student_details || learner.student_details,
    professional_details: learner.learner_professional_details || learner.professional_details,
    // Derive status from user.is_active if status is not provided
    status: learner.status || (learner.users?.is_active ? 'active' : 'dropout'),
  }
}

// Transform API response array
export const transformLearnerProfilesResponse = (learners: any[]): LearnerProfile[] => {
  return learners.map(transformLearnerProfileResponse)
}

// ============= HELPER FUNCTIONS =============

// Format learner status for display
export const formatLearnerStatus = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'dropout':
      return 'Dropout'
    case 'graduate':
      return 'Graduate'
    default:
      return status
  }
}

// Format learner type for display
export const formatLearnerType = (type: string): string => {
  switch (type) {
    case 'student':
      return 'Student'
    case 'professional':
      return 'Professional'
    default:
      return type
  }
}

// Format completeness percentage
export const formatCompletenessPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`
}

// Check if learner profile is complete
export const isProfileComplete = (completenessStatus?: CompletenessStatus): boolean => {
  return completenessStatus?.is_complete ?? false
}

// Get missing fields from completeness status
export const getMissingFields = (completenessStatus?: CompletenessStatus): string[] => {
  return completenessStatus?.missing_fields ?? []
}

// Generate learner display name
export const getLearnerDisplayName = (learner: LearnerProfile): string => {
  // Try new API field first, then fallback to legacy field
  const user = learner.users || learner.user
  if (!user) return 'Name not available'
  
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return fullName || user.email || 'Name not available'
}

// Get learner contact info
export const getLearnerContactInfo = (learner: LearnerProfile) => {
  // Try new API field first, then fallback to legacy field
  const user = learner.users || learner.user
  return {
    email: user?.email || 'Email not available',
    phone: user?.phone || 'Phone not available',
    name: getLearnerDisplayName(learner)
  }
}

// Check if learner is active
export const isLearnerActive = (learner: LearnerProfile): boolean => {
  return learner.status === 'active'
}

// Filter learners by status
export const filterLearnersByStatus = (learners: LearnerProfile[], status: string): LearnerProfile[] => {
  if (status === 'all') return learners
  return learners.filter(learner => learner.status === status)
}

// Filter learners by type
export const filterLearnersByType = (learners: LearnerProfile[], type: string): LearnerProfile[] => {
  if (type === 'all') return learners
  return learners.filter(learner => learner.learner_type === type)
}

// Search learners by text
export const searchLearners = (learners: LearnerProfile[], searchTerm: string): LearnerProfile[] => {
  if (!searchTerm.trim()) return learners
  
  const term = searchTerm.toLowerCase()
  return learners.filter(learner => {
    // Try new API field first, then fallback to legacy field
    const user = learner.users || learner.user
    const studentDetails = learner.learner_student_details || learner.student_details
    const professionalDetails = learner.learner_professional_details || learner.professional_details
    
    const searchableText = [
      user?.first_name,
      user?.last_name,
      user?.email,
      learner.goals_text,
      studentDetails?.college_name,
      studentDetails?.degree_course,
      professionalDetails?.company_name,
      professionalDetails?.job_title
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchableText.includes(term)
  })
} 