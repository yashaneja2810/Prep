import { z } from 'zod'
import { 
  VALIDATION_MESSAGES,
  API_MESSAGES 
} from '@/helpers/string_const'

// Validation interfaces
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface OrganizationProfileData {
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

export type ValidationMode = 'create' | 'edit'

// Organization name validation
export const validateOrgName = (orgName?: string): string | null => {
  if (!orgName || !orgName.trim()) {
    return 'Organization name is required'
  }
  
  if (orgName.length < 1 || orgName.length > 120) {
    return 'Organization name must be between 1 and 120 characters'
  }
  
  return null
}

// Organization code validation
export const validateOrgCode = (code?: string): string | null => {
  if (!code || !code.trim()) {
    return 'Organization code is required'
  }
  
  const cleanCode = code.trim().toUpperCase()
  
  if (cleanCode.length < 1 || cleanCode.length > 10) {
    return 'Organization code must be between 1 and 10 characters'
  }
  
  // Only uppercase letters and numbers
  const codeRegex = /^[A-Z0-9]+$/
  if (!codeRegex.test(cleanCode)) {
    return 'Organization code must contain only uppercase letters and numbers'
  }
  
  return null
}

// Organization type validation
export const validateOrgType = (type?: string): string | null => {
  if (!type) {
    return 'Organization type is required'
  }
  
  if (type !== 'hiring' && type !== 'training') {
    return 'Organization type must be either "hiring" or "training"'
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

// Industry validation
export const validateIndustry = (industry?: string): string | null => {
  if (!industry) return null // Optional field
  
  if (industry.length > 100) {
    return 'Industry cannot exceed 100 characters'
  }
  
  return null
}

// Address validation
export const validateAddress = (address?: string, fieldName = 'Address'): string | null => {
  if (!address) return null // Optional field
  
  if (address.length > 100) {
    return `${fieldName} cannot exceed 100 characters`
  }
  
  return null
}

// City validation
export const validateCity = (city?: string): string | null => {
  if (!city) return null // Optional field
  
  if (city.length > 80) {
    return 'City cannot exceed 80 characters'
  }
  
  return null
}

// State/Province validation
export const validateStateProvince = (stateProvince?: string): string | null => {
  if (!stateProvince) return null // Optional field
  
  if (stateProvince.length > 80) {
    return 'State/Province cannot exceed 80 characters'
  }
  
  return null
}

// Postal code validation
export const validatePostalCode = (postalCode?: string): string | null => {
  if (!postalCode) return null // Optional field
  
  if (postalCode.length > 20) {
    return 'Postal code cannot exceed 20 characters'
  }
  
  return null
}

// Country code validation (ISO 3166-1 alpha-2)
export const validateCountry = (country?: string): string | null => {
  if (!country) return null // Optional field
  
  if (country.length !== 2) {
    return 'Country code must be exactly 2 characters'
  }
  
  const countryRegex = /^[A-Z]{2}$/
  if (!countryRegex.test(country.toUpperCase())) {
    return 'Country code must be exactly 2 uppercase letters (ISO 3166-1 alpha-2)'
  }
  
  return null
}

// Logo URL validation
export const validateLogoUrl = (logoUrl?: string): string | null => {
  if (!logoUrl) return null // Optional field
  
  const urlError = validateUrl(logoUrl)
  if (urlError) return 'Logo URL must be a valid URL'
  
  return null
}

// Description validation
export const validateDescription = (description?: string): string | null => {
  if (!description) return null // Optional field
  
  // API docs specify "No limit" for description field
  return null
}

// Conditional field validation for is_currently_hiring
export const validateIsCurrentlyHiring = (
  isCurrentlyHiring?: boolean, 
  orgType?: string
): string | null => {
  if (orgType === 'hiring') {
    if (isCurrentlyHiring === undefined || isCurrentlyHiring === null) {
      return 'Currently hiring status is required for hiring organizations'
    }
  } else if (orgType === 'training') {
    if (isCurrentlyHiring !== undefined && isCurrentlyHiring !== null) {
      return 'Currently hiring status should not be provided for training organizations'
    }
  }
  
  return null
}

// Complete form validation for create mode
export const validateOrganizationProfileCreate = (data: OrganizationProfileData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // Required fields
  const orgNameError = validateOrgName(data.org_name)
  if (orgNameError) {
    errors.org_name = orgNameError
  }
  
  const codeError = validateOrgCode(data.code)
  if (codeError) {
    errors.code = codeError
  }
  
  const typeError = validateOrgType(data.type)
  if (typeError) {
    errors.type = typeError
  }
  
  // Conditional validation for is_currently_hiring
  const hiringError = validateIsCurrentlyHiring(data.is_currently_hiring, data.type)
  if (hiringError) {
    errors.is_currently_hiring = hiringError
  }
  
  // Optional field validations
  const websiteError = validateUrl(data.website, 'Website')
  if (websiteError) {
    errors.website = websiteError
  }
  
  const industryError = validateIndustry(data.industry)
  if (industryError) {
    errors.industry = industryError
  }
  
  const address1Error = validateAddress(data.address_line1, 'Address Line 1')
  if (address1Error) {
    errors.address_line1 = address1Error
  }
  
  const address2Error = validateAddress(data.address_line2, 'Address Line 2')
  if (address2Error) {
    errors.address_line2 = address2Error
  }
  
  const cityError = validateCity(data.city)
  if (cityError) {
    errors.city = cityError
  }
  
  const stateError = validateStateProvince(data.state_province)
  if (stateError) {
    errors.state_province = stateError
  }
  
  const postalError = validatePostalCode(data.postal_code)
  if (postalError) {
    errors.postal_code = postalError
  }
  
  const countryError = validateCountry(data.country)
  if (countryError) {
    errors.country = countryError
  }
  
  const logoError = validateLogoUrl(data.logo_url)
  if (logoError) {
    errors.logo_url = logoError
  }
  
  const descriptionError = validateDescription(data.description)
  if (descriptionError) {
    errors.description = descriptionError
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Complete form validation for edit mode
export const validateOrganizationProfileEdit = (data: OrganizationProfileData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // In edit mode, only validate fields that are being updated
  if (data.org_name !== undefined) {
    const orgNameError = validateOrgName(data.org_name)
    if (orgNameError) {
      errors.org_name = orgNameError
    }
  }
  
  if (data.code !== undefined) {
    const codeError = validateOrgCode(data.code)
    if (codeError) {
      errors.code = codeError
    }
  }
  
  if (data.type !== undefined) {
    const typeError = validateOrgType(data.type)
    if (typeError) {
      errors.type = typeError
    }
  }
  
  // Conditional validation for is_currently_hiring (validate if type is being updated or hiring status is being updated)
  if (data.type !== undefined || data.is_currently_hiring !== undefined) {
    const hiringError = validateIsCurrentlyHiring(data.is_currently_hiring, data.type)
    if (hiringError) {
      errors.is_currently_hiring = hiringError
    }
  }
  
  // Optional field validations
  if (data.website !== undefined) {
    const websiteError = validateUrl(data.website, 'Website')
    if (websiteError) {
      errors.website = websiteError
    }
  }
  
  if (data.industry !== undefined) {
    const industryError = validateIndustry(data.industry)
    if (industryError) {
      errors.industry = industryError
    }
  }
  
  if (data.address_line1 !== undefined) {
    const address1Error = validateAddress(data.address_line1, 'Address Line 1')
    if (address1Error) {
      errors.address_line1 = address1Error
    }
  }
  
  if (data.address_line2 !== undefined) {
    const address2Error = validateAddress(data.address_line2, 'Address Line 2')
    if (address2Error) {
      errors.address_line2 = address2Error
    }
  }
  
  if (data.city !== undefined) {
    const cityError = validateCity(data.city)
    if (cityError) {
      errors.city = cityError
    }
  }
  
  if (data.state_province !== undefined) {
    const stateError = validateStateProvince(data.state_province)
    if (stateError) {
      errors.state_province = stateError
    }
  }
  
  if (data.postal_code !== undefined) {
    const postalError = validatePostalCode(data.postal_code)
    if (postalError) {
      errors.postal_code = postalError
    }
  }
  
  if (data.country !== undefined) {
    const countryError = validateCountry(data.country)
    if (countryError) {
      errors.country = countryError
    }
  }
  
  if (data.logo_url !== undefined) {
    const logoError = validateLogoUrl(data.logo_url)
    if (logoError) {
      errors.logo_url = logoError
    }
  }
  
  if (data.description !== undefined) {
    const descriptionError = validateDescription(data.description)
    if (descriptionError) {
      errors.description = descriptionError
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Main validation function that chooses mode-specific validation
export const validateOrganizationProfile = (
  data: OrganizationProfileData, 
  mode: ValidationMode = 'create'
): ValidationResult => {
  if (mode === 'edit') {
    return validateOrganizationProfileEdit(data)
  }
  return validateOrganizationProfileCreate(data)
}

// Helper function to preprocess empty strings to undefined
const preprocessEmptyString = (val: unknown) => (val === "" ? undefined : val)

// Helper function to preprocess and format organization code
const preprocessOrgCode = (val: unknown) => {
  if (typeof val === 'string' && val.trim()) {
    return val.trim().toUpperCase()
  }
  return val
}

// Helper function to preprocess country code
const preprocessCountryCode = (val: unknown) => {
  if (typeof val === 'string' && val.trim()) {
    return val.trim().toUpperCase()
  }
  return val
}

// Create organization profile schema for forms
export const createOrganizationProfileSchema = z.object({
  org_name: z.string().min(1, "Organization name is required").max(120, "Organization name cannot exceed 120 characters"),
  code: z.preprocess(preprocessOrgCode, z.string().min(1, "Organization code is required").max(10, "Organization code cannot exceed 10 characters").regex(/^[A-Z0-9]+$/, "Organization code must contain only uppercase letters and numbers")),
  type: z.enum(["hiring", "training"], { required_error: "Organization type is required" }),
  website: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid website URL").max(255, "Website URL cannot exceed 255 characters").optional()),
  industry: z.preprocess(preprocessEmptyString, z.string().max(100, "Industry cannot exceed 100 characters").optional()),
  address_line1: z.preprocess(preprocessEmptyString, z.string().max(100, "Address line 1 cannot exceed 100 characters").optional()),
  address_line2: z.preprocess(preprocessEmptyString, z.string().max(100, "Address line 2 cannot exceed 100 characters").optional()),
  city: z.preprocess(preprocessEmptyString, z.string().max(80, "City cannot exceed 80 characters").optional()),
  state_province: z.preprocess(preprocessEmptyString, z.string().max(80, "State/Province cannot exceed 80 characters").optional()),
  postal_code: z.preprocess(preprocessEmptyString, z.string().max(20, "Postal code cannot exceed 20 characters").optional()),
  country: z.preprocess(preprocessCountryCode, z.string().length(2, "Country code must be exactly 2 characters").regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters").optional()),
  logo_url: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid logo URL").max(255, "Logo URL cannot exceed 255 characters").optional()),
  description: z.preprocess(preprocessEmptyString, z.string().optional()),
  is_currently_hiring: z.boolean().optional(),
}).refine((data) => {
  // Conditional validation for is_currently_hiring based on type
  if (data.type === 'hiring') {
    return data.is_currently_hiring !== undefined
  }
  if (data.type === 'training') {
    return data.is_currently_hiring === undefined
  }
  return true
}, {
  message: "Currently hiring status is required for hiring organizations and should not be provided for training organizations",
  path: ["is_currently_hiring"]
})

// Update organization profile schema (same as create but all fields optional except conditional validation still applies)
export const updateOrganizationProfileSchema = z.object({
  org_name: z.string().min(1, "Organization name is required").max(120, "Organization name cannot exceed 120 characters").optional(),
  code: z.preprocess(preprocessOrgCode, z.string().min(1, "Organization code is required").max(10, "Organization code cannot exceed 10 characters").regex(/^[A-Z0-9]+$/, "Organization code must contain only uppercase letters and numbers")).optional(),
  type: z.enum(["hiring", "training"]).optional(),
  website: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid website URL").max(255, "Website URL cannot exceed 255 characters").optional()),
  industry: z.preprocess(preprocessEmptyString, z.string().max(100, "Industry cannot exceed 100 characters").optional()),
  address_line1: z.preprocess(preprocessEmptyString, z.string().max(100, "Address line 1 cannot exceed 100 characters").optional()),
  address_line2: z.preprocess(preprocessEmptyString, z.string().max(100, "Address line 2 cannot exceed 100 characters").optional()),
  city: z.preprocess(preprocessEmptyString, z.string().max(80, "City cannot exceed 80 characters").optional()),
  state_province: z.preprocess(preprocessEmptyString, z.string().max(80, "State/Province cannot exceed 80 characters").optional()),
  postal_code: z.preprocess(preprocessEmptyString, z.string().max(20, "Postal code cannot exceed 20 characters").optional()),
  country: z.preprocess(preprocessCountryCode, z.string().length(2, "Country code must be exactly 2 characters").regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters").optional()),
  logo_url: z.preprocess(preprocessEmptyString, z.string().url("Please enter a valid logo URL").max(255, "Logo URL cannot exceed 255 characters").optional()),
  description: z.preprocess(preprocessEmptyString, z.string().optional()),
  is_currently_hiring: z.boolean().optional(),
}).refine((data) => {
  // Conditional validation for is_currently_hiring based on type
  if (data.type === 'hiring') {
    return data.is_currently_hiring !== undefined
  }
  if (data.type === 'training') {
    return data.is_currently_hiring === undefined
  }
  return true
}, {
  message: "Currently hiring status is required for hiring organizations and should not be provided for training organizations",
  path: ["is_currently_hiring"]
})

// Form data types
export type CreateOrganizationProfileFormData = z.infer<typeof createOrganizationProfileSchema>
export type UpdateOrganizationProfileFormData = z.infer<typeof updateOrganizationProfileSchema>

// Individual field validators for real-time validation
export const fieldValidators = {
  org_name: validateOrgName,
  code: validateOrgCode,
  type: validateOrgType,
  website: (url?: string) => validateUrl(url, 'Website'),
  industry: validateIndustry,
  address_line1: (address?: string) => validateAddress(address, 'Address Line 1'),
  address_line2: (address?: string) => validateAddress(address, 'Address Line 2'),
  city: validateCity,
  state_province: validateStateProvince,
  postal_code: validatePostalCode,
  country: validateCountry,
  logo_url: validateLogoUrl,
  description: validateDescription,
  is_currently_hiring: (isHiring?: boolean, orgType?: string) => validateIsCurrentlyHiring(isHiring, orgType),
}

// Validation schema type for external use
export type OrganizationProfileValidationSchema = typeof fieldValidators 