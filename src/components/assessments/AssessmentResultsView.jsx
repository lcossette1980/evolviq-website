import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, Download } from 'lucide-react';
import assessmentAPI from '../../services/assessmentAPI';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';

/**
 * Detailed Assessment Results View
 * Shows comprehensive assessment results, learning plan, and action items
 */
const AssessmentResultsView = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadAssessmentDetails = useCallback(async () => {
    if (!user || !assessmentId) return;
    try {
      const assessments = await assessmentAPI.getUserAssessments(user.uid);
      const found = assessments.find(a => a.id === assessmentId || a.assessmentType === assessmentId);
      setAssessment(found);
    } catch (error) {
      console.error('Error loading assessment details:', error);
    } finally {
      setLoading(false);
    }
  }, [user, assessmentId]);

  useEffect(() => {
    loadAssessmentDetails();
  }, [loadAssessmentDetails]);

  const getReadinessLevel = (score) => {
    if (score >= 4) return { text: 'Ready to Lead', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 3) return { text: 'Ready to Implement', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 2) return { text: 'Ready to Learn', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Needs Foundation', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Assessment not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overallScore = assessment.overallScore || assessment.results?.overallScore || 0;
  const maturityScores = assessment.maturityScores || assessment.results?.maturityScores || {};
  const learningPlan = assessment.learningPlan || assessment.results?.learningPlan || [];
  const actionItems = assessment.actionItems || assessment.results?.actionItems || [];
  const readinessLevel = getReadinessLevel(overallScore);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.charcoal }}>
                  {assessment.assessmentType === 'ai_knowledge' ? 'AI Knowledge Assessment' : 'Assessment'} Results
                </h1>
                <p className="text-gray-600">
                  Completed {new Date(assessment.completedAt || assessment.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'scores', label: 'Detailed Scores' },
              { id: 'learning', label: 'Learning Plan' },
              { id: 'actions', label: 'Action Items' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Assessment Score</h3>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: colors.chestnut }}>
                  {Math.round(overallScore * (overallScore > 10 ? 1 : 20))}%
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${readinessLevel.bg} ${readinessLevel.color}`}>
                  {readinessLevel.text}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Learning Items</span>
                  <span className="font-semibold">{learningPlan.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Action Items</span>
                  <span className="font-semibold">{actionItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assessment Type</span>
                  <span className="font-semibold">AI Knowledge</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recommended Next Steps</h3>
              <div className="space-y-3">
                {learningPlan.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.estimatedHours}h • {item.phase}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Detailed Maturity Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(maturityScores).map(([category, score]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium capitalize">{category.replace('_', ' ')}</h4>
                    <span className="text-lg font-bold" style={{ color: colors.chestnut }}>
                      {Math.round(score * 20)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round(score * 20)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Score: {score.toFixed(1)} out of 5.0
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Your Personalized Learning Plan</h3>
            <div className="space-y-4">
              {learningPlan.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.estimatedHours} hours
                        </span>
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {item.phase}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Action Items</h3>
            <div className="space-y-4">
              {actionItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.estimatedHours} hours
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status?.replace('_', ' ') || 'pending'}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.priority} priority
                        </span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResultsView;