
import mongoose, { Document, Schema } from 'mongoose';
import { SupportTicketCategory, SupportTicketStatus } from '../../types';

const TicketMessageSchema = new Schema({
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true },
}, { timestamps: true });

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  category: SupportTicketCategory;
  description: string;
  status: SupportTicketStatus;
  messages: { sender: 'user' | 'admin'; text: string; createdAt: Date }[];
  lastUpdatedDate: Date; // Renamed from lastUpdated
}

const TicketSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { type: String, enum: Object.values(SupportTicketCategory), required: true },
  description: { type: String, required: true },
  status: { type: String, enum: Object.values(SupportTicketStatus), default: SupportTicketStatus.OPEN },
  messages: [TicketMessageSchema],
  lastUpdatedDate: { type: Date, default: Date.now } // Renamed
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
