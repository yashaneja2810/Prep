import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { AddModulesDto } from './dto/add-modules.dto';
import { ReorderModulesDto } from './dto/reorder-modules.dto';
import { ProgramCountsDto } from './dto/program-counts.dto';

/**
 * Programs Controller
 * Handles API endpoints for program management
 */
@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  private readonly logger = new Logger(ProgramsController.name);

  constructor(private readonly programsService: ProgramsService) {}

  /**
   * Create a new program
   * @param createProgramDto - Program data
   * @returns The created program
   */
  @Post()
  @ApiOperation({ summary: 'Create a new program' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Program created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async createProgram(@Body() createProgramDto: CreateProgramDto) {
    this.logger.log(`Creating new program with code: ${createProgramDto.program_code}`);
    return this.programsService.createProgram(createProgramDto);
  }

  /**
   * Get all programs
   * @returns List of programs
   */
  @Get()
  @ApiOperation({ summary: 'Get all programs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Programs retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findAllPrograms() {
    this.logger.log('Retrieving all programs');
    return this.programsService.findAllPrograms();
  }

  /**
   * Get all published programs
   * @returns List of published programs
   */
  @Get('published')
  @ApiOperation({ summary: 'Get all published programs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Published programs retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findPublishedPrograms() {
    this.logger.log('Retrieving all published programs');
    return this.programsService.findPublishedPrograms();
  }

  /**
   * Get a program by ID
   * @param id - Program ID
   * @returns Program with modules
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findProgramById(@Param('id') id: string) {
    this.logger.log(`Retrieving program with ID: ${id}`);
    return this.programsService.findProgramById(id);
  }

  /**
   * Get modules of a specific program
   * @param id - Program ID
   * @returns List of modules in the program
   */
  @Get(':id/modules')
  @ApiOperation({ summary: 'Get modules of a specific program' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program modules retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getProgramModules(@Param('id') id: string) {
    this.logger.log(`Retrieving modules for program with ID: ${id}`);
    return this.programsService.getProgramModules(id);
  }

  /**
   * Update a program
   * @param id - Program ID
   * @param updateProgramDto - Updated program data
   * @returns Updated program
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a program' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateProgram(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    this.logger.log(`Updating program with ID: ${id}`);
    return this.programsService.updateProgram(id, updateProgramDto);
  }

  /**
   * Delete a program
   * @param id - Program ID
   * @returns Success response
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Program deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async deleteProgram(@Param('id') id: string) {
    this.logger.log(`Deleting program with ID: ${id}`);
    return this.programsService.deleteProgram(id);
  }

  /**
   * Add modules to a program
   * @param programId - Program ID
   * @param addModulesDto - Modules to add
   * @returns Updated program
   */
  @Post(':id/modules')
  @ApiOperation({ summary: 'Add modules to a program' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Modules added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async addModulesToProgram(
    @Param('id') programId: string,
    @Body() addModulesDto: AddModulesDto,
  ) {
    this.logger.log(`Adding modules to program with ID: ${programId}`);
    return this.programsService.addModulesToProgram(programId, addModulesDto);
  }

  /**
   * Remove a module from a program
   * @param programId - Program ID
   * @param moduleId - Module ID
   * @returns Success response
   */
  @Delete(':programId/modules/:moduleId')
  @ApiOperation({ summary: 'Remove a module from a program' })
  @ApiParam({ name: 'programId', description: 'Program ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Module removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Module not found in program' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async removeModuleFromProgram(
    @Param('programId') programId: string,
    @Param('moduleId') moduleId: string,
  ) {
    this.logger.log(`Removing module ${moduleId} from program ${programId}`);
    return this.programsService.removeModuleFromProgram(programId, moduleId);
  }

  /**
   * Reorder modules in a program
   * @param id - Program ID
   * @param reorderModulesDto - Module ordering data
   * @returns Updated program
   */
  @Put(':id/modules/reorder')
  @ApiOperation({ summary: 'Reorder modules in a program' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Modules reordered successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Program not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async reorderModules(
    @Param('id') id: string,
    @Body() reorderModulesDto: ReorderModulesDto,
  ) {
    this.logger.log(`Reordering modules for program ${id}`);
    return this.programsService.reorderModules(id, reorderModulesDto.modules);
  }

  /**
   * Get counts of APs and CPs for published programs
   * @returns Object containing counts
   */
  @Get('published/counts')
  @ApiOperation({ summary: 'Get counts of APs and CPs for published programs' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Counts retrieved successfully',
    type: ProgramCountsDto
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async getPublishedProgramsCounts() {
    this.logger.log('Retrieving AP and CP counts for published programs');
    return this.programsService.getPublishedProgramsCounts();
  }
} 