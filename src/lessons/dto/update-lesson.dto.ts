import {
  IsString,
  IsMongoId,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Title of the lesson' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the lesson' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Module ID this lesson belongs to' })
  @IsOptional()
  @IsMongoId()
  module?: string;

  @ApiPropertyOptional({ description: 'Course ID this lesson belongs to' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional({
    description: 'Order of the lesson within the module',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiPropertyOptional({
    description: 'Type of the lesson',
    enum: ['text', 'video', 'quiz', 'assignment'],
  })
  @IsOptional()
  @IsEnum(['text', 'video', 'quiz', 'assignment'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Content of the lesson (text, video URL, quiz data, etc.)',
  })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the lesson is published',
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Duration of the lesson in minutes',
  })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;
}
