
import express, { Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { Gender } from '../../types';

const router = express.Router();

router.get('/', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser) return res.status(404).json({ msg: 'User not found' });

    const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
    const matches = await User.find({ gender: oppositeGender, _id: { $ne: req.user!.id } }).select('-password').limit(20);

    const matchesWithPercentage = matches.map(match => {
        const user = match.toObject() as any;
        let score = 50 + Math.floor(Math.random() * 11) - 5;
        if (user.religion === currentUser.religion) score += 20;
        if (user.motherTongue === currentUser.motherTongue) score += 15;
        score = Math.min(98, Math.max(50, score));
        return { ...user, matchPercentage: score };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    res.json(matchesWithPercentage);
});

export default router;
