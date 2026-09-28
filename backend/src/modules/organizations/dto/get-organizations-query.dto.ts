import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ORGANIZATION_TYPES } from '../../../common/helpers/string-const';

export class GetOrganizationsQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search query for organization name or code',
    example: 'TechCorp',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by organization type',
    example: ORGANIZATION_TYPES.TRAINING,
    enum: ORGANIZATION_TYPES,
    required: false,
  })
  @IsOptional()
  @IsEnum(ORGANIZATION_TYPES)
  type?: ORGANIZATION_TYPES;

  @ApiProperty({
    description: 'Filter by industry sector',
    example: 'Technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Filter by country code',
    example: 'US',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Filter by hiring status (only applicable to hiring organizations)',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_currently_hiring?: boolean;

  @ApiProperty({
    description: 'Filter by organization status',
    example: 'active',
    enum: ['active', 'inactive', 'all'],
    required: false,
    default: 'active',
  })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'all' = 'active';

  @ApiProperty({
    description: 'Sort field',
    example: 'org_name',
    enum: ['org_name', 'code', 'type', 'created_at', 'updated_at'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_by?: 'org_name' | 'code' | 'type' | 'created_at' | 'updated_at' = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc' = 'desc';
} 