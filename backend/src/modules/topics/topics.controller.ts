import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import {
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../../common/helpers/api-response.helper';
import { TOPIC_STATUS } from '../../common/helpers/string-const';
import { VideosService } from '../videos/videos.service';

/**
 * Topics Controller
 * Set up Topics API endpoints
 * Following Task 3.3 requirements from tasks.md
 */
@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly videosService: VideosService,
  ) {}

  /**
   * Create a new topic
   * POST /topics endpoint - Required by Task 3.3
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new topic',
    description: 'Creates a new topic with the provided information',
  })
  @ApiBody({
    type: CreateTopicDto,
    description: 'Topic creation data',
    examples: {
      example1: {
        summary: 'JavaScript Variables Topic',
        value: {
          topic_code: 'INTRO_JS_001',
          title: 'Introduction to JavaScript Variables',
          description: 'Learn about JavaScript variables, data types, and declaration methods',
          status: 'draft',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Topic created successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Resource created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          topic_code: 'INTRO_JS_001',
          title: 'Introduction to JavaScript Variables',
          description: 'Learn about JavaScript variables, data types, and declaration methods',
          status: 'draft',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Topic with the same topic_code already exists',
  })
  async createTopic(@Body() createTopicDto: CreateTopicDto) {
    const topic = await this.topicsService.createTopic(createTopicDto);
    return createdResponse(topic, 'Topic created successfully');
  }

  /**
   * Get all topics
   * GET /topics endpoint - Required by Task 3.3
   */
  @Get()
  @ApiOperation({
    summary: 'Get all topics',
    description: 'Retrieves a list of all topics, ordered by creation date (newest first)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter topics by status',
    enum: [TOPIC_STATUS.DRAFT, TOPIC_STATUS.PUBLISHED],
    example: TOPIC_STATUS.DRAFT,
  })
  @ApiResponse({
    status: 200,
    description: 'Topics retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Success',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            topic_code: 'INTRO_JS_001',
            title: 'Introduction to JavaScript Variables',
            description: 'Learn about JavaScript variables, data types, and declaration methods',
            status: 'draft',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
        ],
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  async findAllTopics(@Query('status') status?: string) {
    let topics;

    if (status) {
      topics = await this.topicsService.findTopicsByStatus(status);
    } else {
      topics = await this.topicsService.findAllTopics();
    }

    return successResponse(topics, 'Topics retrieved successfully');
  }

  /**
   * Get topic by ID
   * GET /topics/:id endpoint - Required by Task 3.3
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get topic by ID',
    description: 'Retrieves a specific topic by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Topic ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Success',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          topic_code: 'INTRO_JS_001',
          title: 'Introduction to JavaScript Variables',
          description: 'Learn about JavaScript variables, data types, and declaration methods',
          status: 'draft',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async findTopicById(@Param('id') id: string) {
    const topic = await this.topicsService.findTopicById(id);
    return successResponse(topic, 'Topic retrieved successfully');
  }

  /**
   * Get videos by topic ID
   * GET /topics/:id/videos
   */
  @Get(':id/videos')
  @ApiOperation({
    summary: 'Get videos by topic ID',
    description: 'Retrieves all videos associated with a specific topic',
  })
  @ApiParam({
    name: 'id',
    description: 'Topic ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async findVideosByTopicId(@Param('id') id: string) {
    const videos = await this.videosService.findVideosByTopicId(id);
    return successResponse(videos, 'Videos for topic retrieved successfully');
  }

  /**
   * Update topic by ID
   * PUT /topics/:id endpoint
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update topic by ID',
    description: 'Updates a specific topic with the provided information',
  })
  @ApiParam({
    name: 'id',
    description: 'Topic ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateTopicDto,
    description: 'Topic update data',
    examples: {
      example1: {
        summary: 'Update topic status',
        value: {
          status: 'published',
        },
      },
      example2: {
        summary: 'Update topic title and description',
        value: {
          title: 'Advanced JavaScript Variables',
          description: 'Deep dive into JavaScript variables, scoping, and advanced concepts',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Topic updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Topic with the same topic_code already exists',
  })
  async updateTopic(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    const topic = await this.topicsService.updateTopic(id, updateTopicDto);
    return updatedResponse(topic, 'Topic updated successfully');
  }

  /**
   * Delete topic by ID
   * DELETE /topics/:id endpoint
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete topic by ID',
    description: 'Deletes a specific topic by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Topic ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete topic that is in use',
  })
  async deleteTopic(@Param('id') id: string) {
    await this.topicsService.deleteTopic(id);
    return deletedResponse('Topic deleted successfully');
  }
} 