
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { Gender, UserStatus } from '../../types';

const router = express.Router();

// Get featured users for homepage
router.get('/featured', async (req: ExpressRequest, res: ExpressResponse) => {
    const users = await User.find({ status: UserStatus.ACTIVE }).sort({ createdAt: -1 }).limit(4).select('-password');
    res.json(users);
});

// Get current user's profile
router.get('/profile', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
});

// Update current user's profile
router.put('/profile', auth, async (req: AuthRequest, res: ExpressResponse) => {
    let user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const allowedUpdates = [
        'fullName', 'dateOfBirth', 'gender', 'heightValue', 'heightUnit', 'weightValue', 'weightUnit', 'religion', 'caste', 'subCaste', 'motherTongue', 'maritalStatus', 'manglikStatus', 'profileCreatedBy', 'fatherOccupation', 'motherOccupation', 'brothers', 'marriedBrothers', 'sisters', 'marriedSisters', 'familyType', 'familyValues', 'familyIncome', 'dietaryHabits', 'smokingHabits', 'drinkingHabits', 'hobbies', 'generalHabits', 'education', 'college', 'occupation', 'jobTitle', 'companyName', 'companyLocation', 'annualIncome', 'isAnnualIncomeVisible', 'partnerPreferences', 'profileBio', 'photos', 'profilePhotoUrl', 'city', 'state', 'country'
    ];
    allowedUpdates.forEach(key => { if (req.body[key] !== undefined) (user as any)[key] = req.body[key]; });
    
    await user.save();
    res.json(user);
});

// Search for users
router.post('/search', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser) return res.status(404).json({ msg: 'User not found' });
    
    const query: any = { _id: { $ne: req.user!.id }, gender: currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE };
    const { keyword, religion, city, caste } = req.body;
    if (keyword) query.$or = [{ fullName: { $regex: keyword, $options: 'i' } }];
    if (religion) query.religion = religion;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (caste) query.caste = { $regex: caste, $options: 'i' };

    const users = await User.find(query).limit(50).select('-password');
    res.json(users);
});

// Get shortlisted profiles
router.get('/shortlisted', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const user = await User.findById(req.user?.id).populate('shortlistedProfiles', 'fullName dateOfBirth city profilePhotoUrl occupation');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.shortlistedProfiles);
});

// Add/remove from shortlist
router.put('/shortlist/:profileId', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    const { profileId } = req.params;
    const index = (user.shortlistedProfiles as any[]).indexOf(profileId);
    if (index > -1) (user.shortlistedProfiles as any[]).splice(index, 1);
    else (user.shortlistedProfiles as any[]).push(profileId);
    
    await user.save();
    res.json(user.shortlistedProfiles);
});

export default router;
