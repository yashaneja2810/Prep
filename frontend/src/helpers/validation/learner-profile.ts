import { z } from 'zod'
import { 
  VALIDATION_MESSAGES, 
  LEARNER_FORM_LABELS,
  LEARNER_TYPE 
} from '@/helpers/string_const'

// Validation interfaces
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface LearnerProfileData {
  learner_type?: 'student' | 'professional'
  goals_text?: string
  student_details?: {
    college_name?: string
    degree_course?: string
    current_gpa?: number
    expected_grad_year?: number
    interest?: string
  }
  professional_details?: {
    company_name?: string
    job_title?: string
    years_experience?: number
    pipeline_dev_exp?: number
    portfolio_url?: string
  }
}

export type ValidationMode = 'create' | 'edit'

// Email validation function
export const validateEmail = (email?: string): string | null => {
  if (!email) {
    return 'Email is required'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return VALIDATION_MESSAGES.INVALID_EMAIL
  }
  
  return null
}

// URL validation function
export const validateUrl = (url?: string): string | null => {
  if (!url) return null // URLs are optional
  
  if (url.length > 255) {
    return VALIDATION_MESSAGES.URL_MAX_LENGTH
  }
  
  try {
    new URL(url)
    return null
  } catch {
    return VALIDATION_MESSAGES.INVALID_URL
  }
}

// Learner type validation
export const validateLearnerType = (learnerType?: string): string | null => {
  if (!learnerType) {
    return 'Learner type is required'
  }
  
  if (learnerType !== LEARNER_TYPE.STUDENT && learnerType !== LEARNER_TYPE.PROFESSIONAL) {
    return 'Invalid learner type'
  }
  
  return null
}

// Goals text validation
export const validateGoalsText = (goalsText?: string): string | null => {
  if (!goalsText || goalsText.trim() === '') {
    return 'Career goals are required'
  }
  
  if (goalsText.length > 1000) {
    return 'Career goals cannot exceed 1000 characters'
  }
  
  return null
}

// Student details validation
export const validateStudentDetails = (details?: LearnerProfileData['student_details']): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!details) {
    errors.student_details = 'Student details are required for student learners'
    return errors
  }
  
  if (!details.college_name || details.college_name.trim() === '') {
    errors.college_name = 'College name is required'
  }
  
  if (!details.degree_course || details.degree_course.trim() === '') {
    errors.degree_course = 'Degree course is required'
  }
  
  if (details.current_gpa !== undefined && details.current_gpa !== null) {
    if (details.current_gpa < 0 || details.current_gpa > 4.0) {
      errors.current_gpa = 'GPA must be between 0 and 4.0'
    }
  }
  
  if (details.expected_grad_year !== undefined && details.expected_grad_year !== null) {
    const currentYear = new Date().getFullYear()
    if (details.expected_grad_year < currentYear || details.expected_grad_year > currentYear + 10) {
      errors.expected_grad_year = `Expected graduation year must be between ${currentYear} and ${currentYear + 10}`
    }
  }
  
  return errors
}

// Professional details validation
export const validateProfessionalDetails = (details?: LearnerProfileData['professional_details']): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!details) {
    errors.professional_details = 'Professional details are required for professional learners'
    return errors
  }
  
  if (!details.company_name || details.company_name.trim() === '') {
    errors.company_name = 'Company name is required'
  }
  
  if (!details.job_title || details.job_title.trim() === '') {
    errors.job_title = 'Job title is required'
  }
  
  if (details.years_experience !== undefined && details.years_experience !== null) {
    if (details.years_experience < 0 || details.years_experience > 50) {
      errors.years_experience = 'Years of experience must be between 0 and 50'
    }
  }
  
  if (details.pipeline_dev_exp !== undefined && details.pipeline_dev_exp !== null) {
    if (details.pipeline_dev_exp < 0 || details.pipeline_dev_exp > 20) {
      errors.pipeline_dev_exp = 'Pipeline development experience must be between 0 and 20'
    }
  }
  
  if (details.portfolio_url) {
    const urlError = validateUrl(details.portfolio_url)
    if (urlError) {
      errors.portfolio_url = 'Portfolio URL must be a valid URL'
    }
  }
  
  return errors
}

// Complete form validation for create mode
export const validateLearnerProfileCreate = (data: LearnerProfileData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // Learner type is required
  const learnerTypeError = validateLearnerType(data.learner_type)
  if (learnerTypeError) {
    errors.learner_type = learnerTypeError
  }
  
  // Goals text is required
  const goalsError = validateGoalsText(data.goals_text)
  if (goalsError) {
    errors.goals_text = goalsError
  }
  
  // Conditional validation based on learner type
  if (data.learner_type === LEARNER_TYPE.STUDENT) {
    const studentErrors = validateStudentDetails(data.student_details)
    Object.assign(errors, studentErrors)
  }
  
  if (data.learner_type === LEARNER_TYPE.PROFESSIONAL) {
    const professionalErrors = validateProfessionalDetails(data.professional_details)
    Object.assign(errors, professionalErrors)
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Complete form validation for edit mode
export const validateLearnerProfileEdit = (data: LearnerProfileData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // For edit mode, only validate what's being updated
  if (data.learner_type) {
    const learnerTypeError = validateLearnerType(data.learner_type)
    if (learnerTypeError) {
      errors.learner_type = learnerTypeError
    }
  }
  
  if (data.goals_text !== undefined) {
    const goalsError = validateGoalsText(data.goals_text)
    if (goalsError) {
      errors.goals_text = goalsError
    }
  }
  
  // Conditional validation based on learner type
  if (data.learner_type === LEARNER_TYPE.STUDENT && data.student_details) {
    const studentErrors = validateStudentDetails(data.student_details)
    Object.assign(errors, studentErrors)
  }
  
  if (data.learner_type === LEARNER_TYPE.PROFESSIONAL && data.professional_details) {
    const professionalErrors = validateProfessionalDetails(data.professional_details)
    Object.assign(errors, professionalErrors)
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Main validation function
export const validateLearnerProfile = (
  data: LearnerProfileData, 
  mode: ValidationMode = 'create'
): ValidationResult => {
  if (mode === 'create') {
    return validateLearnerProfileCreate(data)
  } else {
    return validateLearnerProfileEdit(data)
  }
}

// Zod schemas for form validation
export const studentDetailsSchema = z.object({
  college_name: z.string().min(1, 'College name is required'),
  degree_course: z.string().min(1, 'Degree course is required'),
  current_gpa: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().min(0).max(4.0).optional()
  ),
  expected_grad_year: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().min(2024).max(2034).optional()
  ),
  interest: z.string().optional()
})

export const professionalDetailsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  years_experience: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().min(0).max(50).optional()
  ),
  pipeline_dev_exp: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().min(0).max(20).optional()
  ),
  portfolio_url: z.string().url('Portfolio URL must be a valid URL').optional().or(z.literal(''))
})

export const learnerProfileSchema = z.object({
  learner_type: z.enum(['student', 'professional']),
  goals_text: z.string().min(1, 'Career goals are required').max(1000, 'Career goals cannot exceed 1000 characters'),
  student_details: studentDetailsSchema.optional(),
  professional_details: professionalDetailsSchema.optional()
}).refine((data) => {
  if (data.learner_type === 'student') {
    return !!data.student_details
  }
  if (data.learner_type === 'professional') {
    return !!data.professional_details
  }
  return true
}, {
  message: 'Details must match learner type',
  path: ['learner_type']
})

// Type exports for form data
export type LearnerProfileFormData = z.infer<typeof learnerProfileSchema>
export type StudentDetailsFormData = z.infer<typeof studentDetailsSchema>
export type ProfessionalDetailsFormData = z.infer<typeof professionalDetailsSchema> 