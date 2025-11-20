
import express, { Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/conversations', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const conversations = await Conversation.find({ participants: req.user?.id })
        .populate('participants', 'fullName profilePhotoUrl')
        .sort({ 'lastMessage.timestamp': -1 });
    const formatted = conversations.map(c => ({
        id: c._id,
        otherParticipant: (c.participants as any[]).find(p => p._id.toString() !== req.user!.id),
        lastMessage: c.lastMessage
    }));
    res.json(formatted);
});

router.get('/:userId', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const conversation = await Conversation.findOne({ participants: { $all: [req.user!.id, req.params.userId] } });
    if (!conversation) return res.json([]);
    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
});

router.post('/:userId', auth, async (req: AuthRequest, res: ExpressResponse) => {
    let conversation = await Conversation.findOneAndUpdate(
        { participants: { $all: [req.user!.id, req.params.userId] } },
        { $setOnInsert: { participants: [req.user!.id, req.params.userId] } },
        { upsert: true, new: true }
    );
    const newMessage = new Message({
        conversation: conversation._id,
        sender: new mongoose.Types.ObjectId(req.user!.id),
        text: req.body.text
    });
    conversation.lastMessage = { text: req.body.text, sender: new mongoose.Types.ObjectId(req.user!.id), timestamp: new Date() };
    await Promise.all([newMessage.save(), conversation.save()]);
    res.status(201).json(newMessage);
});

export default router;
