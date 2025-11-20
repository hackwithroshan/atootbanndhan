import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

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
  
  if (user.profileCompletion !== percentage) {
    user.profileCompletion = percentage;
    await user.save();
  }
  
  res.status(200).json({ percentage });
});

export default handler;
