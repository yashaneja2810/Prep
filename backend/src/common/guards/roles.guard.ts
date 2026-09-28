import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  Logger,
  ForbiddenException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from 'src/core/supabase/supabase.service';
import { USER_ROLES, AUTH_METADATA, AUTH_TABLES, COLUMNS } from '../helpers/string-const';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Get required roles from @Roles() decorator metadata
      const requiredRoles = this.reflector.getAllAndOverride<USER_ROLES[]>(
        AUTH_METADATA.ROLES,
        [context.getHandler(), context.getClass()]
      );

      // If no roles are specified, allow access
      if (!requiredRoles || requiredRoles.length === 0) {
        this.logger.debug('No roles required, allowing access');
        return true;
      }

      // Get the request and user from context
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const user = request.user;

      if (!user || !user.id) {
        this.logger.warn('No user found in request - authentication required');
        throw new ForbiddenException('Authentication required');
      }

      // Fetch user roles from database
      const userRoles = await this.getUserRoles(user.id);

      if (!userRoles || userRoles.length === 0) {
        this.logger.warn(`User ${user.email} has no active roles assigned`);
        throw new ForbiddenException('No active roles assigned to user');
      }

      // Extract role names from the fetched roles
      const userRoleNames = userRoles.map(role => role.role_name as USER_ROLES);
      
      this.logger.debug(`User ${user.email} has roles: [${userRoleNames.join(', ')}]`);
      this.logger.debug(`Required roles: [${requiredRoles.join(', ')}]`);

      // Check if user has any of the required roles or higher privilege
      const hasRequiredRole = requiredRoles.some(requiredRole => 
        this.hasRoleOrHigher(userRoleNames, requiredRole)
      );

      if (!hasRequiredRole) {
        this.logger.warn(
          `Access denied for user ${user.email}. ` +
          `User roles: [${userRoleNames.join(', ')}], ` +
          `Required: [${requiredRoles.join(', ')}]`
        );
        throw new ForbiddenException('Insufficient privileges');
      }

      this.logger.debug(`Access granted for user ${user.email}`);
      return true;

    } catch (error) {
      this.logger.error(`Role authorization failed: ${error.message}`);
      
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new ForbiddenException('Authorization failed');
    }
  }

  /**
   * Fetch user roles from database by joining users, user_roles, and roles tables
   */
  private async getUserRoles(userId: string): Promise<any[]> {
    try {
      const supabase = this.supabaseService.createServiceClient();

      const { data: userRoles, error } = await supabase
        .from(AUTH_TABLES.USER_ROLES)
        .select(`
          role_id,
          is_active,
          roles!fk_user_roles_role_id (
            id,
            role_name,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true); // Only get active role assignments

      if (error) {
        this.logger.error(`Error fetching user roles: ${error.message}`);
        throw new Error('Failed to fetch user roles');
      }

      // Extract the roles from the nested structure and filter out null/undefined
      const roles = userRoles
        ?.map(userRole => userRole.roles)
        .filter(role => role !== null && role !== undefined) || [];

      this.logger.debug(`Fetched ${roles.length} active roles for user ${userId}`);
      return roles;

    } catch (error) {
      this.logger.error(`Failed to fetch user roles for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if user has the required role or a higher privilege role
   * Role hierarchy: SUPER_ADMIN > ADMIN > TRAINER > LEARNER > VISITOR
   */
  private hasRoleOrHigher(userRoles: USER_ROLES[], requiredRole: USER_ROLES): boolean {
    // Define role hierarchy (higher index = higher privilege)
    const roleHierarchy: USER_ROLES[] = [
      USER_ROLES.VISITOR,
      USER_ROLES.LEARNER, 
      USER_ROLES.TRAINER,
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN
    ];

    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    if (requiredRoleIndex === -1) {
      this.logger.error(`Unknown required role: ${requiredRole}`);
      return false;
    }

    // Check if user has the required role or any higher privilege role
    return userRoles.some(userRole => {
      const userRoleIndex = roleHierarchy.indexOf(userRole);
      
      if (userRoleIndex === -1) {
        this.logger.warn(`Unknown user role: ${userRole}`);
        return false;
      }
      
      // User role index must be >= required role index
      return userRoleIndex >= requiredRoleIndex;
    });
  }
} 