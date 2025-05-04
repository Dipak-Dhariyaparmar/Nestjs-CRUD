import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ description: 'Title of the lesson' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the lesson' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Module ID this lesson belongs to' })
  @IsNotEmpty()
  @IsMongoId()
  module: string;

  @ApiPropertyOptional({ description: 'Course ID this lesson belongs to' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiProperty({
    description: 'Order of the lesson within the module',
    default: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'Type of the lesson',
    enum: ['text', 'video', 'quiz', 'assignment'],
    default: 'text',
  })
  @IsNotEmpty()
  @IsEnum(['text', 'video', 'quiz', 'assignment'])
  type: string;

  @ApiPropertyOptional({
    description: 'Content of the lesson (text, video URL, quiz data, etc.)',
  })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the lesson is published',
    default: false,
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
