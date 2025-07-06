import { useEffect, useState } from 'react';
import { MessageCircle, Calendar, Activity } from 'lucide-react';

interface UserStatsProps {
  userId: string;
}

interface UserStats {
  totalComments: number;
  memberSince: string;
  lastActivity: string;
}

export default function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/user/stats?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-gray-700">Comments Posted</span>
          </div>
          <span className="font-semibold text-gray-900">
            {stats?.totalComments || 0}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-gray-700">Member Since</span>
          </div>
          <span className="font-semibold text-gray-900">
            {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            }) : 'N/A'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-gray-700">Last Active</span>
          </div>
          <span className="font-semibold text-gray-900">
            {stats?.lastActivity ? new Date(stats.lastActivity).toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric'
            }) : 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
}
