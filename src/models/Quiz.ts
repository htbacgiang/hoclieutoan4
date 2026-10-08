import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: mongoose.Types.ObjectId[];
  duration: number; // in minutes
  totalScore: number;
  categoryId: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
    duration: { type: Number, default: 15 },
    totalScore: { type: Number, default: 10 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
export default Quiz;
