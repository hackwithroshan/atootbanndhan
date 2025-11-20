
import express, { Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import Interest from '../models/Interest';
import User from '../models/User';
import Notification from '../models/Notification';
import { InterestStatus, NotificationType } from '../../types';

const router = express.Router();

router.get('/sent', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const interests = await Interest.find({ fromUser: req.user?.id }).populate('toUser', 'fullName city profilePhotoUrl gender occupation membershipTier');
    res.json(interests);
});

router.get('/received', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const interests = await Interest.find({ toUser: req.user?.id }).populate('fromUser', 'fullName city profilePhotoUrl gender occupation membershipTier');
    res.json(interests);
});

router.put('/:id', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const { status } = req.body;
    const interest = await Interest.findById(req.params.id);
    if (!interest) return res.status(404).json({ msg: 'Interest not found.' });

    if (status === InterestStatus.ACCEPTED) {
        interest.status = InterestStatus.ACCEPTED;
        const accepter = await User.findById(req.user?.id);
        if (accepter) {
            await Notification.create({
                user: interest.fromUser,
                type: NotificationType.INTEREST_ACCEPTED,
                title: `${accepter.fullName} accepted your interest!`,
                message: 'You can now start a conversation.',
                senderProfile: interest.toUser,
            });
        }
    } else {
        interest.status = status;
    }
    
    await interest.save();
    res.json(interest);
});

export default router;
