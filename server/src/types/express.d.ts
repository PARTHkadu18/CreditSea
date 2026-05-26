import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Sales' | 'Sanction' | 'Disbursement' | 'Collection' | 'Borrower';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface IBorrowerProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  fullName: string;
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed';
  brePassed: boolean;
  breFailedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoan extends Document {
  _id: Types.ObjectId;
  borrowerId: Types.ObjectId | IUser;
  principal: number;
  tenure: number;
  rate: number;
  interest: number;
  totalRepayment: number;
  outstandingBalance: number;
  status: 'Pending' | 'Sanctioned' | 'Rejected' | 'Disbursed' | 'Closed';
  rejectionReason?: string;
  salarySlipPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: Date;
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  loanId: Types.ObjectId | ILoan;
  utr: string;
  amount: number;
  date: Date;
  recordedBy: Types.ObjectId | IUser;
  createdAt: Date;
}

export interface ILoanStatusHistory extends Document {
  _id: Types.ObjectId;
  loanId: Types.ObjectId | ILoan;
  fromStatus: string;
  toStatus: string;
  updatedBy: Types.ObjectId | IUser;
  comments?: string;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
