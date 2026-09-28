import { Injectable, Logger } from '@nestjs/common';
import {
  createClient,
  SupabaseClient,
  Session,
  AuthResponse,
  User,
} from '@supabase/supabase-js';
import { ENV } from '../../common/helpers/string-const';

/**
 * Enhanced Supabase service with multiple client configurations
 * Provides different client instances for various authentication scenarios
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabase: SupabaseClient;

  constructor() {
    try {
      this.supabase = this.createClient();
      this.logger.log('Supabase service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase service', error.stack);
      throw error;
    }
  }

  /**
   * Creates a standard Supabase client using anonymous key
   * @returns SupabaseClient instance
   */
  createClient(): SupabaseClient {
    const url = process.env[ENV.SUPABASE_URL];
    const anonKey = process.env[ENV.SUPABASE_ANON_KEY];

    if (!url || !anonKey) {
      const errorMsg =
        'Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      return createClient(url, anonKey);
    } catch (error) {
      this.logger.error('Failed to create Supabase client', error.stack);
      throw error;
    }
  }

  /**
   * Creates a service client using service role key for admin operations
   * @returns SupabaseClient instance with service role privileges
   */
  createServiceClient(): SupabaseClient {
    const url = process.env[ENV.SUPABASE_URL];
    const serviceKey = process.env[ENV.SUPABASE_SERVICE_ROLE_KEY];

    if (!url || !serviceKey) {
      const errorMsg =
        'Missing Supabase service configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      return createClient(url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to create Supabase service client',
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Creates an authenticated client using user's access token
   * This client operates with the authenticated user's permissions
   * @param accessToken - The user's access token
   * @returns SupabaseClient instance with user authentication
   */
  createAuthenticatedClient(accessToken: string): SupabaseClient {
    const url = process.env[ENV.SUPABASE_URL];
    const anonKey = process.env[ENV.SUPABASE_ANON_KEY];

    if (!url || !anonKey) {
      const errorMsg =
        'Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!accessToken) {
      const errorMsg =
        'Access token is required to create authenticated client.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const client = createClient(url, anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      // Set the session manually for the client
      client.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

      return client;
    } catch (error) {
      this.logger.error(
        'Failed to create authenticated Supabase client',
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Validates JWT token using service client
   * @param accessToken - The access token to validate
   * @returns User object or null if invalid
   */
  async validateJwtToken(accessToken: string): Promise<User | null> {
    try {
      const serviceClient = this.createServiceClient();

      // Use service client to validate the JWT token
      const {
        data: { user },
        error,
      } = await serviceClient.auth.getUser(accessToken);

      if (error) {
        this.logger.warn(`Failed to validate JWT token: ${error.message}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Error validating JWT token', error.stack);
      return null;
    }
  }

  /**
   * Gets session information from an access token
   * @param accessToken - The access token to validate
   * @returns Session object or null if invalid
   */
  async getSession(accessToken: string): Promise<Session | null> {
    try {
      // For now, we'll validate the token and return a mock session if valid
      const user = await this.validateJwtToken(accessToken);

      if (!user) {
        return null;
      }

      // Return a minimal session-like object
      return {
        access_token: accessToken,
        refresh_token: '',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: user,
      } as Session;
    } catch (error) {
      this.logger.error('Error getting session from token', error.stack);
      return null;
    }
  }

  /**
   * Refreshes a session using a refresh token
   * @param refreshToken - The refresh token to use
   * @returns AuthResponse with new session data
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        this.logger.warn(`Failed to refresh session: ${error.message}`);
        throw new Error(error.message);
      }

      return { data, error };
    } catch (error) {
      this.logger.error('Error refreshing session', error.stack);
      throw error;
    }
  }

  /**
   * Gets user information from an access token
   * @param accessToken - The access token to use
   * @returns User object or null if invalid
   */
  async getUserFromToken(accessToken: string): Promise<User | null> {
    try {
      return await this.validateJwtToken(accessToken);
    } catch (error) {
      this.logger.error('Error getting user from token', error.stack);
      return null;
    }
  }

  /**
   * Validates if an access token is still valid
   * @param accessToken - The access token to validate
   * @returns boolean indicating if token is valid
   */
  async validateSession(accessToken: string): Promise<boolean> {
    try {
      const user = await this.getUserFromToken(accessToken);
      return user !== null;
    } catch (error) {
      this.logger.error('Error validating session', error.stack);
      return false;
    }
  }

  /**
   * Gets the default Supabase client instance
   * @returns The default SupabaseClient
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}