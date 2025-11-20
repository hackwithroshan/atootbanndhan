import mongoose, { Document, Schema } from 'mongoose';
import { MembershipTier } from '../../types';

export interface IPlan extends Document {
  name: MembershipTier;
  priceMonthly: string;
  priceYearly?: string;
  highlight?: boolean;
  features: { text: string; included: boolean }[];
  cta: string;
}

const PlanFeatureSchema = new Schema({
    text: { type: String, required: true },
    included: { type: Boolean, required: true },
}, { _id: false });

const PlanSchema: Schema = new Schema({
  name: { type: String, enum: Object.values(MembershipTier), required: true, unique: true },
  priceMonthly: { type: String, required: true },
  priceYearly: { type: String },
  highlight: { type: Boolean, default: false },
  features: [PlanFeatureSchema],
  cta: { type: String, required: true },
});

export default mongoose.model<IPlan>('Plan', PlanSchema);
