import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb } from 'lucide-react';
import { colors } from '../../../../utils/colors';

/**
 * Conversation Input Component
 * Modern input interface with suggestions and smooth interactions
 */
const ConversationInput = ({ 
  onSend, 
  suggestions = [], 
  disabled = false, 
  placeholder = "Type your response..." 
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(suggestions.length > 0);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Show suggestions when they change
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && !input.trim());
  }, [suggestions, input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    onSend(suggestion);
    setInput('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  return (
    <div className="conversation-input">
      {/* Quick Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            className="suggestions-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="suggestions-header">
              <Lightbulb className="w-4 h-4" />
              <span>Quick responses:</span>
            </div>
            
            <div className="suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  className="suggestion-chip"
                  variants={suggestionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={disabled}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="input-container">
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="conversation-textarea"
            rows={1}
          />
          
          {input.trim() && (
            <div className="character-count">
              {input.length} characters
            </div>
          )}
        </div>

        <motion.button
          className="send-button"
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          whileHover={!disabled && input.trim() ? { scale: 1.05 } : {}}
          whileTap={!disabled && input.trim() ? { scale: 0.95 } : {}}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Helper Text */}
      <div className="input-helper">
        <span>Press Enter to send, Shift+Enter for new line</span>
      </div>

      <style jsx>{`
        .conversation-input {
          background: ${colors.bone};
          border-top: 1px solid rgba(42, 42, 42, 0.1);
          padding: 20px 24px;
        }

        .suggestions-container {
          margin-bottom: 16px;
        }

        .suggestions-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${colors.khaki};
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .suggestions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-chip {
          background: white;
          border: 2px solid ${colors.pearl};
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 0.875rem;
          color: ${colors.charcoal};
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .suggestion-chip:hover:not(:disabled) {
          border-color: ${colors.chestnut};
          background: ${colors.pearl};
        }

        .suggestion-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .textarea-container {
          flex: 1;
          position: relative;
        }

        .conversation-textarea {
          width: 100%;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 12px 16px;
          font-family: inherit;
          font-size: 0.95rem;
          line-height: 1.5;
          resize: none;
          background: white;
          color: ${colors.charcoal};
          transition: all 0.2s ease;
          min-height: 48px;
          max-height: 120px;
        }

        .conversation-textarea::placeholder {
          color: ${colors.khaki};
        }

        .conversation-textarea:focus {
          outline: none;
          border-color: ${colors.chestnut};
          box-shadow: 0 0 0 3px rgba(164, 74, 63, 0.1);
        }

        .conversation-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f5f5f5;
        }

        .character-count {
          position: absolute;
          bottom: -20px;
          right: 0;
          font-size: 0.75rem;
          color: ${colors.khaki};
        }

        .send-button {
          background: ${colors.chestnut};
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: #8e3d33;
          box-shadow: 0 4px 12px rgba(164, 74, 63, 0.3);
        }

        .send-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
        }

        .input-helper {
          text-align: center;
          margin-top: 12px;
          font-size: 0.75rem;
          color: ${colors.khaki};
        }

        @media (max-width: 768px) {
          .conversation-input {
            padding: 16px;
          }

          .suggestions-grid {
            flex-direction: column;
          }

          .suggestion-chip {
            text-align: center;
          }

          .send-button {
            width: 44px;
            height: 44px;
          }

          .conversation-textarea {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default ConversationInput;