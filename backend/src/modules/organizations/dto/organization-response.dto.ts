import { ApiProperty } from '@nestjs/swagger';
import { ORGANIZATION_TYPES } from '../../../common/helpers/string-const';
import { OrganizationEntity } from '../../../common/types/organization.types';

export class OrganizationDto {
  @ApiProperty({
    description: 'Organization unique identifier',
    example: 'uuid-example-123',
  })
  id: string;

  @ApiProperty({
    description: 'Organization name',
    example: 'TechCorp Solutions',
  })
  org_name: string;

  @ApiProperty({
    description: 'Organization code (unique identifier)',
    example: 'TECH001',
  })
  code: string;

  @ApiProperty({
    description: 'Type of organization',
    example: ORGANIZATION_TYPES.TRAINING,
    enum: ORGANIZATION_TYPES,
  })
  type: ORGANIZATION_TYPES;

  @ApiProperty({
    description: 'Organization website URL',
    example: 'https://techcorp.com',
    required: false,
  })
  website?: string;

  @ApiProperty({
    description: 'Industry sector',
    example: 'Technology',
    required: false,
  })
  industry?: string;

  @ApiProperty({
    description: 'Primary address line',
    example: '123 Main Street',
    required: false,
  })
  address_line1?: string;

  @ApiProperty({
    description: 'Secondary address line',
    example: 'Suite 200',
    required: false,
  })
  address_line2?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'State or Province',
    example: 'NY',
    required: false,
  })
  state_province?: string;

  @ApiProperty({
    description: 'Postal/ZIP code',
    example: '10001',
    required: false,
  })
  postal_code?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'US',
    required: false,
  })
  country?: string;

  @ApiProperty({
    description: 'Organization logo URL',
    example: 'https://techcorp.com/logo.png',
    required: false,
  })
  logo_url?: string;

  @ApiProperty({
    description: 'Organization description',
    example: 'Leading technology solutions provider',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the organization is currently hiring',
    example: true,
    required: false,
  })
  is_currently_hiring?: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  updated_at: string;
}

export class OrganizationResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Organization retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Organization data',
    type: OrganizationDto,
  })
  data: OrganizationDto;
}

class PaginatedDataDto {
  @ApiProperty({
    description: 'Array of organizations',
    type: [OrganizationDto],
  })
  organizations: OrganizationDto[];

  @ApiProperty({
    description: 'Total number of organizations',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

export class PaginatedOrganizationsResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Organizations retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Paginated organizations data',
    type: PaginatedDataDto,
  })
  data: PaginatedDataDto;
} 