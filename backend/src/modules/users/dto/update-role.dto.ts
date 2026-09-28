import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ROLE_IDS } from 'src/common/helpers/string-const';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'New role ID to assign',
    example: 3,
    enum: Object.values(ROLE_IDS),
  })
  @IsOptional()
  @IsNumber()
  role_id?: number;

  @ApiPropertyOptional({
    description: 'Whether the role assignment should be active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
} 