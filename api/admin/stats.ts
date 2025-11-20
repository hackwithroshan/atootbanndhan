import { createAdminHandler } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';

const handler = createAdminHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  const totalUsers = await User.countDocuments();
  const activeToday = await User.countDocuments({ lastLoginDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
  const newThisWeek = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  const paidMembers = await User.countDocuments({ membershipTier: { $ne: 'Free' } });

  res.status(200).json({
    totalUsers,
    activeToday,
    newThisWeek,
    paidMembers,
    freeMembers: totalUsers - paidMembers,
    reportedAccounts: 0,
    dailyRevenue: '₹0',
    pendingModerations: 0,
    pendingStories: 0,
    openComplaints: 0,
  });
});

export default handler;
