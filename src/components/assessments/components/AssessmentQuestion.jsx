import React from 'react';
import { Brain, Star, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { Button, Card } from '../../ui';

const AssessmentQuestion = ({
  colors,
  currentQuestion,
  userResponse,
  setUserResponse,
  onSubmitResponse,
  isLoading,
  assessment,
  currentQuestionIndex
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Progress */}
      <Card padding="default">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.charcoal }}>
            AI Knowledge Assessment
          </h2>
          <div className="text-sm" style={{ color: colors.khaki }}>
            Section {Math.min(currentQuestionIndex + 1, 5)} of 5
          </div>
        </div>
        
        {/* Current Question */}
        {currentQuestion && (
          <div className="space-y-3 sm:space-y-4">
            {/* Agent Info Banner */}
            {currentQuestion.agent_name && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800 text-sm">
                    {currentQuestion.agent_name} is asking:
                  </span>
                </div>
                {currentQuestion.agent_focus && (
                  <p className="text-xs text-blue-700 mb-1">
                    Focus: {currentQuestion.agent_focus}
                  </p>
                )}
                {currentQuestion.generated_by === 'crewai_agent' && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-700">AI Agent Collaboration</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: colors.charcoal }}>
                {currentQuestion.question}
              </h3>
              {currentQuestion.context && (
                <p className="text-sm text-gray-600 mb-3">
                  {currentQuestion.context}
                </p>
              )}
              {currentQuestion.rationale && (
                <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                  <p className="text-xs text-blue-700">
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    {currentQuestion.rationale}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium" style={{ color: colors.charcoal }}>
                Your Response:
              </label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent text-sm sm:text-base"
                rows={3}
                placeholder="Share your thoughts, experience, or knowledge about this topic..."
              />
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-500">
                  Be as detailed as possible - this helps us understand your knowledge level
                </div>
                <Button
                  variant="primary"
                  onClick={onSubmitResponse}
                  disabled={!userResponse.trim() || isLoading}
                  loading={isLoading}
                  icon={isLoading ? RefreshCw : ArrowRight}
                  iconPosition="right"
                  className="sm:text-base"
                >
                  {isLoading ? 'Processing...' : 'Submit Response'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Assessment History */}
      {assessment.responses.length > 0 && (
        <Card padding="default">
          <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: colors.charcoal }}>
            Previous Responses
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
            {assessment.responses.map((response, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-3 sm:pl-4">
                <div className="text-xs sm:text-sm font-medium text-gray-800 mb-1">
                  Q{index + 1}: {response.question.question}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {response.response}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AssessmentQuestion;