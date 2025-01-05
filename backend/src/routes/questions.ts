import express from 'express';
import { getQuestionsByTopic, submitAnswer } from '../controllers/questionController';

const router = express.Router();

// Make this route public (no authentication required)
router.get('/topic/:topicId', getQuestionsByTopic);

// Add submit answer endpoint
router.post('/answer', submitAnswer);

export default router;
