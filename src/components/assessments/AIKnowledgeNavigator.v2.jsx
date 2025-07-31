import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../common/ErrorBoundary';
import logger from '../../utils/logger';

// Modern conversational assessment
import ConversationalAssessment from './modern/ConversationalAssessment';

// Legacy components for fallback
import AssessmentIntro from './components/AssessmentIntro';
import AssessmentResults from './components/AssessmentResults';
import { colors } from '../../utils/colors';
import './AIKnowledgeNavigator.v2.css';

/**
 * Modern AI Knowledge Navigator - Version 2.0
 * 
 * Improvements based on expert review:
 * - Conversational interface instead of form-based
 * - Centralized state management with Zustand
 * - Modern component architecture with proper separation
 * - Smooth animations and professional design
 * - Better error handling and user experience
 */
const AIKnowledgeNavigator = ({ useConversationalMode = true }) => {
  const { user, isPremium } = useAuth();
  const { currentProject, addAssessmentToProject, generateActionItemsFromAssessment } = useProject();
  const navigate = useNavigate();
  const [showLegacyMode, setShowLegacyMode] = useState(!useConversationalMode);

  const handleAssessmentComplete = async (results) => {
    try {
      logger.userAction('Assessment completed', { 
        type: 'ai_knowledge_conversational',
        score: results.overallScore,
        maturityLevel: results.maturityLevel
      });

      // Add to current project if exists
      if (currentProject && results) {
        await addAssessmentToProject(currentProject.id, {
          type: 'ai_knowledge_navigator',
          results,
          completedAt: new Date().toISOString(),
          sessionId: results.sessionId
        });

        // Generate action items from assessment
        await generateActionItemsFromAssessment(currentProject.id, results);
      }

      // Navigate to results or dashboard
      navigate('/dashboard', { 
        state: { 
          message: 'Assessment completed successfully!',
          showResults: true 
        }
      });

    } catch (error) {
      logger.error('Failed to complete assessment:', error);
      console.error('Assessment completion error:', error);
    }
  };

  const handleNavigateHome = () => {
    navigate('/dashboard');
  };

  const handleSwitchToLegacy = () => {
    setShowLegacyMode(true);
    logger.userAction('Switched to legacy assessment mode');
  };

  const handleSwitchToModern = () => {
    setShowLegacyMode(false);
    logger.userAction('Switched to conversational assessment mode');
  };

  // Modern conversational mode
  if (!showLegacyMode) {
    return (
      <ErrorBoundary
        fallback={({ error, resetErrorBoundary }) => (
          <div className="assessment-error-fallback">
            <div className="error-content">
              <h2>Assessment temporarily unavailable</h2>
              <p>The conversational assessment is experiencing issues.</p>
              <div className="error-actions">
                <button 
                  onClick={() => {
                    resetErrorBoundary();
                    setShowLegacyMode(true);
                  }}
                  className="fallback-button primary"
                  style={{ backgroundColor: colors.chestnut }}
                >
                  Use Standard Assessment
                </button>
                <button 
                  onClick={resetErrorBoundary}
                  className="fallback-button secondary"
                >
                  Try Again
                </button>
              </div>
            </div>

          </div>
        )}
      >
        <div className="modern-assessment-container">
          {/* Mode Switcher */}
          <div className="assessment-mode-switcher">
            <button
              onClick={handleSwitchToLegacy}
              className="mode-switch-button"
            >
              Switch to Standard Mode
            </button>
          </div>

          <ConversationalAssessment
            assessmentType="ai_knowledge"
            onComplete={handleAssessmentComplete}
            onNavigateHome={handleNavigateHome}
          />

        </div>
      </ErrorBoundary>
    );
  }

  // Legacy mode fallback
  return (
    <div className="legacy-assessment-container">
      <div className="legacy-header">
        <h1>AI Knowledge Assessment</h1>
        <p>Standard assessment mode</p>
        <button
          onClick={handleSwitchToModern}
          className="modern-mode-button"
          style={{ backgroundColor: colors.chestnut }}
        >
          Try Conversational Mode
        </button>
      </div>

      {/* Legacy assessment components would go here */}
      <div className="legacy-content">
        <p>Legacy assessment mode is under maintenance.</p>
        <p>Please use the conversational mode for the best experience.</p>
        
        <button
          onClick={handleSwitchToModern}
          className="switch-button"
          style={{ backgroundColor: colors.chestnut }}
        >
          Switch to Conversational Mode
        </button>
      </div>

    </div>
  );
};

export default AIKnowledgeNavigator;