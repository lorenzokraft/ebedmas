import { Router } from 'express';
import pool from '../utils/db';

const router = Router();

router.get('/test-db', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT 1');
    res.json({ message: 'Success', result });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error occurred',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router; 