import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MESSAGES } from '../../common/helpers/string-const';

/**
 * Centralized Supabase client service
 * Following Task 2.2 requirements from tasks.md
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.anonKey');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase configuration not provided - running in development mode');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('✅ Supabase client initialized successfully');
      
      // Test connection on startup
      await this.testConnection();
    } catch (error) {
      this.logger.error(`❌ Failed to initialize Supabase client: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get the Supabase client instance
   * @returns SupabaseClient instance
   */
  get client(): SupabaseClient {
    if (!this.supabase) {
      throw new Error(MESSAGES.DB_CONNECTION_ERROR);
    }
    return this.supabase;
  }

  /**
   * Test Supabase connection
   * Required by Task 2.2
   * @returns Promise with connection status
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      if (!this.supabase) {
        return {
          connected: false,
          message: 'Supabase client not initialized',
        };
      }

      // Test connection by making a simple query
      const { error } = await this.supabase
        .from('_supabase_test')
        .select('*')
        .limit(1);

      if (error && !error.message.includes('does not exist')) {
        // If error is not about table not existing, it's a real connection issue
        throw error;
      }

      this.logger.log('✅ Supabase connection test successful');
      return {
        connected: true,
        message: 'Supabase connection successful',
      };
    } catch (error) {
      this.logger.error(`❌ Supabase connection test failed: ${error.message}`);
      return {
        connected: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if Supabase client is available
   * @returns boolean indicating if client is initialized
   */
  isAvailable(): boolean {
    return !!this.supabase;
  }
} 