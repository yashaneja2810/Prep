import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { AuthenticatedRequest } from '../types';
import { COOKIES, COLUMNS, AUTH_METADATA } from '../helpers/string-const';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(AUTH_METADATA.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Route is public, allowing access');
      return true;
    }

    try {
      // Extract access token from cookies
      const accessToken = this.extractTokenFromCookies(request);

      if (!accessToken) {
        this.logger.warn('No access token found in cookies');
        throw new UnauthorizedException('Authentication required');
      }

      // Validate session with Supabase
      const user = await this.supabaseService.getUserFromToken(accessToken);

      if (!user) {
        this.logger.warn('Invalid or expired access token');
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Attach user to request with minimal UserWithProfile structure
      request.user = {
        [COLUMNS.ID]: user.id,
        [COLUMNS.EMAIL]: user.email!,
        [COLUMNS.FIRST_NAME]: user.user_metadata?.first_name,
        [COLUMNS.LAST_NAME]: user.user_metadata?.last_name,
        [COLUMNS.EMAIL_VERIFIED]: !!user.email_confirmed_at,
        [COLUMNS.CREATED_AT]: user.created_at,
        [COLUMNS.UPDATED_AT]: user.updated_at || user.created_at,
        roles: [], // Will be populated later when role system is complete
        organizations: [], // Will be populated later when organization system is complete
      };
      this.logger.debug(`Authenticated user: ${user.email}`);

      return true;
    } catch (error) {
      this.logger.error('Authentication failed:', error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromCookies(request: Request): string | null {
    try {
      const cookies = request.cookies;
      return cookies?.[COOKIES.ACCESS_TOKEN] || null;
    } catch (error) {
      this.logger.error('Error extracting token from cookies:', error.message);
      return null;
    }
  }
} 