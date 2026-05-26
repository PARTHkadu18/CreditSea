import { Schema, model } from 'mongoose';
import { IDocument } from '../types/express';

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = model<IDocument>('Document', DocumentSchema);
export default DocumentModel;
