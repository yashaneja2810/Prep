import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from 'src/core/supabase/supabase.service';
import {
  UpdateUserDto,
  GetUsersQueryDto,
  UserResponseDto,
  AssignRoleDto,
  UpdateRoleDto,
} from './dto';
import {
  AUTH_TABLES,
  MESSAGES,
  COLUMNS,
  ROLE_IDS,
} from 'src/common/helpers/string-const';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Find user by ID with optional profile and role data
   */
  async findUserById(id: string): Promise<any> {
    try {
      this.logger.log(`Finding user by ID: ${id}`);

      const supabase = this.supabaseService.createServiceClient();

      const { data: user, error } = await supabase
        .from(AUTH_TABLES.USERS)
        .select(
          `
          *,
          user_roles!user_roles_user_id_fkey (
            role_id,
            roles (
              id,
              role_name,
              description
            )
          )
        `,
        )
        .eq(COLUMNS.ID, id)
        .is(COLUMNS.DELETED_AT, null)
        .single();

      if (error) {
        this.logger.error(`Error finding user by ID: ${error.message}`);
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      if (!user) {
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      this.logger.log(`Successfully found user: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by ID: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user');
    }
  }

  /**
   * Find user by email address
   */
  async findUserByEmail(email: string): Promise<any> {
    try {
      this.logger.log(`Finding user by email: ${email}`);

      const supabase = this.supabaseService.createServiceClient();

      const { data: user, error } = await supabase
        .from(AUTH_TABLES.USERS)
        .select(
          `
          *,
          user_roles!user_roles_user_id_fkey (
            role_id,
            roles (
              id,
              role_name,
              description
            )
          )
        `,
        )
        .eq(COLUMNS.EMAIL, email)
        .is(COLUMNS.DELETED_AT, null)
        .single();

      if (error) {
        this.logger.error(`Error finding user by email: ${error.message}`);
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      if (!user) {
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      this.logger.log(`Successfully found user by email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user');
    }
  }

  /**
   * Update user information
   */
  async updateUser(id: string, updateData: UpdateUserDto): Promise<any> {
    try {
      this.logger.log(`Updating user: ${id}`);

      // First check if user exists
      await this.findUserById(id);

      const supabase = this.supabaseService.createServiceClient();

      const updatePayload = {
        ...updateData,
        [COLUMNS.UPDATED_AT]: new Date().toISOString(),
      };

      const { data: updatedUser, error } = await supabase
        .from(AUTH_TABLES.USERS)
        .update(updatePayload)
        .eq(COLUMNS.ID, id)
        .is(COLUMNS.DELETED_AT, null)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating user: ${error.message}`);
        throw new BadRequestException('Failed to update user');
      }

      this.logger.log(`Successfully updated user: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Soft delete user (set deleted_at timestamp)
   */
  async softDeleteUser(id: string): Promise<void> {
    try {
      this.logger.log(`Soft deleting user: ${id}`);

      // First check if user exists
      await this.findUserById(id);

      const supabase = this.supabaseService.createServiceClient();

      const { error } = await supabase
        .from(AUTH_TABLES.USERS)
        .update({
          [COLUMNS.DELETED_AT]: new Date().toISOString(),
          [COLUMNS.IS_ACTIVE]: false,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.ID, id)
        .is(COLUMNS.DELETED_AT, null);

      if (error) {
        this.logger.error(`Error soft deleting user: ${error.message}`);
        throw new BadRequestException('Failed to delete user');
      }

      this.logger.log(`Successfully soft deleted user: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to soft delete user: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(
    queryDto: GetUsersQueryDto,
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(`Getting all users with filters:`, queryDto);

      const supabase = this.supabaseService.createServiceClient();

      let query = supabase
        .from(AUTH_TABLES.USERS)
        .select(
          `
          *,
          user_roles!user_roles_user_id_fkey (
            role_id,
            roles (
              id,
              role_name,
              description
            )
          )
        `,
          { count: 'exact' },
        )
        .is(COLUMNS.DELETED_AT, null);

      // Apply filters
      if (queryDto.search) {
        query = query.or(
          `first_name.ilike.%${queryDto.search}%,last_name.ilike.%${queryDto.search}%,email.ilike.%${queryDto.search}%`,
        );
      }

      if (queryDto.email_verified !== undefined) {
        query = query.eq(COLUMNS.EMAIL_VERIFIED, queryDto.email_verified);
      }

      if (queryDto.is_active !== undefined) {
        query = query.eq(COLUMNS.IS_ACTIVE, queryDto.is_active);
      }

      // Apply sorting
      const sortColumn = queryDto.sort_by || 'created_at';
      const sortOrder = queryDto.sort_order || 'desc';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data: users, error, count } = await query;

      if (error) {
        this.logger.error(`Error getting users: ${error.message}`);
        throw new BadRequestException('Failed to fetch users');
      }

      this.logger.log(`Successfully retrieved ${users?.length || 0} users`);

      return {
        users: users || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get users: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch users');
    }
  }

  /**
   * Assign a new role to a user by email
   */
  async assignRoleToUser(
    assignRoleDto: AssignRoleDto,
    assignedByUserId: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Assigning role ${assignRoleDto.role_id} to user ${assignRoleDto.email}`,
      );

      const supabase = this.supabaseService.createServiceClient();

      // First, find the user by email
      const { data: user, error: userError } = await supabase
        .from(AUTH_TABLES.USERS)
        .select('id, email')
        .eq(COLUMNS.EMAIL, assignRoleDto.email)
        .is(COLUMNS.DELETED_AT, null)
        .single();

      if (userError || !user) {
        this.logger.error(`User not found with email: ${assignRoleDto.email}`);
        throw new NotFoundException(
          `User not found with email: ${assignRoleDto.email}`,
        );
      }

      // Check if user already has this role
      const { data: existingRole, error: existingRoleError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id, is_active')
        .eq('user_id', user.id)
        .eq('role_id', assignRoleDto.role_id)
        .single();

      if (existingRole && !existingRoleError) {
        if (existingRole.is_active) {
          throw new ConflictException(
            `User already has an active role with ID ${assignRoleDto.role_id}`,
          );
        } else {
          // Reactivate the existing role
          const { data: updatedRole, error: updateError } = await supabase
            .from(AUTH_TABLES.USER_ROLES)
            .update({
              is_active: true,
              assigned_by: assignedByUserId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingRole.id)
            .select()
            .single();

          if (updateError) {
            this.logger.error(
              `Error reactivating role: ${updateError.message}`,
            );
            throw new BadRequestException('Failed to reactivate role');
          }

          this.logger.log(`Reactivated role for user ${assignRoleDto.email}`);
          return updatedRole;
        }
      }

      // Create new role assignment
      const roleAssignment = {
        user_id: user.id,
        role_id: assignRoleDto.role_id,
        is_active: assignRoleDto.is_active ?? true,
        assigned_by: assignRoleDto.assigned_by || assignedByUserId,
        assigned_at: new Date().toISOString(),
      };

      const { data: newRole, error: createError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .insert(roleAssignment)
        .select(
          `
          *,
          roles!fk_user_roles_role_id (
            id,
            role_name,
            description
          )
        `,
        )
        .single();

      if (createError) {
        this.logger.error(
          `Error creating role assignment: ${createError.message}`,
        );
        throw new BadRequestException('Failed to assign role');
      }

      this.logger.log(
        `Successfully assigned role ${assignRoleDto.role_id} to user ${assignRoleDto.email}`,
      );
      return newRole;
    } catch (error) {
      this.logger.error(`Failed to assign role: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to assign role');
    }
  }

  /**
   * Update an existing role assignment
   */
  async updateRoleAssignment(
    roleAssignmentId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<any> {
    try {
      this.logger.log(`Updating role assignment ${roleAssignmentId}`);

      const supabase = this.supabaseService.createServiceClient();

      // Check if role assignment exists
      const { data: existingRole, error: checkError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id, user_id, role_id')
        .eq('id', roleAssignmentId)
        .single();

      if (checkError || !existingRole) {
        throw new NotFoundException('Role assignment not found');
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateRoleDto.role_id !== undefined) {
        updateData.role_id = updateRoleDto.role_id;
      }

      if (updateRoleDto.is_active !== undefined) {
        updateData.is_active = updateRoleDto.is_active;
      }

      // Update the role assignment
      const { data: updatedRole, error: updateError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .update(updateData)
        .eq('id', roleAssignmentId)
        .select(
          `
          *,
          roles!fk_user_roles_role_id (
            id,
            role_name,
            description
          )
        `,
        )
        .single();

      if (updateError) {
        this.logger.error(
          `Error updating role assignment: ${updateError.message}`,
        );
        throw new BadRequestException('Failed to update role assignment');
      }

      this.logger.log(
        `Successfully updated role assignment ${roleAssignmentId}`,
      );
      return updatedRole;
    } catch (error) {
      this.logger.error(`Failed to update role assignment: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update role assignment');
    }
  }

  /**
   * Get all role assignments for a specific user
   */
  async getUserRoleAssignments(userId: string): Promise<any[]> {
    try {
      this.logger.log(`Getting role assignments for user ${userId}`);

      const supabase = this.supabaseService.createServiceClient();

      const { data: roleAssignments, error } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(
          `
          *,
          roles!fk_user_roles_role_id (
            id,
            role_name,
            description
          ),
          assigned_by_user:users!fk_user_roles_assigned_by (
            id,
            email,
            first_name,
            last_name
          )
        `,
        )
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching role assignments: ${error.message}`);
        throw new BadRequestException('Failed to fetch role assignments');
      }

      this.logger.log(
        `Successfully retrieved ${roleAssignments?.length || 0} role assignments`,
      );
      return roleAssignments || [];
    } catch (error) {
      this.logger.error(
        `Failed to get user role assignments: ${error.message}`,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch role assignments');
    }
  }

  /**
   * Get all role assignments in the system (for admin view)
   */
  async getAllRoleAssignments(): Promise<any[]> {
    try {
      this.logger.log('Getting all role assignments');

      const supabase = this.supabaseService.createServiceClient();

      const { data: roleAssignments, error } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(
          `
          *,
          user:users!user_roles_user_id_fkey (
            id,
            email,
            first_name,
            last_name
          ),
          roles!fk_user_roles_role_id (
            id,
            role_name,
            description
          ),
          assigned_by_user:users!fk_user_roles_assigned_by (
            id,
            email,
            first_name,
            last_name
          )
        `,
        )
        .order('assigned_at', { ascending: false });

      if (error) {
        this.logger.error(
          `Error fetching all role assignments: ${error.message}`,
        );
        throw new BadRequestException('Failed to fetch role assignments');
      }

      this.logger.log(
        `Successfully retrieved ${roleAssignments?.length || 0} role assignments`,
      );
      return roleAssignments || [];
    } catch (error) {
      this.logger.error(`Failed to get all role assignments: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch role assignments');
    }
  }

  //#region ==================== AUTHENTICATED CLIENT METHODS ====================

  /**
   * Create an authenticated client for user-specific operations
   * @param accessToken - User's access token
   * @returns Authenticated Supabase client
   */
  createUserClient(accessToken: string) {
    return this.supabaseService.createAuthenticatedClient(accessToken);
  }

  /**
   * Update user information using authenticated client (for user updating their own profile)
   * @param id - User ID
   * @param updateData - Update data
   * @param accessToken - User's access token
   * @returns Updated user
   */
  async updateUserWithAuth(
    id: string,
    updateData: UpdateUserDto,
    accessToken: string,
  ): Promise<any> {
    try {
      this.logger.log(`User updating their own profile: ${id}`);

      const supabase =
        this.supabaseService.createAuthenticatedClient(accessToken);

      const updatePayload = {
        ...updateData,
        [COLUMNS.UPDATED_AT]: new Date().toISOString(),
      };

      const { data: updatedUser, error } = await supabase
        .from(AUTH_TABLES.USERS)
        .update(updatePayload)
        .eq(COLUMNS.ID, id)
        .is(COLUMNS.DELETED_AT, null)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating user with auth: ${error.message}`);
        throw new BadRequestException('Failed to update user');
      }

      this.logger.log(`Successfully updated user with authentication: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user with auth: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Get user by ID using authenticated client (for user accessing their own data)
   * @param id - User ID
   * @param accessToken - User's access token
   * @returns User data
   */
  async findUserByIdWithAuth(id: string, accessToken: string): Promise<any> {
    try {
      this.logger.log(`User accessing their own data: ${id}`);

      const supabase =
        this.supabaseService.createAuthenticatedClient(accessToken);

      const { data: user, error } = await supabase
        .from(AUTH_TABLES.USERS)
        .select(
          `
          *,
          user_roles!user_roles_user_id_fkey (
            role_id,
            roles (
              id,
              role_name,
              description
            )
          )
        `,
        )
        .eq(COLUMNS.ID, id)
        .is(COLUMNS.DELETED_AT, null)
        .single();

      if (error) {
        this.logger.error(`Error finding user with auth: ${error.message}`);
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      if (!user) {
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      this.logger.log(
        `Successfully found user with authentication: ${user.email}`,
      );
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user with auth: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user');
    }
  }

  //#endregion

  /**
   * Get current user's complete profile including role-specific details
   */
  async getCurrentUserProfile(userId: string): Promise<any> {
    try {
      this.logger.log(`Getting complete profile for user: ${userId}`);

      const supabase = this.supabaseService.createServiceClient();
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      // First get user basic info with roles
      const { data: user, error: userError } = await supabase
        .from(AUTH_TABLES.USERS)
        .select(`
          *,
          user_roles!user_roles_user_id_fkey (
            *,
            roles (
              id,
              role_name,
              description
            )
          )
        `)
        .eq(COLUMNS.ID, userId)
        .is(COLUMNS.DELETED_AT, null)
        .single();

      // Separately fetch organization data to avoid join issues
      const { data: organizationData, error: orgError } = await supabase
        .from('organization_users')
        .select(`
          organizations (
            id,
            org_name,
            code,
            type,
            website,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (orgError) {
        this.logger.warn(`Organization fetch error: ${orgError.message}`);
      }

      // Add organization data to user object
      user.organization_users = organizationData ? [organizationData] : [];

      if (userError || !user) {
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      // Extract active roles
      const activeRoles = user.user_roles
        ?.filter((ur: any) => ur.is_active)
        ?.map((ur: any) => ur.roles?.role_name)
        ?.filter(Boolean) || [];

      // Find active organization safely
      let activeOrganization = null;
      try {
        if (user.organization_users && user.organization_users.length > 0) {
          // Since we already filtered for active organizations in the query,
          // we can take the first one
          activeOrganization = user.organization_users[0]?.organizations || null;
        }
      } catch (orgError) {
        this.logger.warn(`Error processing organization data: ${orgError.message}`);
        activeOrganization = null;
      }

      // Initialize profile object
      let profile = {
        ...user,
        activeRoles,
        roleProfiles: {} as any,
        activeOrganization,
      };

      // Fetch role-specific profiles based on active roles
      for (const roleName of activeRoles) {
        if (roleName === 'learner') {
          this.logger.log(`Fetching learner profile for user: ${userId}`);
          
          // Fetch learner profile with related details
          const { data: learnerProfile, error: learnerError } = await supabase
            .from('learner_profiles')
            .select(`
              *,
              learner_student_details (*),
              learner_professional_details (*)
            `)
            .eq('user_id', userId)
            .single();

          if (learnerError) {
            this.logger.warn(`Learner profile error: ${learnerError.message}`);
            // Create minimal learner profile if none exists
            profile.roleProfiles.learner = {
              id: `learner_${userId}`,
              user_id: userId,
              learner_type: 'professional',
              goals_text: null,
              enrollment_date: new Date().toISOString(),
              rank: null,
              tasks_completed: 0,
              streak_days: 0,
              last_activity_date: null,
              profile_image: null,
              learner_student_details: null,
              learner_professional_details: null,
              cohorts: [],
              programs: []
            };
          } else if (learnerProfile) {
            profile.roleProfiles.learner = learnerProfile;

            // Get learner's cohorts
            const { data: cohorts, error: cohortsError } = await supabase
              .from('cohort_learners')
              .select(`
                *,
                cohorts (
                  *,
                  programs (*)
                )
              `)
              .eq('user_id', userId);

            if (cohortsError) {
              this.logger.warn(`Learner cohorts error: ${cohortsError.message}`);
              profile.roleProfiles.learner.cohorts = [];
            } else {
              profile.roleProfiles.learner.cohorts = cohorts || [];
            }

            // Get learner's programs
            const { data: programs, error: programsError } = await supabase
              .from('learner_programs')
              .select(`
                *,
                programs (*)
              `)
              .eq('user_id', userId);

            if (programsError) {
              this.logger.warn(`Learner programs error: ${programsError.message}`);
              profile.roleProfiles.learner.programs = [];
            } else {
              profile.roleProfiles.learner.programs = programs || [];
            }
          }
          
          this.logger.log(`Learner profile processed successfully for user: ${userId}`);
        } else if (roleName === 'trainer') {
          this.logger.log(`Fetching trainer profile for user: ${userId}`);
          
          // Fetch trainer profile with specialities
          const { data: trainerProfile, error: trainerError } = await supabase
            .from('trainer_profiles')
            .select(`
              *,
              trainer_specialities (
                specialities (*)
              )
            `)
            .eq('user_id', userId)
            .single();

          if (trainerError) {
            this.logger.warn(`Trainer profile error: ${trainerError.message}`);
            // Create minimal trainer profile if none exists
            profile.roleProfiles.trainer = {
              id: `trainer_${userId}`,
              user_id: userId,
              total_years_teaching: null,
              bio: null,
              linkedin_url: null,
              expertise: null,
              profile_image: null,
              website: null,
              social_links: null,
              trainer_specialities: [],
              cohorts: [],
              recentSessions: []
            };
          } else if (trainerProfile) {
            profile.roleProfiles.trainer = trainerProfile;

            // Get trainer's cohorts
            const { data: cohorts, error: cohortsError } = await supabase
              .from('cohort_trainers')
              .select(`
                *,
                cohorts (
                  *,
                  programs (*)
                )
              `)
              .eq('user_id', userId);

            if (cohortsError) {
              this.logger.warn(`Trainer cohorts error: ${cohortsError.message}`);
              profile.roleProfiles.trainer.cohorts = [];
            } else {
              profile.roleProfiles.trainer.cohorts = cohorts || [];
            }

            // Get trainer's sessions
            const { data: sessions, error: sessionsError } = await supabase
              .from('cohort_sessions')
              .select(`
                *,
                cohorts (*)
              `)
              .eq('trainer_id', userId)
              .order('session_date', { ascending: false })
              .limit(10);

            if (sessionsError) {
              this.logger.warn(`Trainer sessions error: ${sessionsError.message}`);
              profile.roleProfiles.trainer.recentSessions = [];
            } else {
              profile.roleProfiles.trainer.recentSessions = sessions || [];
            }
          }
          
          this.logger.log(`Trainer profile processed successfully for user: ${userId}`);
        } else if (roleName === 'admin' || roleName === 'super_admin') {
          this.logger.log(`Fetching admin profile for user: ${userId}`);
          
          // Fetch admin profile
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (adminError) {
            this.logger.warn(`Admin profile error: ${adminError.message}`);
            // Create minimal admin profile if none exists
            profile.roleProfiles.admin = {
              id: `admin_${userId}`,
              user_id: userId,
              admin_level: 'organization',
              phone_ext: null,
              notes: null
            };
          } else if (adminProfile) {
            profile.roleProfiles.admin = adminProfile;
          }
          
          this.logger.log(`Admin profile processed successfully for user: ${userId}`);
        }
      }

      // Get user's stats (points, completions, etc.)
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId);

      const totalPoints = userPoints?.reduce((sum, up) => sum + (up.points || 0), 0) || 0;

      profile = {
        ...profile,
        stats: {
          totalPoints,
          // Add more stats as needed
        },
      };

      this.logger.log(`Successfully retrieved complete profile for user: ${user.email}`);
      this.logger.log(`Profile includes roles: ${JSON.stringify(activeRoles)}`);
      this.logger.log(`Profile includes roleProfiles keys: ${Object.keys(profile.roleProfiles)}`);
      
      // Remove user_roles and organization_users from response
      const { user_roles, organization_users, ...cleanProfile } = profile;
      
      return cleanProfile;
    } catch (error) {
      this.logger.error(`Failed to get current user profile for user: ${userId}`);
      this.logger.error(`Error message: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user profile');
    }
  }

  //#region ==================== LEARNER MANAGEMENT METHODS ====================

  /**
   * Assign learner role to user by email
   */
  async assignLearnerRole(email: string, assignedBy: string): Promise<any> {
    try {
      this.logger.log(`Assigning learner role to user with email: ${email}`);

      const supabase = this.supabaseService.createServiceClient();

      // Find user by email
      const { data: user, error: userError } = await supabase
        .from(AUTH_TABLES.USERS)
        .select('id, email, first_name, last_name')
        .eq(COLUMNS.EMAIL, email)
        .is(COLUMNS.DELETED_AT, null)
        .single();

      if (userError || !user) {
        this.logger.error(`User not found with email: ${email}`);
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      // Check if user already has learner role
      const { data: existingRole, error: roleCheckError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id')
        .eq(COLUMNS.USER_ID, user.id)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER)
        .single();

      if (existingRole && !roleCheckError) {
        throw new ConflictException(MESSAGES.ALREADY_HAS_ROLE);
      }

      // Assign learner role
      const { data: roleAssignment, error: assignError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .insert({
          [COLUMNS.USER_ID]: user.id,
          [COLUMNS.ROLE_ID]: ROLE_IDS.LEARNER,
          [COLUMNS.IS_ACTIVE]: true,
          assigned_by: assignedBy,
          [COLUMNS.CREATED_AT]: new Date().toISOString(),
        })
        .select()
        .single();

      if (assignError) {
        this.logger.error(
          `Error assigning learner role: ${assignError.message}`,
        );
        throw new BadRequestException('Failed to assign learner role');
      }

      // Create learner profile
      const { error: profileError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .insert({
          [COLUMNS.USER_ID]: user.id,
          [COLUMNS.IS_ACTIVE]: true,
          [COLUMNS.CREATED_AT]: new Date().toISOString(),
        });

      if (profileError) {
        this.logger.error(
          `Error creating learner profile: ${profileError.message}`,
        );
        // If profile creation fails, we should rollback the role assignment
        await supabase
          .from(AUTH_TABLES.USER_ROLES)
          .delete()
          .eq('id', roleAssignment.id);
        throw new BadRequestException('Failed to create learner profile');
      }

      this.logger.log(`Successfully assigned learner role to user: ${email}`);
      return roleAssignment;
    } catch (error) {
      this.logger.error(`Failed to assign learner role: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to assign learner role');
    }
  }

  /**
   * Get all users with learner roles with pagination
   */
  async getLearnerUsers(
    queryDto: GetUsersQueryDto,
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(`Getting learner users with filters:`, queryDto);

      const supabase = this.supabaseService.createServiceClient();

      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const offset = (page - 1) * limit;

      // Build query with learner role filter
      let query = supabase
        .from(AUTH_TABLES.USERS)
        .select(
          `
          *,
          user_roles!user_roles_user_id_fkey (
            role_id,
            is_active,
            roles (
              id,
              role_name,
              description
            )
          ),
          learner_profiles!learner_profiles_user_id_fkey (
            id,
            learner_type,
            is_active
          )
        `,
          { count: 'exact' },
        )
        .eq('user_roles.role_id', ROLE_IDS.LEARNER)
        .is(COLUMNS.DELETED_AT, null);

      // Apply filters
      if (queryDto.search) {
        query = query.or(
          `email.ilike.%${queryDto.search}%,first_name.ilike.%${queryDto.search}%,last_name.ilike.%${queryDto.search}%`,
        );
      }

      if (queryDto.is_active !== undefined) {
        query = query.eq('user_roles.is_active', queryDto.is_active);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Apply ordering
      const orderBy = queryDto.sort_by || COLUMNS.CREATED_AT;
      const orderDirection = queryDto.sort_order || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      const { data: users, error, count } = await query;

      if (error) {
        this.logger.error(`Error getting learner users: ${error.message}`);
        throw new BadRequestException('Failed to fetch learner users');
      }

      this.logger.log(
        `Successfully retrieved ${users?.length || 0} learner users`,
      );

      return {
        users: users || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get learner users: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch learner users');
    }
  }

  /**
   * Deactivate learner role (soft delete)
   */
  async deactivateLearnerRole(userId: string): Promise<void> {
    try {
      this.logger.log(`Deactivating learner role for user: ${userId}`);

      const supabase = this.supabaseService.createServiceClient();

      // Check if user has learner role
      const { data: roleAssignment, error: roleError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id')
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER)
        .eq(COLUMNS.IS_ACTIVE, true)
        .single();

      if (roleError || !roleAssignment) {
        throw new NotFoundException(MESSAGES.LEARNER_ROLE_NOT_FOUND);
      }

      // Deactivate role assignment
      const { error: deactivateError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .update({
          [COLUMNS.IS_ACTIVE]: false,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER);

      if (deactivateError) {
        this.logger.error(
          `Error deactivating learner role: ${deactivateError.message}`,
        );
        throw new BadRequestException('Failed to deactivate learner role');
      }

      // Deactivate learner profile
      const { error: profileError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .update({
          [COLUMNS.IS_ACTIVE]: false,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.USER_ID, userId);

      if (profileError) {
        this.logger.error(
          `Error deactivating learner profile: ${profileError.message}`,
        );
        // Continue as role deactivation is more critical
      }

      this.logger.log(
        `Successfully deactivated learner role for user: ${userId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to deactivate learner role: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to deactivate learner role');
    }
  }

  /**
   * Reactivate learner role (restore soft deleted learner)
   */
  async reactivateLearnerRole(userId: string): Promise<void> {
    try {
      this.logger.log(`Reactivating learner role for user: ${userId}`);

      const supabase = this.supabaseService.createServiceClient();

      // Check if user has inactive learner role
      const { data: roleAssignment, error: roleError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id')
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER)
        .eq(COLUMNS.IS_ACTIVE, false)
        .single();

      if (roleError || !roleAssignment) {
        throw new NotFoundException(
          'Inactive learner role not found for this user',
        );
      }

      // Reactivate role assignment
      const { error: reactivateError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .update({
          [COLUMNS.IS_ACTIVE]: true,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER);

      if (reactivateError) {
        this.logger.error(
          `Error reactivating learner role: ${reactivateError.message}`,
        );
        throw new BadRequestException('Failed to reactivate learner role');
      }

      // Reactivate learner profile
      const { error: profileError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .update({
          [COLUMNS.IS_ACTIVE]: true,
          [COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(COLUMNS.USER_ID, userId);

      if (profileError) {
        this.logger.error(
          `Error reactivating learner profile: ${profileError.message}`,
        );
        // Continue as role reactivation is more critical
      }

      this.logger.log(
        `Successfully reactivated learner role for user: ${userId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to reactivate learner role: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to reactivate learner role');
    }
  }

  /**
   * Permanently remove learner role (SUPER ADMIN only)
   */
  async permanentlyRemoveLearnerRole(userId: string): Promise<void> {
    try {
      this.logger.log(
        `PERMANENTLY removing learner role for user: ${userId} - THIS ACTION CANNOT BE UNDONE`,
      );

      const supabase = this.supabaseService.createServiceClient();

      // Check if user has learner role
      const { data: roleAssignment, error: roleError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select('id')
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER)
        .single();

      if (roleError || !roleAssignment) {
        throw new NotFoundException(MESSAGES.LEARNER_ROLE_NOT_FOUND);
      }

      // Delete learner student details first (if any)
      await supabase
        .from(AUTH_TABLES.LEARNER_STUDENT_DETAILS)
        .delete()
        .eq(COLUMNS.LEARNER_ID, userId);

      // Delete learner professional details (if any)
      await supabase
        .from(AUTH_TABLES.LEARNER_PROFESSIONAL_DETAILS)
        .delete()
        .eq(COLUMNS.LEARNER_ID, userId);

      // Delete learner profile
      const { error: profileError } = await supabase
        .from(AUTH_TABLES.LEARNER_PROFILES)
        .delete()
        .eq(COLUMNS.USER_ID, userId);

      if (profileError) {
        this.logger.error(
          `Error deleting learner profile: ${profileError.message}`,
        );
        throw new BadRequestException('Failed to delete learner profile');
      }

      // Finally delete role assignment
      const { error: roleDeleteError } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .delete()
        .eq(COLUMNS.USER_ID, userId)
        .eq(COLUMNS.ROLE_ID, ROLE_IDS.LEARNER);

      if (roleDeleteError) {
        this.logger.error(
          `Error deleting learner role: ${roleDeleteError.message}`,
        );
        throw new BadRequestException('Failed to delete learner role');
      }

      this.logger.log(
        `⚠️ PERMANENTLY DELETED learner role and all data for user: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to permanently remove learner role: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to permanently remove learner role',
      );
    }
  }

  //#endregion
}