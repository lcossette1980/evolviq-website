import React from 'react';
import { motion } from 'framer-motion';
import { Brain, User, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';
import { colors } from '../../../../utils/colors';

/**
 * Message Bubble Component
 * Displays individual messages with appropriate styling based on role and type
 */
const MessageBubble = ({ message, isFirst, isLast }) => {
  const isAgent = message.role === 'agent';
  const isUser = message.role === 'user';

  const getMessageIcon = () => {
    if (isAgent) {
      switch (message.type) {
        case 'question':
          return <HelpCircle className="w-4 h-4" />;
        case 'insight':
          return <Lightbulb className="w-4 h-4" />;
        case 'completion':
          return <CheckCircle className="w-4 h-4" />;
        default:
          return <Brain className="w-4 h-4" />;
      }
    }
    return <User className="w-4 h-4" />;
  };

  const getMessageStyles = () => {
    if (isAgent) {
      return {
        container: 'message-container agent',
        bubble: 'message-bubble agent-message',
        content: 'message-content agent-content'
      };
    }
    return {
      container: 'message-container user',
      bubble: 'message-bubble user-message',
      content: 'message-content user-content'
    };
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const styles = getMessageStyles();

  return (
    <div className={styles.container}>
      {isAgent && isFirst && (
        <div className="agent-avatar">
          <div className="avatar-circle">
            {message.agent?.avatar ? (
              <img src={message.agent.avatar} alt={message.agent.name} />
            ) : (
              <Brain className="w-5 h-5" />
            )}
          </div>
        </div>
      )}

      <div className={styles.bubble}>
        {isAgent && isFirst && (
          <div className="agent-name">
            {message.agent?.name || 'AI Expert'}
          </div>
        )}

        <div className={styles.content}>
          {/* Message icon for special types */}
          {(message.type === 'question' || message.type === 'insight' || message.type === 'completion') && (
            <div className="message-icon">
              {getMessageIcon()}
            </div>
          )}

          {/* Main message content */}
          <div className="message-text">
            {message.content}
          </div>

          {/* Context or additional info */}
          {message.context && (
            <div className="message-context">
              {message.context}
            </div>
          )}

          {/* Timestamp */}
          <div className="message-timestamp">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>

      <style jsx>{`
        .message-container {
          display: flex;
          margin-bottom: 16px;
          gap: 12px;
        }

        .message-container.agent {
          justify-content: flex-start;
        }

        .message-container.user {
          justify-content: flex-end;
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
        }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message-bubble {
          max-width: 70%;
          min-width: 120px;
        }

        .agent-message {
          margin-left: 0;
        }

        .user-message {
          margin-right: 0;
        }

        .agent-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: ${colors.khaki};
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .message-content {
          padding: 16px 20px;
          border-radius: 18px;
          position: relative;
        }

        .agent-content {
          background: ${colors.pearl};
          color: ${colors.charcoal};
          border-bottom-left-radius: ${isFirst ? '4px' : '18px'};
        }

        .user-content {
          background: ${colors.chestnut};
          color: white;
          border-bottom-right-radius: ${isLast ? '4px' : '18px'};
        }

        .message-icon {
          display: inline-flex;
          align-items: center;
          margin-right: 8px;
          opacity: 0.7;
        }

        .message-text {
          font-size: 0.95rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .message-context {
          margin-top: 8px;
          font-size: 0.85rem;
          opacity: 0.8;
          font-style: italic;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .agent-content .message-context {
          border-top-color: rgba(42, 42, 42, 0.1);
        }

        .message-timestamp {
          font-size: 0.75rem;
          opacity: 0.6;
          margin-top: 8px;
          text-align: right;
        }

        .agent-content .message-timestamp {
          text-align: left;
        }

        @media (max-width: 768px) {
          .message-bubble {
            max-width: 85%;
          }

          .message-content {
            padding: 12px 16px;
          }

          .message-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;