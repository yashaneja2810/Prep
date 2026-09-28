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
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { PptService } from './ppt.service';
import { CreatePptDto } from './dto/create-ppt.dto';
import { UpdatePptDto } from './dto/update-ppt.dto';
import {
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../../common/helpers/api-response.helper';

/**
 * PPT Controller
 * Handles API endpoints for topic presentations
 */
@ApiTags('Presentations')
@Controller('ppt')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PptController {
  constructor(private readonly pptService: PptService) {}

  /**
   * Create a new presentation
   * POST /api/ppt
   */
  @Post()
  @ApiOperation({ summary: 'Create a new presentation' })
  @ApiBody({
    type: CreatePptDto,
    description: 'Presentation data to create',
    examples: {
      example1: {
        summary: 'Create JavaScript Introduction Presentation',
        value: {
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          url: 'https://supabase-storage-url.com/presentations/intro-to-javascript.pdf',
          title: 'Introduction to JavaScript',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Presentation created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or invalid topic_id',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async createPpt(@Body() createPptDto: CreatePptDto) {
    const ppt = await this.pptService.createPpt(createPptDto);
    return createdResponse(ppt, 'Presentation created successfully');
  }

  /**
   * Upload a presentation file
   * POST /api/ppt/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a presentation file' })
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
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['topic_id', 'title', 'file'],
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
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(pdf|ppt|pptx)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('topic_id') topicId: string,
    @Body('title') title: string,
  ) {
    // Upload the file to storage
    const uploadResult = await this.pptService.uploadPptFile(file, topicId);
    
    // Create the database record
    const createPptDto: CreatePptDto = {
      topic_id: topicId,
      url: uploadResult.url,
      title: title,
    };
    
    const ppt = await this.pptService.createPpt(createPptDto);
    return createdResponse(
      { ...ppt, file_details: uploadResult },
      'Presentation file uploaded successfully'
    );
  }

  /**
   * Get all presentations
   * GET /api/ppt
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all presentations' })
  @ApiResponse({
    status: 200,
    description: 'Presentations retrieved successfully',
  })
  async findAllPpts() {
    const ppts = await this.pptService.findAllPpts();
    return successResponse(ppts, 'Presentations retrieved successfully');
  }

  /**
   * Get presentation by ID
   * GET /api/ppt/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a presentation by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the presentation to retrieve',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Presentation retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Presentation not found',
  })
  async findPptById(@Param('id') id: string) {
    const ppt = await this.pptService.findPptById(id);
    return successResponse(ppt, 'Presentation retrieved successfully');
  }

  /**
   * Update presentation by ID
   * PUT /api/ppt/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a presentation by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the presentation to update',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiBody({
    type: UpdatePptDto,
    description: 'Presentation data to update',
    examples: {
      example1: {
        summary: 'Update presentation title',
        value: {
          title: 'Advanced JavaScript Concepts',
        },
      },
      example2: {
        summary: 'Move presentation to different topic',
        value: {
          topic_id: '789e0123-e45b-67d8-a901-234567890123',
          title: 'JavaScript for a New Topic',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Presentation updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Presentation not found',
  })
  async updatePpt(
    @Param('id') id: string,
    @Body() updatePptDto: UpdatePptDto,
  ) {
    const ppt = await this.pptService.updatePpt(id, updatePptDto);
    return updatedResponse(ppt, 'Presentation updated successfully');
  }

  /**
   * Delete presentation by ID
   * DELETE /api/ppt/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a presentation by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the presentation to delete',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Presentation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Presentation not found',
  })
  async deletePpt(@Param('id') id: string) {
    await this.pptService.deletePpt(id);
    return deletedResponse('Presentation deleted successfully');
  }
}

/**
 * Topics Controller Extension for PPT
 * Provides nested route for getting presentations by topic
 * GET /api/topics/:id/ppt
 */
@ApiTags('Topics')
@Controller('topics')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TopicsPptController {
  constructor(private readonly pptService: PptService) {}

  /**
   * Get presentations by topic ID
   * GET /api/topics/:id/ppt
   */
  @Get(':id/ppt')
  @ApiOperation({ summary: 'Retrieve all presentations for a specific topic' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the topic to get presentations for',
    example: '4c44509e-0654-495e-9118-850c578c5786',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic presentations retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async findPptsByTopicId(@Param('id') topicId: string) {
    const ppts = await this.pptService.findPptsByTopicId(topicId);
    return successResponse(ppts, 'Topic presentations retrieved successfully');
  }
} 