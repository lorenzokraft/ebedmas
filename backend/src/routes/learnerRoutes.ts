import express from 'express';
import { addLearners, getLearners } from '../controllers/learnerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user's learners
router.get('/', authenticateToken, getLearners);

// Add new learners
router.post('/', authenticateToken, addLearners);

export default router;
