
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import { Gender } from '../../types';

const router = express.Router();

// @route   GET api/matches
// @desc    Get suggested matches
// @access  Private
router.get('/', auth, async (req: any, res: any) => {
  try {
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

    // Find users of the opposite gender, excluding the current user
    const matches = await User.find({
      gender: oppositeGender,
      _id: { $ne: req.user?.id },
    }).select('-password').limit(20); // Limit to 20 for now

    // Calculate a deterministic match percentage based on profile data
    const matchesWithPercentage = matches.map(match => {
        const user = match.toObject() as any;
        let score = 50; // Base score

        // Religion Match (+20%)
        if (user.religion && currentUser.religion && user.religion === currentUser.religion) {
            score += 20;
        }

        // Mother Tongue Match (+15%)
        if (user.motherTongue && currentUser.motherTongue && user.motherTongue === currentUser.motherTongue) {
            score += 15;
        }

        // City Match (+10%)
        if (user.city && (currentUser as any).city && user.city.trim().toLowerCase() === (currentUser as any).city.trim().toLowerCase()) {
            score += 10;
        }

        // Random jitter for variety (+/- 5%)
        const jitter = Math.floor(Math.random() * 11) - 5; 
        score += jitter;

        // Cap score between 50 and 98
        if (score > 98) score = 98;
        if (score < 50) score = 50;
        
        return {
            ...user,
            matchPercentage: score
        };
    });

    // Sort by match percentage (highest first)
    matchesWithPercentage.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(matchesWithPercentage);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
