import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { useAuth } from '../../../contexts/AuthContext';
import { colors } from '../../../utils/colors';
import './ConversationalAssessment.css';

// Modern conversational components
import ConversationHeader from './components/ConversationHeader';
import ConversationArea from './components/ConversationArea';
import ConversationInput from './components/ConversationInput';
import AssessmentIntro from './components/AssessmentIntro';
import AssessmentResults from './components/AssessmentResults';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorBoundary from '../../common/ErrorBoundary';

/**
 * Modern Conversational Assessment Component
 * Implements expert review recommendations for conversational AI interaction
 */
const ConversationalAssessment = ({ 
  assessmentType = 'ai_knowledge',
  onComplete,
  onNavigateHome 
}) => {
  const { user } = useAuth();
  const {
    currentStep,
    conversation,
    progress,
    results,
    isLoading,
    error,
    startAssessment,
    sendMessage,
    retakeAssessment,
    clearError
  } = useAssessmentStore();

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleStartAssessment = () => {
    startAssessment(assessmentType, { userId: user?.uid });
  };

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  const handleRetakeAssessment = () => {
    retakeAssessment();
  };

  // Error state
  if (error) {
    return (
      <div className="conversational-assessment">
        <div className="assessment-container">
          <motion.div 
            className="error-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="error-content">
              <h3>Assessment temporarily unavailable</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button 
                  onClick={clearError}
                  className="retry-button"
                  style={{ backgroundColor: colors.chestnut }}
                >
                  Try Again
                </button>
                <button 
                  onClick={onNavigateHome}
                  className="home-button"
                >
                  Go Home
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && currentStep === 'intro') {
    return (
      <div className="conversational-assessment">
        <div className="assessment-container">
          <LoadingSpinner message="Preparing your assessment..." />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="conversational-assessment">
        <div className="assessment-container">
          <AnimatePresence mode="wait">
            {currentStep === 'intro' && !conversation.started && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AssessmentIntro 
                  onStartAssessment={handleStartAssessment}
                  assessmentType={assessmentType}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {currentStep === 'assessment' && conversation.started && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="conversation-interface"
              >
                <ConversationHeader 
                  agent={conversation.currentAgent}
                  progress={progress}
                />
                
                <ConversationArea 
                  messages={conversation.messages}
                  isTyping={conversation.isTyping}
                  currentAgent={conversation.currentAgent}
                />
                
                <ConversationInput 
                  onSend={handleSendMessage}
                  suggestions={conversation.suggestions}
                  disabled={conversation.isTyping || isLoading}
                  placeholder={`Tell ${conversation.currentAgent?.name || 'me'} about your AI experience...`}
                />
              </motion.div>
            )}

            {currentStep === 'results' && results && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AssessmentResults
                  results={results}
                  onRetakeAssessment={handleRetakeAssessment}
                  onComplete={onComplete}
                  onNavigateHome={onNavigateHome}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ConversationalAssessment;