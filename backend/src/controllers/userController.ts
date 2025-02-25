import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../utils/db';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
  id: number;
  email: string;
  username: string;
  password: string;
  role: string;
}

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user from database
    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('Found user:', { id: user.id, email: user.email, role: user.role });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last_login time
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const tokenPayload = { 
      id: user.id, 
      email: user.email,
      role: user.role
    };
    
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Using JWT secret:', secret.substring(0, 3) + '...');
    console.log('Generating token with payload:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      secret,
      { expiresIn: '24h' }
    );

    // Verify the token immediately to ensure it's valid
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      console.log('Token verification successful:', decoded);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(500).json({ message: 'Error generating secure token' });
    }

    // Send success response
    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
    console.log('Sending response:', { ...response, token: token.substring(0, 10) + '...' });
    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email and password are required' 
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    // Get the newly created user
    const [newUser] = await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser[0].id, 
        email: newUser[0].email, 
        username: newUser[0].username,
        role: newUser[0].role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send success response with token and user data
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        username: newUser[0].username,
        role: newUser[0].role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // The user data is attached to the request by the authenticateToken middleware
    const userId = (req as any).user.id;

    const [users] = await pool.query<User[]>(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data in a nested object
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error while getting profile' });
  }
};

export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Update user role to admin
    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      ['admin', userId]
    );

    // Check if user was found and updated
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the updated user
    const [users] = await pool.query<User[]>(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'User promoted to admin successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ message: 'Server error while promoting user' });
  }
};

export const getPasswordStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [users] = await pool.query<User[]>(
      'SELECT password, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only check password status for trial users
    const user = users[0];
    if (user.role !== 'trial') {
      res.json({ isPasswordSet: true });
      return;
    }

    // For trial users, check if password is set
    const isPasswordSet = user.password !== null && user.password !== '';
    res.json({ isPasswordSet });
    
  } catch (error) {
    console.error('Error checking password status:', error);
    res.status(500).json({ message: 'Server error while checking password status' });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const userId = (req as any).user.id;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password set successfully' });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ message: 'Failed to set password' });
  }
};