import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequiredFields } from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.post('/register', validateRequiredFields(['name', 'email', 'password']), register);
router.post('/login', validateRequiredFields(['email', 'password']), login);

// Protected routes
router.get('/me', protect, getMe);

export default router;
