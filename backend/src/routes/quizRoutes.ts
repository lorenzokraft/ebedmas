import express, { RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Apply authentication middleware to all quiz routes
router.use(authenticateToken as RequestHandler);

// Save quiz progress
router.post('/progress', authenticateToken, quizController.saveQuizProgress as RequestHandler);

// Get quiz progress for a specific topic
router.get('/progress/:topicId', authenticateToken, quizController.getQuizProgressForTopic as RequestHandler);

// Fetch quiz progress data for chart
router.get('/quiz-progress', authenticateToken, quizController.getQuizProgress as RequestHandler);

export default router;
