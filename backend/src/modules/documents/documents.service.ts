import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../core/database/base.service';
import { SupabaseService } from '../../core/database/supabase.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { TABLES, MESSAGES, COLUMNS, QUERY } from '../../common/helpers/string-const';
import { successResponse, createdResponse, updatedResponse, deletedResponse } from '../../common/helpers/api-response.helper';

/**
 * Documents Service
 * Handles business logic for topic documents
 * Task 4.2 requirement from tasks.md
 */
@Injectable()
export class DocumentsService extends BaseService {
  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  /**
   * Create a new document
   * Validates that the topic exists before creating
   */
  async createDocument(createDocumentDto: CreateDocumentDto) {
    // Validate that the topic exists
    await this.validateTopicExists(createDocumentDto.topic_id);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .insert([createDocumentDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create document: ${error.message}`);
    }

    return createdResponse(data, 'Document created successfully');
  }

  /**
   * Find all documents
   */
  async findAllDocuments() {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .select(QUERY.SELECT_ALL);

    if (error) {
      throw new BadRequestException(`Failed to fetch documents: ${error.message}`);
    }

    return successResponse(data || [], 'Documents retrieved successfully');
  }

  /**
   * Find document by ID
   */
  async findDocumentById(id: string) {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .select(QUERY.SELECT_ALL)
      .eq(COLUMNS.ID, id)
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.DOCUMENT_NOT_FOUND);
    }

    return successResponse(data, 'Document retrieved successfully');
  }

  /**
   * Find documents by topic ID
   * Task 4.2 requirement - key functionality for linking documents to topics
   */
  async findDocumentsByTopicId(topicId: string) {
    // Validate that the topic exists
    await this.validateTopicExists(topicId);

    const { data, error } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .select(QUERY.SELECT_ALL)
      .eq(COLUMNS.TOPIC_ID, topicId);

    if (error) {
      throw new BadRequestException(`Failed to fetch documents for topic: ${error.message}`);
    }

    return successResponse(data || [], 'Topic documents retrieved successfully');
  }

  /**
   * Update document by ID
   */
  async updateDocument(id: string, updateDocumentDto: UpdateDocumentDto) {
    // First, check if the document exists
    const { data: existingDoc, error: findError } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .select(QUERY.SELECT_ALL)
      .eq(COLUMNS.ID, id)
      .single();

    if (findError || !existingDoc) {
      throw new NotFoundException(MESSAGES.DOCUMENT_NOT_FOUND);
    }

    // If topic_id is being updated, validate the new topic exists
    if (updateDocumentDto.topic_id) {
      await this.validateTopicExists(updateDocumentDto.topic_id);
    }

    const { data, error } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .update(updateDocumentDto)
      .eq(COLUMNS.ID, id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update document: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(MESSAGES.DOCUMENT_NOT_FOUND);
    }

    return updatedResponse(data, 'Document updated successfully');
  }

  /**
   * Delete document by ID
   */
  async deleteDocument(id: string) {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.DOCS)
      .delete()
      .eq(COLUMNS.ID, id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(MESSAGES.DOCUMENT_NOT_FOUND);
    }

    return deletedResponse('Document deleted successfully');
  }

  /**
   * Private helper to validate that a topic exists
   * Task 4.2 requirement - validate topic_id exists before creating document
   */
  private async validateTopicExists(topicId: string): Promise<void> {
    const { data, error } = await this.supabaseService.client
      .from(TABLES.TOPICS)
      .select(COLUMNS.ID)
      .eq(COLUMNS.ID, topicId)
      .limit(QUERY.SINGLE_RECORD);

    if (error) {
      throw new BadRequestException(`Failed to validate topic: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(MESSAGES.TOPIC_NOT_FOUND);
    }
  }
} 