import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsEmail,
  MaxLength,
  Min,
  Max,
  IsObject,
  IsArray,
  IsInt,
  ArrayMinSize,
} from 'class-validator';

export class CreateTrainerProfileDto {
  @ApiProperty({
    description:
      'Email of the user for whom the trainer profile is being created',
    example: 'trainer@example.com',
  })
  @IsString()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Array of speciality IDs that the trainer specializes in',
    example: [1, 3, 5],
    type: [Number],
  })
  @IsArray({ message: 'Specialities must be an array' })
  @ArrayMinSize(1, { message: 'At least one speciality must be selected' })
  @IsInt({ each: true, message: 'Each speciality ID must be an integer' })
  specialities: number[];

  @ApiPropertyOptional({
    description: 'Total years of teaching experience',
    example: 5.5,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 1 },
    {
      message: 'Total years teaching must be a number with max 1 decimal place',
    },
  )
  @Min(0, { message: 'Years of teaching cannot be negative' })
  @Max(999.9, { message: 'Years of teaching cannot exceed 999.9' })
  total_years_teaching?: number;

  @ApiPropertyOptional({
    description: 'Professional bio and background',
    example:
      'Experienced software engineer with 10+ years in web development and training. Passionate about teaching modern web technologies.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  @MaxLength(255, { message: 'LinkedIn URL cannot exceed 255 characters' })
  linkedin_url?: string;

  @ApiPropertyOptional({
    description: 'Areas of expertise and skills',
    example:
      'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
  })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'Profile image must be a valid URL' })
  @MaxLength(255, { message: 'Profile image URL cannot exceed 255 characters' })
  profile_image?: string;

  @ApiPropertyOptional({
    description: 'Personal or professional website URL',
    example: 'https://johndoe.dev',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'Website must be a valid URL' })
  @MaxLength(255, { message: 'Website URL cannot exceed 255 characters' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Social media links and other profiles (JSON object)',
    example: {
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Social links must be a valid JSON object' })
  social_links?: any;
}

export class UpdateTrainerProfileDto {
  @ApiPropertyOptional({
    description:
      'Array of speciality IDs that the trainer specializes in (optional)',
    example: [1, 2, 4],
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'Specialities must be an array' })
  @ArrayMinSize(1, {
    message:
      'At least one speciality must be selected when updating specialities',
  })
  @IsInt({ each: true, message: 'Each speciality ID must be an integer' })
  specialities?: number[];

  @ApiPropertyOptional({
    description: 'Total years of teaching experience',
    example: 5.5,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 1 },
    {
      message: 'Total years teaching must be a number with max 1 decimal place',
    },
  )
  @Min(0, { message: 'Years of teaching cannot be negative' })
  @Max(999.9, { message: 'Years of teaching cannot exceed 999.9' })
  total_years_teaching?: number;

  @ApiPropertyOptional({
    description: 'Professional bio and background',
    example:
      'Experienced software engineer with 10+ years in web development and training. Passionate about teaching modern web technologies.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  @MaxLength(255, { message: 'LinkedIn URL cannot exceed 255 characters' })
  linkedin_url?: string;

  @ApiPropertyOptional({
    description: 'Areas of expertise and skills',
    example:
      'JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker',
  })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'Profile image must be a valid URL' })
  @MaxLength(255, { message: 'Profile image URL cannot exceed 255 characters' })
  profile_image?: string;

  @ApiPropertyOptional({
    description: 'Personal or professional website URL',
    example: 'https://johndoe.dev',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUrl({}, { message: 'Website must be a valid URL' })
  @MaxLength(255, { message: 'Website URL cannot exceed 255 characters' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Social media links and other profiles (JSON object)',
    example: {
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Social links must be a valid JSON object' })
  social_links?: any;
} 