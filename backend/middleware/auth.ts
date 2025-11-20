
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export default function(req: AuthRequest, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      // This is a server configuration error, so send 500
      return res.status(500).json({ msg: 'Server configuration error.' });
    }
    
    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };

    if (!decoded.user || !decoded.user.id) {
        return res.status(401).json({ msg: 'Token is not valid (malformed payload)' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
