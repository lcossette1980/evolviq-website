import React from 'react';
import { CheckCircle, Target, Brain, Star, Users, MessageSquare, Lock, BookOpen, TrendingUp, Home } from 'lucide-react';
import { Button, Card } from '../../ui';

const AssessmentResults = ({
  colors,
  results,
  user,
  maturityAreas,
  onNavigateToDashboard,
  onViewLearningPlan,
  onRetakeAssessment,
  onShowPremiumFeatures,
  getMaturityLevelText,
  getMaturityLevelColor
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Overall Score */}
      <Card padding="large">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 relative">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: colors.chestnut }}>
                {results?.overallScore || 0}
              </div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>
            Your AI Knowledge Level
          </h2>
          <p className="text-base sm:text-lg" style={{ color: colors.khaki }}>
            {getMaturityLevelText(results?.maturityLevel || 1)}
          </p>
        </div>

        {/* Basic Results - Always Visible */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg" style={{ color: colors.charcoal }}>Strengths</h3>
            <ul className="space-y-2">
              {results?.basicInsights?.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg" style={{ color: colors.charcoal }}>Areas for Growth</h3>
            <ul className="space-y-2">
              {results?.basicInsights?.growthAreas?.map((area, index) => (
                <li key={index} className="flex items-start">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* CrewAI Analysis Results */}
      {results?.crewai_metadata && (
        <Card padding="large" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: colors.charcoal }}>
              AI Agent Collaboration Analysis
            </h3>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-700 font-medium">Multi-Agent Assessment</span>
            </div>
          </div>
          
          {/* Agent Summary */}
          {results.agents_used && results.agents_used.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-blue-800">Specialized Agents Involved:</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.agents_used.map((agent, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights from CrewAI */}
          {results?.concept_analysis && (
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-800">Agent Insights:</h4>
              
              {results.concept_analysis.detected_concepts && (
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium mb-2 text-green-700">✅ Concepts Detected</h5>
                  <div className="flex flex-wrap gap-2">
                    {results.concept_analysis.detected_concepts.map((concept, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {results.concept_analysis.knowledge_gaps && (
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium mb-2 text-orange-700">🎯 Areas for Development</h5>
                  <div className="flex flex-wrap gap-2">
                    {results.concept_analysis.knowledge_gaps.map((gap, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {results.concept_analysis.strengths && (
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium mb-2 text-blue-700">💪 Core Strengths</h5>
                  <div className="flex flex-wrap gap-2">
                    {results.concept_analysis.strengths.map((strength, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agent Collaboration Info */}
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              This assessment used real AI agent collaboration - multiple specialized agents worked together to analyze your responses and provide comprehensive insights.
            </p>
          </div>
        </Card>
      )}

      {/* Premium Features Preview */}
      {!user.isPremium && (
        <Card padding="large" className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>
                Unlock Your Full Potential
              </h3>
              <p className="text-lg text-gray-600">
                Get detailed insights and personalized learning plans
              </p>
            </div>
            <Lock className="w-12 h-12 text-yellow-600" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <Star className="w-8 h-8 text-yellow-600 mb-2" />
              <h4 className="font-semibold mb-1">Detailed Scores</h4>
              <p className="text-sm text-gray-600">See your level in each AI domain</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold mb-1">Learning Pathway</h4>
              <p className="text-sm text-gray-600">Step-by-step learning plan</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">Progress Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your advancement</p>
            </div>
          </div>
          
          <Button
            variant="warning"
            onClick={onShowPremiumFeatures}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Upgrade to Premium
          </Button>
        </Card>
      )}

      {/* Premium Results - Only for Premium Users */}
      {user.isPremium && results?.detailedScores && (
        <Card padding="large">
          <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal }}>
            Detailed Knowledge Assessment
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {maturityAreas.map((area, index) => {
              const score = results.detailedScores[area.id] || 1;
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{area.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMaturityLevelColor(score)}`}>
                      {getMaturityLevelText(score)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{area.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-chestnut h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          variant="primary"
          onClick={onNavigateToDashboard}
          icon={Home}
          className="sm:text-base"
        >
          Back to Dashboard
        </Button>
        <Button
          variant="secondary"
          onClick={onViewLearningPlan}
          className="sm:text-base"
        >
          View Learning Plan
        </Button>
        <Button
          variant="tertiary"
          onClick={onRetakeAssessment}
          className="sm:text-base"
        >
          Retake Assessment
        </Button>
      </div>
    </div>
  );
};

export default AssessmentResults;