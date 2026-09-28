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
import { OutcomesService } from './outcomes.service';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { UpdateHeadingDto } from './dto/update-heading.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/**
 * Outcomes Controller
 * Handles API endpoints for topic outcomes
 */
@ApiTags('Outcomes')
@Controller('outcomes')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OutcomesController {
  constructor(private readonly outcomesService: OutcomesService) {}

  /**
   * Create a new outcome with headings and items
   * POST /api/outcomes
   */
  @Post()
  @ApiOperation({ summary: 'Create a new outcome with complete hierarchy' })
  @ApiBody({
    type: CreateOutcomeDto,
    description: 'Outcome data with optional headings and items',
    examples: {
      example1: {
        summary: 'Create JavaScript Asynchronous Programming Outcomes',
        value: {
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          outcomes: [
            {
              heading: 'Technical Skills',
              items: [
                {
                  text: 'Create complex asynchronous workflows using Promise chaining and async/await',
                },
                {
                  text: 'Apply error handling strategies in production-grade asynchronous code',
                }
              ]
            },
            {
              heading: 'Problem Solving',
              items: [
                {
                  text: 'Identify and resolve common issues in asynchronous code',
                },
                {
                  text: 'Design efficient solutions for real-world asynchronous scenarios',
                }
              ]
            }
          ]
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Outcome created successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Outcome created successfully',
        data: {
          id: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          headings: [
            {
              id: 'a1b2c3d4-e5f6-4a5b-9c3d-6e7f8a9b0c1d',
              heading: 'Technical Skills',
              order_index: 1,
              items: [
                {
                  id: 'f6a7b8c9-d0e1-9f0a-4b5c-1d2e3f4a5b6c',
                  text: 'Create complex asynchronous workflows using Promise chaining and async/await',
                  order_index: 1
                },
                {
                  id: 'b2c3d4e5-f6a7-5b6c-0d1e-7f8a9b0c1d2e',
                  text: 'Apply error handling strategies in production-grade asynchronous code',
                  order_index: 2
                }
              ]
            },
            {
              id: 'c3d4e5f6-a7b8-6c7d-1e2f-8a9b0c1d2e3f',
              heading: 'Problem Solving',
              order_index: 2,
              items: [
                {
                  id: 'd4e5f6a7-b8c9-7d8e-2f3a-9b0c1d2e3f4a',
                  text: 'Identify and resolve common issues in asynchronous code',
                  order_index: 1
                },
                {
                  id: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
                  text: 'Design efficient solutions for real-world asynchronous scenarios',
                  order_index: 2
                }
              ]
            }
          ]
        },
      },
    },
  })
  async createOutcome(@Body() createOutcomeDto: CreateOutcomeDto) {
    return this.outcomesService.createOutcome(createOutcomeDto);
  }

  /**
   * Get outcome by ID
   * GET /api/outcomes/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an outcome by ID with its complete hierarchy' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the outcome to retrieve',
    example: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    description: 'Outcome retrieved successfully',
  })
  async findOutcomeById(@Param('id') id: string) {
    return this.outcomesService.findOutcomeById(id);
  }

  /**
   * Get outcomes by topic ID
   * GET /api/outcomes/topic/:topicId
   */
  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Retrieve all outcomes for a topic with complete hierarchy' })
  @ApiParam({
    name: 'topicId',
    description: 'UUID of the topic to retrieve outcomes for',
    example: '4c44509e-0654-495e-9118-850c578c5786',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic outcomes retrieved successfully',
  })
  async findOutcomesByTopicId(@Param('topicId') topicId: string) {
    return this.outcomesService.findOutcomesByTopicId(topicId);
  }

  /**
   * Delete outcome by ID
   * DELETE /api/outcomes/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an outcome and its complete hierarchy' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the outcome to delete',
    example: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    description: 'Outcome deleted successfully',
  })
  async deleteOutcome(@Param('id') id: string) {
    return this.outcomesService.deleteOutcome(id);
  }

  /**
   * Update outcome by ID
   * PUT /api/outcomes/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update an entire outcome with its headings and items' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the outcome to update',
    example: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
  })
  @ApiBody({
    type: CreateOutcomeDto,
    description: 'Updated outcome data',
  })
  @ApiResponse({
    status: 200,
    description: 'Outcome updated successfully',
  })
  async updateOutcome(
    @Param('id') id: string,
    @Body() updateOutcomeDto: CreateOutcomeDto,
  ) {
    return this.outcomesService.updateOutcome(id, updateOutcomeDto);
  }

  /**
   * Update heading by ID
   * PUT /api/outcomes/headings/:id
   */
  @Put('headings/:id')
  @ApiOperation({ summary: 'Update a heading' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the heading to update',
    example: 'a1b2c3d4-e5f6-4a5b-9c3d-6e7f8a9b0c1d',
  })
  @ApiBody({
    type: UpdateHeadingDto,
    description: 'Updated heading data',
  })
  @ApiResponse({
    status: 200,
    description: 'Heading updated successfully',
  })
  async updateHeading(
    @Param('id') id: string,
    @Body() updateHeadingDto: UpdateHeadingDto,
  ) {
    return this.outcomesService.updateHeading(id, updateHeadingDto);
  }

  /**
   * Delete heading by ID
   * DELETE /api/outcomes/headings/:id
   */
  @Delete('headings/:id')
  @ApiOperation({ summary: 'Delete a heading and its items' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the heading to delete',
    example: 'a1b2c3d4-e5f6-4a5b-9c3d-6e7f8a9b0c1d',
  })
  @ApiResponse({
    status: 200,
    description: 'Heading deleted successfully',
  })
  async deleteHeading(@Param('id') id: string) {
    return this.outcomesService.deleteHeading(id);
  }

  /**
   * Update item by ID
   * PUT /api/outcomes/items/:id
   */
  @Put('items/:id')
  @ApiOperation({ summary: 'Update an item' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the item to update',
    example: 'f6a7b8c9-d0e1-9f0a-4b5c-1d2e3f4a5b6c',
  })
  @ApiBody({
    type: UpdateItemDto,
    description: 'Updated item data',
  })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
  })
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.outcomesService.updateItem(id, updateItemDto);
  }

  /**
   * Delete item by ID
   * DELETE /api/outcomes/items/:id
   */
  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete an item' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the item to delete',
    example: 'f6a7b8c9-d0e1-9f0a-4b5c-1d2e3f4a5b6c',
  })
  @ApiResponse({
    status: 200,
    description: 'Item deleted successfully',
  })
  async deleteItem(@Param('id') id: string) {
    return this.outcomesService.deleteItem(id);
  }
} 