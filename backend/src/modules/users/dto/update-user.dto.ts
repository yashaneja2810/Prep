import { IsString, IsOptional, IsDateString, IsTimeZone, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    description: 'User preferred name or nickname',
    example: 'Johnny',
    required: false,
  })
  @IsOptional()
  @IsString()
  preferred_name?: string;

  @ApiProperty({
    description: 'User phone number (international format recommended)',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number with country code (e.g., +1234567890)'
  })
  phone?: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-05-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
} 