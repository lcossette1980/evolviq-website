import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { colors } from '../../../../utils/colors';
import './TypingIndicator.css';

/**
 * Typing Indicator Component
 * Shows when the AI agent is processing/thinking with animated dots
 */
const TypingIndicator = ({ agent }) => {
  const dotVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 1] },
  };

  const containerVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <motion.div
      className="typing-indicator"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="agent-avatar">
        <div className="avatar-circle">
          {agent?.avatar ? (
            <img src={agent.avatar} alt={agent.name} />
          ) : (
            <Brain className="w-5 h-5" />
          )}
        </div>
      </div>

      <div className="typing-content">
        <div className="typing-bubble">
          <div className="typing-dots">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="typing-dot"
                variants={dotVariants}
                animate="animate"
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
          
          <div className="typing-text">
            {agent?.name || 'AI Expert'} is thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;