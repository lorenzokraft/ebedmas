import { Router, Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { authenticateToken } from '../middleware/auth';
import pool from '../utils/db';
import { RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  }
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  name?: string;
  role: string;
}

const router = Router();

const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

router.get('/profile', authenticateToken as RequestHandler, getUserProfile as RequestHandler);

export default router; 