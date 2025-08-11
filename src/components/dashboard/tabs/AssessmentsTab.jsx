import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Lock,
  TrendingUp,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserTier } from '../../../hooks/useUserTier';
import { useDashboardStore } from '../../../store/dashboardStore';
import { TIER_CONFIG } from '../../../config/tierConfig';
import { getUserAssessmentSummaries, getAssessmentResults } from '../../../services/assessmentService';
import { colors } from '../../../utils/colors';

/**
 * Assessments Tab Component
 * Displays available assessments with tier-based access
 */
const AssessmentsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, canAccess, upgradeMessage } = useUserTier();
  const { userAssessments, setActiveTab } = useDashboardStore();
  const [assessmentStatus, setAssessmentStatus] = useState({});
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessmentSummaries();
  }, [user]);

  const loadAssessmentSummaries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userSummaries = await getUserAssessmentSummaries(user.uid);
      setSummaries(userSummaries);
      
      // Update status based on summaries
      const status = {};
      Object.entries(userSummaries).forEach(([type, summary]) => {
        status[type] = {
          completed: true,
          score: summary.score || summary.overall_readiness,
          date: summary.lastCompleted,
          readinessLevel: summary.readinessLevel || summary.maturity_level,
          assessmentId: summary.assessmentId
        };
      });
      setAssessmentStatus(status);
    } catch (error) {
      console.error('Error loading assessment summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const assessments = [
    {
      id: 'ai-knowledge',
      title: 'AI Knowledge Assessment',
      description: 'Evaluate your current understanding of AI concepts and applications',
      icon: Brain,
      duration: '15-20 minutes',
      questions: 20,
      freeAccess: true,
      path: '/dashboard/assessments/ai-knowledge',
      resultsPath: '/dashboard/assessments/ai-knowledge/results',
      benefits: [
        'Personalized learning path',
        'Identify knowledge gaps',
        'Get tailored recommendations',
        'Track progress over time'
      ]
    },
    {
      id: 'org-readiness',
      title: 'Organizational AI Readiness',
      description: 'Assess your organization\'s readiness for AI transformation',
      icon: Building2,
      duration: '20-30 minutes',
      questions: 25,
      freeAccess: false,
      premiumOnly: true,
      path: '/dashboard/assessments/org-readiness',
      resultsPath: '/dashboard/assessments/org-readiness/results',
      benefits: [
        'Executive readiness report',
        'Industry benchmarking',
        'Strategic roadmap',
        'Investment guidance'
      ]
    }
  ];

  const bothComplete = Boolean(summaries['ai-knowledge']) && Boolean(summaries['org-readiness'] || summaries['change_readiness']);


  const handleAssessmentClick = async (assessment, viewResults = false) => {
    // Normalize sub-feature keys to match tier config
    const subFeature = assessment.id === 'ai-knowledge'
      ? 'ai_knowledge_assessment'
      : assessment.id === 'org-readiness'
      ? 'change_readiness_assessment'
      : assessment.id;

    if (!assessment.freeAccess && !canAccess('assessments', subFeature)) {
      // Show upgrade prompt
      navigate('/membership');
    } else {
      const status = assessmentStatus[assessment.id];
      if (viewResults && status?.completed) {
        try {
          // Get the assessment ID from the summary
          const summary = summaries[assessment.id];
          if (summary?.assessmentId) {
            // Load the full assessment results from Firebase
            const fullResults = await getAssessmentResults(user.uid, summary.assessmentId);
            
            // Navigate to results with full data
            navigate(assessment.resultsPath, { 
              state: { 
                results: fullResults.results,
                orgInfo: fullResults.orgInfo || null,
                responses: fullResults.responses,
                assessmentId: summary.assessmentId
              } 
            });
          } else {
            console.error('No assessmentId found in summary');
          }
        } catch (error) {
          console.error('Error loading assessment results:', error);
          // Show error message
        }
      } else {
        navigate(assessment.path);
      }
    }
  };

  const getAssessmentButton = (assessment) => {
    const status = assessmentStatus[assessment.id];
    // Normalize sub-feature keys to match tier config
    const subFeature = assessment.id === 'ai-knowledge'
      ? 'ai_knowledge_assessment'
      : assessment.id === 'org-readiness'
      ? 'change_readiness_assessment'
      : assessment.id;
    const hasAccess = assessment.freeAccess || canAccess('assessments', subFeature);

    if (!hasAccess) {
      return (
        <button
          onClick={() => handleAssessmentClick(assessment)}
          className="flex items-center text-chestnut hover:text-chestnut/80 font-medium"
          title={upgradeMessage('assessments', subFeature)}
        >
          <Lock className="w-4 h-4 mr-2" />
          {upgradeMessage('assessments', subFeature)}
        </button>
      );
    }

    if (status?.completed) {
      return (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleAssessmentClick(assessment, true)}
            className="flex items-center text-chestnut hover:text-chestnut/80 font-medium"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Results
          </button>
          <button
            onClick={() => handleAssessmentClick(assessment)}
            className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleAssessmentClick(assessment)}
        className="flex items-center text-chestnut hover:text-chestnut/80 font-medium"
      >
        Start Assessment
        <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chestnut"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal mb-2">
          AI Readiness Assessments
        </h2>
        <p className="text-charcoal/70">
          Evaluate your knowledge and organizational readiness for AI adoption
        </p>
      </div>

      {/* Assessment Cards */}
      <div className="grid gap-6">
        {assessments.map((assessment) => {
          const status = assessmentStatus[assessment.id];
          const subFeature = assessment.id === 'ai-knowledge'
            ? 'ai_knowledge_assessment'
            : assessment.id === 'org-readiness'
            ? 'change_readiness_assessment'
            : assessment.id;
          const hasAccess = assessment.freeAccess || canAccess('assessments', subFeature);
          const trialIncludes =
            TIER_CONFIG.trial.assessments.allowed === 'all' ||
            (TIER_CONFIG.trial.assessments.allowed || []).includes(subFeature);
          const premiumIncludes =
            TIER_CONFIG.premium.assessments.allowed === 'all' ||
            (TIER_CONFIG.premium.assessments.allowed || []).includes(subFeature);
          const Icon = assessment.icon;

          return (
            <div
              key={assessment.id}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                !hasAccess ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg ${
                    hasAccess ? 'bg-chestnut/10' : 'bg-gray-100'
                  } mr-4`}>
                    <Icon className={`w-6 h-6 ${
                      hasAccess ? 'text-chestnut' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-1">
                      {assessment.title}
                      {assessment.premiumOnly && (
                        <span className="ml-2 text-xs bg-chestnut text-white px-2 py-0.5 rounded-full">
                          PREMIUM
                        </span>
                      )}
                    </h3>
                    <p className="text-charcoal/70 text-sm mb-1">
                      {assessment.description}
                    </p>
                    {!hasAccess && (
                      <div className="text-xs text-charcoal/60 mb-2">
                        {trialIncludes && premiumIncludes
                          ? 'Available in Trial and Premium'
                          : premiumIncludes
                          ? 'Available in Premium'
                          : 'Upgrade required'}
                      </div>
                    )}
                    
                    {/* Assessment Details */}
                    <div className="flex items-center space-x-4 text-sm text-charcoal/60 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {assessment.duration}
                      </div>
                      <div>
                        {assessment.questions} questions
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-1">
                      {assessment.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center text-sm text-charcoal/70">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>

                    {/* Completion Status */}
                    {status?.completed && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Completed on {new Date(status.date).toLocaleDateString()}
                            </p>
                            {status.score !== undefined && (
                              <p className="text-sm text-green-700">
                                Score: {status.score}%
                              </p>
                            )}
                            {status.readinessLevel && (
                              <p className="text-sm text-green-700">
                                Level: {status.readinessLevel}
                              </p>
                            )}
                          </div>
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 flex justify-end">
                {getAssessmentButton(assessment)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Free User Prompt */}
      {tier === 'free' && (
        <div className="mt-8 bg-gradient-to-r from-chestnut/10 to-khaki/10 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-charcoal mb-2">
            Unlock All Assessments
          </h3>
          <p className="text-charcoal/70 mb-4">
            Get access to our complete suite of AI readiness assessments and detailed insights
          </p>
          <button
            onClick={() => navigate('/membership')}
            className="bg-chestnut text-white px-6 py-2 rounded-lg font-medium hover:bg-chestnut/90 transition-all inline-flex items-center"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {/* Next Step Prompt */}
      {bothComplete && (
        <div className="mt-6 bg-white rounded-xl border shadow-sm p-6 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-charcoal">Great job! Next, create your first project</h4>
            <p className="text-sm text-charcoal/70">We’ll attach project-specific implementation guides to help you execute.</p>
          </div>
          <button
            onClick={() => {
              navigate('/dashboard');
              setActiveTab('projects');
            }}
            className="bg-chestnut text-white px-4 py-2 rounded-lg hover:bg-chestnut/90"
          >
            Go to Projects
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentsTab;
