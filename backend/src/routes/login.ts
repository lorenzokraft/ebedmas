import { Router, Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { loginUser } from '../controllers/userController';

const router = Router();

router.post('/', loginUser as RequestHandler);

export default router; 