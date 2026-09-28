import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Create Document DTO
 * Based on topic_documents table schema from supabaseTesting.txt
 * Task 4.1 requirement from tasks.md
 */
export class CreateDocumentDto {
  @ApiProperty({
    description: 'UUID of the topic this document belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'The content of the document',
    example: 'This is the detailed content for JavaScript Variables topic...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
} 