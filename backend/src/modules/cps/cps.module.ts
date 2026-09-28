import { Module } from '@nestjs/common';
import { CpsController } from './cps.controller';
import { CpsService } from './cps.service';
import { SupabaseModule } from '../../core/database/supabase.module';

/**
 * CPs Module
 * Bundle CP components
 * Following Task 7.5 requirements from tasks.md
 */
@Module({
  imports: [SupabaseModule],
  controllers: [CpsController],
  providers: [CpsService],
  exports: [CpsService],
})
export class CpsModule {}
