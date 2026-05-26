import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/config';

// Ensure upload directory exists
if (!fs.existsSync(config.absUploadDir)) {
  fs.mkdirSync(config.absUploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.absUploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate safe, unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter check (PDF, JPG, PNG)
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.') as any, false);
  }
};

// Export multer instance
export const uploadSalarySlip = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum size
  },
  fileFilter,
});
