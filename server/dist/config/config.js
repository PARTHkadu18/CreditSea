"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'creditsea-lms-super-secret-key-987654321',
    jwtExpire: process.env.JWT_EXPIRE || '24h',
    uploadDir: process.env.UPLOAD_DIR || 'uploads/',
    absUploadDir: process.env.VERCEL
        ? '/tmp'
        : path_1.default.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/')
};
