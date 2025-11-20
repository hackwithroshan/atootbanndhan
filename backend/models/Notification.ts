import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from '../../types';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  redirectTo?: string;
  senderProfile?: mongoose.Types.ObjectId;
}

const NotificationSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  redirectTo: { type: String },
  senderProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);