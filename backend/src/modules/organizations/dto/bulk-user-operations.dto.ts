import { IsArray, IsEmail, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkAddUsersDto {
  @ApiProperty({
    description: 'Array of user emails to add to the organization',
    example: ['john.doe@example.com', 'jane.smith@example.com', 'alice.johnson@example.com'],
    type: [String],
  })
  @IsArray({ message: 'emails must be an array' })
  @ArrayMinSize(1, { message: 'At least one email must be provided' })
  @IsEmail({}, { each: true, message: 'Each email must be a valid email address' })
  emails: string[];
}

export class BulkRemoveUsersDto {
  @ApiProperty({
    description: 'Array of user emails to remove from the organization',
    example: ['john.doe@example.com', 'jane.smith@example.com', 'alice.johnson@example.com'],
    type: [String],
  })
  @IsArray({ message: 'emails must be an array' })
  @ArrayMinSize(1, { message: 'At least one email must be provided' })
  @IsEmail({}, { each: true, message: 'Each email must be a valid email address' })
  emails: string[];
}

export class BulkOperationResultDto {
  @ApiProperty({
    description: 'Total number of operations attempted',
    example: 5,
  })
  total_attempted: number;

  @ApiProperty({
    description: 'Number of successful operations',
    example: 4,
  })
  successful: number;

  @ApiProperty({
    description: 'Number of failed operations',
    example: 1,
  })
  failed: number;

  @ApiProperty({
    description: 'Details of failed operations',
    example: [
      {
        email: 'john.doe@example.com',
        reason: 'User is already in an organization',
      },
    ],
    type: [Object],
  })
  failed_users: Array<{
    email: string;
    reason: string;
  }>;
}

export class BulkDeactivateUsersDto {
  @ApiProperty({
    description: 'Array of user emails to deactivate in the organization',
    example: ['john.doe@example.com', 'jane.smith@example.com', 'alice.johnson@example.com'],
    type: [String],
  })
  @IsArray({ message: 'emails must be an array' })
  @ArrayMinSize(1, { message: 'At least one email must be provided' })
  @IsEmail({}, { each: true, message: 'Each email must be a valid email address' })
  emails: string[];
}

export class BulkReactivateUsersDto {
  @ApiProperty({
    description: 'Array of user emails to reactivate in the organization',
    example: ['john.doe@example.com', 'jane.smith@example.com', 'alice.johnson@example.com'],
    type: [String],
  })
  @IsArray({ message: 'emails must be an array' })
  @ArrayMinSize(1, { message: 'At least one email must be provided' })
  @IsEmail({}, { each: true, message: 'Each email must be a valid email address' })
  emails: string[];
}

// Alias for clearer naming
export class BulkActivateUsersDto extends BulkReactivateUsersDto {}

export class BulkOperationResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Bulk operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Bulk operation results',
    type: BulkOperationResultDto,
  })
  data: BulkOperationResultDto;
} 