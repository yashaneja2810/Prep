import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Objective Completion DTO
 * Data required to mark an objective item as completed
 */
export class ObjectiveCompletionDto {
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
    description: 'Objective Item ID',
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  objective_item_id: string;
} 