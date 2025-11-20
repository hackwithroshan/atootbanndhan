import { createHandler, getUserIdFromAuth } from '../../../backend/utils/serverless';
import User from '../../../backend/models/User';
import { Gender } from '../../../types';

const handler = createHandler(async (req, res) => {
  if (req.method !== 'POST') {
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

  const { keyword, religion, education, profession, city, caste } = req.body;

  const query: any = {
    _id: { $ne: userId },
    gender: currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
  };

  if (keyword) {
    query.$or = [
      { fullName: { $regex: keyword, $options: 'i' } },
      { occupation: { $regex: keyword, $options: 'i' } }
    ];
  }
  if (religion) query.religion = religion;
  if (education) query.education = education;
  if (profession) query.occupation = profession;
  if (city) query.city = { $regex: city, $options: 'i' };
  if (caste) query.caste = { $regex: caste, $options: 'i' };

  const users = await User.find(query).limit(50).select('-password');
  res.status(200).json(users);
});

export default handler;
