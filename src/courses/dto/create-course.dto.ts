import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsDate,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the course' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Cover image URL for the course' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: 'ID of the instructor for this course' })
  @IsNotEmpty()
  @IsMongoId()
  instructor: MongooseSchema.Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Status of the course',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string = 'draft';

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

  @ApiPropertyOptional({ description: 'Course settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
