import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';

// Define the authenticated request type
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  }
}

// Define a custom type for authenticated handlers
type AuthHandler = RequestHandler<
  any,
  any,
  any,
  any,
  { user: { id: number; email: string; role: string } }
>;

import { authenticateToken } from '../middleware/auth';
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../controllers/subjectController';

const router = Router();

// Protected routes (authentication needed)
router.use(authenticateToken as RequestHandler);

// Subject routes with proper typing
router.get('/', getSubjects as unknown as AuthHandler);
router.post('/', createSubject as unknown as AuthHandler);
router.put('/:id', updateSubject as unknown as AuthHandler);
router.delete('/:id', deleteSubject as unknown as AuthHandler);

export default router; 