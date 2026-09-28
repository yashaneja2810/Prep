import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for module order item
 */
class ModuleOrderItem {
  @ApiProperty({
    description: 'Module ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @ApiProperty({
    description: 'New order for the module (1-based)',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  order: number;
}

/**
 * DTO for reordering modules in a program
 */
export class ReorderModulesDto {
  @ApiProperty({
    description: 'Array of module orders',
    type: [ModuleOrderItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleOrderItem)
  @IsNotEmpty()
  modules: ModuleOrderItem[];
} 