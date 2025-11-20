
import mongoose, { Document, Schema } from 'mongoose';
import { ChatMessageStatus } from '../../types';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  status: ChatMessageStatus;
}

const MessageSchema: Schema = new Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
