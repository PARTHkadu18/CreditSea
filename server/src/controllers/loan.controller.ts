import { Request, Response } from 'express';
import { Loan } from '../models/loan.model';
import { BorrowerProfile } from '../models/borrower.model';
import { LoanStatusHistory } from '../models/history.model';
import { Payment } from '../models/payment.model';
import { calculateLoanMath } from '../services/math.service';

/**
 * @desc    Live loan calculation support
 * @route   GET /api/loans/calculate
 * @access  Public / Authenticated
 */
export const calculateLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { principal, tenure } = req.query;

    if (!principal || !tenure) {
      res.status(400).json({
        success: false,
        message: 'Principal and tenure parameters are required.',
      });
      return;
    }

    const P = parseFloat(principal as string);
    const T = parseInt(tenure as string, 10);

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
    const result = calculateLoanMath(P, T);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while calculating loan repayments.',
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Apply for a Loan
 * @route   POST /api/borrower/apply-loan
 * @access  Private (Borrower role only)
 */
export const applyLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { principal, tenure, salarySlipPath } = req.body;
    const userId = req.user._id;

    // 1. Verify that Borrower Profile exists and BRE eligibility passed
    const profile = await BorrowerProfile.findOne({ userId });
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
    const activeLoan = await Loan.findOne({
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
    const math = calculateLoanMath(P, T);

    // 5. Create new loan application
    const loan = await Loan.create({
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
    await LoanStatusHistory.create({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while submitting loan application.',
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Get Borrower's current loan applications list
 * @route   GET /api/borrower/loans
 * @access  Private (Borrower or Admin)
 */
export const getMyLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const borrowerId = req.user.role === 'Admin' && req.query.borrowerId
      ? req.query.borrowerId
      : req.user._id;

    const loans = await Loan.find({ borrowerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      loans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving loans.',
      error: (error as Error).message,
    });
  }
};

/**
 * @desc    Get details of a loan including history and payment reports
 * @route   GET /api/ops/loans/:loanId/history
 * @access  Private (Dashboard Executives or Borrower of the loan)
 */
export const getLoanHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { loanId } = req.params;

    const loan = await Loan.findById(loanId).populate('borrowerId', 'name email');
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
    const payments = await Payment.find({ loanId }).populate('recordedBy', 'name email').sort({ createdAt: -1 });
    const history = await LoanStatusHistory.find({ loanId }).populate('updatedBy', 'name email role').sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      loan,
      payments,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching loan history.',
      error: (error as Error).message,
    });
  }
};
