
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import auth from '../middleware/auth';
import User from '../models/User';
import Interest from '../models/Interest';
import { InterestStatus, MembershipTier, Gender } from '../../types';

const router = express.Router();

// @route   GET api/users/featured
// @desc    Get featured users for the homepage
// @access  Public
router.get('/featured', async (req: any, res: any) => {
    try {
        const users = await User.find({ 
          'membershipTier': { $in: [MembershipTier.GOLD, MembershipTier.DIAMOND] },
          'profilePhotoUrl': { $ne: null } 
        }).limit(4).select('-password');
        res.json(users);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/users/phonebook
// @desc    Get user's phonebook contacts (mutual interests)
// @access  Private
router.get('/phonebook', auth, async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        const mutualInterests = await Interest.find({
            $or: [{ fromUser: userId }, { toUser: userId }],
            status: { $in: [InterestStatus.ACCEPTED, InterestStatus.MUTUAL] }
        }).populate('fromUser', 'fullName profilePhotoUrl city occupation status').populate('toUser', 'fullName profilePhotoUrl city occupation status');

        const contactsMap = new Map();
        mutualInterests.forEach(interest => {
            const otherUser = (interest.fromUser as any)._id.toString() === userId ? interest.toUser : interest.fromUser;
            if (!contactsMap.has((otherUser as any)._id.toString())) {
                contactsMap.set((otherUser as any)._id.toString(), {
                    id: (otherUser as any)._id,
                    profileId: (otherUser as any)._id.toString(),
                    name: (otherUser as any).fullName,
                    photoUrl: (otherUser as any).profilePhotoUrl,
                    city: (otherUser as any).city,
                    status: interest.status,
                    notes: '', // Notes are client-side or would need another model
                });
            }
        });

        res.json(Array.from(contactsMap.values()));
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   GET api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req: any, res: any) => {
  try {
    let user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const allowedUpdates = [
        'fullName', 'dateOfBirth', 'gender', 'heightValue', 'heightUnit', 'weightValue', 'weightUnit', 'religion', 'caste', 'subCaste', 'motherTongue', 'maritalStatus', 'manglikStatus', 'profileCreatedBy',
        'fatherOccupation', 'motherOccupation', 'brothers', 'marriedBrothers', 'sisters', 'marriedSisters', 'familyType', 'familyValues', 'familyIncome',
        'dietaryHabits', 'smokingHabits', 'drinkingHabits', 'hobbies', 'generalHabits',
        'education', 'college', 'occupation', 'jobTitle', 'companyName', 'companyLocation', 'annualIncome', 'isAnnualIncomeVisible',
        'partnerPreferences', 'profileBio', 'photos', 'profilePhotoUrl', 'city', 'state', 'country'
    ];

    allowedUpdates.forEach(key => {
        if (req.body[key] !== undefined) {
            (user as any)[key] = req.body[key];
        }
    });
    
    await user.save();
    const userToReturn = user.toObject();
    delete (userToReturn as any).password;
    res.json(userToReturn);

  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/users/shortlist/:profileId
// @desc    Add or remove a profile from shortlist
// @access  Private
router.put('/shortlist/:profileId', auth, async (req: any, res: any) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        const profileId = req.params.profileId;
        const index = (user.shortlistedProfiles as any[]).indexOf(profileId as any);

        if (index > -1) {
            (user.shortlistedProfiles as any[]).splice(index, 1);
        } else {
            (user.shortlistedProfiles as any[]).push(profileId as any);
        }

        await user.save();
        res.json(user.shortlistedProfiles);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/users/shortlisted
// @desc    Get all shortlisted profiles for the user
// @access  Private
router.get('/shortlisted', auth, async (req: any, res: any) => {
    try {
        const user = await User.findById(req.user?.id).populate('shortlistedProfiles', 'fullName dateOfBirth city profilePhotoUrl occupation');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        res.json(user.shortlistedProfiles);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/users/search
// @desc    Search for users based on criteria
// @access  Private
router.post('/search', auth, async (req: any, res: any) => {
    try {
        const currentUser = await User.findById(req.user?.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { keyword, religion, education, profession, city, caste } = req.body;

        // Build query object
        const query: any = {
            _id: { $ne: req.user?.id }, // Exclude self
             // Default to searching opposite gender if not specified
            gender: currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
        };

        if (keyword) {
            query.$or = [
                { fullName: { $regex: keyword, $options: 'i' } },
                { occupation: { $regex: keyword, $options: 'i' } }
            ];
        }
        if (religion) query.religion = religion;
        if (education) query.education = education;
        if (profession) query.occupation = profession;
        if (city) query.city = { $regex: city, $options: 'i' };
        if (caste) query.caste = { $regex: caste, $options: 'i' };

        const users = await User.find(query).limit(50).select('-password');

        res.json(users);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;
