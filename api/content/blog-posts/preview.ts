import { createHandler } from '../../../../backend/utils/serverless';
import BlogPost from '../../../../backend/models/BlogPost';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }
  const posts = await BlogPost.find().sort({ createdAt: -1 }).limit(3);
  res.status(200).json(posts);
});

export default handler;
