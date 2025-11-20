import React, { useState, useEffect } from 'react';
import ProfileCompletionWidget from '../main/ProfileCompletionWidget';
import QuickStats from '../main/QuickStats';
import SuggestedMatches from '../main/SuggestedMatches';
import RecentActivity from '../main/RecentActivity';
import UpgradeTeaserDashboard from '../main/UpgradeTeaserDashboard';
import TrustScoreWidget from '../main/TrustScoreWidget';
import ReferralProgramWidget from '../main/ReferralProgramWidget';
import ProfileActionsWidget from '../main/ProfileActionsWidget';
import BadgesWidget from '../main/BadgesWidget';
import IcebreakerWidget from '../main/IcebreakerWidget';
import QuickActionsWidget from '../main/QuickActionsWidget';
import { UserFeatures, MatchProfile } from '../../../types'; 
import { API_URL } from '../../../utils/api';

interface DashboardHomeViewProps {
  userFeatures: UserFeatures;
  onUpgradeClick: () => void;
}

interface DashboardStats {
  interestsReceived: number;
  profileViews: number;
  newMessages: number;
  shortlistedBy: number;
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ userFeatures, onUpgradeClick }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token || '' };
      
      try {
        const [statsRes, completionRes, activityRes, matchesRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`, { headers }),
          fetch(`${API_URL}/api/dashboard/profile-completion`, { headers }),
          fetch(`${API_URL}/api/dashboard/activity`, { headers }),
          fetch(`${API_URL}/api/matches`, { headers }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (completionRes.ok) {
          const data = await completionRes.json();
          setProfileCompletion(data.percentage);
        }
        if (activityRes.ok) setRecentActivity(await activityRes.json());
        if (matchesRes.ok) setSuggestedMatches(await matchesRes.json());

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  const showUpgradeTeaser = !userFeatures.hasProfilePriorityInSearch; 

  if (isLoading) {
      return <div>Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <ProfileCompletionWidget percentage={profileCompletion} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickStats stats={stats} />
          <TrustScoreWidget profileCompletion={profileCompletion} /> 
          <IcebreakerWidget />
        </div>
        <div className="space-y-6">
          <ReferralProgramWidget />
          <ProfileActionsWidget />
          <BadgesWidget />
          <QuickActionsWidget />
        </div>
      </div>
      <SuggestedMatches matches={suggestedMatches.slice(0, 6)} />
      <RecentActivity activities={recentActivity} />
      {showUpgradeTeaser && <UpgradeTeaserDashboard onUpgradeClick={onUpgradeClick} />}
    </div>
  );
};

export default DashboardHomeView;