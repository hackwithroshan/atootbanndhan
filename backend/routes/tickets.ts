
import express, { Response as ExpressResponse } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import Ticket from '../models/Ticket';
import { SupportTicketStatus } from '../../types';

const router = express.Router();

router.post('/', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const { subject, category, description } = req.body;
    const ticket = new Ticket({
        user: req.user!.id,
        subject,
        category,
        description,
        messages: [{ sender: 'user', text: description }]
    });
    await ticket.save();
    res.status(201).json(ticket);
});

router.get('/', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const tickets = await Ticket.find({ user: req.user?.id }).sort({ lastUpdatedDate: -1 });
    res.json(tickets);
});

router.put('/:id/reply', auth, async (req: AuthRequest, res: ExpressResponse) => {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user!.id });
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found.' });

    (ticket.messages as any).push({ sender: 'user', text: req.body.text });
    ticket.status = SupportTicketStatus.AWAITING_USER_REPLY;
    ticket.lastUpdatedDate = new Date();
    await ticket.save();
    res.json(ticket);
});

export default router;
