import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateSpecialityDto {
  @ApiProperty({
    description: 'Name of the speciality',
    example: 'Full Stack Web Development',
  })
  @IsString()
  @MinLength(2, {
    message: 'Speciality name must be at least 2 characters long',
  })
  @MaxLength(100, { message: 'Speciality name cannot exceed 100 characters' })
  name: string;
}

export class UpdateSpecialityDto {
  @ApiPropertyOptional({
    description: 'Name of the speciality',
    example: 'Advanced Full Stack Web Development',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Speciality name must be at least 2 characters long',
  })
  @MaxLength(100, { message: 'Speciality name cannot exceed 100 characters' })
  name?: string;
} 