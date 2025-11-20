
import express, { Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Interest from '../models/Interest';
import Notification from '../models/Notification';
import { InterestStatus } from '../../types';

const router = express.Router();

router.get('/stats', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const interestsReceived = await Interest.countDocuments({ toUser: req.user!.id, status: InterestStatus.PENDING });
    const profileViews = await Notification.countDocuments({ user: req.user!.id, type: 'Profile View' });
    const shortlistedBy = await User.countDocuments({ shortlistedProfiles: req.user!.id });
    res.json({ interestsReceived, profileViews, newMessages: 0, shortlistedBy });
});

router.get('/activity', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const activities = await Notification.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(10);
    res.json(activities.map(a => ({ id: a._id, title: a.title, createdAt: (a as any).createdAt })));
});

router.get('/profile-completion', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    let completedFields = 0;
    const fields = ['fullName', 'profileBio', 'profilePhotoUrl', 'caste', 'city', 'education', 'occupation', 'hobbies'];
    fields.forEach(f => { if ((user as any)[f]) completedFields++; });
    const percentage = Math.round((completedFields / fields.length) * 100);

    if (user.profileCompletion !== percentage) {
        user.profileCompletion = percentage;
        await user.save();
    }
    res.json({ percentage });
});

router.get('/notifications', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const notifications = await Notification.find({ user: req.user?.id }).populate('senderProfile', 'fullName profilePhotoUrl').sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
});

router.put('/notifications/read-all', auth, async (req: AuthRequest, res: ExpressResponse) => {
    await Notification.updateMany({ user: req.user?.id, isRead: false }, { isRead: true });
    res.json({ msg: 'All marked as read.' });
});

router.put('/notifications/:id/read', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user?.id }, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    res.json(notification);
});

export default router;
