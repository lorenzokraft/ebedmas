import express from 'express';
import { getAllGrades, getGrades, createGrade, updateGrade, deleteGrade } from '../controllers/gradeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/all', getAllGrades);

// Protected routes
router.get('/', authenticateToken, getGrades);
router.post('/', authenticateToken, createGrade);
router.put('/:id', authenticateToken, updateGrade);
router.delete('/:id', authenticateToken, deleteGrade);

export default router;
