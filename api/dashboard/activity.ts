import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import Notification from '../../../backend/models/Notification';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const activities = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
  
  const formattedActivities = activities.map(act => ({
    id: act._id,
    title: act.title,
    createdAt: (act as any).createdAt
  }));

  res.status(200).json(formattedActivities);
});

export default handler;
