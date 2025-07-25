import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { colors } from '../../../../utils/colors';

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

      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 16px;
        }

        .agent-avatar {
          width: 36px;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding-bottom: 4px;
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${colors.chestnut};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
          position: relative;
        }

        .avatar-circle::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 2px solid ${colors.chestnut};
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .typing-content {
          max-width: 70%;
        }

        .typing-bubble {
          background: ${colors.pearl};
          border-radius: 18px 18px 18px 4px;
          padding: 16px 20px;
          position: relative;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${colors.khaki};
          opacity: 0.6;
        }

        .typing-text {
          font-size: 0.85rem;
          color: ${colors.khaki};
          font-style: italic;
        }

        @media (max-width: 768px) {
          .typing-content {
            max-width: 80%;
          }

          .typing-bubble {
            padding: 12px 16px;
          }

          .typing-text {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default TypingIndicator;