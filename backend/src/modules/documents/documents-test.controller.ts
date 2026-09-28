import { Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { TopicsService } from '../topics/topics.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateTopicDto } from '../topics/dto/create-topic.dto';
import { TOPIC_STATUS } from '../../common/helpers/string-const';

/**
 * Documents Test Controller
 * Provides testing endpoints for Documents functionality
 * Similar to Topics test controller for comprehensive testing
 */
@ApiTags('Documents Test')
@Controller('documents-test')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DocumentsTestController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly topicsService: TopicsService,
  ) {}

  /**
   * Run all Documents tests
   * POST /api/documents-test/run-all-tests
   */
  @Post('run-all-tests')
  @ApiOperation({
    summary: 'Run comprehensive Documents module tests',
    description: 'Executes all CRUD operations and validations for Documents',
  })
  @ApiResponse({
    status: 200,
    description: 'Test results with pass/fail status',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'Documents tests completed',
        data: {
          totalTests: 9,
          passed: 9,
          failed: 0,
          results: [
            { test: 'CREATE Topic for testing', status: 'PASS', details: 'Test topic created successfully' },
            { test: 'CREATE Document', status: 'PASS', details: 'Document created successfully' },
            { test: 'GET All Documents', status: 'PASS', details: 'Documents retrieved successfully' },
            { test: 'GET Document by ID', status: 'PASS', details: 'Document found by ID' },
            { test: 'GET Documents by Topic ID', status: 'PASS', details: 'Topic documents retrieved' },
            { test: 'UPDATE Document', status: 'PASS', details: 'Document updated successfully' },
            { test: 'Invalid Topic ID validation', status: 'PASS', details: 'Validation works correctly' },
            { test: 'DELETE Document', status: 'PASS', details: 'Document deleted successfully' },
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
    let testDocumentId: string | null = null;

    // Test 1: CREATE Topic for testing (prerequisite)
    try {
      const testTopicData: CreateTopicDto = {
        topic_code: `TEST_DOC_TOPIC_${Date.now()}`,
        title: 'Test Topic for Document Testing',
        description: 'A topic created specifically for testing document operations',
        status: TOPIC_STATUS.DRAFT,
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
        message: 'Documents tests completed (early termination due to topic creation failure)',
        data: { totalTests: 9, passed, failed, results },
      };
    }

    // Test 2: CREATE Document
    try {
      const testDocumentData: CreateDocumentDto = {
        topic_id: testTopicId!,
        content: 'This is test content for the document. It contains detailed information about the test topic and serves as a comprehensive example of document content.',
      };

      const createResponse = await this.documentsService.createDocument(testDocumentData);
      if (createResponse.data?.id) {
        testDocumentId = createResponse.data.id;
        results.push({
          test: 'CREATE Document',
          status: 'PASS',
          details: 'Document created successfully',
          data: createResponse.data,
        });
        passed++;
      } else {
        throw new Error('Document creation failed - no ID returned');
      }
    } catch (error) {
      results.push({
        test: 'CREATE Document',
        status: 'FAIL',
        details: `Failed to create document: ${(error as Error).message}`,
      });
      failed++;
    }

    // Test 3: GET All Documents
    try {
      const allDocsResponse = await this.documentsService.findAllDocuments();
      const hasOurDocument = allDocsResponse.data?.some((doc: any) => doc.id === testDocumentId);
      
      results.push({
        test: 'GET All Documents',
        status: hasOurDocument ? 'PASS' : 'FAIL',
        details: hasOurDocument 
          ? `Documents retrieved successfully. Found ${allDocsResponse.data?.length || 0} documents including our test document`
          : 'Documents retrieved but our test document not found',
        data: { count: allDocsResponse.data?.length || 0 },
      });
      
      if (hasOurDocument) passed++;
      else failed++;
    } catch (error) {
      results.push({
        test: 'GET All Documents',
        status: 'FAIL',
        details: `Failed to get all documents: ${(error as Error).message}`,
      });
      failed++;
    }

    // Test 4: GET Document by ID
    if (testDocumentId) {
      try {
        const docResponse = await this.documentsService.findDocumentById(testDocumentId);
        if (docResponse.data?.id === testDocumentId) {
          results.push({
            test: 'GET Document by ID',
            status: 'PASS',
            details: 'Document found by ID successfully',
            data: docResponse.data,
          });
          passed++;
        } else {
          throw new Error('Document ID mismatch');
        }
      } catch (error) {
        results.push({
          test: 'GET Document by ID',
          status: 'FAIL',
          details: `Failed to get document by ID: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'GET Document by ID',
        status: 'SKIP',
        details: 'Skipped - no test document ID available',
      });
    }

    // Test 5: GET Documents by Topic ID
    if (testTopicId) {
      try {
        const topicDocsResponse = await this.documentsService.findDocumentsByTopicId(testTopicId);
        const hasOurDocument = topicDocsResponse.data?.some((doc: any) => doc.id === testDocumentId);
        
        results.push({
          test: 'GET Documents by Topic ID',
          status: hasOurDocument ? 'PASS' : 'FAIL',
          details: hasOurDocument 
            ? `Topic documents retrieved successfully. Found ${topicDocsResponse.data?.length || 0} documents for the topic`
            : 'Topic documents retrieved but our test document not found',
          data: { topicId: testTopicId, count: topicDocsResponse.data?.length || 0 },
        });
        
        if (hasOurDocument) passed++;
        else failed++;
      } catch (error) {
        results.push({
          test: 'GET Documents by Topic ID',
          status: 'FAIL',
          details: `Failed to get documents by topic ID: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'GET Documents by Topic ID',
        status: 'SKIP',
        details: 'Skipped - no test topic ID available',
      });
    }

    // Test 6: UPDATE Document
    if (testDocumentId) {
      try {
        const updateData: UpdateDocumentDto = {
          content: 'Updated content for the test document. This demonstrates the update functionality.',
        };

        const updateResponse = await this.documentsService.updateDocument(testDocumentId, updateData);
        if (updateResponse.data?.id === testDocumentId && updateResponse.data?.content === updateData.content) {
          results.push({
            test: 'UPDATE Document',
            status: 'PASS',
            details: 'Document updated successfully',
            data: updateResponse.data,
          });
          passed++;
        } else {
          throw new Error('Update response validation failed');
        }
      } catch (error) {
        results.push({
          test: 'UPDATE Document',
          status: 'FAIL',
          details: `Failed to update document: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'UPDATE Document',
        status: 'SKIP',
        details: 'Skipped - no test document ID available',
      });
    }

    // Test 7: Invalid Topic ID validation
    try {
      const invalidDocumentData: CreateDocumentDto = {
        topic_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        content: 'This should fail due to invalid topic_id',
      };

      await this.documentsService.createDocument(invalidDocumentData);
      // If we get here, the validation failed
      results.push({
        test: 'Invalid Topic ID validation',
        status: 'FAIL',
        details: 'Document creation should have failed with invalid topic_id',
      });
      failed++;
    } catch (error) {
      // This is expected - validation should fail
      results.push({
        test: 'Invalid Topic ID validation',
        status: 'PASS',
        details: 'Validation correctly rejected invalid topic_id',
        data: { error: (error as Error).message },
      });
      passed++;
    }

    // Test 8: DELETE Document
    if (testDocumentId) {
      try {
        const deleteResponse = await this.documentsService.deleteDocument(testDocumentId);
        if (deleteResponse.message?.includes('deleted')) {
          results.push({
            test: 'DELETE Document',
            status: 'PASS',
            details: 'Document deleted successfully',
          });
          passed++;
        } else {
          throw new Error('Delete response validation failed');
        }
      } catch (error) {
        results.push({
          test: 'DELETE Document',
          status: 'FAIL',
          details: `Failed to delete document: ${(error as Error).message}`,
        });
        failed++;
      }
    } else {
      results.push({
        test: 'DELETE Document',
        status: 'SKIP',
        details: 'Skipped - no test document ID available',
      });
    }

    // Test 9: CLEANUP - Delete test topic
    if (testTopicId) {
      try {
        const cleanupResponse = await this.topicsService.deleteTopic(testTopicId);
        results.push({
          test: 'CLEANUP Test Topic',
          status: 'PASS',
          details: 'Test topic cleaned up successfully',
        });
        passed++;
      } catch (error) {
        results.push({
          test: 'CLEANUP Test Topic',
          status: 'FAIL',
          details: `Failed to cleanup test topic: ${(error as Error).message}`,
        });
        failed++;
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Documents tests completed',
      data: {
        totalTests: 9,
        passed,
        failed,
        results,
      },
    };
  }
} 