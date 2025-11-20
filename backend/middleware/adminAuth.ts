
import { Response as ExpressResponse, NextFunction } from 'express';
import { AuthRequest } from './auth'; 
import User from '../models/User';
import { AdminRole } from '../../types';

export default async function(req: AuthRequest, res: ExpressResponse, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }
    const user = await User.findById(req.user.id).select('role');
    
    if (!user || user.role === 'user' || !Object.values(AdminRole).includes(user.role as AdminRole)) {
      return res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (err: any) {
    console.error('Admin auth middleware error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
}
