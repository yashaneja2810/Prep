import { apiRequest, ApiResponse } from '@/helpers/request'

// Validation function for trainer profile
export const validateTrainerProfile = (profileData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Specialities validation (required)
  if (!profileData.specialities || !Array.isArray(profileData.specialities) || profileData.specialities.length === 0) {
    errors.specialities = 'At least one speciality must be selected'
  } else {
    // Validate that all speciality IDs are numbers
    const invalidSpecialities = profileData.specialities.filter((id: any) => !Number.isInteger(id) || id <= 0)
    if (invalidSpecialities.length > 0) {
      errors.specialities = 'Invalid speciality IDs provided'
    }
  }

  // Total years teaching validation
  if (profileData.total_years_teaching !== undefined) {
    if (profileData.total_years_teaching < 0 || profileData.total_years_teaching > 999.9) {
      errors.total_years_teaching = 'Years of teaching must be between 0 and 999.9'
    }
  }

  // URL validations
  const urlFields = ['linkedin_url', 'profile_image', 'website'] as const
  urlFields.forEach(field => {
    if (profileData[field]) {
      try {
        new URL(profileData[field])
        if (profileData[field].length > 255) {
          errors[field] = `${field.replace('_', ' ')} cannot exceed 255 characters`
        }
      } catch {
        errors[field] = `${field.replace('_', ' ')} must be a valid URL`
      }
    }
  })

  // Social links validation
  if (profileData.social_links && typeof profileData.social_links !== 'object') {
    errors.social_links = 'Social links must be a valid JSON object'
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions for formatting data
export const formatExpertise = (expertise?: string): string => {
  if (!expertise) return 'No expertise specified'
  return expertise
}

export const formatTeachingExperience = (years?: number): string => {
  if (!years) return 'Experience not specified'
  return `${years} year${years === 1 ? '' : 's'} of teaching experience`
}

export const formatSocialLinks = (socialLinks?: Record<string, string>) => {
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return []
  }
  return Object.entries(socialLinks).map(([platform, url]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    url
  }))
}

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Generate default social links structure
export const generateDefaultSocialLinks = () => {
  return {
    twitter: '',
    github: '',
    linkedin: '',
    portfolio: ''
  }
}

// Clean social links by removing empty values
export const cleanSocialLinks = (socialLinks?: Record<string, string>) => {
  if (!socialLinks) return {}
  
  const cleaned: Record<string, string> = {}
  Object.entries(socialLinks).forEach(([key, value]) => {
    if (value && value.trim()) {
      cleaned[key] = value.trim()
    }
  })
  
  return Object.keys(cleaned).length > 0 ? cleaned : {}
} 