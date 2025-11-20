import { createHandler, getUserIdFromAuth } from '../../../../../backend/utils/serverless';
import Notification from '../../../../../backend/models/Notification';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const { id: notificationId } = req.query;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ msg: 'Notification not found' });
  }
  
  res.status(200).json(notification);
});

export default handler;
