import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Module, ModuleDocument } from './schemas/module.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    // Validate course exists
    const courseExists = await this.courseModel
      .findById(createModuleDto.course)
      .exec();

    if (!courseExists) {
      throw new NotFoundException(
        `Course with ID "${createModuleDto.course}" not found`,
      );
    }

    // Check if module with same order exists for this course
    const existingModule = await this.moduleModel
      .findOne({
        course: createModuleDto.course,
        order: createModuleDto.order,
      })
      .exec();

    if (existingModule) {
      throw new ConflictException(
        `A module with order ${createModuleDto.order} already exists for this course`,
      );
    }

    const createdModule = new this.moduleModel(createModuleDto);
    return createdModule.save();
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<PaginationResult<Module>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.moduleModel.find(filters || {});

    const [result, total] = await Promise.all([
      query
        .populate('course', 'title')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.moduleModel.countDocuments(filters || {}),
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

  async findOne(id: string): Promise<Module> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid module ID');
    }

    const module = await this.moduleModel
      .findById(id)
      .populate('course', 'title')
      .exec();

    if (!module) {
      throw new NotFoundException(`Module with ID "${id}" not found`);
    }

    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid module ID');
    }

    // Validate course exists if course ID is being updated
    if (updateModuleDto.course) {
      const courseExists = await this.courseModel
        .findById(updateModuleDto.course)
        .exec();

      if (!courseExists) {
        throw new NotFoundException(
          `Course with ID "${updateModuleDto.course}" not found`,
        );
      }
    }

    // Check if module with same order exists for this course
    if (updateModuleDto.order && updateModuleDto.course) {
      const existingModule = await this.moduleModel
        .findOne({
          course: updateModuleDto.course,
          order: updateModuleDto.order,
          _id: { $ne: id },
        })
        .exec();

      if (existingModule) {
        throw new ConflictException(
          `A module with order ${updateModuleDto.order} already exists for this course`,
        );
      }
    }

    const updatedModule = await this.moduleModel
      .findByIdAndUpdate(id, updateModuleDto, { new: true })
      .populate('course', 'title')
      .exec();

    if (!updatedModule) {
      throw new NotFoundException(`Module with ID "${id}" not found`);
    }

    return updatedModule;
  }

  async remove(id: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid module ID');
    }

    // Check if module has lessons
    const hasLessons = await this.lessonModel.exists({ module: id }).exec();

    if (hasLessons) {
      throw new BadRequestException(
        'Cannot delete module with associated lessons',
      );
    }

    const result = await this.moduleModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Module with ID "${id}" not found`);
    }
  }

  async findByCourse(
    courseId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<Module>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.moduleModel.find({ course: courseId });

    const [result, total] = await Promise.all([
      query
        .populate('course', 'title')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.moduleModel.countDocuments({ course: courseId }),
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
// this is a modules services component
