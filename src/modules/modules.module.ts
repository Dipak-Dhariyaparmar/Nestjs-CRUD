import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { Module as ModuleSchema, ModuleSchema } from './schemas/module.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleSchema.name, schema: ModuleSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
