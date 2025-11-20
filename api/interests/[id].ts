import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import Interest from '../../../backend/models/Interest';
import User from '../../../backend/models/User';
import Notification from '../../../backend/models/Notification';
import { InterestStatus, NotificationType } from '../../../types';

const handler = createHandler(async (req, res) => {
  const currentUserId = await getUserIdFromAuth(req);
  if (!currentUserId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  if (req.method === 'PUT') {
    const { status } = req.body;
    const { id: interestId } = req.query;

    const validStatuses = [InterestStatus.ACCEPTED, InterestStatus.DECLINED, InterestStatus.WITHDRAWN];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status update.' });
    }

    const interest = await Interest.findById(interestId);
    if (!interest) {
      return res.status(404).json({ msg: 'Interest not found.' });
    }

    if (status === InterestStatus.WITHDRAWN && interest.fromUser.toString() !== currentUserId) {
      return res.status(401).json({ msg: 'Not authorized to withdraw this interest.' });
    }
    if ((status === InterestStatus.ACCEPTED || status === InterestStatus.DECLINED) && interest.toUser.toString() !== currentUserId) {
      return res.status(401).json({ msg: 'Not authorized to respond to this interest.' });
    }
    
    if (status === InterestStatus.ACCEPTED) {
      const reverseInterest = await Interest.findOne({ fromUser: interest.toUser, toUser: interest.fromUser });
      if(reverseInterest) {
        interest.status = InterestStatus.MUTUAL;
        reverseInterest.status = InterestStatus.MUTUAL;
        await reverseInterest.save();
      } else {
        interest.status = InterestStatus.ACCEPTED;
      }
      
      const accepter = await User.findById(interest.toUser);
      if (accepter) {
        await Notification.create({
          user: interest.fromUser,
          type: NotificationType.INTEREST_ACCEPTED,
          title: `${accepter.fullName} accepted your interest!`,
          message: 'Congratulations! You can now start a conversation.',
          senderProfile: interest.toUser,
          redirectTo: '#/dashboard/messages'
        });
      }
    } else {
      interest.status = status;
    }

    await interest.save();
    return res.status(200).json(interest);
  }

  return res.status(405).json({ msg: 'Method Not Allowed' });
});

export default handler;
