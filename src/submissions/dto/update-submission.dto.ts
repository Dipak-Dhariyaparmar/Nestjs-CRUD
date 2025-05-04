import {
  IsMongoId,
  IsEnum,
  IsOptional,
  IsObject,
  IsDate,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubmissionDto {
  @ApiPropertyOptional({ description: 'Student ID submitting the assignment' })
  @IsOptional()
  @IsMongoId()
  student?: string;

  @ApiPropertyOptional({ description: 'Assignment ID being submitted' })
  @IsOptional()
  @IsMongoId()
  assignment?: string;

  @ApiPropertyOptional({ description: 'Course ID this submission belongs to' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional({
    description: 'Status of the submission',
    enum: ['draft', 'submitted', 'resubmitted', 'returned'],
  })
  @IsOptional()
  @IsEnum(['draft', 'submitted', 'resubmitted', 'returned'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Submission content',
    example: { text: 'My assignment', fileUrls: [], links: [] },
  })
  @IsOptional()
  @IsObject()
  content?: {
    text?: string;
    fileUrls?: string[];
    links?: string[];
  };

  @ApiPropertyOptional({ description: 'Date when the submission was made' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submittedAt?: Date;

  @ApiPropertyOptional({
    description: 'Attempt number for this submission',
  })
  @IsOptional()
  @IsNumber()
  attemptNumber?: number;

  @ApiPropertyOptional({
    description: 'Whether the submission was late',
  })
  @IsOptional()
  @IsBoolean()
  isLate?: boolean;

  @ApiPropertyOptional({
    description: 'Feedback for the submission',
    example: { text: 'Great work!', fileUrls: [] },
  })
  @IsOptional()
  @IsObject()
  feedback?: {
    text?: string;
    fileUrls?: string[];
    createdAt?: Date;
  };
}
