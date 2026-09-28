import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsUrl, IsInt, Min, IsNotEmpty } from 'class-validator';

/**
 * Update Video DTO
 * All fields are optional for partial updates
 * Based on videos table schema
 */
export class UpdateVideoDto {


  @ApiProperty({
    description: 'Title of the video',
    example: 'Advanced JavaScript Concepts',
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
    example: 'In this video, we will explore the advanced concepts of JavaScript...',
  })
  @IsString()
  @IsNotEmpty()
  transcript: string;

  @ApiProperty({
    description: 'Summary of the video content',
    example: 'This video covers advanced JavaScript topics including closures, promises, and async/await.',
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    description: 'Timestamps for key points in the video (formatted as JSON or text)',
    example: '00:00 Introduction\n02:30 Closures\n05:45 Promises',
  })
  @IsString()
  @IsNotEmpty()
  timestamps: string;
} 