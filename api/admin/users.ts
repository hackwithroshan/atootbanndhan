import { createAdminHandler } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';

const handler = createAdminHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(users);
});

export default handler;
