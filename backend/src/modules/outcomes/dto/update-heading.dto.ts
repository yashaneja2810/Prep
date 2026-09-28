import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Update Heading DTO
 */
export class UpdateHeadingDto {
  @ApiProperty({
    description: 'Updated heading text',
    example: 'Advanced Technical Skills',
  })
  @IsString()
  @IsNotEmpty()
  heading: string;
} 