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
  UseInterceptors,
  UploadedFile,
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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { createdResponse } from '../../common/helpers/api-response.helper';

/**
 * Notes Controller
 * Handles API endpoints for topic notes
 */
@ApiTags('Notes')
@Controller('notes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Create a new note
   * POST /api/notes
   */
  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiBody({
    type: CreateNoteDto,
    description: 'Note data to create',
    examples: {
      example1: {
        summary: 'Create Asynchronous Programming Note',
        value: {
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          content: 'Asynchronous programming is essential for handling operations that might take time to complete without blocking the main thread.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Note created successfully',
        data: {
          id: '456e7890-e12b-34d5-a678-901234567890',
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          content: 'Asynchronous programming is essential for handling operations that might take time to complete without blocking the main thread.',
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
        path: '/api/notes',
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
        path: '/api/notes',
      },
    },
  })
  async createNote(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(createNoteDto);
  }

  /**
   * Get all notes
   * GET /api/notes
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all notes' })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Notes retrieved successfully',
        data: [
          {
            id: '456e7890-e12b-34d5-a678-901234567890',
            topic_id: '4c44509e-0654-495e-9118-850c578c5786',
            content: 'Asynchronous programming is essential for handling operations that might take time to complete without blocking the main thread.',
          },
        ],
      },
    },
  })
  async findAllNotes() {
    return this.notesService.findAllNotes();
  }

  /**
   * Get note by ID
   * GET /api/notes/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a note by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the note to retrieve',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Note retrieved successfully',
        data: {
          id: '456e7890-e12b-34d5-a678-901234567890',
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          content: 'Asynchronous programming is essential for handling operations that might take time to complete without blocking the main thread.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Note not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/notes/456e7890-e12b-34d5-a678-901234567890',
      },
    },
  })
  async findNoteById(@Param('id') id: string) {
    return this.notesService.findNoteById(id);
  }

  /**
   * Update note by ID
   * PUT /api/notes/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a note by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the note to update',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiBody({
    type: UpdateNoteDto,
    description: 'Note data to update',
    examples: {
      example1: {
        summary: 'Update note content',
        value: {
          content: 'Updated content about asynchronous programming with more detailed examples...',
        },
      },
      example2: {
        summary: 'Move note to different topic',
        value: {
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          content: 'Updated content for new topic...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Note updated successfully',
        data: {
          id: '456e7890-e12b-34d5-a678-901234567890',
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          content: 'Updated content about asynchronous programming with more detailed examples...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Note not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/notes/456e7890-e12b-34d5-a678-901234567890',
      },
    },
  })
  async updateNote(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  /**
   * Delete note by ID
   * DELETE /api/notes/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the note to delete',
    example: '456e7890-e12b-34d5-a678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Note deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Note not found',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/notes/456e7890-e12b-34d5-a678-901234567890',
      },
    },
  })
  async deleteNote(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }

  /**
   * Upload an image for notes
   * POST /api/notes/upload-image
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for use in notes' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (JPEG, PNG, GIF, WebP)',
        },
        note_id: {
          type: 'string',
          description: 'Optional ID of the note this image is associated with',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: 'https://example.supabase.co/storage/v1/object/public/notes-images/note_default_1234567890.png',
          fileName: 'note_default_1234567890.png',
          originalName: 'example.png',
          size: 123456,
          mimeType: 'image/png',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/notes/upload-image',
      },
    },
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('note_id') noteId?: string,
  ) {
    const uploadResult = await this.notesService.uploadImage(file, noteId || 'default');
    return createdResponse(uploadResult, 'Image uploaded successfully');
  }

  /**
   * Delete an image
   * DELETE /api/notes/images/:fileName
   */
  @Delete('images/:fileName')
  @ApiOperation({ summary: 'Delete an image by filename' })
  @ApiParam({
    name: 'fileName',
    description: 'Filename of the image to delete',
    example: 'note_default_1234567890.png',
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Image deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid filename or deletion failed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Failed to delete image',
        timestamp: '2023-01-01T00:00:00Z',
        path: '/api/notes/images/note_default_1234567890.png',
      },
    },
  })
  async deleteImage(@Param('fileName') fileName: string) {
    return this.notesService.deleteImage(fileName);
  }
}

/**
 * Topics Controller Extension for Notes
 * Provides nested route for getting notes by topic
 * GET /api/topics/:id/notes
 */
@ApiTags('Topics')
@Controller('topics')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TopicsNotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Get notes by topic ID
   * GET /api/topics/:id/notes
   */
  @Get(':id/notes')
  @ApiOperation({ summary: 'Retrieve all notes for a specific topic' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the topic to get notes for',
    example: '4c44509e-0654-495e-9118-850c578c5786',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic notes retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Topic notes retrieved successfully',
        data: [
          {
            id: '456e7890-e12b-34d5-a678-901234567890',
            topic_id: '4c44509e-0654-495e-9118-850c578c5786',
            content: 'Asynchronous programming is essential for handling operations that might take time to complete without blocking the main thread.',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z',
          }
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
        path: '/api/topics/4c44509e-0654-495e-9118-850c578c5786/notes',
      },
    },
  })
  async findNotesByTopicId(@Param('id') topicId: string) {
    return this.notesService.findNotesByTopicId(topicId);
  }

  /**
   * Upload an image for a specific topic's note
   * POST /api/topics/:id/notes/upload-image
   */
  @Post(':id/notes/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a specific topic\'s note' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the topic',
    example: '12f9d508-1ac0-495b-a04f-45ff1a5b0d52',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (JPEG, PNG, GIF, WebP)',
        },
        note_id: {
          type: 'string',
          description: 'Optional ID of the note this image is associated with',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: 'https://example.supabase.co/storage/v1/object/public/notes-images/note_default_1234567890.png',
          fileName: 'note_default_1234567890.png',
          originalName: 'example.png',
          size: 123456,
          mimeType: 'image/png',
          topicId: '12f9d508-1ac0-495b-a04f-45ff1a5b0d52',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found',
  })
  async uploadImageForTopic(
    @Param('id') topicId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('note_id') noteId?: string,
  ) {
    // First validate that the topic exists
    await this.notesService.findNotesByTopicId(topicId);
    
    // Then upload the image, using topicId as part of the reference
    const uploadResult = await this.notesService.uploadImage(file, noteId || topicId);
    
    // Return the result with the topicId included
    return createdResponse(
      { ...uploadResult, topicId },
      'Image uploaded successfully'
    );
  }
} 