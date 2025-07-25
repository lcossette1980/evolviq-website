import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { colors } from '../../../../utils/colors';

/**
 * Conversation Area Component
 * Displays the conversation messages with smooth animations
 */
const ConversationArea = ({ messages, isTyping, currentAgent }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [messages, isTyping]);

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  return (
    <div className="conversation-area" ref={containerRef}>
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                delay: index * 0.05 // Stagger animation for multiple messages
              }}
            >
              <MessageBubble 
                message={message}
                isFirst={index === 0 || messages[index - 1]?.role !== message.role}
                isLast={index === messages.length - 1 || messages[index + 1]?.role !== message.role}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TypingIndicator agent={currentAgent} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      <style jsx>{`
        .conversation-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .messages-container {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          scroll-behavior: smooth;
          background: linear-gradient(135deg, ${colors.bone} 0%, #fefefe 100%);
        }

        /* Custom scrollbar */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(164, 74, 63, 0.3);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(164, 74, 63, 0.5);
        }

        @media (max-width: 768px) {
          .messages-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ConversationArea;