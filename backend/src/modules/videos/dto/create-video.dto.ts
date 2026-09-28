import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsUrl, IsOptional, IsInt, Min } from 'class-validator';

/**
 * Create Video DTO
 * Based on videos table schema
 */
export class CreateVideoDto {
  @ApiProperty({
    description: 'UUID of the topic this video belongs to',
    example: '4c44509e-0654-495e-9118-850c578c5786',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'topic_id must be a valid UUID' })
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'URL to the video file',
    example: 'https://supabase-storage-url.com/videos/intro-to-javascript.mp4',
  })
  @IsUrl({}, { message: 'url must be a valid URL' })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Title of the video',
    example: 'Introduction to JavaScript',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Duration of the video in seconds',
    example: 600,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'Transcript of the video content',
    example: 'In this video, we will explore the basics of JavaScript...',
  })
  @IsString()
  @IsNotEmpty()
  transcript: string;

  @ApiProperty({
    description: 'Summary of the video content',
    example: 'This video covers JavaScript fundamentals including variables, functions, and basic syntax.',
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    description: 'Timestamps for key points in the video (formatted as JSON or text)',
    example: '00:00 Introduction\n02:30 Variables\n05:45 Functions',
  })
  @IsString()
  @IsNotEmpty()
  timestamps: string;
} 