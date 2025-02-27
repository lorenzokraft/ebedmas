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

    // Check subscription and learner limit
    const [subscriptions] = await pool.query(
      `SELECT s.*, COUNT(l.id) as current_learner_count 
       FROM subscriptions s 
       LEFT JOIN learners l ON l.user_id = s.user_id 
       WHERE s.user_id = ? AND s.status != 'cancelled'
       GROUP BY s.id
       ORDER BY s.created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (!subscriptions || !subscriptions[0]) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    const subscription = subscriptions[0];
    const maxLearners = subscription.plan_type === 'single' ? 1 : subscription.children_count || 1;
    const currentLearnerCount = subscription.current_learner_count || 0;

    if (currentLearnerCount + learners.length > maxLearners) {
      return res.status(400).json({ 
        message: `Cannot add more learners. Your subscription plan allows a maximum of ${maxLearners} learner${maxLearners > 1 ? 's' : ''}.`
      });
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

export const deleteLearner = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const learnerId = parseInt(req.params.id);

    if (isNaN(learnerId)) {
      return res.status(400).json({ message: 'Invalid learner ID' });
    }

    // First check if the learner belongs to the user
    const [learners] = await pool.query<Learner[]>(
      'SELECT * FROM learners WHERE id = ? AND user_id = ?',
      [learnerId, userId]
    );

    if (learners.length === 0) {
      return res.status(404).json({ message: 'Learner not found or unauthorized' });
    }

    // Delete the learner
    await pool.query('DELETE FROM learners WHERE id = ? AND user_id = ?', [learnerId, userId]);

    res.json({ message: 'Learner deleted successfully' });
  } catch (error) {
    console.error('Error deleting learner:', error);
    res.status(500).json({ message: 'Failed to delete learner' });
  }
};
