import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsOptional, IsDateString, IsInt, IsUrl, IsIn } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Cohort ID' })
  @IsNotEmpty()
  @IsUUID()
  cohort_id: string;

  @ApiProperty({ description: 'Session title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Session description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Session date in YYYY-MM-DD format' })
  @IsNotEmpty()
  @IsString()
  session_date: string;

  @ApiProperty({ description: 'Session time in HH:MM format', required: false })
  @IsOptional()
  @IsString()
  session_time?: string;

  @ApiProperty({ description: 'Session duration in minutes' })
  @IsNotEmpty()
  @IsInt()
  duration_minutes: number;

  @ApiProperty({ description: 'Trainer ID' })
  @IsNotEmpty()
  @IsUUID()
  trainer_id: string;

  @ApiProperty({ description: 'Meeting link (URL)', required: false })
  @IsOptional()
  @IsUrl()
  meeting_link?: string;

  @ApiProperty({ 
    description: 'Session status', 
    enum: ['scheduled', 'completed'],
    default: 'scheduled'
  })
  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'completed'])
  status?: string = 'scheduled';
} 