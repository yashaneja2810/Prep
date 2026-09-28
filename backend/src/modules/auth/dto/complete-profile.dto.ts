import {
  IsString,
  IsOptional,
  IsDateString,
  IsPhoneNumber,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteProfileDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  last_name: string;

  @ApiPropertyOptional({
    example: 'Johnny',
    description: 'Preferred name or nickname',
  })
  @IsOptional()
  @IsString()
  preferred_name?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number with country code (e.g., +1234567890)',
  })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { 
    message: 'Please provide a valid phone number with country code (e.g., +1234567890)' 
  })
  phone?: string;

  @ApiPropertyOptional({
    example: '1990-01-15',
    description: 'Date of birth in YYYY-MM-DD format',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
  date_of_birth?: string;

  @ApiProperty({
    example: 'America/New_York',
    description: 'User timezone',
    default: 'UTC',
  })
  @IsString()
  timezone: string = 'UTC';
} 