import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsTestController } from './topics-test.controller';
import { TopicsService } from './topics.service';
import { VideosModule } from '../videos/videos.module';

/**
 * Topics Module
 * Bundle Topics components
 * Following Task 3.4 requirements from tasks.md
 */
@Module({
  imports: [VideosModule],
  controllers: [TopicsController, TopicsTestController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {} 