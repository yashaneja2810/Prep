import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DIFFICULTY } from '../../../common/helpers/string-const';

/**
 * Create Application Problem DTO
 * Based on schema from new_supabase.txt
 */
export class CreateApDto {
  @ApiProperty({
    description: 'Topic ID that this AP belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'Title of the application problem',
    example: 'Build a Todo List Application',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Difficulty level of the application problem',
    enum: DIFFICULTY,
    example: DIFFICULTY.INTERMEDIATE,
  })
  @IsOptional()
  @IsEnum(DIFFICULTY)
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Input requirements for the problem',
    example: 'User should be able to add, edit, and delete tasks',
  })
  @IsString()
  @IsOptional()
  input?: string;

  @ApiPropertyOptional({
    description: 'Expected output description',
    example: 'A functional todo list with CRUD operations',
  })
  @IsString()
  @IsOptional()
  expected_output?: string;

  @ApiProperty({
    description: 'Instructions for solving the problem',
    example: 'Create a React component that manages a list of todos...',
  })
  @IsString()
  @IsNotEmpty()
  instruction: string;

  @ApiProperty({
    description: 'Learning objective of the problem',
    example: 'Students will learn state management and CRUD operations',
  })
  @IsString()
  @IsNotEmpty()
  objective: string;
} 