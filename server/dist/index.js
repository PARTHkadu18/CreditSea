"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const config_1 = require("./config/config");
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
// Initialize express app
const app = (0, express_1.default)();
// Connect to Database
(0, db_1.connectDB)();
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.config.absUploadDir)) {
    fs_1.default.mkdirSync(config_1.config.absUploadDir, { recursive: true });
    console.log(`Created uploads folder at: ${config_1.config.absUploadDir}`);
}
// Global Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploads directory statically so frontend can access uploaded slips
app.use('/uploads', express_1.default.static(config_1.config.absUploadDir));
// Mount API routes under /api
app.use('/api', routes_1.default);
// Base route for server
app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the CreditSea Loan Management System (LMS) API.',
        docs: 'Endpoints are mounted under /api',
    });
});
// Catch-all route for unmatched paths (404)
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found.',
    });
});
// Global Error Handler Middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled Error occurred:', err);
    // Handle Multer upload errors specifically
    if (err instanceof multer_1.default.MulterError) {
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
    const server = app.listen(config_1.config.port, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${config_1.config.port}`);
        console.log(`API health available at http://localhost:${config_1.config.port}/api/health`);
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error(`Unhandled Promise Rejection: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
}
exports.default = app;
