import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/schemas/assignment.schema';
import { Grade, GradeSchema } from '../grades/schemas/grade.schema';
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Grade.name, schema: GradeSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
