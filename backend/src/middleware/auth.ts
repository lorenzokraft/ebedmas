import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none');
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Invalid authorization header format');
    return res.status(401).json({ message: 'Invalid authorization header format' });
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'No token provided' });
  }

  // Validate token format
  if (!token.match(/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/)) {
    console.log('Invalid token format');
    return res.status(403).json({ message: 'Invalid token format' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Using JWT secret for verification:', secret.substring(0, 3) + '...');
    console.log('Token to verify:', token.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log('Token verified successfully for user:', decoded.email);
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none');
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Invalid authorization header format');
    return res.status(401).json({ message: 'Invalid authorization header format' });
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'No token provided' });
  }

  // Validate token format
  if (!token.match(/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/)) {
    console.log('Invalid token format');
    return res.status(403).json({ message: 'Invalid token format' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Using JWT secret for verification:', secret.substring(0, 3) + '...');
    console.log('Token to verify:', token.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log('Token verified successfully for user:', decoded.email);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};
