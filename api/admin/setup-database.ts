import { createHandler } from '../../../backend/utils/serverless';
import { setupDatabase } from '../../../backend/setup';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  const { secret } = req.query;
  if (!process.env.SETUP_SECRET_KEY || secret !== process.env.SETUP_SECRET_KEY) {
    return res.status(401).json({ msg: 'Unauthorized: Invalid secret key.' });
  }

  await setupDatabase();
  res.status(200).json({ msg: 'Database setup completed successfully.' });
});

export default handler;
