import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type GradeDocument = Grade & Document;

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
export class Grade {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Submission',
  })
  submission: MongooseSchema.Types.ObjectId;

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

  @Prop({ required: true, min: 0 })
  score: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Instructor' })
  gradedBy: MongooseSchema.Types.ObjectId;

  @Prop()
  gradedAt: Date;

  @Prop()
  feedback?: string;

  @Prop({ type: [{ type: Object }] })
  rubricScores?: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    feedback?: string;
  }>;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);

// Add compound index for student and assignment
GradeSchema.index({ submission: 1 }, { unique: true });
