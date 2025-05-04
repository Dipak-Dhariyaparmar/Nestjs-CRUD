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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Grade } from './schemas/grade.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Grade successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async create(@Body() createGradeDto: CreateGradeDto): Promise<Grade> {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grades with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of grades',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Grade>> {
    return this.gradesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grade by ID' })
  @ApiParam({ name: 'id', description: 'Grade ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grade found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Grade not found',
  })
  async findOne(@Param('id') id: string): Promise<Grade> {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grade' })
  @ApiParam({ name: 'id', description: 'Grade ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grade updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Grade not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ): Promise<Grade> {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a grade' })
  @ApiParam({ name: 'id', description: 'Grade ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Grade deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Grade not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.gradesService.remove(id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get grades by student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grades for the student',
  })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Grade>> {
    return this.gradesService.findByStudent(studentId, paginationDto);
  }

  @Get('assignment/:assignmentId')
  @ApiOperation({ summary: 'Get grades by assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grades for the assignment',
  })
  async findByAssignment(
    @Param('assignmentId') assignmentId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Grade>> {
    return this.gradesService.findByAssignment(assignmentId, paginationDto);
  }
}
