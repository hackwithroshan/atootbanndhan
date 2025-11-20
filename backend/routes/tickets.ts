
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import auth from '../middleware/auth';
import Ticket from '../models/Ticket';
import { SupportTicketStatus } from '../../types';

const router = express.Router();

// @route   POST api/tickets
// @desc    Create a new support ticket
// @access  Private
router.post('/', auth, async (req: any, res: any) => {
  const { subject, category, description } = req.body;
  try {
    const newTicket = new Ticket({
      user: req.user?.id,
      subject,
      category,
      description,
      messages: [{ sender: 'user', text: description }],
      status: SupportTicketStatus.OPEN,
    });
    await newTicket.save();
    res.json(newTicket);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/tickets
// @desc    Get all tickets for the logged-in user
// @access  Private
router.get('/', auth, async (req: any, res: any) => {
  try {
    const tickets = await Ticket.find({ user: req.user?.id }).sort({ lastUpdatedDate: -1 });
    res.json(tickets);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/tickets/:id/reply
// @desc    Add a reply to a ticket
// @access  Private
router.put('/:id/reply', auth, async (req: any, res: any) => {
  const { text } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    if (ticket.user.toString() !== req.user?.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const newMessage = {
      sender: 'user' as const,
      text,
    };
    
    (ticket.messages as any).push(newMessage);
    ticket.status = SupportTicketStatus.IN_PROGRESS; // Or a new status like 'Awaiting Admin Reply'
    ticket.lastUpdatedDate = new Date();

    await ticket.save();
    res.json(ticket);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
