import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

/**
 * Update Note DTO
 * All fields are optional for partial updates
 * Based on topic_notes table schema
 */
export class UpdateNoteDto {
  @ApiProperty({
    description: 'UUID of the topic this note belongs to',
    example: '12f9d508-1ac0-495b-a04f-45ff1a5b0d52',
    format: 'uuid',
    required: false,
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsOptional()
  topic_id?: string;

  @ApiProperty({
    description: 'The content of the note',
    example: 'Updated content for asynchronous programming concepts with more detailed examples...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
} 