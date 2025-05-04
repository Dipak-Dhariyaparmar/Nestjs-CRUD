import {
  IsOptional,
  IsString,
  IsMongoId,
  IsInt,
  Min,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateModuleDto {
  @ApiPropertyOptional({ description: 'Title of the module' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the module' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Course ID this module belongs to' })
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional({ description: 'Order number of the module' })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @ApiPropertyOptional({ description: 'Whether the module is published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;
}
