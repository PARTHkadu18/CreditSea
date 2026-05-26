import { Router } from 'express';
import { submitProfile, getProfile, uploadSalarySlipController } from '../controllers/borrower.controller';
import { applyLoan, getMyLoans } from '../controllers/loan.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validateRequiredFields } from '../middleware/validation.middleware';
import { uploadSalarySlip } from '../middleware/upload.middleware';

const router = Router();

// Secure all routes in this file
router.use(protect);

// Borrower profile routes
router.post(
  '/profile',
  authorize('Borrower'),
  validateRequiredFields(['fullName', 'pan', 'dob', 'monthlySalary', 'employmentMode']),
  submitProfile
);
router.get('/profile', authorize('Borrower', 'Admin'), getProfile);

// Salary slip upload
router.post(
  '/upload-salary-slip',
  authorize('Borrower'),
  uploadSalarySlip.single('file'),
  uploadSalarySlipController
);

// Loan application routes
router.post(
  '/apply-loan',
  authorize('Borrower'),
  validateRequiredFields(['principal', 'tenure', 'salarySlipPath']),
  applyLoan
);
router.get('/loans', authorize('Borrower', 'Admin'), getMyLoans);

export default router;
