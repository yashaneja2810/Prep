import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserToOrgDto {
  @ApiProperty({
    description: 'Email of the user to add to the organization',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;
}

export class UserOperationResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'User added to organization successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User-organization relationship data',
    example: {
      user_id: 'user-uuid-123',
      organization_id: 'org-uuid-456',
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
    },
  })
  data: {
    user_id: string;
    organization_id: string;
    is_active: boolean;
    created_at: string;
  };
} 