import express from 'express';
import { login, register, getProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/user/profile', authenticateToken, getProfile);

export default router; 