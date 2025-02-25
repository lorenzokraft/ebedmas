import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getTopics, 
  createTopic, 
  updateTopic, 
  deleteTopic, 
  getTopicCountBySubject,
  getTopicsBySubjectAndYear,
  getTopicsByYear,
  getTopicCountsBySubject,
  getTopicDetails
} from '../controllers/topicController';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/count/:subject', getTopicCountBySubject);
router.get('/:subject/year/:year', getTopicsBySubjectAndYear);
router.get('/:subject/counts', getTopicCountsBySubject);
router.get('/year/:yearId', getTopicsByYear);

// Protected routes (authentication needed)
router.use(authenticateToken);
router.get('/', getTopics);
router.get('/:topicId/details', getTopicDetails);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;
