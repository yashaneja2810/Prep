import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { TopicsService } from '../topics/topics.service';

/**
 * Videos Module
 * Bundles all video components together
 */
@Module({
  controllers: [VideosController],
  providers: [VideosService, SupabaseService, TopicsService],
  exports: [VideosService],
})
export class VideosModule {} 