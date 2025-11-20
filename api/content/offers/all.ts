// This should be an admin-protected route.
// For now, it's public as per the original router, but using createAdminHandler is recommended.
import { createHandler } from '../../../../backend/utils/serverless';
import Offer from '../../../../backend/models/Offer';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const offers = await Offer.find().sort({ createdAt: -1 });
  res.status(200).json(offers);
});

export default handler;
