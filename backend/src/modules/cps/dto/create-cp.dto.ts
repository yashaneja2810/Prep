import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DIFFICULTY } from '../../../common/helpers/string-const';

export class CreateCpDto {
  @ApiProperty({
    description: 'Title of the concept practice',
    example: 'Array Manipulation in JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Difficulty level of the concept practice',
    enum: DIFFICULTY,
    example: DIFFICULTY.EASY,
  })
  @IsOptional()
  @IsEnum(DIFFICULTY)
  difficulty?: DIFFICULTY;

  @ApiProperty({
    description: 'Code content for the concept practice',
    example: 'const arr = [1, 2, 3];\nconsole.log(arr.length);',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Expected output of the code',
    example: '3',
  })
  @IsString()
  @IsNotEmpty()
  output: string;

  @ApiProperty({
    description: 'Explanation of the concept practice',
    example:
      'This code demonstrates how to get the length of an array in JavaScript.',
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;
}
