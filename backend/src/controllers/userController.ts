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

interface SubscriptionDetails {
  plan: string;
  type: 'monthly' | 'annually';
  maxLearners: number;
  additionalLearners: number;
  subjects: string[];
  cardType?: string;
  cardLastFour?: string;
  cardHolderName?: string;
  price: number;
  billingEmail: string;
  nextBillingDate: string;
}

const getSubscriptionDetails = async (userId: number): Promise<SubscriptionDetails> => {
  try {
    console.log('Fetching subscription details for user:', userId);
    
    // Get subscription details from the database
    const [subscriptions] = await pool.query<RowDataPacket[]>(
      `SELECT s.plan_type, s.billing_cycle, s.children_count, s.selected_subject,
              s.end_date, s.status, s.created_at, s.trial_end_date,
              s.card_last_four, s.card_holder_name
       FROM subscriptions s
       WHERE s.user_id = ? AND s.status = 'trial'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    console.log('Raw subscription data:', subscriptions);

    if (subscriptions.length === 0) {
      console.log('No subscription found for user');
      return {
        plan: 'Free',
        type: 'monthly',
        maxLearners: 0,
        subjects: [],
        nextBillingDate: new Date().toISOString(),
        cardLastFour: null,
        cardHolderName: null
      };
    }

    const subscription = subscriptions[0];
    console.log('Found subscription:', subscription);

    // Map plan types to display names
    const planDisplayNames: { [key: string]: string } = {
      'all_access': 'All Access',
      'combo': 'Combo Package',
      'single': 'Single Subject'
    };

    // Get subjects based on plan type
    let subjects: string[] = [];
    if (subscription.plan_type === 'all_access') {
      subjects = ['Mathematics', 'English', 'Science'];
    } else if (subscription.plan_type === 'combo') {
      subjects = ['Mathematics', 'English'];
    } else if (subscription.plan_type === 'single' && subscription.selected_subject) {
      subjects = [subscription.selected_subject];
    }

    // Calculate next billing date based on subscription status
    let nextBillingDate: string;
    if (subscription.status === 'trial') {
      if (!subscription.trial_end_date) {
        const trialEnd = new Date(subscription.created_at);
        trialEnd.setDate(trialEnd.getDate() + 7);
        nextBillingDate = trialEnd.toISOString();
      } else {
        nextBillingDate = new Date(subscription.trial_end_date).toISOString();
      }
    } else {
      nextBillingDate = subscription.end_date;
    }

    const result = {
      plan: planDisplayNames[subscription.plan_type] || subscription.plan_type,
      type: subscription.billing_cycle,
      maxLearners: parseInt(subscription.children_count) || 0,
      subjects,
      nextBillingDate,
      cardLastFour: subscription.card_last_four,
      cardHolderName: subscription.card_holder_name
    };

    console.log('Returning subscription details:', result);
    return result;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
};

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
    const userId = (req as any).user.id;
    console.log('Getting profile for user:', userId);
    
    const [users] = await pool.query<User[]>(
      'SELECT id, email, username, role, isSubscribed, created_at, last_login, status FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    console.log('User found:', user);
    
    const subscriptionDetails = await getSubscriptionDetails(userId);
    console.log('Subscription details:', subscriptionDetails);
    
    const response = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isSubscribed: user.isSubscribed,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      status: user.status,
      firstName: user.username.split(' ')[0] || '',
      lastName: user.username.split(' ').slice(1).join(' ') || '',
      phone: '',
      subscription: subscriptionDetails
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
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

    // Update user's password and role
    await pool.query(
      'UPDATE users SET password = ?, role = ? WHERE id = ?',
      [hashedPassword, 'user', userId]
    );

    // Generate a new token with updated role
    const token = jwt.sign(
      { id: userId, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Password set successfully',
      token,
      role: 'user'
    });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ message: 'Failed to set password' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.body;

    // Update the user in the database
    const [result] = await pool.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, userId]
    );

    // Fetch the updated user data
    const [users] = await pool.query<User[]>(
      'SELECT id, email, username, role, isSubscribed, created_at, last_login, status FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isSubscribed: user.isSubscribed,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      status: user.status,
      firstName: user.username.split(' ')[0] || '',
      lastName: user.username.split(' ').slice(1).join(' ') || '',
      phone: '',
      subscription: {
        plan: user.isSubscribed ? 'Premium' : 'Free',
        maxLearners: user.isSubscribed ? 5 : 1,
        additionalLearners: 0
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [users] = await pool.query<User[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkEmailExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    const exists = Array.isArray(users) && users.length > 0;

    res.json({ exists });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Server error checking email' });
  }
};