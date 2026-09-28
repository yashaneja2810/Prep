import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * AP Submission DTO
 * Data required for submitting an application problem solution
 */
export class ApSubmissionDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'User ID (optional when using authentication)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  user_id?: string;
  
  @IsUUID()
  @ApiProperty({
    description: 'AP ID',
    example: '123e4567-e89b-12d3-a456-426614174005'
  })
  ap_id: string;
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Solution code for the application problem',
    example: 'function solution() { return "Hello, World!"; }'
  })
  submission_code: string;
} 