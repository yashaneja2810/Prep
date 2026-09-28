import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Outcome Completion DTO
 * Data required to mark an outcome item as completed
 */
export class OutcomeCompletionDto {
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
    description: 'Outcome Item ID',
    example: '123e4567-e89b-12d3-a456-426614174004'
  })
  outcome_item_id: string;
} 