// courses.controller.ts
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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Course } from './schemas/course.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course successfully created',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of courses' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter courses by status',
    enum: ['draft', 'published', 'archived'],
  })
  @ApiQuery({
    name: 'instructorId',
    required: false,
    description: 'Filter courses by instructor ID',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('instructorId') instructorId?: string,
  ): Promise<PaginationResult<Course>> {
    // Build filters
    const filters = {};
    if (status) {
      filters['status'] = status;
    }
    if (instructorId) {
      filters['instructor'] = instructorId;
    }
    return this.coursesService.findAll(paginationDto, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search courses by term' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results' })
  @ApiQuery({
    name: 'term',
    required: true,
    description: 'Search term',
  })
  async searchCourses(
    @Query() paginationDto: PaginationDto,
    @Query('term') term: string,
  ): Promise<PaginationResult<Course>> {
    return this.coursesService.searchCourses(term, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Course found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({
    summary: 'Get full course details with instructor, modules, and lessons',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course details retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async getCourseDetails(@Param('id') id: string): Promise<any> {
    return this.coursesService.getCourseDetails(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async getCourseStatistics(@Param('id') id: string): Promise<any> {
    return this.coursesService.getCourseStatistics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Course deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.coursesService.remove(id);
  }
}
