import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ModuleDocument = Module & Document;

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
export class Module {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  order: number;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  durationMinutes?: number;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

// Add compound index for course and order
ModuleSchema.index({ course: 1, order: 1 }, { unique: true });
