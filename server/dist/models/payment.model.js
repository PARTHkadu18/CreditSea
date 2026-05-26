"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    loanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
    },
    utr: {
        type: String,
        required: [true, 'UTR number is required'],
        unique: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [1, 'Payment amount must be greater than 0'],
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    recordedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
exports.Payment = (0, mongoose_1.model)('Payment', PaymentSchema);
exports.default = exports.Payment;
