import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  parentId?: mongoose.Types.ObjectId;
  className?: string;
  points?: number;
  xp?: number;
  lastLessonSlug?: string;
  lastLessonId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      default: 'STUDENT',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
      default: 'ACTIVE',
    },
    parentId: { type: Schema.Types.ObjectId, ref: 'User' },
    className: { type: String, default: '4A' },
    points: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    lastLessonSlug: { type: String, default: '' },
    lastLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
