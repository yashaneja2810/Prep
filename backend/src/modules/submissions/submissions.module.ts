import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { PointsModule } from '../points/points.module';
import { SupabaseModule as CoreSupabaseModule } from '../../core/supabase/supabase.module';
import { SupabaseModule as DatabaseSupabaseModule } from '../../core/database/supabase.module';

/**
 * Submissions Module
 * Handles user submissions for application problems
 */
@Module({
  imports: [PointsModule, CoreSupabaseModule, DatabaseSupabaseModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {} 