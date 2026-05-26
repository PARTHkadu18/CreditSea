import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validateRequiredFields } from '../middleware/validation.middleware';
import {
  getSalesData,
  getSanctionData,
  decideSanction,
  getDisbursementData,
  disburseLoan,
  getCollectionData,
  recordPayment,
  getAdminOverview,
} from '../controllers/ops.controller';

const router = Router();

// Secure all operations dashboard routes
router.use(protect);

// 1. Sales Module
router.get('/sales', authorize('Sales'), getSalesData);

// 2. Sanction Module
router.get('/sanction', authorize('Sanction'), getSanctionData);
router.post(
  '/sanction/:loanId',
  authorize('Sanction'),
  validateRequiredFields(['action']),
  decideSanction
);

// 3. Disbursement Module
router.get('/disbursement', authorize('Disbursement'), getDisbursementData);
router.post('/disbursement/:loanId/disburse', authorize('Disbursement'), disburseLoan);

// 4. Collection Module
router.get('/collection', authorize('Collection'), getCollectionData);
router.post(
  '/collection/:loanId/payment',
  authorize('Collection'),
  validateRequiredFields(['utr', 'amount']),
  recordPayment
);

// 5. Admin General Overview
router.get('/admin/overview', authorize('Admin'), getAdminOverview);

export default router;
