import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Brain, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { saveAssessmentResults } from '../../services/assessmentService';
import { theme } from '../../styles/theme';
import API_CONFIG from '../../config/apiConfig';
import ProgressBar from '../shared/ProgressBar';
import LoadingSpinner from '../shared/LoadingSpinner';

const AIKnowledgeAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      // Load assessment questions from the Python module
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assessments/ai-knowledge/questions`, {
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assessments/ai-knowledge/calculate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          responses,
          user_info: {
            name: user.displayName,
            email: user.email
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();

      // Save to Firebase and get the assessmentId
      const assessmentId = await saveAssessmentResults(user.uid, {
        type: 'ai-knowledge',
        responses,
        results,
        completedAt: new Date().toISOString()
      });

      // Navigate to results with assessmentId
      navigate('/dashboard/assessments/ai-knowledge/results', { 
        state: { results: { ...results, assessmentId }, responses } 
      });
    } catch (err) {
      setError('Failed to save assessment');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-bone to-pearl">
      <div className={theme.layout.container}>
        <div className="py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Brain className="w-16 h-16 text-chestnut mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-charcoal mb-2">
              AI Knowledge Assessment
            </h1>
            <p className="text-gray-600">
              Evaluate your understanding of AI concepts and applications
            </p>
          </div>

          {/* Progress */}
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
              {/* Category Badge */}
              <div className="mb-6">
                <span className={theme.components.badge.primary}>
                  {question.category}
                </span>
                {question.subcategory && (
                  <span className={theme.components.badge.secondary + " ml-2"}>
                    {question.subcategory}
                  </span>
                )}
              </div>

              {/* Question */}
              <h2 className="text-xl font-medium text-charcoal mb-6">
                {question.question}
              </h2>

              {/* Context if available */}
              {question.context && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">{question.context}</p>
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
                      <span className="text-gray-800">{option.text}</span>
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
                    Calculating Results...
                  </>
                ) : (
                  <>
                    Complete Assessment
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

export default AIKnowledgeAssessment;