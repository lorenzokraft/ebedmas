import { Request, Response } from 'express';
import pool from '../utils/db';
import { RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role?: string;
  }
}

export const getGrades = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const adminId = req.user.id;

    // Get grades with basic info and creator name
    const [grades] = await pool.query(`
      SELECT 
        g.*, 
        au.name as created_by_name
      FROM grades g 
      LEFT JOIN admin_users au ON g.created_by = au.id 
      WHERE g.created_by = ?
      ORDER BY g.name`,
      [adminId]
    );

    // Get subjects and their stats for each grade
    const [subjectStats] = await pool.query(`
      SELECT 
        g.id as grade_id,
        s.id as subject_id,
        s.name as subject_name,
        COUNT(DISTINCT t.id) as topic_count,
        COUNT(DISTINCT q.id) as question_count
      FROM grades g
      LEFT JOIN questions q ON q.grade_id = g.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN topics t ON q.topic_id = t.id
      WHERE g.created_by = ?
      GROUP BY g.id, s.id, s.name
      ORDER BY g.name, s.name`,
      [adminId]
    );

    // Transform the data into a nested structure
    const gradesWithSubjects = grades.map((grade: any) => {
      const subjects = subjectStats
        .filter((stat: any) => stat.grade_id === grade.id)
        .map((stat: any) => ({
          id: stat.subject_id,
          name: stat.subject_name,
          topicCount: stat.topic_count || 0,
          questionCount: stat.question_count || 0
        }))
        .filter((subject: any) => subject.name !== null); // Filter out null subjects

      return {
        ...grade,
        subjects,
        totalTopics: subjects.reduce((sum: number, subj: any) => sum + subj.topicCount, 0),
        totalQuestions: subjects.reduce((sum: number, subj: any) => sum + subj.questionCount, 0)
      };
    });

    return res.json(gradesWithSubjects);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createGrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const adminId = req.user.id;

    const [result] = await pool.execute(
      'INSERT INTO grades (name, created_by) VALUES (?, ?)',
      [name, adminId]
    );
    res.status(201).json({ message: 'Grade created successfully' });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ message: 'Failed to create grade' });
  }
};

export const updateGrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const adminId = req.user.id;

    await pool.execute(
      'UPDATE grades SET name = ? WHERE id = ? AND created_by = ?',
      [name, id, adminId]
    );
    res.json({ message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Failed to update grade' });
  }
};

export const deleteGrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    await pool.execute(
      'DELETE FROM grades WHERE id = ? AND created_by = ?',
      [id, adminId]
    );
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Failed to delete grade' });
  }
};

export const getGradeStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;

    const [questionCounts] = await pool.query<RowDataPacket[]>(
      `SELECT g.id, COUNT(q.id) as count 
       FROM grades g 
       LEFT JOIN questions q ON q.grade_id = g.id 
       WHERE g.created_by = ?
       GROUP BY g.id`,
      [adminId]
    );

    const [topicCounts] = await pool.query<RowDataPacket[]>(
      `SELECT g.id, COUNT(DISTINCT t.id) as count 
       FROM grades g 
       LEFT JOIN questions q ON q.grade_id = g.id 
       LEFT JOIN topics t ON t.id = q.topic_id 
       WHERE g.created_by = ?
       GROUP BY g.id`,
      [adminId]
    );

    const stats = {
      questionCounts: questionCounts.reduce((acc: { [key: number]: number }, row: any) => {
        acc[row.id] = row.count;
        return acc;
      }, {}),
      topicCounts: topicCounts.reduce((acc: { [key: number]: number }, row: any) => {
        acc[row.id] = row.count;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting grade stats:', error);
    res.status(500).json({ message: 'Failed to get grade statistics' });
  }
};

export const getPublicGradeStats = async (req: Request, res: Response) => {
  try {
    // Get grades with their subjects and stats
    const [result] = await pool.query(`
      SELECT 
        g.id,
        g.name,
        s.id as subject_id,
        s.name as subject_name,
        COUNT(DISTINCT t.id) as topic_count,
        COUNT(DISTINCT q.id) as question_count
      FROM grades g
      CROSS JOIN subjects s
      LEFT JOIN topics t ON t.grade_id = g.id AND t.subject_id = s.id
      LEFT JOIN questions q ON q.grade_id = g.id AND q.subject_id = s.id
      GROUP BY g.id, g.name, s.id, s.name
      ORDER BY g.name, s.name
    `);

    // Transform the data into a nested structure
    const grades = [];
    let currentGrade = null;

    for (const row of result) {
      if (!currentGrade || currentGrade.id !== row.id) {
        currentGrade = {
          id: row.id,
          name: row.name,
          subjects: []
        };
        grades.push(currentGrade);
      }

      if (row.subject_id) {
        currentGrade.subjects.push({
          id: row.subject_id,
          name: row.subject_name,
          topicCount: row.topic_count || 0,
          questionCount: row.question_count || 0
        });
      }
    }

    res.json(grades);
  } catch (error) {
    console.error('Error getting public grade stats:', error);
    res.status(500).json({ message: 'Failed to get grade statistics' });
  }
};
