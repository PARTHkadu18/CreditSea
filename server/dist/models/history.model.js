"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanStatusHistory = void 0;
const mongoose_1 = require("mongoose");
const LoanStatusHistorySchema = new mongoose_1.Schema({
    loanId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: {
        type: String,
        trim: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // only track when log was created
});
exports.LoanStatusHistory = (0, mongoose_1.model)('LoanStatusHistory', LoanStatusHistorySchema);
exports.default = exports.LoanStatusHistory;
