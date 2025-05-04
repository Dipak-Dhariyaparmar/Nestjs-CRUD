// instructors.controller.ts
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
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Instructor } from './schemas/instructor.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new instructor' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Instructor successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async create(
    @Body() createInstructorDto: CreateInstructorDto,
  ): Promise<Instructor> {
    return this.instructorsService.create(createInstructorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all instructors with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of instructors',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Instructor>> {
    return this.instructorsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an instructor by ID' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Instructor found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Instructor not found',
  })
  async findOne(@Param('id') id: string): Promise<Instructor> {
    return this.instructorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an instructor' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Instructor updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Instructor not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    return this.instructorsService.update(id, updateInstructorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an instructor' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Instructor deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Instructor not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.instructorsService.remove(id);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses taught by an instructor' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Courses taught by the instructor',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Instructor not found',
  })
  async getCourses(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<any>> {
    return this.instructorsService.getCourses(id, paginationDto);
  }

  @Post(':id/add-course/:courseId')
  @ApiOperation({ summary: 'Add a course to an instructor' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Instructor or course not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Instructor already assigned to course',
  })
  async addCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ): Promise<Instructor> {
    return this.instructorsService.addCourse(id, courseId);
  }
}
