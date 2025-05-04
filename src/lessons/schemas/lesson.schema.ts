import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LessonDocument = Lesson & Document;

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
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Module' })
  module: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  order: number;

  @Prop({ default: 'text', enum: ['text', 'video', 'quiz', 'assignment'] })
  type: string;

  @Prop({ type: Object })
  content: Record<string, any>;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  durationMinutes?: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Add compound index for module and order
LessonSchema.index({ module: 1, order: 1 }, { unique: true });
