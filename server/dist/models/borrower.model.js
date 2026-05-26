"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowerProfile = void 0;
const mongoose_1 = require("mongoose");
const BorrowerProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.BorrowerProfile = (0, mongoose_1.model)('BorrowerProfile', BorrowerProfileSchema);
exports.default = exports.BorrowerProfile;
