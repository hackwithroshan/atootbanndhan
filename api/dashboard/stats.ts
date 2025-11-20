import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';
import Interest from '../../../backend/models/Interest';
import Notification from '../../../backend/models/Notification';
import { InterestStatus } from '../../../types';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const interestsReceived = await Interest.countDocuments({ toUser: userId, status: InterestStatus.PENDING });
  const profileViews = await Notification.countDocuments({ user: userId, type: 'Profile View' });
  const newMessages = await Notification.countDocuments({ user: userId, type: 'Message Received', isRead: false });
  const shortlistedBy = await User.countDocuments({ shortlistedProfiles: userId });

  res.status(200).json({
    interestsReceived,
    profileViews,
    newMessages,
    shortlistedBy
  });
});

export default handler;
