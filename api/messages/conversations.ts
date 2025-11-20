import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import Conversation from '../../../backend/models/Conversation';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  
  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'fullName profilePhotoUrl isOnline lastActivity membershipTier')
    .sort({ 'lastMessage.timestamp': -1 });

  const formattedConversations = conversations.map(convo => {
    const otherParticipant = convo.participants.find(p => (p as any)._id.toString() !== userId);
    return {
      id: convo._id,
      otherParticipant: otherParticipant,
      lastMessage: convo.lastMessage
    };
  });

  res.status(200).json(formattedConversations);
});

export default handler;
