
import mongoose, { Document, Schema } from 'mongoose';
import { InterestStatus } from '../../types';

export interface IInterest extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  status: InterestStatus;
}

const InterestSchema: Schema = new Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(InterestStatus), default: InterestStatus.PENDING },
}, { timestamps: true });

// Ensure a user cannot send multiple pending interests to the same person
InterestSchema.index({ fromUser: 1, toUser: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'Pending' } });


export default mongoose.model<IInterest>('Interest', InterestSchema);
