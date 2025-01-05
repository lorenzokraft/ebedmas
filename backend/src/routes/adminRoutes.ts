import express, { RequestHandler } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,
  getQuestionById,
  getRecentUsers,
  getUserCount,
  getUsers,
  getAdmins,
  getGrades,
  getSubjects,
  getTopicsBySubject,
  createTopic,
  getAllTopics,
  deleteTopic,
  getTopicById,
  updateTopic,
  createSubject,
  updateSubject,
  deleteSubject,
  createGrade,
  updateGrade,
  deleteGrade,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  getAdminById,
  login
} from '../controllers/adminController';

const router = express.Router();

// Public auth routes
router.post('/login', login as RequestHandler);

// Protected routes - apply authentication middleware
router.use(authenticateAdmin as RequestHandler);

// Question routes with file upload
router.post('/questions', 
  authenticateAdmin as RequestHandler, 
  upload, 
  createQuestion as RequestHandler
);
router.put('/questions/:id', 
  authenticateAdmin as RequestHandler, 
  upload, 
  updateQuestion as RequestHandler
);
router.get('/questions', 
  authenticateAdmin as RequestHandler, 
  getQuestions as RequestHandler
);
router.delete('/questions/:id', 
  authenticateAdmin as RequestHandler, 
  deleteQuestion as RequestHandler
);
router.get('/questions/:id', 
  authenticateAdmin as RequestHandler, 
  getQuestionById as RequestHandler
);

// User routes
router.get('/recent-users', authenticateAdmin as RequestHandler, getRecentUsers as RequestHandler);
router.get('/user-count', authenticateAdmin as RequestHandler, getUserCount as RequestHandler);
router.get('/users', authenticateAdmin as RequestHandler, getUsers as RequestHandler);

// Admin routes
router.get('/admins', authenticateAdmin as RequestHandler, getAdmins as RequestHandler);
router.post('/admins', authenticateAdmin as RequestHandler, createAdmin as RequestHandler);
router.put('/admins/:id', authenticateAdmin as RequestHandler, updateAdmin as RequestHandler);
router.delete('/admins/:id', authenticateAdmin as RequestHandler, deleteAdmin as RequestHandler);
router.put('/admins/:id/status', authenticateAdmin as RequestHandler, updateAdminStatus as RequestHandler);
router.get('/admins/:id', authenticateAdmin as RequestHandler, getAdminById as RequestHandler);

// Grade routes
router.get('/grades', authenticateAdmin as RequestHandler, getGrades as RequestHandler);
router.post('/grades', authenticateAdmin as RequestHandler, createGrade as RequestHandler);
router.put('/grades/:id', authenticateAdmin as RequestHandler, updateGrade as RequestHandler);
router.delete('/grades/:id', authenticateAdmin as RequestHandler, deleteGrade as RequestHandler);

// Subject routes
router.get('/subjects', authenticateAdmin as RequestHandler, getSubjects as RequestHandler);
router.post('/subjects', authenticateAdmin as RequestHandler, createSubject as RequestHandler);
router.put('/subjects/:id', authenticateAdmin as RequestHandler, updateSubject as RequestHandler);
router.delete('/subjects/:id', authenticateAdmin as RequestHandler, deleteSubject as RequestHandler);
router.get('/subjects/:id/topics', authenticateAdmin as RequestHandler, getTopicsBySubject as RequestHandler);

// Topic routes
router.get('/topics', authenticateAdmin as RequestHandler, getAllTopics as RequestHandler);
router.post('/topics', authenticateAdmin as RequestHandler, createTopic as RequestHandler);
router.get('/topics/:id', authenticateAdmin as RequestHandler, getTopicById as RequestHandler);
router.put('/topics/:id', authenticateAdmin as RequestHandler, updateTopic as RequestHandler);
router.delete('/topics/:id', authenticateAdmin as RequestHandler, deleteTopic as RequestHandler);

export default router; 