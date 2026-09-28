import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ResourceType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  CODE = 'code',
  IMAGE = 'image',
  OTHER = 'other'
}

export class SessionResourceDto {
  @ApiProperty({ 
    description: 'Type of resource',
    enum: ResourceType,
    required: true
  })
  @IsEnum(ResourceType)
  resource_type: ResourceType;

  @ApiProperty({ 
    description: 'URL to uploaded file in Supabase Storage',
    required: false 
  })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiProperty({ 
    description: 'External link to resource (e.g., YouTube, Google Docs)',
    required: false 
  })
  @IsOptional()
  @IsString()
  external_link?: string;
}

export class CreateSessionResourceDto extends SessionResourceDto {
  @ApiProperty({ 
    description: 'Session ID',
    required: true 
  })
  @IsUUID()
  session_id: string;
}

export class UpdateSessionResourceDto extends SessionResourceDto {} 