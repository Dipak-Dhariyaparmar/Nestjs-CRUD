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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Assignment } from './schemas/assignment.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Assignment successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async create(
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assignments with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assignments',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Assignment>> {
    return this.assignmentsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Assignment not found',
  })
  async findOne(@Param('id') id: string): Promise<Assignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Assignment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Assignment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Assignment not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.assignmentsService.remove(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get assignments by course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignments for the course',
  })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Assignment>> {
    return this.assignmentsService.findByCourse(courseId, paginationDto);
  }
}
