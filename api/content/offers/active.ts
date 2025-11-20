import { createHandler } from '../../../../backend/utils/serverless';
import Offer from '../../../../backend/models/Offer';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const today = new Date();
  const offers = await Offer.find({
    status: 'Published',
    startDate: { $lte: today },
    endDate: { $gte: today }
  }).sort({ createdAt: -1 });
  res.status(200).json(offers);
});

export default handler;
