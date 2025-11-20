import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';
import { Gender } from '../../../types';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  const userId = await getUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return res.status(404).json({ msg: 'User not found' });
  }

  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

  const matches = await User.find({
    gender: oppositeGender,
    _id: { $ne: userId },
  }).select('-password').limit(20);

  const matchesWithPercentage = matches.map(match => {
    const user = match.toObject() as any;
    let score = 50;

    if (user.religion && currentUser.religion && user.religion === currentUser.religion) score += 20;
    if (user.motherTongue && currentUser.motherTongue && user.motherTongue === currentUser.motherTongue) score += 15;
    if (user.city && (currentUser as any).city && user.city.trim().toLowerCase() === (currentUser as any).city.trim().toLowerCase()) score += 10;
    
    const jitter = Math.floor(Math.random() * 11) - 5;
    score += jitter;

    if (score > 98) score = 98;
    if (score < 50) score = 50;
    
    return { ...user, matchPercentage: score };
  });

  matchesWithPercentage.sort((a, b) => b.matchPercentage - a.matchPercentage);
  res.status(200).json(matchesWithPercentage);
});

export default handler;
