
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import auth from '../middleware/auth';
import Interest from '../models/Interest';
import { InterestStatus, NotificationType } from '../../types';
import User from '../models/User';
import Notification from '../models/Notification';

const router = express.Router();

// @route   POST api/interests/:userId
// @desc    Send an interest to a user
// @access  Private
router.post('/:userId', auth, async (req: any, res: any) => {
  try {
    const fromUserId = req.user?.id;
    const toUserId = req.params.userId;

    if (fromUserId === toUserId) {
      return res.status(400).json({ msg: 'You cannot send an interest to yourself.' });
    }

    const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId).select('fullName'),
        User.findById(toUserId).select('fullName')
    ]);

    if (!fromUser || !toUser) {
        return res.status(404).json({ msg: 'User not found.' });
    }

    const existingInterest = await Interest.findOne({ fromUser: fromUserId, toUser: toUserId });
    if (existingInterest) {
      return res.status(400).json({ msg: 'Interest already sent.' });
    }
    
    // Check for mutual interest case
    const mutualInterest = await Interest.findOne({ fromUser: toUserId, toUser: fromUserId });
    
    let status = InterestStatus.PENDING;
    if (mutualInterest && mutualInterest.status === InterestStatus.PENDING) {
        status = InterestStatus.MUTUAL;
        mutualInterest.status = InterestStatus.MUTUAL;
        await mutualInterest.save();
    }

    const newInterest = new Interest({
      fromUser: fromUserId,
      toUser: toUserId,
      status: status,
    });
    
    await newInterest.save();

    // Create a notification for the recipient
    await Notification.create({
        user: toUserId,
        type: NotificationType.INTEREST_RECEIVED,
        title: `${fromUser.fullName} sent you an Interest!`,
        message: 'Check out their profile and respond to their interest.',
        senderProfile: fromUserId,
        redirectTo: '#/dashboard/expressed-interests'
    });

    res.json(newInterest);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/interests/sent
// @desc    Get all interests sent by the user
// @access  Private
router.get('/sent', auth, async (req: any, res: any) => {
  try {
    const interests = await Interest.find({ fromUser: req.user?.id }).populate('toUser', 'fullName age city profilePhotoUrl gender occupation religion caste education membershipTier');
    res.json(interests);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/interests/received
// @desc    Get all interests received by the user
// @access  Private
router.get('/received', auth, async (req: any, res: any) => {
  try {
    const interests = await Interest.find({ toUser: req.user?.id }).populate('fromUser', 'fullName age city profilePhotoUrl gender occupation religion caste education membershipTier');
    res.json(interests);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/interests/:id
// @desc    Update interest status (accept, decline, withdraw)
// @access  Private
router.put('/:id', auth, async (req: any, res: any) => {
  const { status } = req.body;
  const validStatuses = [InterestStatus.ACCEPTED, InterestStatus.DECLINED, InterestStatus.WITHDRAWN];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status update.' });
  }

  try {
    const interest = await Interest.findById(req.params.id);
    if (!interest) {
      return res.status(404).json({ msg: 'Interest not found.' });
    }

    // Authorization check
    const currentUserId = req.user?.id;
    if (status === InterestStatus.WITHDRAWN && interest.fromUser.toString() !== currentUserId) {
        return res.status(401).json({ msg: 'Not authorized to withdraw this interest.' });
    }
    if ((status === InterestStatus.ACCEPTED || status === InterestStatus.DECLINED) && interest.toUser.toString() !== currentUserId) {
        return res.status(401).json({ msg: 'Not authorized to respond to this interest.' });
    }
    
    // Check if accepting a pending interest makes it mutual
    if (status === InterestStatus.ACCEPTED) {
        const reverseInterest = await Interest.findOne({ fromUser: interest.toUser, toUser: interest.fromUser });
        if(reverseInterest) {
            interest.status = InterestStatus.MUTUAL;
            reverseInterest.status = InterestStatus.MUTUAL;
            await reverseInterest.save();
        } else {
            interest.status = InterestStatus.ACCEPTED;
        }
        
        // Notify the original sender that their interest was accepted
        const accepter = await User.findById(interest.toUser);
        if (accepter) {
            await Notification.create({
                user: interest.fromUser,
                type: NotificationType.INTEREST_ACCEPTED,
                title: `${accepter.fullName} accepted your interest!`,
                message: 'Congratulations! You can now start a conversation.',
                senderProfile: interest.toUser,
                redirectTo: '#/dashboard/messages'
            });
        }
    } else {
        interest.status = status;
    }


    await interest.save();
    res.json(interest);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
