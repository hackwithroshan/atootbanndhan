import { createHandler, getUserIdFromAuth } from '../../../../backend/utils/serverless';
import User from '../../../../backend/models/User';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'PUT') {
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
  
  const { profileId } = req.query;
  const index = (user.shortlistedProfiles as any[]).indexOf(profileId as any);

  if (index > -1) {
    (user.shortlistedProfiles as any[]).splice(index, 1);
  } else {
    (user.shortlistedProfiles as any[]).push(profileId as any);
  }

  await user.save();
  res.status(200).json(user.shortlistedProfiles);
});

export default handler;
