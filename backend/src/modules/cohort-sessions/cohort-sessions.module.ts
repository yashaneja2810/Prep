import { Module } from '@nestjs/common';
import { CohortSessionsController } from './cohort-sessions.controller';
import { CohortSessionsService } from './cohort-sessions.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';
import { PointsModule } from '../points/points.module';
/**
 * Cohort Sessions Module
 * Responsible for managing sessions for cohorts including scheduling, attendance, and resources
 */
@Module({
  imports: [SupabaseModule, PointsModule],
  controllers: [CohortSessionsController],
  providers: [CohortSessionsService],
  exports: [CohortSessionsService],
})
export class CohortSessionsModule {} 