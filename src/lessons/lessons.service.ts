// lessons.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Module, ModuleDocument } from '../modules/schemas/module.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Validate module exists
    const moduleExists = await this.moduleModel
      .findById(createLessonDto.module)
      .exec();

    if (!moduleExists) {
      throw new NotFoundException(
        `Module with ID "${createLessonDto.module}" not found`,
      );
    }

    // Validate course exists if provided
    if (createLessonDto.course) {
      const courseExists = await this.courseModel
        .findById(createLessonDto.course)
        .exec();

      if (!courseExists) {
        throw new NotFoundException(
          `Course with ID "${createLessonDto.course}" not found`,
        );
      }
    }

    // Check if lesson with same order exists for this module
    const existingLesson = await this.lessonModel
      .findOne({
        module: createLessonDto.module,
        order: createLessonDto.order,
      })
      .exec();

    if (existingLesson) {
      throw new ConflictException(
        `A lesson with order ${createLessonDto.order} already exists in this module`,
      );
    }

    const createdLesson = new this.lessonModel(createLessonDto);
    return createdLesson.save();
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<PaginationResult<Lesson>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.lessonModel.find(filters || {});

    const [result, total] = await Promise.all([
      query
        .populate('module', 'title')
        .populate('course', 'title')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lessonModel.countDocuments(filters || {}),
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

  async findOne(id: string): Promise<Lesson> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid lesson ID');
    }

    const lesson = await this.lessonModel
      .findById(id)
      .populate('module', 'title')
      .populate('course', 'title')
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid lesson ID');
    }

    // Validate module exists if module ID is being updated
    if (updateLessonDto.module) {
      const moduleExists = await this.moduleModel
        .findById(updateLessonDto.module)
        .exec();

      if (!moduleExists) {
        throw new NotFoundException(
          `Module with ID "${updateLessonDto.module}" not found`,
        );
      }
    }

    // Validate course exists if course ID is being updated
    if (updateLessonDto.course) {
      const courseExists = await this.courseModel
        .findById(updateLessonDto.course)
        .exec();

      if (!courseExists) {
        throw new NotFoundException(
          `Course with ID "${updateLessonDto.course}" not found`,
        );
      }
    }

    // Check if lesson with same order exists for this module
    if (updateLessonDto.order && updateLessonDto.module) {
      const existingLesson = await this.lessonModel
        .findOne({
          module: updateLessonDto.module,
          order: updateLessonDto.order,
          _id: { $ne: id },
        })
        .exec();

      if (existingLesson) {
        throw new ConflictException(
          `A lesson with order ${updateLessonDto.order} already exists in this module`,
        );
      }
    }

    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .populate('module', 'title')
      .populate('course', 'title')
      .exec();

    if (!updatedLesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }

    return updatedLesson;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid lesson ID');
    }

    const result = await this.lessonModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }
  }

  async findByModule(
    moduleId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Lesson>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.lessonModel.find({ module: moduleId });

    const [result, total] = await Promise.all([
      query
        .populate('module', 'title')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lessonModel.countDocuments({ module: moduleId }),
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
// this is a lessons services component
