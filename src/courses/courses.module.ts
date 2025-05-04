// courses.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import {
  Module as CourseModule,
  ModuleSchema,
} from '../modules/schemas/module.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/schemas/assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: ModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
