import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, GetUsersQueryDto, UserResponseDto, AssignRoleDto, UpdateRoleDto, CurrentUserProfileDto } from './dto';
import { SupabaseAuthGuard, RolesGuard } from 'src/common/guards';
import { CurrentUser, Roles } from 'src/common/decorators';
import { USER_ROLES, MESSAGES, HTTP_STATUS } from 'src/common/helpers/string-const';
import { UserWithProfile } from 'src/common/types';

/**
 * Users Controller - Admin Only Access
 * 
 * All endpoints in this controller require Admin or Super Admin privileges.
 * This controller handles user management operations including:
 * - User CRUD operations
 * - Role assignment and management
 * - User profile management
 * 
 * Access Control:
 * - Admin: Can perform all operations except user deletion
 * - Super Admin: Can perform all operations including user deletion
 */
@ApiTags('Users - Admin Only')
@ApiBearerAuth()
@ApiSecurity('bearer')
@Controller('users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles() // Allow all authenticated users
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the complete profile of the currently authenticated user including role-specific details.',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User profile retrieved successfully' },
        data: { $ref: '#/components/schemas/CurrentUserProfileDto' },
      },
    },
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getCurrentUserProfile(@CurrentUser() currentUser: UserWithProfile) {
    const profile = await this.usersService.getCurrentUserProfile(currentUser.id);
    
    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: profile,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all users with pagination and filtering. Requires admin privileges.',
  })
  @ApiQuery({ type: GetUsersQueryDto })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Users retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserResponseDto' },
            },
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - insufficient privileges',
  })
  async getAllUsers(@Query() queryDto: GetUsersQueryDto) {
    const result = await this.usersService.getAllUsers(queryDto);
    
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by ID. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - admin privileges required',
  })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);
    
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information. Requires admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - admin privileges required',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    
    return {
      success: true,
      message: MESSAGES.UPDATED,
      data: updatedUser,
    };
  }

  @Delete(':id')
  @Roles(USER_ROLES.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft delete a user account. Only super admins can delete users.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - super admin privileges required',
  })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserWithProfile,
  ) {
    // Prevent super admin from deleting themselves
    if (currentUser.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.usersService.softDeleteUser(id);
    
    return {
      success: true,
      message: MESSAGES.DELETED,
    };
  }

  // ================================
  // ROLE MANAGEMENT ENDPOINTS
  // ================================

  @Post('roles')
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assign a new role to a user by email. Requires admin privileges.',
  })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: 'Role assigned successfully',
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'User already has this active role',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - admin privileges required',
  })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() currentUser: UserWithProfile,
  ) {
    const roleAssignment = await this.usersService.assignRoleToUser(
      assignRoleDto,
      currentUser.id,
    );

    return {
      success: true,
      message: 'Role assigned successfully',
      data: roleAssignment,
    };
  }

  @Put('roles/:roleAssignmentId')
  @ApiOperation({
    summary: 'Update role assignment',
    description: 'Update an existing role assignment (change role_id or is_active status). Requires admin privileges.',
  })
  @ApiParam({
    name: 'roleAssignmentId',
    description: 'Role assignment ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Role assignment updated successfully',
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Role assignment not found',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - admin privileges required',
  })
  async updateRoleAssignment(
    @Param('roleAssignmentId') roleAssignmentId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const updatedRoleAssignment = await this.usersService.updateRoleAssignment(
      roleAssignmentId,
      updateRoleDto,
    );

    return {
      success: true,
      message: 'Role assignment updated successfully',
      data: updatedRoleAssignment,
    };
  }

  @Get(':userId/roles')
  @ApiOperation({
    summary: 'Get user role assignments',
    description: 'Get all role assignments for a specific user. Requires admin privileges.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'User role assignments retrieved successfully',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - admin privileges required',
  })
  async getUserRoles(@Param('userId') userId: string) {
    const roleAssignments = await this.usersService.getUserRoleAssignments(userId);

    return {
      success: true,
      message: 'User role assignments retrieved successfully',
      data: roleAssignments,
    };
  }

  @Get('roles/all')
  @ApiOperation({
    summary: 'Get all role assignments',
    description: 'Get all role assignments in the system. Requires admin privileges.',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'All role assignments retrieved successfully',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Access denied - admin privileges required',
  })
  async getAllRoleAssignments() {
    const roleAssignments = await this.usersService.getAllRoleAssignments();

    return {
      success: true,
      message: 'All role assignments retrieved successfully',
      data: roleAssignments,
    };
  }
} 