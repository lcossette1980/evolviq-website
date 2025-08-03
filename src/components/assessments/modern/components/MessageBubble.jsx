import React from 'react';
import { Brain, User, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';
import './MessageBubble.css';

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

      {isUser && (
        <div className="user-avatar">
          <div className="avatar-circle user-circle">
            <User className="w-5 h-5" />
          </div>
        </div>
      )}

      <div className={styles.bubble}>
        {isAgent && isFirst && (
          <div className="agent-name">
            {message.agent?.name || 'AI Expert'}
          </div>
        )}

        <div className={`${styles.content} ${isFirst && isAgent ? 'first' : ''} ${isLast && isUser ? 'last' : ''}`}>
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
    </div>
  );
};

export default MessageBubble;