import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  Module as CourseModule,
  ModuleSchema,
} from '../modules/schemas/module.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: ModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
