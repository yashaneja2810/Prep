import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { SupabaseService } from '../../core/database/supabase.service';

/**
 * Modules Module
 * Bundles all Modules components together
 */
@Module({
  controllers: [ModulesController],
  providers: [ModulesService, SupabaseService],
  exports: [ModulesService],
})
export class ModulesModule {} 