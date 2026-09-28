import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCpDto } from './create-cp.dto';

export class CreateCpsBatchDto {
  @ApiProperty({
    description: 'UUID of the topic to associate the concept practices with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  topic_id: string;

  @ApiProperty({
    description: 'Array of concept practices to create',
    type: [CreateCpDto],
    example: [
      {
        title: 'Array Manipulation in JavaScript',
        difficulty: 'Easy',
        code: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
        output: '3',
        explanation:
          'This code demonstrates how to get the length of an array in JavaScript.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCpDto)
  cps: CreateCpDto[];
}
