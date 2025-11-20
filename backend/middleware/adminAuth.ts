
import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import 'dotenv/config';
import User from '../models/User';
import { AdminRole } from '../../types';

// Augment the express Request type to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}


export default async function(req: any, res: any, next: any) {
  // Get token from header
  const token = req.headers['x-auth-token'] as string;

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
    
    const user = await User.findById(decoded.user.id).select('role');
    if (!user) {
        return res.status(401).json({ msg: 'User not found, authorization denied.' });
    }
    
    // Check if user has an admin role
    if (user.role === 'user' || !Object.values(AdminRole).includes(user.role as AdminRole)) {
        return res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }
    
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
