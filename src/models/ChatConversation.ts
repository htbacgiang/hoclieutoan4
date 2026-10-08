import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatConversationContext {
  grade?: number;
  subject?: string;
  topic?: string;
  lesson?: string;
  level?: string;
}

export interface IChatConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  context?: IChatConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, default: 'Cuộc trò chuyện mới' },
    context: {
      grade: { type: Number },
      subject: { type: String },
      topic: { type: String },
      lesson: { type: String },
      level: { type: String },
    },
  },
  { timestamps: true }
);

const ChatConversation: Model<IChatConversation> = mongoose.models.ChatConversation || mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);
export default ChatConversation;

