import { IsNotEmpty, IsString, IsUUID, IsOptional, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'isUuidOrMe', async: false })
export class IsUuidOrMe implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (text === 'me') return true;
    
    // UUID regex pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return 'user_id must be a valid UUID or the string "me"';
  }
}

export class LearnerNotesDto {
  @ApiProperty({
    description: 'Session ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({
    description: 'User ID or "me" for current authenticated user',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsNotEmpty()
  @Validate(IsUuidOrMe)
  user_id: string;

  @ApiProperty({
    description: 'Notes content or file URL',
    example: 'These are my notes from the session'
  })
  @IsString()
  @IsNotEmpty()
  notes_content: string;
}

export class UpdateLearnerNotesDto {
  @ApiProperty({
    description: 'Notes content or file URL',
    example: 'Updated notes from the session'
  })
  @IsString()
  @IsNotEmpty()
  notes_content: string;
} 