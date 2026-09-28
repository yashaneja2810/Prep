import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Supabase module that provides enhanced Supabase service globally
 */
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {} 