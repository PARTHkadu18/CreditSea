"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const config_1 = require("../config/config");
/**
 * Generate JWT token for user
 */
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, config_1.config.jwtSecret, {
        expiresIn: config_1.config.jwtExpire,
    });
};
/**
 * @desc    Register a new user (public register defaults to Borrower)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const userExists = await user_model_1.User.findOne({ email });
        if (userExists) {
            res.status(400).json({
                success: false,
                message: 'A user with this email address already exists.',
            });
            return;
        }
        // Restrict public registration to Borrower role.
        // Executives or Admin must be seeded or created by Admin.
        const userRole = role && ['Admin', 'Sales', 'Sanction', 'Disbursement', 'Collection'].includes(role)
            ? 'Borrower' // force borrower for public signup
            : 'Borrower';
        // Create user
        const user = await user_model_1.User.create({
            name,
            email,
            password,
            role: userRole,
        });
        // Generate JWT
        const token = generateToken(user._id.toString(), user.role);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during registration.',
            error: error.message,
        });
    }
};
exports.register = register;
/**
 * @desc    Log in user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check for user
        const user = await user_model_1.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
            return;
        }
        // Generate JWT
        const token = generateToken(user._id.toString(), user.role);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login.',
            error: error.message,
        });
    }
};
exports.login = login;
/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving user data.',
            error: error.message,
        });
    }
};
exports.getMe = getMe;
