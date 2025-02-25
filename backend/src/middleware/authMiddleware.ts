import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const ADMIN_ROLES = ['admin', 'super_admin'];

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    console.log('Decoded token:', { ...decoded, iat: undefined, exp: undefined });
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    console.log('Decoded admin token:', { ...decoded, iat: undefined, exp: undefined });
    (req as any).user = decoded;

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(decoded.role)) {
      console.log('Access denied: User role is not admin:', decoded.role);
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    console.log('Admin access granted for user:', decoded.email);
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  console.log('Checking admin role for user:', user);
  
  if (!ADMIN_ROLES.includes(user.role)) {
    console.log('Access denied: User role is not admin:', user.role);
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  console.log('Admin role confirmed for user:', user.email);
  next();
};