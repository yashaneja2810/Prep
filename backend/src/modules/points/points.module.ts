import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { SupabaseModule as CoreSupabaseModule } from '../../core/supabase/supabase.module';
import { SupabaseModule as DatabaseSupabaseModule } from '../../core/database/supabase.module';

/**
 * Points Module
 * Handles user points tracking and retrieval
 */
@Module({
  imports: [CoreSupabaseModule, DatabaseSupabaseModule],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {} 