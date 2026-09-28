import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { GetOrganizationsQueryDto } from './dto/get-organizations-query.dto';
import { GetOrgUsersQueryDto } from './dto/get-org-users-query.dto';
import { AddUserToOrgDto } from './dto/add-user-to-org.dto';
import { 
  DeactivateUserInOrgDto, 
  ActivateUserInOrgDto 
} from './dto/user-status.dto';
import {
  BulkAddUsersDto,
  BulkRemoveUsersDto,
  BulkDeactivateUsersDto,
  BulkActivateUsersDto,
  BulkOperationResponseDto,
} from './dto/bulk-user-operations.dto';
import { 
  OrganizationResponse, 
  PaginatedOrganizationsResponse,
  OrganizationEntity 
} from '../../common/types/organization.types';
import { USER_ROLES, HTTP_STATUS } from '../../common/helpers/string-const';

@ApiTags('organizations')
@Controller('organizations')
// @UseGuards(SupabaseAuthGuard, RolesGuard)
@UseGuards(SupabaseAuthGuard)
// @ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  //#region ==================== ORGANIZATION CRUD ====================
  
  @Post()
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create organization',
    description: 'Creates a new organization with validation for organization type and required fields'
  })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: 'Organization created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organization created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            org_name: { type: 'string', example: 'TechCorp Solutions' },
            code: { type: 'string', example: 'TECH001' },
            type: { type: 'string', enum: ['hiring', 'training'] },
            website: { type: 'string', example: 'https://techcorp.com' },
            industry: { type: 'string', example: 'Technology' },
            address_line1: { type: 'string', example: '123 Main Street' },
            address_line2: { type: 'string', example: 'Suite 200' },
            city: { type: 'string', example: 'New York' },
            state_province: { type: 'string', example: 'NY' },
            postal_code: { type: 'string', example: '10001' },
            country: { type: 'string', example: 'US' },
            logo_url: { type: 'string', example: 'https://techcorp.com/logo.png' },
            description: { type: 'string', example: 'Leading technology solutions provider' },
            is_currently_hiring: { type: 'boolean', example: true },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Validation failed or invalid organization type configuration'
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Organization code or name already exists'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponse> {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Get all organizations (simple)',
    description: 'Retrieves a simple list of all active organizations without pagination or filtering'
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'All organizations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organizations retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              org_name: { type: 'string', example: 'TechCorp Solutions' },
              code: { type: 'string', example: 'TECH001' },
              type: { type: 'string', enum: ['hiring', 'training'] },
              website: { type: 'string', example: 'https://techcorp.com' },
              industry: { type: 'string', example: 'Technology' },
              is_active: { type: 'boolean', example: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async findAllSimple(): Promise<{ statusCode: number; success: boolean; message: string; data: OrganizationEntity[] }> {
    return this.organizationsService.findAllSimple();
  }

  @Get('pagination')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Get all organizations (with pagination - DEPRECATED)',
    description: '⚠️ DEPRECATED: This endpoint is deprecated. Use GET /organizations instead. Retrieves a paginated list of organizations with basic filtering and search capabilities. Shows active organizations by default. Advanced filtering implementation is pending.',
    deprecated: true
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by organization name or code' })
  @ApiQuery({ name: 'type', required: false, enum: ['hiring', 'training'], description: 'Filter by organization type' })
  @ApiQuery({ name: 'industry', required: false, type: String, description: 'Filter by industry sector' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country code' })
  @ApiQuery({ name: 'is_currently_hiring', required: false, type: Boolean, description: 'Filter by hiring status' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'all'], description: 'Filter by organization status (default: active)' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['org_name', 'code', 'type', 'created_at', 'updated_at'], description: 'Sort field (default: created_at)' })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Organizations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organizations retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            organizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  org_name: { type: 'string', example: 'TechCorp Solutions' },
                  code: { type: 'string', example: 'TECH001' },
                  type: { type: 'string', enum: ['hiring', 'training'] },
                  website: { type: 'string', example: 'https://techcorp.com' },
                  industry: { type: 'string', example: 'Technology' },
                  is_active: { type: 'boolean', example: true },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            },
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async findAll(@Query() queryDto: GetOrganizationsQueryDto): Promise<PaginatedOrganizationsResponse> {
    return this.organizationsService.findAll(queryDto);
  }

  @Get(':id')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Get organization by ID',
    description: 'Retrieves a specific organization by its unique identifier'
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Organization ID' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Organization retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Success' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            org_name: { type: 'string', example: 'TechCorp Solutions' },
            code: { type: 'string', example: 'TECH001' },
            type: { type: 'string', enum: ['hiring', 'training'] },
            website: { type: 'string', example: 'https://techcorp.com' },
            industry: { type: 'string', example: 'Technology' },
            address_line1: { type: 'string', example: '123 Main Street' },
            address_line2: { type: 'string', example: 'Suite 200' },
            city: { type: 'string', example: 'New York' },
            state_province: { type: 'string', example: 'NY' },
            postal_code: { type: 'string', example: '10001' },
            country: { type: 'string', example: 'US' },
            logo_url: { type: 'string', example: 'https://techcorp.com/logo.png' },
            description: { type: 'string', example: 'Leading technology solutions provider' },
            is_currently_hiring: { type: 'boolean', example: true },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrganizationResponse> {
    return this.organizationsService.findOne(id);
  }

  @Put(':id')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Update organization',
    description: 'Updates an existing organization with validation for organization type and required fields'
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Organization ID' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Organization updated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organization updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            org_name: { type: 'string', example: 'TechCorp Solutions Updated' },
            code: { type: 'string', example: 'TECH001' },
            type: { type: 'string', enum: ['hiring', 'training'] },
            website: { type: 'string', example: 'https://techcorp.com' },
            industry: { type: 'string', example: 'Technology' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Validation failed or invalid organization type configuration'
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found'
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Organization code or name already exists'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ): Promise<OrganizationResponse> {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  //#endregion

  //#region ==================== ORGANIZATION STATUS MANAGEMENT ====================

  /**
   * Deactivate an organization (Phase 6 - Task 6.1)
   * @param id - Organization ID
   * @returns Updated organization data
   */
  @Patch(':id/deactivate')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Deactivate organization',
    description: 'Deactivate an organization by setting is_active to false. This is a soft deactivation that preserves data.' 
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Organization deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organization deactivated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            org_name: { type: 'string', example: 'TechCorp Solutions' },
            code: { type: 'string', example: 'TECH001' },
            type: { type: 'string', enum: ['hiring', 'training'] },
            is_active: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Organization is already inactive',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<OrganizationResponse> {
    return await this.organizationsService.deactivateOrganization(id);
  }

  /**
   * Reactivate an organization (Phase 6 - Task 6.2)
   * @param id - Organization ID
   * @returns Updated organization data
   */
  @Patch(':id/activate')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Reactivate organization',
    description: 'Reactivate an organization by setting is_active to true. This restores the organization to active status.' 
  })
  @ApiParam({
    name: 'id',
    description: 'Organization ID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Organization reactivated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organization activated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            org_name: { type: 'string', example: 'TechCorp Solutions' },
            code: { type: 'string', example: 'TECH001' },
            type: { type: 'string', enum: ['hiring', 'training'] },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Organization is already active',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<OrganizationResponse> {
    return await this.organizationsService.activateOrganization(id);
  }

  //#endregion

  //#region ==================== ORGANIZATION DELETION ====================

  /**
   * Delete an organization permanently (Phase 7 - Task 7.1)
   * ⚠️ WARNING: This permanently deletes the organization and cannot be undone!
   * @param id - Organization ID
   * @returns Success message with warning
   */
  @Delete(':id')
  // @Roles(USER_ROLES.SUPER_ADMIN) // Only Super Admin can permanently delete
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '⚠️ PERMANENTLY DELETE organization',
    description: `⚠️ DANGER: This PERMANENTLY DELETES the organization from the database. 
    This action CANNOT be undone and will remove all organization data.
    
    For safer deactivation that preserves data, use the PATCH /api/organizations/:id/deactivate endpoint instead.
    
    ⚠️ ONLY Super Admins can perform this operation.` 
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Organization ID' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: '⚠️ Organization permanently deleted - THIS ACTION CANNOT BE UNDONE',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '⚠️ Organization permanently deleted - THIS ACTION CANNOT BE UNDONE' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found'
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Cannot delete organization with existing users'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Super Admin access required'
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ statusCode: number; success: boolean; message: string }> {
    return this.organizationsService.remove(id);
  }
  
  //#endregion

  //#region ==================== ORGANIZATION-USER MANAGEMENT ====================

  /**
   * Add user to organization (Phase 9 - Task 9.1)
   * @param id - Organization ID
   * @param addUserDto - User data to add
   * @returns User-organization relationship data
   */
  @Post(':id/users')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Add user to organization',
    description: 'Adds a user to an organization using their email address. The user will be looked up by email and added with active status. User must not be assigned to any other organization.'
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: 'User added to organization successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User added to organization successfully' },
        data: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            organization_id: { type: 'string', format: 'uuid' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Validation failed or organization is not active'
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not found with the provided email address or organization not found'
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'User is already assigned to an organization'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async addUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addUserDto: AddUserToOrgDto
  ): Promise<any> {
    return this.organizationsService.addUserToOrganization(id, addUserDto.email);
  }

  /**
   * Remove user from organization permanently (Phase 9 - Task 9.2)
   * ⚠️ WARNING: This permanently removes the user-organization relationship!
   * @param id - Organization ID
   * @param userId - User ID to remove
   * @returns Success message with warning
   */
  @Delete(':id/users/:userId')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '⚠️ Remove user from organization (PERMANENT)',
    description: `⚠️ WARNING: This PERMANENTLY removes a user from an organization. 
    This action CANNOT be undone. The user-organization relationship will be deleted forever.
    
    For reversible deactivation, use the PATCH /api/organizations/:id/users/:userId/deactivate endpoint instead.`
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'userId', description: 'User ID to remove', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: '⚠️ User permanently removed from organization - THIS ACTION CANNOT BE UNDONE',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User removed from organization successfully - Warning: This is a permanent removal.' }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not assigned to this organization'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async removeUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<any> {
    return this.organizationsService.removeUserFromOrganization(id, userId);
  }

  /**
   * Deactivate user in organization (Phase 9 - Task 9.3)
   * @param id - Organization ID
   * @param userId - User ID to deactivate
   * @param deactivateDto - Optional reason for deactivation
   * @returns Updated user status data
   */
  @Patch(':id/users/:userId/deactivate')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Deactivate user in organization',
    description: 'Deactivates a user in an organization by setting their status to inactive. This is a reversible action.'
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'userId', description: 'User ID to deactivate', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User deactivated in organization successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User deactivated in organization successfully' },
        data: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            organization_id: { type: 'string', format: 'uuid' },
            is_active: { type: 'boolean', example: false },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not assigned to this organization'
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'User is already inactive in this organization'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() deactivateDto: DeactivateUserInOrgDto
  ): Promise<any> {
    return this.organizationsService.deactivateUserInOrganization(id, userId, deactivateDto?.reason);
  }

  /**
   * Reactivate user in organization (Phase 9 - Task 9.4)
   * @param id - Organization ID
   * @param userId - User ID to reactivate
   * @param activateDto - Optional reason for reactivation
   * @returns Updated user status data
   */
  @Patch(':id/users/:userId/activate')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reactivate user in organization',
    description: 'Reactivates an inactive user in an organization by setting their status to active.'
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'userId', description: 'User ID to reactivate', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User reactivated in organization successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User reactivated in organization successfully' },
        data: {
          type: 'object',
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            organization_id: { type: 'string', format: 'uuid' },
            is_active: { type: 'boolean', example: true },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not assigned to this organization'
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'User is already active in this organization'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() activateDto: ActivateUserInOrgDto
  ): Promise<any> {
    return this.organizationsService.activateUserInOrganization(id, userId, activateDto?.reason);
  }

  //#endregion

  //#region ==================== GET ORGANIZATION USERS (Phase 11) ====================

  /**
   * Get organization users (DEPRECATED - NOT FOR USE NOW)
   * NOTE: This endpoint is currently not for use. Use the simple endpoint instead.
   */
  @Get(':id/users/pagination')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: '🚧 Get organization users (pagination - DEPRECATED)',
    description: '⚠️ DEPRECATED: This endpoint is deprecated. Use GET /organizations/:id/users instead. This pagination-based endpoint will be enabled in a future release.',
    deprecated: true
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by user name or email' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'all'], description: 'Filter by user status in organization (default: active)' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['first_name', 'last_name', 'email', 'created_at'], description: 'Sort field (default: created_at)' })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: asc)' })
  @ApiResponse({
    status: HTTP_STATUS.NOT_IMPLEMENTED,
    description: '⚠️ This endpoint is deprecated and not for use. Use /organizations/:id/users/simple instead.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 501 },
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'This endpoint is deprecated. Please use /organizations/:id/users/simple instead.' }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async getUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() queryDto: GetOrgUsersQueryDto
  ): Promise<any> {
    // Return deprecation notice instead of actual functionality
    return {
      statusCode: 501,
      success: false,
      message: 'This endpoint is deprecated and not for use. Please use /organizations/:id/users/simple instead.'
    };
  }

  /**
   * Get all organization users (simple version)
   */
  @Get(':id/users')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @ApiOperation({ 
    summary: 'Get all organization users (simple)',
    description: 'Retrieves a simple list of all users in an organization without pagination or filtering. Returns all users with their organization membership status in the is_active field.'
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Organization users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Organization users retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '456e7890-e12f-34g5-b678-901234567890' },
              email: { type: 'string', example: 'john.doe@example.com' },
              first_name: { type: 'string', example: 'John' },
              last_name: { type: 'string', example: 'Doe' },
              preferred_name: { type: 'string', nullable: true, example: null },
              phone: { type: 'string', nullable: true, example: '+1234567890' },
              is_active: { type: 'boolean', example: true },
              created_at: { type: 'string', format: 'date-time', example: '2024-01-10T09:15:00.000Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Organization not found'
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Unauthorized - Authentication required'
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Forbidden - Admin access required'
  })
  async getUsersSimple(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<any> {
    return this.organizationsService.getOrganizationUsersSimple(id);
  }



  //#endregion

  //#region ==================== BULK USER OPERATIONS (Phase 10) ====================

  /**
   * Bulk add users to an organization
   * @param id Organization ID
   */
  @Post(':id/users/bulk-add')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Bulk add users', 
    description: 'Adds multiple users to an organization using their email addresses.' 
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Bulk add operation completed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Bulk add users operation completed' },
        data: {
          type: 'object',
          properties: {
            total_attempted: { type: 'number', example: 5 },
            successful: { type: 'number', example: 4 },
            failed: { type: 'number', example: 1 },
            failed_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                  reason: { type: 'string', example: 'User is already in an organization' }
                }
              }
            }
          }
        }
      }
    }
  })
  async bulkAddUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bulkAddDto: BulkAddUsersDto,
  ): Promise<BulkOperationResponseDto> {
    return this.organizationsService.bulkAddUsers(id, bulkAddDto.emails);
  }

  /**
   * Bulk remove users from an organization (PERMANENT)
   */
  @Delete(':id/users/bulk-remove')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '⚠️ Bulk remove users (PERMANENT)', 
    description: 'Permanently removes multiple users from an organization using their email addresses. THIS ACTION CANNOT BE UNDONE.' 
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: '⚠️ Bulk remove operation completed - PERMANENT ACTION',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Bulk remove users operation completed' },
        data: {
          type: 'object',
          properties: {
            total_attempted: { type: 'number', example: 5 },
            successful: { type: 'number', example: 4 },
            failed: { type: 'number', example: 1 },
            failed_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                  reason: { type: 'string', example: 'User not found with this email' }
                }
              }
            }
          }
        }
      }
    }
  })
  async bulkRemoveUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bulkRemoveDto: BulkRemoveUsersDto,
  ): Promise<BulkOperationResponseDto> {
    return this.organizationsService.bulkRemoveUsers(id, bulkRemoveDto.emails);
  }

  /**
   * Bulk deactivate users in an organization
   */
  @Patch(':id/users/bulk-deactivate')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Bulk deactivate users', 
    description: 'Deactivates multiple users in an organization using their email addresses.' 
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Bulk deactivate operation completed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Bulk operation completed successfully' },
        data: {
          type: 'object',
          properties: {
            total_attempted: { type: 'number', example: 5 },
            successful: { type: 'number', example: 4 },
            failed: { type: 'number', example: 1 },
            failed_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                  reason: { type: 'string', example: 'User is already inactive in this organization' }
                }
              }
            }
          }
        }
      }
    }
  })
  async bulkDeactivateUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bulkDeactivateDto: BulkDeactivateUsersDto,
  ): Promise<BulkOperationResponseDto> {
    return this.organizationsService.bulkDeactivateUsers(id, bulkDeactivateDto.emails);
  }

  /**
   * Bulk reactivate users in an organization
   */
  @Patch(':id/users/bulk-activate')
  // @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Bulk reactivate users', 
    description: 'Reactivates multiple inactive users in an organization using their email addresses.' 
  })
  @ApiParam({ name: 'id', description: 'Organization ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Bulk reactivate operation completed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Bulk operation completed successfully' },
        data: {
          type: 'object',
          properties: {
            total_attempted: { type: 'number', example: 5 },
            successful: { type: 'number', example: 4 },
            failed: { type: 'number', example: 1 },
            failed_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                  reason: { type: 'string', example: 'User is already active in this organization' }
                }
              }
            }
          }
        }
      }
    }
  })
  async bulkActivateUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bulkActivateDto: BulkActivateUsersDto,
  ): Promise<BulkOperationResponseDto> {
    return this.organizationsService.bulkActivateUsers(id, bulkActivateDto.emails);
  }

  //#endregion
} 