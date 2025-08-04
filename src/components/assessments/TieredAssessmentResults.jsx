import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Lock, 
  TrendingUp, 
  Target, 
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useUserTier } from '../../hooks/useUserTier';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Tiered Assessment Results Component
 * Shows different levels of results based on user's subscription tier
 */
const TieredAssessmentResults = ({ results, assessmentType }) => {
  const navigate = useNavigate();
  const { setIsSignupModalOpen } = useAuth();
  const { tier, isFreeTier, canAccess } = useUserTier();
  
  if (!results) return null;
  
  const {
    overallScore = 0,
    maturityLevel = 1,
    maturityScores = {},
    basicInsights = {},
    learningPath = {},
    businessRecommendations = [],
    detailedAnalysis = {},
    actionItems = []
  } = results;
  
  // Free tier sees basic results only
  if (isFreeTier) {
    return (
      <div className="space-y-8">
        {/* Basic Score Display */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-charcoal mb-6">Your AI Readiness Score</h2>
          
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#F5F5F5"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#B85450"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(overallScore / 100) * 553} 553`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-charcoal">{overallScore}%</span>
                <span className="text-sm text-charcoal/60">Overall Score</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-lg text-charcoal/80">
              Your organization shows promising AI readiness fundamentals
            </p>
          </div>
          
          {/* Basic Insights Preview */}
          <div className="bg-bone/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-charcoal mb-3">Key Strengths</h3>
            <ul className="space-y-2">
              {(basicInsights.strengths || ['Leadership commitment to innovation']).slice(0, 2).map((strength, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal/80">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Upgrade Prompt */}
          <div className="bg-gradient-to-r from-chestnut/10 to-khaki/10 rounded-xl p-8 text-center">
            <Lock className="w-12 h-12 text-chestnut mx-auto mb-4" />
            <h3 className="text-xl font-bold text-charcoal mb-3">
              Unlock Your Complete AI Roadmap
            </h3>
            <p className="text-charcoal/80 mb-6 max-w-2xl mx-auto">
              Get detailed insights, personalized recommendations, and a step-by-step 
              implementation plan tailored to your organization's unique needs.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4">
                <Target className="w-8 h-8 text-chestnut mb-2 mx-auto" />
                <h4 className="font-semibold text-sm mb-1">Detailed Analysis</h4>
                <p className="text-xs text-charcoal/60">Deep dive into 6 key areas</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <TrendingUp className="w-8 h-8 text-chestnut mb-2 mx-auto" />
                <h4 className="font-semibold text-sm mb-1">Action Plan</h4>
                <p className="text-xs text-charcoal/60">Prioritized next steps</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <Sparkles className="w-8 h-8 text-chestnut mb-2 mx-auto" />
                <h4 className="font-semibold text-sm mb-1">AI Opportunities</h4>
                <p className="text-xs text-charcoal/60">Specific use cases</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/membership')}
              className="bg-chestnut text-white px-8 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-all inline-flex items-center"
            >
              Start 3-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Premium users see full results
  return (
    <div className="space-y-8">
      {/* Full Score Display with Breakdown */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-charcoal">Complete AI Readiness Analysis</h2>
          {tier === 'premium' && (
            <span className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm font-medium">
              Premium Analysis
            </span>
          )}
        </div>
        
        {/* Overall Score */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#F5F5F5"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#B85450"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(overallScore / 100) * 553} 553`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-charcoal">{overallScore}%</span>
                <span className="text-sm text-charcoal/60">Overall Score</span>
              </div>
            </div>
          </div>
          
          {/* Maturity Scores Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-charcoal mb-3">Maturity Breakdown</h3>
            {Object.entries(maturityScores).map(([area, score]) => (
              <div key={area} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/80">
                    {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="font-medium text-charcoal">{score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-chestnut h-2 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Detailed Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Key Strengths
            </h3>
            <ul className="space-y-2">
              {(basicInsights.strengths || []).map((strength, idx) => (
                <li key={idx} className="text-charcoal/80 text-sm">• {strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
              Growth Areas
            </h3>
            <ul className="space-y-2">
              {(basicInsights.growthAreas || []).map((area, idx) => (
                <li key={idx} className="text-charcoal/80 text-sm">• {area}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Business Recommendations */}
        {businessRecommendations.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-charcoal mb-4">Strategic Recommendations</h3>
            <div className="space-y-4">
              {businessRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-bone/30 rounded-lg p-4">
                  <h4 className="font-medium text-charcoal mb-2">{rec.title || `Recommendation ${idx + 1}`}</h4>
                  <p className="text-charcoal/80 text-sm">{rec.description || rec}</p>
                  {rec.priority && (
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Items for Premium Users */}
        {actionItems.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-chestnut/5 to-khaki/5 rounded-xl p-6">
            <h3 className="font-semibold text-charcoal mb-4 flex items-center">
              <Target className="w-5 h-5 text-chestnut mr-2" />
              Your Action Plan
            </h3>
            <div className="space-y-3">
              {actionItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-6 h-6 bg-chestnut text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">{item.title || item}</p>
                    {item.timeframe && (
                      <p className="text-charcoal/60 text-sm">Timeframe: {item.timeframe}</p>
                    )}
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

export default TieredAssessmentResults;