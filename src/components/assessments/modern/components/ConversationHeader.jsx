import React from 'react';
import { motion } from 'framer-motion';
import { Brain, User, Zap } from 'lucide-react';
import { colors } from '../../../../utils/colors';

/**
 * Conversation Header Component
 * Displays agent information and assessment progress
 */
const ConversationHeader = ({ agent, progress }) => {
  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ef4444';
    if (percentage < 60) return '#f97316';
    if (percentage < 80) return '#eab308';
    return '#22c55e';
  };

  return (
    <motion.div 
      className="conversation-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="agent-info">
        <div className="agent-avatar">
          {agent?.avatar ? (
            <img src={agent.avatar} alt={agent.name} />
          ) : (
            <Brain className="w-6 h-6" />
          )}
        </div>
        
        <div className="agent-details">
          <h3 className="agent-name">
            {agent?.name || 'AI Assessment Expert'}
          </h3>
          <p className="agent-status">
            {agent?.focus || 'Evaluating your AI knowledge'}
          </p>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-text">
            Question {progress.currentQuestion + 1} of {progress.totalQuestions}
          </span>
          <span className="progress-percentage">
            {progress.completionPercentage}%
          </span>
        </div>
        
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress.completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ 
              backgroundColor: getProgressColor(progress.completionPercentage)
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .conversation-header {
          background: ${colors.pearl};
          padding: 24px;
          border-bottom: 1px solid rgba(42, 42, 42, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .agent-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .agent-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${colors.chestnut};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          overflow: hidden;
        }

        .agent-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .agent-details {
          min-width: 0;
        }

        .agent-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${colors.charcoal};
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .agent-status {
          color: ${colors.khaki};
          font-size: 0.875rem;
          margin: 4px 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .progress-section {
          flex: 1;
          max-width: 200px;
          text-align: right;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-text {
          font-size: 0.875rem;
          color: ${colors.charcoal};
          font-weight: 500;
        }

        .progress-percentage {
          font-size: 0.875rem;
          color: ${colors.khaki};
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(42, 42, 42, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: background-color 0.3s ease;
        }

        @media (max-width: 768px) {
          .conversation-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding: 20px;
          }

          .agent-info {
            justify-content: center;
          }

          .progress-section {
            max-width: none;
            text-align: center;
          }

          .agent-name {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ConversationHeader;