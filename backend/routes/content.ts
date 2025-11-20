
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import Faq from '../models/Faq';
import SuccessStory from '../models/SuccessStory';
import BlogPost from '../models/BlogPost';
import Offer from '../models/Offer';
import Plan from '../models/Plan';

const router = express.Router();

router.get('/faqs', async (req: ExpressRequest, res: ExpressResponse) => res.json(await Faq.find()));
router.get('/success-stories', async (req: ExpressRequest, res: ExpressResponse) => res.json(await SuccessStory.find({ status: 'Approved' }).limit(3)));
router.get('/blog-posts/preview', async (req: ExpressRequest, res: ExpressResponse) => res.json(await BlogPost.find().sort({ createdAt: -1 }).limit(3)));
router.get('/plans', async (req: ExpressRequest, res: ExpressResponse) => res.json(await Plan.find().sort({ priceMonthly: 1 })));

router.get('/offers/active', async (req: ExpressRequest, res: ExpressResponse) => {
    const today = new Date();
    res.json(await Offer.find({ status: 'Published', startDate: { $lte: today }, endDate: { $gte: today } }));
});

router.get('/offers/all', async (req: ExpressRequest, res: ExpressResponse) => res.json(await Offer.find().sort({ createdAt: -1 })));

export default router;
