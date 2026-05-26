import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import multer from 'multer';
import { config } from './config/config';
import { connectDB } from './config/db';
import apiRouter from './routes';

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Ensure upload directory exists
if (!fs.existsSync(config.absUploadDir)) {
  fs.mkdirSync(config.absUploadDir, { recursive: true });
  console.log(`Created uploads folder at: ${config.absUploadDir}`);
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads directory statically so frontend can access uploaded slips
app.use('/uploads', express.static(config.absUploadDir));

// Mount API routes under /api
app.use('/api', apiRouter);

// Base route for server
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the CreditSea Loan Management System (LMS) API.',
    docs: 'Endpoints are mounted under /api',
  });
});

// Catch-all route for unmatched paths (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.',
  });
});

// Global Error Handler Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Error occurred:', err);

  // Handle Multer upload errors specifically
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File upload failed. Maximum permitted size is 5 MB.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
    return;
  }

  // Handle generic error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start listening if not running on Vercel serverless environment
if (!process.env.VERCEL) {
  const server = app.listen(config.port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${config.port}`);
    console.log(`API health available at http://localhost:${config.port}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error(`Unhandled Promise Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

export default app;
