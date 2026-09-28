import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateObjectiveDto, CreateObjectiveHeadingDto } from './dto/create-objective.dto';
import { UpdateHeadingDto } from './dto/update-heading.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';
import { Logger } from '@nestjs/common';

/**
 * Objectives Service
 * Handles business logic for topic objectives
 */
@Injectable()
export class ObjectivesService extends BaseService {
  protected readonly logger = new Logger(ObjectivesService.name);

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a complete objective with headings and items
   * @param createObjectiveDto - DTO containing topic_id and optional objectives array
   * @returns Created objective with complete hierarchy
   */
  async createObjective(createObjectiveDto: CreateObjectiveDto) {
    // Validate that the topic exists
    await this.validateTopicExists(createObjectiveDto.topic_id);

    // Use a transaction to ensure all related data is created or nothing is
    const { data: objective, error } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE)
      .insert([{ topic_id: createObjectiveDto.topic_id }])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create objective: ${error.message}`);
    }

    // If objectives array is provided, create headings and items
    if (createObjectiveDto.objectives && createObjectiveDto.objectives.length > 0) {
      let headingOrder = 1;
      
      // Process each heading and its items
      for (const headingData of createObjectiveDto.objectives) {
        await this.createHeadingWithItems(objective.id, headingData, headingOrder);
        headingOrder++;
      }
    }

    // Fetch the complete objective hierarchy
    return this.findObjectiveById(objective.id);
  }

  /**
   * Create a heading and its items
   * @param objectiveId - ID of the parent objective
   * @param headingData - Heading data with items
   * @param orderIndex - Order index for the heading
   */
  private async createHeadingWithItems(
    objectiveId: string, 
    headingData: CreateObjectiveHeadingDto,
    orderIndex: number
  ) {
    const now = new Date().toISOString();
    
    // Create the heading
    const { data: heading, error } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_HEADINGS)
      .insert([{
        objective_id: objectiveId,
        heading: headingData.heading,
        order_index: orderIndex,
        updated_at: now
      }])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create heading: ${error.message}`);
    }

    // Create items if they exist
    if (headingData.items && headingData.items.length > 0) {
      let itemOrder = 1;
      
      // Prepare items with heading_id and order
      const items = headingData.items.map(item => ({
        heading_id: heading.id,
        text: item.text,
        order_index: itemOrder++,
        updated_at: now
      }));

      // Insert all items at once
      const { error: itemsError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE_ITEMS)
        .insert(items);

      if (itemsError) {
        throw new BadRequestException(`Failed to create items: ${itemsError.message}`);
      }
    }

    return heading;
  }

  /**
   * Find an objective by ID with its complete hierarchy
   * @param id - Objective ID
   * @returns Objective with headings and items
   */
  async findObjectiveById(id: string) {
    // Get the objective
    const { data: objective, error } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE)
      .select('*, topic:topics(id, topic_code, title)')
      .eq('id', id)
      .single();

    if (error || !objective) {
      throw new NotFoundException(MESSAGES.OBJECTIVE_NOT_FOUND);
    }

    // Get headings for this objective, ordered by order_index
    const { data: headings, error: headingsError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_HEADINGS)
      .select('*')
      .eq('objective_id', id)
      .order('order_index', { ascending: true });

    if (headingsError) {
      throw new BadRequestException(`Failed to fetch objective headings: ${headingsError.message}`);
    }

    // For each heading, get its items
    const headingsWithItems = await Promise.all(
      headings.map(async (heading) => {
        const { data: items, error: itemsError } = await this.supabaseService.client
          .from(TABLES.OBJECTIVE_ITEMS)
          .select('*')
          .eq('heading_id', heading.id)
          .order('order_index', { ascending: true });

        if (itemsError) {
          throw new BadRequestException(`Failed to fetch heading items: ${itemsError.message}`);
        }

        return {
          ...heading,
          items: items || []
        };
      })
    );

    // Construct the full objective hierarchy
    const result = {
      ...objective,
      headings: headingsWithItems || []
    };

    return successResponse(result, 'Objective retrieved successfully');
  }

  /**
   * Find objectives by topic ID
   * @param topicId - Topic ID
   * @returns Objectives for the topic
   */
  async findObjectivesByTopicId(topicId: string) {
    // Validate that the topic exists
    await this.validateTopicExists(topicId);

    // Get objectives for this topic
    const { data: objectives, error } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE)
      .select('*')
      .eq('topic_id', topicId);

    if (error) {
      throw new BadRequestException(`Failed to fetch objectives: ${error.message}`);
    }

    // If no objectives found, return empty array
    if (!objectives || objectives.length === 0) {
      return successResponse([], 'No objectives found for this topic');
    }

    // For each objective, get its complete hierarchy
    const objectivesWithHierarchy = await Promise.all(
      objectives.map(async (objective) => {
        // Get headings for this objective
        const { data: headings, error: headingsError } = await this.supabaseService.client
          .from(TABLES.OBJECTIVE_HEADINGS)
          .select('*')
          .eq('objective_id', objective.id)
          .order('order_index', { ascending: true });

        if (headingsError) {
          throw new BadRequestException(`Failed to fetch headings: ${headingsError.message}`);
        }

        // For each heading, get its items
        const headingsWithItems = await Promise.all(
          headings.map(async (heading) => {
            const { data: items, error: itemsError } = await this.supabaseService.client
              .from(TABLES.OBJECTIVE_ITEMS)
              .select('*')
              .eq('heading_id', heading.id)
              .order('order_index', { ascending: true });

            if (itemsError) {
              throw new BadRequestException(`Failed to fetch items: ${itemsError.message}`);
            }

            return {
              ...heading,
              items: items || []
            };
          })
        );

        return {
          ...objective,
          headings: headingsWithItems || []
        };
      })
    );

    return successResponse(objectivesWithHierarchy, 'Topic objectives retrieved successfully');
  }

  /**
   * Delete an objective and all its related data
   * @param id - Objective ID
   * @returns Success message
   */
  async deleteObjective(id: string) {
    // Check if objective exists
    const { data, error } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE)
      .select('id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.OBJECTIVE_NOT_FOUND);
    }

    // Delete the objective (cascade will handle related data)
    const { error: deleteError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE)
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new BadRequestException(`Failed to delete objective: ${deleteError.message}`);
    }

    return deletedResponse('Objective deleted successfully');
  }

  /**
   * Update an entire objective with its headings and items
   * @param id - Objective ID
   * @param updateObjectiveDto - Updated objective data
   * @returns Updated objective with complete hierarchy
   */
  async updateObjective(id: string, updateObjectiveDto: CreateObjectiveDto) {
    // Check if objective exists
    const { data: objective, error } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE)
      .select('id, topic_id')
      .eq('id', id)
      .single();

    if (error || !objective) {
      throw new NotFoundException(MESSAGES.OBJECTIVE_NOT_FOUND);
    }

    // Validate that the topic exists if it's being changed
    if (updateObjectiveDto.topic_id !== objective.topic_id) {
      await this.validateTopicExists(updateObjectiveDto.topic_id);
      
      // Update the topic_id if it has changed
      const { error: updateError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE)
        .update({ topic_id: updateObjectiveDto.topic_id })
        .eq('id', id);

      if (updateError) {
        throw new BadRequestException(`Failed to update objective: ${updateError.message}`);
      }
    }

    // Get existing headings to track what needs to be deleted
    const { data: existingHeadings, error: headingsError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_HEADINGS)
      .select('id')
      .eq('objective_id', id);

    if (headingsError) {
      throw new BadRequestException(`Failed to fetch headings: ${headingsError.message}`);
    }

    // Delete all existing headings (cascade will delete items)
    if (existingHeadings && existingHeadings.length > 0) {
      const headingIds = existingHeadings.map(h => h.id);
      const { error: deleteError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE_HEADINGS)
        .delete()
        .in('id', headingIds);

      if (deleteError) {
        throw new BadRequestException(`Failed to delete existing headings: ${deleteError.message}`);
      }
    }

    // Create new headings and items
    if (updateObjectiveDto.objectives && updateObjectiveDto.objectives.length > 0) {
      let headingOrder = 1;
      for (const headingData of updateObjectiveDto.objectives) {
        await this.createHeadingWithItems(id, headingData, headingOrder);
        headingOrder++;
      }
    }

    // Return the updated objective with its complete hierarchy
    return this.findObjectiveById(id);
  }

  /**
   * Update a heading
   * @param id - Heading ID
   * @param updateHeadingDto - Updated heading data
   * @returns Updated heading
   */
  async updateHeading(id: string, updateHeadingDto: UpdateHeadingDto) {
    this.logger.debug(`Attempting to update heading with ID: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateHeadingDto)}`);

    try {
      // First, check if the heading exists by directly querying
      const { data: existingData, error: fetchError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE_HEADINGS)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (fetchError) {
        this.logger.error(`Error fetching heading: ${fetchError.message}`);
        throw new BadRequestException(`Failed to fetch heading: ${fetchError.message}`);
      }
      
      if (!existingData) {
        this.logger.error(`No heading found with ID: ${id}`);
        throw new NotFoundException(`Heading not found`);
      }
      
      this.logger.debug(`Found existing heading: ${JSON.stringify(existingData)}`);
      
      const now = new Date().toISOString();
      
      // Update with explicit timestamp
      const { data: updatedData, error: updateError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE_HEADINGS)
        .update({ 
          heading: updateHeadingDto.heading,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        this.logger.error(`Error updating heading: ${updateError.message}`);
        throw new BadRequestException(`Failed to update heading: ${updateError.message}`);
      }
      
      return updatedResponse(updatedData, 'Heading updated successfully');
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error updating heading: ${error.message}`);
      throw new BadRequestException(`Failed to update heading: ${error.message}`);
    }
  }

  /**
   * Delete a heading and its items
   * @param id - Heading ID
   * @returns Success message
   */
  async deleteHeading(id: string) {
    // First, get the heading to find its objective_id and order_index
    const { data: heading, error: getError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_HEADINGS)
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !heading) {
      throw new NotFoundException('Heading not found');
    }

    // Store the objective_id and order_index
    const objectiveId = heading.objective_id;
    const deletedOrderIndex = heading.order_index;
    
    this.logger.debug(`Deleting heading with ID ${id}, objective_id ${objectiveId}, order_index ${deletedOrderIndex}`);

    // Delete all items for this heading
    const { error: deleteItemsError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_ITEMS)
      .delete()
      .eq('heading_id', id);

    if (deleteItemsError) {
      throw new BadRequestException(`Failed to delete items: ${deleteItemsError.message}`);
    }
    
    this.logger.debug(`Items for heading ${id} deleted successfully`);

    // Delete the heading
    const { error: deleteHeadingError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_HEADINGS)
      .delete()
      .eq('id', id);

    if (deleteHeadingError) {
      throw new BadRequestException(`Failed to delete heading: ${deleteHeadingError.message}`);
    }
    
    this.logger.debug(`Heading deleted successfully, now reordering remaining headings`);

    // Now get all headings for this objective that have higher order_index
    const { data: headingsToUpdate, error: getHeadingsError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_HEADINGS)
      .select('*')
      .eq('objective_id', objectiveId)
      .gt('order_index', deletedOrderIndex)
      .order('order_index', { ascending: true });

    if (getHeadingsError) {
      this.logger.error(`Error fetching headings to reorder: ${getHeadingsError.message}`);
      // Continue even if this fails - deletion was successful
    } else if (headingsToUpdate && headingsToUpdate.length > 0) {
      this.logger.debug(`Found ${headingsToUpdate.length} headings to reorder: ${JSON.stringify(headingsToUpdate.map(h => ({ id: h.id, order: h.order_index })))}`);
      
      // Update each heading individually to ensure it works
      const now = new Date().toISOString();
      
      for (const headingToUpdate of headingsToUpdate) {
        const newOrderIndex = headingToUpdate.order_index - 1;
        this.logger.debug(`Updating heading ${headingToUpdate.id} from order ${headingToUpdate.order_index} to ${newOrderIndex}`);
        
        const { error: updateError } = await this.supabaseService.client
          .from(TABLES.OBJECTIVE_HEADINGS)
          .update({ 
            order_index: newOrderIndex,
            updated_at: now
          })
          .eq('id', headingToUpdate.id);
          
        if (updateError) {
          this.logger.error(`Error updating heading ${headingToUpdate.id}: ${updateError.message}`);
        } else {
          this.logger.debug(`Successfully updated heading ${headingToUpdate.id} to order ${newOrderIndex}`);
        }
      }
    } else {
      this.logger.debug(`No headings found with order_index > ${deletedOrderIndex} for objective ${objectiveId}`);
    }

    return deletedResponse('Heading and its items deleted successfully');
  }

  /**
   * Update an item
   * @param id - Item ID
   * @param updateItemDto - Updated item data
   * @returns Updated item
   */
  async updateItem(id: string, updateItemDto: UpdateItemDto) {
    this.logger.debug(`Attempting to update item with ID: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateItemDto)}`);

    try {
      // First, check if the item exists by directly querying
      const { data: existingData, error: fetchError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE_ITEMS)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (fetchError) {
        this.logger.error(`Error fetching item: ${fetchError.message}`);
        throw new BadRequestException(`Failed to fetch item: ${fetchError.message}`);
      }
      
      if (!existingData) {
        this.logger.error(`No item found with ID: ${id}`);
        throw new NotFoundException(`Item not found`);
      }
      
      this.logger.debug(`Found existing item: ${JSON.stringify(existingData)}`);
      
      const now = new Date().toISOString();
      
      // Update with explicit timestamp
      const { data: updatedData, error: updateError } = await this.supabaseService.client
        .from(TABLES.OBJECTIVE_ITEMS)
        .update({ 
          text: updateItemDto.text,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        this.logger.error(`Error updating item: ${updateError.message}`);
        throw new BadRequestException(`Failed to update item: ${updateError.message}`);
      }
      
      return updatedResponse(updatedData, 'Item updated successfully');
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error updating item: ${error.message}`);
      throw new BadRequestException(`Failed to update item: ${error.message}`);
    }
  }

  /**
   * Delete an item
   * @param id - Item ID
   * @returns Success message
   */
  async deleteItem(id: string) {
    // First, get the item to find out its heading_id and order_index
    const { data: item, error: getError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_ITEMS)
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !item) {
      throw new NotFoundException('Item not found');
    }

    // Store the heading_id and order_index
    const headingId = item.heading_id;
    const deletedOrderIndex = item.order_index;
    
    this.logger.debug(`Deleting item with ID ${id}, heading_id ${headingId}, order_index ${deletedOrderIndex}`);

    // Delete the item
    const { error: deleteError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_ITEMS)
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new BadRequestException(`Failed to delete item: ${deleteError.message}`);
    }
    
    this.logger.debug(`Item deleted successfully, now reordering remaining items`);

    // Now get all items for this heading that have higher order_index
    const { data: itemsToUpdate, error: getItemsError } = await this.supabaseService.client
      .from(TABLES.OBJECTIVE_ITEMS)
      .select('*')
      .eq('heading_id', headingId)
      .gt('order_index', deletedOrderIndex)
      .order('order_index', { ascending: true });

    if (getItemsError) {
      this.logger.error(`Error fetching items to reorder: ${getItemsError.message}`);
      // Continue even if this fails - deletion was successful
    } else if (itemsToUpdate && itemsToUpdate.length > 0) {
      this.logger.debug(`Found ${itemsToUpdate.length} items to reorder: ${JSON.stringify(itemsToUpdate.map(i => ({ id: i.id, order: i.order_index })))}`);
      
      // Update each item individually to ensure it works
      const now = new Date().toISOString();
      
      for (const itemToUpdate of itemsToUpdate) {
        const newOrderIndex = itemToUpdate.order_index - 1;
        this.logger.debug(`Updating item ${itemToUpdate.id} from order ${itemToUpdate.order_index} to ${newOrderIndex}`);
        
        const { error: updateError } = await this.supabaseService.client
          .from(TABLES.OBJECTIVE_ITEMS)
          .update({ 
            order_index: newOrderIndex,
            updated_at: now
          })
          .eq('id', itemToUpdate.id);
          
        if (updateError) {
          this.logger.error(`Error updating item ${itemToUpdate.id}: ${updateError.message}`);
        } else {
          this.logger.debug(`Successfully updated item ${itemToUpdate.id} to order ${newOrderIndex}`);
        }
      }
    } else {
      this.logger.debug(`No items found with order_index > ${deletedOrderIndex} for heading ${headingId}`);
    }

    return deletedResponse('Item deleted successfully');
  }

  /**
   * Private helper to validate that a topic exists
   */
  private async validateTopicExists(topicId: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.TOPICS)
      .select('id')
      .eq('id', topicId)
      .limit(1);

    if (error) {
      throw new BadRequestException(`Failed to validate topic: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(MESSAGES.TOPIC_NOT_FOUND);
    }
  }
} 