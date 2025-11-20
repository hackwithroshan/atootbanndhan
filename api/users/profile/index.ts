import { createHandler, getUserIdFromAuth } from '../../../../backend/utils/serverless';
import User from '../../../../backend/models/User';

const handler = createHandler(async (req, res) => {
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  // Handle GET request to fetch profile
  if (req.method === 'GET') {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.status(200).json(user);
  }

  // Handle PUT request to update profile
  if (req.method === 'PUT') {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

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
    return res.status(200).json(userToReturn);
  }

  // If method is not GET or PUT
  return res.status(405).json({ msg: 'Method Not Allowed' });
});

export default handler;
