import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ebedmas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Save quiz progress to the database
export const saveQuizProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { topic_id, question_id, is_correct, time_spent, score } = req.body;

    console.log('Saving quiz progress:', {
      userId,
      topic_id,
      question_id,
      is_correct,
      time_spent,
      score
    });

    // Validate required fields
    if (!topic_id || !question_id || is_correct === undefined || !time_spent || score === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Using standard SQL syntax compatible with both MySQL 8.3 and MariaDB 10.6
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO quiz_progress (
        user_id,
        topic_id,
        question_id,
        is_correct,
        time_spent,
        score,
        created_at,
        updated_at
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `, [
      userId,
      topic_id,
      question_id,
      is_correct ? 1 : 0,
      time_spent,
      score
    ]);

    console.log('Quiz progress saved:', result);

    res.status(201).json({
      message: 'Quiz progress saved successfully',
      progressId: result.insertId
    });
  } catch (error) {
    console.error('Error saving quiz progress:', error);
    res.status(500).json({ message: 'Error saving quiz progress' });
  }
};

// Get quiz progress for a user
export const getQuizProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Using standard SQL syntax compatible with both MySQL 8.3 and MariaDB 10.6
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        qp.topic_id,
        qp.question_id,
        qp.is_correct,
        qp.time_spent,
        qp.score,
        qp.created_at,
        COALESCE(t.name, 'Unknown') as subject_name
      FROM quiz_progress qp
      INNER JOIN topics t ON qp.topic_id = t.id
      WHERE qp.user_id = ?
        AND qp.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
      ORDER BY qp.created_at ASC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({ message: 'Error fetching quiz progress' });
  }
};

// Get quiz progress for a user
export const getQuizProgressForTopic = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { topicId } = req.params;

    console.log('Getting quiz progress for user:', userId, 'and topic:', topicId);

    // Get quiz progress from the database
    const [progress] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM quiz_progress 
       WHERE user_id = ? AND topic_id = ? 
       ORDER BY created_at DESC`,
      [userId, topicId]
    );

    res.json(progress);
  } catch (error) {
    console.error('Error getting quiz progress:', error);
    res.status(500).json({ message: 'Failed to get quiz progress' });
  }
};
