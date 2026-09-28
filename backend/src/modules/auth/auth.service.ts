import { Injectable, Logger, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { RegisterDto, LoginDto, CompleteProfileDto } from './dto';
import { MESSAGES, COOKIES, NODE_ENV, AUTH_TABLES, COLUMNS, RESPONSE_KEYS } from '../../common/helpers/string-const';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async register(registerDto: RegisterDto) {
    try {
      this.logger.debug(`Attempting to register user: ${registerDto.email}`);

      const supabaseClient = this.supabaseService.createClient();
      
      const { data, error } = await supabaseClient.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
      });

      if (error) {
        this.logger.error(`Registration failed for ${registerDto.email}:`, error.message);
        
        if (error.message.includes('already registered')) {
          throw new BadRequestException(MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        
        throw new BadRequestException(`Registration failed: ${error.message}`);
      }

      if (!data.user) {
        this.logger.error('Registration succeeded but no user data returned');
        throw new InternalServerErrorException('Registration failed');
      }

      this.logger.log(`User registered successfully: ${data.user.email}`);
      
      return {
        [RESPONSE_KEYS.SUCCESS]: true,
        [RESPONSE_KEYS.MESSAGE]: MESSAGES.REGISTER_SUCCESS,
        [RESPONSE_KEYS.DATA]: {
          [RESPONSE_KEYS.USER]: {
            [COLUMNS.ID]: data.user.id,
            [COLUMNS.EMAIL]: data.user.email,
            emailConfirmed: data.user.email_confirmed_at !== null,
          },
        },
      };
    } catch (error) {
      this.logger.error('Registration error:', error.message);
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      this.logger.debug(`Attempting to login user: ${loginDto.email}`);

      const supabaseClient = this.supabaseService.createClient();
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        this.logger.warn(`Login failed for ${loginDto.email}:`, error.message);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new UnauthorizedException('Please confirm your email before logging in');
        }
        
        throw new UnauthorizedException(`Login failed: ${error.message}`);
      }

      if (!data.session || !data.user) {
        this.logger.error('Login succeeded but no session or user data returned');
        throw new InternalServerErrorException('Login failed');
      }

      this.logger.log(`User logged in successfully: ${data.user.email}`);
      
      // Update email_verified to true in users table on successful login
      try {
        const serviceClient = this.supabaseService.createServiceClient();
        const { error: updateError } = await serviceClient
          .from(AUTH_TABLES.USERS)
          .update({ [COLUMNS.EMAIL_VERIFIED]: true })
          .eq(COLUMNS.ID, data.user.id);

        if (updateError) {
          this.logger.warn(`Failed to update email_verified for user ${data.user.id}:`, updateError.message);
        } else {
          this.logger.debug(`Updated email_verified to true for user: ${data.user.email}`);
        }
      } catch (updateError) {
        this.logger.error('Error updating email_verified:', updateError);
        // Don't fail the login if the update fails
      }
      
      return {
        [RESPONSE_KEYS.SUCCESS]: true,
        [RESPONSE_KEYS.MESSAGE]: MESSAGES.LOGIN_SUCCESS,
        [RESPONSE_KEYS.DATA]: {
          [RESPONSE_KEYS.SESSION]: data.session,
          [RESPONSE_KEYS.USER]: {
            [COLUMNS.ID]: data.user.id,
            [COLUMNS.EMAIL]: data.user.email,
            emailConfirmed: data.user.email_confirmed_at !== null,
            [COLUMNS.LAST_SIGN_IN_AT]: data.user.last_sign_in_at,
          },
        },
      };
    } catch (error) {
      this.logger.error('Login error:', error.message);
      
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Login failed');
    }
  }

  async logout() {
    // Implementation placeholder
    this.logger.debug('Logout method called');
  }

  async refreshSession() {
    // Implementation placeholder
    this.logger.debug('Refresh session method called');
  }

  async completeProfile(userId: string, completeProfileDto: CompleteProfileDto, userEmail?: string) {
    try {
      this.logger.debug(`Completing profile for user: ${userId}`);

      const serviceClient = this.supabaseService.createServiceClient();
      
      // First, try to get the user to see if they exist
      const { data: existingUser } = await serviceClient
        .from(AUTH_TABLES.USERS)
        .select(`${COLUMNS.ID}, ${COLUMNS.EMAIL}`)
        .eq(COLUMNS.ID, userId)
        .single();

      let data, error;

      if (existingUser) {
        // Update existing user
        const result = await serviceClient
          .from(AUTH_TABLES.USERS)
          .update({
            [COLUMNS.FIRST_NAME]: completeProfileDto.first_name,
            [COLUMNS.LAST_NAME]: completeProfileDto.last_name,
            [COLUMNS.PREFERRED_NAME]: completeProfileDto.preferred_name || null,
            [COLUMNS.PHONE]: completeProfileDto.phone || null,
            [COLUMNS.DATE_OF_BIRTH]: completeProfileDto.date_of_birth || null,
            [COLUMNS.TIMEZONE]: completeProfileDto.timezone,
            [COLUMNS.UPDATED_AT]: new Date().toISOString(),
          })
          .eq(COLUMNS.ID, userId)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Create new user record (user email should be passed from controller)
        if (!userEmail) {
          throw new BadRequestException('User email is required for profile creation');
        }

        // Create new user record
        const result = await serviceClient
          .from(AUTH_TABLES.USERS)
          .insert({
            [COLUMNS.ID]: userId,
            [COLUMNS.EMAIL]: userEmail,
            [COLUMNS.FIRST_NAME]: completeProfileDto.first_name,
            [COLUMNS.LAST_NAME]: completeProfileDto.last_name,
            [COLUMNS.PREFERRED_NAME]: completeProfileDto.preferred_name || null,
            [COLUMNS.PHONE]: completeProfileDto.phone || null,
            [COLUMNS.DATE_OF_BIRTH]: completeProfileDto.date_of_birth || null,
            [COLUMNS.TIMEZONE]: completeProfileDto.timezone,
            [COLUMNS.EMAIL_VERIFIED]: true,
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        this.logger.error(`Failed to update profile for user ${userId}:`, error.message);
        throw new InternalServerErrorException(`Failed to update profile: ${error.message}`);
      }

      if (!data) {
        this.logger.error(`No user found with id ${userId} or update failed`);
        throw new BadRequestException('User not found or profile update failed');
      }

      this.logger.log(`Profile completed successfully for user: ${userId}`);
      
              return {
          [RESPONSE_KEYS.SUCCESS]: true,
          [RESPONSE_KEYS.MESSAGE]: MESSAGES.PROFILE_UPDATED,
          [RESPONSE_KEYS.DATA]: {
            [RESPONSE_KEYS.USER]: {
              [COLUMNS.ID]: data[COLUMNS.ID],
              [COLUMNS.EMAIL]: data[COLUMNS.EMAIL],
              [COLUMNS.FIRST_NAME]: data[COLUMNS.FIRST_NAME],
              [COLUMNS.LAST_NAME]: data[COLUMNS.LAST_NAME],
              [COLUMNS.PREFERRED_NAME]: data[COLUMNS.PREFERRED_NAME],
              [COLUMNS.PHONE]: data[COLUMNS.PHONE],
              [COLUMNS.DATE_OF_BIRTH]: data[COLUMNS.DATE_OF_BIRTH],
              [COLUMNS.TIMEZONE]: data[COLUMNS.TIMEZONE],
              [RESPONSE_KEYS.PROFILE_COMPLETED]: true,
            },
          },
        };
    } catch (error) {
      this.logger.error('Profile completion error:', error.message);
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Profile completion failed');
    }
  }

  /**
   * Get user roles by user ID
   * @param userId The user ID to get roles for
   * @returns Array of user roles with role details
   */
  async getUserRoles(userId: string): Promise<any[]> {
    try {
      this.logger.debug(`Getting roles for user: ${userId}`);

      const serviceClient = this.supabaseService.createServiceClient();

      const { data: roleAssignments, error } = await serviceClient
        .from(AUTH_TABLES.USER_ROLES)
        .select(`
          id,
          role_id,
          is_active,
          assigned_at,
          roles:roles!inner(
            id,
            role_name,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching roles for user ${userId}: ${error.message}`);
        throw new BadRequestException('Failed to fetch user roles');
      }

      // Transform the data to a more friendly format
      const roles = (roleAssignments || []).map(assignment => {
        // Access the role data safely
        const roleData = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles;
        
        return {
          id: assignment.id,
          role_id: assignment.role_id,
          role_name: roleData ? roleData.role_name : null,
          description: roleData ? roleData.description : null,
          is_active: assignment.is_active,
          assigned_at: assignment.assigned_at
        };
      });

      this.logger.log(`Successfully retrieved ${roles.length} roles for user ${userId}`);
      return roles;

    } catch (error) {
      this.logger.error(`Failed to get user roles: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user roles');
    }
  }

  setAuthCookies(response: Response, session: Session) {
    try {
      const isProduction = process.env.NODE_ENV === NODE_ENV.PRODUCTION;
      
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ('none' as const) : ('lax' as const), // Use 'none' in production for cross-origin requests
        maxAge: COOKIES.MAX_AGE as number, // 7 days
        path: '/',
      };

      response.cookie(COOKIES.ACCESS_TOKEN, session.access_token, cookieOptions);
      response.cookie(COOKIES.REFRESH_TOKEN, session.refresh_token, cookieOptions);

      this.logger.debug('Auth cookies set successfully');
    } catch (error) {
      this.logger.error('Error setting auth cookies:', error.message);
      throw new InternalServerErrorException('Failed to set authentication cookies');
    }
  }

  clearAuthCookies(response: Response) {
    try {
      const isProduction = process.env.NODE_ENV === NODE_ENV.PRODUCTION;
      
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ('none' as const) : ('lax' as const), // Use 'none' in production for cross-origin requests
        path: '/',
      };

      response.clearCookie(COOKIES.ACCESS_TOKEN, cookieOptions);
      response.clearCookie(COOKIES.REFRESH_TOKEN, cookieOptions);

      this.logger.debug('Auth cookies cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing auth cookies:', error.message);
      throw new InternalServerErrorException('Failed to clear authentication cookies');
    }
  }

  extractTokenFromCookies(request: Request): string | null {
    try {
      const cookies = request.cookies;
      const accessToken = cookies?.[COOKIES.ACCESS_TOKEN];
      
      if (!accessToken) {
        this.logger.debug('No access token found in cookies');
        return null;
      }

      return accessToken;
    } catch (error) {
      this.logger.error('Error extracting token from cookies:', error.message);
      return null;
    }
  }
} 