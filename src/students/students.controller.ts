// students.controller.ts
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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Student } from './schemas/student.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Student successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all students with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of students',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Student>> {
    return this.studentsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  async findOne(@Param('id') id: string): Promise<Student> {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Student deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.studentsService.remove(id);
  }

  @Post(':id/enroll/:courseId')
  @ApiOperation({ summary: 'Enroll a student in a course' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student enrolled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student or course not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Student already enrolled in course',
  })
  async enrollInCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ): Promise<Student> {
    return this.studentsService.enrollInCourse(id, courseId);
  }

  @Post(':id/unenroll/:courseId')
  @ApiOperation({ summary: 'Unenroll a student from a course' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student unenrolled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student or course not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Student not enrolled in course',
  })
  async unenrollFromCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ): Promise<Student> {
    return this.studentsService.unenrollFromCourse(id, courseId);
  }

  @Get(':id/dashboard')
  @ApiOperation({
    summary: 'Get student dashboard with courses, progress, and grades',
  })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  async getStudentDashboard(@Param('id') id: string): Promise<any> {
    return this.studentsService.getEnrollmentDetails(id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get student performance analytics' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student performance data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  async getStudentPerformance(@Param('id') id: string): Promise<any> {
    return this.studentsService.getStudentPerformance(id);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get student submission statistics' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student submission statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  async getSubmissionStatistics(@Param('id') id: string): Promise<any> {
    return this.studentsService.getSubmissionStatistics(id);
  }
}
