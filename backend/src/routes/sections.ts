import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSectionsByTopic, getQuestionCount } from '../controllers/sectionController';

const router = express.Router();

// Public routes for learners
router.get('/topic/:topicId', getSectionsByTopic);
router.get('/:sectionId/question-count', getQuestionCount);

export default router;
