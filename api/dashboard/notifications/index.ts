import { createHandler, getUserIdFromAuth } from '../../../../backend/utils/serverless';
import Notification from '../../../../backend/models/Notification';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const notifications = await Notification.find({ user: userId })
    .populate('senderProfile', 'fullName profilePhotoUrl')
    .sort({ createdAt: -1 })
    .limit(20);
    
  res.status(200).json(notifications);
});

export default handler;
