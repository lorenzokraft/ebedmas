import express from 'express';
import { createQuoteRequest, getQuoteRequests, updateQuoteRequestStatus } from '../controllers/quoteRequestController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Public route for submitting quote requests
router.post('/', createQuoteRequest);

// Admin routes - protected
router.get('/', authenticateAdmin, getQuoteRequests);
router.put('/:id/status', authenticateAdmin, updateQuoteRequestStatus);

export default router;
