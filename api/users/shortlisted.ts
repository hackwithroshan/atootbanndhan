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

  const user = await User.findById(userId).populate('shortlistedProfiles', 'fullName dateOfBirth city profilePhotoUrl occupation');
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }
  
  res.status(200).json(user.shortlistedProfiles);
});

export default handler;
