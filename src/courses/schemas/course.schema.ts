import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Instructor } from '../../instructors/schemas/instructor.schema';

export type CourseDocument = Course & Document;

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
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  coverImage?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Instructor',
    required: true,
  })
  instructor: Instructor | MongooseSchema.Types.ObjectId;

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: 0 })
  enrollmentCount: number;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Add index for better search performance
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });
