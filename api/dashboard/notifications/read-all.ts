import { createHandler, getUserIdFromAuth } from '../../../../backend/utils/serverless';
import Notification from '../../../../backend/models/Notification';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  
  res.status(200).json({ msg: 'All notifications marked as read.' });
});

export default handler;
