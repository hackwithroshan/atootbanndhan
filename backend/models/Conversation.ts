
import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: {
    text: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
  }
}

const ConversationSchema: Schema = new Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
