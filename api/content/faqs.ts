import { createHandler } from '../../../backend/utils/serverless';
import Faq from '../../../backend/models/Faq';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const faqs = await Faq.find();
  res.status(200).json(faqs);
});

export default handler;
