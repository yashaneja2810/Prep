import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DIFFICULTY } from '../../../common/helpers/string-const';

/**
 * Single AP data for batch creation
 */
export class BatchApItemDto {
  @ApiProperty({
    description: 'Title of the application problem',
    example: 'Build a Weather Dashboard',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Array of instructions for solving the problem',
    example: [
      'Create a web application that fetches weather data from a public API',
      'Display current weather and 5-day forecast',
      'Implement error handling for API failures'
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  instructions: string[];

  @ApiProperty({
    description: 'Array of learning objectives for the problem',
    example: [
      'Practice working with async/await',
      'Learn to handle API errors gracefully',
      'Implement loading states for better UX'
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  objectives: string[];

  @ApiPropertyOptional({
    description: 'Input requirements for the problem',
    example: 'City name or coordinates',
  })
  @IsString()
  @IsOptional()
  input?: string;

  @ApiProperty({
    description: 'Expected output description',
    example: 'A functional weather dashboard showing current conditions and forecast',
  })
  @IsString()
  @IsNotEmpty()
  expected_output: string;

  @ApiPropertyOptional({
    description: 'Difficulty level of the application problem',
    enum: DIFFICULTY,
    example: DIFFICULTY.INTERMEDIATE,
  })
  @IsOptional()
  @IsEnum(DIFFICULTY)
  difficulty?: string;
}

/**
 * Create Batch Application Problems DTO
 * Allows creating multiple APs for a specific topic
 */
export class CreateBatchApDto {
  @ApiProperty({
    description: 'Topic ID that all APs will belong to',
    example: 't123',
  })
  @IsString()
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'Array of application problems to create',
    type: [BatchApItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchApItemDto)
  aps: BatchApItemDto[];
} 