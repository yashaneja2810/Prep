import { IsEmail, IsNumber, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ROLE_IDS } from 'src/common/helpers/string-const';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Email of the user to assign role to',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role ID to assign to the user',
    example: 3,
    enum: Object.values(ROLE_IDS),
  })
  @IsNumber()
  role_id: number;

  @ApiPropertyOptional({
    description: 'Whether the role assignment should be active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiPropertyOptional({
    description: 'ID of the user assigning this role (will use current user if not provided)',
    example: 'uuid-v4-string',
  })
  @IsOptional()
  @IsUUID()
  assigned_by?: string;
} 