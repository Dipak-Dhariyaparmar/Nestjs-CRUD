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
    HttpCode 
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiQuery 
  } from '@nestjs/swagger';
  import { SubmissionsService } from './submissions.service';
  import { CreateSubmissionDto } from './dto/create-submission.dto';
  import { UpdateSubmissionDto } from './dto/update-submission.dto';
  import { PaginationDto } from '../common/dto/pagination.dto';
  import { Submission } from './schemas/submission.schema';
  import { PaginationResult } from '../common/interfaces/pagination-result.interface';
  
  @ApiTags('submissions')
  @Controller('submissions')
  export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new submission' })
    @ApiResponse({ 
      status: HttpStatus.CREATED, 
      description: 'Submission successfully created' 
    })
    @ApiResponse({ 
      status: HttpStatus.BAD_REQUEST, 
      description: 'Bad request' 
    })
    async create(@Body() createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
      return this.submissionsService.create(createSubmissionDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all submissions with pagination' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'List of submissions' 
    })
    async findAll(
      @Query() paginationDto: PaginationDto,
    ): Promise<PaginationResult<Submission>> {
      return this.submissionsService.findAll(paginationDto);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a submission by ID' })
    @ApiParam({ name: 'id', description: 'Submission ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Submission found' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Submission not found' 
    })
    async findOne(@Param('id') id: string): Promise<Submission> {
      return this.submissionsService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a submission' })
    @ApiParam({ name: 'id', description: 'Submission ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Submission updated successfully' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Submission not found' 
    })
    @ApiResponse({ 
      status: HttpStatus.BAD_REQUEST, 
      description: 'Bad request' 
    })
    async update(
      @Param('id') id: string,
      @Body() updateSubmissionDto: UpdateSubmissionDto,
    ): Promise<Submission> {
      return this.submissionsService.update(id, updateSubmissionDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a submission' })
    @ApiParam({ name: 'id', description: 'Submission ID' })
    @ApiResponse({ 
      status: HttpStatus.NO_CONTENT, 
      description: 'Submission deleted successfully' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Submission not found' 
    })
    async remove(@Param('id') id: string): Promise<void> {
      await this.submissionsService.remove(id);
    }
  
    @Get('student/:studentId')
    @ApiOperation({ summary: 'Get submissions by student' })
    @ApiParam({ name: 'studentId', description: 'Student ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Submissions for the student' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Student not found' 
    })
    async findByStudent(
      @Param('studentId') studentId: string,
      @Query() paginationDto: PaginationDto,
    ): Promise<PaginationResult<Submission>> {
      return this.submissionsService.findByStudent(studentId, paginationDto);
    }
  
    @Get('assignment/:assignmentId')
    @ApiOperation({ summary: 'Get submissions by assignment' })
    @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Submissions for the assignment' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Assignment not found' 
    })
    async findByAssignment(
      @Param('assignmentId') assignmentId: string,
      @Query() paginationDto: PaginationDto,
    ): Promise<PaginationResult<Submission>> {
      return this.submissionsService.findByAssignment(assignmentId, paginationDto);
    }
  
    @Get('student/:studentId/assignment/:assignmentId')
    @ApiOperation({ summary: 'Get a student's submission for an assignment' })
    @ApiParam({ name: 'studentId', description: 'Student ID' })
    @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Submission found' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Submission not found' 
    })
    async findByStudentAndAssignment(
      @Param('studentId') studentId: string,
      @Param('assignmentId') assignmentId: string,
    ): Promise<Submission> {
      return this.submissionsService.findByStudentAndAssignment(studentId, assignmentId);
    }
  
    @Patch(':id/feedback')
    @ApiOperation({ summary: 'Add feedback to a submission' })
    @ApiParam({ name: 'id', description: 'Submission ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Feedback added successfully' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Submission not found' 
    })
    async addFeedback(
      @Param('id') id: string,
      @Body('feedback') feedback: {
        text?: string;
        fileUrls?: string[];
      },
    ): Promise<Submission> {
      return this.submissionsService.addFeedback(id, feedback);
    }
  
    @Get('statistics/student/:studentId')
    @ApiOperation({ summary: 'Get submission statistics for a student' })
    @ApiParam({ name: 'studentId', description: 'Student ID' })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Submission statistics retrieved successfully' 
    })
    @ApiResponse({ 
      status: HttpStatus.NOT_FOUND, 
      description: 'Student not found' 
    })
    async getSubmissionStatistics(
      @Param('studentId') studentId: string,
    ): Promise<any> {
      return this.submissionsService.getSubmissionStatistics(studentId);
    }
  }
    