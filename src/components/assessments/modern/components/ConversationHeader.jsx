import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import './ConversationHeader.css';

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
    </motion.div>
  );
};

export default ConversationHeader;