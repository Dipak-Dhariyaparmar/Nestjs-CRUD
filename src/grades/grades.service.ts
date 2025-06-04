import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Grade, GradeDocument } from './schemas/grade.schema';
import {
  Submission,
  SubmissionDocument,
} from '../submissions/schemas/submission.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/schemas/assignment.schema';
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class GradesService {
  constructor(
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    // Validate submission exists
    const submissionExists = await this.submissionModel
      .findById(createGradeDto.submission)
      .exec();

    if (!submissionExists) {
      throw new NotFoundException(
        `Submission with ID "${createGradeDto.submission}" not found`,
      );
    }

    // Validate student exists
    const studentExists = await this.studentModel
      .findById(createGradeDto.student)
      .exec();

    if (!studentExists) {
      throw new NotFoundException(
        `Student with ID "${createGradeDto.student}" not found`,
      );
    }

    // Validate assignment exists
    const assignmentExists = await this.assignmentModel
      .findById(createGradeDto.assignment)
      .exec();

    if (!assignmentExists) {
      throw new NotFoundException(
        `Assignment with ID "${createGradeDto.assignment}" not found`,
      );
    }

    // Validate instructor exists if provided
    if (createGradeDto.gradedBy) {
      const instructorExists = await this.instructorModel
        .findById(createGradeDto.gradedBy)
        .exec();

      if (!instructorExists) {
        throw new NotFoundException(
          `Instructor with ID "${createGradeDto.gradedBy}" not found`,
        );
      }
    }

    // Create grade
    const createdGrade = new this.gradeModel(createGradeDto);
    return createdGrade.save();
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<PaginationResult<Grade>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.gradeModel.find(filters || {});

    const [result, total] = await Promise.all([
      query
        .populate('student', 'firstName lastName email')
        .populate('assignment', 'title')
        .populate('gradedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.gradeModel.countDocuments(filters || {}),
    ]);

    return {
      items: result,
      meta: {
        totalItems: total,
        itemCount: result.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string): Promise<Grade> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid grade ID');
    }

    const grade = await this.gradeModel
      .findById(id)
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .populate('gradedBy', 'firstName lastName email')
      .exec();

    if (!grade) {
      throw new NotFoundException(`Grade with ID "${id}" not found`);
    }

    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid grade ID');
    }

    // Validate submission exists if updating submission
    if (updateGradeDto.submission) {
      const submissionExists = await this.submissionModel
        .findById(updateGradeDto.submission)
        .exec();

      if (!submissionExists) {
        throw new NotFoundException(
          `Submission with ID "${updateGradeDto.submission}" not found`,
        );
      }
    }

    // Validate student exists if updating student
    if (updateGradeDto.student) {
      const studentExists = await this.studentModel
        .findById(updateGradeDto.student)
        .exec();

      if (!studentExists) {
        throw new NotFoundException(
          `Student with ID "${updateGradeDto.student}" not found`,
        );
      }
    }

    // Validate assignment exists if updating assignment
    if (updateGradeDto.assignment) {
      const assignmentExists = await this.assignmentModel
        .findById(updateGradeDto.assignment)
        .exec();

      if (!assignmentExists) {
        throw new NotFoundException(
          `Assignment with ID "${updateGradeDto.assignment}" not found`,
        );
      }
    }

    // Validate instructor exists if updating gradedBy
    if (updateGradeDto.gradedBy) {
      const instructorExists = await this.instructorModel
        .findById(updateGradeDto.gradedBy)
        .exec();

      if (!instructorExists) {
        throw new NotFoundException(
          `Instructor with ID "${updateGradeDto.gradedBy}" not found`,
        );
      }
    }

    const updatedGrade = await this.gradeModel
      .findByIdAndUpdate(id, updateGradeDto, { new: true })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .populate('gradedBy', 'firstName lastName email')
      .exec();

    if (!updatedGrade) {
      throw new NotFoundException(`Grade with ID "${id}" not found`);
    }

    return updatedGrade;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid grade ID');
    }

    const result = await this.gradeModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Grade with ID "${id}" not found`);
    }
  }

  async findByStudent(
    studentId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Grade>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.gradeModel.find({ student: studentId });

    const [result, total] = await Promise.all([
      query
        .populate('assignment', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.gradeModel.countDocuments({ student: studentId }),
    ]);

    return {
      items: result,
      meta: {
        totalItems: total,
        itemCount: result.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findByAssignment(
    assignmentId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Grade>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.gradeModel.find({ assignment: assignmentId });

    const [result, total] = await Promise.all([
      query
        .populate('student', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.gradeModel.countDocuments({ assignment: assignmentId }),
    ]);

    return {
      items: result,
      meta: {
        totalItems: total,
        itemCount: result.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
// this is a grades services component
