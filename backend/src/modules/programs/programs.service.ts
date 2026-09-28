import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { AddModulesDto } from './dto/add-modules.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';

/**
 * Programs Service
 * Handles business logic for educational programs
 */
@Injectable()
export class ProgramsService extends BaseService {
  protected readonly logger = new Logger(ProgramsService.name);

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a new program with optional modules
   * @param createProgramDto - Program data
   * @returns The created program
   */
  async createProgram(createProgramDto: CreateProgramDto) {
    try {
      // First check if program code already exists
      const { data: existingProgram } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('id')
        .eq('program_code', createProgramDto.program_code)
        .maybeSingle();

      if (existingProgram) {
        throw new BadRequestException(`Program with code ${createProgramDto.program_code} already exists`);
      }

      // Create the program record
      const now = new Date().toISOString();
      const programData = {
        program_code: createProgramDto.program_code,
        title: createProgramDto.title,
        description: createProgramDto.description,
        prerequisites: createProgramDto.prerequisites,
        status: createProgramDto.status || 'draft',
        thumbnail: createProgramDto.thumbnail,
        duration: createProgramDto.duration,
        level: createProgramDto.level || 'beginner',
        created_at: now,
        updated_at: now
      };

      const { data: program, error } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .insert([programData])
        .select()
        .single();

      if (error) {
        this.logger.error(`Failed to create program: ${error.message}`);
        throw new BadRequestException(`Failed to create program: ${error.message}`);
      }

      // Add modules if provided
      if (createProgramDto.modules && createProgramDto.modules.length > 0) {
        const moduleOrderData = createProgramDto.modules.map((moduleId, index) => ({
          program_id: program.id,
          module_id: moduleId,
          module_order: index + 1,
        }));

        const { error: moduleError } = await this.supabaseService.client
          .from(TABLES.PROGRAM_MODULES)
          .insert(moduleOrderData);

        if (moduleError) {
          this.logger.error(`Failed to add modules to program: ${moduleError.message}`);
          // We don't throw here, as the program was created successfully
        }
      }

      // Return the complete program with modules
      return this.findProgramById(program.id);
    } catch (error) {
      this.logger.error(`Error in createProgram: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create program: ${error.message}`);
    }
  }

  /**
   * Find a program by ID with its modules
   * @param id - Program ID
   * @returns Program with modules
   */
  async findProgramById(id: string) {
    try {
      // Get the program basic info
      const { data: program, error } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('*')
        .eq('id', id)
        .single();

      if (error || !program) {
        throw new NotFoundException('Program not found');
      }

      // Get the associated modules
      const { data: programModules, error: modulesError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('*, module:modules(*)')
        .eq('program_id', id)
        .order('module_order', { ascending: true });

      if (modulesError) {
        this.logger.error(`Failed to fetch modules for program ${id}: ${modulesError.message}`);
        return successResponse(
          {
            ...program,
            modules: [],
          },
          'Program retrieved successfully'
        );
      }

      // Construct the full program object with modules
      const result = {
        ...program,
        modules: programModules.map(pm => pm.module),
      };

      return successResponse(result, 'Program retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findProgramById: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch program: ${error.message}`);
    }
  }

  /**
   * Get all programs with their modules
   * @returns List of programs
   */
  async findAllPrograms() {
    try {
      const { data: programs, error } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new BadRequestException(`Failed to fetch programs: ${error.message}`);
      }

      return successResponse(programs, 'Programs retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findAllPrograms: ${error.message}`);
      throw new BadRequestException(`Failed to fetch programs: ${error.message}`);
    }
  }

  /**
   * Update a program
   * @param id - Program ID
   * @param updateProgramDto - Updated program data
   * @returns Updated program
   */
  async updateProgram(id: string, updateProgramDto: UpdateProgramDto) {
    try {
      // First check if program exists
      const { data: existingProgram, error: checkError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (checkError || !existingProgram) {
        throw new NotFoundException('Program not found');
      }

      // Update the program
      const now = new Date().toISOString();
      const updateData: any = { updated_at: now };

      if (updateProgramDto.title !== undefined) updateData.title = updateProgramDto.title;
      if (updateProgramDto.description !== undefined) updateData.description = updateProgramDto.description;
      if (updateProgramDto.prerequisites !== undefined) updateData.prerequisites = updateProgramDto.prerequisites;
      if (updateProgramDto.status !== undefined) updateData.status = updateProgramDto.status;
      if (updateProgramDto.thumbnail !== undefined) updateData.thumbnail = updateProgramDto.thumbnail;
      if (updateProgramDto.duration !== undefined) updateData.duration = updateProgramDto.duration;
      if (updateProgramDto.level !== undefined) updateData.level = updateProgramDto.level;

      const { error: updateError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new BadRequestException(`Failed to update program: ${updateError.message}`);
      }

      // Update modules if provided
      if (updateProgramDto.modules !== undefined) {
        // First delete existing module associations
        const { error: deleteError } = await this.supabaseService.client
          .from(TABLES.PROGRAM_MODULES)
          .delete()
          .eq('program_id', id);

        if (deleteError) {
          this.logger.error(`Failed to remove existing modules: ${deleteError.message}`);
        }

        // Then add the new modules with their order
        if (updateProgramDto.modules.length > 0) {
          const moduleOrderData = updateProgramDto.modules.map((moduleId, index) => ({
            program_id: id,
            module_id: moduleId,
            module_order: index + 1,
          }));

          const { error: insertError } = await this.supabaseService.client
            .from(TABLES.PROGRAM_MODULES)
            .insert(moduleOrderData);

          if (insertError) {
            this.logger.error(`Failed to add modules to program: ${insertError.message}`);
          }
        }
      }

      // Return the updated program
      return this.findProgramById(id);
    } catch (error) {
      this.logger.error(`Error in updateProgram: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update program: ${error.message}`);
    }
  }

  /**
   * Delete a program and its module associations
   * @param id - Program ID
   * @returns Success response
   */
  async deleteProgram(id: string) {
    try {
      // First check if program exists
      const { data: existingProgram, error: checkError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (checkError || !existingProgram) {
        throw new NotFoundException('Program not found');
      }

      // Delete all module associations first
      const { error: deleteModulesError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .delete()
        .eq('program_id', id);

      if (deleteModulesError) {
        this.logger.error(`Failed to delete program modules: ${deleteModulesError.message}`);
        // Continue with deleting the program even if modules deletion fails
      }

      // Delete the program
      const { error: deleteError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new BadRequestException(`Failed to delete program: ${deleteError.message}`);
      }

      return deletedResponse('Program deleted successfully');
    } catch (error) {
      this.logger.error(`Error in deleteProgram: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete program: ${error.message}`);
    }
  }

  /**
   * Add modules to a program
   * @param programId - Program ID
   * @param addModulesDto - Modules to add to the program
   * @returns Updated program
   */
  async addModulesToProgram(programId: string, addModulesDto: AddModulesDto) {
    try {
      // First check if program exists
      const { data: existingProgram, error: checkError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('id')
        .eq('id', programId)
        .maybeSingle();

      if (checkError || !existingProgram) {
        throw new NotFoundException('Program not found');
      }

      // Validate that all modules exist
      const moduleIds = addModulesDto.module_ids;
      const { data: existingModules, error: modulesError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .in('id', moduleIds);

      if (modulesError) {
        throw new BadRequestException(`Failed to validate modules: ${modulesError.message}`);
      }

      if (existingModules.length !== moduleIds.length) {
        throw new BadRequestException('One or more modules do not exist');
      }

      // Check for existing module assignments to avoid duplicates
      const { data: existingAssignments, error: assignmentsError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('module_id')
        .eq('program_id', programId)
        .in('module_id', moduleIds);

      if (assignmentsError) {
        this.logger.error(`Failed to check existing module assignments: ${assignmentsError.message}`);
      }

      // Filter out modules that are already assigned
      const existingModuleIds = existingAssignments?.map(a => a.module_id) || [];
      const newModuleIds = moduleIds.filter(moduleId => !existingModuleIds.includes(moduleId));

      if (newModuleIds.length === 0) {
        return successResponse(
          { message: 'All modules are already assigned to this program' },
          'No new modules to add'
        );
      }

      // Get current max order
      const { data: maxOrderResult, error: maxOrderError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('module_order')
        .eq('program_id', programId)
        .order('module_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxOrderError) {
        this.logger.error(`Failed to get max module order: ${maxOrderError.message}`);
      }

      const startOrder = (maxOrderResult?.module_order || 0) + 1;

      // Prepare module associations with auto-incremented order
      const moduleAssociations = newModuleIds.map((moduleId, index) => ({
        program_id: programId,
        module_id: moduleId,
        module_order: startOrder + index,
      }));

      // Insert the new associations
      const { error: insertError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .insert(moduleAssociations);

      if (insertError) {
        throw new BadRequestException(`Failed to add modules to program: ${insertError.message}`);
      }

      // Return the updated program
      return this.findProgramById(programId);
    } catch (error) {
      this.logger.error(`Error in addModulesToProgram: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to add modules to program: ${error.message}`);
    }
  }

  /**
   * Remove a module from a program and update the order of remaining modules
   * @param programId - Program ID
   * @param moduleId - Module ID
   * @returns Success response
   */
  async removeModuleFromProgram(programId: string, moduleId: string) {
    try {
      this.logger.debug(`Removing module ${moduleId} from program ${programId}`);
      
      // First, find the module association to get its order
      const { data: moduleAssociation, error: findError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('id, module_order')
        .eq('program_id', programId)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (findError || !moduleAssociation) {
        this.logger.error(`Module ${moduleId} not found in program ${programId}`);
        throw new NotFoundException('Module is not associated with this program');
      }

      const deletedOrder = moduleAssociation.module_order;
      this.logger.debug(`Found module to delete with order ${deletedOrder}`);

      // Get all current modules for debugging
      const { data: beforeModules } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('module_id, module_order')
        .eq('program_id', programId)
        .order('module_order', { ascending: true });
      
      this.logger.debug(`Current modules before deletion: ${JSON.stringify(beforeModules)}`);

      // Delete the module association
      const { error: deleteError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .delete()
        .eq('id', moduleAssociation.id);

      if (deleteError) {
        this.logger.error(`Error deleting module: ${deleteError.message}`);
        throw new BadRequestException(`Failed to remove module from program: ${deleteError.message}`);
      }

      // Get all modules that need their order updated (those with order > deletedOrder)
      const { data: modulesToUpdate, error: fetchError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('id, module_order')
        .eq('program_id', programId)
        .gt('module_order', deletedOrder)
        .order('module_order', { ascending: true });
        
      if (fetchError) {
        this.logger.error(`Error fetching modules to update: ${fetchError.message}`);
      } else if (modulesToUpdate && modulesToUpdate.length > 0) {
        this.logger.debug(`Found ${modulesToUpdate.length} modules to update`);
        
        // Process updates in batches for better performance
        const batchSize = 10;
        for (let i = 0; i < modulesToUpdate.length; i += batchSize) {
          const batch = modulesToUpdate.slice(i, i + batchSize);
          const updatePromises = batch.map(module => 
            this.supabaseService.client
              .from(TABLES.PROGRAM_MODULES)
              .update({ module_order: module.module_order - 1 })
              .eq('id', module.id)
          );
          
          await Promise.all(updatePromises);
        }
        
        this.logger.debug('Successfully updated all module orders');
      } else {
        this.logger.debug(`No modules with order > ${deletedOrder} found, no reordering needed`);
      }

      // Get the final state for debugging
      const { data: afterModules } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('module_id, module_order')
        .eq('program_id', programId)
        .order('module_order', { ascending: true });
        
      this.logger.debug(`Modules after reordering: ${JSON.stringify(afterModules)}`);

      return deletedResponse('Module removed from program successfully');
    } catch (error) {
      this.logger.error(`Error in removeModuleFromProgram: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to remove module from program: ${error.message}`);
    }
  }

  /**
   * Reorder modules in a program
   * @param programId - Program ID
   * @param moduleOrders - Array of module IDs and their new orders
   * @returns Updated program
   */
  async reorderModules(programId: string, moduleOrders: { module_id: string; order: number }[]) {
    try {
      this.logger.debug(`Reordering modules for program ${programId}`);
      
      // First check if program exists
      const { data: existingProgram, error: checkError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('id')
        .eq('id', programId)
        .maybeSingle();

      if (checkError || !existingProgram) {
        throw new NotFoundException('Program not found');
      }

      // Get all current module associations
      const { data: currentModules, error: fetchError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('id, module_id, module_order')
        .eq('program_id', programId)
        .order('module_order', { ascending: true });

      if (fetchError || !currentModules) {
        throw new BadRequestException(`Failed to fetch current modules: ${fetchError?.message || 'No modules found'}`);
      }

      // Create a map of module IDs to their association IDs for easier lookup
      const moduleMap = new Map<string, string>();
      currentModules.forEach(module => {
        moduleMap.set(module.module_id, module.id);
      });

      // Validate that all modules in the request exist in the program
      for (const moduleOrder of moduleOrders) {
        if (!moduleMap.has(moduleOrder.module_id)) {
          throw new BadRequestException(`Module ${moduleOrder.module_id} is not associated with this program`);
        }
      }

      // Update the order of each module
      const updatePromises = moduleOrders.map(moduleOrder => {
        const associationId = moduleMap.get(moduleOrder.module_id);
        if (!associationId) {
          throw new BadRequestException(`Module ${moduleOrder.module_id} association not found`);
        }
        return this.supabaseService.client
          .from(TABLES.PROGRAM_MODULES)
          .update({ module_order: moduleOrder.order })
          .eq('id', associationId);
      });

      // Execute all updates
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      for (let i = 0; i < results.length; i++) {
        if (results[i].error) {
          const errorMessage = results[i].error?.message || 'Unknown error';
          this.logger.error(`Failed to update module order: ${errorMessage}`);
          throw new BadRequestException(`Failed to update module order: ${errorMessage}`);
        }
      }

      // Return the updated program
      return this.findProgramById(programId);
    } catch (error) {
      this.logger.error(`Error in reorderModules: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to reorder modules: ${error.message}`);
    }
  }

  /**
   * Get all modules of a specific program
   * @param programId - Program ID
   * @returns List of modules in the program
   */
  async getProgramModules(programId: string) {
    try {
      // First check if program exists
      const { data: existingProgram, error: checkError } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('id')
        .eq('id', programId)
        .maybeSingle();

      if (checkError || !existingProgram) {
        throw new NotFoundException('Program not found');
      }

      // Get the module associations with ordered modules
      const { data: programModules, error: modulesError } = await this.supabaseService.client
        .from(TABLES.PROGRAM_MODULES)
        .select('*, module:modules(*)')
        .eq('program_id', programId)
        .order('module_order', { ascending: true });

      if (modulesError) {
        this.logger.error(`Failed to fetch modules for program ${programId}: ${modulesError.message}`);
        throw new BadRequestException(`Failed to fetch modules: ${modulesError.message}`);
      }

      // Extract just the module data
      const modules = programModules.map(pm => ({
        ...pm.module,
        order: pm.module_order
      }));

      return successResponse(modules, 'Program modules retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in getProgramModules: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch program modules: ${error.message}`);
    }
  }

  /**
   * Get all published programs
   * @returns List of published programs
   */
  async findPublishedPrograms() {
    try {
      this.logger.log('Fetching all published programs');
      
      const { data: programs, error } = await this.supabaseService.client
        .from(TABLES.PROGRAMS)
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        throw new BadRequestException(`Failed to fetch published programs: ${error.message}`);
      }

      return successResponse(programs, 'Published programs retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findPublishedPrograms: ${error.message}`);
      throw new BadRequestException(`Failed to fetch published programs: ${error.message}`);
    }
  }

  /**
   * Get counts of APs and CPs for published programs
   * @returns Object containing counts of APs and CPs
   */
  async getPublishedProgramsCounts() {
    try {
      this.logger.log('Fetching AP and CP counts for published programs');
      
      let apCount = 0;
      let cpCount = 0;
      
      try {
        // Try using RPC functions first
        const { data: apRpcCount, error: apError } = await this.supabaseService.client.rpc(
          'get_published_program_ap_count'
        );
        
        if (apError) {
          throw new Error(`RPC function failed: ${apError.message}`);
        }
        
        const { data: cpRpcCount, error: cpError } = await this.supabaseService.client.rpc(
          'get_published_program_cp_count'
        );
        
        if (cpError) {
          throw new Error(`RPC function failed: ${cpError.message}`);
        }
        
        apCount = apRpcCount || 0;
        cpCount = cpRpcCount || 0;
        
        this.logger.log(`Successfully retrieved counts using RPC functions: AP=${apCount}, CP=${cpCount}`);
      } catch (rpcError) {
        // Fallback to manual counting if RPC functions aren't available
        this.logger.warn(`RPC functions not available, falling back to manual counting: ${rpcError.message}`);
        
        // Step 1: Get all published programs
        const { data: publishedPrograms, error: programsError } = await this.supabaseService.client
          .from(TABLES.PROGRAMS)
          .select('id')
          .eq('status', 'published');
        
        if (programsError) {
          throw new BadRequestException(`Failed to fetch published programs: ${programsError.message}`);
        }
        
        if (!publishedPrograms || publishedPrograms.length === 0) {
          this.logger.log('No published programs found');
          return successResponse(
            { ap_count: 0, cp_count: 0 },
            'No published programs found'
          );
        }
        
        const programIds = publishedPrograms.map(program => program.id);
        
        // Step 2: Get all modules associated with these programs
        const { data: programModules, error: modulesError } = await this.supabaseService.client
          .from(TABLES.PROGRAM_MODULES)
          .select('module_id')
          .in('program_id', programIds);
        
        if (modulesError) {
          throw new BadRequestException(`Failed to fetch program modules: ${modulesError.message}`);
        }
        
        if (!programModules || programModules.length === 0) {
          this.logger.log('No modules found in published programs');
          return successResponse(
            { ap_count: 0, cp_count: 0 },
            'No modules found in published programs'
          );
        }
        
        const moduleIds = programModules.map(module => module.module_id);
        
        // Step 3: Get all topics associated with these modules
        const { data: moduleTopics, error: topicsError } = await this.supabaseService.client
          .from(TABLES.MODULE_TOPICS)
          .select('topic_id')
          .in('module_id', moduleIds);
        
        if (topicsError) {
          throw new BadRequestException(`Failed to fetch module topics: ${topicsError.message}`);
        }
        
        if (!moduleTopics || moduleTopics.length === 0) {
          this.logger.log('No topics found in published program modules');
          return successResponse(
            { ap_count: 0, cp_count: 0 },
            'No topics found in published program modules'
          );
        }
        
        const topicIds = moduleTopics.map(topic => topic.topic_id);
        
        // Step 4: Count APs for these topics
        const { data: aps, error: apsError } = await this.supabaseService.client
          .from(TABLES.APS)
          .select('id', { count: 'exact' })
          .in('topic_id', topicIds);
        
        if (apsError) {
          throw new BadRequestException(`Failed to count APs: ${apsError.message}`);
        }
        
        // Step 5: Count CPs for these topics
        const { data: cps, error: cpsError, count: cpsCount } = await this.supabaseService.client
          .from(TABLES.CPS)
          .select('id', { count: 'exact' })
          .in('topic_id', topicIds);
        
        if (cpsError) {
          throw new BadRequestException(`Failed to count CPs: ${cpsError.message}`);
        }
        
        apCount = aps?.length || 0;
        cpCount = cpsCount || 0;
        
        this.logger.log(`Successfully retrieved counts using manual counting: AP=${apCount}, CP=${cpCount}`);
      }
      
      return successResponse(
        {
          ap_count: apCount,
          cp_count: cpCount
        },
        'Published program AP and CP counts retrieved successfully'
      );
    } catch (error) {
      this.logger.error(`Error in getPublishedProgramsCounts: ${error.message}`);
      throw new BadRequestException(`Failed to fetch published program counts: ${error.message}`);
    }
  }
} 