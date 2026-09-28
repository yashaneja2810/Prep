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
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateHeadingDto } from './dto/update-heading.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/**
 * Objectives Controller
 * Handles API endpoints for topic objectives
 */
@ApiTags('Objectives')
@Controller('objectives')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  /**
   * Create a new objective with headings and items
   * POST /api/objectives
   */
  @Post()
  @ApiOperation({ summary: 'Create a new objective with complete hierarchy' })
  @ApiBody({
    type: CreateObjectiveDto,
    description: 'Objective data with optional headings and items',
    examples: {
      example1: {
        summary: 'Create JavaScript Asynchronous Programming Objectives',
        value: {
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          objectives: [
            {
              heading: 'Core Concepts',
              items: [
                {
                  text: 'Understand the JavaScript event loop and how it enables asynchronous operations',
                },
                {
                  text: 'Recognize the limitations of callback-based asynchronous code',
                }
              ]
            },
            {
              heading: 'Promises',
              items: [
                {
                  text: 'Create and consume promises for asynchronous operations',
                },
                {
                  text: 'Handle errors in promise chains using catch and finally',
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
    description: 'Objective created successfully',
    schema: {
      example: {
        statusCode: 201,
        success: true,
        message: 'Objective created successfully',
        data: {
          id: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
          topic_id: '4c44509e-0654-495e-9118-850c578c5786',
          headings: [
            {
              id: 'a1b2c3d4-e5f6-4a5b-9c3d-6e7f8a9b0c1d',
              heading: 'Core Concepts',
              order_index: 1,
              items: [
                {
                  id: 'f6a7b8c9-d0e1-9f0a-4b5c-1d2e3f4a5b6c',
                  text: 'Understand the JavaScript event loop and how it enables asynchronous operations',
                  order_index: 1
                },
                {
                  id: 'b2c3d4e5-f6a7-5b6c-0d1e-7f8a9b0c1d2e',
                  text: 'Recognize the limitations of callback-based asynchronous code',
                  order_index: 2
                }
              ]
            },
            {
              id: 'c3d4e5f6-a7b8-6c7d-1e2f-8a9b0c1d2e3f',
              heading: 'Promises',
              order_index: 2,
              items: [
                {
                  id: 'd4e5f6a7-b8c9-7d8e-2f3a-9b0c1d2e3f4a',
                  text: 'Create and consume promises for asynchronous operations',
                  order_index: 1
                },
                {
                  id: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
                  text: 'Handle errors in promise chains using catch and finally',
                  order_index: 2
                }
              ]
            }
          ]
        },
      },
    },
  })
  async createObjective(@Body() createObjectiveDto: CreateObjectiveDto) {
    return this.objectivesService.createObjective(createObjectiveDto);
  }

  /**
   * Get objective by ID
   * GET /api/objectives/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an objective by ID with its complete hierarchy' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the objective to retrieve',
    example: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    description: 'Objective retrieved successfully',
  })
  async findObjectiveById(@Param('id') id: string) {
    return this.objectivesService.findObjectiveById(id);
  }

  /**
   * Get objectives by topic ID
   * GET /api/objectives/topic/:topicId
   */
  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Retrieve all objectives for a topic with complete hierarchy' })
  @ApiParam({
    name: 'topicId',
    description: 'UUID of the topic to retrieve objectives for',
    example: '4c44509e-0654-495e-9118-850c578c5786',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic objectives retrieved successfully',
  })
  async findObjectivesByTopicId(@Param('topicId') topicId: string) {
    return this.objectivesService.findObjectivesByTopicId(topicId);
  }

  /**
   * Delete objective by ID
   * DELETE /api/objectives/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an objective and its complete hierarchy' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the objective to delete',
    example: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    description: 'Objective deleted successfully',
  })
  async deleteObjective(@Param('id') id: string) {
    return this.objectivesService.deleteObjective(id);
  }

  /**
   * Update objective by ID
   * PUT /api/objectives/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update an entire objective with its headings and items' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the objective to update',
    example: 'e5f6a7b8-c9d0-8e9f-3a4b-0c1d2e3f4a5b',
  })
  @ApiBody({
    type: CreateObjectiveDto,
    description: 'Updated objective data',
  })
  @ApiResponse({
    status: 200,
    description: 'Objective updated successfully',
  })
  async updateObjective(
    @Param('id') id: string,
    @Body() updateObjectiveDto: CreateObjectiveDto,
  ) {
    return this.objectivesService.updateObjective(id, updateObjectiveDto);
  }

  /**
   * Update heading by ID
   * PUT /api/objectives/headings/:id
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
    return this.objectivesService.updateHeading(id, updateHeadingDto);
  }

  /**
   * Delete heading by ID
   * DELETE /api/objectives/headings/:id
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
    return this.objectivesService.deleteHeading(id);
  }

  /**
   * Update item by ID
   * PUT /api/objectives/items/:id
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
    return this.objectivesService.updateItem(id, updateItemDto);
  }

  /**
   * Delete item by ID
   * DELETE /api/objectives/items/:id
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
    return this.objectivesService.deleteItem(id);
  }
} 