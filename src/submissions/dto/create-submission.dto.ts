import {
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsOptional,
  IsObject,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Student ID submitting the assignment' })
  @IsNotEmpty()
  @IsMongoId()
  student: string;

  @ApiProperty({ description: 'Assignment ID being submitted' })
  @IsNotEmpty()
  @IsMongoId()
  assignment: string;

  @ApiPropertyOptional({ description: 'Course ID this submission belongs to' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiProperty({
    description: 'Status of the submission',
    enum: ['draft', 'submitted', 'resubmitted', 'returned'],
    default: 'submitted',
  })
  @IsNotEmpty()
  @IsEnum(['draft', 'submitted', 'resubmitted', 'returned'])
  status: string;

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
