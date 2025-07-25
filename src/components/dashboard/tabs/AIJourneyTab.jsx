import React from 'react';
import { Target, TrendingUp, BookOpen } from 'lucide-react';
import { useDashboardStore } from '../../../store/dashboardStore';
import { colors } from '../../../utils/colors';

/**
 * AI Journey Tab Component
 * Displays user's AI learning and implementation journey
 */
const AIJourneyTab = () => {
  const { userAssessments, getCompletedAssessments } = useDashboardStore();
  const completedAssessments = getCompletedAssessments();

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Target className="w-6 h-6 mr-3" style={{ color: colors.chestnut }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
            Your AI Journey
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="font-semibold mb-2">Assess</h4>
            <p className="text-sm text-gray-600">
              Evaluate your current AI knowledge and readiness
            </p>
            <div className="mt-2">
              <span className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                {completedAssessments.length}
              </span>
              <span className="text-sm text-gray-500 ml-1">completed</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="font-semibold mb-2">Learn</h4>
            <p className="text-sm text-gray-600">
              Follow personalized learning paths and guides
            </p>
            <div className="mt-2">
              <span className="text-2xl font-bold" style={{ color: colors.khaki }}>
                85%
              </span>
              <span className="text-sm text-gray-500 ml-1">progress</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold mb-2">Implement</h4>
            <p className="text-sm text-gray-600">
              Apply knowledge to real-world AI projects
            </p>
            <div className="mt-2">
              <span className="text-2xl font-bold" style={{ color: colors.navy }}>
                3
              </span>
              <span className="text-sm text-gray-500 ml-1">projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
          Assessment History
        </h3>
        
        {completedAssessments.length > 0 ? (
          <div className="space-y-4">
            {completedAssessments.map((assessment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{assessment.type || 'AI Assessment'}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(assessment.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                      <div className="text-lg font-bold" style={{ color: colors.chestnut }}>
                        {Math.round(assessment.overallScore || 0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Maturity Level</div>
                      <div className="text-lg font-bold" style={{ color: colors.khaki }}>
                        {assessment.maturityLevel || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No assessments completed yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Start your first assessment to track your AI journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIJourneyTab;