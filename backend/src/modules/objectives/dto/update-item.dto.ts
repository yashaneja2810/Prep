import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Update Item DTO
 */
export class UpdateItemDto {
  @ApiProperty({
    description: 'Updated item text',
    example: 'Master the JavaScript event loop and understand how it enables asynchronous operations',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
} 