import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../utils/db';

interface Learner extends RowDataPacket {
  id: number;
  name: string;
  grade: string;
  created_at: Date;
}

export const addLearners = async (req: Request, res: Response) => {
  try {
    const { learners } = req.body as { learners: Learner[] };
    const userId = (req as any).user.id;

    if (!Array.isArray(learners) || learners.length === 0) {
      return res.status(400).json({ message: 'No learners provided' });
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Add each learner
      for (const learner of learners) {
        const [result] = await connection.execute<ResultSetHeader>(
          'INSERT INTO learners (user_id, name, grade) VALUES (?, ?, ?)',
          [userId, learner.name, learner.grade]
        );
      }

      // Commit the transaction
      await connection.commit();
      connection.release();

      res.json({ 
        message: 'Learners added successfully',
        count: learners.length
      });
    } catch (error) {
      // If there's an error, rollback the transaction
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error adding learners:', error);
    res.status(500).json({ message: 'Failed to add learners' });
  }
};

export const getLearners = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [learners] = await pool.query<Learner[]>(
      'SELECT id, name, grade, created_at FROM learners WHERE user_id = ?',
      [userId]
    );

    res.json(learners);
  } catch (error) {
    console.error('Error fetching learners:', error);
    res.status(500).json({ message: 'Failed to fetch learners' });
  }
};
