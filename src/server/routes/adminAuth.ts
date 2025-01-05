import express, { Request, Response } from 'express';
import pool from '../../utils/db.js';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const admin = rows[0];
    
    if (password !== admin.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 