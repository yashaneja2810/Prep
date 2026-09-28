import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { MODULE_STATUS } from '../../../common/helpers/string-const';

/**
 * Create Module DTO
 */
export class CreateModuleDto {
  @ApiProperty({
    description: 'Unique module code identifier',
    example: 'PY101',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  module_code: string;

  @ApiProperty({
    description: 'Module title',
    example: 'Python Basics',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  module_title: string;

  @ApiProperty({
    description: 'Module name (can be a more descriptive name)',
    example: 'Python Fundamentals',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  module_name: string;

  @ApiProperty({
    description: 'Detailed description of the module',
    example: 'Learn the fundamental concepts of Python including variables, data types, and basic operations.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Current status of the module',
    enum: Object.values(MODULE_STATUS),
    example: MODULE_STATUS.DRAFT,
    default: MODULE_STATUS.DRAFT,
    required: false,
  })
  @IsEnum(Object.values(MODULE_STATUS), {
    message: `Status must be one of: ${Object.values(MODULE_STATUS).join(', ')}`,
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Array of topic IDs to include in the module',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  topics?: string[];
} 