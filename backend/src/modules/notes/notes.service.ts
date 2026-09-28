import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';

/**
 * Notes Service
 * Handles business logic for topic notes
 */
@Injectable()
export class NotesService extends BaseService {
  protected readonly logger = new Logger(NotesService.name);
  
  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a new note or update existing one for a topic
   * Ensures each topic has only one note
   */
  async createNote(createNoteDto: CreateNoteDto) {
    // Validate that the topic exists
    await this.validateTopicExists(createNoteDto.topic_id);

    // Check if a note already exists for this topic
    const { data: existingNotes, error: fetchError } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .select('id')
      .eq('topic_id', createNoteDto.topic_id);

    if (fetchError) {
      throw new BadRequestException(`Failed to check existing notes: ${fetchError.message}`);
    }

    // If a note exists, update it instead of creating a new one
    if (existingNotes && existingNotes.length > 0) {
      const { data, error } = await this.supabaseService.client
        .from(TABLES.NOTES)
        .update({ content: createNoteDto.content })
        .eq('id', existingNotes[0].id)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(MESSAGES.NOTE_UPDATE_ERROR + `: ${error.message}`);
      }

      return updatedResponse(data, 'Note updated successfully');
    }

    // If no note exists, create a new one
    const { data, error } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .insert([createNoteDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(MESSAGES.NOTE_CREATE_ERROR + `: ${error.message}`);
    }

    return createdResponse(data, 'Note created successfully');
  }

  /**
   * Find all notes
   */
  async findAllNotes() {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .select('*');

    if (error) {
      throw new BadRequestException(`Failed to fetch notes: ${error.message}`);
    }

    return successResponse(data || [], 'Notes retrieved successfully');
  }

  /**
   * Find note by ID
   */
  async findNoteById(id: string) {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOTE_NOT_FOUND);
    }

    return successResponse(data, 'Note retrieved successfully');
  }

  /**
   * Find notes by topic ID
   */
  async findNotesByTopicId(topicId: string) {
    // Validate that the topic exists
    await this.validateTopicExists(topicId);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .select('*')
      .eq('topic_id', topicId);

    if (error) {
      throw new BadRequestException(`Failed to fetch notes for topic: ${error.message}`);
    }

    return successResponse(data || [], 'Topic notes retrieved successfully');
  }

  /**
   * Update note by ID
   */
  async updateNote(id: string, updateNoteDto: UpdateNoteDto) {
    // If topic_id is being updated, validate the new topic exists
    if (updateNoteDto.topic_id) {
      await this.validateTopicExists(updateNoteDto.topic_id);
    }

    const { data, error } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .update(updateNoteDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOTE_NOT_FOUND);
    }

    return updatedResponse(data, 'Note updated successfully');
  }

  /**
   * Delete note by ID
   */
  async deleteNote(id: string) {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.NOTES)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.NOTE_NOT_FOUND);
    }

    return deletedResponse('Note deleted successfully');
  }

  /**
   * Private helper to validate that a topic exists
   */
  private async validateTopicExists(topicId: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.TOPICS)
      .select('id')
      .eq('id', topicId)
      .limit(1);

    if (error) {
      throw new BadRequestException(`Failed to validate topic: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(MESSAGES.TOPIC_NOT_FOUND);
    }
  }

  /**
   * Upload an image to Supabase Storage for notes
   * Returns a public URL that can be embedded in markdown
   */
  async uploadImage(file: Express.Multer.File, noteId: string = 'default') {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(MESSAGES.IMAGE_INVALID_FILE_TYPE);
      }

      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `note_${noteId}_${timestamp}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabaseService.client
        .storage
        .from('notes-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        this.logger.error(`Failed to upload image: ${error.message}`);
        throw new BadRequestException(MESSAGES.IMAGE_UPLOAD_ERROR + `: ${error.message}`);
      }

      // Generate public URL
      const { data: urlData } = this.supabaseService.client
        .storage
        .from('notes-images')
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      this.logger.error(`Image upload failed: ${error.message}`);
      throw new BadRequestException(`${MESSAGES.IMAGE_UPLOAD_ERROR}: ${error.message}`);
    }
  }

  /**
   * Delete an image from Supabase Storage
   */
  async deleteImage(fileName: string) {
    try {
      const { error } = await this.supabaseService.client
        .storage
        .from('notes-images')
        .remove([fileName]);
      
      if (error) {
        this.logger.warn(`Failed to delete image from storage: ${error.message}`);
        throw new BadRequestException(MESSAGES.IMAGE_DELETE_ERROR + `: ${error.message}`);
      }
      
      return deletedResponse('Image deleted successfully');
    } catch (error) {
      this.logger.error(`Image deletion failed: ${error.message}`);
      throw new BadRequestException(`${MESSAGES.IMAGE_DELETE_ERROR}: ${error.message}`);
    }
  }
} 