import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Module, ModuleDocument } from '../modules/schemas/module.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  /**
   * Create a new assignment
   */
  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    // Validate if course exists
    const courseExists = await this.courseModel
      .findById(createAssignmentDto.course)
      .exec();

    if (!courseExists) {
      throw new NotFoundException(
        `Course with ID "${createAssignmentDto.course}" not found`,
      );
    }

    // Validate module if provided
    if (createAssignmentDto.module) {
      const moduleExists = await this.moduleModel
        .findOne({
          _id: createAssignmentDto.module,
          course: createAssignmentDto.course,
        })
        .exec();

      if (!moduleExists) {
        throw new NotFoundException(
          `Module with ID "${createAssignmentDto.module}" not found in this course`,
        );
      }
    }

    // Validate lesson if provided
    if (createAssignmentDto.lesson) {
      const lessonExists = await this.lessonModel
        .findById(createAssignmentDto.lesson)
        .exec();

      if (!lessonExists) {
        throw new NotFoundException(
          `Lesson with ID "${createAssignmentDto.lesson}" not found`,
        );
      }

      // Ensure lesson belongs to the module if both are provided
      if (
        createAssignmentDto.module &&
        lessonExists.module.toString() !== createAssignmentDto.module.toString()
      ) {
        throw new BadRequestException(
          'Lesson does not belong to the specified module',
        );
      }
    }

    const createdAssignment = new this.assignmentModel(createAssignmentDto);
    return createdAssignment.save();
  }

  /**
   * Find all assignments with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<PaginationResult<Assignment>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = this.assignmentModel.find(filters || {});

    const [result, total] = await Promise.all([
      query
        .populate('course', 'title')
        .populate('module', 'title')
        .populate('lesson', 'title')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments(filters || {}),
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

  async findOne(id: string): Promise<Assignment> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid assignment ID');
    }

    const assignment = await this.assignmentModel
      .findById(id)
      .populate('course', 'title')
      .populate('module', 'title')
      .populate('lesson', 'title')
      .exec();

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID "${id}" not found`);
    }

    return assignment;
  }

  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid assignment ID');
    }

    // Validate course exists if course ID is being updated
    if (updateAssignmentDto.course) {
      const courseExists = await this.courseModel
        .findById(updateAssignmentDto.course)
        .exec();

      if (!courseExists) {
        throw new NotFoundException(
          `Course with ID "${updateAssignmentDto.course}" not found`,
        );
      }
    }

    // Validate module if provided
    if (updateAssignmentDto.module) {
      const moduleExists = await this.moduleModel
        .findOne({
          _id: updateAssignmentDto.module,
          course:
            updateAssignmentDto.course ||
            (await this.assignmentModel.findById(id)).course,
        })
        .exec();

      if (!moduleExists) {
        throw new NotFoundException(
          `Module with ID "${updateAssignmentDto.module}" not found in this course`,
        );
      }
    }

    // Validate lesson if provided
    if (updateAssignmentDto.lesson) {
      const lessonExists = await this.lessonModel
        .findById(updateAssignmentDto.lesson)
        .exec();

      if (!lessonExists) {
        throw new NotFoundException(
          `Lesson with ID "${updateAssignmentDto.lesson}" not found`,
        );
      }

      // Ensure lesson belongs to the module if both are provided
      if (
        updateAssignmentDto.module &&
        lessonExists.module.toString() !== updateAssignmentDto.module.toString()
      ) {
        throw new BadRequestException(
          'Lesson does not belong to the specified module',
        );
      }
    }

    const updatedAssignment = await this.assignmentModel
      .findByIdAndUpdate(id, updateAssignmentDto, { new: true })
      .populate('course', 'title')
      .populate('module', 'title')
      .populate('lesson', 'title')
      .exec();

    if (!updatedAssignment) {
      throw new NotFoundException(`Assignment with ID "${id}" not found`);
    }

    return updatedAssignment;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid assignment ID');
    }

    const result = await this.assignmentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Assignment with ID "${id}" not found`);
    }
  }

  async findByCourse(
    courseId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Assignment>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.assignmentModel.find({ course: courseId });

    const [result, total] = await Promise.all([
      query
        .populate('course', 'title')
        .populate('module', 'title')
        .populate('lesson', 'title')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments({ course: courseId }),
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
