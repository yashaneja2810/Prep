import { IsEmail, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLearnerDto {
  @IsEmail()
  @ApiProperty({
    example: 'learner@example.com',
    description: 'Email used to find user_id from users table',
  })
  email: string;
}

export class CreateBatchLearnersDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one email must be provided' })
  @IsEmail({}, { each: true, message: 'Each email must be a valid email address' })
  @ApiProperty({
    type: [String],
    example: [
      'learner1@example.com',
      'learner2@example.com',
      'learner3@example.com'
    ],
    description: 'Array of learner emails to be added to the system',
  })
  emails: string[];
} 