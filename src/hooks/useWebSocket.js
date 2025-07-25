import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

/**
 * Custom hook for WebSocket agent communication
 * Provides real-time agent interaction capabilities
 */
export const useWebSocket = (userId, options = {}) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [agentMessages, setAgentMessages] = useState([]);
  const [agentStatuses, setAgentStatuses] = useState(new Map());
  const [activeSessions, setActiveSessions] = useState([]);
  const [error, setError] = useState(null);
  
  const listenersRef = useRef(new Set());
  const { autoConnect = true, reconnectOnError = true } = options;

  // Connection management
  const connect = useCallback(() => {
    if (!userId) {
      console.warn('Cannot connect WebSocket without userId');
      return;
    }

    try {
      websocketService.connect(userId);
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError(err.message);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setConnectionStatus('disconnected');
    setAgentMessages([]);
    setAgentStatuses(new Map());
    setActiveSessions([]);
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!userId) return;

    const handleConnectionStatus = (data) => {
      setConnectionStatus(data.status);
      if (data.status === 'connected') {
        setError(null);
        // Refresh active sessions
        setActiveSessions(websocketService.getActiveSessions());
      }
    };

    const handleConnectionError = (data) => {
      setError(`Connection error: ${data.error.message}`);
      if (reconnectOnError && data.attempts < 3) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 2000 * data.attempts);
      }
    };

    const handleAgentMessage = (data) => {
      setAgentMessages(prev => [...prev, {
        id: `${data.sessionId}_${Date.now()}`,
        sessionId: data.sessionId,
        agentId: data.agentId,
        message: data.message,
        messageType: data.messageType,
        timestamp: data.timestamp,
        direction: 'incoming'
      }]);
    };

    const handleAgentStatus = (data) => {
      setAgentStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(data.agentId, {
          status: data.status,
          context: data.context,
          sessionId: data.sessionId,
          timestamp: data.timestamp
        });
        return newMap;
      });
    };

    const handleSessionUpdate = (data) => {
      setActiveSessions(prev => {
        const updated = prev.map(session => 
          session.sessionId === data.sessionId 
            ? { ...session, status: data.status, metadata: data.metadata }
            : session
        );
        
        // Add new session if not found
        if (!updated.find(s => s.sessionId === data.sessionId)) {
          updated.push({
            sessionId: data.sessionId,
            status: data.status,
            metadata: data.metadata
          });
        }
        
        return updated;
      });
    };

    const handleAssessmentProgress = (data) => {
      // This can be handled by parent components that need assessment updates
      console.log('Assessment progress:', data);
    };

    const handleError = (error) => {
      setError(`WebSocket error: ${error.message || error}`);
    };

    // Register listeners
    websocketService.on('connection_status', handleConnectionStatus);
    websocketService.on('connection_error', handleConnectionError);
    websocketService.on('agent_message', handleAgentMessage);
    websocketService.on('agent_status', handleAgentStatus);
    websocketService.on('session_update', handleSessionUpdate);
    websocketService.on('assessment_progress', handleAssessmentProgress);
    websocketService.on('error', handleError);

    // Track listeners for cleanup
    listenersRef.current.add(['connection_status', handleConnectionStatus]);
    listenersRef.current.add(['connection_error', handleConnectionError]);
    listenersRef.current.add(['agent_message', handleAgentMessage]);
    listenersRef.current.add(['agent_status', handleAgentStatus]);
    listenersRef.current.add(['session_update', handleSessionUpdate]);
    listenersRef.current.add(['assessment_progress', handleAssessmentProgress]);
    listenersRef.current.add(['error', handleError]);

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(([event, handler]) => {
        websocketService.off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [userId, autoConnect, reconnectOnError, connect]);

  // Agent interaction methods
  const startAgentSession = useCallback((config) => {
    try {
      const sessionId = websocketService.startAgentSession(config);
      return sessionId;
    } catch (err) {
      setError(`Failed to start agent session: ${err.message}`);
      return null;
    }
  }, []);

  const sendMessageToAgent = useCallback((sessionId, message, targetAgent = null) => {
    try {
      const messageId = websocketService.sendMessageToAgent(sessionId, message, targetAgent);
      
      // Add to local state
      setAgentMessages(prev => [...prev, {
        id: messageId,
        sessionId,
        message,
        targetAgent,
        timestamp: new Date().toISOString(),
        direction: 'outgoing'
      }]);
      
      return messageId;
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
      return null;
    }
  }, []);

  const joinAssessmentSession = useCallback((assessmentId) => {
    try {
      websocketService.joinAssessmentSession(assessmentId, userId);
    } catch (err) {
      setError(`Failed to join assessment: ${err.message}`);
    }
  }, [userId]);

  const leaveAssessmentSession = useCallback((assessmentId) => {
    websocketService.leaveAssessmentSession(assessmentId);
  }, []);

  // Get session data
  const getSession = useCallback((sessionId) => {
    return websocketService.getSession(sessionId);
  }, []);

  const getSessionMessages = useCallback((sessionId) => {
    return agentMessages.filter(msg => msg.sessionId === sessionId);
  }, [agentMessages]);

  // Clear messages for a session
  const clearSessionMessages = useCallback((sessionId) => {
    setAgentMessages(prev => prev.filter(msg => msg.sessionId !== sessionId));
  }, []);

  // Clear all messages
  const clearAllMessages = useCallback(() => {
    setAgentMessages([]);
  }, []);

  return {
    // Connection state
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    error,
    
    // Agent communication
    agentMessages,
    agentStatuses,
    activeSessions,
    
    // Connection methods
    connect,
    disconnect,
    
    // Agent interaction methods
    startAgentSession,
    sendMessageToAgent,
    joinAssessmentSession,
    leaveAssessmentSession,
    
    // Data methods
    getSession,
    getSessionMessages,
    clearSessionMessages,
    clearAllMessages,
    
    // Utility
    getConnectionInfo: () => websocketService.getConnectionStatus()
  };
};

/**
 * Hook specifically for assessment real-time updates
 */
export const useAssessmentWebSocket = (assessmentId, userId) => {
  const [assessmentProgress, setAssessmentProgress] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  
  const { 
    isConnected, 
    joinAssessmentSession, 
    leaveAssessmentSession,
    error 
  } = useWebSocket(userId, { autoConnect: true });

  useEffect(() => {
    if (isConnected && assessmentId && !isJoined) {
      joinAssessmentSession(assessmentId);
      setIsJoined(true);
    }

    return () => {
      if (isJoined && assessmentId) {
        leaveAssessmentSession(assessmentId);
        setIsJoined(false);
      }
    };
  }, [isConnected, assessmentId, isJoined, joinAssessmentSession, leaveAssessmentSession]);

  useEffect(() => {
    const handleAssessmentProgress = (data) => {
      if (data.assessmentId === assessmentId) {
        setAssessmentProgress(data);
      }
    };

    websocketService.on('assessment_progress', handleAssessmentProgress);

    return () => {
      websocketService.off('assessment_progress', handleAssessmentProgress);
    };
  }, [assessmentId]);

  return {
    assessmentProgress,
    isConnected,
    isJoined,
    error
  };
};

export default useWebSocket;