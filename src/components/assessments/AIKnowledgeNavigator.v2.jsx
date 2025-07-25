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

            <style jsx>{`
              .assessment-error-fallback {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, ${colors.bone} 0%, #fefefe 100%);
                padding: 40px 20px;
              }

              .error-content {
                text-align: center;
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }

              .error-content h2 {
                font-family: 'Playfair Display', serif;
                font-size: 1.5rem;
                color: ${colors.charcoal};
                margin: 0 0 16px;
              }

              .error-content p {
                color: ${colors.khaki};
                margin: 0 0 24px;
              }

              .error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
              }

              .fallback-button {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s ease;
              }

              .fallback-button.primary {
                color: white;
              }

              .fallback-button.secondary {
                background: ${colors.pearl};
                color: ${colors.charcoal};
                border: 1px solid ${colors.khaki};
              }

              .fallback-button:hover {
                opacity: 0.9;
              }
            `}</style>
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

          <style jsx>{`
            .modern-assessment-container {
              position: relative;
            }

            .assessment-mode-switcher {
              position: absolute;
              top: 20px;
              right: 20px;
              z-index: 100;
            }

            .mode-switch-button {
              background: rgba(255, 255, 255, 0.9);
              border: 1px solid ${colors.pearl};
              border-radius: 20px;
              padding: 8px 16px;
              font-size: 0.875rem;
              color: ${colors.khaki};
              cursor: pointer;
              transition: all 0.2s ease;
              backdrop-filter: blur(10px);
            }

            .mode-switch-button:hover {
              background: ${colors.pearl};
              color: ${colors.charcoal};
            }

            @media (max-width: 768px) {
              .assessment-mode-switcher {
                position: static;
                text-align: center;
                padding: 16px;
                background: ${colors.bone};
              }

              .mode-switch-button {
                display: inline-block;
              }
            }
          `}</style>
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

      <style jsx>{`
        .legacy-assessment-container {
          min-height: 100vh;
          background: ${colors.bone};
          padding: 40px 20px;
        }

        .legacy-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .legacy-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          color: ${colors.charcoal};
          margin: 0 0 12px;
        }

        .legacy-header p {
          color: ${colors.khaki};
          font-size: 1.125rem;
          margin: 0 0 24px;
        }

        .modern-mode-button,
        .switch-button {
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .modern-mode-button:hover,
        .switch-button:hover {
          opacity: 0.9;
        }

        .legacy-content {
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .legacy-content p {
          color: ${colors.khaki};
          margin: 0 0 16px;
          font-size: 1.125rem;
        }

        .legacy-content p:last-of-type {
          margin-bottom: 32px;
        }
      `}</style>
    </div>
  );
};

export default AIKnowledgeNavigator;