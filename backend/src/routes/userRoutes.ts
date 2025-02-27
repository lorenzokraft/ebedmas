import express from 'express';
import { 
  login, 
  register, 
  getProfile, 
  promoteToAdmin, 
  setPassword, 
  getPasswordStatus, 
  updateProfile, 
  changePassword, 
  checkEmailExists 
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.get('/check-email', checkEmailExists);

// Protected routes
router.get('/user/profile', authenticateToken, getProfile);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/set-password', authenticateToken, setPassword);
router.get('/password-status', authenticateToken, getPasswordStatus);
router.post('/promote-to-admin', authenticateToken, promoteToAdmin);
router.post('/change-password', authenticateToken, changePassword);

export default router;