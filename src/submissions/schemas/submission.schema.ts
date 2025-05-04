import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SubmissionDocument = Submission & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Submission {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Student' })
  student: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Assignment',
  })
  assignment: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  course: MongooseSchema.Types.ObjectId;

  @Prop({
    default: 'submitted',
    enum: ['draft', 'submitted', 'resubmitted', 'returned'],
  })
  status: string;

  @Prop({ type: Object })
  content: {
    text?: string;
    fileUrls?: string[];
    links?: string[];
  };

  @Prop()
  submittedAt: Date;

  @Prop({ default: 1 })
  attemptNumber: number;

  @Prop({ default: false })
  isLate: boolean;

  @Prop({ type: Object })
  feedback?: {
    text?: string;
    fileUrls?: string[];
    createdAt?: Date;
  };
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

// Add compound index for student and assignment
SubmissionSchema.index(
  { student: 1, assignment: 1, attemptNumber: 1 },
  { unique: true },
);
