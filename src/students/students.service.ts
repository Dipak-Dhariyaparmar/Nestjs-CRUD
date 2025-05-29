import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Student, StudentDocument } from './schemas/student.schema';
import {
  Submission,
  SubmissionDocument,
} from '../submissions/schemas/submission.schema';
import { Grade, GradeDocument } from '../grades/schemas/grade.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Grade.name) private gradeModel: Model<GradeDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Create a new student
   */
  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Check if email already exists
    const existingStudent = await this.studentModel
      .findOne({ email: createStudentDto.email })
      .exec();
    if (existingStudent) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);

    const createdStudent = new this.studentModel({
      ...createStudentDto,
      password: hashedPassword,
    });

    return createdStudent.save();
  }

  /**
   * Find all students with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Student>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [result, total] = await Promise.all([
      this.studentModel
        .find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.studentModel.countDocuments(),
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

  /**
   * Find student by ID
   */
  async findOne(id: string): Promise<Student> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid student ID');
    }

    const student = await this.studentModel
      .findById(id)
      .select('-password')
      .exec();

    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    return student;
  }

  /**
   * Update student by ID
   */
  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid student ID');
    }

    // Check if email already exists for another student
    if (updateStudentDto.email) {
      const existingStudent = await this.studentModel
        .findOne({ email: updateStudentDto.email, _id: { $ne: id } })
        .exec();

      if (existingStudent) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if it exists in the update
    if (updateStudentDto.password) {
      updateStudentDto.password = await bcrypt.hash(
        updateStudentDto.password,
        10,
      );
    }

    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedStudent) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    return updatedStudent;
  }

  /**
   * Remove student by ID
   */
  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid student ID');
    }

    const result = await this.studentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
  }

  /**
   * Enroll student in a course
   */
  async enrollInCourse(studentId: string, courseId: string): Promise<Student> {
    const [student, course] = await Promise.all([
      this.studentModel.findById(studentId),
      this.courseModel.findById(courseId),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Check if student is already enrolled
    if (
      student.enrolledCourses &&
      student.enrolledCourses.includes(new Types.ObjectId(courseId))
    ) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    // Add course to student's enrolled courses
    student.enrolledCourses = [
      ...(student.enrolledCourses || []),
      new Types.ObjectId(courseId),
    ];

    // Increment course enrollment count
    course.enrollmentCount += 1;

    await Promise.all([student.save(), course.save()]);

    return student;
  }

  /**
   * Unenroll student from a course
   */
  async unenrollFromCourse(
    studentId: string,
    courseId: string,
  ): Promise<Student> {
    const [student, course] = await Promise.all([
      this.studentModel.findById(studentId),
      this.courseModel.findById(courseId),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Check if student is enrolled
    if (
      !student.enrolledCourses ||
      !student.enrolledCourses.includes(new Types.ObjectId(courseId))
    ) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    // Remove course from student's enrolled courses
    student.enrolledCourses = student.enrolledCourses.filter(
      (id) => id.toString() !== courseId,
    );

    // Decrement course enrollment count
    course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);

    await Promise.all([student.save(), course.save()]);

    return student;
  }

  /**
   * Get student enrollment details with course information
   */
  async getEnrollmentDetails(studentId: string): Promise<any> {
    const student = await this.studentModel.findById(studentId).exec();

    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const enrollmentDetails = await this.studentModel
      .aggregate([
        // Match the specific student
        { $match: { _id: new Types.ObjectId(studentId) } },
        // Lookup courses
        {
          $lookup: {
            from: 'courses',
            localField: 'enrolledCourses',
            foreignField: '_id',
            as: 'courses',
          },
        },
        // Unwind courses to process each course separately
        { $unwind: { path: '$courses', preserveNullAndEmptyArrays: true } },
        // Lookup instructors for each course
        {
          $lookup: {
            from: 'instructors',
            localField: 'courses.instructor',
            foreignField: '_id',
            as: 'courses.instructorDetails',
          },
        },
        // Convert instructor array to single object
        {
          $addFields: {
            'courses.instructorDetails': {
              $arrayElemAt: ['$courses.instructorDetails', 0],
            },
          },
        },
        // Lookup student's submissions for each course
        {
          $lookup: {
            from: 'submissions',
            let: {
              studentId: '$_id',
              courseId: '$courses._id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$student', '$$studentId'] },
                      { $eq: ['$course', '$$courseId'] },
                    ],
                  },
                },
              },
            ],
            as: 'courses.submissions',
          },
        },
        // Lookup student's grades for each course
        {
          $lookup: {
            from: 'grades',
            let: {
              studentId: '$_id',
              courseId: '$courses._id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$student', '$$studentId'] },
                      { $eq: ['$course', '$$courseId'] },
                    ],
                  },
                },
              },
            ],
            as: 'courses.grades',
          },
        },
        // Calculate student's progress and performance
        {
          $addFields: {
            'courses.progress': {
              $cond: {
                if: { $eq: [{ $size: '$courses.submissions' }, 0] },
                then: 0,
                else: {
                  $let: {
                    vars: {
                      totalAssignments: {
                        $size: {
                          $filter: {
                            input: '$courses.assignments',
                            as: 'assignment',
                            cond: { $eq: ['$assignment.status', 'active'] },
                          },
                        },
                      },
                    },
                    in: {
                      $multiply: [
                        {
                          $divide: [
                            { $size: '$courses.submissions' },
                            {
                              $cond: [
                                { $eq: ['$$totalAssignments', 0] },
                                1,
                                '$$totalAssignments',
                              ],
                            },
                          ],
                        },
                        100,
                      ],
                    },
                  },
                },
              },
            },
            'courses.averageGrade': {
              $cond: {
                if: { $eq: [{ $size: '$courses.grades' }, 0] },
                then: null,
                else: { $avg: '$courses.grades.score' },
              },
            },
          },
        },
        // Group back the courses
        {
          $group: {
            _id: '$_id',
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            email: { $first: '$email' },
            courses: { $push: '$courses' },
          },
        },
        // Filter out empty courses (if any)
        {
          $addFields: {
            courses: {
              $filter: {
                input: '$courses',
                as: 'course',
                cond: { $ifNull: ['$$course._id', false] },
              },
            },
          },
        },
        // Project final result
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            fullName: { $concat: ['$firstName', ' ', '$lastName'] },
            courses: {
              _id: 1,
              title: 1,
              description: 1,
              status: 1,
              startDate: 1,
              endDate: 1,
              instructor: 1,
              instructorDetails: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                fullName: {
                  $concat: [
                    '$courses.instructorDetails.firstName',
                    ' ',
                    '$courses.instructorDetails.lastName',
                  ],
                },
              },
              progress: 1,
              averageGrade: 1,
              submissionCount: { $size: '$courses.submissions' },
              gradedAssignments: { $size: '$courses.grades' },
            },
          },
        },
      ])
      .exec();

    if (!enrollmentDetails.length) {
      return {
        ...student.toJSON(),
        courses: [],
      };
    }

    return enrollmentDetails[0];
  }

  /**
   * Get student performance analytics
   */
  async getStudentPerformance(studentId: string): Promise<any> {
    const student = await this.studentModel.findById(studentId).exec();

    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const performance = await this.gradeModel
      .aggregate([
        // Match grades for the specific student
        { $match: { student: new Types.ObjectId(studentId) } },
        // Lookup assignments
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentDetails',
          },
        },
        // Unwind assignment details
        { $unwind: '$assignmentDetails' },
        // Lookup courses
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'courseDetails',
          },
        },
        // Unwind course details
        { $unwind: '$courseDetails' },
        // Group by course to get course-level performance
        {
          $group: {
            _id: '$course',
            courseTitle: { $first: '$courseDetails.title' },
            averageScore: { $avg: '$score' },
            totalAssignments: { $sum: 1 },
            assignments: {
              $push: {
                _id: '$assignment',
                title: '$assignmentDetails.title',
                score: '$score',
                totalPoints: '$assignmentDetails.totalPoints',
                percentageScore: {
                  $cond: [
                    { $eq: ['$assignmentDetails.totalPoints', 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: ['$score', '$assignmentDetails.totalPoints'],
                        },
                        100,
                      ],
                    },
                  ],
                },
                gradedAt: '$gradedAt',
              },
            },
          },
        },
        // Calculate overall performance
        {
          $group: {
            _id: null,
            overallAverage: { $avg: '$averageScore' },
            totalCompletedAssignments: { $sum: '$totalAssignments' },
            coursePerformance: { $push: '$$ROOT' },
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
              fullName: { $concat: [student.firstName, ' ', student.lastName] },
            },
            overallAverage: 1,
            totalCompletedAssignments: 1,
            coursePerformance: 1,
          },
        },
      ])
      .exec();

    if (!performance.length) {
      return {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
        },
        overallAverage: 0,
        totalCompletedAssignments: 0,
        coursePerformance: [],
      };
    }

    return performance[0];
  }

  /**
   * Get submission statistics for a student
   */
  async getSubmissionStatistics(studentId: string): Promise<any> {
    const student = await this.studentModel.findById(studentId).exec();

    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const submissionStats = await this.submissionModel
      .aggregate([
        // Match submissions for the specific student
        { $match: { student: new Types.ObjectId(studentId) } },
        // Lookup assignment details
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentDetails',
          },
        },
        // Unwind assignment details
        { $unwind: '$assignmentDetails' },
        // Group by submission status
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            submissions: {
              $push: {
                _id: '$_id',
                assignment: '$assignment',
                assignmentTitle: '$assignmentDetails.title',
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
              fullName: { $concat: [student.firstName, ' ', student.lastName] },
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

// this service is a student 
