import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Building2, 
  Users, 
  TrendingUp,
  BarChart3,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { saveAssessmentResults } from '../../services/assessmentService';
import { theme } from '../../styles/theme';
import API_CONFIG from '../../config/apiConfig';
import ProgressBar from '../shared/ProgressBar';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrgReadinessAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [orgInfo, setOrgInfo] = useState({
    name: '',
    industry: '',
    size: '',
    current_ai_usage: ''
  });
  const [showOrgForm, setShowOrgForm] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const industries = [
    'Technology', 'Financial Services', 'Healthcare', 'Manufacturing',
    'Retail', 'Education', 'Government', 'Non-profit', 'Other'
  ];

  const companySizes = [
    { value: 'startup', label: 'Startup (1-50 employees)' },
    { value: 'small', label: 'Small (51-200 employees)' },
    { value: 'medium', label: 'Medium (201-1000 employees)' },
    { value: 'large', label: 'Large (1001-5000 employees)' },
    { value: 'enterprise', label: 'Enterprise (5000+ employees)' }
  ];

  const aiUsageLevels = [
    { value: 'none', label: 'No current AI usage' },
    { value: 'exploring', label: 'Exploring AI opportunities' },
    { value: 'pilot', label: 'Running pilot projects' },
    { value: 'limited', label: 'Limited production use' },
    { value: 'extensive', label: 'Extensive AI adoption' }
  ];

  useEffect(() => {
    if (!showOrgForm) {
      loadAssessment();
    }
  }, [showOrgForm]);

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assessments/org-readiness/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      setError('Failed to load assessment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    if (orgInfo.name && orgInfo.industry && orgInfo.size && orgInfo.current_ai_usage) {
      setShowOrgForm(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Calculate results
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assessments/org-readiness/calculate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          responses,
          org_info: orgInfo
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();

      // Save to Firebase
      await saveAssessmentResults(user.uid, {
        type: 'org-readiness',
        orgInfo,
        responses,
        results,
        completedAt: new Date().toISOString()
      });

      // Navigate to results
      navigate('/dashboard/assessments/org-readiness/results', { 
        state: { results, orgInfo, responses } 
      });
    } catch (err) {
      setError('Failed to save assessment');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Organization Info Form
  if (showOrgForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bone to-pearl">
        <div className={theme.layout.containerSmall}>
          <div className="py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={theme.components.card.base + " p-8"}
            >
              <div className="text-center mb-8">
                <Building2 className="w-16 h-16 text-chestnut mx-auto mb-4" />
                <h1 className="text-3xl font-serif text-charcoal mb-2">
                  Organizational AI Readiness Assessment
                </h1>
                <p className="text-gray-600">
                  Let's start by learning about your organization
                </p>
              </div>

              <form onSubmit={handleOrgSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgInfo.name}
                    onChange={(e) => setOrgInfo({ ...orgInfo, name: e.target.value })}
                    className={theme.components.input.base}
                    placeholder="Enter your organization name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={orgInfo.industry}
                    onChange={(e) => setOrgInfo({ ...orgInfo, industry: e.target.value })}
                    className={theme.components.input.base}
                    required
                  >
                    <option value="">Select your industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Size
                  </label>
                  <select
                    value={orgInfo.size}
                    onChange={(e) => setOrgInfo({ ...orgInfo, size: e.target.value })}
                    className={theme.components.input.base}
                    required
                  >
                    <option value="">Select organization size</option>
                    {companySizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current AI Usage
                  </label>
                  <select
                    value={orgInfo.current_ai_usage}
                    onChange={(e) => setOrgInfo({ ...orgInfo, current_ai_usage: e.target.value })}
                    className={theme.components.input.base}
                    required
                  >
                    <option value="">Select current AI usage level</option>
                    {aiUsageLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className={theme.components.button.primary + " w-full"}
                >
                  Start Assessment
                  <ChevronRight className="w-5 h-5 ml-2 inline" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadAssessment}
            className={theme.components.button.primary}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  const question = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentQuestion === assessment.questions.length - 1;
  const canProceed = responses[question.id] !== undefined;

  // Group questions by dimension for progress indicator
  const dimensionProgress = {};
  assessment.dimensions.forEach(dim => {
    const dimQuestions = assessment.questions.filter(q => q.dimension === dim);
    const answeredQuestions = dimQuestions.filter(q => responses[q.id] !== undefined);
    dimensionProgress[dim] = (answeredQuestions.length / dimQuestions.length) * 100;
  });

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
            <p className="text-gray-600">
              Evaluating organizational readiness across {assessment.dimensions.length} critical dimensions
            </p>
          </div>

          {/* Dimension Progress Indicators */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assessment.dimensions.slice(0, 4).map(dim => (
                <div key={dim} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#A44A3F"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${dimensionProgress[dim] * 1.76} 176`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {Math.round(dimensionProgress[dim])}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{dim}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {assessment.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={theme.components.card.base + " max-w-3xl mx-auto p-8"}
            >
              {/* Dimension and Category Badges */}
              <div className="mb-6 flex flex-wrap gap-2">
                <span className={theme.components.badge.primary}>
                  {question.dimension}
                </span>
                <span className={theme.components.badge.secondary}>
                  {question.category}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-xl font-medium text-charcoal mb-6">
                {question.question}
              </h2>

              {/* Context if available */}
              {question.context && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <p className="text-sm text-blue-800">{question.context}</p>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(question.options).map(([key, option]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(question.id, key)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${responses[question.id] === key
                        ? 'border-chestnut bg-chestnut/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <span className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3
                        ${responses[question.id] === key
                          ? 'bg-chestnut text-white'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {key}
                      </span>
                      <div>
                        <span className="text-gray-800 font-medium block mb-1">
                          {option.text}
                        </span>
                        {option.description && (
                          <span className="text-sm text-gray-600">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="max-w-3xl mx-auto mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-chestnut'
                }
              `}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isSaving}
                className={`
                  ${theme.components.button.primary}
                  ${(!canProceed || isSaving) && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Analyzing Organization...
                  </>
                ) : (
                  <>
                    Complete Assessment
                    <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`
                  flex items-center space-x-2 px-6 py-2 rounded-lg transition-all
                  ${canProceed
                    ? 'bg-chestnut text-white hover:bg-chestnut/90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgReadinessAssessment;