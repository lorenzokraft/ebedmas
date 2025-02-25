import express from 'express';
import { login, register, getProfile, promoteToAdmin, setPassword, getPasswordStatus } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/user/profile', authenticateToken, getProfile);
router.get('/profile', authenticateToken, getProfile);
router.post('/set-password', authenticateToken, setPassword);
router.get('/password-status', authenticateToken, getPasswordStatus);
router.post('/promote-to-admin', authenticateToken, promoteToAdmin);

export default router;