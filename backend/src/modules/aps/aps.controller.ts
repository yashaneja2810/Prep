import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ApsService } from './aps.service';
import { CreateApDto } from './dto/create-ap.dto';
import { UpdateApDto } from './dto/update-ap.dto';
import { CreateBatchApDto } from './dto/create-batch-ap.dto';
import {
  successResponse,
  createdResponse,
  deletedResponse,
} from '../../common/helpers/api-response.helper';
import { MESSAGES } from '../../common/helpers/string-const';

/**
 * APS Controller
 * Application Problems API endpoints
 * Based on schema from new_supabase.txt
 */
@ApiTags('Application Problems')
@Controller('aps')
export class ApsController {
  constructor(private readonly apsService: ApsService) {}

  /**
   * Create a single application problem
   * POST /aps endpoint
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an application problem',
    description: 'Creates a new application problem for a specific topic',
  })
  @ApiBody({
    description: 'Application problem creation data',
    type: CreateApDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Application problem created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Application problem created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            title: { type: 'string', example: 'Build a Todo List Application' },
            difficulty: { type: 'string', example: 'medium' },
            input: { type: 'string', example: 'User should be able to add, edit, and delete tasks' },
            expected_output: { type: 'string', example: 'A functional todo list with CRUD operations' },
            instruction: { type: 'string', example: 'Create a React component that manages a list of todos...' },
            objective: { type: 'string', example: 'Students will learn state management and CRUD operations' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or difficulty level' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async createAP(@Body() createApDto: CreateApDto) {
    const ap = await this.apsService.createAP(createApDto.topic_id, createApDto);
    return createdResponse(ap, 'Application problem created successfully');
  }

  /**
   * Create multiple application problems in batch for a specific topic
   * POST /aps/batch endpoint
   */
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create multiple application problems in batch',
    description: 'Creates multiple application problems for a specific topic in a single request',
  })
  @ApiBody({
    description: 'Batch application problems creation data',
    type: CreateBatchApDto,
    examples: {
      example1: {
        summary: 'Example batch creation',
        description: 'Example of creating multiple APs for a topic',
        value: {
          topic_id: 't123',
          aps: [
            {
              title: 'Build a Weather Dashboard',
              instructions: [
                'Create a web application that fetches weather data from a public API',
                'Display current weather and 5-day forecast',
                'Implement error handling for API failures',
                'Add a loading state while data is being fetched'
              ],
              objectives: [
                'Practice working with async/await',
                'Learn to handle API errors gracefully',
                'Implement loading states for better UX'
              ],
              input: 'City name or coordinates',
              expected_output: 'A functional weather dashboard showing current conditions and forecast',
              difficulty: 'intermediate'
            },
            {
              title: 'Promise-based File Reader',
              instructions: [
                'Create a promise-based wrapper for the FileReader API',
                'Implement methods for reading text, binary, and data URLs',
                'Add proper error handling'
              ],
              objectives: [
                'Practice creating promise-based APIs',
                'Learn to work with browser file APIs',
                'Understand error propagation in promises'
              ],
              expected_output: 'A reusable FileReader utility that returns promises',
              difficulty: 'easy'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Application problems created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Application problems created successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              title: { type: 'string', example: 'Build a Weather Dashboard' },
              difficulty: { type: 'string', example: 'intermediate' },
              input: { type: 'string', example: 'City name or coordinates' },
              expected_output: { type: 'string', example: 'A functional weather dashboard' },
              instruction: { type: 'string', example: 'Create a web application...' },
              objective: { type: 'string', example: 'Practice working with async/await...' },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data, difficulty level, or validation errors' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async createBatchAPs(@Body() createBatchApDto: CreateBatchApDto) {
    const aps = await this.apsService.createBatchAPs(createBatchApDto);
    return createdResponse(aps, 'Application problems created successfully');
  }

  /**
   * Get all application problems
   * GET /aps endpoint
   */
  @Get()
  @ApiOperation({
    summary: 'Get all application problems',
    description: 'Retrieves a list of all application problems, ordered by creation date (newest first)',
  })
  @ApiResponse({
    status: 200,
    description: 'Application problems retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Application problems retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              title: { type: 'string', example: 'Build a Todo List Application' },
              difficulty: { type: 'string', example: 'medium' },
              input: { type: 'string', example: 'User should be able to add, edit, and delete tasks' },
              expected_output: { type: 'string', example: 'A functional todo list with CRUD operations' },
              instruction: { type: 'string', example: 'Create a React component that manages a list of todos...' },
              objective: { type: 'string', example: 'Students will learn state management and CRUD operations' },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  async findAllAPs() {
    const aps = await this.apsService.findAllAPs();
    return successResponse(aps, 'Application problems retrieved successfully');
  }

  /**
   * Get application problems by topic ID
   * GET /aps/topics/:topicId endpoint
   */
  @Get('topics/:topicId')
  @ApiOperation({
    summary: 'Get application problems by topic ID',
    description: 'Retrieves all application problems for a specific topic',
  })
  @ApiParam({
    name: 'topicId',
    description: 'Topic ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic application problems retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Topic application problems retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              title: { type: 'string', example: 'Build a Todo List Application' },
              difficulty: { type: 'string', example: 'medium' },
              input: { type: 'string', example: 'User should be able to add, edit, and delete tasks' },
              expected_output: { type: 'string', example: 'A functional todo list with CRUD operations' },
              instruction: { type: 'string', example: 'Create a React component that manages a list of todos...' },
              objective: { type: 'string', example: 'Students will learn state management and CRUD operations' },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findAPsByTopicId(@Param('topicId') topicId: string) {
    const aps = await this.apsService.findAPsByTopicId(topicId);
    return successResponse(aps, 'Topic application problems retrieved successfully');
  }

  /**
   * Get a single application problem by ID
   * GET /aps/:id endpoint
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get an application problem by ID',
    description: 'Retrieves a single application problem by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Application Problem ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Application problem retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Application problem retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            title: { type: 'string', example: 'Build a Todo List Application' },
            difficulty: { type: 'string', example: 'medium' },
            input: { type: 'string', example: 'User should be able to add, edit, and delete tasks' },
            expected_output: { type: 'string', example: 'A functional todo list with CRUD operations' },
            instruction: { type: 'string', example: 'Create a React component that manages a list of todos...' },
            objective: { type: 'string', example: 'Students will learn state management and CRUD operations' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Application problem not found' })
  async findAPById(@Param('id') id: string) {
    const ap = await this.apsService.findAPById(id);
    return successResponse(ap, 'Application problem retrieved successfully');
  }

  /**
   * Update an application problem
   * PATCH /aps/:id endpoint
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an application problem',
    description: 'Updates an existing application problem with provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Application Problem ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Application problem update data',
    type: UpdateApDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Application problem updated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Application problem updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            title: { type: 'string', example: 'Updated Todo List Application' },
            difficulty: { type: 'string', example: 'hard' },
            input: { type: 'string', example: 'Updated input requirements...' },
            expected_output: { type: 'string', example: 'Updated expected output...' },
            instruction: { type: 'string', example: 'Updated instructions...' },
            objective: { type: 'string', example: 'Updated learning objective...' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Application problem not found' })
  async updateAP(@Param('id') id: string, @Body() updateApDto: UpdateApDto) {
    const ap = await this.apsService.updateAP(id, updateApDto);
    return successResponse(ap, 'Application problem updated successfully');
  }

  /**
   * Delete an application problem
   * DELETE /aps/:id endpoint
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an application problem',
    description: 'Deletes an application problem by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Application Problem ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Application problem deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Application problem deleted successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            topic_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            title: { type: 'string', example: 'Build a Todo List Application' },
            difficulty: { type: 'string', example: 'medium' },
            input: { type: 'string', example: 'User should be able to add, edit, and delete tasks' },
            expected_output: { type: 'string', example: 'A functional todo list with CRUD operations' },
            instruction: { type: 'string', example: 'Create a React component that manages a list of todos...' },
            objective: { type: 'string', example: 'Students will learn state management and CRUD operations' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Application problem not found' })
  async deleteAP(@Param('id') id: string) {
    const result = await this.apsService.deleteAP(id);
    return deletedResponse(result.message);
  }
} 
