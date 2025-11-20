import { createHandler } from '../../../backend/utils/serverless';
import SuccessStory from '../../../backend/models/SuccessStory';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const stories = await SuccessStory.find({ status: 'Approved' }).sort({ weddingDate: -1 }).limit(3);
  res.status(200).json(stories);
});

export default handler;
