"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loan = void 0;
const mongoose_1 = require("mongoose");
const LoanSchema = new mongoose_1.Schema({
    borrowerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.Loan = (0, mongoose_1.model)('Loan', LoanSchema);
exports.default = exports.Loan;
