import { createHandler } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';
import { UserStatus } from '../../../types';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  // Fetch latest 4 active users regardless of tier for "Real Data" visibility.
  const users = await User.find({
    status: UserStatus.ACTIVE,
  })
    .sort({ createdAt: -1 }) // Newest first
    .limit(4)
    .select('-password');

  res.status(200).json(users);
});

export default handler;
