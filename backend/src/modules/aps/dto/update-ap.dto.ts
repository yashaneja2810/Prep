import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DIFFICULTY } from '../../../common/helpers/string-const';

/**
 * Update Application Problem DTO
 * All fields are optional for partial updates
 */
export class UpdateApDto {
  @ApiPropertyOptional({
    description: 'Topic ID that this AP belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'topic_id must be a valid UUID' })
  topic_id?: string;

  @ApiPropertyOptional({
    description: 'Title of the application problem',
    example: 'Updated Todo List Application',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Difficulty level of the application problem',
    enum: DIFFICULTY,
    example: DIFFICULTY.HARD,
  })
  @IsOptional()
  @IsEnum(DIFFICULTY)
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Input requirements for the problem',
    example: 'Updated input requirements...',
  })
  @IsString()
  @IsOptional()
  input?: string;

  @ApiPropertyOptional({
    description: 'Expected output description',
    example: 'Updated expected output...',
  })
  @IsString()
  @IsOptional()
  expected_output?: string;

  @ApiPropertyOptional({
    description: 'Instructions for solving the problem',
    example: 'Updated instructions...',
  })
  @IsString()
  @IsOptional()
  instruction?: string;

  @ApiPropertyOptional({
    description: 'Learning objective of the problem',
    example: 'Updated learning objective...',
  })
  @IsString()
  @IsOptional()
  objective?: string;
} 