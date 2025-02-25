import { Request, Response } from 'express';
import pool from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthenticatedRequest } from '../middleware/auth';

// Get sections by topic ID
export const getSectionsByTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    const [sections] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, COUNT(q.id) as questionCount 
       FROM sections s 
       LEFT JOIN questions q ON s.id = q.section_id 
       WHERE s.topic_id = ? 
       GROUP BY s.id`,
      [topicId]
    );

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Failed to fetch sections' });
  }
};

// Get question count for a section
export const getQuestionCount = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM questions WHERE section_id = ?',
      [sectionId]
    );

    res.json((result[0] as RowDataPacket).count);
  } catch (error) {
    console.error('Error fetching question count:', error);
    res.status(500).json({ message: 'Failed to fetch question count' });
  }
};
