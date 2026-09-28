import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateOutcomeDto, CreateOutcomeHeadingDto } from './dto/create-outcome.dto';
import { UpdateHeadingDto } from './dto/update-heading.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { TABLES, MESSAGES } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';
import { Logger } from '@nestjs/common';

/**
 * Outcomes Service
 * Handles business logic for topic outcomes
 */
@Injectable()
export class OutcomesService extends BaseService {
  protected readonly logger = new Logger(OutcomesService.name);

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a complete outcome with headings and items
   * @param createOutcomeDto - DTO containing topic_id and optional outcomes array
   * @returns Created outcome with complete hierarchy
   */
  async createOutcome(createOutcomeDto: CreateOutcomeDto) {
    // Validate that the topic exists
    await this.validateTopicExists(createOutcomeDto.topic_id);

    // Use a transaction to ensure all related data is created or nothing is
    const { data: outcome, error } = await this.supabaseService.client
      .from(TABLES.OUTCOMES)
      .insert([{ topic_id: createOutcomeDto.topic_id }])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create outcome: ${error.message}`);
    }

    // If outcomes array is provided, create headings and items
    if (createOutcomeDto.outcomes && createOutcomeDto.outcomes.length > 0) {
      let headingOrder = 1;
      
      // Process each heading and its items
      for (const headingData of createOutcomeDto.outcomes) {
        await this.createHeadingWithItems(outcome.id, headingData, headingOrder);
        headingOrder++;
      }
    }

    // Fetch the complete outcome hierarchy
    return this.findOutcomeById(outcome.id);
  }

  /**
   * Create a heading and its items
   * @param outcomeId - ID of the parent outcome
   * @param headingData - Heading data with items
   * @param orderIndex - Order index for the heading
   */
  private async createHeadingWithItems(
    outcomeId: string, 
    headingData: CreateOutcomeHeadingDto,
    orderIndex: number
  ) {
    const now = new Date().toISOString();
    
    // Create the heading
    const { data: heading, error } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .insert([{
        outcome_id: outcomeId,
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
        .from(TABLES.OUTCOME_ITEMS)
        .insert(items);

      if (itemsError) {
        throw new BadRequestException(`Failed to create items: ${itemsError.message}`);
      }
    }

    return heading;
  }

  /**
   * Find an outcome by ID with its complete hierarchy
   * @param id - Outcome ID
   * @returns Outcome with headings and items
   */
  async findOutcomeById(id: string) {
    // Get the outcome
    const { data: outcome, error } = await this.supabaseService.client
      .from(TABLES.OUTCOMES)
      .select('*, topic:topics(id, topic_code, title)')
      .eq('id', id)
      .single();

    if (error || !outcome) {
      throw new NotFoundException('Outcome not found');
    }

    // Get headings for this outcome, ordered by order_index
    const { data: headings, error: headingsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .select('*')
      .eq('outcome_id', id)
      .order('order_index', { ascending: true });

    if (headingsError) {
      throw new BadRequestException(`Failed to fetch outcome headings: ${headingsError.message}`);
    }

    // For each heading, get its items
    const headingsWithItems = await Promise.all(
      headings.map(async (heading) => {
        const { data: items, error: itemsError } = await this.supabaseService.client
          .from(TABLES.OUTCOME_ITEMS)
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

    // Construct the full outcome hierarchy
    const result = {
      ...outcome,
      headings: headingsWithItems || []
    };

    return successResponse(result, 'Outcome retrieved successfully');
  }

  /**
   * Find outcomes by topic ID
   * @param topicId - Topic ID
   * @returns Outcomes for the topic
   */
  async findOutcomesByTopicId(topicId: string) {
    // Validate that the topic exists
    await this.validateTopicExists(topicId);

    // Get outcomes for this topic
    const { data: outcomes, error } = await this.supabaseService.client
      .from(TABLES.OUTCOMES)
      .select('*')
      .eq('topic_id', topicId);

    if (error) {
      throw new BadRequestException(`Failed to fetch outcomes: ${error.message}`);
    }

    // If no outcomes found, return empty array
    if (!outcomes || outcomes.length === 0) {
      return successResponse([], 'No outcomes found for this topic');
    }

    // For each outcome, get its complete hierarchy
    const outcomesWithHierarchy = await Promise.all(
      outcomes.map(async (outcome) => {
        // Get headings for this outcome
        const { data: headings, error: headingsError } = await this.supabaseService.client
          .from(TABLES.OUTCOME_HEADINGS)
          .select('*')
          .eq('outcome_id', outcome.id)
          .order('order_index', { ascending: true });

        if (headingsError) {
          throw new BadRequestException(`Failed to fetch headings: ${headingsError.message}`);
        }

        // For each heading, get its items
        const headingsWithItems = await Promise.all(
          headings.map(async (heading) => {
            const { data: items, error: itemsError } = await this.supabaseService.client
              .from(TABLES.OUTCOME_ITEMS)
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
          ...outcome,
          headings: headingsWithItems || []
        };
      })
    );

    return successResponse(outcomesWithHierarchy, 'Topic outcomes retrieved successfully');
  }

  /**
   * Delete an outcome and all its related data
   * @param id - Outcome ID
   * @returns Success message
   */
  async deleteOutcome(id: string) {
    // Check if outcome exists
    const { data, error } = await this.supabaseService.client
      .from(TABLES.OUTCOMES)
      .select('id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Outcome not found');
    }

    // Get all headings for this outcome
    const { data: headings, error: headingsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .select('id')
      .eq('outcome_id', id);

    if (headingsError) {
      throw new BadRequestException(`Failed to fetch headings: ${headingsError.message}`);
    }

    // Delete all items for these headings
    if (headings && headings.length > 0) {
      const headingIds = headings.map(h => h.id);
      
      const { error: deleteItemsError } = await this.supabaseService.client
        .from(TABLES.OUTCOME_ITEMS)
        .delete()
        .in('heading_id', headingIds);

      if (deleteItemsError) {
        throw new BadRequestException(`Failed to delete items: ${deleteItemsError.message}`);
      }
    }

    // Delete all headings
    const { error: deleteHeadingsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .delete()
      .eq('outcome_id', id);

    if (deleteHeadingsError) {
      throw new BadRequestException(`Failed to delete headings: ${deleteHeadingsError.message}`);
    }

    // Delete the outcome
    const { error: deleteOutcomeError } = await this.supabaseService.client
      .from(TABLES.OUTCOMES)
      .delete()
      .eq('id', id);

    if (deleteOutcomeError) {
      throw new BadRequestException(`Failed to delete outcome: ${deleteOutcomeError.message}`);
    }

    return deletedResponse('Outcome deleted successfully');
  }

  /**
   * Update an entire outcome with its headings and items
   * @param id - Outcome ID
   * @param updateOutcomeDto - Updated outcome data
   * @returns Updated outcome with complete hierarchy
   */
  async updateOutcome(id: string, updateOutcomeDto: CreateOutcomeDto) {
    // Check if outcome exists
    const { data: outcome, error } = await this.supabaseService.client
      .from(TABLES.OUTCOMES)
      .select('id, topic_id')
      .eq('id', id)
      .single();

    if (error || !outcome) {
      throw new NotFoundException(MESSAGES.OUTCOME_NOT_FOUND);
    }

    // Validate that the topic exists if it's being changed
    if (updateOutcomeDto.topic_id !== outcome.topic_id) {
      await this.validateTopicExists(updateOutcomeDto.topic_id);
      
      // Update the topic_id if it has changed
      const { error: updateError } = await this.supabaseService.client
        .from(TABLES.OUTCOMES)
        .update({ topic_id: updateOutcomeDto.topic_id })
        .eq('id', id);

      if (updateError) {
        throw new BadRequestException(`Failed to update outcome: ${updateError.message}`);
      }
    }

    // Get existing headings to track what needs to be deleted
    const { data: existingHeadings, error: headingsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .select('id')
      .eq('outcome_id', id);

    if (headingsError) {
      throw new BadRequestException(`Failed to fetch headings: ${headingsError.message}`);
    }

    // Delete all existing headings (cascade will delete items)
    if (existingHeadings && existingHeadings.length > 0) {
      const headingIds = existingHeadings.map(h => h.id);
      const { error: deleteError } = await this.supabaseService.client
        .from(TABLES.OUTCOME_HEADINGS)
        .delete()
        .in('id', headingIds);

      if (deleteError) {
        throw new BadRequestException(`Failed to delete existing headings: ${deleteError.message}`);
      }
    }

    // Create new headings and items
    if (updateOutcomeDto.outcomes && updateOutcomeDto.outcomes.length > 0) {
      let headingOrder = 1;
      for (const headingData of updateOutcomeDto.outcomes) {
        await this.createHeadingWithItems(id, headingData, headingOrder);
        headingOrder++;
      }
    }

    // Return the updated outcome with its complete hierarchy
    return this.findOutcomeById(id);
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
      // First, get the heading to find if it exists
      const { data: existingData, error: fetchError } = await this.supabaseService.client
        .from(TABLES.OUTCOME_HEADINGS)
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
        .from(TABLES.OUTCOME_HEADINGS)
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
    // First, get the heading to find its outcome_id and order_index
    const { data: heading, error: getError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !heading) {
      throw new NotFoundException('Heading not found');
    }

    // Store the outcome_id and order_index
    const outcomeId = heading.outcome_id;
    const deletedOrderIndex = heading.order_index;
    
    this.logger.debug(`Deleting heading with ID ${id}, outcome_id ${outcomeId}, order_index ${deletedOrderIndex}`);

    // Delete all items for this heading
    const { error: deleteItemsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_ITEMS)
      .delete()
      .eq('heading_id', id);

    if (deleteItemsError) {
      throw new BadRequestException(`Failed to delete items: ${deleteItemsError.message}`);
    }
    
    this.logger.debug(`Items for heading ${id} deleted successfully`);

    // Delete the heading
    const { error: deleteHeadingError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .delete()
      .eq('id', id);

    if (deleteHeadingError) {
      throw new BadRequestException(`Failed to delete heading: ${deleteHeadingError.message}`);
    }
    
    this.logger.debug(`Heading deleted successfully, now reordering remaining headings`);

    // Now get all headings for this outcome that have higher order_index
    const { data: headingsToUpdate, error: getHeadingsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_HEADINGS)
      .select('*')
      .eq('outcome_id', outcomeId)
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
          .from(TABLES.OUTCOME_HEADINGS)
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
      this.logger.debug(`No headings found with order_index > ${deletedOrderIndex} for outcome ${outcomeId}`);
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
        .from(TABLES.OUTCOME_ITEMS)
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
        .from(TABLES.OUTCOME_ITEMS)
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
      .from(TABLES.OUTCOME_ITEMS)
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
      .from(TABLES.OUTCOME_ITEMS)
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new BadRequestException(`Failed to delete item: ${deleteError.message}`);
    }
    
    this.logger.debug(`Item deleted successfully, now reordering remaining items`);

    // Now get all items for this heading that have higher order_index
    const { data: itemsToUpdate, error: getItemsError } = await this.supabaseService.client
      .from(TABLES.OUTCOME_ITEMS)
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
          .from(TABLES.OUTCOME_ITEMS)
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