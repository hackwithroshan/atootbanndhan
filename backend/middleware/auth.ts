
import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import 'dotenv/config';

// Augment the express Request type to include a user property
// This uses declaration merging to avoid creating a separate incompatible type.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}


export default function(req: any, res: any, next: any) {
  // Get token from header
  const token = req.headers['x-auth-token'] as string;

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
