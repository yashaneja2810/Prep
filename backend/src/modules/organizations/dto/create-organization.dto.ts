import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
  Length,
  Matches,
  ValidateIf,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ORGANIZATION_TYPES } from '../../../common/helpers/string-const';

@ValidatorConstraint({ name: 'organizationHiringValidation', async: false })
export class OrganizationHiringValidation implements ValidatorConstraintInterface {
  validate(value: any, args: any) {
    const obj = args.object;
    
    // For hiring organizations, is_currently_hiring is required
    if (obj.type === ORGANIZATION_TYPES.HIRING) {
      return value !== undefined && value !== null;
    }
    
    // For training organizations, is_currently_hiring must not be provided
    if (obj.type === ORGANIZATION_TYPES.TRAINING) {
      return value === undefined || value === null;
    }
    
    return true;
  }

  defaultMessage(args: any) {
    const obj = args.object;
    if (obj.type === ORGANIZATION_TYPES.HIRING) {
      return 'is_currently_hiring is required for hiring organizations';
    }
    if (obj.type === ORGANIZATION_TYPES.TRAINING) {
      return 'is_currently_hiring must not be provided for training organizations';
    }
    return 'Invalid organization hiring configuration';
  }
}

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'TechCorp Solutions',
    minLength: 1,
    maxLength: 120,
  })
  @IsString()
  @Length(1, 120, { message: 'Organization name must be between 1 and 120 characters' })
  org_name: string;

  @ApiProperty({
    description: 'Organization code (unique identifier)',
    example: 'TECH001',
    minLength: 1,
    maxLength: 10,
  })
  @IsString()
  @Length(1, 10, { message: 'Organization code must be between 1 and 10 characters' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Organization code must contain only uppercase letters and numbers' })
  code: string;

  @ApiProperty({
    description: 'Type of organization',
    example: ORGANIZATION_TYPES.TRAINING,
    enum: ORGANIZATION_TYPES,
  })
  @IsEnum(ORGANIZATION_TYPES, { message: 'Organization type must be either hiring or training' })
  type: ORGANIZATION_TYPES;

  @ApiProperty({
    description: 'Organization website URL',
    example: 'https://techcorp.com',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  @Length(0, 255, { message: 'Website URL cannot exceed 255 characters' })
  website?: string;

  @ApiProperty({
    description: 'Industry sector',
    example: 'Technology',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Industry cannot exceed 100 characters' })
  industry?: string;

  @ApiProperty({
    description: 'Primary address line',
    example: '123 Main Street',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Address line 1 cannot exceed 100 characters' })
  address_line1?: string;

  @ApiProperty({
    description: 'Secondary address line',
    example: 'Suite 200',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Address line 2 cannot exceed 100 characters' })
  address_line2?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    required: false,
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(0, 80, { message: 'City cannot exceed 80 characters' })
  city?: string;

  @ApiProperty({
    description: 'State or Province',
    example: 'NY',
    required: false,
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(0, 80, { message: 'State/Province cannot exceed 80 characters' })
  state_province?: string;

  @ApiProperty({
    description: 'Postal/ZIP code',
    example: '10001',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(0, 20, { message: 'Postal code cannot exceed 20 characters' })
  postal_code?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'US',
    required: false,
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country code must be exactly 2 uppercase letters (ISO 3166-1 alpha-2 format, e.g., US, CA)' })
  country?: string;

  @ApiProperty({
    description: 'Organization logo URL',
    example: 'https://techcorp.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid logo URL' })
  @Length(0, 255, { message: 'Logo URL cannot exceed 255 characters' })
  logo_url?: string;

  @ApiProperty({
    description: 'Organization description',
    example: 'Leading technology solutions provider',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Whether the organization is currently hiring (required for hiring organizations, forbidden for training organizations)',
    example: true,
    required: false,
    type: Boolean,
  })
  @Validate(OrganizationHiringValidation)
  @ValidateIf((obj) => obj.type === ORGANIZATION_TYPES.HIRING)
  @IsBoolean({ message: 'is_currently_hiring must be a boolean value' })
  is_currently_hiring?: boolean;
} 