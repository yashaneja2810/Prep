import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreatePptDto } from './dto/create-ppt.dto';
import { UpdatePptDto } from './dto/update-ppt.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';

/**
 * PPT Service
 * Handles business logic for topic presentations
 */
@Injectable()
export class PptService extends BaseService {
  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a new presentation
   * Validates that the topic exists before creating
   */
  async createPpt(createPptDto: CreatePptDto) {
    // Validate that the topic exists
    await this.validateTopicExists(createPptDto.topic_id);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.PPT)
      .insert([createPptDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(MESSAGES.PPT_CREATE_ERROR + `: ${error.message}`);
    }

    return data;
  }

  /**
   * Find all presentations
   */
  async findAllPpts() {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.PPT)
      .select('*');

    if (error) {
      throw new BadRequestException(`Failed to fetch presentations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find presentation by ID
   */
  async findPptById(id: string) {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.PPT)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.PPT_NOT_FOUND);
    }

    return data;
  }

  /**
   * Find presentations by topic ID
   */
  async findPptsByTopicId(topicId: string) {
    // Validate that the topic exists
    await this.validateTopicExists(topicId);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.PPT)
      .select('*')
      .eq('topic_id', topicId);

    if (error) {
      throw new BadRequestException(`Failed to fetch presentations for topic: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update presentation by ID
   */
  async updatePpt(id: string, updatePptDto: UpdatePptDto) {
    // If topic_id is being updated, validate the new topic exists
    if (updatePptDto.topic_id) {
      await this.validateTopicExists(updatePptDto.topic_id);
    }

    const { data, error } = await this.supabaseService.client
      .from(TABLES.PPT)
      .update(updatePptDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.PPT_NOT_FOUND);
    }

    return data;
  }

  /**
   * Delete presentation by ID
   */
  async deletePpt(id: string) {
    // First, get the presentation to check if it exists
    const ppt = await this.findPptById(id);

    // Extract the filename from the URL
    // URL format is typically: https://[project].supabase.co/storage/v1/object/public/presentations/[filename]
    const urlParts = ppt.url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete the file from storage first
    if (fileName) {
      this.logger.log(`Attempting to delete file from storage: ${fileName}`);
      
      const { error: storageError } = await this.supabaseService.client
        .storage
        .from('presentations')
        .remove([fileName]);
      
      if (storageError) {
        this.logger.warn(`Failed to delete file from storage: ${storageError.message}`);
        // Continue with database deletion even if file deletion fails
      } else {
        this.logger.log(`Successfully deleted file from storage: ${fileName}`);
      }
    }

    // Then delete the database record
    const { error } = await this.supabaseService.client
      .from(TABLES.PPT)
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Failed to delete presentation: ${error.message}`);
    }

    return { success: true, message: MESSAGES.PPT_DELETED };
  }

  /**
   * Upload a presentation file to Supabase Storage
   * This is a placeholder for the actual implementation
   */
  async uploadPptFile(file: Express.Multer.File, topicId: string) {
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only PDF and PowerPoint files are allowed.');
      }

      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${topicId}_${timestamp}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabaseService.client
        .storage
        .from('presentations')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw new BadRequestException(`Failed to upload file: ${error.message}`);
      }

      // Generate public URL
      const { data: urlData } = this.supabaseService.client
        .storage
        .from('presentations')
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
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
} 