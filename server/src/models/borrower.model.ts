import { Schema, model } from 'mongoose';
import { IBorrowerProfile } from '../types/express';

const BorrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    pan: {
      type: String,
      required: [true, 'PAN is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number format'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    monthlySalary: {
      type: Number,
      required: [true, 'Monthly salary is required'],
      min: [0, 'Monthly salary cannot be negative'],
    },
    employmentMode: {
      type: String,
      required: [true, 'Employment mode is required'],
      enum: ['Salaried', 'Self-Employed', 'Unemployed'],
    },
    brePassed: {
      type: Boolean,
      default: false,
    },
    breFailedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const BorrowerProfile = model<IBorrowerProfile>('BorrowerProfile', BorrowerProfileSchema);
export default BorrowerProfile;
