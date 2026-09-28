import { Module } from '@nestjs/common';
import { CompletionsController } from './completions.controller';
import { CompletionsService } from './completions.service';
import { PointsModule } from '../points/points.module';
import { SupabaseModule as CoreSupabaseModule } from '../../core/supabase/supabase.module';
import { SupabaseModule as DatabaseSupabaseModule } from '../../core/database/supabase.module';

/**
 * Completions Module
 * Handles tracking of various completion types (topics, CP, objectives, outcomes)
 */
@Module({
  imports: [PointsModule, CoreSupabaseModule, DatabaseSupabaseModule],
  controllers: [CompletionsController],
  providers: [CompletionsService],
  exports: [CompletionsService],
})
export class CompletionsModule {} 