import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';

/**
 * Videos Service
 * Handles business logic for topic videos
 */
@Injectable()
export class VideosService extends BaseService {
  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a new video
   * Validates that the topic exists before creating
   */
  async createVideo(createVideoDto: CreateVideoDto) {
    // Validate that the topic exists
    await this.validateTopicExists(createVideoDto.topic_id);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.VIDEOS)
      .insert([createVideoDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(MESSAGES.VIDEO_CREATE_ERROR + `: ${error.message}`);
    }

    return data;
  }

  /**
   * Find all videos
   */
  async findAllVideos() {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.VIDEOS)
      .select('*');

    if (error) {
      throw new BadRequestException(`Failed to fetch videos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find video by ID
   */
  async findVideoById(id: string) {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.VIDEOS)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Video not found');
    }

    return data;
  }

  /**
   * Find videos by topic ID
   */
  async findVideosByTopicId(topicId: string) {
    // Validate that the topic exists
    await this.validateTopicExists(topicId);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.VIDEOS)
      .select('*')
      .eq('topic_id', topicId);

    if (error) {
      throw new BadRequestException(`Failed to fetch videos for topic: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update video by ID
   */
  async updateVideo(id: string, updateVideoDto: UpdateVideoDto) {
    // Topic ID and URL cannot be updated
    if ('topic_id' in updateVideoDto || 'url' in updateVideoDto) {
      throw new BadRequestException('Cannot update topic_id or url fields');
    }

    const { data, error } = await this.supabaseService.client
      .from(TABLES.VIDEOS)
      .update(updateVideoDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Video not found');
    }

    return data;
  }

  /**
   * Delete video by ID
   */
  async deleteVideo(id: string) {
    // First, get the video to check if it exists and to get the URL
    const video = await this.findVideoById(id);

    // Extract the filename from the URL
    // URL format is typically: https://[project].supabase.co/storage/v1/object/public/videos/[filename]
    const urlParts = video.url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete the file from storage first
    if (fileName) {
      this.logger.log(`Attempting to delete file from storage: ${fileName}`);
      
      const { error: storageError } = await this.supabaseService.client
        .storage
        .from('videos')
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
      .from(TABLES.VIDEOS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(MESSAGES.VIDEO_DELETE_ERROR + `: ${error.message}`);
    }

    return { success: true, message: MESSAGES.VIDEO_DELETED };
  }

  /**
   * Upload a video file to Supabase Storage
   */
  async uploadVideoFile(file: Express.Multer.File, topicId: string) {
    try {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(MESSAGES.VIDEO_INVALID_FILE_TYPE);
      }

      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${topicId}_${timestamp}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabaseService.client
        .storage
        .from('videos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw new BadRequestException(MESSAGES.VIDEO_UPLOAD_ERROR + `: ${error.message}`);
      }

      // Generate public URL
      const { data: urlData } = this.supabaseService.client
        .storage
        .from('videos')
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