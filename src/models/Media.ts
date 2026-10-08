import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  folder: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: true },
    resourceType: { type: String, default: 'image' },
    format: { type: String, default: 'png' },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    bytes: { type: Number, default: 0 },
    folder: { type: String, default: 'toan4/resources' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
export default Media;
