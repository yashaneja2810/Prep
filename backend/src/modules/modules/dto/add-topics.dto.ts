import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO for adding topics to a module
 */
export class AddTopicsDto {
  @ApiProperty({
    description: 'Array of topic IDs to add to the module',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  topic_ids: string[];
} 