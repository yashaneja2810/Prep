import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { PROGRAM_LEVEL, PROGRAM_STATUS } from '../../../common/helpers/string-const';

/**
 * DTO for creating a new program
 */
export class CreateProgramDto {
  @ApiProperty({
    description: 'Unique code for the program',
    example: 'WEBDEV101',
  })
  @IsString()
  @IsNotEmpty()
  program_code: string;

  @ApiProperty({
    description: 'Title of the program',
    example: 'Web Development Fundamentals',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the program',
    example: 'A comprehensive introduction to web development',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Prerequisites for the program',
    example: 'Basic understanding of computers',
  })
  @IsString()
  @IsOptional()
  prerequisites?: string;

  @ApiPropertyOptional({
    description: 'Status of the program',
    enum: Object.values(PROGRAM_STATUS),
    default: PROGRAM_STATUS.DRAFT,
  })
  @IsEnum(PROGRAM_STATUS)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'URL of the program thumbnail',
    example: 'https://example.com/images/webdev.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Duration of the program in hours',
    example: 40,
  })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Level of the program',
    enum: Object.values(PROGRAM_LEVEL),
    default: PROGRAM_LEVEL.BEGINNER,
  })
  @IsEnum(PROGRAM_LEVEL)
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    description: 'Array of module IDs to include in the program',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  modules?: string[];
} 