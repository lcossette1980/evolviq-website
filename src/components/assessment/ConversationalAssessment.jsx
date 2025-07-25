import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Conversational Assessment Interface
 * Provides natural, chat-like assessment experience with real-time agent interaction
 */
const ConversationalAssessment = ({ 
  assessmentType = 'ai_knowledge',
  onComplete,
  onClose 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentSession, setAssessmentSession] = useState(null);
  const [assessmentProgress, setAssessmentProgress] = useState({
    currentQuestion: 0,
    totalQuestions: 0,
    completionPercentage: 0
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    isConnected,
    connectionStatus,
    startAgentSession,
    sendMessageToAgent,
    getSessionMessages,
    agentStatuses,
    error: wsError
  } = useWebSocket(user?.uid, { autoConnect: true });

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize assessment session
  useEffect(() => {
    if (isConnected && !assessmentSession) {
      initializeAssessment();
    }
  }, [isConnected]);

  const initializeAssessment = async () => {
    try {
      setIsLoading(true);
      
      const sessionConfig = {
        type: 'conversational_assessment',
        assessmentType,
        userId: user.uid,
        preferences: {
          conversational: true,
          realTime: true,
          adaptive: true
        }
      };

      const sessionId = startAgentSession(sessionConfig);
      
      if (sessionId) {
        setAssessmentSession({ sessionId, startTime: new Date().toISOString() });
        
        // Add welcome message
        const welcomeMessage = {
          id: `welcome_${Date.now()}`,
          type: 'agent',
          content: getWelcomeMessage(assessmentType),
          timestamp: new Date().toISOString(),
          agentId: 'assessment_coordinator',
          messageType: 'welcome'
        };
        
        setMessages([welcomeMessage]);
        
        // Start the assessment
        setTimeout(() => {
          sendMessageToAgent(sessionId, 'START_ASSESSMENT', 'assessment_coordinator');
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initialize assessment:', error);
      addSystemMessage('Sorry, there was an error starting the assessment. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = (type) => {
    const messages = {
      ai_knowledge: "Hi! I'm your AI Knowledge Assessment companion. I'll guide you through a personalized evaluation of your AI expertise. We'll have a natural conversation, and I'll adapt the questions based on your responses. Ready to begin?",
      change_readiness: "Hello! I'm here to help assess your organization's readiness for AI transformation. Through our conversation, I'll understand your current situation and provide tailored insights. Shall we start?",
      ai_readiness: "Welcome! I'm your AI Readiness Assessment guide. I'll help evaluate how prepared you and your organization are for AI implementation. Let's have a conversation about your current capabilities and goals."
    };
    
    return messages[type] || messages.ai_knowledge;
  };

  // Handle WebSocket messages
  useEffect(() => {
    if (!assessmentSession) return;

    const sessionMessages = getSessionMessages(assessmentSession.sessionId);
    const newMessages = sessionMessages
      .filter(msg => !messages.find(m => m.id === msg.id))
      .map(msg => ({
        id: msg.id,
        type: msg.direction === 'incoming' ? 'agent' : 'user',
        content: msg.message,
        timestamp: msg.timestamp,
        agentId: msg.agentId,
        messageType: msg.messageType
      }));

    if (newMessages.length > 0) {
      setMessages(prev => [...prev, ...newMessages]);
      
      // Update progress if provided
      newMessages.forEach(msg => {
        if (msg.messageType === 'progress_update' && typeof msg.content === 'object') {
          setAssessmentProgress(prev => ({
            ...prev,
            ...msg.content
          }));
        }
        
        // Handle assessment completion
        if (msg.messageType === 'assessment_complete') {
          handleAssessmentComplete(msg.content);
        }
      });
    }
  }, [getSessionMessages, assessmentSession, messages]);

  const handleAssessmentComplete = (results) => {
    addSystemMessage('Assessment completed! Generating your personalized results...', 'success');
    
    setTimeout(() => {
      if (onComplete) {
        onComplete(results);
      }
    }, 2000);
  };

  const addSystemMessage = (content, type = 'info') => {
    const message = {
      id: `system_${Date.now()}`,
      type: 'system',
      content,
      timestamp: new Date().toISOString(),
      systemType: type
    };
    
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !assessmentSession || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: currentInput.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      sendMessageToAgent(
        assessmentSession.sessionId, 
        currentInput.trim(), 
        'assessment_coordinator'
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      addSystemMessage('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (message) => {
    switch (message.type) {
      case 'agent':
        return <Bot className="w-5 h-5" style={{ color: colors.chestnut }} />;
      case 'user':
        return <User className="w-5 h-5" style={{ color: colors.navy }} />;
      case 'system':
        return message.systemType === 'success' 
          ? <CheckCircle className="w-5 h-5 text-green-600" />
          : message.systemType === 'error'
          ? <AlertCircle className="w-5 h-5 text-red-600" />
          : <Brain className="w-5 h-5" style={{ color: colors.khaki }} />;
      default:
        return <Bot className="w-5 h-5" style={{ color: colors.charcoal }} />;
    }
  };

  const getMessageStyles = (message) => {
    const baseStyles = "max-w-[80%] p-4 rounded-lg break-words";
    
    switch (message.type) {
      case 'agent':
        return `${baseStyles} bg-gray-100 text-gray-900 mr-auto`;
      case 'user':
        return `${baseStyles} ml-auto text-white`;
      case 'system':
        return `${baseStyles} mx-auto text-center text-sm ${
          message.systemType === 'success' ? 'bg-green-50 text-green-800' :
          message.systemType === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-900`;
    }
  };

  if (!isConnected && connectionStatus === 'disconnected') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LoadingSpinner message="Connecting to assessment system..." />
        {wsError && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>WebSocket connection unavailable</span>
            </div>
            <p className="text-sm mt-2">
              The real-time assessment feature is currently offline. Please try the standard assessment instead.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Use Standard Assessment
            </button>
          </div>
        )}
      </div>
    );
  }

  if (connectionStatus === 'offline') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-6 bg-blue-50 text-blue-800 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8" />
            <span className="text-lg font-semibold">Offline Mode</span>
          </div>
          <p className="mb-4">
            The conversational assessment is currently unavailable. The system will automatically switch to our standard assessment experience.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue with Standard Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.chestnut}20` }}
            >
              <Brain className="w-6 h-6" style={{ color: colors.chestnut }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: colors.charcoal }}>
                Conversational Assessment
              </h2>
              <p className="text-sm text-gray-600">
                AI-powered adaptive evaluation
              </p>
            </div>
          </div>
          
          {assessmentProgress.totalQuestions > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Question {assessmentProgress.currentQuestion} of {assessmentProgress.totalQuestions}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${assessmentProgress.completionPercentage}%`,
                    backgroundColor: colors.chestnut
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getMessageIcon(message)}
            </div>
            
            <div className={getMessageStyles(message)} style={
              message.type === 'user' ? { backgroundColor: colors.navy } : {}
            }>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-3">
            <Bot className="w-5 h-5" style={{ color: colors.chestnut }} />
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <textarea
            ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response here..."
            className="flex-1 resize-none border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ focusRingColor: colors.chestnut }}
            rows={1}
            disabled={isLoading}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isLoading}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: colors.chestnut,
              color: 'white'
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center space-x-1 ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-600' : 'bg-red-600'
              }`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </span>
            
            {agentStatuses.size > 0 && (
              <span className="text-blue-600">
                {agentStatuses.size} agent{agentStatuses.size !== 1 ? 's' : ''} active
              </span>
            )}
          </div>
          
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ConversationalAssessment;