import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsIn, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceItemDto {
  @ApiProperty({ description: 'Cohort learner ID' })
  @IsNotEmpty()
  @IsUUID()
  cohort_learner_id: string;

  @ApiProperty({ 
    description: 'Attendance status',
    enum: ['present', 'absent', 'excused', 'late']
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['present', 'absent', 'excused', 'late'])
  status: string;
}

export class SessionAttendanceDto {
  @ApiProperty({ 
    description: 'Array of attendance records',
    type: [AttendanceItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  attendance: AttendanceItemDto[];
} 