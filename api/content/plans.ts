import { createHandler } from '../../../backend/utils/serverless';
import Plan from '../../../backend/models/Plan';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const plans = await Plan.find().sort({ priceMonthly: 1 });
  res.status(200).json(plans);
});

export default handler;
