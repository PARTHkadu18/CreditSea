"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModel = void 0;
const mongoose_1 = require("mongoose");
const DocumentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
        enum: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    size: {
        type: Number,
        required: true,
        max: [5242880, 'File size cannot exceed 5MB'],
    },
}, {
    timestamps: true,
});
exports.DocumentModel = (0, mongoose_1.model)('Document', DocumentSchema);
exports.default = exports.DocumentModel;
