import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  exerciseId?: string;
  exerciseTitle?: string;
  completed: boolean;
  score?: number;
  maxScore?: number;
  completionTime?: string;
  xpEarned?: number;
  progressPercent: number;
  lastAccessedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    exerciseId: { type: String, default: '' },
    exerciseTitle: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 10 },
    maxScore: { type: Number, default: 10 },
    completionTime: { type: String, default: '00:00' },
    xpEarned: { type: Number, default: 50 },
    progressPercent: { type: Number, default: 100 },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProgressSchema.index({ studentId: 1, lessonId: 1, exerciseId: 1 });

const Progress: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
export default Progress;
