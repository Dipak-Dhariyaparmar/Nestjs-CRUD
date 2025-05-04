import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Grade, GradeSchema } from './schemas/grade.schema';
import {
  Submission,
  SubmissionSchema,
} from '../submissions/schemas/submission.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/schemas/assignment.schema';
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Grade.name, schema: GradeSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
