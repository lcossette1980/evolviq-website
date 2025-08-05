import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  RefreshCw, 
  Award, 
  TrendingUp, 
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { generateShareableReport } from '../../services/assessmentService';
import { theme } from '../../styles/theme';
import API_CONFIG from '../../config/apiConfig';
import LoadingSpinner from '../shared/LoadingSpinner';

const AIKnowledgeResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState(location.state?.results || null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!results) {
      navigate('/dashboard/assessments');
    }
  }, [results, navigate]);

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assessments/ai-knowledge/report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          responses: location.state?.responses || {},
          user_info: { name: user.displayName, email: user.email }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_knowledge_assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = await generateShareableReport(user.uid, results.assessmentId);
      setShareUrl(url);
      
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Knowledge Assessment Results',
          text: `I scored ${results.overall_score}% on the AI Knowledge Assessment!`,
          url
        });
      } else {
        navigator.clipboard.writeText(url);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleRetakeAssessment = () => {
    navigate('/dashboard/assessments/ai-knowledge');
  };

  if (!results) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessColor = () => {
    const level = results.readiness_level.toLowerCase();
    if (level.includes('expert') || level.includes('advanced')) return 'bg-green-100 text-green-800';
    if (level.includes('intermediate')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bone to-pearl">
      <div className={theme.layout.container}>
        <div className="py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-chestnut mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-charcoal mb-2">
              Your AI Knowledge Assessment Results
            </h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${getReadinessColor()} mt-4`}>
              <span className="text-lg font-medium">{results.readiness_level}</span>
            </div>
          </div>

          {/* Overall Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={theme.components.card.elevated + " max-w-2xl mx-auto p-8 mb-8"}
          >
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(results.overall_score)} mb-4`}>
                {results.overall_score}%
              </div>
              <p className="text-xl text-gray-700 mb-2">Overall Score</p>
              <p className="text-gray-600">{results.readiness_description}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={handleDownloadReport}
                disabled={isLoading}
                className={theme.components.button.primary + " flex items-center"}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" className="mr-2" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                Download Report
              </button>
              
              <button
                onClick={handleShare}
                className={theme.components.button.secondary + " flex items-center"}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Results
              </button>
              
              <button
                onClick={handleRetakeAssessment}
                className={theme.components.button.tertiary + " flex items-center"}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retake Assessment
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['overview', 'categories', 'recommendations', 'learning'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex-1 py-2 px-4 rounded-md font-medium transition-all capitalize
                    ${activeTab === tab 
                      ? 'bg-white text-chestnut shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Strengths */}
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {results.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Growth Areas */}
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600 mr-2" />
                    Growth Opportunities
                  </h3>
                  <ul className="space-y-3">
                    {results.growth_areas.map((area, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={theme.components.card.base + " p-6"}
              >
                <h3 className="text-xl font-semibold text-charcoal mb-6">
                  Performance by Category
                </h3>
                <div className="space-y-4">
                  {Object.entries(results.category_scores).map(([category, score]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">{category}</span>
                        <span className={`font-medium ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="bg-chestnut h-3 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Category Visualization */}
                {results.visualizations?.category_radar && (
                  <div className="mt-8">
                    <img 
                      src={`data:image/png;base64,${results.visualizations.category_radar}`}
                      alt="Category Performance Radar"
                      className="w-full max-w-md mx-auto"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {results.recommendations.map((rec, idx) => (
                  <div key={idx} className={theme.components.card.base + " p-6"}>
                    <div className="flex items-start">
                      <Target className="w-6 h-6 text-chestnut mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-charcoal mb-2">
                          {rec.title || `Recommendation ${idx + 1}`}
                        </h4>
                        <p className="text-gray-700 mb-3">{rec.description || rec}</p>
                        {rec.actions && (
                          <div className="mt-3 space-y-2">
                            {rec.actions.map((action, actionIdx) => (
                              <div key={actionIdx} className="flex items-center text-sm text-gray-600">
                                <ArrowRight className="w-4 h-4 mr-2" />
                                {action}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'learning' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={theme.components.card.base + " p-6"}
              >
                <h3 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
                  <BookOpen className="w-6 h-6 text-chestnut mr-2" />
                  Personalized Learning Path
                </h3>
                
                {results.learning_path && (
                  <div className="space-y-6">
                    {results.learning_path.map((phase, idx) => (
                      <div key={idx} className="border-l-4 border-chestnut pl-4">
                        <h4 className="font-semibold text-charcoal mb-2">
                          Phase {idx + 1}: {phase.title}
                        </h4>
                        <p className="text-gray-600 mb-3">{phase.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-gray-500">
                            Duration: {phase.duration}
                          </span>
                          {phase.difficulty && (
                            <span className={`
                              text-sm px-2 py-1 rounded
                              ${phase.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                phase.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }
                            `}>
                              {phase.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
                    <span>
                      Your learning path is customized based on your assessment results. 
                      Start with Phase 1 and progress at your own pace.
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKnowledgeResults;