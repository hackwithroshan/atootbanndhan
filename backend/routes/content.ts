
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import Faq from '../models/Faq';
import SuccessStory from '../models/SuccessStory';
import BlogPost from '../models/BlogPost';
import Offer from '../models/Offer';
import Plan from '../models/Plan'; // Import Plan model

const router = express.Router();

// @route   GET api/content/faqs
// @desc    Get all FAQs
// @access  Public
router.get('/faqs', async (req: any, res: any) => {
    try {
        const faqs = await Faq.find();
        res.json(faqs);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/content/success-stories
// @desc    Get approved success stories
// @access  Public
router.get('/success-stories', async (req: any, res: any) => {
    try {
        const stories = await SuccessStory.find({ status: 'Approved' }).sort({ weddingDate: -1 }).limit(3);
        res.json(stories);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   GET api/content/blog-posts/preview
// @desc    Get latest 3 blog posts for preview
// @access  Public
router.get('/blog-posts/preview', async (req: any, res: any) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 }).limit(3);
        res.json(posts);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/content/offers/active
// @desc    Get active, published offers
// @access  Public
router.get('/offers/active', async (req: any, res: any) => {
    try {
        const today = new Date();
        const offers = await Offer.find({
            status: 'Published',
            startDate: { $lte: today },
            endDate: { $gte: today }
        }).sort({ createdAt: -1 });
        res.json(offers);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/content/offers/all
// @desc    Get all offers (for admin panel)
// @access  Private (should have admin middleware)
router.get('/offers/all', async (req: any, res: any) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/content/plans
// @desc    Get all membership plans
// @access  Public
router.get('/plans', async (req: any, res: any) => {
    try {
        const plans = await Plan.find().sort({ priceMonthly: 1 }); // Sort by price
        res.json(plans);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


export default router;
