import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Module, ModuleDocument } from '../modules/schemas/module.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/schemas/assignment.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
  ) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Validate if instructor exists
    const instructor = await this.instructorModel
      .findById(createCourseDto.instructor)
      .exec();

    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID "${createCourseDto.instructor}" not found`,
      );
    }

    const createdCourse = new this.courseModel(createCourseDto);
    const savedCourse = await createdCourse.save();

    // Add course to instructor's courses array
    if (!instructor.courses) {
      instructor.courses = [];
    }
    instructor.courses.push(savedCourse._id);
    await instructor.save();

    return savedCourse;
  }

  /**
   * Find all courses with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<PaginationResult<Course>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = this.courseModel.find(filters || {});

    const [result, total] = await Promise.all([
      query
        .populate('instructor', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments(filters || {}),
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
   * Find course by ID
   */
  async findOne(id: string): Promise<Course> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel
      .findById(id)
      .populate('instructor', 'firstName lastName email')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return course;
  }

  /**
   * Update course by ID
   */
  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid course ID');
    }

    // If instructor is being updated, check if new instructor exists
    if (updateCourseDto.instructor) {
      const instructorExists = await this.instructorModel
        .findById(updateCourseDto.instructor)
        .exec();

      if (!instructorExists) {
        throw new NotFoundException(
          `Instructor with ID "${updateCourseDto.instructor}" not found`,
        );
      }

      // Get current course to update instructor references
      const currentCourse = await this.courseModel.findById(id).exec();
      if (
        currentCourse &&
        currentCourse.instructor &&
        currentCourse.instructor.toString() !==
          updateCourseDto.instructor.toString()
      ) {
        // Remove course from old instructor's courses array
        await this.instructorModel.updateOne(
          { _id: currentCourse.instructor },
          { $pull: { courses: new Types.ObjectId(id) } },
        );

        // Add course to new instructor's courses array
        await this.instructorModel.updateOne(
          { _id: updateCourseDto.instructor },
          { $addToSet: { courses: new Types.ObjectId(id) } },
        );
      }
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .populate('instructor', 'firstName lastName email')
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return updatedCourse;
  }

  /**
   * Remove course by ID
   */
  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    // Remove course reference from instructor
    if (course.instructor) {
      await this.instructorModel.updateOne(
        { _id: course.instructor },
        { $pull: { courses: new Types.ObjectId(id) } },
      );
    }

    // Delete associated modules, lessons, and assignments
    await Promise.all([
      this.moduleModel.deleteMany({ course: new Types.ObjectId(id) }),
      this.lessonModel.deleteMany({ course: new Types.ObjectId(id) }),
      this.assignmentModel.deleteMany({ course: new Types.ObjectId(id) }),
      this.courseModel.findByIdAndDelete(id).exec(),
    ]);
  }

  /**
   * Get full course details with instructor, modules, and lessons
   */
  async getCourseDetails(id: string): Promise<any> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid course ID');
    }

    const courseDetails = await this.courseModel
      .aggregate([
        // Match the specific course
        { $match: { _id: new Types.ObjectId(id) } },
        // Lookup instructor
        {
          $lookup: {
            from: 'instructors',
            localField: 'instructor',
            foreignField: '_id',
            as: 'instructorDetails',
          },
        },
        // Convert instructor array to single object
        {
          $addFields: {
            instructorDetails: { $arrayElemAt: ['$instructorDetails', 0] },
          },
        },
        // Lookup modules
        {
          $lookup: {
            from: 'modules',
            localField: '_id',
            foreignField: 'course',
            as: 'modules',
          },
        },
        // Sort modules by order
        {
          $addFields: {
            modules: {
              $sortArray: {
                input: '$modules',
                sortBy: { order: 1 },
              },
            },
          },
        },
        // Lookup lessons for each module
        {
          $lookup: {
            from: 'lessons',
            localField: 'modules._id',
            foreignField: 'module',
            as: 'allLessons',
          },
        },
        // Add lessons to their respective modules
        {
          $addFields: {
            modules: {
              $map: {
                input: '$modules',
                as: 'module',
                in: {
                  $mergeObjects: [
                    '$$module',
                    {
                      lessons: {
                        $sortArray: {
                          input: {
                            $filter: {
                              input: '$allLessons',
                              as: 'lesson',
                              cond: {
                                $eq: ['$$lesson.module', '$$module._id'],
                              },
                            },
                          },
                          sortBy: { order: 1 },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        // Lookup assignments
        {
          $lookup: {
            from: 'assignments',
            localField: '_id',
            foreignField: 'course',
            as: 'assignments',
          },
        },
        // Project the final result
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            coverImage: 1,
            status: 1,
            startDate: 1,
            endDate: 1,
            enrollmentCount: 1,
            tags: 1,
            settings: 1,
            createdAt: 1,
            updatedAt: 1,
            instructor: {
              _id: '$instructorDetails._id',
              firstName: '$instructorDetails.firstName',
              lastName: '$instructorDetails.lastName',
              email: '$instructorDetails.email',
              fullName: {
                $concat: [
                  '$instructorDetails.firstName',
                  ' ',
                  '$instructorDetails.lastName',
                ],
              },
            },
            modules: {
              _id: 1,
              title: 1,
              description: 1,
              order: 1,
              isPublished: 1,
              durationMinutes: 1,
              lessons: {
                _id: 1,
                title: 1,
                description: 1,
                order: 1,
                type: 1,
                content: 1,
                isPublished: 1,
                durationMinutes: 1,
              },
            },
            assignments: {
              _id: 1,
              title: 1,
              description: 1,
              dueDate: 1,
              totalPoints: 1,
              status: 1,
            },
            allLessons: 0,
          },
        },
      ])
      .exec();

    if (!courseDetails.length) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return courseDetails[0];
  }

  /**
   * Search courses
   */
  async searchCourses(
    searchTerm: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Course>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = {
      $text: { $search: searchTerm },
    };

    const [result, total] = await Promise.all([
      this.courseModel
        .find(query)
        .populate('instructor', 'firstName lastName email')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments(query),
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
   * Get course statistics
   */
  async getCourseStatistics(id: string): Promise<any> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    const [modulesCount, lessonsCount, assignmentsCount] = await Promise.all([
      this.moduleModel.countDocuments({ course: new Types.ObjectId(id) }),
      this.lessonModel.countDocuments({ course: new Types.ObjectId(id) }),
      this.assignmentModel.countDocuments({ course: new Types.ObjectId(id) }),
    ]);

    return {
      course: {
        _id: course._id,
        title: course.title,
        status: course.status,
        enrollmentCount: course.enrollmentCount,
      },
      modulesCount,
      lessonsCount,
      assignmentsCount,
      totalContentItems: modulesCount + lessonsCount + assignmentsCount,
    };
  }
}
// this is a courses services component
