import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsUrl } from 'class-validator';

/**
 * Create PPT DTO
 * Based on ppt table schema
 */
export class CreatePptDto {
  @ApiProperty({
    description: 'UUID of the topic this presentation belongs to',
    example: '4c44509e-0654-495e-9118-850c578c5786',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'URL to the presentation file',
    example: 'https://supabase-storage-url.com/presentations/intro-to-javascript.pdf',
  })
  @IsUrl({}, { message: 'url must be a valid URL' })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Title of the presentation',
    example: 'Introduction to JavaScript',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  title: string;
} 