
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsUrl,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export enum CohortScope {
  DIRECT = 'direct',
  ORGANIZATION = 'organization',
}

export enum CohortStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateCohortDto {
  @ApiProperty({
    description: 'Unique code for the cohort',
    example: 'FSW-2024-01',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  cohort_code: string;

  @ApiProperty({
    description: 'Title of the cohort',
    example: 'Full Stack Web Development - January 2024',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the cohort',
    example: 'This cohort focuses on the MERN stack and modern web development practices.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Program ID that this cohort belongs to',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  program_id: string;

  @ApiPropertyOptional({
    description: 'Organization ID that this cohort is associated with (required only when scope is "organization")',
    example: 'uuid',
  })
  @ValidateIf((o) => o.scope === CohortScope.ORGANIZATION)
  @IsUUID()
  @IsNotEmpty({ message: 'Organization ID is required when scope is "organization"' })
  org_id?: string;

  @ApiProperty({
    description: 'Scope of the cohort (direct or organization)',
    enum: CohortScope,
    default: CohortScope.DIRECT,
    example: CohortScope.DIRECT,
  })
  @IsEnum(CohortScope)
  scope: CohortScope;

  @ApiProperty({
    description: 'Start date of the cohort',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'End date of the cohort',
    example: '2024-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({
    description: 'GitHub repository link for the cohort',
    example: 'https://github.com/organization/cohort-repo',
  })
  @IsOptional()
  @IsUrl(undefined, { message: 'GitHub repository link must be a valid URL' })
  github_repo_link?: string;

  @ApiPropertyOptional({
    description: 'Status of the cohort',
    enum: CohortStatus,
    default: CohortStatus.UPCOMING,
    example: CohortStatus.UPCOMING,
  })
  @IsOptional()
  @IsEnum(CohortStatus)
  status?: CohortStatus;

  @ApiPropertyOptional({
    description: 'List of trainer user IDs to associate with this cohort',
    example: ['uuid1', 'uuid2'],
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsUUID(undefined, { each: true })
  trainer_ids?: string[];
  
  @ApiPropertyOptional({
    description: 'List of learner user IDs to associate with this cohort',
    example: ['uuid1', 'uuid2'],
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsUUID(undefined, { each: true })
  learner_ids?: string[];
} 