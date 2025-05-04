import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentDocument = Student & Document;

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
export class Student {
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

  @Prop()
  dateOfBirth?: Date;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'] })
  status: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }] })
  enrolledCourses: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const StudentSchema = SchemaFactory.createForClass(Student);

// Add virtual fields
StudentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
