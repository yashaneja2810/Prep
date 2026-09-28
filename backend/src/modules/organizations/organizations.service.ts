import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { GetOrgUsersQueryDto } from './dto/get-org-users-query.dto';
import { 
  OrganizationEntity, 
  PaginatedOrganizationsResponse, 
  OrganizationResponse,
  ORGANIZATION_TYPES as ORG_TYPES 
} from '../../common/types/organization.types';
import { 
  ORGANIZATION_TABLES, 
  MESSAGES, 
  ORGANIZATION_TYPES,
  DB_ERROR_CODES,
  QUERY,
  COLUMNS,
  TABLES 
} from '../../common/helpers/string-const';
// Response helpers removed - using custom formatters below

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  //#region ==================== CRUD OPERATIONS ====================
  
  /**
   * Create a new organization
   * @param createOrganizationDto - Organization creation data
   * @returns Created organization with response wrapper
   */
  async create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponse> {
    this.logger.log(`Creating organization with code: ${createOrganizationDto.code}`);
    
    try {
      // Validate organization type
      this.validateOrganizationType(createOrganizationDto.type, createOrganizationDto.is_currently_hiring);
      
      // Set is_active to true by default (Task 3.2)
      const organizationData = {
        ...createOrganizationDto,
        [COLUMNS.IS_ACTIVE]: true
      };
      
      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .insert([organizationData])
        .select(QUERY.SELECT_ALL)
        .single();

      if (error) {
        this.logger.error(`Failed to create organization: ${error.message}`, error);
        this.handleDatabaseError(error);
      }

      this.logger.log(`Organization created successfully with ID: ${data[COLUMNS.ID]}`);
      
      return this.formatOrganizationResponse(
        data as OrganizationEntity,
        MESSAGES.ORGANIZATION_CREATED,
        201
      );
    } catch (error) {
      this.logger.error(`Error creating organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get all organizations with pagination and filtering
   * NOTE: Basic filtering implemented, advanced filtering pending
   * @param queryDto - Query parameters for filtering and pagination
   * @returns Paginated list of organizations
   */
  async findAll(queryDto: GetOrganizationsQueryDto): Promise<PaginatedOrganizationsResponse> {
    this.logger.log(`Fetching organizations with filters: ${JSON.stringify(queryDto)} - NOTE: Advanced filtering pending`);
    
    try {
      const { page = 1, limit = 10, search, type, industry, country, is_currently_hiring, status = 'active', sort_by = COLUMNS.CREATED_AT, sort_order = QUERY.DESC } = queryDto;
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Build query
      let query = this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .select(QUERY.SELECT_ALL, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`${COLUMNS.ORG_NAME}.ilike.%${search}%,${COLUMNS.CODE}.ilike.%${search}%`);
      }
      
      if (type) {
        query = query.eq(COLUMNS.TYPE, type);
      }
      
      if (industry) {
        query = query.ilike(COLUMNS.INDUSTRY, `%${industry}%`);
      }
      
      if (country) {
        query = query.eq(COLUMNS.COUNTRY, country);
      }
      
      if (is_currently_hiring !== undefined) {
        query = query.eq(COLUMNS.IS_CURRENTLY_HIRING, is_currently_hiring);
      }
      
      // Apply status filtering (Task 4.1: default to active only)
      if (status === 'active') {
        query = query.eq(COLUMNS.IS_ACTIVE, true);
      } else if (status === 'inactive') {
        query = query.eq(COLUMNS.IS_ACTIVE, false);
      }
      // 'all' status shows both active and inactive

      // Apply sorting and pagination
      query = query
        .order(sort_by, { ascending: sort_order === QUERY.ASC })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        this.logger.error(`Failed to fetch organizations: ${error.message}`, error);
        throw new BadRequestException(`Failed to fetch organizations: ${error.message}`);
      }

      this.logger.log(`Retrieved ${data?.length || 0} organizations out of ${count || 0} total`);

      return this.formatPaginatedResponse(
        data as OrganizationEntity[] || [],
        count || 0,
        page,
        limit,
        MESSAGES.ORGANIZATIONS_RETRIEVED
      );
    } catch (error) {
      this.logger.error(`Error fetching organizations: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get all organizations (simple version without pagination/filtering)
   * @returns List of all active organizations
   */
  async findAllSimple(): Promise<{ statusCode: number; success: boolean; message: string; data: OrganizationEntity[] }> {
    this.logger.log('Fetching all active organizations (simple list)');
    
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .select(QUERY.SELECT_ALL)
        .eq(COLUMNS.IS_ACTIVE, true) // Only show active organizations by default
        .order(COLUMNS.CREATED_AT, { ascending: false });

      if (error) {
        this.logger.error(`Failed to fetch organizations: ${error.message}`, error);
        throw new BadRequestException(`Failed to fetch organizations: ${error.message}`);
      }

      this.logger.log(`Retrieved ${data?.length || 0} organizations`);

      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.ORGANIZATIONS_RETRIEVED,
        data: data as OrganizationEntity[] || []
      };
    } catch (error) {
      this.logger.error(`Error fetching organizations: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get a single organization by ID
   * @param id - Organization ID
   * @returns Organization with response wrapper
   */
  async findOne(id: string): Promise<OrganizationResponse> {
    this.logger.log(`Fetching organization with ID: ${id}`);
    
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .select(QUERY.SELECT_ALL)
        .eq(COLUMNS.ID, id)
        .single();

      if (error) {
        if (error.code === DB_ERROR_CODES.NO_ROWS_RETURNED) {
          this.logger.warn(`Organization not found with ID: ${id}`);
          throw new NotFoundException(MESSAGES.ORGANIZATION_NOT_FOUND);
        }
        this.logger.error(`Failed to fetch organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to fetch organization: ${error.message}`);
      }

      this.logger.log(`Organization retrieved successfully with ID: ${id}`);
      
      return this.formatOrganizationResponse(
        data as OrganizationEntity,
        MESSAGES.SUCCESS
      );
    } catch (error) {
      this.logger.error(`Error fetching organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Update an organization
   * @param id - Organization ID
   * @param updateOrganizationDto - Update data
   * @returns Updated organization with response wrapper
   */
  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationResponse> {
    this.logger.log(`Updating organization with ID: ${id}`);
    
    try {
      // First, check if organization exists
      await this.findOne(id);
      
      // Validate organization type if it's being updated
      if (updateOrganizationDto.type !== undefined) {
        this.validateOrganizationType(updateOrganizationDto.type, updateOrganizationDto.is_currently_hiring);
      }

      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .update(updateOrganizationDto)
        .eq(COLUMNS.ID, id)
        .select(QUERY.SELECT_ALL)
        .single();

      if (error) {
        this.logger.error(`Failed to update organization: ${error.message}`, error);
        this.handleDatabaseError(error);
      }

      this.logger.log(`Organization updated successfully with ID: ${id}`);
      
      return this.formatOrganizationResponse(
        data as OrganizationEntity,
        MESSAGES.ORGANIZATION_UPDATED
      );
    } catch (error) {
      this.logger.error(`Error updating organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Deactivate an organization (Phase 6 - Task 6.1)
   * @param id - Organization ID
   * @returns Success message
   */
  async deactivateOrganization(id: string): Promise<OrganizationResponse> {
    this.logger.log(`Deactivating organization with ID: ${id}`);
    
    try {
      // First, check if organization exists and is currently active
      const organization = await this.findOne(id);
      
      if (!organization.data.is_active) {
        throw new ConflictException('Organization is already inactive');
      }

      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .update({ [COLUMNS.IS_ACTIVE]: false })
        .eq(COLUMNS.ID, id)
        .select(QUERY.SELECT_ALL)
        .single();

      if (error) {
        this.logger.error(`Failed to deactivate organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to deactivate organization: ${error.message}`);
      }

      this.logger.log(`Organization deactivated successfully with ID: ${id}`);
      
      return this.formatOrganizationResponse(
        data as OrganizationEntity,
        MESSAGES.ORGANIZATION_DEACTIVATED
      );
    } catch (error) {
      this.logger.error(`Error deactivating organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Reactivate an organization (Phase 6 - Task 6.2)
   * @param id - Organization ID
   * @returns Success message
   */
  async activateOrganization(id: string): Promise<OrganizationResponse> {
    this.logger.log(`Reactivating organization with ID: ${id}`);
    
    try {
      // First, check if organization exists and is currently inactive
      const organization = await this.findOne(id);
      
      if (organization.data.is_active) {
        throw new ConflictException('Organization is already active');
      }

      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .update({ [COLUMNS.IS_ACTIVE]: true })
        .eq(COLUMNS.ID, id)
        .select(QUERY.SELECT_ALL)
        .single();

      if (error) {
        this.logger.error(`Failed to reactivate organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to reactivate organization: ${error.message}`);
      }

      this.logger.log(`Organization reactivated successfully with ID: ${id}`);
      
      return this.formatOrganizationResponse(
        data as OrganizationEntity,
        MESSAGES.ORGANIZATION_ACTIVATED
      );
    } catch (error) {
      this.logger.error(`Error reactivating organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Delete an organization permanently (Phase 7 - Task 7.1)
   * ⚠️ WARNING: This permanently deletes the organization and cannot be undone!
   * @param id - Organization ID
   * @returns Success message with warning
   */
  async remove(id: string): Promise<{ statusCode: number; success: boolean; message: string }> {
    this.logger.log(`⚠️ PERMANENTLY DELETING organization with ID: ${id}`);
    
    try {
      // First, check if organization exists
      await this.findOne(id);
      
      // Check if organization has any users
      const { data: organizationUsers, error: usersError } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .select(COLUMNS.ID)
        .eq(COLUMNS.ORG_ID, id)
        .limit(1);

      if (usersError) {
        this.logger.error(`Failed to check organization users: ${usersError.message}`, usersError);
        throw new BadRequestException(`Failed to check organization users: ${usersError.message}`);
      }

      if (organizationUsers && organizationUsers.length > 0) {
        this.logger.warn(`Attempted to delete organization with users: ${id}`);
        throw new ConflictException(MESSAGES.ORGANIZATION_HAS_USERS);
      }

      // Perform hard delete
      const { error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATIONS)
        .delete()
        .eq(COLUMNS.ID, id);

      if (error) {
        this.logger.error(`Failed to delete organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to delete organization: ${error.message}`);
      }

      this.logger.log(`⚠️ Organization PERMANENTLY DELETED with ID: ${id}`);
      
      return this.formatSimpleResponse('⚠️ Organization permanently deleted - THIS ACTION CANNOT BE UNDONE');
    } catch (error) {
      this.logger.error(`Error deleting organization: ${error.message}`, error);
      throw error;
    }
  }
  
  //#endregion

  //#region ==================== USER MANAGEMENT ====================
  
  // User management operations will be implemented in Phase 8-10
  
  //#endregion

  //#region ==================== VALIDATION HELPERS ====================
  
  /**
   * Validate organization type and hiring flag consistency
   * @param type - Organization type
   * @param isCurrentlyHiring - Hiring flag
   */
  private validateOrganizationType(type: ORGANIZATION_TYPES, isCurrentlyHiring?: boolean): void {
    if (type === ORGANIZATION_TYPES.HIRING && isCurrentlyHiring === undefined) {
      throw new BadRequestException(MESSAGES.HIRING_ORG_REQUIRES_HIRING_FLAG);
    }
    
    if (type === ORGANIZATION_TYPES.TRAINING && isCurrentlyHiring !== undefined) {
      throw new BadRequestException(MESSAGES.TRAINING_ORG_CANNOT_HAVE_HIRING_FLAG);
    }
  }

  /**
   * Handle database errors and convert to appropriate HTTP exceptions
   * @param error - Database error
   */
  private handleDatabaseError(error: any): never {
    if (error.code === DB_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
      if (error.message.includes('organizations_code_key')) {
        throw new ConflictException(MESSAGES.ORGANIZATION_CODE_EXISTS);
      }
      if (error.message.includes('organizations_org_name_key')) {
        throw new ConflictException(MESSAGES.ORGANIZATION_NAME_EXISTS);
      }
      throw new ConflictException('Organization already exists with this data');
    }
    
    throw new BadRequestException(`Database operation failed: ${error.message}`);
  }

  //#endregion

  //#region ==================== RESPONSE HELPERS ====================
  
  /**
   * Format organization response
   */
  private formatOrganizationResponse(data: OrganizationEntity, message: string, statusCode: number = 200): OrganizationResponse {
    return {
      statusCode,
      success: true,
      message,
      data
    };
  }

  /**
   * Format paginated organizations response
   */
  private formatPaginatedResponse(
    organizations: OrganizationEntity[],
    total: number,
    page: number,
    limit: number,
    message: string
  ): PaginatedOrganizationsResponse {
    const totalPages = Math.ceil(total / limit);
    return {
      statusCode: 200,
      success: true,
      message,
      data: {
        organizations,
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Format simple success response
   */
  private formatSimpleResponse(message: string): { statusCode: number; success: boolean; message: string } {
    return {
      statusCode: 200,
      success: true,
      message
    };
  }
  
  //#endregion

  //#region ==================== USER MANAGEMENT OPERATIONS ====================

  /**
   * Add a user to an organization
   * @param orgId - Organization ID
   * @param email - User email to look up and add
   * @returns User-organization relationship with response wrapper
   */
  async addUserToOrganization(orgId: string, email: string): Promise<any> {
    this.logger.log(`Adding user with email ${email} to organization ${orgId}`);
    
    try {
      // Validate organization exists and is active
      await this.validateOrganizationExists(orgId);
      
      // Convert email to user ID
      const emailToUserIdMap = await this.getEmailToUserIdMap([email]);
      const userId = emailToUserIdMap.get(email);
      
      if (!userId) {
        this.logger.error(`User not found with email: ${email}`);
        throw new NotFoundException('User not found with the provided email address');
      }
      
      // Validate user exists
      await this.validateUsersExist([userId]);
      
      // Validate user is not in any organization
      await this.validateUserNotInAnyOrganization(userId);
      
      // Add user to organization with is_active = true (Task 9.1)
      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .insert([{
          [COLUMNS.ORG_ID]: orgId,
          [COLUMNS.USER_ID]: userId,
          [COLUMNS.IS_ACTIVE]: true
        }])
        .select('*, created_at')
        .single();

      if (error) {
        this.logger.error(`Failed to add user to organization: ${error.message}`, error);
        this.handleDatabaseError(error);
      }

      this.logger.log(`User ${userId} (${email}) added to organization ${orgId} successfully`);
      
      return {
        statusCode: 201,
        success: true,
        message: MESSAGES.USER_ADDED_TO_ORGANIZATION,
        data: {
          user_id: data[COLUMNS.USER_ID],
          organization_id: data[COLUMNS.ORG_ID],
          is_active: data[COLUMNS.IS_ACTIVE],
          created_at: data[COLUMNS.CREATED_AT]
        }
      };
    } catch (error) {
      this.logger.error(`Error adding user to organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Remove a user from an organization (permanent removal)
   * @param orgId - Organization ID
   * @param userId - User ID to remove
   * @returns Success message with warning
   */
  async removeUserFromOrganization(orgId: string, userId: string): Promise<any> {
    this.logger.log(`Removing user ${userId} from organization ${orgId} (permanent removal)`);
    
    try {
      // Validate user is in the specified organization
      await this.validateUserInOrganization(orgId, userId);
      
      // Permanently remove user from organization
      const { error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .delete()
        .eq(COLUMNS.ORG_ID, orgId)
        .eq(COLUMNS.USER_ID, userId);

      if (error) {
        this.logger.error(`Failed to remove user from organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to remove user from organization: ${error.message}`);
      }

      this.logger.log(`User ${userId} removed from organization ${orgId} permanently`);
      
      return {
        statusCode: 200,
        success: true,
        message: `${MESSAGES.USER_REMOVED_FROM_ORGANIZATION} - Warning: This is a permanent removal.`
      };
    } catch (error) {
      this.logger.error(`Error removing user from organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Deactivate a user in an organization
   * @param orgId - Organization ID
   * @param userId - User ID to deactivate
   * @param reason - Optional reason for deactivation
   * @returns Updated user status with response wrapper
   */
  async deactivateUserInOrganization(orgId: string, userId: string, reason?: string): Promise<any> {
    this.logger.log(`Deactivating user ${userId} in organization ${orgId}${reason ? ` with reason: ${reason}` : ''}`);
    
    try {
      // Validate user is in organization and currently active
      await this.validateUserActiveInOrganization(orgId, userId);
      
      // Set is_active to false
      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .update({ 
          [COLUMNS.IS_ACTIVE]: false,
          [COLUMNS.UPDATED_AT]: new Date().toISOString()
        })
        .eq(COLUMNS.ORG_ID, orgId)
        .eq(COLUMNS.USER_ID, userId)
        .select('*, updated_at')
        .single();

      if (error) {
        this.logger.error(`Failed to deactivate user in organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to deactivate user in organization: ${error.message}`);
      }

      this.logger.log(`User ${userId} deactivated in organization ${orgId} successfully`);
      
      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.USER_DEACTIVATED_IN_ORGANIZATION,
        data: {
          user_id: data[COLUMNS.USER_ID],
          organization_id: data[COLUMNS.ORG_ID],
          is_active: data[COLUMNS.IS_ACTIVE],
          updated_at: data[COLUMNS.UPDATED_AT]
        }
      };
    } catch (error) {
      this.logger.error(`Error deactivating user in organization: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Reactivate a user in an organization
   * @param orgId - Organization ID
   * @param userId - User ID to reactivate
   * @param reason - Optional reason for reactivation
   * @returns Updated user status with response wrapper
   */
  async activateUserInOrganization(orgId: string, userId: string, reason?: string): Promise<any> {
    this.logger.log(`Reactivating user ${userId} in organization ${orgId}${reason ? ` with reason: ${reason}` : ''}`);
    
    try {
      // Validate user is in organization and currently inactive
      await this.validateUserInactiveInOrganization(orgId, userId);
      
      // Set is_active to true
      const { data, error } = await this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .update({ 
          [COLUMNS.IS_ACTIVE]: true,
          [COLUMNS.UPDATED_AT]: new Date().toISOString()
        })
        .eq(COLUMNS.ORG_ID, orgId)
        .eq(COLUMNS.USER_ID, userId)
        .select('*, updated_at')
        .single();

      if (error) {
        this.logger.error(`Failed to reactivate user in organization: ${error.message}`, error);
        throw new BadRequestException(`Failed to reactivate user in organization: ${error.message}`);
      }

      this.logger.log(`User ${userId} reactivated in organization ${orgId} successfully`);
      
      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.USER_ACTIVATED_IN_ORGANIZATION,
        data: {
          user_id: data[COLUMNS.USER_ID],
          organization_id: data[COLUMNS.ORG_ID],
          is_active: data[COLUMNS.IS_ACTIVE],
          updated_at: data[COLUMNS.UPDATED_AT]
        }
      };
    } catch (error) {
      this.logger.error(`Error reactivating user in organization: ${error.message}`, error);
      throw error;
    }
  }

  //#endregion

  //#region ==================== BULK USER OPERATIONS ====================

  /**
   * Bulk add users to an organization
   * @param orgId - Organization ID
   * @param emails - Array of user emails to add
   * @returns Bulk operation response with success/failure counts and details
   */
  async bulkAddUsers(orgId: string, emails: string[]): Promise<any> {
    this.logger.log(`Bulk adding users to organization ${orgId}. Total emails: ${emails.length}`);

    // Initialize result trackers
    const failedUsers: { email: string; reason: string }[] = [];
    let successful = 0;

    try {
      // Validate organization exists & is active
      await this.validateOrganizationExists(orgId, true);

      // Convert emails to user IDs
      const emailToUserIdMap = await this.getEmailToUserIdMap(emails);

      // Iterate through each email and attempt to add
      for (const email of emails) {
        try {
          const userId = emailToUserIdMap.get(email);
          
          if (!userId) {
            failedUsers.push({ email, reason: 'User not found with this email' });
            continue;
          }

          // Ensure user is not already in any organization
          await this.validateUserNotInAnyOrganization(userId);

          const { error } = await this.supabaseService.getClient()
            .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
            .insert({
              [COLUMNS.ORG_ID]: orgId,
              [COLUMNS.USER_ID]: userId,
              [COLUMNS.IS_ACTIVE]: true,
            });

          if (error) {
            this.logger.warn(`Failed to add user ${email}: ${error.message}`);
            failedUsers.push({ email, reason: error.message });
            continue;
          }

          successful += 1;
        } catch (innerErr) {
          const reason = (innerErr as Error).message;
          this.logger.warn(`Validation failed for user ${email}: ${reason}`);
          failedUsers.push({ email, reason });
        }
      }

      const response = {
        statusCode: 200,
        success: true,
        message: MESSAGES.BULK_ADD_USERS_COMPLETED,
        data: {
          total_attempted: emails.length,
          successful,
          failed: failedUsers.length,
          failed_users: failedUsers,
        },
      };

      return response;
    } catch (error) {
      this.logger.error(`Error during bulk add users: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Bulk remove users from an organization (permanent delete)
   * @param orgId - Organization ID
   * @param emails - Array of user emails to remove
   */
  async bulkRemoveUsers(orgId: string, emails: string[]): Promise<any> {
    this.logger.log(`Bulk removing users from organization ${orgId}. Total emails: ${emails.length}`);

    const failedUsers: { email: string; reason: string }[] = [];
    let successful = 0;

    try {
      // Validate organization exists (active/inactive both allowed since we are deleting relation)
      await this.validateOrganizationExists(orgId, false);

      // Convert emails to user IDs
      const emailToUserIdMap = await this.getEmailToUserIdMap(emails);

      for (const email of emails) {
        try {
          const userId = emailToUserIdMap.get(email);
          
          if (!userId) {
            failedUsers.push({ email, reason: 'User not found with this email' });
            continue;
          }

          // Ensure user is in organization
          await this.validateUserInOrganization(orgId, userId);

          const { error } = await this.supabaseService.getClient()
            .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
            .delete()
            .eq(COLUMNS.ORG_ID, orgId)
            .eq(COLUMNS.USER_ID, userId);

          if (error) {
            this.logger.warn(`Failed to remove user ${email}: ${error.message}`);
            failedUsers.push({ email, reason: error.message });
            continue;
          }

          successful += 1;
        } catch (innerErr) {
          const reason = (innerErr as Error).message;
          this.logger.warn(`Cannot remove user ${email}: ${reason}`);
          failedUsers.push({ email, reason });
        }
      }

      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.BULK_REMOVE_USERS_COMPLETED,
        data: {
          total_attempted: emails.length,
          successful,
          failed: failedUsers.length,
          failed_users: failedUsers,
        },
      };
    } catch (error) {
      this.logger.error(`Error during bulk remove users: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Bulk deactivate users in an organization
   */
  async bulkDeactivateUsers(orgId: string, emails: string[]): Promise<any> {
    this.logger.log(`Bulk deactivating users in organization ${orgId}. Total emails: ${emails.length}`);

    const failedUsers: { email: string; reason: string }[] = [];
    let successful = 0;

    try {
      await this.validateOrganizationExists(orgId, true);
      
      // Convert emails to user IDs
      const emailToUserIdMap = await this.getEmailToUserIdMap(emails);

      for (const email of emails) {
        try {
          const userId = emailToUserIdMap.get(email);
          
          if (!userId) {
            failedUsers.push({ email, reason: 'User not found with this email' });
            continue;
          }

          // Ensure user active in org
          await this.validateUserActiveInOrganization(orgId, userId);

          const { error } = await this.supabaseService.getClient()
            .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
            .update({ [COLUMNS.IS_ACTIVE]: false, [COLUMNS.UPDATED_AT]: new Date().toISOString() })
            .eq(COLUMNS.ORG_ID, orgId)
            .eq(COLUMNS.USER_ID, userId);

          if (error) {
            failedUsers.push({ email, reason: error.message });
            continue;
          }

          successful += 1;
        } catch (innerErr) {
          failedUsers.push({ email, reason: (innerErr as Error).message });
        }
      }

      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.BULK_OPERATION_COMPLETED,
        data: {
          total_attempted: emails.length,
          successful,
          failed: failedUsers.length,
          failed_users: failedUsers,
        },
      };
    } catch (error) {
      this.logger.error(`Error during bulk deactivate users: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Bulk reactivate users in an organization
   */
  async bulkActivateUsers(orgId: string, emails: string[]): Promise<any> {
    this.logger.log(`Bulk reactivating users in organization ${orgId}. Total emails: ${emails.length}`);

    const failedUsers: { email: string; reason: string }[] = [];
    let successful = 0;

    try {
      await this.validateOrganizationExists(orgId, true);
      
      // Convert emails to user IDs
      const emailToUserIdMap = await this.getEmailToUserIdMap(emails);

      for (const email of emails) {
        try {
          const userId = emailToUserIdMap.get(email);
          
          if (!userId) {
            failedUsers.push({ email, reason: 'User not found with this email' });
            continue;
          }

          // Ensure user inactive in org
          await this.validateUserInactiveInOrganization(orgId, userId);

          const { error } = await this.supabaseService.getClient()
            .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
            .update({ [COLUMNS.IS_ACTIVE]: true, [COLUMNS.UPDATED_AT]: new Date().toISOString() })
            .eq(COLUMNS.ORG_ID, orgId)
            .eq(COLUMNS.USER_ID, userId);

          if (error) {
            failedUsers.push({ email, reason: error.message });
            continue;
          }

          successful += 1;
        } catch (innerErr) {
          failedUsers.push({ email, reason: (innerErr as Error).message });
        }
      }

      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.BULK_OPERATION_COMPLETED,
        data: {
          total_attempted: emails.length,
          successful,
          failed: failedUsers.length,
          failed_users: failedUsers,
        },
      };
    } catch (error) {
      this.logger.error(`Error during bulk activate users: ${error.message}`, error);
      throw error;
    }
  }

  //#endregion

  //#region ==================== GET ORGANIZATION USERS ====================

  /**
   * Get all users in an organization with pagination and status filtering
   * @param orgId - Organization ID
   * @param queryDto - Query parameters for filtering and pagination
   * @returns Paginated list of organization users
   */
  async getOrganizationUsers(orgId: string, queryDto: GetOrgUsersQueryDto): Promise<any> {
    this.logger.log(`Fetching users for organization ${orgId} with filters: ${JSON.stringify(queryDto)}`);
    
    try {
      // Validate organization exists
      await this.validateOrganizationExists(orgId, false); // Allow inactive orgs for authorized users
      
      const { page = 1, limit = 10, search, status = 'active', sort_by = 'created_at', sort_order = 'asc' } = queryDto;
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Build query with proper joins
      let query = this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .select(`
          users!inner(id, email, first_name, last_name, role, is_active, created_at, updated_at),
          is_active,
          created_at
        `, { count: 'exact' })
        .eq(COLUMNS.ORG_ID, orgId);

      // Apply status filtering (default to active only)
      if (status === 'active') {
        query = query.eq(COLUMNS.IS_ACTIVE, true);
      } else if (status === 'inactive') {
        query = query.eq(COLUMNS.IS_ACTIVE, false);
      }
      // 'all' status shows both active and inactive users

      // Apply search filter
      if (search) {
        query = query.or(`users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%,users.email.ilike.%${search}%`);
      }

      // Apply sorting and pagination
      const sortField = sort_by === 'first_name' || sort_by === 'last_name' || sort_by === 'email' 
        ? `users.${sort_by}` 
        : sort_by === 'created_at' 
        ? 'created_at' 
        : 'users.created_at';
        
      query = query
        .order(sortField, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        this.logger.error(`Failed to fetch organization users: ${error.message}`, error);
        throw new BadRequestException(`Failed to fetch organization users: ${error.message}`);
      }

      // Transform the data to flatten user information
      const transformedData = data?.map((item: any) => ({
        id: item.users.id,
        email: item.users.email,
        first_name: item.users.first_name,
        last_name: item.users.last_name,
        role: item.users.role,
        user_is_active: item.users.is_active,
        organization_membership_active: item.is_active,
        joined_at: item.created_at,
        user_created_at: item.users.created_at,
        user_updated_at: item.users.updated_at
      })) || [];

      this.logger.log(`Retrieved ${transformedData.length} users out of ${count || 0} total for organization ${orgId}`);

      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.ORGANIZATION_USERS_RETRIEVED || 'Organization users retrieved successfully',
        data: {
          users: transformedData,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Error fetching organization users: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get all organization users (simple version without pagination or filtering)
   * @param orgId - Organization ID
   * @returns List of all users in the organization
   */
  async getOrganizationUsersSimple(orgId: string): Promise<any> {
    this.logger.log(`Fetching all users for organization ${orgId}`);
    
    try {
      // Validate organization exists
      await this.validateOrganizationExists(orgId, false); // Allow inactive orgs for authorized users
      

      
      // Build query with proper joins - no filtering, get all users
      const query = this.supabaseService.getClient()
        .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
        .select(`
          users!inner(id, email, first_name, last_name, preferred_name, phone, is_active, created_at),
          organization_membership_active:is_active,
          created_at
        `)
        .eq(COLUMNS.ORG_ID, orgId)
        .order('created_at', { ascending: false }); // Sort by join date (most recent first)

      const { data, error } = await query;

      if (error) {
        this.logger.error(`Failed to fetch organization users: ${error.message}`, error);
        throw new BadRequestException(`Failed to fetch organization users: ${error.message}`);
      }

      // Transform the data to flatten user information - simplified format to match documentation
      const transformedData = data?.map((item: any) => {
        return {
          id: item.users.id,
          email: item.users.email,
          first_name: item.users.first_name,
          last_name: item.users.last_name,
          preferred_name: item.users.preferred_name,
          phone: item.users.phone,
          is_active: item.organization_membership_active,  // Use organization membership status
          created_at: item.users.created_at
        };
      }) || [];

      this.logger.log(`Retrieved ${transformedData.length} users for organization ${orgId}`);

      return {
        statusCode: 200,
        success: true,
        message: MESSAGES.ORGANIZATION_USERS_RETRIEVED || 'Organization users retrieved successfully',
        data: transformedData
      };
    } catch (error) {
      this.logger.error(`Error fetching organization users: ${error.message}`, error);
      throw error;
    }
  }

  //#endregion

  //#region ==================== DEBUG HELPERS ====================



  //#endregion

  //#region ==================== VALIDATION HELPERS ====================

  /**
   * Helper method to convert emails to user IDs
   * @param emails - Array of email addresses
   * @returns Map of email to user ID
   */
  private async getEmailToUserIdMap(emails: string[]): Promise<Map<string, string>> {
    const { data, error } = await this.supabaseService.getClient()
      .from(TABLES.USERS)
      .select(`${COLUMNS.ID}, ${COLUMNS.EMAIL}`)
      .in(COLUMNS.EMAIL, emails);

    if (error) {
      throw new BadRequestException(`Failed to fetch users by emails: ${error.message}`);
    }

    const emailToUserIdMap = new Map<string, string>();
    data?.forEach(user => {
      emailToUserIdMap.set(user.email, user.id);
    });

    return emailToUserIdMap;
  }

  /**
   * Validate that user is not in any organization
   * @param userId - User ID to validate
   * @throws ConflictException if user is already in an organization
   */
  private async validateUserNotInAnyOrganization(userId: string): Promise<void> {
    const { data, error } = await this.supabaseService.getClient()
      .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
      .select(COLUMNS.ORG_ID)
      .eq(COLUMNS.USER_ID, userId)
      .single();

    if (data) {
      throw new ConflictException('User is already assigned to an organization');
    }
    
    // No rows returned is expected (user not in any organization)
    if (error && error.code !== DB_ERROR_CODES.NO_ROWS_RETURNED) {
      throw new BadRequestException(`Failed to validate user status: ${error.message}`);
    }
  }

  /**
   * Validate that user is in the specified organization
   * @param orgId - Organization ID
   * @param userId - User ID to validate
   * @throws NotFoundException if user is not in the organization
   */
  private async validateUserInOrganization(orgId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabaseService.getClient()
      .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
      .select(COLUMNS.ID)
      .eq(COLUMNS.ORG_ID, orgId)
      .eq(COLUMNS.USER_ID, userId)
      .single();

    if (error) {
      if (error.code === DB_ERROR_CODES.NO_ROWS_RETURNED) {
        throw new NotFoundException('User is not assigned to this organization');
      }
      throw new BadRequestException(`Failed to validate user organization assignment: ${error.message}`);
    }
  }

  /**
   * Validate that organization exists and optionally check if it's active
   * @param orgId - Organization ID
   * @param requireActive - Whether to require organization to be active (default: true)
   * @throws NotFoundException if organization doesn't exist or is inactive when required
   */
  private async validateOrganizationExists(orgId: string, requireActive: boolean = true): Promise<void> {
    const { data, error } = await this.supabaseService.getClient()
      .from(ORGANIZATION_TABLES.ORGANIZATIONS)
      .select(`${COLUMNS.ID}, ${COLUMNS.IS_ACTIVE}`)
      .eq(COLUMNS.ID, orgId)
      .single();

    if (error) {
      if (error.code === DB_ERROR_CODES.NO_ROWS_RETURNED) {
        throw new NotFoundException(MESSAGES.ORGANIZATION_NOT_FOUND);
      }
      throw new BadRequestException(`Failed to validate organization: ${error.message}`);
    }

    if (requireActive && !data.is_active) {
      throw new BadRequestException('Organization is not active');
    }
  }

  /**
   * Validate that users exist
   * @param userIds - Array of user IDs to validate
   * @throws NotFoundException if any user doesn't exist
   */
  private async validateUsersExist(userIds: string[]): Promise<void> {
    const { data, error } = await this.supabaseService.getClient()
      .from(TABLES.USERS)
      .select(COLUMNS.ID)
      .in(COLUMNS.ID, userIds);

    if (error) {
      throw new BadRequestException(`Failed to validate users: ${error.message}`);
    }

    if (!data || data.length !== userIds.length) {
      const foundIds = data?.map(user => user.id) || [];
      const missingIds = userIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Users not found: ${missingIds.join(', ')}`);
    }
  }

  /**
   * Validate that user is active in the organization
   * @param orgId - Organization ID
   * @param userId - User ID to validate
   * @throws NotFoundException if user is not in organization or BadRequestException if user is inactive
   */
  private async validateUserActiveInOrganization(orgId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabaseService.getClient()
      .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
      .select(COLUMNS.IS_ACTIVE)
      .eq(COLUMNS.ORG_ID, orgId)
      .eq(COLUMNS.USER_ID, userId)
      .single();

    if (error) {
      if (error.code === DB_ERROR_CODES.NO_ROWS_RETURNED) {
        throw new NotFoundException('User is not assigned to this organization');
      }
      throw new BadRequestException(`Failed to validate user status: ${error.message}`);
    }

    if (!data.is_active) {
      throw new BadRequestException('User is already inactive in this organization');
    }
  }

  /**
   * Validate that user is inactive in the organization
   * @param orgId - Organization ID
   * @param userId - User ID to validate
   * @throws NotFoundException if user is not in organization or BadRequestException if user is active
   */
  private async validateUserInactiveInOrganization(orgId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabaseService.getClient()
      .from(ORGANIZATION_TABLES.ORGANIZATION_USERS)
      .select(COLUMNS.IS_ACTIVE)
      .eq(COLUMNS.ORG_ID, orgId)
      .eq(COLUMNS.USER_ID, userId)
      .single();

    if (error) {
      if (error.code === DB_ERROR_CODES.NO_ROWS_RETURNED) {
        throw new NotFoundException('User is not assigned to this organization');
      }
      throw new BadRequestException(`Failed to validate user status: ${error.message}`);
    }

    if (data.is_active) {
      throw new BadRequestException('User is already active in this organization');
    }
  }

  //#endregion
} 