import express from 'express';
import {
  getDefaultPricing,
  updateDefaultPricing,
  getSubscribers,
  toggleSubscriptionFreeze,
  updateAdditionalChildDiscount,
  updatePricingStructure,
  createTrialSubscription,
  cancelSubscription,
  getReceipts
} from '../controllers/subscriptionController';
import { authenticateToken, authenticateAdmin as authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/default-pricing', getDefaultPricing);
router.post('/trial', createTrialSubscription);

// Protected routes
router.get('/receipts', authenticateToken, getReceipts);

// Admin routes
router.put('/default-pricing', authenticateToken, authorizeAdmin, updateDefaultPricing);
router.get('/subscribers', authenticateToken, authorizeAdmin, getSubscribers);
router.put('/subscribers/:id/freeze', authenticateToken, authorizeAdmin, toggleSubscriptionFreeze);
router.put(
  '/additional-child-discount',
  authenticateToken,
  authorizeAdmin,
  updateAdditionalChildDiscount
);
router.post(
  '/update-pricing-structure',
  authenticateToken,
  authorizeAdmin,
  updatePricingStructure
);

export default router;