import { Module } from '@nestjs/common';
import { DocumentsController, TopicsDocumentsController } from './documents.controller';
import { DocumentsTestController } from './documents-test.controller';
import { DocumentsService } from './documents.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { TopicsService } from '../topics/topics.service';

/**
 * Documents Module
 * Bundles all Documents components together
 * Task 4.4 requirement from tasks.md
 */
@Module({
  controllers: [DocumentsController, TopicsDocumentsController, DocumentsTestController],
  providers: [DocumentsService, TopicsService, SupabaseService],
  exports: [DocumentsService],
})
export class DocumentsModule {} 