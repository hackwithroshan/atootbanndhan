import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import Conversation from '../../../backend/models/Conversation';
import Message from '../../../backend/models/Message';
import mongoose from 'mongoose';

const handler = createHandler(async (req, res) => {
  const currentUserId = await getUserIdFromAuth(req);
  if (!currentUserId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }
  
  const { userId: otherUserId } = req.query;

  if (req.method === 'GET') {
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  }
  
  if (req.method === 'POST') {
    const { text } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, otherUserId]
      });
    }
    
    const newMessage = new Message({
      conversation: conversation._id,
      sender: new mongoose.Types.ObjectId(currentUserId),
      text
    });
    
    conversation.lastMessage = {
      text,
      sender: new mongoose.Types.ObjectId(currentUserId),
      timestamp: new Date()
    };

    await Promise.all([newMessage.save(), conversation.save()]);
    return res.status(201).json(newMessage);
  }

  return res.status(405).json({ msg: 'Method Not Allowed' });
});

export default handler;
