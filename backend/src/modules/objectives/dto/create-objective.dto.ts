import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for objective item
 */
export class CreateObjectiveItemDto {
  @ApiProperty({
    description: 'Text content of the objective item',
    example: 'Understand the JavaScript event loop and how it enables asynchronous operations',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

/**
 * DTO for objective heading with items
 */
export class CreateObjectiveHeadingDto {
  @ApiProperty({
    description: 'Heading text',
    example: 'Core Concepts',
  })
  @IsString()
  @IsNotEmpty()
  heading: string;

  @ApiProperty({
    description: 'List of objective items under this heading',
    type: [CreateObjectiveItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObjectiveItemDto)
  items: CreateObjectiveItemDto[];
}

/**
 * Create Objective DTO
 * Supports creating a complete objective hierarchy
 */
export class CreateObjectiveDto {
  @ApiProperty({
    description: 'UUID of the topic this objective belongs to',
    example: '12f9d508-1ac0-495b-a04f-45ff1a5b0d52',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'List of objective headings with their items',
    type: [CreateObjectiveHeadingDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateObjectiveHeadingDto)
  objectives?: CreateObjectiveHeadingDto[];
} 