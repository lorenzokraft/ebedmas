import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getGrades, 
  createGrade, 
  updateGrade, 
  deleteGrade,
  getGradeStats,
  getPublicGradeStats
} from '../controllers/gradeController';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/public', getPublicGradeStats);

// Protected routes (authentication needed)
router.use(authenticateToken);
router.get('/', getGrades);
router.get('/stats', getGradeStats);
router.post('/', createGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

export default router;
