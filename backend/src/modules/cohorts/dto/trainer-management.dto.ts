import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AddTrainersToCohortDto {
  @ApiProperty({
    description: 'User IDs of trainers to add to the cohort',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  trainer_ids: string[];
}

export class UpdateTrainerRoleDto {
  @ApiProperty({
    description: 'Whether the trainer is the primary trainer for the cohort',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_primary: boolean;
} 