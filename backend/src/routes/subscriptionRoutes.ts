import express from 'express';
import { authenticateAdmin } from '../middleware/authMiddleware';
import {
  getPlans,
  createPlan,
  updatePlanStatus,
  getSubscribers,
  toggleSubscriptionFreeze,
  getPublicPlans,
  updatePlan,
  deletePlan
} from '../controllers/subscriptionController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublicPlans);

// Protected admin routes
router.get('/plans', authenticateAdmin, getPlans);
router.post('/plans', authenticateAdmin, createPlan);
router.put('/plans/:id/status', authenticateAdmin, updatePlanStatus);
router.get('/subscribers', authenticateAdmin, getSubscribers);
router.put('/subscribers/:id/freeze', authenticateAdmin, toggleSubscriptionFreeze);
router.put('/plans/:id', authenticateAdmin, updatePlan);
router.delete('/plans/:id', authenticateAdmin, deletePlan);

export default router; 