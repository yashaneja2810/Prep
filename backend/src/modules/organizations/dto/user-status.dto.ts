import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateUserInOrgDto {
  @ApiProperty({
    description: 'Optional reason for deactivating the user in the organization',
    example: 'User requested temporary suspension',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must be at most 500 characters long' })
  reason?: string;
}

export class ReactivateUserInOrgDto {
  @ApiProperty({
    description: 'Optional reason for reactivating the user in the organization',
    example: 'User returned from leave',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must be at most 500 characters long' })
  reason?: string;
}

// Alias for clearer naming
export class ActivateUserInOrgDto extends ReactivateUserInOrgDto {}

export class UserStatusChangeResponseDto {
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
    example: 'User status updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user status information',
    example: {
      user_id: 'user-uuid-123',
      organization_id: 'org-uuid-456',
      is_active: false,
      updated_at: '2024-01-15T10:30:00Z',
    },
  })
  data: {
    user_id: string;
    organization_id: string;
    is_active: boolean;
    updated_at: string;
  };
} 