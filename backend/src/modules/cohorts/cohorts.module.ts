import { Module } from '@nestjs/common';
import { CohortsController } from './cohorts.controller';
import { CohortsService } from './cohorts.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';

/**
 * Cohorts Module
 * Responsible for managing cohorts of learners and trainers
 */
@Module({
  imports: [SupabaseModule],
  controllers: [CohortsController],
  providers: [CohortsService],
  exports: [CohortsService],
})
export class CohortsModule {} 