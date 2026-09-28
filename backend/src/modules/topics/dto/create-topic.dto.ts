import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TOPIC_STATUS } from '../../../common/helpers/string-const';

/**
 * Create Topic DTO
 * Updated to match schema from topics.txt
 * Task 3.1 requirement from tasks.md
 */
export class CreateTopicDto {
  @ApiProperty({
    description: 'Unique topic code identifier',
    example: 'INTRO_JS_001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  topic_code: string;

  @ApiProperty({
    description: 'Topic title',
    example: 'Introduction to JavaScript Variables',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the topic',
    example: 'Learn about JavaScript variables, data types, and declaration methods',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Current status of the topic',
    enum: [TOPIC_STATUS.DRAFT, TOPIC_STATUS.PUBLISHED],
    example: TOPIC_STATUS.DRAFT,
    default: TOPIC_STATUS.DRAFT,
    required: false,
  })
  @IsEnum([TOPIC_STATUS.DRAFT, TOPIC_STATUS.PUBLISHED], {
    message: `Status must be one of: ${TOPIC_STATUS.DRAFT}, ${TOPIC_STATUS.PUBLISHED}`,
  })
  @IsOptional()
  status?: string;
} 