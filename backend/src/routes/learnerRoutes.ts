import express from 'express';
import { addLearners, getLearners, deleteLearner } from '../controllers/learnerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user's learners
router.get('/', authenticateToken, getLearners);

// Add new learners
router.post('/', authenticateToken, addLearners);

// Delete a learner
router.delete('/:id', authenticateToken, deleteLearner);

export default router;
