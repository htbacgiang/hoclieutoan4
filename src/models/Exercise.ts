import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExercise extends Document {
  title: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'IMAGE_CHOICE';
  content?: string;
  image?: string;
  options: string[];
  correctAnswer: string | number; // index or exact string
  explanation: string;
  difficulty: 'Cơ bản' | 'Vận dụng' | 'Thử thách';
  lessonId?: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    title: { type: String, required: true },
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING', 'IMAGE_CHOICE'],
      default: 'MULTIPLE_CHOICE',
    },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['Cơ bản', 'Vận dụng', 'Thử thách'], default: 'Cơ bản' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);
export default Exercise;
