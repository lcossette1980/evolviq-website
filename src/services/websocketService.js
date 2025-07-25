import { io } from 'socket.io-client';
import { buildUrl } from '../config/apiConfig';

/**
 * WebSocket Service for Real-time Agent Communication
 * Handles live agent interactions, status updates, and collaborative sessions
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.connectionStatus = 'disconnected';
    this.listeners = new Map();
    this.agentSessions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize WebSocket connection
   */
  connect(userId, userToken = null) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    // Build the correct Socket.IO URL
    const baseUrl = buildUrl('');
    const socketUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    
    console.log('WebSocket connecting to:', socketUrl);
    
    this.socket = io(socketUrl, {
      auth: {
        userId,
        token: userToken
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      forceNew: true,
      upgrade: true
    });

    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket.id);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connection_status', { status: 'connected', socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.emit('connection_status', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectionStatus = 'error';
      this.reconnectAttempts++;
      this.emit('connection_error', { error, attempts: this.reconnectAttempts });
    });

    // Agent communication events
    this.socket.on('agent_message', (data) => {
      console.log('Agent message received:', data);
      this.handleAgentMessage(data);
    });

    this.socket.on('agent_status', (data) => {
      console.log('Agent status update:', data);
      this.handleAgentStatusUpdate(data);
    });

    this.socket.on('assessment_progress', (data) => {
      console.log('Assessment progress update:', data);
      this.emit('assessment_progress', data);
    });

    this.socket.on('session_update', (data) => {
      console.log('Session update:', data);
      this.handleSessionUpdate(data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Handle incoming agent messages
   */
  handleAgentMessage(data) {
    const { sessionId, agentId, message, messageType, timestamp } = data;
    
    // Store message in session history
    if (!this.agentSessions.has(sessionId)) {
      this.agentSessions.set(sessionId, {
        messages: [],
        agents: new Set(),
        status: 'active'
      });
    }
    
    const session = this.agentSessions.get(sessionId);
    session.messages.push({
      agentId,
      message,
      messageType,
      timestamp: timestamp || new Date().toISOString(),
      direction: 'incoming'
    });
    session.agents.add(agentId);
    
    this.emit('agent_message', {
      sessionId,
      agentId,
      message,
      messageType,
      timestamp,
      session: session
    });
  }

  /**
   * Handle agent status updates
   */
  handleAgentStatusUpdate(data) {
    const { agentId, status, context, sessionId } = data;
    
    this.emit('agent_status', {
      agentId,
      status,
      context,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle session updates
   */
  handleSessionUpdate(data) {
    const { sessionId, status, metadata } = data;
    
    if (this.agentSessions.has(sessionId)) {
      const session = this.agentSessions.get(sessionId);
      session.status = status;
      session.metadata = { ...session.metadata, ...metadata };
    }
    
    this.emit('session_update', { sessionId, status, metadata });
  }

  /**
   * Start a new agent session
   */
  startAgentSession(sessionConfig) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.socket.emit('start_agent_session', {
      sessionId,
      ...sessionConfig,
      timestamp: new Date().toISOString()
    });

    // Initialize local session
    this.agentSessions.set(sessionId, {
      messages: [],
      agents: new Set(),
      status: 'initializing',
      config: sessionConfig,
      startTime: new Date().toISOString()
    });

    return sessionId;
  }

  /**
   * Send message to agent
   */
  sendMessageToAgent(sessionId, message, targetAgent = null) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const messageData = {
      sessionId,
      message,
      targetAgent,
      timestamp: new Date().toISOString(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.socket.emit('agent_message', messageData);

    // Store in local session
    if (this.agentSessions.has(sessionId)) {
      const session = this.agentSessions.get(sessionId);
      session.messages.push({
        ...messageData,
        direction: 'outgoing'
      });
    }

    return messageData.messageId;
  }

  /**
   * Join assessment session for real-time updates
   */
  joinAssessmentSession(assessmentId, userId) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('join_assessment', {
      assessmentId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Leave assessment session
   */
  leaveAssessmentSession(assessmentId) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave_assessment', {
      assessmentId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Subscribe to specific events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId) {
    return this.agentSessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    const active = [];
    this.agentSessions.forEach((session, sessionId) => {
      if (session.status === 'active') {
        active.push({ sessionId, ...session });
      }
    });
    return active;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      connected: this.socket?.connected || false,
      socketId: this.socket?.id,
      activeSessions: this.agentSessions.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.agentSessions.clear();
    this.listeners.clear();
    console.log('WebSocket disconnected');
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;