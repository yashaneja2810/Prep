import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for outcome item
 */
export class CreateOutcomeItemDto {
  @ApiProperty({
    description: 'Text content of the outcome item',
    example: 'Create complex asynchronous workflows using Promise chaining and async/await',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

/**
 * DTO for outcome heading with items
 */
export class CreateOutcomeHeadingDto {
  @ApiProperty({
    description: 'Heading text',
    example: 'Technical Skills',
  })
  @IsString()
  @IsNotEmpty()
  heading: string;

  @ApiProperty({
    description: 'List of outcome items under this heading',
    type: [CreateOutcomeItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOutcomeItemDto)
  items: CreateOutcomeItemDto[];
}

/**
 * Create Outcome DTO
 * Supports creating a complete outcome hierarchy
 */
export class CreateOutcomeDto {
  @ApiProperty({
    description: 'UUID of the topic this outcome belongs to',
    example: '12f9d508-1ac0-495b-a04f-45ff1a5b0d52',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'List of outcome headings with their items',
    type: [CreateOutcomeHeadingDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOutcomeHeadingDto)
  outcomes?: CreateOutcomeHeadingDto[];
} 