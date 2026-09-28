import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  UsePipes,
  ParseFilePipe,
  FileTypeValidator
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import {
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../../common/helpers/api-response.helper';

/**
 * Videos Controller
 * Handles API endpoints for topic videos
 */
@ApiTags('Videos')
@Controller('videos')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  /**
   * Create a new video
   * POST /api/videos
   */
  @Post()
  @ApiOperation({ summary: 'Create a new video' })
  @ApiBody({
    type: CreateVideoDto,
    description: 'Video data to create',
    examples: {
      example1: {
        summary: 'Create JavaScript Introduction Video',
        value: {
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          url: 'https://supabase-storage-url.com/videos/intro-to-javascript.mp4',
          title: 'Introduction to JavaScript',
          duration: 600,
          transcript: 'In this video, we will explore the basics of JavaScript...',
          summary: 'This video covers JavaScript fundamentals including variables, functions, and basic syntax.',
          timestamps: '00:00 Introduction\n02:30 Variables\n05:45 Functions',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or invalid topic_id',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async createVideo(@Body() createVideoDto: CreateVideoDto) {
    const video = await this.videosService.createVideo(createVideoDto);
    return createdResponse(video, 'Video created successfully');
  }

  /**
   * Upload a video file
   * POST /api/videos/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a video file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        topic_id: { 
          type: 'string', 
          format: 'uuid',
          example: '4c44509e-0654-495e-9118-850c578c5786'
        },
        title: { 
          type: 'string',
          example: 'Introduction to JavaScript'
        },
        duration: {
          type: 'number',
          example: 600,
          description: 'Duration in seconds'
        },
        transcript: {
          type: 'string',
          example: 'In this video, we will explore the basics of JavaScript...'
        },
        summary: {
          type: 'string',
          example: 'This video covers JavaScript fundamentals including variables, functions, and basic syntax.'
        },
        timestamps: {
          type: 'string',
          example: '00:00 Introduction\n02:30 Variables\n05:45 Functions'
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['topic_id', 'title', 'duration', 'transcript', 'summary', 'timestamps', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or validation failed',
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(mp4|webm|ogg|mov)' })
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('topic_id') topicId: string,
    @Body('title') title: string,
    @Body('duration') duration: number,
    @Body('transcript') transcript: string,
    @Body('summary') summary: string,
    @Body('timestamps') timestamps: string,
  ) {
    // Upload the file to storage
    const uploadResult = await this.videosService.uploadVideoFile(file, topicId);
    
    // Create the database record
    const createVideoDto: CreateVideoDto = {
      topic_id: topicId,
      url: uploadResult.url,
      title: title,
      duration: duration,
      transcript: transcript,
      summary: summary,
      timestamps: timestamps,
    };
    
    const video = await this.videosService.createVideo(createVideoDto);
    return createdResponse(
      { ...video, file_details: uploadResult },
      'Video file uploaded successfully'
    );
  }

  /**
   * Get all videos
   * GET /api/videos
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all videos or filter by topic_id' })
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
  })
  async findAllVideos(@Query('topic_id') topicId?: string) {
    let videos;
    if (topicId) {
      videos = await this.videosService.findVideosByTopicId(topicId);
      return successResponse(videos, 'Videos for topic retrieved successfully');
    } else {
      videos = await this.videosService.findAllVideos();
      return successResponse(videos, 'Videos retrieved successfully');
    }
  }

  /**
   * Get videos by topic ID
   * GET /api/videos/topics/:topicId
   */
  @Get('topics/:topicId')
  @ApiOperation({ summary: 'Retrieve all videos for a specific topic' })
  @ApiParam({
    name: 'topicId',
    description: 'UUID of the topic to retrieve videos for',
    example: '4c44509e-0654-495e-9118-850c578c5786',
  })
  @ApiResponse({
    status: 200,
    description: 'Videos for topic retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async findVideosByTopicId(@Param('topicId') topicId: string) {
    const videos = await this.videosService.findVideosByTopicId(topicId);
    return successResponse(videos, 'Videos for topic retrieved successfully');
  }

  /**
   * Get video by ID
   * GET /api/videos/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a video by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the video to retrieve',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Video retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Video not found',
  })
  async findVideoById(@Param('id') id: string) {
    const video = await this.videosService.findVideoById(id);
    return successResponse(video, 'Video retrieved successfully');
  }

  /**
   * Update video by ID
   * PUT /api/videos/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a video by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the video to update',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiBody({
    type: UpdateVideoDto,
    description: 'Video data to update',
    examples: {
      example1: {
        summary: 'Update video title',
        value: {
          title: 'Advanced JavaScript Concepts',
        },
      },
      example2: {
        summary: 'Update video metadata',
        value: {
          duration: 720,
          transcript: 'Updated transcript content...',
          summary: 'Updated summary content...',
          timestamps: 'Updated timestamps...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Video not found',
  })
  async updateVideo(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    const video = await this.videosService.updateVideo(id, updateVideoDto);
    return updatedResponse(video, 'Video updated successfully');
  }

  /**
   * Delete video by ID
   * DELETE /api/videos/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the video to delete',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Video deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Video not found',
  })
  async deleteVideo(@Param('id') id: string) {
    const result = await this.videosService.deleteVideo(id);
    return deletedResponse('Video deleted successfully');
  }
}

 