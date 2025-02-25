import express from 'express';
import { addLearners } from '../controllers/learnerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, addLearners);

export default router;
