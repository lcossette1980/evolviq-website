import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Building2, 
  TrendingUp, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Users,
  Zap,
  DollarSign,
  Calendar,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateShareableReport } from '../../services/assessmentService';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrgReadinessResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState(location.state?.results || null);
  const [orgInfo, setOrgInfo] = useState(location.state?.orgInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    if (!results || !orgInfo) {
      navigate('/dashboard/assessments');
    }
  }, [results, orgInfo, navigate]);

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/assessments/org-readiness/report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          responses: location.state?.responses || {},
          org_info: orgInfo
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${orgInfo.name.replace(' ', '_')}_ai_readiness_${new Date().toISOString().split('T')[0]}.pdf`;
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
          title: `${orgInfo.name} AI Readiness Assessment`,
          text: `${orgInfo.name} scored ${results.overall_readiness}% on the AI Readiness Assessment`,
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

  const handleScheduleConsultation = () => {
    navigate('/contact', { 
      state: { 
        preselectedService: 'AI Strategy Consultation',
        assessmentData: {
          organization: orgInfo.name,
          readiness: results.overall_readiness,
          maturityLevel: results.maturity_level
        }
      }
    });
  };

  if (!results || !orgInfo) return null;

  const getReadinessColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMaturityBadgeColor = () => {
    const level = results.maturity_level.toLowerCase();
    if (level.includes('optimizing')) return 'bg-purple-100 text-purple-800';
    if (level.includes('mature')) return 'bg-green-100 text-green-800';
    if (level.includes('developing')) return 'bg-yellow-100 text-yellow-800';
    if (level.includes('initial')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bone to-pearl">
      <div className={theme.layout.container}>
        <div className="py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-chestnut mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-charcoal mb-2">
              {orgInfo.name} AI Readiness Assessment
            </h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${getMaturityBadgeColor()} mt-4`}>
              <span className="text-lg font-medium">{results.maturity_level}</span>
            </div>
          </div>

          {/* Overall Readiness Score */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={theme.components.card.elevated + " max-w-2xl mx-auto p-8 mb-8"}
          >
            <div className="text-center">
              <div className={`text-6xl font-bold ${getReadinessColor(results.overall_readiness)} mb-4`}>
                {results.overall_readiness}%
              </div>
              <p className="text-xl text-gray-700 mb-2">Overall AI Readiness</p>
              <p className="text-gray-600">
                {orgInfo.name} is {results.maturity_level.toLowerCase()} in AI adoption
              </p>
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
                Executive Report
              </button>
              
              <button
                onClick={handleShare}
                className={theme.components.button.secondary + " flex items-center"}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Results
              </button>
              
              <button
                onClick={handleScheduleConsultation}
                className={theme.components.button.tertiary + " flex items-center"}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Consultation
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['executive', 'dimensions', 'priorities', 'industry', 'insights'].map((tab) => (
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
                  {tab === 'executive' ? 'Overview' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-6xl mx-auto">
            {activeTab === 'executive' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Executive Summary */}
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-4">
                    Executive Summary
                  </h3>
                  <div className="prose max-w-none text-gray-700">
                    <p>{results.narrative_insights.summary}</p>
                  </div>
                </div>

                {/* Key Findings Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Critical Gaps */}
                  <div className={theme.components.card.base + " p-6"}>
                    <h3 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                      Critical Gaps
                    </h3>
                    <ul className="space-y-3">
                      {results.critical_gaps.slice(0, 3).map((gap, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          <span className="text-gray-700">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Wins */}
                  <div className={theme.components.card.base + " p-6"}>
                    <h3 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                      <Zap className="w-6 h-6 text-green-600 mr-2" />
                      Quick Wins
                    </h3>
                    <ul className="space-y-3">
                      {results.quick_wins.slice(0, 3).map((win, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-gray-700">{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                  {results.narrative_insights.key_findings.map((finding, idx) => (
                    <div key={idx} className={theme.components.card.base + " p-4 text-center"}>
                      <div className="text-2xl font-bold text-chestnut mb-1">
                        {finding.metric || `${(idx + 1) * 25}%`}
                      </div>
                      <p className="text-sm text-gray-600">{finding.label || finding}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'dimensions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={theme.components.card.base + " p-6"}
              >
                <h3 className="text-xl font-semibold text-charcoal mb-6">
                  AI Readiness by Dimension
                </h3>
                
                {/* Dimension Scores */}
                <div className="space-y-6">
                  {Object.entries(results.dimension_scores).map(([dimension, score]) => (
                    <div key={dimension}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700 font-medium">{dimension}</span>
                        <span className={`font-bold ${getReadinessColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="bg-chestnut h-4 rounded-full relative"
                        >
                          {score < 40 && (
                            <span className="absolute right-2 top-0 text-xs text-white leading-4">
                              Needs Attention
                            </span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dimension Visualization */}
                {results.visualizations?.dimension_analysis && (
                  <div className="mt-8">
                    <img 
                      src={`data:image/png;base64,${results.visualizations.dimension_analysis}`}
                      alt="Dimension Analysis"
                      className="w-full max-w-2xl mx-auto"
                    />
                  </div>
                )}

                {/* Maturity Heatmap */}
                {results.visualizations?.maturity_heatmap && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-charcoal mb-4">
                      Maturity Heatmap
                    </h4>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: JSON.parse(results.visualizations.maturity_heatmap) 
                      }}
                      className="w-full"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'priorities' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-6">
                    Strategic Priorities & Roadmap
                  </h3>
                  
                  {/* Timeline */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Implementation Timeline
                    </h4>
                    <div className="relative">
                      {results.strategic_priorities.map((priority, idx) => (
                        <div key={idx} className="flex items-start mb-6">
                          <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                            Q{idx + 1} 2024
                          </div>
                          <div className="flex-shrink-0 w-4 h-4 bg-chestnut rounded-full mt-1 mx-4" />
                          <div className="flex-grow">
                            <h5 className="font-semibold text-charcoal mb-1">
                              {priority.title || priority}
                            </h5>
                            <p className="text-gray-600 text-sm mb-2">
                              {priority.description || 'Focus on implementing this strategic priority'}
                            </p>
                            {priority.actions && (
                              <div className="mt-2 space-y-1">
                                {priority.actions.map((action, actionIdx) => (
                                  <div key={actionIdx} className="flex items-center text-sm text-gray-500">
                                    <ChevronRight className="w-4 h-4 mr-1" />
                                    {action}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Investment Implications */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Investment Implications
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.narrative_insights.investment_implications.map((implication, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{implication}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'industry' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={theme.components.card.base + " p-6"}
              >
                <h3 className="text-xl font-semibold text-charcoal mb-6">
                  Industry Comparison
                </h3>
                
                {/* Comparison Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 flex items-start">
                    <Info className="w-5 h-5 mr-2 mt-0.5" />
                    <span>
                      {orgInfo.name} is {results.industry_comparison.position} compared to 
                      other {orgInfo.industry} organizations of similar size.
                    </span>
                  </p>
                </div>

                {/* Industry Metrics */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chestnut mb-2">
                      {results.overall_readiness}%
                    </div>
                    <p className="text-gray-600">Your Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700 mb-2">
                      {results.industry_comparison.average || 62}%
                    </div>
                    <p className="text-gray-600">Industry Average</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700 mb-2">
                      {results.industry_comparison.leaders || 85}%
                    </div>
                    <p className="text-gray-600">Industry Leaders</p>
                  </div>
                </div>

                {/* Industry Comparison Chart */}
                {results.visualizations?.industry_comparison && (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: JSON.parse(results.visualizations.industry_comparison) 
                    }}
                    className="w-full"
                  />
                )}

                {/* Success Indicators */}
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Success Indicators for {orgInfo.industry}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.narrative_insights.success_indicators.map((indicator, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                        <span className="text-gray-700">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Recommendations */}
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
                    <Target className="w-6 h-6 text-chestnut mr-2" />
                    Strategic Recommendations
                  </h3>
                  <div className="space-y-4">
                    {results.narrative_insights.recommendations.map((rec, idx) => (
                      <div key={idx} className="border-l-4 border-chestnut pl-4 py-2">
                        <h4 className="font-semibold text-charcoal mb-1">
                          {rec.title || `Recommendation ${idx + 1}`}
                        </h4>
                        <p className="text-gray-700">{rec.description || rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                    Risk Factors
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.narrative_insights.risk_factors.map((risk, idx) => (
                      <div key={idx} className="bg-orange-50 rounded-lg p-4">
                        <p className="text-orange-800">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Expectations */}
                <div className={theme.components.card.base + " p-6"}>
                  <h3 className="text-xl font-semibold text-charcoal mb-6 flex items-center">
                    <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                    Timeline Expectations
                  </h3>
                  <div className="space-y-3">
                    {results.narrative_insights.timeline_expectations.map((timeline, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-blue-600 font-medium mr-2">
                          {timeline.period || `Phase ${idx + 1}`}:
                        </span>
                        <span className="text-gray-700">
                          {timeline.description || timeline}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps CTA */}
                <div className="bg-chestnut/5 rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-serif text-charcoal mb-4">
                    Ready to Transform Your AI Journey?
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                    Based on your assessment results, our AI strategy experts can help you create 
                    a customized roadmap for successful AI adoption.
                  </p>
                  <button
                    onClick={handleScheduleConsultation}
                    className={theme.components.button.primary + " text-lg px-8 py-3"}
                  >
                    Schedule Strategic Consultation
                    <ChevronRight className="w-5 h-5 ml-2 inline" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgReadinessResults;