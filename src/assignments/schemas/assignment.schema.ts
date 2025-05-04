import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

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
export class Assignment {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Module' })
  module?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' })
  lesson?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'archived'] })
  status: string;

  @Prop({ type: [{ type: Object }] })
  resources?: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  @Prop({ type: Object })
  submissionSettings: {
    allowLateSubmissions?: boolean;
    maxAttempts?: number;
    submissionType?: string; // file, text, url, etc.
    fileTypes?: string[];
    maxFileSize?: number;
  };
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
