import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'uuid-v4-string',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Expose()
  first_name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Expose()
  last_name?: string;

  @ApiProperty({
    description: 'User preferred name',
    example: 'Johnny',
  })
  @Expose()
  preferred_name?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  @Expose()
  phone?: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-05-15',
  })
  @Expose()
  date_of_birth?: string;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
  })
  @Expose()
  timezone?: string;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  @Expose()
  email_verified: boolean;

  @ApiProperty({
    description: 'Whether user account is active',
    example: true,
  })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  created_at: string;

  @ApiProperty({
    description: 'Last profile update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  updated_at: string;

  @ApiProperty({
    description: 'Last sign in timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  last_sign_in_at?: string;

  @ApiProperty({
    description: 'User roles',
    type: 'array',
    items: { type: 'object' },
  })
  @Expose()
  roles?: any[];

  @ApiProperty({
    description: 'User organizations',
    type: 'array',
    items: { type: 'object' },
  })
  @Expose()
  organizations?: any[];

  @ApiProperty({
    description: 'User profile data',
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  profile?: any;
} 