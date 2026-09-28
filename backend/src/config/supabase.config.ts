import { createClient } from '@supabase/supabase-js';
import * as process from 'process';
import { Logger } from '@nestjs/common';

/**
 * Creates a Supabase client instance using provided environment variables
 * 
 * @param supabaseUrl - The URL of your Supabase project
 * @param supabaseAnonKey - The anonymous key for your Supabase project
 * @returns A Supabase client instance
 */
export const createSupabaseClient = (supabaseUrl?: string, supabaseAnonKey?: string) => {
  const logger = new Logger('SupabaseClient');
  
  // Use provided parameters or environment variables
  const url = supabaseUrl || process.env.SUPABASE_URL;
  const key = supabaseAnonKey || process.env.SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    logger.error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    throw new Error('Missing Supabase configuration');
  }
  
  try {
    return createClient(url, key);
  } catch (error) {
    logger.error(`Failed to create Supabase client: ${error.message}`, error.stack);
    throw error;
  }
}; 