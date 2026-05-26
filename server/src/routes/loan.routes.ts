import { Router } from 'express';
import { calculateLoan, getLoanHistory } from '../controllers/loan.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Live loan repayment calculator endpoint (can be consumed by any user or portal)
router.get('/calculate', calculateLoan);

// Retrieve detailed loan status transition history and recorded payments
router.get('/:loanId/history', protect, getLoanHistory);

export default router;
