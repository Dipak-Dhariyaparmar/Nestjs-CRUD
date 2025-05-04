import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InstructorDocument = Instructor & Document;

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
export class Instructor {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone?: string;

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string;

  @Prop()
  bio?: string;

  @Prop()
  specialization?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }] })
  courses: MongooseSchema.Types.ObjectId[];

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);

// Add virtual fields
InstructorSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
