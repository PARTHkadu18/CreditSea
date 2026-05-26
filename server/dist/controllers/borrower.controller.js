"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSalarySlipController = exports.getProfile = exports.submitProfile = void 0;
const borrower_model_1 = require("../models/borrower.model");
const document_model_1 = require("../models/document.model");
const bre_service_1 = require("../services/bre.service");
/**
 * @desc    Submit / Update Borrower personal details & run BRE checks
 * @route   POST /api/borrower/profile
 * @access  Private (Borrower role only)
 */
const submitProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { fullName, pan, dob, monthlySalary, employmentMode } = req.body;
        const userId = req.user._id;
        // Run Business Rule Engine (BRE) eligibility checks
        const parsedSalary = parseFloat(monthlySalary);
        const breResult = (0, bre_service_1.checkEligibility)({
            dob,
            monthlySalary: parsedSalary,
            pan,
            employmentMode,
        });
        // Check if profile already exists for this user
        let profile = await borrower_model_1.BorrowerProfile.findOne({ userId });
        if (profile) {
            // Update existing profile
            profile.fullName = fullName;
            profile.pan = pan.toUpperCase();
            profile.dob = new Date(dob);
            profile.monthlySalary = parsedSalary;
            profile.employmentMode = employmentMode;
            profile.brePassed = breResult.passed;
            profile.breFailedReason = breResult.passed ? undefined : breResult.errors.join('; ');
            await profile.save();
        }
        else {
            // Create new profile
            profile = await borrower_model_1.BorrowerProfile.create({
                userId,
                fullName,
                pan: pan.toUpperCase(),
                dob: new Date(dob),
                monthlySalary: parsedSalary,
                employmentMode,
                brePassed: breResult.passed,
                breFailedReason: breResult.passed ? undefined : breResult.errors.join('; '),
            });
        }
        // If BRE eligibility fails, block the application flow and return 400 with details
        if (!breResult.passed) {
            res.status(400).json({
                success: false,
                message: 'BRE eligibility checks failed.',
                errors: breResult.errors,
                profile,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Borrower details submitted and BRE eligibility passed.',
            profile,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while submitting profile.',
            error: error.message,
        });
    }
};
exports.submitProfile = submitProfile;
/**
 * @desc    Get Borrower profile
 * @route   GET /api/borrower/profile
 * @access  Private (Borrower or Admin)
 */
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const userId = req.user.role === 'Admin' && req.query.userId
            ? req.query.userId
            : req.user._id;
        const profile = await borrower_model_1.BorrowerProfile.findOne({ userId });
        if (!profile) {
            res.status(404).json({
                success: false,
                message: 'Borrower profile not found.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            profile,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving profile.',
            error: error.message,
        });
    }
};
exports.getProfile = getProfile;
/**
 * @desc    Upload Salary slip
 * @route   POST /api/borrower/upload-salary-slip
 * @access  Private (Borrower role only)
 */
const uploadSalarySlipController = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Please upload a file.',
            });
            return;
        }
        // Save document details in database
        const document = await document_model_1.DocumentModel.create({
            userId: req.user._id,
            filename: req.file.filename,
            path: `uploads/${req.file.filename}`, // relative URL/path
            mimetype: req.file.mimetype,
            size: req.file.size,
        });
        res.status(201).json({
            success: true,
            message: 'Salary slip uploaded successfully.',
            document: {
                id: document._id,
                filename: document.filename,
                path: document.path,
                size: document.size,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during file upload.',
            error: error.message,
        });
    }
};
exports.uploadSalarySlipController = uploadSalarySlipController;
