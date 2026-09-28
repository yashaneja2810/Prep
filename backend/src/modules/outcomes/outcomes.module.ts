import { Module } from '@nestjs/common';
import { OutcomesController } from './outcomes.controller';
import { OutcomesService } from './outcomes.service';
import { SupabaseService } from '../../core/database/supabase.service';

/**
 * Outcomes Module
 * Bundles all Outcomes components together
 */
@Module({
  controllers: [OutcomesController],
  providers: [OutcomesService, SupabaseService],
  exports: [OutcomesService],
})
export class OutcomesModule {} 