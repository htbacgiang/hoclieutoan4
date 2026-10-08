import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResource extends Document {
  title: string;
  slug: string;
  description: string;
  type: 'VIDEO' | 'PDF' | 'POWERPOINT' | 'IMAGE' | 'MIND_MAP' | 'GAME' | 'EXERCISE' | 'QUIZ' | 'WORD';
  examType?: 'MID_TERM_1' | 'FINAL_TERM_1' | 'MID_TERM_2' | 'FINAL_TERM_2' | 'MID_TERM' | 'FINAL_TERM' | 'HOMEWORK' | 'PRACTICE';
  fileSize?: string;
  downloadCount?: number;
  url: string;
  cloudinaryPublicId?: string;
  thumbnail?: string;
  lessonId?: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['VIDEO', 'PDF', 'POWERPOINT', 'IMAGE', 'MIND_MAP', 'GAME', 'EXERCISE', 'QUIZ', 'WORD'],
      required: true,
    },
    examType: {
      type: String,
      enum: ['MID_TERM_1', 'FINAL_TERM_1', 'MID_TERM_2', 'FINAL_TERM_2', 'MID_TERM', 'FINAL_TERM', 'HOMEWORK', 'PRACTICE'],
      default: undefined,
    },
    fileSize: { type: String, default: '1.2 MB' },
    downloadCount: { type: Number, default: 0 },
    url: { type: String, required: true },
    cloudinaryPublicId: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
export default Resource;
