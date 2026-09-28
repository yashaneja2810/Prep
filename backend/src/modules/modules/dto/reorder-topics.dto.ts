import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for topic order item
 */
class TopicOrderItem {
  @ApiProperty({
    description: 'Topic ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'New order for the topic (1-based)',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}

/**
 * DTO for reordering topics in a module
 */
export class ReorderTopicsDto {
  @ApiProperty({
    description: 'Array of topic orders',
    type: [TopicOrderItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicOrderItem)
  @IsNotEmpty()
  topics: TopicOrderItem[];
} 