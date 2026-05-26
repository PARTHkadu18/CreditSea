import { Router } from 'express';
import authRoutes from './auth.routes';
import borrowerRoutes from './borrower.routes';
import loanRoutes from './loan.routes';
import opsRoutes from './ops.routes';

const router = Router();

// Mount API sub-routers
router.use('/auth', authRoutes);
router.use('/borrower', borrowerRoutes);
router.use('/loans', loanRoutes);
router.use('/ops', opsRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LMS Backend Server is healthy and running.',
    timestamp: new Date(),
  });
});

export default router;
