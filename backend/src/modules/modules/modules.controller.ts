import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AddTopicsDto } from './dto/add-topics.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';

/**
 * Modules Controller
 * Handles API endpoints for educational modules
 */
@ApiTags('Modules')
@Controller('modules')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ModulesController {
  private readonly logger = new Logger(ModulesController.name);

  constructor(private readonly modulesService: ModulesService) {}

  /**
   * Get all modules
   * GET /api/modules
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all modules with their topics' })
  @ApiResponse({
    status: 200,
    description: 'Modules retrieved successfully',
  })
  async findAllModules() {
    return this.modulesService.findAllModules();
  }

  /**
   * Create a new module
   * POST /api/modules
   */
  @Post()
  @ApiOperation({ summary: 'Create a new module with optional topics' })
  @ApiBody({
    type: CreateModuleDto,
    description: 'Module data with optional topics',
  })
  @ApiResponse({
    status: 201,
    description: 'Module created successfully',
  })
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.createModule(createModuleDto);
  }

  /**
   * Get module by ID
   * GET /api/modules/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a module by ID with its complete hierarchy' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the module to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Module retrieved successfully',
  })
  async findModuleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.modulesService.findModuleById(id);
  }

  /**
   * Get topics of a specific module
   * GET /api/modules/:id/topics
   */
  @Get(':id/topics')
  @ApiOperation({ summary: 'Retrieve all topics of a specific module' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the module',
  })
  @ApiResponse({
    status: 200,
    description: 'Module topics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found',
  })
  async getModuleTopics(@Param('id', ParseUUIDPipe) id: string) {
    return this.modulesService.getModuleTopics(id);
  }

  /**
   * Update module
   * PUT /api/modules/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the module to update',
  })
  @ApiBody({
    type: UpdateModuleDto,
    description: 'Updated module data',
  })
  @ApiResponse({
    status: 200,
    description: 'Module updated successfully',
  })
  async updateModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.updateModule(id, updateModuleDto);
  }

  /**
   * Delete module
   * DELETE /api/modules/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a module' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the module to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Module deleted successfully',
  })
  async deleteModule(@Param('id', ParseUUIDPipe) id: string) {
    return this.modulesService.deleteModule(id);
  }

  /**
   * Add topics to a module
   * POST /api/modules/:id/topics
   */
  @Post(':id/topics')
  @ApiOperation({ summary: 'Add topics to a module (order assigned automatically)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the module',
  })
  @ApiBody({
    type: AddTopicsDto,
    description: 'Topics to add to the module',
    examples: {
      example1: {
        summary: 'Add topics to module',
        value: {
          topic_ids: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Topics added to module successfully',
  })
  async addTopicsToModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addTopicsDto: AddTopicsDto,
  ) {
    return this.modulesService.addTopicsToModule(id, addTopicsDto);
  }

  /**
   * Remove a topic from a module
   * DELETE /api/modules/:id/topics/:topicId
   */
  @Delete(':id/topics/:topicId')
  @ApiOperation({ summary: 'Remove a topic from a module' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the module',
  })
  @ApiParam({
    name: 'topicId',
    type: String,
    description: 'UUID of the topic to remove',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic removed from module successfully',
  })
  async removeTopicFromModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('topicId', ParseUUIDPipe) topicId: string,
  ) {
    return this.modulesService.removeTopicFromModule(id, topicId);
  }

  /**
   * Reorder topics in a module
   * @param id - Module ID
   * @param reorderTopicsDto - Topic ordering data
   * @returns Updated module
   */
  @Put(':id/topics/reorder')
  @ApiOperation({ summary: 'Reorder topics in a module' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Topics reordered successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Module not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async reorderTopics(
    @Param('id') id: string,
    @Body() reorderTopicsDto: ReorderTopicsDto,
  ) {
    this.logger.log(`Reordering topics for module ${id}`);
    return this.modulesService.reorderTopics(id, reorderTopicsDto.topics);
  }
} 