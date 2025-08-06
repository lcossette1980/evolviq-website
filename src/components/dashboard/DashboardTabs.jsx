import React from 'react';
import { BarChart3, Target, BookOpen, CheckCircle, Wrench, Lock } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { colors } from '../../utils/colors';
import { useUserTier } from '../../hooks/useUserTier';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Navigation Tabs Component
 * Provides tabbed navigation for different dashboard sections
 * Respects tier-based access restrictions
 */
const DashboardTabs = () => {
  const { activeTab, setActiveTab } = useDashboardStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tierConfig, canAccess, isFreeTier } = useUserTier();

  const allTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, alwaysShow: true },
    { id: 'assessments', label: 'Assessments', icon: Target, alwaysShow: true },
    { id: 'tools', label: 'Interactive Tools', icon: Wrench, alwaysShow: true },
    { id: 'learning', label: 'Learning Plan', icon: BookOpen, alwaysShow: true },
    { id: 'projects', label: 'Projects', icon: BookOpen, requiresAccess: 'projects' },
    { id: 'actions', label: 'Action Items', icon: CheckCircle, requiresPremium: true }
  ];

  // Filter tabs based on user's tier
  const tabs = allTabs.filter(tab => {
    if (tab.alwaysShow) return true;
    if (tab.requiresAccess && !canAccess(tab.requiresAccess)) return false;
    if (tab.requiresPremium && isFreeTier) return false;
    return true;
  });

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'text-chestnut'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeTab === tab.id ? { borderBottomColor: colors.chestnut } : {}}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
          
          {/* Show locked tabs for free users */}
          {isFreeTier && (
            <>
              {!canAccess('projects') && (
                <button
                  onClick={() => {
                    if (user && !user.isAnonymous) {
                      navigate('/membership');
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-600"
                  title="Upgrade to access Projects"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Projects & Guides
                  <span className="ml-2 text-xs bg-chestnut text-white px-2 py-0.5 rounded-full">PRO</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (user && !user.isAnonymous) {
                    navigate('/membership');
                  } else {
                    navigate('/login');
                  }
                }}
                className="flex items-center py-2 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-600"
                title="Upgrade to access Action Items"
              >
                <Lock className="w-4 h-4 mr-2" />
                Action Items
                <span className="ml-2 text-xs bg-chestnut text-white px-2 py-0.5 rounded-full">PRO</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default DashboardTabs;