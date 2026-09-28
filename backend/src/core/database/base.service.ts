import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { MESSAGES, COLUMNS, QUERY } from '../../common/helpers/string-const';

/**
 * Base Service Class for CRUD operations
 * Following Task 2.3 requirements from tasks.md
 */
@Injectable()
export abstract class BaseService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly supabaseService: SupabaseService) {}

  /**
   * Execute a Supabase query with error handling
   * Required by Task 2.3
   * @param queryBuilder - The Supabase query builder to execute
   * @param errorMessage - Custom error message for failures
   * @returns Promise with query result
   */
  protected async executeQuery<T>(
    queryBuilder: any,
    errorMessage: string = MESSAGES.DB_QUERY_ERROR,
  ): Promise<T> {
    try {
      this.logger.debug(`Executing database query`);
      
      const { data, error } = await queryBuilder;

      if (error) {
        this.logger.error(`Database query error: ${error.message}`, error);
        throw new Error(`${errorMessage}: ${error.message}`);
      }

      this.logger.debug(`Query executed successfully, returned ${Array.isArray(data) ? data.length : 1} record(s)`);
      return data;
    } catch (error) {
      this.logger.error(`Query execution failed: ${error.message}`, error.stack);
      
      if (error.message.includes('not found') || error.message.includes('No rows')) {
        throw new NotFoundException(MESSAGES.NOT_FOUND);
      }
      
      throw error;
    }
  }

  /**
   * Generic method to find a record by ID
   * Required by Task 2.3
   * @param tableName - Name of the table
   * @param id - ID of the record to find
   * @param selectFields - Fields to select (default: '*')
   * @returns Promise with the found record
   */
  protected async findById<T>(
    tableName: string,
    id: string,
    selectFields: string = QUERY.SELECT_ALL,
  ): Promise<T> {
    this.logger.debug(`Finding record by ID: ${id} in table: ${tableName}`);
    
    const query = this.supabaseService.client
      .from(tableName)
      .select(selectFields)
      .eq(COLUMNS.ID, id)
      .single();

    const result = await this.executeQuery<T>(
      query,
      `Failed to find record with ID ${id} in ${tableName}`,
    );

    if (!result) {
      throw new NotFoundException(`Record with ID ${id} not found in ${tableName}`);
    }

    return result;
  }

  /**
   * Generic method to find all records in a table
   * @param tableName - Name of the table
   * @param selectFields - Fields to select (default: '*')
   * @param orderBy - Field to order by
   * @param ascending - Order direction (default: true)
   * @returns Promise with array of records
   */
  protected async findAll<T>(
    tableName: string,
    selectFields: string = QUERY.SELECT_ALL,
    orderBy?: string,
    ascending: boolean = true,
  ): Promise<T[]> {
    this.logger.debug(`Finding all records in table: ${tableName}`);
    
    let query = this.supabaseService.client
      .from(tableName)
      .select(selectFields);

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    return this.executeQuery<T[]>(
      query,
      `Failed to fetch records from ${tableName}`,
    );
  }

  /**
   * Generic method to create a new record
   * @param tableName - Name of the table
   * @param data - Data to insert
   * @param selectFields - Fields to select in response (default: '*')
   * @returns Promise with the created record
   */
  protected async create<T, U>(
    tableName: string,
    data: U,
    selectFields: string = QUERY.SELECT_ALL,
  ): Promise<T> {
    this.logger.debug(`Creating new record in table: ${tableName}`);
    
    const query = this.supabaseService.client
      .from(tableName)
      .insert(data)
      .select(selectFields)
      .single();

    return this.executeQuery<T>(
      query,
      `Failed to create record in ${tableName}`,
    );
  }

  /**
   * Generic method to update a record
   * @param tableName - Name of the table
   * @param id - ID of the record to update
   * @param data - Data to update
   * @param selectFields - Fields to select in response (default: '*')
   * @returns Promise with the updated record
   */
  protected async update<T, U>(
    tableName: string,
    id: string,
    data: U,
    selectFields: string = QUERY.SELECT_ALL,
  ): Promise<T> {
    this.logger.debug(`Updating record ${id} in table: ${tableName}`);
    
    const query = this.supabaseService.client
      .from(tableName)
      .update(data)
      .eq(COLUMNS.ID, id)
      .select(selectFields)
      .single();

    return this.executeQuery<T>(
      query,
      `Failed to update record ${id} in ${tableName}`,
    );
  }

  /**
   * Generic method to delete a record
   * @param tableName - Name of the table
   * @param id - ID of the record to delete
   * @returns Promise with deletion result
   */
  protected async delete(tableName: string, id: string): Promise<void> {
    this.logger.debug(`Deleting record ${id} from table: ${tableName}`);
    
    const query = this.supabaseService.client
      .from(tableName)
      .delete()
      .eq(COLUMNS.ID, id);

    await this.executeQuery(
      query,
      `Failed to delete record ${id} from ${tableName}`,
    );
  }

  /**
   * Check if Supabase is available for database operations
   * @returns boolean indicating availability
   */
  protected isSupabaseAvailable(): boolean {
    return this.supabaseService.isAvailable();
  }
} 