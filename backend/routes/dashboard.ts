
// FIX: Add explicit types for Express Request and Response
import express, { Request as ExpRequest, Response as ExpResponse } from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import Interest from '../models/Interest';
import Message from '../models/Message';
import Notification from '../models/Notification';
import { InterestStatus } from '../../types';

const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get key stats for the user dashboard
// @access  Private
router.get('/stats', auth, async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        const interestsReceived = await Interest.countDocuments({ toUser: userId, status: InterestStatus.PENDING });
        
        // Real profile view count from notifications
        const profileViews = await Notification.countDocuments({ user: userId, type: 'Profile View' });
        
        const newMessages = await Notification.countDocuments({ user: userId, type: 'Message Received', isRead: false });
        
        const shortlistedBy = await User.countDocuments({ shortlistedProfiles: userId });

        res.json({
            interestsReceived,
            profileViews,
            newMessages,
            shortlistedBy
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   GET api/dashboard/activity
// @desc    Get recent activity/notifications for the user
// @access  Private
router.get('/activity', auth, async (req: any, res: any) => {
    try {
        // Fetching from a dedicated Notification/Activity model
        const activities = await Notification.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(10);
        
        const formattedActivities = activities.map(act => ({
            id: act._id,
            title: act.title,
            createdAt: (act as any).createdAt
        }));

        // Returns empty array if no activity, ensuring no fake data.
        res.json(formattedActivities);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/dashboard/profile-completion
// @desc    Calculate and get profile completion percentage
// @access  Private
router.get('/profile-completion', auth, async (req: any, res: any) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const fields = [
            'fullName', 'gender', 'dateOfBirth', 'profileBio', 'profilePhotoUrl',
            'maritalStatus', 'religion', 'caste', 'city', 'state', 'country',
            'motherTongue', 'education', 'occupation', 'heightValue',
            'fatherOccupation', 'familyType',
            'dietaryHabits', 'hobbies'
        ];
        
        let completedFields = 0;
        fields.forEach(field => {
            const value = (user as any)[field];
            if (value && value !== '' && value !== null && value !== undefined) {
                completedFields++;
            }
        });
        
        const percentage = Math.round((completedFields / fields.length) * 100);
        
        // Also save it to the user profile for easy access
        user.profileCompletion = percentage;
        await user.save();
        
        res.json({ percentage });

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/dashboard/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/notifications', auth, async (req: any, res: any) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'User not authenticated' });
        const notifications = await Notification.find({ user: req.user.id })
            .populate('senderProfile', 'fullName profilePhotoUrl')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT api/dashboard/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put('/notifications/:id/read', auth, async (req: any, res: any) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'User not authenticated' });
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        res.json(notification);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT api/dashboard/notifications/read-all
// @desc    Mark all unread notifications as read
// @access  Private
router.put('/notifications/read-all', auth, async (req: any, res: any) => {
    try {
        if (!req.user) return res.status(401).json({ msg: 'User not authenticated' });
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.json({ msg: 'All notifications marked as read.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;
