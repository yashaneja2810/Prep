import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

/**
 * DTO for adding modules to a program
 */
export class AddModulesDto {
  @ApiProperty({
    description: 'Array of module IDs to add to the program',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @IsNotEmpty()
  module_ids: string[];
} 