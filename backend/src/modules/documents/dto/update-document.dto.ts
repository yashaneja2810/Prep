import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

/**
 * Update Document DTO
 * All fields are optional for partial updates
 * Based on topic_documents table schema from supabaseTesting.txt
 */
export class UpdateDocumentDto {
  @ApiProperty({
    description: 'UUID of the topic this document belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsOptional()
  topic_id?: string;

  @ApiProperty({
    description: 'The content of the document',
    example: 'Updated content for JavaScript Variables topic...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
} 