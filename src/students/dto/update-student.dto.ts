import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsDate,
  IsEnum,
  IsObject,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Schema as MongooseSchema } from 'mongoose';

export class UpdateStudentDto {
  @ApiPropertyOptional({ description: 'First name of the student' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name of the student' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email address of the student' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Password for student account' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ description: 'Phone number of the student' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth of the student' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Status of the student account',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ description: 'Enrolled courses IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  enrolledCourses?: MongooseSchema.Types.ObjectId[];

  @ApiPropertyOptional({ description: 'Additional profile information' })
  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}
