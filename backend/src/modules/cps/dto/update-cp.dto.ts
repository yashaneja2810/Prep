import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DIFFICULTY } from '../../../common/helpers/string-const';

export class UpdateCpDto {
  @ApiPropertyOptional({
    description: 'Title of the concept practice',
    example: 'Updated Array Manipulation in JavaScript',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Difficulty level of the concept practice',
    enum: DIFFICULTY,
    example: DIFFICULTY.INTERMEDIATE,
  })
  @IsOptional()
  @IsEnum(DIFFICULTY)
  difficulty?: DIFFICULTY;

  @ApiPropertyOptional({
    description: 'Code content for the concept practice',
    example: 'const arr = [1, 2, 3, 4];\nconsole.log(arr.map(x => x * 2));',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Expected output of the code',
    example: '[2, 4, 6, 8]',
  })
  @IsOptional()
  @IsString()
  output?: string;

  @ApiPropertyOptional({
    description: 'Explanation of the concept practice',
    example:
      'This code demonstrates how to use the map method to transform array elements.',
  })
  @IsOptional()
  @IsString()
  explanation?: string;
}
