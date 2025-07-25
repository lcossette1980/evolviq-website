import React from 'react';
import { BarChart3, Target, BookOpen, CheckCircle } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { colors } from '../../utils/colors';

/**
 * Dashboard Navigation Tabs Component
 * Provides tabbed navigation for different dashboard sections
 */
const DashboardTabs = () => {
  const { activeTab, setActiveTab } = useDashboardStore();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'journey', label: 'AI Journey', icon: Target },
    { id: 'projects', label: 'Projects & Guides', icon: BookOpen },
    { id: 'actions', label: 'Action Items', icon: CheckCircle }
  ];

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
        </nav>
      </div>
    </div>
  );
};

export default DashboardTabs;