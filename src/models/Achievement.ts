import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Trophy' },
    condition: { type: String, required: true },
    points: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
export default Achievement;
