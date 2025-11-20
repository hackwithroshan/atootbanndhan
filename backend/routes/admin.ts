
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import adminAuth from '../middleware/adminAuth';
import User from '../models/User';
import { setupDatabase } from '../setup';

const router = express.Router();
// Protect all admin routes
router.use(auth, adminAuth);

router.get('/stats', async (req: AuthRequest, res: ExpressResponse) => {
    const totalUsers = await User.countDocuments();
    const paidMembers = await User.countDocuments({ membershipTier: { $ne: 'Free' } });
    res.json({
        totalUsers,
        activeToday: 0,
        newThisWeek: 0,
        paidMembers,
        freeMembers: totalUsers - paidMembers,
        reportedAccounts: 0,
        dailyRevenue: '₹0',
        pendingModerations: 0,
        pendingStories: 0,
        openComplaints: 0,
    });
});

router.get('/users', async (req: AuthRequest, res: ExpressResponse) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
});

router.get('/setup-database', async (req: ExpressRequest, res: ExpressResponse) => {
    const { secret } = req.query;
    if (!process.env.SETUP_SECRET_KEY || secret !== process.env.SETUP_SECRET_KEY) {
        return res.status(401).json({ msg: 'Unauthorized: Invalid secret key.' });
    }
    try {
        await setupDatabase();
        res.status(200).json({ msg: 'Database setup completed successfully.' });
    } catch (err: any) {
        res.status(500).json({ msg: 'Database setup failed.', error: err.message });
    }
});

export default router;
