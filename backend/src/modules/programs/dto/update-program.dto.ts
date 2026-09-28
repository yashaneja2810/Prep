import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { PROGRAM_LEVEL, PROGRAM_STATUS } from '../../../common/helpers/string-const';

/**
 * DTO for updating a program
 */
export class UpdateProgramDto {
  @ApiPropertyOptional({
    description: 'Title of the program',
    example: 'Web Development Fundamentals',
  })
  @IsString()
  @IsOptional()
  title?: string;

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