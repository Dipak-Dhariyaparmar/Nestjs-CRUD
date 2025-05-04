import {
  IsOptional,
  IsString,
  IsMongoId,
  IsDate,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ description: 'Title of the assignment' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the assignment',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Course ID this assignment belongs to' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional({ description: 'Module ID this assignment belongs to' })
  @IsOptional()
  @IsMongoId()
  module?: string;

  @ApiPropertyOptional({ description: 'Lesson ID this assignment belongs to' })
  @IsOptional()
  @IsMongoId()
  lesson?: string;

  @ApiPropertyOptional({ description: 'Due date for the assignment' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Total points possible for the assignment',
  })
  @IsOptional()
  @IsNumber()
  totalPoints?: number;

  @ApiPropertyOptional({
    description: 'Status of the assignment',
    enum: ['active', 'inactive', 'archived'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Resource materials for the assignment',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentResource)
  resources?: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  @ApiPropertyOptional({
    description: 'Submission settings for the assignment',
  })
  @IsOptional()
  @IsObject()
  submissionSettings?: {
    allowLateSubmissions?: boolean;
    maxAttempts?: number;
    submissionType?: string;
    fileTypes?: string[];
    maxFileSize?: number;
  };
}

class AssignmentResource {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  type: string;
}
