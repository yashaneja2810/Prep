import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

/**
 * Documents Controller
 * Handles API endpoints for topic documents
 * Task 4.3 requirement from tasks.md
 */
@ApiTags('Documents')
@Controller('docs')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Create a new document
   * POST /api/documents
   */
  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiBody({
    type: CreateDocumentDto,
    description: 'Document data to create',
    examples: {
      example1: {
        summary: 'Create JS Variables document',
        value: {
          topic_id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'JavaScript variables are containers for storing data values. In JavaScript, variables can be declared using var, let, or const keywords...',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Document created successfully',
        data: {
          id: '456e7890-e12b-34d5-a678-901234567890',
          topic_id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'JavaScript variables are containers for storing data values...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or invalid topic_id',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/documents',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Topic not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/documents',
      },
    },
  })
  async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.createDocument(createDocumentDto);
  }

  /**
   * Get all documents
   * GET /api/documents
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all documents' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Documents retrieved successfully',
        data: [
          {
            id: '456e7890-e12b-34d5-a678-901234567890',
            topic_id: '123e4567-e89b-12d3-a456-426614174000',
            content: 'JavaScript variables are containers for storing data values...',
          },
        ],
      },
    },
  })
  async findAllDocuments() {
    return this.documentsService.findAllDocuments();
  }

  /**
   * Get document by ID
   * GET /api/documents/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a document by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the document to retrieve',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Document retrieved successfully',
        data: {
          id: '456e7890-e12b-34d5-a678-901234567890',
          topic_id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'JavaScript variables are containers for storing data values...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Document not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/documents/456e7890-e12b-34d5-a678-901234567890',
      },
    },
  })
  async findDocumentById(@Param('id') id: string) {
    return this.documentsService.findDocumentById(id);
  }

  /**
   * Update document by ID
   * PUT /api/documents/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a document by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the document to update',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiBody({
    type: UpdateDocumentDto,
    description: 'Document data to update',
    examples: {
      example1: {
        summary: 'Update document content',
        value: {
          content: 'Updated JavaScript variables content with more detailed examples...',
        },
      },
      example2: {
        summary: 'Move document to different topic',
        value: {
          topic_id: '789e0123-e45b-67d8-a901-234567890123',
          content: 'Updated content for new topic...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Document updated successfully',
        data: {
          id: '456e7890-e12b-34d5-a678-901234567890',
          topic_id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Updated JavaScript variables content...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Document not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/documents/456e7890-e12b-34d5-a678-901234567890',
      },
    },
  })
  async updateDocument(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(id, updateDocumentDto);
  }

  /**
   * Delete document by ID
   * DELETE /api/documents/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the document to delete',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Document deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Document not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/documents/456e7890-e12b-34d5-a678-901234567890',
      },
    },
  })
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}

/**
 * Topics Controller Extension for Documents
 * Provides nested route for getting documents by topic
 * GET /api/topics/:id/documents
 */
@ApiTags('Topics')
@Controller('topics')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TopicsDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Get documents by topic ID
   * GET /api/topics/:id/documents
   * Task 4.3 requirement - nested route for topic documents
   */
  @Get(':id/documents')
  @ApiOperation({ summary: 'Retrieve all documents for a specific topic' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the topic to get documents for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic documents retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Topic documents retrieved successfully',
        data: [
          {
            id: '456e7890-e12b-34d5-a678-901234567890',
            topic_id: '123e4567-e89b-12d3-a456-426614174000',
            content: 'JavaScript variables are containers for storing data values...',
          },
          {
            id: '789e0123-e45b-67d8-a901-234567890123',
            topic_id: '123e4567-e89b-12d3-a456-426614174000',
            content: 'More detailed examples of JavaScript variables...',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Topic not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/topics/123e4567-e89b-12d3-a456-426614174000/documents',
      },
    },
  })
  async findDocumentsByTopicId(@Param('id') topicId: string) {
    return this.documentsService.findDocumentsByTopicId(topicId);
  }
} 