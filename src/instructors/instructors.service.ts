// instructors.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Instructor, InstructorDocument } from './schemas/instructor.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    // Check if email already exists
    const existingInstructor = await this.instructorModel
      .findOne({ email: createInstructorDto.email })
      .exec();

    if (existingInstructor) {
      throw new ConflictException('Email already exists');
    }

    const createdInstructor = new this.instructorModel(createInstructorDto);
    return createdInstructor.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Instructor>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [result, total] = await Promise.all([
      this.instructorModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.instructorModel.countDocuments(),
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

  async findOne(id: string): Promise<Instructor> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid instructor ID');
    }

    const instructor = await this.instructorModel.findById(id).exec();

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID "${id}" not found`);
    }

    return instructor;
  }

  async update(
    id: string,
    updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid instructor ID');
    }

    // Check if email already exists for another instructor
    if (updateInstructorDto.email) {
      const existingInstructor = await this.instructorModel
        .findOne({ email: updateInstructorDto.email, _id: { $ne: id } })
        .exec();

      if (existingInstructor) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedInstructor = await this.instructorModel
      .findByIdAndUpdate(id, updateInstructorDto, { new: true })
      .exec();

    if (!updatedInstructor) {
      throw new NotFoundException(`Instructor with ID "${id}" not found`);
    }

    return updatedInstructor;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid instructor ID');
    }

    const result = await this.instructorModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Instructor with ID "${id}" not found`);
    }
  }

  async getCourses(
    id: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Course>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const instructor = await this.instructorModel
      .findById(id)
      .populate({
        path: 'courses',
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
        },
      })
      .exec();

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID "${id}" not found`);
    }

    const total = instructor.courses.length;

    return {
      items: instructor.courses,
      meta: {
        totalItems: total,
        itemCount: instructor.courses.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async addCourse(instructorId: string, courseId: string): Promise<Instructor> {
    const [instructor, course] = await Promise.all([
      this.instructorModel.findById(instructorId),
      this.courseModel.findById(courseId),
    ]);

    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID "${instructorId}" not found`,
      );
    }

    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Check if instructor is already assigned to this course
    if (course.instructor && course.instructor.toString() === instructorId) {
      throw new ConflictException(
        'Instructor is already assigned to this course',
      );
    }

    // Update course's instructor field
    course.instructor = new Types.ObjectId(instructorId);

    // Add course to instructor's courses array if not already present
    if (!instructor.courses.includes(new Types.ObjectId(courseId))) {
      instructor.courses.push(new Types.ObjectId(courseId));
    }

    await Promise.all([course.save(), instructor.save()]);

    return instructor;
  }
}
// this is a instructors services component
