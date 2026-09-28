import { Module } from '@nestjs/common';
import { PptController, TopicsPptController } from './ppt.controller';
import { PptService } from './ppt.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { TopicsService } from '../topics/topics.service';

/**
 * PPT Module
 * Bundles all PPT components together
 */
@Module({
  controllers: [PptController, TopicsPptController],
  providers: [PptService, SupabaseService, TopicsService],
  exports: [PptService],
})
export class PptModule {} 