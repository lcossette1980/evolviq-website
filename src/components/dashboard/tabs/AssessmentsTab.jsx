import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Lock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserTier } from '../../../hooks/useUserTier';
import { useDashboardStore } from '../../../store/dashboardStore';
import { colors } from '../../../utils/colors';

/**
 * Assessments Tab Component
 * Displays available assessments with tier-based access
 */
const AssessmentsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, canAccess, upgradeMessage } = useUserTier();
  const { userAssessments } = useDashboardStore();
  const [assessmentStatus, setAssessmentStatus] = useState({});

  useEffect(() => {
    if (user && userAssessments) {
      // Process user assessments to get completion status
      const status = {};
      userAssessments.forEach(assessment => {
        if (assessment.isComplete) {
          status[assessment.type] = {
            completed: true,
            score: assessment.results?.overallScore || 0,
            date: assessment.lastUpdated
          };
        }
      });
      setAssessmentStatus(status);
    }
  }, [user, userAssessments]);

  const assessments = [
    {
      id: 'ai_knowledge_assessment',
      title: 'AI Knowledge Assessment',
      description: 'Evaluate your current understanding of AI concepts and applications',
      icon: Brain,
      duration: '15-20 minutes',
      questions: 10,
      freeAccess: true,
      path: '/tools/ai-knowledge-navigator',
      benefits: [
        'Personalized learning path',
        'Identify knowledge gaps',
        'Get tailored recommendations'
      ]
    },
    {
      id: 'change_readiness_assessment',
      title: 'Change Readiness Assessment',
      description: 'Assess your organization\'s readiness for AI transformation',
      icon: Users,
      duration: '20-25 minutes',
      questions: 15,
      freeAccess: false,
      premiumOnly: true,
      path: '/tools/change-readiness-assessment',
      benefits: [
        'Organizational readiness score',
        'Culture transformation insights',
        'Implementation roadmap'
      ]
    }
  ];

  useEffect(() => {
    // Check completion status for each assessment
    const status = {};
    assessments.forEach(assessment => {
      const completed = userAssessments.find(
        ua => ua.type === assessment.id && ua.isComplete
      );
      status[assessment.id] = {
        completed: !!completed,
        completedAt: completed?.completedAt,
        score: completed?.overallScore
      };
    });
    setAssessmentStatus(status);
  }, [userAssessments]);

  const handleAssessmentClick = (assessment) => {
    if (!assessment.freeAccess && !canAccess('assessments', assessment.id)) {
      // Show upgrade prompt
      navigate('/membership');
    } else {
      navigate(assessment.path);
    }
  };

  const getAssessmentButton = (assessment) => {
    const status = assessmentStatus[assessment.id];
    const hasAccess = assessment.freeAccess || canAccess('assessments', assessment.id);

    if (!hasAccess) {
      return (
        <button
          onClick={() => handleAssessmentClick(assessment)}
          className="flex items-center text-chestnut hover:text-chestnut/80 font-medium"
        >
          <Lock className="w-4 h-4 mr-2" />
          Unlock with Premium
        </button>
      );
    }

    if (status?.completed) {
      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Completed</span>
          </div>
          <button
            onClick={() => handleAssessmentClick(assessment)}
            className="text-chestnut hover:text-chestnut/80 font-medium"
          >
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
          const hasAccess = assessment.freeAccess || canAccess('assessments', assessment.id);
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
                    <p className="text-charcoal/70 text-sm mb-3">
                      {assessment.description}
                    </p>
                    
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
                              Completed on {new Date(status.completedAt).toLocaleDateString()}
                            </p>
                            {status.score && (
                              <p className="text-sm text-green-700">
                                Score: {status.score}%
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
    </div>
  );
};

export default AssessmentsTab;