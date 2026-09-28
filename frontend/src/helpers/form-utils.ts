import { TrainerProfile } from '@/store/slices/trainers'
import { SOCIAL_PLATFORMS } from '@/helpers/string_const'
import { Organization } from '@/lib/api/organizations'

// Types for form data
export interface TrainerFormData {
  email?: string
  user_id?: string
  specialities?: number[]
  total_years_teaching?: number | string
  bio?: string
  expertise?: string
  linkedin_url?: string
  website?: string
  profile_image?: string
  social_links?: Record<string, string>
}

export interface CleanedTrainerData {
  email?: string
  user_id?: string
  specialities?: number[]
  total_years_teaching?: number
  bio?: string
  expertise?: string
  linkedin_url?: string
  website?: string
  profile_image?: string
  social_links?: Record<string, string> | null
}

// Types for organization form data
export interface OrganizationFormData {
  org_name?: string
  code?: string
  type?: "hiring" | "training"
  website?: string
  industry?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  logo_url?: string
  description?: string
  is_currently_hiring?: boolean
}

export interface CleanedOrganizationData {
  org_name?: string
  code?: string
  type?: "hiring" | "training"
  website?: string
  industry?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  logo_url?: string
  description?: string
  is_currently_hiring?: boolean
}

// Clean empty social links by removing empty/whitespace values
export const cleanSocialLinks = (socialLinks?: Record<string, string>): Record<string, string> => {
  if (!socialLinks) return {}
  
  const cleaned: Record<string, string> = {}
  Object.entries(socialLinks).forEach(([platform, url]) => {
    if (url && url.trim()) {
      cleaned[platform] = url.trim()
    }
  })
  
  return cleaned
}

// Helper function to clean any string field - converts empty strings to undefined
export const cleanStringField = (value?: string): string | undefined => {
  if (!value || typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

// Transform form data for API submission based on mode
export const transformFormDataForAPI = (formData: TrainerFormData, mode?: 'create' | 'edit'): CleanedTrainerData => {
  const cleanedData: CleanedTrainerData = {}
  
  // Helper function to check if a string value is valid and non-empty
  const isValidString = (value?: string): boolean => {
    return Boolean(value && value.trim() && value.trim() !== '')
  }
  
  // Clean and transform basic fields - only include if they have actual values
  const cleanedEmail = cleanStringField(formData.email)
  if (cleanedEmail) {
    cleanedData.email = cleanedEmail
  }
  
  const cleanedUserId = cleanStringField(formData.user_id)
  if (cleanedUserId) {
    cleanedData.user_id = cleanedUserId
  }
  
  // Specialities are numbers (IDs), so we don't need to clean them as strings
  if (formData.specialities && formData.specialities.length > 0) {
    cleanedData.specialities = formData.specialities
  }
  
  // Convert years of teaching to number - only include if valid
  if (formData.total_years_teaching !== undefined && formData.total_years_teaching !== null) {
    const years = typeof formData.total_years_teaching === 'string' 
      ? parseFloat(formData.total_years_teaching) 
      : formData.total_years_teaching
    
    if (!isNaN(years) && years >= 0) {
      cleanedData.total_years_teaching = years
    }
  }
  
  // Text fields - only include if they have content
  const cleanedBio = cleanStringField(formData.bio)
  if (cleanedBio) {
    cleanedData.bio = cleanedBio
  }
  
  const cleanedExpertise = cleanStringField(formData.expertise)
  if (cleanedExpertise) {
    cleanedData.expertise = cleanedExpertise
  }
  
  // URL fields - only include if they are valid, non-empty URLs
  // This prevents sending empty strings to the backend
  const cleanedLinkedIn = cleanStringField(formData.linkedin_url)
  if (cleanedLinkedIn) {
    cleanedData.linkedin_url = cleanedLinkedIn
  }
  
  const cleanedWebsite = cleanStringField(formData.website)
  if (cleanedWebsite) {
    cleanedData.website = cleanedWebsite
  }
  
  const cleanedProfileImage = cleanStringField(formData.profile_image)
  if (cleanedProfileImage) {
    cleanedData.profile_image = cleanedProfileImage
  }
  
  // Clean social links - only include platforms with valid URLs
  cleanedData.social_links = cleanSocialLinks(formData.social_links)
  
  return cleanedData
}

// Generate default form values based on mode and optional initial data
export const generateDefaultFormValues = (mode?: 'create' | 'edit' | 'view', initialData?: TrainerProfile): TrainerFormData => {
  if (mode === 'edit' && initialData) {
    return prefillFormWithTrainerData(initialData)
  }
  
  return {
    email: '',
    specialities: [],
    total_years_teaching: '',
    bio: '',
    expertise: '',
    linkedin_url: '',
    website: '',
    profile_image: '',
    social_links: generateDefaultSocialLinks(),
  }
}

// Generate default social links structure
export const generateDefaultSocialLinks = (): Record<string, string> => {
  return {
    [SOCIAL_PLATFORMS.TWITTER]: '',
    [SOCIAL_PLATFORMS.GITHUB]: '',
    [SOCIAL_PLATFORMS.LINKEDIN]: '',
    [SOCIAL_PLATFORMS.PORTFOLIO]: '',
    [SOCIAL_PLATFORMS.YOUTUBE]: '',
  }
}

// Pre-fill form with existing trainer data for edit mode
export const prefillFormWithTrainerData = (trainer: TrainerProfile): TrainerFormData => {
  return {
    email: trainer.email || '',
    user_id: trainer.user_id || undefined,
    specialities: trainer.specialities.map(s => s.id),
    total_years_teaching: trainer.total_years_teaching?.toString() || undefined,
    bio: trainer.bio || undefined,
    expertise: trainer.expertise || undefined,
    linkedin_url: trainer.linkedin_url || undefined, // Use undefined instead of empty string
    website: trainer.website || undefined,          // Use undefined instead of empty string
    profile_image: trainer.profile_image || undefined, // Use undefined instead of empty string
    social_links: trainer.social_links || {}        // Use trainer's social links or empty object
  }
}

// Reset form to default state
export const resetFormToDefault = (): TrainerFormData => {
  return generateDefaultFormValues()
}

// Add a new social link platform
export const addSocialLinkPlatform = (
  currentSocialLinks: Record<string, string>, 
  platform: string, 
  url: string = ''
): Record<string, string> => {
  return {
    ...currentSocialLinks,
    [platform]: url
  }
}

// Remove a social link platform
export const removeSocialLinkPlatform = (
  currentSocialLinks: Record<string, string>, 
  platform: string
): Record<string, string> => {
  const { [platform]: removed, ...remaining } = currentSocialLinks
  return remaining
}

// Update a specific social link
export const updateSocialLink = (
  currentSocialLinks: Record<string, string>, 
  platform: string, 
  url: string
): Record<string, string> => {
  return {
    ...currentSocialLinks,
    [platform]: url
  }
}

// Get available social platforms (not already added)
export const getAvailableSocialPlatforms = (
  currentSocialLinks: Record<string, string>
): string[] => {
  const allPlatforms = Object.values(SOCIAL_PLATFORMS)
  const usedPlatforms = Object.keys(currentSocialLinks)
  return allPlatforms.filter(platform => !usedPlatforms.includes(platform))
}

// Check if form has been modified (for unsaved changes warning)
export const hasFormChanged = (
  currentData: TrainerFormData, 
  originalData: TrainerFormData
): boolean => {
  // Compare basic fields
  const basicFieldsChanged = 
    currentData.email !== originalData.email ||
    currentData.specialities !== originalData.specialities ||
    currentData.total_years_teaching !== originalData.total_years_teaching ||
    currentData.bio !== originalData.bio ||
    currentData.expertise !== originalData.expertise ||
    currentData.linkedin_url !== originalData.linkedin_url ||
    currentData.website !== originalData.website ||
    currentData.profile_image !== originalData.profile_image
  
  if (basicFieldsChanged) return true
  
  // Compare social links
  const currentSocialLinks = currentData.social_links || {}
  const originalSocialLinks = originalData.social_links || {}
  
  const currentPlatforms = Object.keys(currentSocialLinks)
  const originalPlatforms = Object.keys(originalSocialLinks)
  
  if (currentPlatforms.length !== originalPlatforms.length) return true
  
  for (const platform of currentPlatforms) {
    if (currentSocialLinks[platform] !== originalSocialLinks[platform]) {
      return true
    }
  }
  
  return false
}

// Prepare data for create API call (using email)
export const prepareCreateData = (formData: TrainerFormData): CleanedTrainerData => {
  const cleanedData = transformFormDataForAPI(formData)
  
  // For create mode, ensure email is present and remove user_id if exists
  if (!cleanedData.email) {
    throw new Error('Email is required for creating trainer profile')
  }
  
  // Remove user_id for create mode since we use email
  delete cleanedData.user_id
  
  return cleanedData
}

// Prepare data for update API call (using profile ID)
export const prepareUpdateData = (formData: TrainerFormData): CleanedTrainerData => {
  const cleanedData = transformFormDataForAPI(formData)
  
  // For update mode, remove email since it's read-only
  delete cleanedData.email
  
  return cleanedData
}

// Validate required fields before submission
export const validateRequiredFields = (
  formData: TrainerFormData, 
  mode: 'create' | 'edit'
): string[] => {
  const errors: string[] = []
  
  if (mode === 'create') {
    if (!formData.email || !formData.email.trim()) {
      errors.push('Email is required')
    }
  }
  
  // Add other required field validations here if needed
  // Currently, most fields are optional based on the architecture
  
  return errors
}

// Format years of teaching for display
export const formatYearsTeaching = (years?: number | string): string => {
  if (!years) return '0'
  
  const numYears = typeof years === 'string' ? parseFloat(years) : years
  
  if (isNaN(numYears)) return '0'
  
  return numYears % 1 === 0 ? numYears.toString() : numYears.toFixed(1)
}

// Parse years of teaching from string input
export const parseYearsTeaching = (value: string): number | undefined => {
  if (!value || !value.trim()) return undefined
  
  const parsed = parseFloat(value.trim())
  return isNaN(parsed) ? undefined : parsed
}

// Form data transformation helpers
export const transformTrainerProfileToFormData = (profile: TrainerProfile): TrainerFormData => {
  return {
    email: profile.email || '',
    user_id: profile.user_id,
    specialities: profile.specialities.map(s => s.id),
    total_years_teaching: profile.total_years_teaching || '',
    bio: profile.bio || '',
    expertise: profile.expertise || '',
    linkedin_url: profile.linkedin_url || '',
    website: profile.website || '',
    profile_image: profile.profile_image || '',
    social_links: profile.social_links || {},
  }
}

export const transformFormDataToCreateRequest = (formData: TrainerFormData) => {
  return {
    email: formData.email || '',
    specialities: formData.specialities || [],
    total_years_teaching: typeof formData.total_years_teaching === 'string' 
      ? parseFloat(formData.total_years_teaching) || undefined
      : formData.total_years_teaching,
    bio: formData.bio || undefined,
    expertise: formData.expertise || undefined,
    linkedin_url: formData.linkedin_url || undefined,
    website: formData.website || undefined,
    profile_image: formData.profile_image || undefined,
    social_links: formData.social_links && Object.keys(formData.social_links).length > 0 
      ? formData.social_links 
      : undefined,
  }
}

export const transformFormDataToUpdateRequest = (formData: TrainerFormData) => {
  return {
    specialities: formData.specialities || [],
    total_years_teaching: typeof formData.total_years_teaching === 'string' 
      ? parseFloat(formData.total_years_teaching) || undefined
      : formData.total_years_teaching,
    bio: formData.bio || undefined,
    expertise: formData.expertise || undefined,
    linkedin_url: formData.linkedin_url || undefined,
    website: formData.website || undefined,
    profile_image: formData.profile_image || undefined,
    social_links: formData.social_links && Object.keys(formData.social_links).length > 0 
      ? formData.social_links 
      : undefined,
  }
}

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Experience options for forms
export const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'No experience' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '5', label: '5 years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
  { value: '20', label: '20+ years' },
]

// Status options for filtering
export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Trainers' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

// ========== ORGANIZATION FORM UTILITIES ==========

// Transform organization form data for API submission
export const transformOrganizationFormDataForAPI = (formData: OrganizationFormData): CleanedOrganizationData => {
  const cleanedData: CleanedOrganizationData = {}
  
  // Clean and transform basic fields - only include if they have actual values
  const cleanedOrgName = cleanStringField(formData.org_name)
  if (cleanedOrgName) {
    cleanedData.org_name = cleanedOrgName
  }
  
  const cleanedCode = cleanStringField(formData.code)
  if (cleanedCode) {
    cleanedData.code = cleanedCode.toUpperCase() // Ensure uppercase
  }
  
  if (formData.type) {
    cleanedData.type = formData.type
  }
  
  // URL fields - only include if they are valid, non-empty URLs
  const cleanedWebsite = cleanStringField(formData.website)
  if (cleanedWebsite) {
    cleanedData.website = cleanedWebsite
  }
  
  const cleanedLogoUrl = cleanStringField(formData.logo_url)
  if (cleanedLogoUrl) {
    cleanedData.logo_url = cleanedLogoUrl
  }
  
  // Text fields - only include if they have content
  const cleanedIndustry = cleanStringField(formData.industry)
  if (cleanedIndustry) {
    cleanedData.industry = cleanedIndustry
  }
  
  const cleanedDescription = cleanStringField(formData.description)
  if (cleanedDescription) {
    cleanedData.description = cleanedDescription
  }
  
  // Address fields
  const cleanedAddress1 = cleanStringField(formData.address_line1)
  if (cleanedAddress1) {
    cleanedData.address_line1 = cleanedAddress1
  }
  
  const cleanedAddress2 = cleanStringField(formData.address_line2)
  if (cleanedAddress2) {
    cleanedData.address_line2 = cleanedAddress2
  }
  
  const cleanedCity = cleanStringField(formData.city)
  if (cleanedCity) {
    cleanedData.city = cleanedCity
  }
  
  const cleanedState = cleanStringField(formData.state_province)
  if (cleanedState) {
    cleanedData.state_province = cleanedState
  }
  
  const cleanedPostal = cleanStringField(formData.postal_code)
  if (cleanedPostal) {
    cleanedData.postal_code = cleanedPostal
  }
  
  const cleanedCountry = cleanStringField(formData.country)
  if (cleanedCountry) {
    cleanedData.country = cleanedCountry.toUpperCase() // Ensure uppercase for country code
  }
  
  // Handle conditional field is_currently_hiring (only for hiring organizations)
  if (formData.type === 'hiring' && formData.is_currently_hiring !== undefined) {
    cleanedData.is_currently_hiring = formData.is_currently_hiring
  }
  
  return cleanedData
}

// Generate default form values for organization forms
export const generateDefaultOrganizationFormValues = (mode?: 'create' | 'edit' | 'view', initialData?: Organization): OrganizationFormData => {
  if (mode === 'edit' && initialData) {
    return prefillFormWithOrganizationData(initialData)
  }
  
  return {
    org_name: '',
    code: '',
    type: undefined,
    website: '',
    industry: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    logo_url: '',
    description: '',
    is_currently_hiring: undefined,
  }
}

// Pre-fill form with existing organization data for edit mode
export const prefillFormWithOrganizationData = (organization: Organization): OrganizationFormData => {
  const formData: OrganizationFormData = {
    org_name: organization.org_name || '',
    code: organization.code || '',
    type: organization.type || undefined,
    website: organization.website || undefined,
    industry: organization.industry || undefined,
    address_line1: organization.address_line1 || undefined,
    address_line2: organization.address_line2 || undefined,
    city: organization.city || undefined,
    state_province: organization.state_province || undefined,
    postal_code: organization.postal_code || undefined,
    country: organization.country || undefined,
    logo_url: organization.logo_url || undefined,
    description: organization.description || undefined,
  }
  
  // Only include is_currently_hiring for hiring organizations
  if (organization.type === 'hiring') {
    formData.is_currently_hiring = organization.is_currently_hiring
  }
  
  return formData
}

// Check if organization form has been modified (for unsaved changes warning)
export const hasOrganizationFormChanged = (
  currentData: OrganizationFormData, 
  originalData: OrganizationFormData
): boolean => {
  return (
    currentData.org_name !== originalData.org_name ||
    currentData.code !== originalData.code ||
    currentData.type !== originalData.type ||
    currentData.website !== originalData.website ||
    currentData.industry !== originalData.industry ||
    currentData.address_line1 !== originalData.address_line1 ||
    currentData.address_line2 !== originalData.address_line2 ||
    currentData.city !== originalData.city ||
    currentData.state_province !== originalData.state_province ||
    currentData.postal_code !== originalData.postal_code ||
    currentData.country !== originalData.country ||
    currentData.logo_url !== originalData.logo_url ||
    currentData.description !== originalData.description ||
    currentData.is_currently_hiring !== originalData.is_currently_hiring
  )
}

// Prepare data for create organization API call
export const prepareOrganizationCreateData = (formData: OrganizationFormData): CleanedOrganizationData => {
  const cleanedData = transformOrganizationFormDataForAPI(formData)
  
  // For create mode, ensure required fields are present
  if (!cleanedData.org_name) {
    throw new Error('Organization name is required')
  }
  
  if (!cleanedData.code) {
    throw new Error('Organization code is required')
  }
  
  if (!cleanedData.type) {
    throw new Error('Organization type is required')
  }
  
  return cleanedData
}

// Prepare data for update organization API call
export const prepareOrganizationUpdateData = (formData: OrganizationFormData): CleanedOrganizationData => {
  const cleanedData = transformOrganizationFormDataForAPI(formData)
  
  // For update mode, all fields are optional but validate what's being updated
  return cleanedData
}

// Validate organization required fields before submission
export const validateOrganizationRequiredFields = (
  formData: OrganizationFormData, 
  mode: 'create' | 'edit'
): string[] => {
  const errors: string[] = []
  
  if (mode === 'create') {
    if (!formData.org_name || !formData.org_name.trim()) {
      errors.push('Organization name is required')
    }
    
    if (!formData.code || !formData.code.trim()) {
      errors.push('Organization code is required')
    }
    
    if (!formData.type) {
      errors.push('Organization type is required')
    }
    
    // Conditional validation for is_currently_hiring
    if (formData.type === 'hiring' && formData.is_currently_hiring === undefined) {
      errors.push('Currently hiring status is required for hiring organizations')
    }
    
    if (formData.type === 'training' && formData.is_currently_hiring !== undefined) {
      errors.push('Currently hiring status should not be provided for training organizations')
    }
  }
  
  return errors
}

// Organization type options for forms
export const ORGANIZATION_TYPE_OPTIONS = [
  { value: 'hiring', label: 'Hiring Organization' },
  { value: 'training', label: 'Training Organization' },
]

// Hiring status options
export const HIRING_STATUS_OPTIONS = [
  { value: true, label: 'Currently Hiring' },
  { value: false, label: 'Not Currently Hiring' },
]

// Country code options (common ones)
export const COUNTRY_CODE_OPTIONS = [
  { value: 'US', label: 'United States (US)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'AU', label: 'Australia (AU)' },
  { value: 'IN', label: 'India (IN)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'JP', label: 'Japan (JP)' },
  { value: 'CN', label: 'China (CN)' },
  { value: 'BR', label: 'Brazil (BR)' },
]

// Organization status options for filtering
export const ORGANIZATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All Organizations' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

// Organization form data transformers for API requests
export const transformOrganizationFormDataToCreateRequest = (formData: OrganizationFormData) => {
  const cleaned = transformOrganizationFormDataForAPI(formData)
  
  return {
    org_name: cleaned.org_name || '',
    code: cleaned.code || '',
    type: cleaned.type || 'hiring',
    website: cleaned.website || undefined,
    industry: cleaned.industry || undefined,
    address_line1: cleaned.address_line1 || undefined,
    address_line2: cleaned.address_line2 || undefined,
    city: cleaned.city || undefined,
    state_province: cleaned.state_province || undefined,
    postal_code: cleaned.postal_code || undefined,
    country: cleaned.country || undefined,
    logo_url: cleaned.logo_url || undefined,
    description: cleaned.description || undefined,
    is_currently_hiring: cleaned.is_currently_hiring,
  }
}

export const transformOrganizationFormDataToUpdateRequest = (formData: OrganizationFormData) => {
  const cleaned = transformOrganizationFormDataForAPI(formData)
  
  // For updates, only include fields that have values (undefined fields won't be sent)
  const updateData: Record<string, any> = {}
  
  Object.entries(cleaned).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value
    }
  })
  
  return updateData
}

// Form data transformation helpers for organization
export const transformOrganizationToFormData = (organization: Organization): OrganizationFormData => {
  return {
    org_name: organization.org_name || '',
    code: organization.code || '',
    type: organization.type || undefined,
    website: organization.website || '',
    industry: organization.industry || '',
    address_line1: organization.address_line1 || '',
    address_line2: organization.address_line2 || '',
    city: organization.city || '',
    state_province: organization.state_province || '',
    postal_code: organization.postal_code || '',
    country: organization.country || '',
    logo_url: organization.logo_url || '',
    description: organization.description || '',
    is_currently_hiring: organization.is_currently_hiring,
  }
} 