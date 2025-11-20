
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  Gender, Religion, MaritalStatus, MotherTongue, EducationLevel, OccupationCategory,
  HeightUnit, WeightUnit, ManglikStatus, ProfileCreatedBy, FamilyType, FamilyValues,
  DietaryHabits, YesNoOccasionally, MembershipTier, UserStatus, AdminRole
} from '../../types';

// Sub-schemas for better organization
const UserPhotoSchema = new Schema({
    url: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
    requiresModeration: { type: Boolean, default: false },
});

const PartnerPreferencesSchema = new Schema({
  ageMin: { type: Number },
  ageMax: { type: Number },
  heightMin: { type: String },
  heightMax: { type: String },
  maritalStatus: [{ type: String, enum: Object.values(MaritalStatus) }],
  religion: [{ type: String, enum: Object.values(Religion) }],
  caste: { type: String },
  education: [{ type: String, enum: Object.values(EducationLevel) }],
  occupation: [{ type: String, enum: Object.values(OccupationCategory) }],
  incomeRange: { type: String },
  locations: { type: String },
  smokingHabits: { type: String, enum: Object.values(YesNoOccasionally) },
  drinkingHabits: { type: String, enum: Object.values(YesNoOccasionally) },
  languagesSpoken: { type: String },
  manglikStatus: { type: String, enum: Object.values(ManglikStatus) },
  dietaryHabits: { type: String, enum: Object.values(DietaryHabits) },
}, { _id: false });

const LoginAttemptSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    location: { type: String },
    status: { type: String, enum: ['Success', 'Failed'] }
});


const UserSchema: Schema = new Schema({
  // Step 1: Basic Info
  fullName: { type: String },
  gender: { type: String, enum: Object.values(Gender) },
  dateOfBirth: { type: String }, 
  email: { type: String, required: true, unique: true, index: true },
  emailOtp: { type: String, select: false },
  emailOtpExpires: { type: Date, select: false },
  isEmailVerified: { type: Boolean, default: false },
  mobileNumber: {
    type: String,
    unique: true,
    // CRITICAL FIX: `sparse: true` is essential. It tells MongoDB to only enforce uniqueness
    // for documents that have a `mobileNumber` value. Without this, MongoDB would try to enforce
    // uniqueness on `null` values, causing a "duplicate key" error when more than one user
    // signs up without providing a mobile number.
    // If you still see an E11000 error, you may need to drop the old index from your MongoDB
    // 'users' collection manually (`db.users.dropIndex("mobileNumber_1")`) and restart the server
    // to allow Mongoose to recreate it correctly.
    sparse: true,
  },
  isMobileVerified: { type: Boolean, default: false },
  
  // Password Reset Fields
  resetPasswordOtp: { type: String, select: false },
  resetPasswordOtpExpires: { type: Date, select: false },

  // Step 2: Account Credentials
  password: { type: String, select: false },
  
  // Step 3: Profile Setup Wizard
  maritalStatus: { type: String, enum: Object.values(MaritalStatus) },
  religion: { type: String, enum: Object.values(Religion) },
  caste: { type: String }, 
  subCaste: { type: String }, 
  manglikStatus: { type: String, enum: Object.values(ManglikStatus) }, 
  profileCreatedBy: { type: String, enum: Object.values(ProfileCreatedBy) }, 
  city: { type: String },
  state: { type: String },
  country: { type: String },
  motherTongue: { type: String, enum: Object.values(MotherTongue) },
  education: { type: String, enum: Object.values(EducationLevel) },
  occupation: { type: String, enum: Object.values(OccupationCategory) },
  heightValue: { type: String }, 
  heightUnit: { type: String, enum: Object.values(HeightUnit) },
  weightValue: { type: String }, 
  weightUnit: { type: String, enum: Object.values(WeightUnit) }, 
  profilePhotoUrl: { type: String }, 
  profileBio: { type: String }, 
  membershipTier: { type: String, enum: Object.values(MembershipTier), default: MembershipTier.FREE }, 
  photos: [UserPhotoSchema],

  // Family Details
  fatherOccupation: { type: String },
  motherOccupation: { type: String },
  brothers: { type: Number, default: 0 }, 
  marriedBrothers: { type: Number, default: 0 },
  sisters: { type: Number, default: 0 },
  marriedSisters: { type: Number, default: 0 },
  familyType: { type: String, enum: Object.values(FamilyType) },
  familyValues: { type: String, enum: Object.values(FamilyValues) },
  familyIncome: { type: String }, 

  // Lifestyle & Hobbies
  dietaryHabits: { type: String, enum: Object.values(DietaryHabits) },
  smokingHabits: { type: String, enum: Object.values(YesNoOccasionally) },
  drinkingHabits: { type: String, enum: Object.values(YesNoOccasionally) },
  hobbies: { type: String }, 
  generalHabits: { type: String }, 

  // Education & Career (more details)
  jobTitle: { type: String },
  companyName: { type: String },
  companyLocation: { type: String },
  annualIncome: { type: String },
  isAnnualIncomeVisible: { type: Boolean, default: false },

  // Partner Preferences
  partnerPreferences: { type: PartnerPreferencesSchema, default: {} },
  
  // Admin & System managed fields
  role: { type: String, default: 'user', enum: ['user', ...Object.values(AdminRole)] },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
  profileCompletion: { type: Number, default: 0 },
  aiTrustScore: { type: Number }, 
  lastLoginDate: { type: Date },
  lastLoginIP: { type: String },
  internalNotes: { type: String },
  adminTags: [{ type: String }],
  isVerified: { type: Boolean, default: false }, // Manual admin verification
  suspensionReason: { type: String },
  suspensionEndDate: { type: Date }, 
  banReason: { type: String },
  loginActivity: { type: [LoginAttemptSchema], default: [] }, 
  verificationStatus: { type: Map, of: new Schema({ isVerified: Boolean, notes: String, verifiedBy: String, dateVerified: Date }, { _id: false }) },
  
  shortlistedProfiles: [{ type: Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true, minimize: false });

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
