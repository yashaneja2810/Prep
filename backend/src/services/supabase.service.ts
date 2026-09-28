import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.anonKey');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration. Check environment variables.');
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase client initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize Supabase client: ${error.message}`, error.stack);
      throw error;
    }
  }

  get getClient(): SupabaseClient {
    return this.supabase;
  }
} 