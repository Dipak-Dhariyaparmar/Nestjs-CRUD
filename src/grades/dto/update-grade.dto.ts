import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiPropertyOptional({ description: 'ID of the submission being graded' })
  @IsOptional()
  @IsMongoId()
  submission?: string;

  @ApiPropertyOptional({ description: 'ID of the student' })
  @IsOptional()
  @IsMongoId()
  student?: string;

  @ApiPropertyOptional({ description: 'ID of the assignment' })
  @IsOptional()
  @IsMongoId()
  assignment?: string;

  @ApiPropertyOptional({ description: 'Score for the assignment' })
  @IsOptional()
  @IsNumber()
  score?: number;

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
  @IsOptional()
  @IsString()
  criterionId: string;

  @IsOptional()
  @IsString()
  criterionName: string;

  @IsOptional()
  @IsNumber()
  score: number;

  @IsOptional()
  @IsNumber()
  maxScore: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
