import {
  IsOptional,
  IsString,
  IsEnum,
  IsObject,
  ValidateNested,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LEARNER_TYPES } from '../../../common/helpers/string-const';

/**
 * DTO for student details
 */
export class StudentDetailsDto {
  @ApiPropertyOptional({
    description: 'Name of the college or university',
    example: 'Massachusetts Institute of Technology',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  college_name?: string;

  @ApiPropertyOptional({
    description: 'Degree course being pursued',
    example: 'Computer Science and Engineering',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  degree_course?: string;

  @ApiPropertyOptional({
    description: 'Current CGPA/GPA',
    example: 3.8,
    minimum: 0.0,
    maximum: 4.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(4.0)
  current_gpa?: number;

  @ApiPropertyOptional({
    description: 'Expected graduation year',
    example: 2025,
    minimum: 2024,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  @Min(2024)
  @Max(2030)
  expected_grad_year?: number;

  @ApiPropertyOptional({
    description: 'Areas of interest',
    example: 'Machine Learning, Web Development',
  })
  @IsOptional()
  @IsString()
  interest?: string;
}

/**
 * DTO for professional details
 */
export class ProfessionalDetailsDto {
  @ApiPropertyOptional({
    description: 'Current company name',
    example: 'Google Inc.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  company_name?: string;

  @ApiPropertyOptional({
    description: 'Current job title',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  job_title?: string;

  @ApiPropertyOptional({
    description: 'Years of professional experience',
    example: 3.5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  years_experience?: number;

  @ApiPropertyOptional({
    description: 'Years of pipeline development experience',
    example: 1.5,
    minimum: 0,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  pipeline_dev_exp?: number;

  @ApiPropertyOptional({
    description: 'Portfolio URL',
    example: 'https://johndoe.dev',
  })
  @IsOptional()
  @IsString()
  portfolio_url?: string;
}

/**
 * DTO for updating learner profile
 */
export class UpdateLearnerProfileDto {
  @ApiPropertyOptional({
    description: 'Type of learner - student or professional',
    example: 'student',
    enum: LEARNER_TYPES,
  })
  @IsOptional()
  @IsEnum(LEARNER_TYPES, {
    message: 'learner_type must be either student or professional',
  })
  learner_type?: string;

  @ApiPropertyOptional({
    description: 'Goals and aspirations of the learner',
    example:
      'I want to become a full-stack developer and build innovative web applications that solve real-world problems.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  goals_text?: string;

  @ApiPropertyOptional({
    description:
      'Student-specific details (include ONLY if learner_type is "student")',
    type: StudentDetailsDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StudentDetailsDto)
  student_details?: StudentDetailsDto;

  @ApiPropertyOptional({
    description:
      'Professional-specific details (include ONLY if learner_type is "professional")',
    type: ProfessionalDetailsDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProfessionalDetailsDto)
  professional_details?: ProfessionalDetailsDto;
} 