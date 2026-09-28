import { apiRequest } from '@/helpers/request'
import { API_ENDPOINTS, SWR_KEYS } from '@/helpers/string_const'

// Organization interface based on the backend API documentation
export interface Organization {
  id: string
  org_name: string
  code: string
  type: "hiring" | "training"
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
  is_currently_hiring?: boolean // Only for hiring orgs
  is_active: boolean
  created_at: string
  updated_at: string
}

// Organization User interface based on the backend API documentation
export interface OrganizationUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  preferred_name: string | null
  phone: string | null
  is_active: boolean
  created_at: string
}

// API endpoints using constants
const ENDPOINTS = {
  ORGANIZATIONS: API_ENDPOINTS.ORGANIZATIONS,
  ORGANIZATIONS_PAGINATION: API_ENDPOINTS.ORGANIZATIONS_PAGINATION,
  ORGANIZATION_BY_ID: (id: string) => `${API_ENDPOINTS.ORGANIZATION_BY_ID}/${id}`,
  UPDATE_ORGANIZATION: (id: string) => `${API_ENDPOINTS.UPDATE_ORGANIZATION}/${id}`,
  DEACTIVATE_ORGANIZATION: (id: string) => `${API_ENDPOINTS.DEACTIVATE_ORGANIZATION}/${id}/deactivate`,
  ACTIVATE_ORGANIZATION: (id: string) => `${API_ENDPOINTS.ACTIVATE_ORGANIZATION}/${id}/activate`,
  DELETE_ORGANIZATION: (id: string) => `${API_ENDPOINTS.DELETE_ORGANIZATION}/${id}`,
  ORGANIZATION_USERS: (id: string) => `${API_ENDPOINTS.ORGANIZATION_USERS}/${id}/users`,
  ORGANIZATION_USERS_PAGINATION: (id: string) => `${API_ENDPOINTS.ORGANIZATION_USERS_PAGINATION}/${id}/users/pagination`,
  ADD_USER_TO_ORGANIZATION: (id: string) => `${API_ENDPOINTS.ADD_USER_TO_ORGANIZATION}/${id}/users`,
  BULK_ADD_USERS_TO_ORGANIZATION: (id: string) => `${API_ENDPOINTS.BULK_ADD_USERS_TO_ORGANIZATION}/${id}/users/bulk-add`,
  DEACTIVATE_USER_IN_ORGANIZATION: (orgId: string, userId: string) => `/api/organizations/${orgId}/users/${userId}/deactivate`,
  ACTIVATE_USER_IN_ORGANIZATION: (orgId: string, userId: string) => `/api/organizations/${orgId}/users/${userId}/activate`,
  BULK_DEACTIVATE_USERS_IN_ORGANIZATION: (orgId: string) => `/api/organizations/${orgId}/users/bulk-deactivate`,
  BULK_ACTIVATE_USERS_IN_ORGANIZATION: (orgId: string) => `/api/organizations/${orgId}/users/bulk-activate`,
}

// Types for API requests
export interface CreateOrganizationData {
  org_name: string
  code: string
  type: "hiring" | "training"
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
  is_currently_hiring?: boolean // Required for hiring, forbidden for training
}

export interface UpdateOrganizationData {
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
  is_currently_hiring?: boolean // Still conditional based on type
}

export interface OrganizationQueryParams {
  page?: number // Default: 1, min: 1
  limit?: number // Default: 10, min: 1, max: 100
  search?: string // Search in org_name or code
  type?: "hiring" | "training" // Filter by organization type
  industry?: string // Filter by industry (partial match)
  country?: string // Filter by country code
  is_currently_hiring?: boolean // Filter by hiring status
  status?: "active" | "inactive" | "all" // Default: "active"
  sort_by?: "org_name" | "code" | "type" | "created_at" | "updated_at" // Default: "created_at"
  sort_order?: "asc" | "desc" // Default: "desc"
}

export interface PaginatedOrganizationsResponse {
  organizations: Organization[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Get all organizations (simple) - Admin, Super Admin
export const getAllOrganizations = async (): Promise<Organization[]> => {
  return await apiRequest.get<Organization[]>(ENDPOINTS.ORGANIZATIONS)
}

// Get all organizations (paginated - DEPRECATED) - Admin, Super Admin
export const getAllOrganizationsPaginated = async (
  params?: OrganizationQueryParams
): Promise<PaginatedOrganizationsResponse> => {
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
  }
  
  const url = searchParams.toString() 
    ? `${ENDPOINTS.ORGANIZATIONS_PAGINATION}?${searchParams.toString()}`
    : ENDPOINTS.ORGANIZATIONS_PAGINATION
    
  return await apiRequest.get<PaginatedOrganizationsResponse>(url)
}

// Get organization by ID - Admin, Super Admin
export const getOrganizationById = async (id: string): Promise<Organization> => {
  return await apiRequest.get<Organization>(
    ENDPOINTS.ORGANIZATION_BY_ID(id)
  )
}

// Create organization - Admin, Super Admin
export const createOrganization = async (
  organizationData: CreateOrganizationData
): Promise<Organization> => {
  return await apiRequest.post<Organization>(
    ENDPOINTS.ORGANIZATIONS,
    organizationData
  )
}

// Update organization by ID - Admin, Super Admin
export const updateOrganizationById = async (
  id: string,
  organizationData: UpdateOrganizationData
): Promise<Organization> => {
  return await apiRequest.put<Organization>(
    ENDPOINTS.UPDATE_ORGANIZATION(id),
    organizationData
  )
}

// Deactivate organization by ID - Admin, Super Admin
export const deactivateOrganizationById = async (id: string): Promise<Organization> => {
  return await apiRequest.patch<Organization>(
    ENDPOINTS.DEACTIVATE_ORGANIZATION(id)
  )
}

// Activate organization by ID - Admin, Super Admin
export const activateOrganizationById = async (id: string): Promise<Organization> => {
  return await apiRequest.patch<Organization>(
    ENDPOINTS.ACTIVATE_ORGANIZATION(id)
  )
}

// Permanently delete organization by ID - Super Admin only
export const permanentlyDeleteOrganizationById = async (id: string): Promise<void> => {
  await apiRequest.delete<void>(
    ENDPOINTS.DELETE_ORGANIZATION(id)
  )
}

// Validation function for organization
export const validateOrganization = (organizationData: any, isUpdate = false) => {
  const errors: Record<string, string> = {}

  // Organization name validation (required for create)
  if (!isUpdate && !organizationData.org_name) {
    errors.org_name = 'Organization name is required'
  } else if (organizationData.org_name && (organizationData.org_name.length < 1 || organizationData.org_name.length > 120)) {
    errors.org_name = 'Organization name must be between 1 and 120 characters'
  }

  // Code validation (required for create)
  if (!isUpdate && !organizationData.code) {
    errors.code = 'Organization code is required'
  } else if (organizationData.code) {
    if (organizationData.code.length < 1 || organizationData.code.length > 10) {
      errors.code = 'Organization code must be between 1 and 10 characters'
    }
    if (!/^[A-Z0-9]+$/.test(organizationData.code)) {
      errors.code = 'Organization code must contain only uppercase letters and numbers'
    }
  }

  // Type validation (required for create)
  if (!isUpdate && !organizationData.type) {
    errors.type = 'Organization type is required'
  } else if (organizationData.type && !['hiring', 'training'].includes(organizationData.type)) {
    errors.type = 'Organization type must be either "hiring" or "training"'
  }

  // Conditional validation for is_currently_hiring based on type
  if (organizationData.type) {
    if (organizationData.type === 'hiring') {
      if (organizationData.is_currently_hiring === undefined) {
        errors.is_currently_hiring = 'is_currently_hiring is required for hiring organizations'
      }
    } else if (organizationData.type === 'training') {
      if (organizationData.is_currently_hiring !== undefined) {
        errors.is_currently_hiring = 'is_currently_hiring must not be provided for training organizations'
      }
    }
  }

  // URL validations
  const urlFields = ['website', 'logo_url'] as const
  urlFields.forEach(field => {
    if (organizationData[field]) {
      try {
        new URL(organizationData[field])
        if (organizationData[field].length > 255) {
          errors[field] = `${field.replace('_', ' ')} cannot exceed 255 characters`
        }
      } catch {
        errors[field] = `${field.replace('_', ' ')} must be a valid URL`
      }
    }
  })

  // Text field length validations
  const textFields = {
    industry: 100,
    address_line1: 100,
    address_line2: 100,
    city: 80,
    state_province: 80,
    postal_code: 20
  } as const

  Object.entries(textFields).forEach(([field, maxLength]) => {
    if (organizationData[field] && organizationData[field].length > maxLength) {
      errors[field] = `${field.replace('_', ' ')} cannot exceed ${maxLength} characters`
    }
  })

  // Country code validation (must be exactly 2 uppercase letters)
  if (organizationData.country) {
    if (organizationData.country.length !== 2 || !/^[A-Z]{2}$/.test(organizationData.country)) {
      errors.country = 'Country must be a valid 2-letter ISO country code (e.g., "US", "CA")'
    }
  }

  return Object.keys(errors).length === 0 ? null : errors
}

// Helper functions for formatting data
export const formatOrganizationType = (type: string): string => {
  switch (type) {
    case 'hiring':
      return 'Hiring Organization'
    case 'training':
      return 'Training Organization'
    default:
      return type
  }
}

export const formatAddress = (organization: Organization): string => {
  const addressParts = [
    organization.address_line1,
    organization.address_line2,
    organization.city,
    organization.state_province,
    organization.postal_code,
    organization.country
  ].filter(Boolean)
  
  return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided'
}

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// SWR keys for caching
// Get organization users (simple) - Admin, Super Admin
export const getOrganizationUsers = async (id: string): Promise<OrganizationUser[]> => {
  return await apiRequest.get<OrganizationUser[]>(
    ENDPOINTS.ORGANIZATION_USERS(id)
  )
}

export const ORGANIZATIONS_SWR_KEY = SWR_KEYS.ORGANIZATIONS
export const ORGANIZATIONS_PAGINATED_SWR_KEY = (params?: OrganizationQueryParams): string => {
  if (!params) return `${SWR_KEYS.ORGANIZATIONS}_paginated`
  
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  return `${SWR_KEYS.ORGANIZATIONS}_paginated?${searchParams.toString()}`
}
export const ORGANIZATION_BY_ID_SWR_KEY = SWR_KEYS.ORGANIZATION_BY_ID
export const ORGANIZATION_USERS_SWR_KEY = SWR_KEYS.ORGANIZATION_USERS

// Types for user management
export interface AddUserToOrganizationData {
  email: string
}

export interface BulkAddUsersToOrganizationData {
  emails: string[]
}

export interface BulkOperationResponse {
  total_attempted: number
  successful: number
  failed: number
  failed_users: Array<{
    email: string
    reason: string
  }>
}

export interface AddUserResponse {
  user_id: string
  organization_id: string
  is_active: boolean
  created_at: string
}

// Add single user to organization - Admin, Super Admin
export const addUserToOrganization = async (
  organizationId: string,
  userData: AddUserToOrganizationData
): Promise<AddUserResponse> => {
  return await apiRequest.post<AddUserResponse>(
    ENDPOINTS.ADD_USER_TO_ORGANIZATION(organizationId),
    userData
  )
}

// Bulk add users to organization - Admin, Super Admin
export const bulkAddUsersToOrganization = async (
  organizationId: string,
  userData: BulkAddUsersToOrganizationData
): Promise<BulkOperationResponse> => {
  return await apiRequest.post<BulkOperationResponse>(
    ENDPOINTS.BULK_ADD_USERS_TO_ORGANIZATION(organizationId),
    userData
  )
}

// User activation/deactivation in organization types
export interface UserStatusChangeData {
  reason?: string
}

// Deactivate user in organization - Admin, Super Admin
export const deactivateUserInOrganization = async (
  organizationId: string,
  userId: string,
  data?: UserStatusChangeData
): Promise<void> => {
  return await apiRequest.patch<void>(
    ENDPOINTS.DEACTIVATE_USER_IN_ORGANIZATION(organizationId, userId),
    data || {}
  )
}

// Activate user in organization - Admin, Super Admin
export const activateUserInOrganization = async (
  organizationId: string,
  userId: string,
  data?: UserStatusChangeData
): Promise<void> => {
  return await apiRequest.patch<void>(
    ENDPOINTS.ACTIVATE_USER_IN_ORGANIZATION(organizationId, userId),
    data || {}
  )
}

// Bulk deactivate users in organization - Admin, Super Admin
export const bulkDeactivateUsersInOrganization = async (
  organizationId: string,
  emails: string[]
): Promise<BulkOperationResponse> => {
  return await apiRequest.patch<BulkOperationResponse>(
    ENDPOINTS.BULK_DEACTIVATE_USERS_IN_ORGANIZATION(organizationId),
    { emails }
  )
}

// Bulk activate users in organization - Admin, Super Admin
export const bulkActivateUsersInOrganization = async (
  organizationId: string,
  emails: string[]
): Promise<BulkOperationResponse> => {
  return await apiRequest.patch<BulkOperationResponse>(
    ENDPOINTS.BULK_ACTIVATE_USERS_IN_ORGANIZATION(organizationId),
    { emails }
  )
} 