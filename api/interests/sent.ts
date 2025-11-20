import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import Interest from '../../../backend/models/Interest';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const interests = await Interest.find({ fromUser: userId }).populate('toUser', 'fullName age city profilePhotoUrl gender occupation religion caste education membershipTier');
  res.status(200).json(interests);
});

export default handler;
