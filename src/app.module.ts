import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { StudentsModule } from './students/students.module';
import { GradesModule } from './grades/grades.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { LessonsModule } from './lessons/lessons.module';
import { ModulesModule } from './modules/modules.module';
import { CoursesModule } from './courses/courses.module';
import { InstructorsModule } from './instructors/instructors.module';
import { InstructorsModule } from './instructors/instructors.module';
import { CoursesModule } from './courses/courses.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { GradesModule } from './grades/grades.module';
import { StudentsModule } from './students/students.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    StudentsModule,
    InstructorsModule,
    CoursesModule,
    ModulesModule,
    LessonsModule,
    AssignmentsModule,
    SubmissionsModule,
    GradesModule,
  ],
})
export class AppModule {}
