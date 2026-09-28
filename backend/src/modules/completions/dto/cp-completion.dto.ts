import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * CP Completion DTO
 * Data required to mark a concept practice as completed
 */
export class CpCompletionDto {
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
    description: 'CP ID',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  cp_id: string;
} 