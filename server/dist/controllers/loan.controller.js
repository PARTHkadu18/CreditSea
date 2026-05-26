"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanHistory = exports.getMyLoans = exports.applyLoan = exports.calculateLoan = void 0;
const loan_model_1 = require("../models/loan.model");
const borrower_model_1 = require("../models/borrower.model");
const history_model_1 = require("../models/history.model");
const payment_model_1 = require("../models/payment.model");
const math_service_1 = require("../services/math.service");
/**
 * @desc    Live loan calculation support
 * @route   GET /api/loans/calculate
 * @access  Public / Authenticated
 */
const calculateLoan = async (req, res) => {
    try {
        const { principal, tenure } = req.query;
        if (!principal || !tenure) {
            res.status(400).json({
                success: false,
                message: 'Principal and tenure parameters are required.',
            });
            return;
        }
        const P = parseFloat(principal);
        const T = parseInt(tenure, 10);
        // Validate ranges
        if (isNaN(P) || P < 50000 || P > 500000) {
            res.status(400).json({
                success: false,
                message: 'Principal amount must be between 50,000 and 5,00,000.',
            });
            return;
        }
        if (isNaN(T) || T < 30 || T > 365) {
            res.status(400).json({
                success: false,
                message: 'Tenure must be between 30 and 365 days.',
            });
            return;
        }
        // Call loan math service (12% per annum simple interest)
        const result = (0, math_service_1.calculateLoanMath)(P, T);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while calculating loan repayments.',
            error: error.message,
        });
    }
};
exports.calculateLoan = calculateLoan;
/**
 * @desc    Apply for a Loan
 * @route   POST /api/borrower/apply-loan
 * @access  Private (Borrower role only)
 */
const applyLoan = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { principal, tenure, salarySlipPath } = req.body;
        const userId = req.user._id;
        // 1. Verify that Borrower Profile exists and BRE eligibility passed
        const profile = await borrower_model_1.BorrowerProfile.findOne({ userId });
        if (!profile) {
            res.status(400).json({
                success: false,
                message: 'Please submit your personal details profile before applying for a loan.',
            });
            return;
        }
        if (!profile.brePassed) {
            res.status(400).json({
                success: false,
                message: 'Your profile does not satisfy the Business Rule Engine (BRE) eligibility requirements.',
                errors: profile.breFailedReason ? profile.breFailedReason.split('; ') : ['BRE check failed'],
            });
            return;
        }
        // 2. Validate input parameters
        const P = parseFloat(principal);
        const T = parseInt(tenure, 10);
        if (isNaN(P) || P < 50000 || P > 500000) {
            res.status(400).json({
                success: false,
                message: 'Principal amount must be between 50,000 and 5,00,000.',
            });
            return;
        }
        if (isNaN(T) || T < 30 || T > 365) {
            res.status(400).json({
                success: false,
                message: 'Tenure must be between 30 and 365 days.',
            });
            return;
        }
        if (!salarySlipPath) {
            res.status(400).json({
                success: false,
                message: 'A valid salary slip document path/reference is required to submit an application.',
            });
            return;
        }
        // 3. Ensure no active/pending loan application exists for this borrower
        const activeLoan = await loan_model_1.Loan.findOne({
            borrowerId: userId,
            status: { $in: ['Pending', 'Sanctioned', 'Disbursed'] },
        });
        if (activeLoan) {
            res.status(400).json({
                success: false,
                message: `You already have an active loan application in state: '${activeLoan.status}'. Cannot apply for another.`,
            });
            return;
        }
        // 4. Run loan math calculations (Simple interest 12%)
        const math = (0, math_service_1.calculateLoanMath)(P, T);
        // 5. Create new loan application
        const loan = await loan_model_1.Loan.create({
            borrowerId: userId,
            principal: math.principal,
            tenure: math.tenure,
            rate: math.rate,
            interest: math.interest,
            totalRepayment: math.totalRepayment,
            outstandingBalance: math.totalRepayment,
            status: 'Pending',
            salarySlipPath,
        });
        // 6. Log status history
        await history_model_1.LoanStatusHistory.create({
            loanId: loan._id,
            fromStatus: 'None',
            toStatus: 'Pending',
            updatedBy: userId,
            comments: 'Loan application submitted successfully.',
        });
        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully with status Pending.',
            loan,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while submitting loan application.',
            error: error.message,
        });
    }
};
exports.applyLoan = applyLoan;
/**
 * @desc    Get Borrower's current loan applications list
 * @route   GET /api/borrower/loans
 * @access  Private (Borrower or Admin)
 */
const getMyLoans = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const borrowerId = req.user.role === 'Admin' && req.query.borrowerId
            ? req.query.borrowerId
            : req.user._id;
        const loans = await loan_model_1.Loan.find({ borrowerId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            loans,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving loans.',
            error: error.message,
        });
    }
};
exports.getMyLoans = getMyLoans;
/**
 * @desc    Get details of a loan including history and payment reports
 * @route   GET /api/ops/loans/:loanId/history
 * @access  Private (Dashboard Executives or Borrower of the loan)
 */
const getLoanHistory = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { loanId } = req.params;
        const loan = await loan_model_1.Loan.findById(loanId).populate('borrowerId', 'name email');
        if (!loan) {
            res.status(404).json({
                success: false,
                message: 'Loan not found.',
            });
            return;
        }
        // Enforce security: Borrower can only view their own loan history
        if (req.user.role === 'Borrower' && loan.borrowerId._id.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Forbidden. You are not authorized to view this loan data.',
            });
            return;
        }
        // Fetch payments and audit status logs
        const payments = await payment_model_1.Payment.find({ loanId }).populate('recordedBy', 'name email').sort({ createdAt: -1 });
        const history = await history_model_1.LoanStatusHistory.find({ loanId }).populate('updatedBy', 'name email role').sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            loan,
            payments,
            history,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching loan history.',
            error: error.message,
        });
    }
};
exports.getLoanHistory = getLoanHistory;
