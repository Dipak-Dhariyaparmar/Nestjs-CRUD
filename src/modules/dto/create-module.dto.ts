import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsInt,
  Min,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ description: 'Title of the module' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the module' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Course ID this module belongs to' })
  @IsNotEmpty()
  @IsMongoId()
  course: string;

  @ApiProperty({ description: 'Order number of the module' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;

  @ApiPropertyOptional({
    description: 'Whether the module is published',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;
}
