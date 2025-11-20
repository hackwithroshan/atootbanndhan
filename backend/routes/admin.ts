
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import adminAuth from '../middleware/adminAuth';
import User from '../models/User';

const router = express.Router();

// Apply admin auth to all routes in this file
router.use(adminAuth);

// @route   GET api/admin/stats
// @desc    Get key stats for the admin dashboard
// @access  Private (Admin)
router.get('/stats', async (req: any, res: any) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeToday = await User.countDocuments({ lastLoginDate: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
        const newThisWeek = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        const paidMembers = await User.countDocuments({ membershipTier: { $ne: 'Free' } });

        res.json({
            totalUsers,
            activeToday,
            newThisWeek,
            paidMembers,
            // Add other mock stats for now until models are complete
            freeMembers: totalUsers - paidMembers,
            reportedAccounts: 0, 
            dailyRevenue: '₹0', 
            pendingModerations: 0,
            pendingStories: 0,
            openComplaints: 0,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/admin/users
// @desc    Get all users for management view
// @access  Private (Admin)
router.get('/users', async (req: any, res: any) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Placeholder routes for other admin views to make them data-driven
router.get('/moderation-queue/:type', async (req: any, res: any) => res.json([]));
router.get('/interests', async (req: any, res: any) => res.json([]));
router.get('/payments', async (req: any, res: any) => res.json([]));
router.get('/complaints', async (req: any, res: any) => res.json([]));
router.get('/admins', async (req: any, res: any) => res.json([]));
router.get('/audit-logs', async (req: any, res: any) => res.json([]));
router.get('/affiliates', async (req: any, res: any) => res.json([]));
router.get('/recycle-bin', async (req: any, res: any) => res.json([]));
router.get('/ab-tests', async (req: any, res: any) => res.json([]));


export default router;
