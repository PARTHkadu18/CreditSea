import { Schema, model } from 'mongoose';
import { ILoanStatusHistory } from '../types/express';

const LoanStatusHistorySchema = new Schema<ILoanStatusHistory>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    fromStatus: {
      type: String,
      required: true,
    },
    toStatus: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only track when log was created
  }
);

export const LoanStatusHistory = model<ILoanStatusHistory>('LoanStatusHistory', LoanStatusHistorySchema);
export default LoanStatusHistory;
