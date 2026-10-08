import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  objectives: string[];
  categoryId: mongoose.Types.ObjectId;
  thumbnail?: string;
  video?: string;
  duration?: number; // in minutes
  difficulty: 'Dễ' | 'Trung bình' | 'Thử thách';
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  rejectReason?: string;
  authorId: mongoose.Types.ObjectId;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    objectives: [{ type: String }],
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    thumbnail: { type: String, default: '' },
    video: { type: String, default: '' },
    duration: { type: Number, default: 15 },
    difficulty: { type: String, enum: ['Dễ', 'Trung bình', 'Thử thách'], default: 'Trung bình' },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
    },
    rejectReason: { type: String, default: '' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export default Lesson;
