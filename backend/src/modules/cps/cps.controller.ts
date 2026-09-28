import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
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
import { CpsService } from './cps.service';
import { CreateCpDto } from './dto/create-cp.dto';
import { CreateCpsBatchDto } from './dto/create-cps-batch.dto';
import { UpdateCpDto } from './dto/update-cp.dto';
import {
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
} from '../../common/helpers/api-response.helper';
import {
  MESSAGES,
  DIFFICULTY,
  TOPIC_STATUS,
} from '../../common/helpers/string-const';
import axios from 'axios';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * CPs Controller
 * Set up CP API endpoints
 * Following Task 7.4 requirements from tasks.md
 */
// Schema definitions for response validation
const CP_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['statusCode', 'success', 'message', 'data', 'timestamp'],
  properties: {
    statusCode: { type: 'number' },
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      required: ['id', 'topic_id', 'title', 'code', 'output', 'explanation'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        topic_id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        difficulty: { type: ['string', 'null'] },
        code: { type: 'string' },
        output: { type: 'string' },
        explanation: { type: 'string' },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const CP_ARRAY_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['statusCode', 'success', 'message', 'data', 'timestamp'],
  properties: {
    statusCode: { type: 'number' },
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'topic_id', 'title', 'code', 'output', 'explanation'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          topic_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          difficulty: { type: ['string', 'null'] },
          code: { type: 'string' },
          output: { type: 'string' },
          explanation: { type: 'string' },
        },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

const DELETE_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['statusCode', 'success', 'message', 'data', 'timestamp'],
  properties: {
    statusCode: { type: 'number' },
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: { type: 'null' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  duration: string;
  httpStatus?: number;
  expectedStatus: number;
  schemaValid?: boolean;
  dataIntegrity?: boolean;
  errorDetails?: string;
  responseData?: any;
}

// DTO for single CP creation endpoint
export class CreateSingleCpDto {
  @IsString()
  @IsNotEmpty()
  topic_id: string;

  @ValidateNested()
  @Type(() => CreateCpDto)
  cp: CreateCpDto;
}

@ApiTags('Concept Practices (CPs)')
@Controller('cps')
export class CpsController {
  private ajv: Ajv;
  private baseUrl: string;

  constructor(private readonly cpsService: CpsService) {
    this.ajv = new Ajv();
    addFormats(this.ajv);
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  }

  /**
   * Validate UUID format
   * @param uuid - UUID string to validate
   * @param paramName - Name of the parameter for error message
   * @private
   */
  private validateUUID(uuid: string, paramName: string = 'id'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new BadRequestException(`Invalid UUID format for ${paramName}: ${uuid}`);
    }
  }

  /**
   * Helper method to make HTTP requests with error handling
   */
  private async makeHttpRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    expectedStatus: number = 200,
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const config: any = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      };

      // Only add data for POST and PUT requests
      if ((method === 'POST' || method === 'PUT') && data) {
        config.data = data;
      }

      console.log(`Making ${method} request to ${config.url}`);
      if (config.data)
        console.log('Request data:', JSON.stringify(config.data, null, 2));

      const response = await axios(config);
      console.log(
        `Response status: ${response.status}, expected: ${expectedStatus}`,
      );
      const duration = `${Date.now() - startTime}ms`;

      // Validate schema based on endpoint type
      let schema;
      if (method === 'DELETE') {
        schema = DELETE_RESPONSE_SCHEMA;
      } else if (
        (method === 'GET' && !endpoint.includes('/cps/')) ||
        endpoint === '/api/cps' ||
        endpoint.includes('/topics/')
      ) {
        // GET all CPs or GET CPs by topic - expect array
        schema = CP_ARRAY_RESPONSE_SCHEMA;
      } else if (endpoint === '/api/cps' && method === 'POST') {
        // Batch creation - expect array
        schema = CP_ARRAY_RESPONSE_SCHEMA;
      } else {
        // Single CP operations - expect object
        schema = CP_RESPONSE_SCHEMA;
      }

      const validate = this.ajv.compile(schema);
      const schemaValid = validate(response.data);
      const statusMatches = response.status === expectedStatus;
      const dataIntegrityValid = this.validateDataIntegrity(
        response.data,
        method,
      );

      return {
        endpoint,
        method,
        status:
          statusMatches && schemaValid && dataIntegrityValid ? 'PASS' : 'FAIL',
        duration,
        httpStatus: response.status,
        expectedStatus,
        schemaValid,
        dataIntegrity: dataIntegrityValid,
        responseData: response.data,
        errorDetails: !schemaValid
          ? JSON.stringify(validate.errors, null, 2)
          : !statusMatches
            ? `Expected status ${expectedStatus}, got ${response.status}`
            : !dataIntegrityValid
              ? 'Data integrity validation failed'
              : undefined,
      };
    } catch (error) {
      const duration = `${Date.now() - startTime}ms`;

      if (axios.isAxiosError(error)) {
        const statusMatches = error.response?.status === expectedStatus;
        return {
          endpoint,
          method,
          status: statusMatches ? 'PASS' : 'FAIL',
          duration,
          httpStatus: error.response?.status,
          expectedStatus,
          schemaValid: false,
          dataIntegrity: false,
          errorDetails: `HTTP ${error.response?.status}: ${error.response?.data?.message || error.message}`,
          responseData: error.response?.data,
        };
      }

      return {
        endpoint,
        method,
        status: 'ERROR',
        duration,
        expectedStatus,
        schemaValid: false,
        dataIntegrity: false,
        errorDetails: error.message,
      };
    }
  }

  /**
   * Helper method to validate data integrity
   */
  private validateDataIntegrity(responseData: any, method: string): boolean {
    if (!responseData || typeof responseData !== 'object') return false;

    // Check basic response structure
    if (
      !responseData.success ||
      !responseData.statusCode ||
      !responseData.message
    ) {
      return false;
    }

    // For DELETE operations, data should be null
    if (method === 'DELETE') {
      return responseData.data === null;
    }

    // For other operations, data should exist
    if (!responseData.data) return false;

    // For array responses (GET all, batch creation)
    if (Array.isArray(responseData.data)) {
      return responseData.data.every(
        (item) =>
          item.id &&
          item.topic_id &&
          item.title &&
          item.code &&
          item.output &&
          item.explanation,
      );
    }

    // For single object responses
    return !!(
      responseData.data.id &&
      responseData.data.topic_id &&
      responseData.data.title &&
      responseData.data.code &&
      responseData.data.output &&
      responseData.data.explanation
    );
  }

  /**
   * Create a test topic for testing purposes
   */
  private async createTestTopic(): Promise<{
    id: string;
    cleanup: () => Promise<void>;
  }> {
    try {
      const topicData = {
        topic_code: `TEST_CP_${Date.now()}`,
        title: 'Test Topic for CP Operations',
        description: 'Temporary topic for testing CP functionality',
        status: TOPIC_STATUS.PUBLISHED,
      };

      console.log('Creating test topic with baseUrl:', this.baseUrl);
      console.log('Topic data:', topicData);

      const response = await axios.post(
        `${this.baseUrl}/api/topics`,
        topicData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      console.log('Topic creation response:', response.status, response.data);

      if (!response.data?.data?.id) {
        throw new Error('Topic creation response missing id field');
      }

      const topicId = response.data.data.id;

      const cleanup = async () => {
        try {
          await axios.delete(`${this.baseUrl}/api/topics/${topicId}`);
        } catch (error) {
          console.log('Failed to cleanup test topic:', error.message);
        }
      };

      return { id: topicId, cleanup };
    } catch (error) {
      console.error('Failed to create test topic:', error.message);
      if (axios.isAxiosError(error)) {
        console.error('Request config:', error.config);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw new Error(`Topic creation failed: ${error.message}`);
    }
  }

  /**
   * Create multiple concept practices in a batch
   * POST /cps endpoint - Required by Task 7.4 (matches payload format)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create concept practices in batch',
    description:
      'Creates multiple concept practices for a topic in a single operation',
  })
  @ApiBody({
    type: CreateCpsBatchDto,
    description: 'Batch CP creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Concept practices created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Concept practices batch created successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              topic_id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: {
                type: 'string',
                example: 'Array Manipulation in JavaScript',
              },
              difficulty: { type: 'string', example: 'Easy' },
              code: {
                type: 'string',
                example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
              },
              output: { type: 'string', example: '3' },
              explanation: {
                type: 'string',
                example:
                  'This code demonstrates how to get the length of an array in JavaScript.',
              },
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or difficulty level',
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async createCPsBatch(@Body() createCpsBatchDto: CreateCpsBatchDto) {
    const cps = await this.cpsService.createCPsBatch(createCpsBatchDto);
    return createdResponse(cps, MESSAGES.CP_BATCH_CREATE_SUCCESS);
  }

  /**
   * Create a single concept practice
   * POST /cps/single endpoint - Required by Task 7.4
   */
  @Post('single')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a single concept practice',
    description: 'Creates a single concept practice for a specific topic',
  })
  @ApiBody({
    description: 'Single CP creation data',
    schema: {
      type: 'object',
      required: ['topic_id', 'cp'],
      properties: {
        topic_id: {
          type: 'string',
          format: 'uuid',
          description:
            'UUID of the topic to associate the concept practice with',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        cp: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the concept practice',
              example: 'Array Manipulation in JavaScript',
            },
            difficulty: {
              type: 'string',
              enum: ['Easy', 'Intermideate', 'Hard'],
              description: 'Difficulty level of the concept practice',
              example: 'Easy',
            },
            code: {
              type: 'string',
              description: 'Code content for the concept practice',
              example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
            },
            output: {
              type: 'string',
              description: 'Expected output of the code',
              example: '3',
            },
            explanation: {
              type: 'string',
              description: 'Explanation of the concept practice',
              example:
                'This code demonstrates how to get the length of an array in JavaScript.',
            },
          },
          required: ['title', 'code', 'output', 'explanation'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Concept practice created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Concept practice created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            topic_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              example: 'Array Manipulation in JavaScript',
            },
            difficulty: { type: 'string', example: 'Easy' },
            code: {
              type: 'string',
              example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
            },
            output: { type: 'string', example: '3' },
            explanation: {
              type: 'string',
              example:
                'This code demonstrates how to get the length of an array in JavaScript.',
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createSingleCP(@Body() body: CreateSingleCpDto) {
    try {
      // Validate UUID format for topic_id
      this.validateUUID(body.topic_id, 'topic_id');
      
      const cp = await this.cpsService.createCP(body.topic_id, body.cp);
      return createdResponse(cp, 'Concept practice created successfully');
    } catch (error) {
      // Handle validation errors properly
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Re-throw other errors as bad request for invalid data scenarios
      throw new BadRequestException('Failed to create concept practice');
    }
  }

  /**
   * Get all concept practices
   * GET /cps endpoint - Required by Task 7.4
   */
  @Get()
  @ApiOperation({
    summary: 'Get all concept practices',
    description:
      'Retrieves a list of all concept practices, ordered by creation date (newest first)',
  })
  @ApiResponse({
    status: 200,
    description: 'Concept practices retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Concept practices retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              topic_id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: {
                type: 'string',
                example: 'Array Manipulation in JavaScript',
              },
              difficulty: { type: 'string', example: 'Easy' },
              code: {
                type: 'string',
                example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
              },
              output: { type: 'string', example: '3' },
              explanation: {
                type: 'string',
                example:
                  'This code demonstrates how to get the length of an array in JavaScript.',
              },
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  async findAllCPs() {
    const cps = await this.cpsService.findAllCPs();
    return successResponse(cps, 'Concept practices retrieved successfully');
  }

  /**
   * Get concept practices by topic ID
   * GET /topics/:topicId/cps endpoint - Required by Task 7.4
   */
  @Get('topics/:topicId')
  @ApiOperation({
    summary: 'Get concept practices by topic ID',
    description: 'Retrieves all concept practices for a specific topic',
  })
  @ApiParam({
    name: 'topicId',
    description: 'Topic ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic concept practices retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Topic concept practices retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              topic_id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: {
                type: 'string',
                example: 'Array Manipulation in JavaScript',
              },
              difficulty: { type: 'string', example: 'Easy' },
              code: {
                type: 'string',
                example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
              },
              output: { type: 'string', example: '3' },
              explanation: {
                type: 'string',
                example:
                  'This code demonstrates how to get the length of an array in JavaScript.',
              },
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findCPsByTopicId(@Param('topicId') topicId: string) {
    // Validate UUID format first
    this.validateUUID(topicId, 'topicId');
    
    const cps = await this.cpsService.findCPsByTopicId(topicId);
    return successResponse(
      cps,
      'Topic concept practices retrieved successfully',
    );
  }

  /**
   * Get concept practice by ID
   * GET /cps/:id endpoint - Required by Task 7.4
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get concept practice by ID',
    description: 'Retrieves a specific concept practice by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Concept Practice ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Concept practice retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Concept practice retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            topic_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              example: 'Array Manipulation in JavaScript',
            },
            difficulty: { type: 'string', example: 'Easy' },
            code: {
              type: 'string',
              example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
            },
            output: { type: 'string', example: '3' },
            explanation: {
              type: 'string',
              example:
                'This code demonstrates how to get the length of an array in JavaScript.',
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Concept practice not found' })
  async findCPById(@Param('id') id: string) {
    // Validate UUID format first
    this.validateUUID(id);
    
    const cp = await this.cpsService.findCPById(id);
    return successResponse(cp, 'Concept practice retrieved successfully');
  }

  /**
   * Update concept practice by ID
   * PUT /cps/:id endpoint - Required by Task 7.4
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update concept practice by ID',
    description:
      'Updates a specific concept practice with the provided information',
  })
  @ApiParam({
    name: 'id',
    description: 'Concept Practice ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCpDto, description: 'Concept practice update data' })
  @ApiResponse({
    status: 200,
    description: 'Concept practice updated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Concept practice updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            topic_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              example: 'Updated Array Manipulation in JavaScript',
            },
            difficulty: { type: 'string', example: 'Hard' },
            code: {
              type: 'string',
              example:
                'const arr = [1, 2, 3, 4];\nconsole.log(arr.map(x => x * 2));',
            },
            output: { type: 'string', example: '[2, 4, 6, 8]' },
            explanation: {
              type: 'string',
              example:
                'This code demonstrates how to use the map method to transform array elements.',
            },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or UUID format' })
  @ApiResponse({ status: 404, description: 'Concept practice not found' })
  async updateCP(@Param('id') id: string, @Body() updateCpDto: UpdateCpDto) {
    // Validate UUID format first
    this.validateUUID(id);
    
    const cp = await this.cpsService.updateCP(id, updateCpDto);
    return updatedResponse(cp, 'Concept practice updated successfully');
  }

  /**
   * Delete concept practice by ID
   * DELETE /cps/:id endpoint - Required by Task 7.4
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete concept practice by ID',
    description: 'Deletes a specific concept practice',
  })
  @ApiParam({
    name: 'id',
    description: 'Concept Practice ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Concept practice deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Concept practice deleted successfully',
        },
        data: { type: 'null', example: null },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Concept practice not found' })
  async deleteCP(@Param('id') id: string) {
    // Validate UUID format first
    this.validateUUID(id);
    
    await this.cpsService.deleteCP(id);
    return deletedResponse('Concept practice deleted successfully');
  }

  /**
   * HTTP-based comprehensive testing endpoint for all CP operations
   * POST /cps/test-all endpoint - Required by Task 7.7 (Enhanced with HTTP Testing)
   */
  @Post('test-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test all CP operations via HTTP requests with schema validation',
    description:
      'Executes comprehensive HTTP-based testing of all CP endpoints with schema validation and data integrity checks',
  })
  @ApiBody({
    description: 'Test configuration (optional)',
    schema: {
      type: 'object',
      properties: {
        cleanup: {
          type: 'boolean',
          description: 'Whether to clean up test data after testing',
          default: true,
        },
        includeErrorTests: {
          type: 'boolean',
          description: 'Whether to include error scenario testing',
          default: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'HTTP-based comprehensive test completed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'HTTP-based CP testing completed successfully',
        },
        data: {
          type: 'object',
          properties: {
            testResults: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  endpoint: { type: 'string', example: 'POST /api/cps' },
                  method: { type: 'string', example: 'POST' },
                  status: {
                    type: 'string',
                    enum: ['PASS', 'FAIL', 'ERROR'],
                    example: 'PASS',
                  },
                  duration: { type: 'string', example: '123ms' },
                  httpStatus: { type: 'number', example: 201 },
                  expectedStatus: { type: 'number', example: 201 },
                  schemaValid: { type: 'boolean', example: true },
                  dataIntegrity: { type: 'boolean', example: true },
                  errorDetails: { type: 'string', nullable: true },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                totalTests: { type: 'number', example: 10 },
                passed: { type: 'number', example: 9 },
                failed: { type: 'number', example: 1 },
                errorTests: { type: 'number', example: 0 },
                totalDuration: { type: 'string', example: '2540ms' },
                overallStatus: {
                  type: 'string',
                  enum: ['PASSED', 'FAILED'],
                  example: 'PASSED',
                },
              },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async testAllCPOperations(
    @Body() testConfig: { cleanup?: boolean; includeErrorTests?: boolean } = {},
  ) {
    const startTime = Date.now();
    const { cleanup = true, includeErrorTests = true } = testConfig;
    const testResults: TestResult[] = [];
    let testTopic: { id: string; cleanup: () => Promise<void> } | null = null;
    let createdCpIds: string[] = [];

    try {
      console.log('Starting HTTP-based CP testing...');
      console.log('Base URL:', this.baseUrl);
      console.log('Test config:', { cleanup, includeErrorTests });

      // Step 1: Create test topic using service method (more reliable for internal testing)
      console.log('Step 1: Creating test topic via service method...');
      const { TopicsService } = await import('../topics/topics.service');
      const topicsService = new TopicsService(
        this.cpsService['supabaseService'],
      );

      const testTopicData = {
        topic_code: `TEST_CP_${Date.now()}`,
        title: 'Test Topic for CP Operations',
        description: 'Temporary topic for testing CP functionality',
        status: TOPIC_STATUS.PUBLISHED,
      };

      const createdTopic: any = await topicsService.createTopic(testTopicData);

      testTopic = {
        id: createdTopic.id,
        cleanup: async () => {
          try {
            await topicsService.deleteTopic(createdTopic.id);
          } catch (error) {
            console.log('Failed to cleanup test topic:', error.message);
          }
        },
      };

      console.log('Test topic created successfully:', testTopic.id);

      // Convert to HTTP-based testing for CP endpoints
      console.log('Step 2: Testing CP endpoints via HTTP...');

      // Step 2: Test batch CP creation
      console.log('Step 2: Testing batch CP creation...');
      const batchData = {
        topic_id: testTopic.id,
        cps: [
          {
            title: 'HTTP Test Array Length',
            difficulty: DIFFICULTY.EASY,
            code: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
            output: '3',
            explanation: 'HTTP test explanation for array length',
          },
          {
            title: 'HTTP Test Array Push',
            difficulty: DIFFICULTY.INTERMEDIATE,
            code: 'const arr = [1, 2];\narr.push(3);\nconsole.log(arr);',
            output: '[1, 2, 3]',
            explanation: 'HTTP test explanation for array push',
          },
          {
            title: 'HTTP Test Array Map',
            difficulty: DIFFICULTY.HARD,
            code: 'const arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled);',
            output: '[2, 4, 6]',
            explanation: 'HTTP test explanation for array map',
          },
        ],
      };

      console.log('Making batch creation request...');
      const batchResult = await this.makeHttpRequest(
        'POST',
        '/api/cps',
        batchData,
        201,
      );
      console.log('Batch creation result:', batchResult.status);
      testResults.push(batchResult);

      // Extract created CP IDs for further testing
      if (
        batchResult.responseData?.data &&
        Array.isArray(batchResult.responseData.data)
      ) {
        createdCpIds = batchResult.responseData.data.map((cp: any) => cp.id);
      }

      // Step 3: Test single CP creation
      const singleCpData = {
        topic_id: testTopic.id,
        cp: {
          title: 'HTTP Test Single CP',
          difficulty: DIFFICULTY.INTERMEDIATE,
          code: 'console.log("HTTP test single CP");',
          output: 'HTTP test single CP',
          explanation: 'HTTP test explanation for single CP',
        },
      };

      const singleResult = await this.makeHttpRequest(
        'POST',
        '/api/cps/single',
        singleCpData,
        201,
      );
      testResults.push(singleResult);

      if (singleResult.responseData?.data?.id) {
        createdCpIds.push(singleResult.responseData.data.id);
      }

      // Step 4: Test GET all CPs
      const getAllResult = await this.makeHttpRequest(
        'GET',
        '/api/cps',
        null,
        200,
      );
      testResults.push(getAllResult);

      // Step 5: Test GET CPs by topic
      const getByTopicResult = await this.makeHttpRequest(
        'GET',
        `/api/cps/topics/${testTopic.id}`,
        null,
        200,
      );
      testResults.push(getByTopicResult);

      // Step 6: Test GET CP by ID
      if (createdCpIds.length > 0) {
        const getByIdResult = await this.makeHttpRequest(
          'GET',
          `/api/cps/${createdCpIds[0]}`,
          null,
          200,
        );
        testResults.push(getByIdResult);
      }

      // Step 7: Test UPDATE CP
      if (createdCpIds.length > 0) {
        const updateData = {
          difficulty: DIFFICULTY.HARD,
          explanation: 'HTTP test updated explanation',
        };
        const updateResult = await this.makeHttpRequest(
          'PUT',
          `/api/cps/${createdCpIds[0]}`,
          updateData,
          200,
        );
        testResults.push(updateResult);
      }

      // Step 8: Test DELETE CP
      if (createdCpIds.length > 1) {
        const deleteResult = await this.makeHttpRequest(
          'DELETE',
          `/api/cps/${createdCpIds[1]}`,
          null,
          200,
        );
        testResults.push(deleteResult);

        // Step 9: Verify deletion (should return 404)
        const verifyDeleteResult = await this.makeHttpRequest(
          'GET',
          `/api/cps/${createdCpIds[1]}`,
          null,
          404,
        );
        testResults.push({
          ...verifyDeleteResult,
          endpoint: `GET /api/cps/${createdCpIds[1]} (verify deletion)`,
        });
      }

      // Step 10: Error scenario testing (if enabled)
      if (includeErrorTests) {
        // Test with invalid UUID
        const invalidUuidResult = await this.makeHttpRequest(
          'GET',
          '/api/cps/invalid-uuid',
          null,
          400,
        );
        testResults.push({
          ...invalidUuidResult,
          endpoint: 'GET /api/cps/invalid-uuid (error test)',
        });

        // Test with non-existent ID
        const nonExistentResult = await this.makeHttpRequest(
          'GET',
          '/api/cps/123e4567-e89b-12d3-a456-426614174999',
          null,
          404,
        );
        testResults.push({
          ...nonExistentResult,
          endpoint:
            'GET /api/cps/123e4567-e89b-12d3-a456-426614174999 (error test)',
        });

        // Test invalid data for creation (missing required fields)
        const invalidDataResult = await this.makeHttpRequest(
          'POST',
          '/api/cps/single',
          {
            topic_id: testTopic.id,
            cp: {
              // Missing required fields like title, code, output, explanation
              invalid: 'data',
            },
          },
          400,
        );
        testResults.push({
          ...invalidDataResult,
          endpoint: 'POST /api/cps/single (invalid data test)',
        });
      }

      // Calculate summary
      const totalTests = testResults.length;
      const passed = testResults.filter(
        (result) => result.status === 'PASS',
      ).length;
      const failed = testResults.filter(
        (result) => result.status === 'FAIL',
      ).length;
      const errorTests = testResults.filter(
        (result) => result.status === 'ERROR',
      ).length;
      const totalDuration = Date.now() - startTime;

      const summary = {
        totalTests,
        passed,
        failed,
        errorTests,
        totalDuration: `${totalDuration}ms`,
        overallStatus: failed === 0 && errorTests === 0 ? 'PASSED' : 'FAILED',
      };

      return successResponse(
        {
          testResults,
          summary,
          testConfiguration: {
            baseUrl: this.baseUrl,
            cleanup,
            includeErrorTests,
          },
        },
        `HTTP-based CP testing completed ${summary.overallStatus === 'PASSED' ? 'successfully' : 'with issues'}`,
      );
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const summary = {
        totalTests: testResults.length,
        passed: testResults.filter((result) => result.status === 'PASS').length,
        failed: testResults.filter((result) => result.status === 'FAIL').length,
        errorTests: testResults.filter((result) => result.status === 'ERROR')
          .length,
        totalDuration: `${totalDuration}ms`,
        overallStatus: 'FAILED',
        error: error.message,
      };

      return successResponse(
        {
          testResults,
          summary,
          error: error.message,
        },
        'HTTP-based CP testing failed',
      );
    } finally {
      // Clean up test data
      if (cleanup && testTopic) {
        try {
          // Clean up remaining test CPs
          for (const cpId of createdCpIds) {
            try {
              await this.makeHttpRequest(
                'DELETE',
                `/api/cps/${cpId}`,
                null,
                200,
              );
            } catch (error) {
              // Ignore cleanup errors
            }
          }

          // Clean up test topic
          await testTopic.cleanup();
        } catch (error) {
          console.log('Cleanup failed:', error.message);
        }
      }
    }
  }
}
