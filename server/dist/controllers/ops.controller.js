"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOverview = exports.recordPayment = exports.getCollectionData = exports.disburseLoan = exports.getDisbursementData = exports.decideSanction = exports.getSanctionData = exports.getSalesData = void 0;
const user_model_1 = require("../models/user.model");
const loan_model_1 = require("../models/loan.model");
const borrower_model_1 = require("../models/borrower.model");
const payment_model_1 = require("../models/payment.model");
const history_model_1 = require("../models/history.model");
/**
 * ============================================================================
 * 1. SALES MODULE (Pre-application stage)
 * ============================================================================
 */
/**
 * @desc    Get Sales Dashboard lead data
 *          Shows registered borrowers who have not yet submitted a loan application.
 * @route   GET /api/ops/sales
 * @access  Private (Sales or Admin)
 */
const getSalesData = async (_req, res) => {
    try {
        // 1. Get borrowerId lists from existing Loan applications
        const appliedBorrowerIds = await loan_model_1.Loan.distinct('borrowerId');
        // 2. Query all users with Borrower role who are not in the above list
        const leads = await user_model_1.User.find({
            role: 'Borrower',
            _id: { $nin: appliedBorrowerIds },
        }).select('-password');
        // 3. Match with profiles if they created one
        const profiles = await borrower_model_1.BorrowerProfile.find({
            userId: { $in: leads.map((lead) => lead._id) },
        });
        const combinedLeads = leads.map((lead) => {
            const profile = profiles.find((p) => p.userId.toString() === lead._id.toString());
            return {
                user: lead,
                profile: profile || null,
                status: profile ? 'ProfileSubmitted' : 'RegisteredOnly',
            };
        });
        res.status(200).json({
            success: true,
            count: combinedLeads.length,
            data: combinedLeads,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving Sales module leads data.',
            error: error.message,
        });
    }
};
exports.getSalesData = getSalesData;
/**
 * ============================================================================
 * 2. SANCTION MODULE (Applied applications)
 * ============================================================================
 */
/**
 * @desc    Get Sanction Dashboard application lists
 *          Shows applications with 'Pending' state.
 * @route   GET /api/ops/sanction
 * @access  Private (Sanction or Admin)
 */
const getSanctionData = async (_req, res) => {
    try {
        const pendingLoans = await loan_model_1.Loan.find({ status: 'Pending' })
            .populate('borrowerId', 'name email')
            .sort({ createdAt: 1 });
        const borrowerProfiles = await borrower_model_1.BorrowerProfile.find({
            userId: { $in: pendingLoans.map((l) => l.borrowerId._id) },
        });
        const loansWithProfiles = pendingLoans.map((loan) => {
            const profile = borrowerProfiles.find((p) => p.userId.toString() === loan.borrowerId._id.toString());
            return {
                loan,
                profile: profile || null,
            };
        });
        res.status(200).json({
            success: true,
            count: loansWithProfiles.length,
            data: loansWithProfiles,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving Sanction module applications.',
            error: error.message,
        });
    }
};
exports.getSanctionData = getSanctionData;
/**
 * @desc    Approve or Reject a loan application
 * @route   POST /api/ops/sanction/:loanId
 * @access  Private (Sanction or Admin)
 */
const decideSanction = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { loanId } = req.params;
        const { action, rejectionReason } = req.body;
        if (!['approve', 'reject'].includes(action)) {
            res.status(400).json({
                success: false,
                message: "Action must be either 'approve' or 'reject'.",
            });
            return;
        }
        const loan = await loan_model_1.Loan.findById(loanId);
        if (!loan) {
            res.status(404).json({
                success: false,
                message: 'Loan application not found.',
            });
            return;
        }
        // Strict transition check: only Pending loans can be approved or rejected
        if (loan.status !== 'Pending') {
            res.status(400).json({
                success: false,
                message: `Invalid action. Loan is currently in '${loan.status}' state. Only 'Pending' applications can be sanctioned.`,
            });
            return;
        }
        const fromStatus = loan.status;
        let toStatus;
        let comments = '';
        if (action === 'approve') {
            toStatus = 'Sanctioned';
            comments = 'Loan application approved by Sanction Executive.';
        }
        else {
            toStatus = 'Rejected';
            if (!rejectionReason || rejectionReason.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'A rejection reason is required to reject a loan application.',
                });
                return;
            }
            loan.rejectionReason = rejectionReason;
            comments = `Loan application rejected. Reason: ${rejectionReason}`;
        }
        // Update loan details
        loan.status = toStatus;
        await loan.save();
        // Log status audit trail
        await history_model_1.LoanStatusHistory.create({
            loanId: loan._id,
            fromStatus,
            toStatus,
            updatedBy: req.user._id,
            comments,
        });
        res.status(200).json({
            success: true,
            message: `Loan has been successfully ${toStatus.toLowerCase()}.`,
            loan,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error processing sanction decision.',
            error: error.message,
        });
    }
};
exports.decideSanction = decideSanction;
/**
 * ============================================================================
 * 3. DISBURSEMENT MODULE (Approved applications)
 * ============================================================================
 */
/**
 * @desc    Get Disbursement Dashboard approved loans list
 *          Shows loans in 'Sanctioned' state.
 * @route   GET /api/ops/disbursement
 * @access  Private (Disbursement or Admin)
 */
const getDisbursementData = async (_req, res) => {
    try {
        const sanctionedLoans = await loan_model_1.Loan.find({ status: 'Sanctioned' })
            .populate('borrowerId', 'name email')
            .sort({ updatedAt: 1 });
        const borrowerProfiles = await borrower_model_1.BorrowerProfile.find({
            userId: { $in: sanctionedLoans.map((l) => l.borrowerId._id) },
        });
        const combinedLoans = sanctionedLoans.map((loan) => {
            const profile = borrowerProfiles.find((p) => p.userId.toString() === loan.borrowerId._id.toString());
            return {
                loan,
                profile: profile || null,
            };
        });
        res.status(200).json({
            success: true,
            count: combinedLoans.length,
            data: combinedLoans,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving Disbursement module list.',
            error: error.message,
        });
    }
};
exports.getDisbursementData = getDisbursementData;
/**
 * @desc    Mark a loan as Disbursed
 * @route   POST /api/ops/disbursement/:loanId/disburse
 * @access  Private (Disbursement or Admin)
 */
const disburseLoan = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { loanId } = req.params;
        const loan = await loan_model_1.Loan.findById(loanId);
        if (!loan) {
            res.status(404).json({
                success: false,
                message: 'Loan application not found.',
            });
            return;
        }
        // Strict transition check: only Sanctioned loans can move to Disbursed
        if (loan.status !== 'Sanctioned') {
            res.status(400).json({
                success: false,
                message: `Invalid action. Loan is currently in '${loan.status}' state. Only 'Sanctioned' loans can be disbursed.`,
            });
            return;
        }
        const fromStatus = loan.status;
        const toStatus = 'Disbursed';
        loan.status = toStatus;
        await loan.save();
        // Log status audit trail
        await history_model_1.LoanStatusHistory.create({
            loanId: loan._id,
            fromStatus,
            toStatus,
            updatedBy: req.user._id,
            comments: 'Loan marked as disbursed. Outstanding balance active.',
        });
        res.status(200).json({
            success: true,
            message: 'Loan has been successfully marked as Disbursed.',
            loan,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error marking loan as disbursed.',
            error: error.message,
        });
    }
};
exports.disburseLoan = disburseLoan;
/**
 * ============================================================================
 * 4. COLLECTION MODULE (Disbursed & active loans)
 * ============================================================================
 */
/**
 * @desc    Get Collection Dashboard active loans list
 *          Shows loans in 'Disbursed' state.
 * @route   GET /api/ops/collection
 * @access  Private (Collection or Admin)
 */
const getCollectionData = async (_req, res) => {
    try {
        const activeLoans = await loan_model_1.Loan.find({ status: 'Disbursed' })
            .populate('borrowerId', 'name email')
            .sort({ outstandingBalance: -1 });
        const borrowerProfiles = await borrower_model_1.BorrowerProfile.find({
            userId: { $in: activeLoans.map((l) => l.borrowerId._id) },
        });
        const combinedLoans = activeLoans.map((loan) => {
            const profile = borrowerProfiles.find((p) => p.userId.toString() === loan.borrowerId._id.toString());
            return {
                loan,
                profile: profile || null,
            };
        });
        res.status(200).json({
            success: true,
            count: combinedLoans.length,
            data: combinedLoans,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving Collection module list.',
            error: error.message,
        });
    }
};
exports.getCollectionData = getCollectionData;
/**
 * @desc    Record borrower payment & auto-close loan if outstanding balance drops to 0.
 * @route   POST /api/ops/collection/:loanId/payment
 * @access  Private (Collection or Admin)
 */
const recordPayment = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { loanId } = req.params;
        const { utr, amount, date } = req.body;
        const loan = await loan_model_1.Loan.findById(loanId);
        if (!loan) {
            res.status(404).json({
                success: false,
                message: 'Loan not found.',
            });
            return;
        }
        // Strict transition: can only pay towards a Disbursed active loan
        if (loan.status !== 'Disbursed') {
            res.status(400).json({
                success: false,
                message: `Invalid action. Payments can only be recorded against 'Disbursed' (active) loans. Loan is currently in '${loan.status}' state.`,
            });
            return;
        }
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Payment amount must be a positive number greater than 0.',
            });
            return;
        }
        // Validate that payment amount does not exceed remaining outstanding balance
        if (paymentAmount > loan.outstandingBalance) {
            res.status(400).json({
                success: false,
                message: `Payment amount (${paymentAmount.toLocaleString()}) exceeds the outstanding balance (${loan.outstandingBalance.toLocaleString()}).`,
            });
            return;
        }
        // Validate that the UTR is globally unique
        const existingUtr = await payment_model_1.Payment.findOne({ utr: utr.trim() });
        if (existingUtr) {
            res.status(400).json({
                success: false,
                message: `Payment UTR '${utr}' has already been registered in the system. UTR must be globally unique.`,
            });
            return;
        }
        // Create payment
        const payment = await payment_model_1.Payment.create({
            loanId: loan._id,
            utr: utr.trim(),
            amount: paymentAmount,
            date: date ? new Date(date) : new Date(),
            recordedBy: req.user._id,
        });
        // Update outstanding balance
        // Perform rounding to avoid JS floating point discrepancies
        const previousBalance = loan.outstandingBalance;
        const newBalance = Math.round((previousBalance - paymentAmount) * 100) / 100;
        loan.outstandingBalance = newBalance;
        let message = 'Payment recorded successfully.';
        let transitionLogged = false;
        // Check for auto-closure
        if (newBalance === 0) {
            loan.status = 'Closed';
            await loan.save();
            // Log auto-close transition
            await history_model_1.LoanStatusHistory.create({
                loanId: loan._id,
                fromStatus: 'Disbursed',
                toStatus: 'Closed',
                updatedBy: req.user._id,
                comments: `Loan fully repaid with payment of ${paymentAmount.toLocaleString()}. Auto-closed loan account.`,
            });
            message = 'Payment recorded and loan fully repaid! Status changed to Closed.';
            transitionLogged = true;
        }
        else {
            await loan.save();
        }
        // If still active, log payment history comment
        if (!transitionLogged) {
            await history_model_1.LoanStatusHistory.create({
                loanId: loan._id,
                fromStatus: 'Disbursed',
                toStatus: 'Disbursed',
                updatedBy: req.user._id,
                comments: `Repayment payment of ${paymentAmount.toLocaleString()} recorded. Outstanding balance: ${newBalance.toLocaleString()}. UTR: ${utr}`,
            });
        }
        res.status(200).json({
            success: true,
            message,
            payment,
            loan: {
                id: loan._id,
                principal: loan.principal,
                totalRepayment: loan.totalRepayment,
                outstandingBalance: loan.outstandingBalance,
                status: loan.status,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error recording payment.',
            error: error.message,
        });
    }
};
exports.recordPayment = recordPayment;
/**
 * ============================================================================
 * 5. ADMIN SUMMARY MODULE
 * ============================================================================
 */
/**
 * @desc    Get general statistics for Admin role
 * @route   GET /api/ops/admin/overview
 * @access  Private (Admin only)
 */
const getAdminOverview = async (_req, res) => {
    try {
        const totalUsers = await user_model_1.User.countDocuments();
        const totalBorrowers = await user_model_1.User.countDocuments({ role: 'Borrower' });
        const pendingCount = await loan_model_1.Loan.countDocuments({ status: 'Pending' });
        const sanctionedCount = await loan_model_1.Loan.countDocuments({ status: 'Sanctioned' });
        const disbursedCount = await loan_model_1.Loan.countDocuments({ status: 'Disbursed' });
        const closedCount = await loan_model_1.Loan.countDocuments({ status: 'Closed' });
        const rejectedCount = await loan_model_1.Loan.countDocuments({ status: 'Rejected' });
        // Aggregate total disbursements and interest
        const loanRepaymentAgg = await loan_model_1.Loan.aggregate([
            {
                $group: {
                    _id: null,
                    totalPrincipal: { $sum: '$principal' },
                    totalInterest: { $sum: '$interest' },
                    totalRepayments: { $sum: '$totalRepayment' },
                    remainingDue: { $sum: '$outstandingBalance' },
                },
            },
        ]);
        const stats = loanRepaymentAgg[0] || {
            totalPrincipal: 0,
            totalInterest: 0,
            totalRepayments: 0,
            remainingDue: 0,
        };
        // Calculate total collection logged
        const totalPaymentsAgg = await payment_model_1.Payment.aggregate([
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: '$amount' },
                },
            },
        ]);
        const totalCollected = totalPaymentsAgg[0]?.totalCollected || 0;
        res.status(200).json({
            success: true,
            stats: {
                userCounts: {
                    total: totalUsers,
                    borrowers: totalBorrowers,
                },
                loanCounts: {
                    pending: pendingCount,
                    sanctioned: sanctionedCount,
                    disbursed: disbursedCount,
                    closed: closedCount,
                    rejected: rejectedCount,
                    totalApplications: pendingCount + sanctionedCount + disbursedCount + closedCount + rejectedCount,
                },
                financials: {
                    totalPrincipalDisbursed: stats.totalPrincipal,
                    totalInterestEarned: stats.totalInterest,
                    totalBookedRepayments: stats.totalRepayments,
                    totalCollectedAmount: totalCollected,
                    outstandingBalanceRemaining: stats.remainingDue,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error retrieving Admin overview stats.',
            error: error.message,
        });
    }
};
exports.getAdminOverview = getAdminOverview;
