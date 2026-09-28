import { Module } from '@nestjs/common';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';
import { SupabaseService } from '../../core/database/supabase.service';

/**
 * Objectives Module
 * Bundles all Objectives components together
 */
@Module({
  controllers: [ObjectivesController],
  providers: [ObjectivesService, SupabaseService],
  exports: [ObjectivesService],
})
export class ObjectivesModule {} 