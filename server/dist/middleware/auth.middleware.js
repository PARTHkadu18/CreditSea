"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const user_model_1 = require("../models/user.model");
const protect = async (req, res, next) => {
    let token;
    // Check if token exists in Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.',
        });
        return;
    }
    try {
        // Verify JWT
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        // Find user in DB
        const user = await user_model_1.User.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'The user belonging to this token no longer exists.',
            });
            return;
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Invalid or expired token.',
        });
    }
};
exports.protect = protect;
