
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import auth from '../middleware/auth';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations', auth, async (req: any, res: any) => {
  try {
    const conversations = await Conversation.find({ participants: req.user?.id })
      .populate('participants', 'fullName profilePhotoUrl isOnline lastActivity membershipTier')
      .sort({ 'lastMessage.timestamp': -1 });

    const formattedConversations = conversations.map(convo => {
        const otherParticipant = convo.participants.find(p => (p as any)._id.toString() !== req.user?.id);
        return {
            id: convo._id,
            otherParticipant: otherParticipant,
            lastMessage: convo.lastMessage
        };
    });

    res.json(formattedConversations);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/messages/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/:userId', auth, async (req: any, res: any) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user?.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, otherUserId] }
        });

        if (!conversation) {
            return res.json([]); // No conversation yet, return empty array
        }

        const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
        res.json(messages);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   POST api/messages/:userId
// @desc    Send a message to a user
// @access  Private
router.post('/:userId', auth, async (req: any, res: any) => {
    try {
        const { text } = req.body;
        const otherUserId = req.params.userId;
        const currentUserId = req.user?.id;

        if (!currentUserId) return res.status(401).json({ msg: 'User not authenticated' });

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, otherUserId] }
        });

        // If no conversation, create one
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
        
        // Update last message in conversation
        conversation.lastMessage = {
            text,
            sender: new mongoose.Types.ObjectId(currentUserId),
            timestamp: new Date()
        };

        await Promise.all([newMessage.save(), conversation.save()]);

        res.json(newMessage);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;
