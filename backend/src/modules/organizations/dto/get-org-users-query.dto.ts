import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class GetOrgUsersQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search query for user name or email',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by user status in organization (active/inactive/all)',
    example: 'active',
    enum: ['active', 'inactive', 'all'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'all' = 'active';

  @ApiProperty({
    description: 'Sort field',
    example: 'first_name',
    enum: ['first_name', 'last_name', 'email', 'created_at'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_by?: 'first_name' | 'last_name' | 'email' | 'created_at' = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc' = 'asc';
} 