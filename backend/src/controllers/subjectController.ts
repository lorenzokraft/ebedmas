import { Request, Response } from 'express';
import pool from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  }
}

interface Subject extends RowDataPacket {
  id: number;
  name: string;
  admin_id: number;
}

export const getSubjects = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const adminId = req.user.id;
    const [subjects] = await pool.query<Subject[]>('SELECT * FROM subjects WHERE admin_id = ?', [adminId]);
    return res.json(subjects);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const adminId = req.user.id;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO subjects (name, admin_id) VALUES (?, ?)',
      [name, adminId]
    );

    res.status(201).json({
      message: 'Subject created successfully',
      subjectId: result.insertId
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Failed to create subject' });
  }
};

export const updateSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const adminId = req.user.id;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE subjects SET name = ? WHERE id = ? AND admin_id = ?',
      [name, id, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Failed to update subject' });
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Check if there are any topics using this subject
    const [topics] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM topics WHERE subject_id = ?',
      [id]
    );

    if (topics[0].count > 0) {
      return res.status(400).json({
        message: 'Cannot delete subject that has topics associated with it'
      });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM subjects WHERE id = ? AND admin_id = ?',
      [id, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Failed to delete subject' });
  }
};

export const getSubjectStatsByYear = async (req: Request, res: Response) => {
  try {
    console.log('Fetching year stats...');
    
    // Get years with proper mapping
    const [years] = await pool.query<RowDataPacket[]>(`
      SELECT 
        g.id,
        g.name,
        CASE 
          WHEN g.id = 0 THEN 'R'
          ELSE CAST(g.id AS CHAR)
        END as level,
        CASE 
          WHEN g.id = 0 THEN 'Reception'
          ELSE CONCAT('Year ', g.id)
        END as title,
        (
          SELECT GROUP_CONCAT(t.name SEPARATOR ', ')
          FROM topics t
          WHERE t.grade_id = g.id
          LIMIT 5
        ) as description
      FROM grades g
      ORDER BY g.id;
    `);
    console.log('Years data:', years);

    // Get subjects with proper casing
    const [subjects] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.name,
        CONCAT(UPPER(SUBSTRING(s.name, 1, 1)), LOWER(SUBSTRING(s.name, 2))) as display_name
      FROM subjects s
      WHERE s.name IN ('english', 'maths', 'science')
      ORDER BY s.id;
    `);
    console.log('Subjects data:', subjects);

    // Get skills count with error handling
    const [skillCounts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.grade_id as year_id,
        t.subject_id,
        COUNT(DISTINCT sec.id) as skill_count
      FROM topics t
      LEFT JOIN sections sec ON sec.topic_id = t.id
      WHERE t.grade_id IS NOT NULL
      GROUP BY t.grade_id, t.subject_id;
    `);
    console.log('Skill counts:', skillCounts);

    // Format response with defensive programming
    const formattedYears = years.map(year => {
      const yearId = parseInt(year.id.toString(), 10);
      const yearLevel = yearId === 0 ? 'R' : yearId.toString();
      
      return {
        level: yearLevel,
        title: yearId === 0 ? 'Reception' : `Year ${yearId}`,
        description: year.description || 'Topics coming soon',
        subjects: subjects.map(subject => {
          const count = skillCounts.find(
            count => count.year_id === yearId && count.subject_id === subject.id
          );
          return {
            name: subject.name.toLowerCase(),
            display_name: subject.display_name,
            skills: count?.skill_count || 0
          };
        })
      };
    });

    console.log('Formatted response:', formattedYears);
    res.json(formattedYears);
  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Failed to fetch subject statistics', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

function getYearColor(yearName: string): string {
  const colors = {
    'Reception': 'bg-teal-500',
    '1': 'bg-purple-500',
    '2': 'bg-green-500',
    '3': 'bg-blue-500',
    '4': 'bg-red-500',
    '5': 'bg-yellow-500',
    '6': 'bg-indigo-500',
    '7': 'bg-pink-500',
    '8': 'bg-orange-500',
    '9': 'bg-cyan-500',
    '10': 'bg-lime-500',
    '11': 'bg-emerald-500',
    '12': 'bg-violet-500',
    '13': 'bg-gray-500'
  };
  return colors[yearName] || 'bg-gray-500';
}