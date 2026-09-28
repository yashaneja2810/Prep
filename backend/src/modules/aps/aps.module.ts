import { Module } from '@nestjs/common';
import { ApsController } from './aps.controller';
import { ApsService } from './aps.service';
import { SupabaseService } from '../../core/database/supabase.service';

/**
 * Application Problems Module
 * Configures APS module with controller, service, and dependencies
 */
@Module({
  controllers: [ApsController],
  providers: [ApsService, SupabaseService],
  exports: [ApsService],
})
export class ApsModule {} 