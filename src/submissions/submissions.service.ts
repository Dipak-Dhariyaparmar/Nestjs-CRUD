import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/schemas/assignment.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';
import { Grade, GradeDocument } from '../grades/schemas/grade.schema';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    // Validate student exists
    const studentExists = await this.studentModel
      .findById(createSubmissionDto.student)
      .exec();

    if (!studentExists) {
      throw new NotFoundException(
        `Student with ID "${createSubmissionDto.student}" not found`,
      );
    }

    // Validate assignment exists
    const assignmentExists = await this.assignmentModel
      .findById(createSubmissionDto.assignment)
      .exec();

    if (!assignmentExists) {
      throw new NotFoundException(
        `Assignment with ID "${createSubmissionDto.assignment}" not found`,
      );
    }

    // Validate course exists if provided
    if (createSubmissionDto.course) {
      const courseExists = await this.assignmentModel
        .findById(createSubmissionDto.course)
        .exec();

      if (!courseExists) {
        throw new NotFoundException(
          `Course with ID "${createSubmissionDto.course}" not found`,
        );
      }
    }

    const createdSubmission = new this.submissionModel(createSubmissionDto);
    return createdSubmission.save();
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<PaginationResult<Submission>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.submissionModel.find(filters || {});

    const [result, total] = await Promise.all([
      query
        .populate('student', 'firstName lastName email')
        .populate('assignment', 'title')
        .populate('course', 'title')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.submissionModel.countDocuments(filters || {}),
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

  async findOne(id: string): Promise<Submission> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid submission ID');
    }

    const submission = await this.submissionModel
      .findById(id)
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .populate('course', 'title')
      .exec();

    if (!submission) {
      throw new NotFoundException(`Submission with ID "${id}" not found`);
    }

    return submission;
  }

  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto,
  ): Promise<Submission> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid submission ID');
    }

    // Validate student exists if student ID is being updated
    if (updateSubmissionDto.student) {
      const studentExists = await this.studentModel
        .findById(updateSubmissionDto.student)
        .exec();

      if (!studentExists) {
        throw new NotFoundException(
          `Student with ID "${updateSubmissionDto.student}" not found`,
        );
      }
    }

    // Validate assignment exists if assignment ID is being updated
    if (updateSubmissionDto.assignment) {
      const assignmentExists = await this.assignmentModel
        .findById(updateSubmissionDto.assignment)
        .exec();

      if (!assignmentExists) {
        throw new NotFoundException(
          `Assignment with ID "${updateSubmissionDto.assignment}" not found`,
        );
      }
    }

    // Validate course exists if course ID is being updated
    if (updateSubmissionDto.course) {
      const courseExists = await this.assignmentModel
        .findById(updateSubmissionDto.course)
        .exec();

      if (!courseExists) {
        throw new NotFoundException(
          `Course with ID "${updateSubmissionDto.course}" not found`,
        );
      }
    }

    const updatedSubmission = await this.submissionModel
      .findByIdAndUpdate(id, updateSubmissionDto, { new: true })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .populate('course', 'title')
      .exec();

    if (!updatedSubmission) {
      throw new NotFoundException(`Submission with ID "${id}" not found`);
    }

    return updatedSubmission;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid submission ID');
    }

    const result = await this.submissionModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Submission with ID "${id}" not found`);
    }
  }

  async findByStudent(
    studentId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Submission>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.submissionModel.find({ student: studentId });

    const [result, total] = await Promise.all([
      query
        .populate('assignment', 'title')
        .populate('course', 'title')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.submissionModel.countDocuments({ student: studentId }),
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
  ): Promise<PaginationResult<Submission>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.submissionModel.find({ assignment: assignmentId });

    const [result, total] = await Promise.all([
      query
        .populate('student', 'firstName lastName email')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.submissionModel.countDocuments({ assignment: assignmentId }),
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

  async findByStudentAndAssignment(
    studentId: string,
    assignmentId: string,
  ): Promise<Submission> {
    const submission = await this.submissionModel
      .findOne({ student: studentId, assignment: assignmentId })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .populate('course', 'title')
      .exec();

    if (!submission) {
      throw new NotFoundException(
        `No submission found for student ${studentId} and assignment ${assignmentId}`,
      );
    }

    return submission;
  }

  async addFeedback(
    id: string,
    feedback: {
      text?: string;
      fileUrls?: string[];
    },
  ): Promise<Submission> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid submission ID');
    }

    // Add feedback timestamp
    const updateData = {
      feedback: {
        ...feedback,
        createdAt: new Date(),
      },
      status: 'returned',
    };

    const updatedSubmission = await this.submissionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .populate('course', 'title')
      .exec();

    if (!updatedSubmission) {
      throw new NotFoundException(`Submission with ID "${id}" not found`);
    }

    return updatedSubmission;
  }

  async getSubmissionStatistics(studentId: string): Promise<any> {
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const submissionStats = await this.submissionModel
      .aggregate([
        // Match submissions for the specific student
        { $match: { student: new Types.ObjectId(studentId) } },
        // Group by submission status
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            submissions: {
              $push: {
                _id: '$_id',
                assignment: '$assignment',
                status: '$status',
                submittedAt: '$submittedAt',
                isLate: '$isLate',
              },
            },
          },
        },
        // Group to create final statistics
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: '$count' },
            statusBreakdown: {
              $push: {
                status: '$_id',
                count: '$count',
                submissions: '$submissions',
              },
            },
          },
        },
        // Add late submissions count
        {
          $lookup: {
            from: 'submissions',
            let: {},
            pipeline: [
              {
                $match: {
                  student: new Types.ObjectId(studentId),
                  isLate: true,
                },
              },
              { $count: 'count' },
            ],
            as: 'lateSubmissions',
          },
        },
        // Format late submissions count
        {
          $addFields: {
            lateSubmissionsCount: {
              $cond: {
                if: { $eq: [{ $size: '$lateSubmissions' }, 0] },
                then: 0,
                else: { $arrayElemAt: ['$lateSubmissions.count', 0] },
              },
            },
          },
        },
        // Project final result
        {
          $project: {
            _id: 0,
            student: {
              _id: new Types.ObjectId(studentId),
              firstName: student.firstName,
              lastName: student.lastName,
              fullName: `${student.firstName} ${student.lastName}`,
            },
            totalSubmissions: 1,
            lateSubmissionsCount: 1,
            statusBreakdown: 1,
          },
        },
      ])
      .exec();

    if (!submissionStats.length) {
      return {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
        },
        totalSubmissions: 0,
        lateSubmissionsCount: 0,
        statusBreakdown: [],
      };
    }

    return submissionStats[0];
  }
}
