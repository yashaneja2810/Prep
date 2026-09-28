import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AddLearnersToCohortDto {
  @ApiProperty({
    description: 'User IDs of learners to add to the cohort',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  learner_ids: string[];
} 