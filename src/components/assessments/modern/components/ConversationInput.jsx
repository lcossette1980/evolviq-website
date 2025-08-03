import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb } from 'lucide-react';
import './ConversationInput.css';

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

    </div>
  );
};

export default ConversationInput;