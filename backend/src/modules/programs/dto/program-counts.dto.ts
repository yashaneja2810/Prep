import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for published program counts response
 */
export class ProgramCountsDto {
  @ApiProperty({
    description: 'Number of application problems in published programs',
    example: 42,
    type: Number,
  })
  ap_count: number;

  @ApiProperty({
    description: 'Number of concept practices in published programs',
    example: 56,
    type: Number,
  })
  cp_count: number;
} 