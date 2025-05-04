import {
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ description: 'ID of the submission being graded' })
  @IsNotEmpty()
  @IsMongoId()
  submission: string;

  @ApiProperty({ description: 'ID of the student' })
  @IsNotEmpty()
  @IsMongoId()
  student: string;

  @ApiProperty({ description: 'ID of the assignment' })
  @IsNotEmpty()
  @IsMongoId()
  assignment: string;

  @ApiProperty({ description: 'Score for the assignment' })
  @IsNotEmpty()
  @IsNumber()
  score: number;

  @ApiPropertyOptional({ description: 'ID of the instructor who graded' })
  @IsOptional()
  @IsMongoId()
  gradedBy?: string;

  @ApiPropertyOptional({ description: 'Feedback for the student' })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    description: 'Rubric scores for the assignment',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricScore)
  rubricScores?: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    feedback?: string;
  }>;

  @ApiPropertyOptional({ description: 'Date when the assignment was graded' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  gradedAt?: Date;
}

class RubricScore {
  @IsNotEmpty()
  @IsString()
  criterionId: string;

  @IsNotEmpty()
  @IsString()
  criterionName: string;

  @IsNotEmpty()
  @IsNumber()
  score: number;

  @IsNotEmpty()
  @IsNumber()
  maxScore: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
