import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { NotesController, TopicsNotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { TopicsService } from '../topics/topics.service';

/**
 * Notes Module
 * Bundles all Notes components together
 */
@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [NotesController, TopicsNotesController],
  providers: [NotesService, TopicsService, SupabaseService],
  exports: [NotesService],
})
export class NotesModule {} 