import { ApiProperty } from '@nestjs/swagger';

export class ProfileCompletenessDto {
  @ApiProperty({
    example: true,
    description: 'Whether the learner profile is complete',
  })
  is_complete: boolean;

  @ApiProperty({
    example: ['learner_type', 'goals_text'],
    description: 'List of missing required fields',
    type: [String],
  })
  missing_fields: string[];

  @ApiProperty({
    example: 75,
    description: 'Completion percentage (0-100)',
  })
  completion_percentage: number;

  @ApiProperty({
    example: 'Please complete your learner type and goals',
    description: 'Human-readable completion message',
  })
  completion_message: string;
} 