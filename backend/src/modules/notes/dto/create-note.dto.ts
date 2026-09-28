import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Create Note DTO
 * Based on topic_notes table schema
 */
export class CreateNoteDto {
  @ApiProperty({
    description: 'UUID of the topic this note belongs to',
    example: '12f9d508-1ac0-495b-a04f-45ff1a5b0d52',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'The content of the note',
    example: 'Asynchronous programming is essential for handling operations that might take time to complete without blocking the main thread.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
} 