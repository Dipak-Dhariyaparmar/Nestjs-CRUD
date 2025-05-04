// lessons.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Lesson } from './schemas/lesson.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lesson successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of lessons',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Lesson>> {
    return this.lessonsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lesson found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found',
  })
  async findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lesson updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Lesson deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.lessonsService.remove(id);
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get lessons by module' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lessons for the module',
  })
  async findByModule(
    @Param('moduleId') moduleId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Lesson>> {
    return this.lessonsService.findByModule(moduleId, paginationDto);
  }
}
