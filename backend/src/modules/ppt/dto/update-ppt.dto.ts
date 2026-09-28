import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsUrl } from 'class-validator';

/**
 * Update PPT DTO
 * All fields are optional for partial updates
 * Based on ppt table schema
 */
export class UpdatePptDto {
  @ApiProperty({
    description: 'UUID of the topic this presentation belongs to',
    example: '4c44509e-0654-495e-9118-850c578c5786',
    format: 'uuid',
    required: false,
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsOptional()
  topic_id?: string;

  @ApiProperty({
    description: 'URL to the presentation file',
    example: 'https://supabase-storage-url.com/presentations/intro-to-javascript.pdf',
    required: false,
  })
  @IsUrl({}, { message: 'url must be a valid URL' })
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'Title of the presentation',
    example: 'Advanced JavaScript Concepts',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;
} 