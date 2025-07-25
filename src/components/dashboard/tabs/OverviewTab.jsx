import React from 'react';
import { Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../../contexts/ProjectContext';
import { useDashboardStore } from '../../../store/dashboardStore';
import { colors } from '../../../utils/colors';

/**
 * Overview Tab Component
 * Displays project overview, stats, and recent activity
 */
const OverviewTab = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const { 
    userAssessments, 
    guideProgress, 
    actionItems,
    getCompletedAssessments,
    getPendingActionItems
  } = useDashboardStore();

  const completedAssessments = getCompletedAssessments();
  const pendingActions = getPendingActionItems();

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      {currentProject && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
              Project Overview
            </h3>
            <button
              onClick={() => navigate('/account')}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                {currentProject.stage}
              </div>
              <div className="text-sm text-gray-500">Current Stage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                {completedAssessments.length}
              </div>
              <div className="text-sm text-gray-500">Assessments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.khaki }}>
                {Object.keys(guideProgress).length}
              </div>
              <div className="text-sm text-gray-500">Guides Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.navy }}>
                {pendingActions.length}
              </div>
              <div className="text-sm text-gray-500">Pending Actions</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
          Recent Activity
        </h3>
        
        <div className="space-y-4">
          {/* Recent Assessments */}
          {completedAssessments.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recent Assessments</h4>
              <div className="space-y-2">
                {completedAssessments.slice(0, 3).map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{assessment.type || 'Assessment'}</p>
                      <p className="text-sm text-gray-500">
                        Completed {new Date(assessment.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: colors.chestnut }}>
                        {Math.round(assessment.overallScore || 0)}%
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Action Items */}
          {actionItems.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recent Action Items</h4>
              <div className="space-y-2">
                {actionItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {completedAssessments.length === 0 && actionItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Start an assessment or create action items to see your activity here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;