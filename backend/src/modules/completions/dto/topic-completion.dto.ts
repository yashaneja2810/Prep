import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Topic Completion DTO
 * Data required to mark a topic as completed
 */
export class TopicCompletionDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'User ID (optional when using authentication)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  user_id?: string;
  
  @IsUUID()
  @ApiProperty({
    description: 'Topic ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  topic_id: string;
} 