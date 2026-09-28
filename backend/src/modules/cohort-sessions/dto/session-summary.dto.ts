import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SessionSummaryDto {
  @ApiProperty({ 
    description: 'Topics covered in the session',
    required: false 
  })
  @IsOptional()
  @IsString()
  topics_covered?: string;

  @ApiProperty({ 
    description: 'Action points from the session',
    required: false 
  })
  @IsOptional()
  @IsString()
  action_points?: string;

  @ApiProperty({ 
    description: 'Quick recap of the session',
    required: false 
  })
  @IsOptional()
  @IsString()
  quick_recap?: string;

  @ApiProperty({ 
    description: 'Detailed summary of the session',
    required: false 
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ 
    description: 'Additional notes',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'URL to class files',
    required: false 
  })
  @IsOptional()
  @IsString()
  class_files_url?: string;

  @ApiProperty({ 
    description: 'URL to session recording',
    required: false 
  })
  @IsOptional()
  @IsString()
  recording_link?: string;
} 