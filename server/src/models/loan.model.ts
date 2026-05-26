import { Schema, model } from 'mongoose';
import { ILoan } from '../types/express';

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    principal: {
      type: Number,
      required: [true, 'Loan principal amount is required'],
      min: [50000, 'Principal cannot be less than 50,000'],
      max: [500000, 'Principal cannot be more than 5,00,000'],
    },
    tenure: {
      type: Number,
      required: [true, 'Loan tenure in days is required'],
      min: [30, 'Tenure cannot be less than 30 days'],
      max: [365, 'Tenure cannot be more than 365 days'],
    },
    rate: {
      type: Number,
      default: 12, // Fixed 12% per annum simple interest
    },
    interest: {
      type: Number,
      required: true,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },
    outstandingBalance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Sanctioned', 'Rejected', 'Disbursed', 'Closed'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    salarySlipPath: {
      type: String,
      required: [true, 'Salary slip reference path is required to apply'],
    },
  },
  {
    timestamps: true,
  }
);

export const Loan = model<ILoan>('Loan', LoanSchema);
export default Loan;
