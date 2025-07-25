import React from 'react';
import { Settings, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../utils/colors';

/**
 * Dashboard Header Component
 * Displays welcome message, user status, and navigation controls
 */
const DashboardHeader = ({ user, isPremium }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.charcoal }}>
          Welcome back, {user?.name || 'Member'}
        </h1>
        <p className="text-gray-600">Track your AI implementation journey</p>
      </div>
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        <div className="flex items-center space-x-2">
          {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
          <span className="text-sm font-medium">
            {isPremium ? 'Premium' : 'Free'} Member
          </span>
        </div>
        <button
          onClick={() => navigate('/account')}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;