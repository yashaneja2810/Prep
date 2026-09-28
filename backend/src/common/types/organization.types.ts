/**
 * Organization types and interfaces for GamutX LMS Backend
 * Based on database schema from schema.txt
 */

/**
 * Organization type enum - must match database enum
 */
export enum ORGANIZATION_TYPES {
  HIRING = 'hiring',
  TRAINING = 'training',
}

/**
 * Main Organization interface matching database schema
 */
export interface OrganizationEntity {
  id: string;
  org_name: string;
  code: string;
  website?: string;
  industry?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  logo_url?: string;
  description?: string;
  type: ORGANIZATION_TYPES;
  is_currently_hiring?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Organization-User relationship interface
 */
export interface OrganizationUser {
  id: string;
  org_id: string;
  user_id: string;
  is_active: boolean;
}

/**
 * Extended organization with user count
 */
export interface OrganizationWithUsers extends OrganizationEntity {
  user_count?: number;
  users?: OrganizationUser[];
}

/**
 * Organization response DTO interface
 */
export interface OrganizationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: OrganizationEntity;
}

/**
 * Paginated organizations response interface
 */
export interface PaginatedOrganizationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    organizations: OrganizationEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Bulk operation result interface for user management
 */
export interface BulkOperationResult {
  total_attempted: number;
  successful: number;
  failed: number;
  failed_users: Array<{
    user_id: string;
    reason: string;
  }>;
}

/**
 * Bulk operation response interface
 */
export interface BulkOperationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: BulkOperationResult;
}

/**
 * User list response for organization users
 */
export interface UserListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    users: Array<{
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      preferred_name?: string;
      phone?: string;
      is_active: boolean;
      created_at: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Organization creation input interface
 */
export interface CreateOrganizationInput {
  org_name: string;
  code: string;
  type: ORGANIZATION_TYPES;
  website?: string;
  industry?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  logo_url?: string;
  description?: string;
  is_currently_hiring?: boolean;
}

/**
 * Organization update input interface
 */
export interface UpdateOrganizationInput extends Partial<CreateOrganizationInput> {}

/**
 * Organization query filters interface
 */
export interface OrganizationQueryFilters {
  search?: string;
  type?: ORGANIZATION_TYPES;
  industry?: string;
  country?: string;
  is_currently_hiring?: boolean;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
  sort_by?: 'org_name' | 'code' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
} 