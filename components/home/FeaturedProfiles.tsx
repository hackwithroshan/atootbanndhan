import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { UserIcon } from '../icons/UserIcon';
import { NEW_MALE_PROFILE_IMAGE_URL } from '../../constants';
import { MembershipTier, Gender } from '../../types';
import { MembershipBadge } from '../common/MembershipBadge';
import { API_URL } from '../../utils/api';

interface Profile {
  id: string; // Changed to string for MongoDB _id
  name: string;
  age: number;
  city: string;
  imageUrl: string;
  tagline: string;
  membershipTier?: MembershipTier;
}

interface FeaturedProfilesProps {
  onViewProfileClick: () => void; 
}

const ProfileCard: React.FC<Profile & { onViewProfileClick: () => void }> = ({ name, age, city, imageUrl, tagline, membershipTier, onViewProfileClick }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out group">
    <img src={imageUrl} alt={name} className="w-full h-64 object-cover" />
    <div className="p-5">
      <h3 className="text-xl font-semibold text-gray-800 mb-1 flex items-center">
        {name}
        <MembershipBadge tier={membershipTier} size="sm" className="ml-1.5" />
      </h3>
      <p className="text-sm text-gray-600 mb-1">{age} years, {city}</p>
      <p className="text-xs text-gray-500 mb-3 h-8 overflow-hidden">{tagline}</p>
      <Button 
        variant="primary" 
        size="sm" 
        className="w-full !bg-rose-500 group-hover:!bg-rose-600"
        onClick={onViewProfileClick}
      >
        View Profile
      </Button>
    </div>
  </div>
);

const FeaturedProfiles: React.FC<FeaturedProfilesProps> = ({ onViewProfileClick }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProfiles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/featured`);
        if (!res.ok) {
          throw new Error('Failed to fetch featured profiles');
        }
        const data = await res.json();
        const formattedProfiles = data.map((user: any) => ({
          id: user._id,
          name: user.fullName,
          age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 30, // Fallback age
          city: user.city || 'Unknown',
          imageUrl: user.profilePhotoUrl || (user.gender === Gender.FEMALE ? 'https://source.unsplash.com/random/300x400?person,indian,woman,smile' : NEW_MALE_PROFILE_IMAGE_URL),
          tagline: user.profileBio || `${user.occupation || 'Member'} from ${user.city || 'India'}.`,
          membershipTier: user.membershipTier,
        }));
        setProfiles(formattedProfiles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProfiles();
  }, []);


  return (
    <section id="featured-profiles" className="py-16 md:py-24 bg-rose-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-rose-700 tracking-tight">
            Meet Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">Featured Members</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Get a glimpse of some of the wonderful individuals looking for their life partner on Atut Bandhan.
          </p>
        </div>
        
        {isLoading && <p className="text-center">Loading profiles...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} {...profile} onViewProfileClick={onViewProfileClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProfiles;