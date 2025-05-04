import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsDate,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Title of the assignment' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the assignment' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Course ID this assignment belongs to' })
  @IsNotEmpty()
  @IsMongoId()
  course: string;

  @ApiPropertyOptional({ description: 'Module ID this assignment belongs to' })
  @IsOptional()
  @IsMongoId()
  module?: string;

  @ApiPropertyOptional({ description: 'Lesson ID this assignment belongs to' })
  @IsOptional()
  @IsMongoId()
  lesson?: string;

  @ApiProperty({ description: 'Due date for the assignment' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional({
    description: 'Total points possible for the assignment',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  totalPoints?: number = 0;

  @ApiPropertyOptional({
    description: 'Status of the assignment',
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'])
  status?: string = 'active';

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
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}
