import React from 'react';
import { Target, TrendingUp, BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../store/dashboardStore';
import { colors } from '../../../utils/colors';

/**
 * AI Journey Tab Component
 * Displays user's AI learning and implementation journey
 */
const AIJourneyTab = () => {
  const navigate = useNavigate();
  const { userAssessments, getCompletedAssessments } = useDashboardStore();
  
  const completedAssessments = getCompletedAssessments();
  
  // Filter assessments by type
  const aiKnowledgeAssessment = completedAssessments.find(a => a.assessmentType === 'ai_knowledge');
  const changeReadinessAssessment = completedAssessments.find(a => a.assessmentType === 'change_readiness');
  
  const getScoreColor = (score) => {
    if (score >= 80) return colors.forest;
    if (score >= 60) return colors.chestnut;
    if (score >= 40) return colors.khaki;
    return colors.navy;
  };


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

      {/* Assessment Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6" style={{ color: colors.charcoal }}>
          Your Assessment Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Knowledge Assessment */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                <h4 className="font-semibold">AI Knowledge Assessment</h4>
              </div>
              {aiKnowledgeAssessment ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {aiKnowledgeAssessment ? (
              <div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Overall Score</span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: getScoreColor(Math.round((aiKnowledgeAssessment.overallScore || aiKnowledgeAssessment.results?.overallScore || 0) * 20)) }}
                    >
                      {Math.round((aiKnowledgeAssessment.overallScore || aiKnowledgeAssessment.results?.overallScore || 0) * 20)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round((aiKnowledgeAssessment.overallScore || aiKnowledgeAssessment.results?.overallScore || 0) * 20)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Completed {new Date(aiKnowledgeAssessment.completedAt || aiKnowledgeAssessment.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {aiKnowledgeAssessment.learningPlan?.length || 0} learning items • {aiKnowledgeAssessment.actionItems?.length || 0} actions
                  </div>
                  <button
                    onClick={() => {
                      const state = {
                        results: { ...(aiKnowledgeAssessment.results || {}), assessmentId: aiKnowledgeAssessment.id },
                        orgInfo: aiKnowledgeAssessment.orgInfo || null,
                        responses: aiKnowledgeAssessment.responses || {}
                      };
                      navigate('/dashboard/assessments/ai-knowledge/results', { state });
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">Start your AI knowledge assessment</p>
                <button
                  onClick={() => navigate('/tools/ai-knowledge-navigator')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Take Assessment
                </button>
              </div>
            )}
          </div>

          {/* Change Readiness Assessment */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                <h4 className="font-semibold">Change Readiness Assessment</h4>
              </div>
              {changeReadinessAssessment ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {changeReadinessAssessment ? (
              <div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Overall Score</span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: getScoreColor(Math.round((changeReadinessAssessment.overallScore || changeReadinessAssessment.results?.overallScore || 0) * 20)) }}
                    >
                      {Math.round((changeReadinessAssessment.overallScore || changeReadinessAssessment.results?.overallScore || 0) * 20)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round((changeReadinessAssessment.overallScore || changeReadinessAssessment.results?.overallScore || 0) * 20)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Completed {new Date(changeReadinessAssessment.completedAt || changeReadinessAssessment.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {changeReadinessAssessment.learningPlan?.length || 0} learning items • {changeReadinessAssessment.actionItems?.length || 0} actions
                  </div>
                  <button
                    onClick={() => {
                      const state = {
                        results: { ...(changeReadinessAssessment.results || {}), assessmentId: changeReadinessAssessment.id },
                        orgInfo: changeReadinessAssessment.orgInfo || null,
                        responses: changeReadinessAssessment.responses || {}
                      };
                      navigate('/dashboard/assessments/org-readiness/results', { state });
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">Evaluate your organization's readiness for change</p>
                <button
                  onClick={() => navigate('/tools/change-readiness-assessment')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Take Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment History */}
      {completedAssessments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
            Assessment History
          </h3>
          
          <div className="space-y-4">
            {completedAssessments.map((assessment, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">
                    {assessment.assessmentType === 'ai_knowledge' ? 'AI Knowledge Assessment' :
                     assessment.assessmentType === 'change_readiness' ? 'Change Readiness Assessment' :
                     assessment.type || 'Assessment'}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {new Date(assessment.completedAt || assessment.updatedAt).toLocaleDateString()}
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
        </div>
      )}

      {/* Empty State for No Assessments */}
      {completedAssessments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No assessments completed yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Start your first assessment to track your AI journey.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIJourneyTab;
