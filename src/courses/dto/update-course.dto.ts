import {
  IsOptional,
  IsString,
  IsMongoId,
  IsDate,
  IsEnum,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Schema as MongooseSchema } from 'mongoose';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Title of the course' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the course' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Cover image URL for the course' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'ID of the instructor for this course' })
  @IsOptional()
  @IsMongoId()
  instructor?: MongooseSchema.Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Status of the course',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({ description: 'Start date of the course' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date of the course' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Tags associated with the course' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Current enrollment count' })
  @IsOptional()
  @IsNumber()
  enrollmentCount?: number;

  @ApiPropertyOptional({ description: 'Course settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
