import express, { RequestHandler } from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
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
  login,
  getAllSections,
  createNewSection,
  getSingleSection,
  updateSectionById,
  removeSectionById,
  getSectionsByTopicId,
  getSubjectsByGrade
} from '../controllers/adminController.js';

const router = express.Router();

// Public auth routes
router.post('/login', login as RequestHandler);

// Protected routes - apply authentication middleware
router.use(authenticateAdmin as RequestHandler);

// Grade routes
router.get('/grades', getGrades as RequestHandler);
router.get('/grades/stats', getGrades as RequestHandler);
router.post('/grades', createGrade as RequestHandler);
router.put('/grades/:id', updateGrade as RequestHandler);
router.delete('/grades/:id', deleteGrade as RequestHandler);
router.get('/grades/:gradeId/subjects', getSubjectsByGrade as RequestHandler);

// Question routes with file upload
router.post('/questions', 
  upload, 
  createQuestion as RequestHandler
);
router.put('/questions/:id', 
  upload, 
  updateQuestion as RequestHandler
);
router.get('/questions', 
  getQuestions as RequestHandler
);
router.delete('/questions/:id', 
  deleteQuestion as RequestHandler
);
router.get('/questions/:id', 
  getQuestionById as RequestHandler
);

// User routes
router.get('/recent-users', getRecentUsers as RequestHandler);
router.get('/user-count', getUserCount as RequestHandler);
router.get('/users', getUsers as RequestHandler);

// Admin routes
router.get('/admins', getAdmins as RequestHandler);
router.post('/admins', createAdmin as RequestHandler);
router.put('/admins/:id', updateAdmin as RequestHandler);
router.delete('/admins/:id', deleteAdmin as RequestHandler);
router.put('/admins/:id/status', updateAdminStatus as RequestHandler);
router.get('/admins/:id', getAdminById as RequestHandler);

// Subject routes
router.get('/subjects', getSubjects as RequestHandler);
router.post('/subjects', createSubject as RequestHandler);
router.put('/subjects/:id', updateSubject as RequestHandler);
router.delete('/subjects/:id', deleteSubject as RequestHandler);
router.get('/subjects/:id/topics', getTopicsBySubject as RequestHandler);

// Topic routes
router.get('/topics', getAllTopics as RequestHandler);
router.post('/topics', createTopic as RequestHandler);
router.get('/topics/:id', getTopicById as RequestHandler);
router.put('/topics/:id', updateTopic as RequestHandler);
router.delete('/topics/:id', deleteTopic as RequestHandler);

// Section routes
router.get('/sections', getAllSections as RequestHandler);
router.post('/sections', createNewSection as RequestHandler);
router.get('/sections/:id', getSingleSection as RequestHandler);
router.put('/sections/:id', updateSectionById as RequestHandler);
router.delete('/sections/:id', removeSectionById as RequestHandler);
router.get('/topics/:topicId/sections', getSectionsByTopicId as RequestHandler);

export default router; 