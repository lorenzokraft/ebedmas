import express from 'express';
import {
  getDefaultPricing,
  updateDefaultPricing,
  getSubscribers,
  toggleSubscriptionFreeze,
  updateAdditionalChildDiscount,
  updatePricingStructure,
  createTrialSubscription
} from '../controllers/subscriptionController';
import { authenticateToken, authenticateAdmin as authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/default-pricing', getDefaultPricing);
router.post('/trial', createTrialSubscription);

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
  async (req: Request, res: Response) => {
    try {
      await subscriptionController.updatePricingStructure();
      res.json({ 
        success: true, 
        message: 'Pricing structure updated successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update pricing structure' 
      });
    }
  }
);

export default router;