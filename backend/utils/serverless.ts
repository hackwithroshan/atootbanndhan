import jwt from 'jsonwebtoken';
import 'dotenv/config';
import connectDB from '../db';
import User from '../models/User';
import { AdminRole } from '../../types';

// Augment the Vercel Request type to include a user property
declare module 'http' {
  interface IncomingMessage {
    user?: {
      id: string;
    };
  }
}

/**
 * A wrapper for Vercel Serverless Functions that handles database connection
 * and global error catching, ensuring a JSON response is always sent.
 * @param handler The main API logic function.
 */
export const createHandler = (handler: (req: any, res: any) => Promise<void>) => {
  return async (req: any, res: any) => {
    try {
      await connectDB();
      await handler(req, res);
    } catch (error: any) {
      console.error("Serverless Handler Error:", error);
      res.status(500).json({
        msg: "Server Error",
        error: error.message,
      });
    }
  };
};

/**
 * A wrapper for Admin-only Serverless Functions. It handles DB connection,
 * authenticates the token, and verifies the user has an admin role.
 * @param handler The main admin API logic function.
 */
export const createAdminHandler = (handler: (req: any, res: any) => Promise<void>) => {
  return createHandler(async (req, res) => {
    try {
      const userId = await getUserIdFromAuth(req);
      if (!userId) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }

      const adminUser = await User.findById(userId).select('role');
      if (!adminUser || adminUser.role === 'user' || !Object.values(AdminRole).includes(adminUser.role as AdminRole)) {
        return res.status(403).json({ msg: 'Access denied. Admin role required.' });
      }

      // Attach user to request for the handler to use
      req.user = { id: userId };
      await handler(req, res);

    } catch (error: any) {
      // Catches JWT errors from getUserIdFromAuth as well
      res.status(401).json({ msg: 'Token is not valid', error: error.message });
    }
  });
};


/**
 * Replaces the old auth middleware. Verifies the JWT from the header
 * and returns the user ID. Throws an error if the token is invalid or missing.
 * @param req The Vercel request object.
 * @returns The user ID from the token payload.
 */
export const getUserIdFromAuth = async (req: any): Promise<string | null> => {
  const token = req.headers['x-auth-token'] as string;
  if (!token) {
    return null; // Let the handler decide if this is a public or private route.
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  
  const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
  if (!decoded.user || !decoded.user.id) {
    throw new Error('Token is invalid or malformed.');
  }
  
  return decoded.user.id;
};
