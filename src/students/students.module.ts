import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student, StudentSchema } from './schemas/student.schema';
import {
  Submission,
  SubmissionSchema,
} from '../submissions/schemas/submission.schema';
import { Grade, GradeSchema } from '../grades/schemas/grade.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/schemas/assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: Grade.name, schema: GradeSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
