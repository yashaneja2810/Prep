import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, IsUrl, IsIn, IsUUID } from 'class-validator';

export class UpdateSessionDto {
  @ApiProperty({ description: 'Session title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Session description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Session date in YYYY-MM-DD format', required: false })
  @IsOptional()
  @IsString()
  session_date?: string;

  @ApiProperty({ description: 'Session time in HH:MM format', required: false })
  @IsOptional()
  @IsString()
  session_time?: string;

  @ApiProperty({ description: 'Session duration in minutes', required: false })
  @IsOptional()
  @IsInt()
  duration_minutes?: number;

  @ApiProperty({ description: 'Trainer ID', required: false })
  @IsOptional()
  @IsUUID()
  trainer_id?: string;

  @ApiProperty({ description: 'Meeting link (URL)', required: false })
  @IsOptional()
  @IsUrl()
  meeting_link?: string;

  @ApiProperty({ 
    description: 'Session status', 
    enum: ['scheduled', 'completed'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'completed'])
  status?: string;
} 