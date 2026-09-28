import { Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { TopicsService } from '../topics/topics.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CreateTopicDto } from '../topics/dto/create-topic.dto';
import { STATUS } from '../../common/helpers/string-const';

/**
 * Notes Test Controller
 * Provides testing endpoints for Notes functionality
 */
@ApiTags('Notes Test')
@Controller('notes-test')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class NotesTestController {
  constructor(
    private readonly notesService: NotesService,
    private readonly topicsService: TopicsService,
  ) {}

  /**
   * Run all Notes tests
   * POST /api/notes-test/run-all-tests
   */
  @Post('run-all-tests')
  @ApiOperation({
    summary: 'Run comprehensive Notes module tests',
    description: 'Executes all CRUD operations and validations for Notes',
  })
  @ApiResponse({
    status: 200,
    description: 'Test results with pass/fail status',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Notes tests completed',
        data: {
          totalTests: 9,
          passed: 9,
          failed: 0,
          results: [
            { test: 'CREATE Topic for testing', status: 'PASS', details: 'Test topic created successfully' },
            { test: 'CREATE Note', status: 'PASS', details: 'Note created successfully' },
            { test: 'GET All Notes', status: 'PASS', details: 'Notes retrieved successfully' },
            { test: 'GET Note by ID', status: 'PASS', details: 'Note found by ID' },
            { test: 'GET Notes by Topic ID', status: 'PASS', details: 'Topic notes retrieved' },
            { test: 'UPDATE Note', status: 'PASS', details: 'Note updated successfully' },
            { test: 'Invalid Topic ID validation', status: 'PASS', details: 'Validation works correctly' },
            { test: 'DELETE Note', status: 'PASS', details: 'Note deleted successfully' },
            { test: 'CLEANUP Test Topic', status: 'PASS', details: 'Test data cleaned up' },
          ],
        },
      },
    },
  })
  async runAllTests() {
    const results: any[] = [];
    let passed = 0;
    let failed = 0;
    let testTopicId: string | null = null;
    let testNoteId: string | null = null;

    // Test 1: CREATE Topic for testing (prerequisite)
    try {
      const testTopicData: CreateTopicDto = {
        topic_code: `TEST_NOTE_TOPIC_${Date.now()}`,
        title: 'Test Topic for Note Testing',
        description: 'A topic created specifically for testing note operations',
        status: STATUS.ACTIVE,
      };

      const topicResponse = await this.topicsService.createTopic(testTopicData) as any;
      // Service returns raw data, not wrapped response
      if (topicResponse?.id) {
        testTopicId = topicResponse.id;
        results.push({
          test: 'CREATE Topic for testing',
          status: 'PASS',
          details: 'Test topic created successfully',
          data: { topicId: testTopicId },
        });
        passed++;
      } else {
        throw new Error('Topic creation failed - no ID returned');
      }
    } catch (error) {
      results.push({
        test: 'CREATE Topic for testing',
        status: 'FAIL',
        details: `Failed to create test topic: ${(error as Error).message}`,
      });
      failed++;
      // If we can't create a topic, we can't continue with most tests
      return {
        statusCode: 200,
        success: true,
        message: 'Notes tests completed (early termination due to topic creation failure)',
        data: { totalTests: 9, passed, failed, results },
      };
    }

    // Test 2: CREATE Note
    try {
      const testNoteData: CreateNoteDto = {
        topic_id: testTopicId!,
        content: 'This is test content for the note. It contains detailed information about asynchronous programming concepts.',
      };

      const createResponse = await this.notesService.createNote(testNoteData);
      if (createResponse.data?.id) {
        testNoteId = createResponse.data.id;
        results.push({
          test: 'CREATE Note',
          status: 'PASS',
          details: 'Note created successfully',
          data: createResponse.data,
        });
        passed++;
      } else {
        throw new Error('Note creation failed - no ID returned');
      }
    } catch (error) {
      results.push({
        test: 'CREATE Note',
        status: 'FAIL',
        details: `Failed to create note: ${(error as Error).message}`,
      });
      failed++;
    }

    // Test 3: GET All Notes
    try {
      const allNotesResponse = await this.notesService.findAllNotes();
      const hasOurNote = allNotesResponse.data?.some((note: any) => note.id === testNoteId);
      
      results.push({
        test: 'GET All Notes',
        status: hasOurNote ? 'PASS' : 'FAIL',
        details: hasOurNote 
          ? `Notes retrieved successfully. Found ${allNotesResponse.data?.length || 0} notes including our test note`
          : 'Notes retrieved but our test note not found',
        data: { count: allNotesResponse.data?.length || 0 },
      });
      
      if (hasOurNote) passed++;
      else failed++;
    } catch (error) {
      results.push({
        test: 'GET All Notes',
        status: 'FAIL',
        details: `Failed to get all notes: ${(error as Error).message}`,
      });
      failed++;
    }

    // Test 4: GET Note by ID
    if (testNoteId) {
      try {
        const noteResponse = await this.notesService.findNoteById(testNoteId);
        if (noteResponse.data?.id === testNoteId) {
          results.push({
            test: 'GET Note by ID',
            status: 'PASS',
            details: 'Note found by ID successfully',
            data: noteResponse.data,
          });
          passed++;
        } else {
          throw new Error('Note ID mismatch');
        }
      } catch (error) {
        results.push({
          test: 'GET Note by ID',
          status: 'FAIL',
          details: `Failed to get note by ID: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'GET Note by ID',
        status: 'SKIP',
        details: 'Skipped - no test note ID available',
      });
    }

    // Test 5: GET Notes by Topic ID
    if (testTopicId) {
      try {
        const topicNotesResponse = await this.notesService.findNotesByTopicId(testTopicId);
        const hasOurNote = topicNotesResponse.data?.some((note: any) => note.id === testNoteId);
        
        results.push({
          test: 'GET Notes by Topic ID',
          status: hasOurNote ? 'PASS' : 'FAIL',
          details: hasOurNote 
            ? `Topic notes retrieved successfully. Found ${topicNotesResponse.data?.length || 0} notes for the topic`
            : 'Topic notes retrieved but our test note not found',
          data: { count: topicNotesResponse.data?.length || 0 },
        });
        
        if (hasOurNote) passed++;
        else failed++;
      } catch (error) {
        results.push({
          test: 'GET Notes by Topic ID',
          status: 'FAIL',
          details: `Failed to get notes by topic ID: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'GET Notes by Topic ID',
        status: 'SKIP',
        details: 'Skipped - no test topic ID available',
      });
    }

    // Test 6: UPDATE Note
    if (testNoteId) {
      try {
        const updateData: UpdateNoteDto = {
          content: 'Updated content for the test note with more detailed examples.',
        };
        
        const updateResponse = await this.notesService.updateNote(testNoteId, updateData);
        if (updateResponse.data?.content === updateData.content) {
          results.push({
            test: 'UPDATE Note',
            status: 'PASS',
            details: 'Note updated successfully',
            data: updateResponse.data,
          });
          passed++;
        } else {
          throw new Error('Note content not updated correctly');
        }
      } catch (error) {
        results.push({
          test: 'UPDATE Note',
          status: 'FAIL',
          details: `Failed to update note: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'UPDATE Note',
        status: 'SKIP',
        details: 'Skipped - no test note ID available',
      });
    }

    // Test 7: Invalid Topic ID validation
    try {
      const invalidTopicData: CreateNoteDto = {
        topic_id: '00000000-0000-0000-0000-000000000000', // Non-existent topic ID
        content: 'This should fail validation',
      };
      
      await this.notesService.createNote(invalidTopicData);
      
      // If we get here, the validation failed
      results.push({
        test: 'Invalid Topic ID validation',
        status: 'FAIL',
        details: 'Validation failed - allowed creation with invalid topic ID',
      });
      failed++;
    } catch (error) {
      // This is expected behavior
      results.push({
        test: 'Invalid Topic ID validation',
        status: 'PASS',
        details: 'Validation works correctly - rejected invalid topic ID',
      });
      passed++;
    }

    // Test 8: DELETE Note
    if (testNoteId) {
      try {
        const deleteResponse = await this.notesService.deleteNote(testNoteId);
        results.push({
          test: 'DELETE Note',
          status: 'PASS',
          details: 'Note deleted successfully',
        });
        passed++;
        
        // Verify deletion
        try {
          await this.notesService.findNoteById(testNoteId);
          results[results.length - 1].status = 'FAIL';
          results[results.length - 1].details = 'Note still exists after deletion';
          passed--;
          failed++;
        } catch (error) {
          // This is expected - note should not be found
        }
      } catch (error) {
        results.push({
          test: 'DELETE Note',
          status: 'FAIL',
          details: `Failed to delete note: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'DELETE Note',
        status: 'SKIP',
        details: 'Skipped - no test note ID available',
      });
    }

    // Test 9: CLEANUP Test Topic
    if (testTopicId) {
      try {
        await this.topicsService.deleteTopic(testTopicId);
        results.push({
          test: 'CLEANUP Test Topic',
          status: 'PASS',
          details: 'Test data cleaned up successfully',
        });
        passed++;
      } catch (error) {
        results.push({
          test: 'CLEANUP Test Topic',
          status: 'FAIL',
          details: `Failed to clean up test data: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'CLEANUP Test Topic',
        status: 'SKIP',
        details: 'Skipped - no test topic ID available',
      });
    }

    // Return overall results
    return {
      statusCode: 200,
      success: true,
      message: 'Notes tests completed',
      data: {
        totalTests: 9,
        passed,
        failed,
        results,
      },
    };
  }
} 