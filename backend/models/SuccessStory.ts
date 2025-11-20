import mongoose, { Document, Schema } from 'mongoose';

export interface ISuccessStory extends Document {
  coupleName: string;
  storyText: string;
  imageUrl: string;
  weddingDate?: string;
  status: 'Pending' | 'Approved';
  user: mongoose.Types.ObjectId;
}

const SuccessStorySchema: Schema = new Schema({
  coupleName: { type: String, required: true },
  storyText: { type: String, required: true },
  imageUrl: { type: String, required: true },
  weddingDate: { type: String },
  status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);