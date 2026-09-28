import { 
  VALIDATION_MESSAGES, 
  TRAINER_FORM_FIELDS,
  SOCIAL_PLATFORMS 
} from '@/helpers/string_const'
import { z } from 'zod'

// Validation interfaces
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface TrainerProfileData {
  email?: string
  user_id?: string
  specialities?: number[]
  total_years_teaching?: number
  bio?: string
  expertise?: string
  linkedin_url?: string
  website?: string
  profile_image?: string
  social_links?: Record<string, string>
}

export type ValidationMode = 'create' | 'edit'

// Email validation function
export const validateEmail = (email?: string): string | null => {
  if (!email) {
    return VALIDATION_MESSAGES.EMAIL_REQUIRED
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return VALIDATION_MESSAGES.INVALID_EMAIL
  }
  
  return null
}

// URL validation function
export const validateUrl = (url?: string, fieldName?: string): string | null => {
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

// User ID validation (UUID format)
export const validateUserId = (userId?: string): string | null => {
  if (!userId) return null // Optional in some contexts
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    return 'User ID must be a valid UUID format'
  }
  
  return null
}

// Specialities validation
export const validateSpecialities = (specialities?: number[]): string | null => {
  if (!specialities || !Array.isArray(specialities) || specialities.length === 0) {
    return VALIDATION_MESSAGES.SPECIALITIES_REQUIRED
  }
  
  // Validate that all entries are positive integers
  const invalidSpecialities = specialities.filter(id => !Number.isInteger(id) || id <= 0)
  if (invalidSpecialities.length > 0) {
    return 'All speciality IDs must be valid positive numbers'
  }
  
  return null
}

// Years of teaching validation
export const validateYearsTeaching = (years?: number): string | null => {
  if (years === undefined || years === null) return null // Optional field
  
  if (typeof years !== 'number' || years < 0 || years > 999.9) {
    return VALIDATION_MESSAGES.YEARS_TEACHING_RANGE
  }
  
  return null
}

// Bio validation (basic length check)
export const validateBio = (bio?: string): string | null => {
  if (!bio) return null // Optional field
  
  // Basic length check - can be customized based on requirements
  if (bio.length > 2000) {
    return 'Bio cannot exceed 2000 characters'
  }
  
  return null
}

// Expertise validation (basic length check)
export const validateExpertise = (expertise?: string): string | null => {
  if (!expertise) return null // Optional field
  
  // Basic length check - can be customized based on requirements
  if (expertise.length > 1000) {
    return 'Expertise cannot exceed 1000 characters'
  }
  
  return null
}

// LinkedIn URL validation
export const validateLinkedInUrl = (url?: string): string | null => {
  if (!url) return null // Optional field
  
  const urlError = validateUrl(url)
  if (urlError) return VALIDATION_MESSAGES.LINKEDIN_INVALID
  
  return null
}

// Website URL validation
export const validateWebsiteUrl = (url?: string): string | null => {
  if (!url) return null // Optional field
  
  const urlError = validateUrl(url)
  if (urlError) return VALIDATION_MESSAGES.WEBSITE_INVALID
  
  return null
}

// Profile image URL validation
export const validateProfileImageUrl = (url?: string): string | null => {
  if (!url) return null // Optional field
  
  const urlError = validateUrl(url)
  if (urlError) return VALIDATION_MESSAGES.PROFILE_IMAGE_INVALID
  
  return null
}

// Social links validation
export const validateSocialLinks = (socialLinks?: Record<string, string>): string | null => {
  if (!socialLinks) return null // Optional field
  
  // Validate each URL in social links
  for (const [platform, url] of Object.entries(socialLinks)) {
    if (url && url.trim()) {
      const urlError = validateUrl(url.trim())
      if (urlError) {
        return `${platform} URL: ${VALIDATION_MESSAGES.INVALID_URL}`
      }
    }
  }
  
  return null
}

// Individual social link validation
export const validateSocialLink = (platform: string, url: string): { isValid: boolean; error?: string } => {
  if (!url || !url.trim()) {
    return { isValid: true } // Empty URLs are valid (optional)
  }
  
  const urlError = validateUrl(url.trim())
  if (urlError) {
    return { isValid: false, error: urlError }
  }
  
  return { isValid: true }
}

// Complete form validation for create mode
export const validateTrainerProfileCreate = (data: TrainerProfileData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // Email is required for create mode
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors[TRAINER_FORM_FIELDS.EMAIL] = emailError
  }
  
  // Specialities are required
  const specialitiesError = validateSpecialities(data.specialities)
  if (specialitiesError) {
    errors[TRAINER_FORM_FIELDS.SPECIALITIES] = specialitiesError
  }
  
  // Optional field validations
  const yearsError = validateYearsTeaching(data.total_years_teaching)
  if (yearsError) {
    errors[TRAINER_FORM_FIELDS.YEARS_TEACHING] = yearsError
  }
  
  const bioError = validateBio(data.bio)
  if (bioError) {
    errors[TRAINER_FORM_FIELDS.BIO] = bioError
  }
  
  const expertiseError = validateExpertise(data.expertise)
  if (expertiseError) {
    errors[TRAINER_FORM_FIELDS.EXPERTISE] = expertiseError
  }
  
  const linkedinError = validateLinkedInUrl(data.linkedin_url)
  if (linkedinError) {
    errors[TRAINER_FORM_FIELDS.LINKEDIN_URL] = linkedinError
  }
  
  const websiteError = validateWebsiteUrl(data.website)
  if (websiteError) {
    errors[TRAINER_FORM_FIELDS.WEBSITE_URL] = websiteError
  }
  
  const profileImageError = validateProfileImageUrl(data.profile_image)
  if (profileImageError) {
    errors[TRAINER_FORM_FIELDS.PROFILE_IMAGE] = profileImageError
  }
  
  const socialLinksError = validateSocialLinks(data.social_links)
  if (socialLinksError) {
    errors[TRAINER_FORM_FIELDS.SOCIAL_LINKS] = socialLinksError
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Complete form validation for edit mode
export const validateTrainerProfileEdit = (data: TrainerProfileData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // In edit mode, email is display-only so no validation needed
  // Specialities validation (optional in edit mode but if provided, must be valid)
  if (data.specialities !== undefined) {
    const specialitiesError = validateSpecialities(data.specialities)
    if (specialitiesError) {
      errors[TRAINER_FORM_FIELDS.SPECIALITIES] = specialitiesError
    }
  }
  
  // All other fields are optional and follow same validation rules
  const yearsError = validateYearsTeaching(data.total_years_teaching)
  if (yearsError) {
    errors[TRAINER_FORM_FIELDS.YEARS_TEACHING] = yearsError
  }
  
  const bioError = validateBio(data.bio)
  if (bioError) {
    errors[TRAINER_FORM_FIELDS.BIO] = bioError
  }
  
  const expertiseError = validateExpertise(data.expertise)
  if (expertiseError) {
    errors[TRAINER_FORM_FIELDS.EXPERTISE] = expertiseError
  }
  
  const linkedinError = validateLinkedInUrl(data.linkedin_url)
  if (linkedinError) {
    errors[TRAINER_FORM_FIELDS.LINKEDIN_URL] = linkedinError
  }
  
  const websiteError = validateWebsiteUrl(data.website)
  if (websiteError) {
    errors[TRAINER_FORM_FIELDS.WEBSITE_URL] = websiteError
  }
  
  const profileImageError = validateProfileImageUrl(data.profile_image)
  if (profileImageError) {
    errors[TRAINER_FORM_FIELDS.PROFILE_IMAGE] = profileImageError
  }
  
  const socialLinksError = validateSocialLinks(data.social_links)
  if (socialLinksError) {
    errors[TRAINER_FORM_FIELDS.SOCIAL_LINKS] = socialLinksError
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Main validation function that chooses mode-specific validation
export const validateTrainerProfile = (
  data: TrainerProfileData, 
  mode: ValidationMode = 'create'
): ValidationResult => {
  if (mode === 'edit') {
    return validateTrainerProfileEdit(data)
  }
  return validateTrainerProfileCreate(data)
}

// Individual field validators for real-time validation
export const fieldValidators = {
  [TRAINER_FORM_FIELDS.EMAIL]: validateEmail,
  [TRAINER_FORM_FIELDS.USER_ID]: validateUserId,
  [TRAINER_FORM_FIELDS.SPECIALITIES]: validateSpecialities,
  [TRAINER_FORM_FIELDS.YEARS_TEACHING]: validateYearsTeaching,
  [TRAINER_FORM_FIELDS.BIO]: validateBio,
  [TRAINER_FORM_FIELDS.EXPERTISE]: validateExpertise,
  [TRAINER_FORM_FIELDS.LINKEDIN_URL]: validateLinkedInUrl,
  [TRAINER_FORM_FIELDS.WEBSITE_URL]: validateWebsiteUrl,
  [TRAINER_FORM_FIELDS.PROFILE_IMAGE]: validateProfileImageUrl,
  [TRAINER_FORM_FIELDS.SOCIAL_LINKS]: validateSocialLinks,
}

// Validation schema type for external use
export type TrainerProfileValidationSchema = typeof fieldValidators 

// Add Zod schemas and form data types for the components

// Helper function to preprocess empty strings to undefined
const preprocessEmptyString = (val: unknown) => (val === "" ? undefined : val)

// Preprocess function for specialities to ensure array of numbers
const preprocessSpecialities = (val: any) => {
  if (!val || !Array.isArray(val)) return []
  return val.map(Number).filter(num => !isNaN(num) && num > 0)
}

// Create trainer profile schema for forms
export const createTrainerProfileSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  specialities: z.preprocess(preprocessSpecialities, z.array(z.number().positive()).min(1, "At least one speciality must be selected")),
  total_years_teaching: z.number().min(0).max(999).optional(),
  bio: z.preprocess(preprocessEmptyString, z.string().max(2000).optional()),
  expertise: z.preprocess(preprocessEmptyString, z.string().max(1000).optional()),
  linkedin_url: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid LinkedIn URL").optional()),
  website: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid website URL").optional()),
  profile_image: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid image URL").optional()),
  social_links: z.record(z.string()).optional(),
})

// Update trainer profile schema (email read-only)
export const updateTrainerProfileSchema = z.object({
  email: z.string().email().optional(), // Read-only in edit mode
  specialities: z.preprocess(preprocessSpecialities, z.array(z.number().positive()).min(1, "At least one speciality must be selected")).optional(),
  total_years_teaching: z.number().min(0).max(999).optional(),
  bio: z.preprocess(preprocessEmptyString, z.string().max(2000).optional()),
  expertise: z.preprocess(preprocessEmptyString, z.string().max(1000).optional()),
  linkedin_url: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid LinkedIn URL").optional()),
  website: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid website URL").optional()),
  profile_image: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid image URL").optional()),
  social_links: z.record(z.string()).optional(),
})

// Form data types
export type CreateTrainerProfileFormData = z.infer<typeof createTrainerProfileSchema>
export type UpdateTrainerProfileFormData = z.infer<typeof updateTrainerProfileSchema>