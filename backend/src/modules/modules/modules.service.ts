import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AddTopicsDto } from './dto/add-topics.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';

/**
 * Modules Service
 * Handles business logic for educational modules
 */
@Injectable()
export class ModulesService extends BaseService {
  protected readonly logger = new Logger(ModulesService.name);

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Get all modules with their topics
   * @returns List of all modules with their topics
   */
  async findAllModules() {
    try {
      // Get all modules
      const { data: modules, error } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new BadRequestException(`Failed to fetch modules: ${error.message}`);
      }

      // Get all module-topic relationships with topic details
      const { data: moduleTopics, error: topicsError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('*, topic:topics(*)')
        .order('topic_order', { ascending: true });

      if (topicsError) {
        this.logger.error(`Failed to fetch topics for modules: ${topicsError.message}`);
        // Return modules without topics
        return successResponse(
          modules.map(module => ({ ...module, topics: [] })),
          'Modules retrieved successfully'
        );
      }

      // Group topics by module_id
      const topicsByModule = moduleTopics.reduce((acc, mt) => {
        if (!acc[mt.module_id]) {
          acc[mt.module_id] = [];
        }
        acc[mt.module_id].push(mt);
        return acc;
      }, {});

      // Add topics to each module
      const modulesWithTopics = modules.map(module => ({
        ...module,
        topics: topicsByModule[module.id] || [],
      }));

      return successResponse(modulesWithTopics, 'Modules retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findAllModules: ${error.message}`);
      throw new BadRequestException(`Failed to fetch modules: ${error.message}`);
    }
  }

  /**
   * Create a new module with optional topics
   * @param createModuleDto - Module data
   * @returns The created module
   */
  async createModule(createModuleDto: CreateModuleDto) {
    try {
      // First check if module code already exists
      const { data: existingModule } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .eq('module_code', createModuleDto.module_code)
        .maybeSingle();

      if (existingModule) {
        throw new BadRequestException(`Module with code ${createModuleDto.module_code} already exists`);
      }

      // Create the module record
      const now = new Date().toISOString();
      const moduleData = {
        module_code: createModuleDto.module_code,
        module_title: createModuleDto.module_title,
        module_name: createModuleDto.module_name,
        description: createModuleDto.description,
        status: createModuleDto.status || 'draft',
        created_at: now,
        updated_at: now
      };

      const { data: module, error } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .insert([moduleData])
        .select()
        .single();

      if (error) {
        this.logger.error(`Failed to create module: ${error.message}`);
        throw new BadRequestException(`Failed to create module: ${error.message}`);
      }

      // Add topics if provided
      if (createModuleDto.topics && createModuleDto.topics.length > 0) {
        const topicOrderData = createModuleDto.topics.map((topicId, index) => ({
          module_id: module.id,
          topic_id: topicId,
          topic_order: index + 1,
        }));

        const { error: topicError } = await this.supabaseService.client
          .from(TABLES.MODULE_TOPICS)
          .insert(topicOrderData);

        if (topicError) {
          this.logger.error(`Failed to add topics to module: ${topicError.message}`);
          // We don't throw here, as the module was created successfully
        }
      }

      // Return the complete module with topics
      return this.findModuleById(module.id);
    } catch (error) {
      this.logger.error(`Error in createModule: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create module: ${error.message}`);
    }
  }

  /**
   * Find a module by ID with its topics
   * @param id - Module ID
   * @returns Module with topics
   */
  async findModuleById(id: string) {
    try {
      // Get the module basic info
      const { data: module, error } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('*')
        .eq('id', id)
        .single();

      if (error || !module) {
        throw new NotFoundException('Module not found');
      }

      // Get the associated topics
      const { data: moduleTopics, error: topicsError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('*, topic:topics(*)')
        .eq('module_id', id)
        .order('topic_order', { ascending: true });

      if (topicsError) {
        this.logger.error(`Failed to fetch topics for module ${id}: ${topicsError.message}`);
        return successResponse(
          {
            ...module,
            topics: [],
          },
          'Module retrieved successfully'
        );
      }

      // Construct the full module object with topics
      const result = {
        ...module,
        topics: moduleTopics,
      };

      return successResponse(result, 'Module retrieved successfully');
    } catch (error) {
      this.logger.error(`Error in findModuleById: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch module: ${error.message}`);
    }
  }

  /**
   * Get all topics of a specific module
   * @param id - Module ID
   * @returns Array of topics belonging to the module
   */
  async getModuleTopics(id: string) {
    try {
      // First verify that the module exists
      const { data: module, error: moduleError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .eq('id', id)
        .single();

      if (moduleError || !module) {
        throw new NotFoundException(`Module with ID ${id} not found`);
      }

      // Get the associated topics with order information
      const { data: moduleTopics, error: topicsError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('id, topic_id, topic_order, module_id, topic:topics(*)')
        .eq('module_id', id)
        .order('topic_order', { ascending: true });

      if (topicsError) {
        this.logger.error(`Failed to fetch topics for module ${id}: ${topicsError.message}`);
        throw new BadRequestException(`Failed to fetch topics: ${topicsError.message}`);
      }

      return successResponse(
        moduleTopics,
        'Module topics retrieved successfully'
      );
    } catch (error) {
      this.logger.error(`Error in getModuleTopics: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch module topics: ${error.message}`);
    }
  }

  /**
   * Update a module
   * @param id - Module ID
   * @param updateModuleDto - Updated module data
   * @returns Updated module
   */
  async updateModule(id: string, updateModuleDto: UpdateModuleDto) {
    try {
      // First check if module exists
      const { data: existingModule, error: checkError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (checkError || !existingModule) {
        throw new NotFoundException('Module not found');
      }

      // Update the module
      const now = new Date().toISOString();
      const updateData: any = { updated_at: now };

      if (updateModuleDto.module_title) updateData.module_title = updateModuleDto.module_title;
      if (updateModuleDto.module_name) updateData.module_name = updateModuleDto.module_name;
      if (updateModuleDto.description !== undefined) updateData.description = updateModuleDto.description;
      if (updateModuleDto.status) updateData.status = updateModuleDto.status;

      const { error: updateError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new BadRequestException(`Failed to update module: ${updateError.message}`);
      }

      // Update topics if provided
      if (updateModuleDto.topics) {
        // First delete existing topic associations
        const { error: deleteError } = await this.supabaseService.client
          .from(TABLES.MODULE_TOPICS)
          .delete()
          .eq('module_id', id);

        if (deleteError) {
          this.logger.error(`Failed to remove existing topics: ${deleteError.message}`);
        }

        // Then add the new topics with their order
        if (updateModuleDto.topics.length > 0) {
          const topicOrderData = updateModuleDto.topics.map((topicId, index) => ({
            module_id: id,
            topic_id: topicId,
            topic_order: index + 1,
          }));

          const { error: insertError } = await this.supabaseService.client
            .from(TABLES.MODULE_TOPICS)
            .insert(topicOrderData);

          if (insertError) {
            this.logger.error(`Failed to add topics to module: ${insertError.message}`);
          }
        }
      }

      // Return the updated module
      return this.findModuleById(id);
    } catch (error) {
      this.logger.error(`Error in updateModule: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update module: ${error.message}`);
    }
  }

  /**
   * Delete a module and its topic associations
   * @param id - Module ID
   * @returns Success response
   */
  async deleteModule(id: string) {
    try {
      // First check if module exists
      const { data: existingModule, error: checkError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (checkError || !existingModule) {
        throw new NotFoundException('Module not found');
      }

      // Delete all topic associations first
      const { error: deleteTopicsError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .delete()
        .eq('module_id', id);

      if (deleteTopicsError) {
        this.logger.error(`Failed to delete module topics: ${deleteTopicsError.message}`);
        // Continue with deleting the module even if topics deletion fails
      }

      // Delete the module
      const { error: deleteError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new BadRequestException(`Failed to delete module: ${deleteError.message}`);
      }

      return deletedResponse('Module deleted successfully');
    } catch (error) {
      this.logger.error(`Error in deleteModule: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete module: ${error.message}`);
    }
  }

  /**
   * Add topics to a module
   * @param moduleId - Module ID
   * @param addTopicsDto - Topics to add to the module
   * @returns Updated module
   */
  async addTopicsToModule(moduleId: string, addTopicsDto: AddTopicsDto) {
    try {
      // First check if module exists
      const { data: existingModule, error: checkError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .eq('id', moduleId)
        .maybeSingle();

      if (checkError || !existingModule) {
        throw new NotFoundException('Module not found');
      }

      // Validate that all topics exist
      const topicIds = addTopicsDto.topic_ids;
      const { data: existingTopics, error: topicsError } = await this.supabaseService.client
        .from(TABLES.TOPICS)
        .select('id')
        .in('id', topicIds);

      if (topicsError) {
        throw new BadRequestException(`Failed to validate topics: ${topicsError.message}`);
      }

      if (existingTopics.length !== topicIds.length) {
        throw new BadRequestException('One or more topics do not exist');
      }

      // Check for existing topic assignments to avoid duplicates
      const { data: existingAssignments, error: assignmentsError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('topic_id')
        .eq('module_id', moduleId)
        .in('topic_id', topicIds);

      if (assignmentsError) {
        this.logger.error(`Failed to check existing topic assignments: ${assignmentsError.message}`);
      }

      // Filter out topics that are already assigned
      const existingTopicIds = existingAssignments?.map(a => a.topic_id) || [];
      const newTopicIds = topicIds.filter(topicId => !existingTopicIds.includes(topicId));

      if (newTopicIds.length === 0) {
        return successResponse(
          { message: 'All topics are already assigned to this module' },
          'No new topics to add'
        );
      }

      // Get current max order
      const { data: maxOrderResult, error: maxOrderError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('topic_order')
        .eq('module_id', moduleId)
        .order('topic_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxOrderError) {
        this.logger.error(`Failed to get max topic order: ${maxOrderError.message}`);
      }

      const startOrder = (maxOrderResult?.topic_order || 0) + 1;

      // Prepare topic associations with auto-incremented order
      const topicAssociations = newTopicIds.map((topicId, index) => ({
        module_id: moduleId,
        topic_id: topicId,
        topic_order: startOrder + index,
      }));

      // Insert the new associations
      const { error: insertError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .insert(topicAssociations);

      if (insertError) {
        throw new BadRequestException(`Failed to add topics to module: ${insertError.message}`);
      }

      // Return the updated module
      return this.findModuleById(moduleId);
    } catch (error) {
      this.logger.error(`Error in addTopicsToModule: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to add topics to module: ${error.message}`);
    }
  }

  /**
   * Remove a topic from a module and update the order of remaining topics
   * @param moduleId - Module ID
   * @param topicId - Topic ID
   * @returns Success response
   */
  async removeTopicFromModule(moduleId: string, topicId: string) {
    try {
      this.logger.debug(`Removing topic ${topicId} from module ${moduleId}`);
      
      // First, find the topic association to get its order
      const { data: topicAssociation, error: findError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('id, topic_order')
        .eq('module_id', moduleId)
        .eq('topic_id', topicId)
        .maybeSingle();

      if (findError || !topicAssociation) {
        this.logger.error(`Topic ${topicId} not found in module ${moduleId}`);
        throw new NotFoundException('Topic is not associated with this module');
      }

      const deletedOrder = topicAssociation.topic_order;
      this.logger.debug(`Found topic to delete with order ${deletedOrder}`);

      // Get all current topics for debugging
      const { data: beforeTopics } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('topic_id, topic_order')
        .eq('module_id', moduleId)
        .order('topic_order', { ascending: true });
      
      this.logger.debug(`Current topics before deletion: ${JSON.stringify(beforeTopics)}`);

      // Delete the topic association
      const { error: deleteError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .delete()
        .eq('id', topicAssociation.id);

      if (deleteError) {
        this.logger.error(`Error deleting topic: ${deleteError.message}`);
        throw new BadRequestException(`Failed to remove topic from module: ${deleteError.message}`);
      }

      // Get all topics that need their order updated (those with order > deletedOrder)
      const { data: topicsToUpdate, error: fetchError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('id, topic_order')
        .eq('module_id', moduleId)
        .gt('topic_order', deletedOrder)
        .order('topic_order', { ascending: true });
        
      if (fetchError) {
        this.logger.error(`Error fetching topics to update: ${fetchError.message}`);
      } else if (topicsToUpdate && topicsToUpdate.length > 0) {
        this.logger.debug(`Found ${topicsToUpdate.length} topics to update`);
        
        // Process updates in batches for better performance
        const batchSize = 10;
        for (let i = 0; i < topicsToUpdate.length; i += batchSize) {
          const batch = topicsToUpdate.slice(i, i + batchSize);
          const updatePromises = batch.map(topic => 
            this.supabaseService.client
              .from(TABLES.MODULE_TOPICS)
              .update({ topic_order: topic.topic_order - 1 })
              .eq('id', topic.id)
          );
          
          await Promise.all(updatePromises);
        }
        
        this.logger.debug('Successfully updated all topic orders');
      } else {
        this.logger.debug(`No topics with order > ${deletedOrder} found, no reordering needed`);
      }

      // Get the final state for debugging
      const { data: afterTopics } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('topic_id, topic_order')
        .eq('module_id', moduleId)
        .order('topic_order', { ascending: true });
        
      this.logger.debug(`Topics after reordering: ${JSON.stringify(afterTopics)}`);

      return deletedResponse('Topic removed from module successfully');
    } catch (error) {
      this.logger.error(`Error in removeTopicFromModule: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to remove topic from module: ${error.message}`);
    }
  }

  /**
   * Reorder topics in a module
   * @param moduleId - Module ID
   * @param topicOrders - Array of topic IDs and their new orders
   * @returns Updated module
   */
  async reorderTopics(moduleId: string, topicOrders: { topic_id: string; order: number }[]) {
    try {
      this.logger.debug(`Reordering topics for module ${moduleId}`);
      
      // First check if module exists
      const { data: existingModule, error: checkError } = await this.supabaseService.client
        .from(TABLES.MODULES)
        .select('id')
        .eq('id', moduleId)
        .maybeSingle();

      if (checkError || !existingModule) {
        throw new NotFoundException('Module not found');
      }

      // Get all current topic associations
      const { data: currentTopics, error: fetchError } = await this.supabaseService.client
        .from(TABLES.MODULE_TOPICS)
        .select('id, topic_id, topic_order')
        .eq('module_id', moduleId)
        .order('topic_order', { ascending: true });

      if (fetchError || !currentTopics) {
        throw new BadRequestException(`Failed to fetch current topics: ${fetchError?.message || 'No topics found'}`);
      }

      // Create a map of topic IDs to their association IDs for easier lookup
      const topicMap = new Map<string, string>();
      currentTopics.forEach(topic => {
        topicMap.set(topic.topic_id, topic.id);
      });

      // Validate that all topics in the request exist in the module
      for (const topicOrder of topicOrders) {
        if (!topicMap.has(topicOrder.topic_id)) {
          throw new BadRequestException(`Topic ${topicOrder.topic_id} is not associated with this module`);
        }
      }

      // Update the order of each topic
      const updatePromises = topicOrders.map(topicOrder => {
        const associationId = topicMap.get(topicOrder.topic_id);
        if (!associationId) {
          throw new BadRequestException(`Topic ${topicOrder.topic_id} association not found`);
        }
        return this.supabaseService.client
          .from(TABLES.MODULE_TOPICS)
          .update({ topic_order: topicOrder.order })
          .eq('id', associationId);
      });

      // Execute all updates
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      for (let i = 0; i < results.length; i++) {
        if (results[i].error) {
          const errorMessage = results[i].error?.message || 'Unknown error';
          this.logger.error(`Failed to update topic order: ${errorMessage}`);
          throw new BadRequestException(`Failed to update topic order: ${errorMessage}`);
        }
      }

      // Return the updated module
      return this.findModuleById(moduleId);
    } catch (error) {
      this.logger.error(`Error in reorderTopics: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to reorder topics: ${error.message}`);
    }
  }
}