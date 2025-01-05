import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import path from 'path';
import fs from 'fs';

interface AdminUser extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get admin user from database
    const [admins] = await pool.query<AdminUser[]>(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = admins[0];

    // Check status before validating password
    if (admin.status === 'inactive') {
      return res.status(403).json({ 
        message: 'Your account has been disabled. Please contact the administrator.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create user object to store in token and send to client
    const userData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    // Generate JWT token
    const token = jwt.sign(
      userData,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send success response
    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getRecentUsers = async (req: Request, res: Response) => {
  try {
    console.log('Fetching recent users...'); // Debug log

    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        username, 
        email, 
        created_at,
        last_login,
        status,
        isSubscribed,
        role
      FROM users 
      ORDER BY created_at DESC`
    );

    console.log('Found users:', users); // Debug log

    // Transform the data with actual values from database
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      last_login: user.last_login,
      status: user.status,
      isSubscribed: Boolean(user.isSubscribed), // Convert tinyint to boolean
      role: user.role
    }));

    console.log('Formatted users:', formattedUsers); // Debug log

    res.json({ 
      users: formattedUsers,
      total: formattedUsers.length,
      page: 1,
      totalPages: Math.ceil(formattedUsers.length / 15)
    });
  } catch (error) {
    console.error('Error in getRecentUsers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch recent users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const getUserCount = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );
    
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ message: 'Failed to get user count' });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const offset = (page - 1) * limit;
    const isAdmin = req.path.includes('/admins');

    // Get total count
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM users WHERE role = ?',
      [isAdmin ? 'admin' : 'user']
    );
    const total = countResult[0].total;

    // Get paginated users with all relevant fields
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        username, 
        email, 
        created_at,
        last_login,
        status,
        isSubscribed,
        role
      FROM users 
      WHERE role = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [isAdmin ? 'admin' : 'user', limit, offset]
    );

    // Transform the data
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      last_login: user.last_login,
      status: user.status,
      isSubscribed: Boolean(user.isSubscribed),
      role: user.role
    }));

    res.json({
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getGrades = async (req: Request, res: Response) => {
  try {
    const [grades] = await pool.query<RowDataPacket[]>(
      `SELECT 
        g.id,
        g.name,
        g.created_at,
        g.created_by,
        a.name as created_by_name,
        COUNT(q.id) as questions_count
      FROM grades g
      LEFT JOIN admin_users a ON g.created_by = a.id
      LEFT JOIN questions q ON g.id = q.grade_id
      GROUP BY g.id
      ORDER BY g.created_at DESC`
    );
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Failed to fetch grades' });
  }
};

const getSubjects = async (req: Request, res: Response) => {
  try {
    const [subjects] = await pool.query<RowDataPacket[]>(
      `SELECT 
        s.id,
        s.name,
        s.created_at,
        s.created_by,
        a.name as created_by_name,
        COUNT(t.id) as topics_count
      FROM subjects s
      LEFT JOIN admin_users a ON s.created_by = a.id
      LEFT JOIN topics t ON s.id = t.subject_id
      GROUP BY s.id
      ORDER BY s.created_at DESC`
    );
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

const getTopicsBySubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [topics] = await pool.query(
      'SELECT * FROM topics WHERE subject_id = ? ORDER BY name',
      [id]
    );
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Failed to fetch topics' });
  }
};

const createQuestion = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const {
      question_text,
      question_type,
      options,
      correct_answer,
      explanation,
      grade_id,
      subject_id,
      topic_id,
      order_num,
      audio_url
    } = req.body;

    const adminId = (req as AuthenticatedRequest).user?.id;

    // Validate question type
    const validTypes = ['text', 'draw', 'paint', 'drag', 'click'];
    if (!validTypes.includes(question_type)) {
      return res.status(400).json({ 
        message: 'Invalid question type. Must be one of: ' + validTypes.join(', ')
      });
    }

    // Validate required fields
    if (!question_text || !correct_answer || !grade_id || !subject_id || !topic_id) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        receivedFields: {
          question_text,
          correct_answer,
          grade_id,
          subject_id,
          topic_id
        }
      });
    }

    // Handle uploaded files
    let imagesArray = null;
    let explanation_image = null;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      console.log('Processing files:', files);
      
      // Handle question images
      if (files.images) {
        imagesArray = files.images.map(file => `/uploads/questions/${file.filename}`);
        console.log('Saved images paths:', imagesArray);
      }

      // Handle explanation image
      if (files.explanation_image && files.explanation_image[0]) {
        explanation_image = `/uploads/questions/${files.explanation_image[0].filename}`;
        console.log('Saved explanation image path:', explanation_image);
      }
    }

    // Parse and validate options
    let formattedOptions;
    try {
      // If options is a string, try to parse it
      const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      
      // Ensure it's an array
      formattedOptions = Array.isArray(parsedOptions) ? parsedOptions : [parsedOptions];

      // For click-type questions, ensure options are properly formatted
      if (question_type === 'click') {
        formattedOptions = formattedOptions.map((opt: string) => opt.trim());
      }

      // Convert to string for storage
      formattedOptions = JSON.stringify(formattedOptions);
    } catch (error) {
      console.error('Error parsing options:', error, { options });
      return res.status(400).json({ 
        message: 'Invalid options format',
        error: error instanceof Error ? error.message : 'Unknown error',
        receivedOptions: options
      });
    }

    console.log('Attempting to insert question with data:', {
      question_text,
      question_type,
      formattedOptions,
      correct_answer,
      explanation,
      grade_id,
      subject_id,
      topic_id,
      order_num,
      adminId,
      audio_url,
      images: imagesArray,
      explanation_image
    });

    // Insert question into database
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO questions (
        question_text,
        question_type,
        options,
        correct_answer,
        explanation,
        grade_id,
        subject_id,
        topic_id,
        order_num,
        created_by,
        audio_url,
        images,
        explanation_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question_text,
        question_type,
        formattedOptions,
        correct_answer,
        explanation,
        grade_id,
        subject_id,
        topic_id,
        order_num || 0,
        adminId,
        audio_url || null,
        imagesArray ? JSON.stringify(imagesArray) : null,
        explanation_image
      ]
    );

    res.status(201).json({
      message: 'Question created successfully',
      questionId: (result as ResultSetHeader).insertId
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ 
      message: 'Failed to create question',
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Unknown error'
    });
  }
};

const createTopic = async (req: Request, res: Response) => {
  try {
    const { name, subject_id } = req.body;
    // Get admin ID from the token
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Validate required fields
    if (!name || !subject_id || !adminId) {
      return res.status(400).json({ 
        message: 'Topic name, subject and admin ID are required' 
      });
    }

    // Insert topic into database with created_by
    const [result] = await pool.query(
      'INSERT INTO topics (name, subject_id, created_by) VALUES (?, ?, ?)',
      [name, subject_id, adminId]
    );

    res.status(201).json({
      message: 'Topic created successfully',
      topicId: result.insertId
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ 
      message: 'Failed to create topic',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const getAllTopics = async (req: Request, res: Response) => {
  try {
    const [topics] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.name,
        t.subject_id,
        t.created_at,
        t.created_by,
        s.name as subject_name,
        a.name as created_by_name
      FROM topics t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN admin_users a ON t.created_by = a.id
      ORDER BY t.created_at DESC`
    );

    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch topics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if topic exists
    const [existingTopic] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM topics WHERE id = ?',
      [id]
    );

    if (!existingTopic[0]) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Delete the topic
    await pool.query('DELETE FROM topics WHERE id = ?', [id]);

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ 
      message: 'Failed to delete topic',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const getTopicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Get topic with authorization check
    const [topics] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.name,
        t.subject_id,
        t.created_at,
        t.created_by,
        s.name as subject_name
      FROM topics t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ? AND (t.created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!topics[0]) {
      return res.status(404).json({ message: 'Topic not found or unauthorized' });
    }

    res.json(topics[0]);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Failed to fetch topic' });
  }
};

const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject_id } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if topic exists and admin has permission
    const [topics] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM topics 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!topics[0]) {
      return res.status(404).json({ message: 'Topic not found or unauthorized' });
    }

    // Update topic
    await pool.query(
      'UPDATE topics SET name = ?, subject_id = ? WHERE id = ?',
      [name, subject_id, id]
    );

    res.json({ message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Failed to update topic' });
  }
};

const createSubject = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        message: 'Subject name is required' 
      });
    }

    // Insert subject into database
    const [result] = await pool.query(
      'INSERT INTO subjects (name, created_by) VALUES (?, ?)',
      [name, adminId]
    );

    res.status(201).json({
      message: 'Subject created successfully',
      subjectId: result.insertId
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ 
      message: 'Failed to create subject',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if subject exists and admin has permission
    const [subjects] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM subjects 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!subjects[0]) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    await pool.query(
      'UPDATE subjects SET name = ? WHERE id = ?',
      [name, id]
    );

    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Failed to update subject' });
  }
};

const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if subject exists and admin has permission
    const [subjects] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM subjects 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!subjects[0]) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    // Delete all topics first (due to foreign key constraint)
    await pool.query('DELETE FROM topics WHERE subject_id = ?', [id]);
    
    // Then delete the subject
    await pool.query('DELETE FROM subjects WHERE id = ?', [id]);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Failed to delete subject' });
  }
};

const createGrade = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    if (!name) {
      return res.status(400).json({ message: 'Grade name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO grades (name, created_by) VALUES (?, ?)',
      [name, adminId]
    );

    res.status(201).json({
      message: 'Grade created successfully',
      gradeId: result.insertId
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ message: 'Failed to create grade' });
  }
};

const updateGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if grade exists and admin has permission
    const [grades] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM grades 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!grades[0]) {
      return res.status(404).json({ message: 'Grade not found or unauthorized' });
    }

    await pool.query(
      'UPDATE grades SET name = ? WHERE id = ?',
      [name, id]
    );

    res.json({ message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Failed to update grade' });
  }
};

const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if grade exists and admin has permission
    const [grades] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM grades 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!grades[0]) {
      return res.status(404).json({ message: 'Grade not found or unauthorized' });
    }

    // Delete the grade
    await pool.query('DELETE FROM grades WHERE id = ?', [id]);

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Failed to delete grade' });
  }
};

const getQuestions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM questions'
    );
    const total = countResult[0].total;

    // Get paginated questions
    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.options,
        q.correct_answer,
        q.explanation,
        q.grade_id,
        q.subject_id,
        q.topic_id,
        q.created_by,
        q.created_at,
        q.updated_at,
        q.order_num,
        g.name as grade_name,
        s.name as subject_name,
        t.name as topic_name,
        a.name as created_by_name
      FROM questions q
      LEFT JOIN grades g ON q.grade_id = g.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN topics t ON q.topic_id = t.id
      LEFT JOIN admin_users a ON q.created_by = a.id
      ORDER BY q.grade_id, q.subject_id, q.topic_id, q.order_num ASC, q.created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Parse options for each question
    const formattedQuestions = questions.map(q => {
      let parsedOptions = [];
      try {
        if (typeof q.options === 'string' && q.options.includes(',')) {
          parsedOptions = q.options.split(',').map(opt => opt.trim());
        } else if (typeof q.options === 'string') {
          try {
            parsedOptions = JSON.parse(q.options);
          } catch {
            parsedOptions = [q.options];
          }
        }
      } catch (error) {
        console.error('Error parsing options for question:', q.id, error);
        parsedOptions = [];
      }

      return {
        ...q,
        options: parsedOptions
      };
    });

    res.json({
      questions: formattedQuestions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if question exists and admin has permission
    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM questions 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!questions[0]) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    await pool.query('DELETE FROM questions WHERE id = ?', [id]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
};

const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      question_text,
      question_type,
      options,
      correct_answer,
      explanation,
      grade_id,
      subject_id,
      topic_id,
      order_num,
      audio_url
    } = req.body;

    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if question exists and admin has permission
    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM questions 
       WHERE id = ? AND (created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!questions[0]) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    // Validate question type
    const validTypes = ['text', 'draw', 'paint', 'drag', 'click'];
    if (!validTypes.includes(question_type)) {
      return res.status(400).json({ 
        message: 'Invalid question type. Must be one of: ' + validTypes.join(', ')
      });
    }

    // Get image path if uploaded
    const question_image = req.file ? `/uploads/questions/${req.file.filename}` : questions[0].question_image;

    // Ensure options is properly formatted as JSON
    const formattedOptions = Array.isArray(options) 
      ? JSON.stringify(options)
      : JSON.stringify([options]);

    await pool.query(
      `UPDATE questions SET 
        question_text = ?,
        question_type = ?,
        options = ?,
        correct_answer = ?,
        explanation = ?,
        grade_id = ?,
        subject_id = ?,
        topic_id = ?,
        order_num = ?,
        audio_url = ?,
        question_image = ?
      WHERE id = ?`,
      [
        question_text,
        question_type,
        formattedOptions,
        correct_answer,
        explanation,
        grade_id,
        subject_id,
        topic_id,
        order_num || 0,
        audio_url || null,
        question_image,
        id
      ]
    );

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
};

const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Get question with authorization check
    const [questions] = await pool.query<RowDataPacket[]>(
      `SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.options,
        q.correct_answer,
        q.explanation,
        q.grade_id,
        q.subject_id,
        q.topic_id,
        q.created_by,
        q.created_at,
        q.updated_at,
        q.order_num,
        q.audio_url,
        g.name as grade_name,
        s.name as subject_name,
        t.name as topic_name,
        a.name as created_by_name
      FROM questions q
      LEFT JOIN grades g ON q.grade_id = g.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      LEFT JOIN topics t ON q.topic_id = t.id
      LEFT JOIN admin_users a ON q.created_by = a.id
      WHERE q.id = ? AND (q.created_by = ? OR ? IN (SELECT id FROM admin_users WHERE role = 'super_admin'))`,
      [id, adminId, adminId]
    );

    if (!questions[0]) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    // Parse the options with error handling
    let parsedOptions = [];
    try {
      if (questions[0].options) {
        // If options is a string with commas, split it
        if (typeof questions[0].options === 'string' && questions[0].options.includes(',')) {
          parsedOptions = questions[0].options.split(',').map(opt => opt.trim());
        } else {
          // Try to parse as JSON, if fails, wrap in array
          try {
            parsedOptions = JSON.parse(questions[0].options);
          } catch {
            parsedOptions = [questions[0].options];
          }
        }
      }
    } catch (error) {
      console.error('Error parsing options:', error);
      parsedOptions = [];
    }

    // Return formatted question
    const question = {
      ...questions[0],
      options: parsedOptions
    };

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
};

const getAdmins = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM admin_users'
    );
    const total = countResult[0].total;

    // Get paginated admins
    const [admins] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM admin_users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      admins,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Failed to fetch administrators' });
  }
};

const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const creatorId = (req as AuthenticatedRequest).user?.id;

    // For first admin creation, skip super_admin check
    if (creatorId) {
      // Check if creator is super_admin
      const [creator] = await pool.query<RowDataPacket[]>(
        'SELECT role FROM admin_users WHERE id = ?',
        [creatorId]
      );

      if (!creator[0] || creator[0].role !== 'super_admin') {
        return res.status(403).json({ 
          message: 'Only super administrators can create new admins' 
        });
      }
    }

    // Validate role
    const validRoles = ['admin', 'super_admin', 'editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ') 
      });
    }

    // Check if email already exists
    const [existingAdmin] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existingAdmin[0]) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const [result] = await pool.query(
      `INSERT INTO admin_users (
        name,
        email,
        password,
        role,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, 'active', creatorId || null]
    );

    res.status(201).json({
      message: 'Administrator created successfully',
      adminId: result.insertId
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Failed to create administrator' });
  }
};

const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if updater is super_admin
    const [updater] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM admin_users WHERE id = ?',
      [adminId]
    );

    if (!updater[0] || updater[0].role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only super administrators can update admin details' 
      });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'super_admin', 'editor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Invalid role. Must be one of: ' + validRoles.join(', ') 
        });
      }
    }

    // Check if email exists for other admin
    if (email) {
      const [existingAdmin] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM admin_users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existingAdmin[0]) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];

    if (name) {
      updateFields.push('name = ?');
      queryParams.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      queryParams.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      queryParams.push(hashedPassword);
    }
    if (role) {
      updateFields.push('role = ?');
      queryParams.push(role);
    }

    queryParams.push(id);

    if (updateFields.length > 0) {
      await pool.query(
        `UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
    }

    res.json({ message: 'Administrator updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Failed to update administrator' });
  }
};

const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if deleter is super_admin
    const [deleter] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM admin_users WHERE id = ?',
      [adminId]
    );

    if (!deleter[0] || deleter[0].role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only super administrators can delete admins' 
      });
    }

    // Prevent self-deletion
    if (id === adminId.toString()) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }

    // Delete admin
    await pool.query('DELETE FROM admin_users WHERE id = ?', [id]);

    res.json({ message: 'Administrator deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Failed to delete administrator' });
  }
};

const updateAdminStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if updater is super_admin
    const [updater] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM admin_users WHERE id = ?',
      [adminId]
    );

    if (!updater[0] || updater[0].role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only super administrators can update admin status' 
      });
    }

    // Prevent self-status update
    if (id === adminId.toString()) {
      return res.status(400).json({ 
        message: 'Cannot update your own status' 
      });
    }

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be either active or inactive' 
      });
    }

    // Update status
    await pool.query(
      'UPDATE admin_users SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Administrator status updated successfully' });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ message: 'Failed to update administrator status' });
  }
};

const getAdminById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthenticatedRequest).user?.id;

    // Check if requester is super_admin
    const [requester] = await pool.query<RowDataPacket[]>(
      'SELECT role FROM admin_users WHERE id = ?',
      [adminId]
    );

    if (!requester[0] || requester[0].role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Only super administrators can view admin details' 
      });
    }

    // Get admin details
    const [admins] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM admin_users 
      WHERE id = ?`,
      [id]
    );

    if (!admins[0]) {
      return res.status(404).json({ message: 'Administrator not found' });
    }

    res.json(admins[0]);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ message: 'Failed to fetch administrator details' });
  }
};

// Export all functions at once
export {
  login,
  getRecentUsers,
  getUserCount,
  getUsers,
  getGrades,
  getSubjects,
  getTopicsBySubject,
  createQuestion,
  createTopic,
  getAllTopics,
  deleteTopic,
  getTopicById,
  updateTopic,
  createSubject,
  updateSubject,
  deleteSubject,
  createGrade,
  updateGrade,
  deleteGrade,
  getQuestions,
  deleteQuestion,
  updateQuestion,
  getQuestionById,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  getAdminById
};
