import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { successResponse } from '../../common/helpers/api-response.helper';
import { TOPIC_STATUS } from '../../common/helpers/string-const';

/**
 * Topics Test Controller
 * Special endpoint to test all Topics functionality in one request
 * As requested by the user after Phase 3 completion
 */
@ApiTags('Topics')
@Controller('topics-test')
export class TopicsTestController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post('run-all-tests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run all Topics CRUD tests',
    description: 'Tests all Topics endpoints: CREATE, READ, UPDATE, DELETE operations in sequence',
  })
  @ApiResponse({
    status: 200,
    description: 'All tests completed',
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: 'All Topics tests completed successfully',
        data: {
          tests_run: 8,
          tests_passed: 8,
          tests_failed: 0,
          results: [
            { test: 'CREATE topic', status: 'PASSED', data: '...' },
            { test: 'GET all topics', status: 'PASSED', data: '...' },
            { test: 'GET topic by ID', status: 'PASSED', data: '...' },
            { test: 'UPDATE topic', status: 'PASSED', data: '...' },
            { test: 'DELETE topic', status: 'PASSED', data: '...' },
          ],
        },
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  async runAllTests() {
    const testResults: any[] = [];
    let testsPassed = 0;
    let testsFailed = 0;

    try {
      // Test 1: Create a test topic
      const createResult = await this.testCreateTopic();
      testResults.push(createResult);
      if (createResult.status === 'PASSED') testsPassed++;
      else testsFailed++;

      const topicId = (createResult.data as any)?.id;

      if (topicId) {
        // Test 2: Get all topics
        const getAllResult = await this.testGetAllTopics();
        testResults.push(getAllResult);
        if (getAllResult.status === 'PASSED') testsPassed++;
        else testsFailed++;

        // Test 3: Get topic by ID
        const getByIdResult = await this.testGetTopicById(topicId);
        testResults.push(getByIdResult);
        if (getByIdResult.status === 'PASSED') testsPassed++;
        else testsFailed++;

        // Test 4: Update topic
        const updateResult = await this.testUpdateTopic(topicId);
        testResults.push(updateResult);
        if (updateResult.status === 'PASSED') testsPassed++;
        else testsFailed++;

        // Test 5: Get topics by status
        const getByStatusResult = await this.testGetTopicsByStatus();
        testResults.push(getByStatusResult);
        if (getByStatusResult.status === 'PASSED') testsPassed++;
        else testsFailed++;

        // Test 6: Get topics by module
        const getByModuleResult = await this.testGetTopicsByModule();
        testResults.push(getByModuleResult);
        if (getByModuleResult.status === 'PASSED') testsPassed++;
        else testsFailed++;

        // Test 7: Test duplicate topic_code validation
        const duplicateTestResult = await this.testDuplicateTopicCode();
        testResults.push(duplicateTestResult);
        if (duplicateTestResult.status === 'PASSED') testsPassed++;
        else testsFailed++;

        // Test 8: Delete topic (cleanup)
        const deleteResult = await this.testDeleteTopic(topicId);
        testResults.push(deleteResult);
        if (deleteResult.status === 'PASSED') testsPassed++;
        else testsFailed++;
      }

      return successResponse(
        {
          tests_run: testResults.length,
          tests_passed: testsPassed,
          tests_failed: testsFailed,
          success_rate: `${((testsPassed / testResults.length) * 100).toFixed(1)}%`,
          results: testResults,
        },
        testsFailed === 0 
          ? 'All Topics tests completed successfully' 
          : `Topics tests completed with ${testsFailed} failure(s)`,
      );
    } catch (error) {
      return successResponse(
        {
          tests_run: testResults.length,
          tests_passed: testsPassed,
          tests_failed: testsFailed + 1,
          error: error.message,
          results: testResults,
        },
        'Topics tests failed with error',
      );
    }
  }

  private async testCreateTopic() {
    try {
      const testTopic = {
        topic_code: `TEST_TOPIC_${Date.now()}`,
        title: 'Test Topic for Automated Testing',
        description: 'This is a test topic created by the automated test endpoint',
        status: TOPIC_STATUS.PUBLISHED,
      };

      const result = await this.topicsService.createTopic(testTopic);
      
      return {
        test: 'CREATE topic',
        status: 'PASSED',
        message: 'Topic created successfully',
        data: result,
      };
    } catch (error) {
      return {
        test: 'CREATE topic',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testGetAllTopics() {
    try {
      const result = await this.topicsService.findAllTopics();
      
      return {
        test: 'GET all topics',
        status: 'PASSED',
        message: `Retrieved ${result.length} topics`,
        data: result.length,
      };
    } catch (error) {
      return {
        test: 'GET all topics',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testGetTopicById(topicId: string) {
    try {
      const result: any = await this.topicsService.findTopicById(topicId);
      
      return {
        test: 'GET topic by ID',
        status: 'PASSED',
        message: 'Topic retrieved successfully',
        data: result.id,
      };
    } catch (error) {
      return {
        test: 'GET topic by ID',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testUpdateTopic(topicId: string) {
    try {
      const updateData = {
        title: 'Updated Test Topic',
        status: TOPIC_STATUS.DRAFT,
      };

      const result: any = await this.topicsService.updateTopic(topicId, updateData);
      
      return {
        test: 'UPDATE topic',
        status: 'PASSED',
        message: 'Topic updated successfully',
        data: result.title,
      };
    } catch (error) {
      return {
        test: 'UPDATE topic',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testGetTopicsByStatus() {
    try {
      const result = await this.topicsService.findTopicsByStatus(TOPIC_STATUS.PUBLISHED) as any[];
      
      return {
        test: 'GET topics by status',
        status: 'PASSED',
        message: `Retrieved ${result.length} active topics`,
        data: result.length,
      };
    } catch (error) {
      return {
        test: 'GET topics by status',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testGetTopicsByModule() {
    try {
      // Since we removed module_code from the schema, let's test filtering by status instead
      const result = await this.topicsService.findTopicsByStatus(TOPIC_STATUS.DRAFT) as any[];
      
      return {
        test: 'GET topics by status filter',
        status: 'PASSED',
        message: `Retrieved ${result.length} draft topics`,
        data: result.length,
      };
    } catch (error) {
      return {
        test: 'GET topics by status filter',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testDuplicateTopicCode() {
    try {
      const duplicateTopic = {
        topic_code: `TEST_TOPIC_${Date.now()}`, // Should fail due to duplicate
        title: 'Duplicate Test Topic',
        description: 'This should fail due to duplicate topic_code',
        status: TOPIC_STATUS.PUBLISHED,
      };

      // First create a topic
      await this.topicsService.createTopic(duplicateTopic);
      
      // Try to create another with same topic_code (should fail)
      try {
        await this.topicsService.createTopic(duplicateTopic);
        return {
          test: 'Duplicate topic_code validation',
          status: 'FAILED',
          message: 'Duplicate validation failed - should have thrown error',
          data: null,
        };
      } catch (duplicateError) {
        return {
          test: 'Duplicate topic_code validation',
          status: 'PASSED',
          message: 'Correctly prevented duplicate topic_code',
          data: duplicateError.message,
        };
      }
    } catch (error) {
      return {
        test: 'Duplicate topic_code validation',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }

  private async testDeleteTopic(topicId: string) {
    try {
      await this.topicsService.deleteTopic(topicId);
      
      return {
        test: 'DELETE topic',
        status: 'PASSED',
        message: 'Topic deleted successfully',
        data: topicId,
      };
    } catch (error) {
      return {
        test: 'DELETE topic',
        status: 'FAILED',
        message: error.message,
        data: null,
      };
    }
  }
} 