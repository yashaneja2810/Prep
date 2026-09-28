import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsUrl,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { CohortScope, CohortStatus } from './create-cohort.dto';

export class UpdateCohortDto {
  @ApiPropertyOptional({
    description: 'Title of the cohort',
    example: 'Full Stack Web Development - January 2024 (Updated)',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the cohort',
    example: 'Updated description for this cohort focusing on the MERN stack.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Organization ID that this cohort is associated with (required only when scope is "organization")',
    example: 'uuid',
  })
  @ValidateIf((o) => o.scope === CohortScope.ORGANIZATION)
  @IsUUID()
  @IsNotEmpty({ message: 'Organization ID is required when scope is "organization"' })
  org_id?: string;

  @ApiPropertyOptional({
    description: 'Scope of the cohort (direct or organization)',
    enum: CohortScope,
    example: CohortScope.ORGANIZATION,
  })
  @IsOptional()
  @IsEnum(CohortScope)
  scope?: CohortScope;

  @ApiPropertyOptional({
    description: 'Start date of the cohort',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date of the cohort',
    example: '2024-06-20',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'GitHub repository link for the cohort',
    example: 'https://github.com/organization/updated-cohort-repo',
  })
  @IsOptional()
  @IsUrl(undefined, { message: 'GitHub repository link must be a valid URL' })
  github_repo_link?: string;

  @ApiPropertyOptional({
    description: 'Status of the cohort',
    enum: CohortStatus,
    example: CohortStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CohortStatus)
  status?: CohortStatus;
} 