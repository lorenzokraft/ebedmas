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