import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  mode?: 'ask' | 'hint' | 'explain';
  suggestedFollowUps?: string[];
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'ChatConversation', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    mode: { type: String, enum: ['ask', 'hint', 'explain'], default: 'ask' },
    suggestedFollowUps: [{ type: String }],
  },
  { timestamps: true }
);

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export default ChatMessage;

