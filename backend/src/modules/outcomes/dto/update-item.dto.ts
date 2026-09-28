import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Update Item DTO
 */
export class UpdateItemDto {
  @ApiProperty({
    description: 'Updated item text',
    example: 'Implement and optimize complex asynchronous workflows using advanced Promise patterns',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
} 