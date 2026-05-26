import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'creditsea-lms-super-secret-key-987654321',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  uploadDir: process.env.UPLOAD_DIR || 'uploads/',
  absUploadDir: process.env.VERCEL
    ? '/tmp'
    : path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/')
};
