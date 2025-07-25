"""
WebSocket Server for Real-time Agent Communication
Handles live agent interactions, assessment sessions, and collaborative features
"""

import socketio
import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SessionStatus(Enum):
    INITIALIZING = "initializing"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"

class AgentStatus(Enum):
    ONLINE = "online"
    BUSY = "busy"
    OFFLINE = "offline"
    PROCESSING = "processing"

@dataclass
class AgentSession:
    session_id: str
    user_id: str
    session_type: str
    status: SessionStatus
    created_at: datetime
    last_activity: datetime
    agents: List[str]
    context: Dict[str, Any]
    messages: List[Dict[str, Any]]

@dataclass
class AgentInfo:
    agent_id: str
    name: str
    status: AgentStatus
    specialization: str
    current_sessions: int
    max_sessions: int

class WebSocketServer:
    def __init__(self):
        # Create Socket.IO server
        self.sio = socketio.AsyncServer(
            cors_allowed_origins="*",
            async_mode='asgi',
            logger=logger,
            engineio_logger=logger
        )
        
        # Storage for sessions and agents
        self.sessions: Dict[str, AgentSession] = {}
        self.agents: Dict[str, AgentInfo] = {}
        self.user_sessions: Dict[str, List[str]] = {}  # user_id -> session_ids
        self.connected_clients: Dict[str, Dict[str, Any]] = {}  # sid -> client_info
        
        # Initialize available agents
        self._initialize_agents()
        
        # Setup event handlers
        self._setup_event_handlers()
        
        logger.info("WebSocket server initialized")

    def _initialize_agents(self):
        """Initialize available AI agents"""
        default_agents = [
            AgentInfo(
                agent_id="assessment_coordinator",
                name="Assessment Coordinator",
                status=AgentStatus.ONLINE,
                specialization="Assessment management and coordination",
                current_sessions=0,
                max_sessions=10
            ),
            AgentInfo(
                agent_id="ai_knowledge_expert",
                name="AI Knowledge Expert",
                status=AgentStatus.ONLINE,
                specialization="AI concepts, machine learning, and technical knowledge",
                current_sessions=0,
                max_sessions=5
            ),
            AgentInfo(
                agent_id="change_readiness_analyst",
                name="Change Readiness Analyst",
                status=AgentStatus.ONLINE,
                specialization="Organizational change and readiness assessment",
                current_sessions=0,
                max_sessions=5
            ),
            AgentInfo(
                agent_id="implementation_advisor",
                name="Implementation Advisor",
                status=AgentStatus.ONLINE,
                specialization="AI implementation strategies and best practices",
                current_sessions=0,
                max_sessions=3
            )
        ]
        
        for agent in default_agents:
            self.agents[agent.agent_id] = agent
            
        logger.info(f"Initialized {len(self.agents)} agents")

    def _setup_event_handlers(self):
        """Setup Socket.IO event handlers"""
        
        @self.sio.event
        async def connect(sid, environ, auth):
            """Handle client connection"""
            try:
                user_id = auth.get('userId') if auth else None
                token = auth.get('token') if auth else None
                
                logger.info(f"Client {sid} connecting, user_id: {user_id}")
                
                # Store client information
                self.connected_clients[sid] = {
                    'user_id': user_id,
                    'token': token,
                    'connected_at': datetime.now(),
                    'last_activity': datetime.now()
                }
                
                # Send connection confirmation and agent status
                await self.sio.emit('connection_status', {
                    'status': 'connected',
                    'socketId': sid,
                    'agents_available': len([a for a in self.agents.values() if a.status == AgentStatus.ONLINE]),
                    'timestamp': datetime.now().isoformat()
                }, room=sid)
                
                # Send current agent statuses
                agent_statuses = {
                    agent_id: {
                        'status': agent.status.value,
                        'name': agent.name,
                        'specialization': agent.specialization,
                        'availability': agent.max_sessions - agent.current_sessions
                    }
                    for agent_id, agent in self.agents.items()
                }
                
                await self.sio.emit('agents_status', agent_statuses, room=sid)
                
                logger.info(f"Client {sid} connected successfully")
                
            except Exception as e:
                logger.error(f"Error in connect handler: {e}")
                await self.sio.emit('error', {'message': f'Connection error: {str(e)}'}, room=sid)

        @self.sio.event
        async def disconnect(sid):
            """Handle client disconnection"""
            try:
                client_info = self.connected_clients.get(sid)
                if client_info:
                    user_id = client_info['user_id']
                    logger.info(f"Client {sid} (user: {user_id}) disconnecting")
                    
                    # Clean up user sessions
                    if user_id and user_id in self.user_sessions:
                        for session_id in self.user_sessions[user_id]:
                            if session_id in self.sessions:
                                session = self.sessions[session_id]
                                if session.status == SessionStatus.ACTIVE:
                                    session.status = SessionStatus.PAUSED
                                    session.last_activity = datetime.now()
                    
                    # Remove from connected clients
                    del self.connected_clients[sid]
                    
                logger.info(f"Client {sid} disconnected")
                
            except Exception as e:
                logger.error(f"Error in disconnect handler: {e}")

        @self.sio.event
        async def start_agent_session(sid, data):
            """Start a new agent session"""
            try:
                session_id = data.get('sessionId')
                session_type = data.get('type', 'general')
                assessment_type = data.get('assessmentType', 'ai_knowledge')
                preferences = data.get('preferences', {})
                
                client_info = self.connected_clients.get(sid)
                if not client_info:
                    await self.sio.emit('error', {'message': 'Client not authenticated'}, room=sid)
                    return
                
                user_id = client_info['user_id']
                
                logger.info(f"Starting agent session {session_id} for user {user_id}")
                
                # Create new session
                session = AgentSession(
                    session_id=session_id,
                    user_id=user_id,
                    session_type=session_type,
                    status=SessionStatus.INITIALIZING,
                    created_at=datetime.now(),
                    last_activity=datetime.now(),
                    agents=['assessment_coordinator'],
                    context={
                        'assessment_type': assessment_type,
                        'preferences': preferences,
                        'client_sid': sid
                    },
                    messages=[]
                )
                
                # Store session
                self.sessions[session_id] = session
                if user_id not in self.user_sessions:
                    self.user_sessions[user_id] = []
                self.user_sessions[user_id].append(session_id)
                
                # Update agent status
                if 'assessment_coordinator' in self.agents:
                    self.agents['assessment_coordinator'].current_sessions += 1
                
                # Notify client
                await self.sio.emit('session_update', {
                    'sessionId': session_id,
                    'status': SessionStatus.ACTIVE.value,
                    'metadata': {
                        'type': session_type,
                        'agents': session.agents,
                        'created_at': session.created_at.isoformat()
                    }
                }, room=sid)
                
                # Simulate initial agent response
                await self._simulate_agent_response(session_id, 'assessment_coordinator')
                
                logger.info(f"Agent session {session_id} started successfully")
                
            except Exception as e:
                logger.error(f"Error starting agent session: {e}")
                await self.sio.emit('error', {'message': f'Failed to start session: {str(e)}'}, room=sid)

        @self.sio.event
        async def agent_message(sid, data):
            """Handle message to agent"""
            try:
                session_id = data.get('sessionId')
                message = data.get('message')
                target_agent = data.get('targetAgent', 'assessment_coordinator')
                timestamp = data.get('timestamp')
                
                if not session_id or not message:
                    await self.sio.emit('error', {'message': 'Invalid message data'}, room=sid)
                    return
                
                session = self.sessions.get(session_id)
                if not session:
                    await self.sio.emit('error', {'message': 'Session not found'}, room=sid)
                    return
                
                logger.info(f"Received message for session {session_id}: {message[:100]}...")
                
                # Store user message
                user_message = {
                    'id': str(uuid.uuid4()),
                    'type': 'user',
                    'content': message,
                    'timestamp': timestamp or datetime.now().isoformat(),
                    'session_id': session_id
                }
                session.messages.append(user_message)
                session.last_activity = datetime.now()
                
                # Simulate agent processing
                await self._simulate_agent_response(session_id, target_agent, message)
                
            except Exception as e:
                logger.error(f"Error handling agent message: {e}")
                await self.sio.emit('error', {'message': f'Message processing error: {str(e)}'}, room=sid)

        @self.sio.event
        async def join_assessment(sid, data):
            """Join assessment session for real-time updates"""
            try:
                assessment_id = data.get('assessmentId')
                user_id = data.get('userId')
                
                logger.info(f"Client {sid} joining assessment {assessment_id}")
                
                # Join Socket.IO room for assessment updates
                await self.sio.enter_room(sid, f"assessment_{assessment_id}")
                
                await self.sio.emit('assessment_joined', {
                    'assessmentId': assessment_id,
                    'status': 'joined'
                }, room=sid)
                
            except Exception as e:
                logger.error(f"Error joining assessment: {e}")

        @self.sio.event
        async def leave_assessment(sid, data):
            """Leave assessment session"""
            try:
                assessment_id = data.get('assessmentId')
                
                logger.info(f"Client {sid} leaving assessment {assessment_id}")
                
                await self.sio.leave_room(sid, f"assessment_{assessment_id}")
                
            except Exception as e:
                logger.error(f"Error leaving assessment: {e}")

    async def _simulate_agent_response(self, session_id: str, agent_id: str, user_message: str = None):
        """Simulate agent response (replace with actual AI agent integration)"""
        try:
            session = self.sessions.get(session_id)
            if not session:
                return
            
            client_sid = session.context.get('client_sid')
            if not client_sid:
                return
            
            # Update agent status to processing
            await self.sio.emit('agent_status', {
                'agentId': agent_id,
                'status': AgentStatus.PROCESSING.value,
                'context': {'processing_message': True},
                'sessionId': session_id
            }, room=client_sid)
            
            # Simulate processing delay
            await asyncio.sleep(1.5)
            
            # Generate simulated response based on context
            assessment_type = session.context.get('assessment_type', 'ai_knowledge')
            message_count = len(session.messages)
            
            if message_count == 0:
                # Initial greeting
                if assessment_type == 'ai_knowledge':
                    response = "Hello! I'm ready to assess your AI knowledge. Let's start with a fundamental question: How would you describe artificial intelligence to someone who's never heard of it before?"
                elif assessment_type == 'change_readiness':
                    response = "Welcome! I'll help assess your organization's readiness for change. First, could you tell me about your current organizational structure and how decisions are typically made?"
                else:
                    response = "Hello! I'm here to help with your assessment. Could you tell me a bit about your background and what you'd like to focus on?"
            elif user_message and user_message.upper() == 'START_ASSESSMENT':
                response = "Perfect! Let's begin your personalized assessment. I'll adapt my questions based on your responses to give you the most relevant evaluation."
            else:
                # Generate contextual response
                responses = [
                    "That's a great perspective! Let me follow up with this: What experience do you have with machine learning algorithms?",
                    "Interesting answer! Building on that, how do you see AI impacting your industry in the next 5 years?",
                    "Thank you for sharing that. Now, could you walk me through a situation where you'd consider implementing an AI solution?",
                    "I appreciate your detailed response. What challenges do you think organizations face when adopting AI technologies?",
                    "Excellent insight! How familiar are you with different types of machine learning - supervised, unsupervised, and reinforcement learning?"
                ]
                
                response = responses[min(message_count - 1, len(responses) - 1)]
            
            # Create agent response
            agent_message = {
                'id': str(uuid.uuid4()),
                'type': 'agent',
                'content': response,
                'timestamp': datetime.now().isoformat(),
                'agent_id': agent_id,
                'session_id': session_id,
                'message_type': 'question' if '?' in response else 'response'
            }
            
            session.messages.append(agent_message)
            session.last_activity = datetime.now()
            
            # Send response to client
            await self.sio.emit('agent_message', {
                'sessionId': session_id,
                'agentId': agent_id,
                'message': response,
                'messageType': agent_message['message_type'],
                'timestamp': agent_message['timestamp']
            }, room=client_sid)
            
            # Update agent status back to online
            await self.sio.emit('agent_status', {
                'agentId': agent_id,
                'status': AgentStatus.ONLINE.value,
                'context': {'last_response': datetime.now().isoformat()},
                'sessionId': session_id
            }, room=client_sid)
            
            # Simulate progress update
            if message_count > 0:
                progress = min(message_count * 20, 100)  # 5 questions = 100%
                await self.sio.emit('assessment_progress', {
                    'sessionId': session_id,
                    'currentQuestion': message_count,
                    'totalQuestions': 5,
                    'completionPercentage': progress
                }, room=client_sid)
                
                # Complete assessment after 5 exchanges
                if message_count >= 4:
                    await asyncio.sleep(2)
                    await self._complete_assessment(session_id, client_sid)
            
        except Exception as e:
            logger.error(f"Error simulating agent response: {e}")

    async def _complete_assessment(self, session_id: str, client_sid: str):
        """Complete the assessment and send results"""
        try:
            session = self.sessions.get(session_id)
            if not session:
                return
            
            # Mark session as completed
            session.status = SessionStatus.COMPLETED
            session.last_activity = datetime.now()
            
            # Generate mock results
            results = {
                'sessionId': session_id,
                'completedAt': datetime.now().isoformat(),
                'overallScore': 85,
                'maturityLevel': 4,
                'strengths': ['Strong foundational understanding', 'Good grasp of ML concepts'],
                'growthAreas': ['Hands-on implementation experience', 'Advanced AI ethics'],
                'recommendations': [
                    'Consider taking a practical ML course',
                    'Explore AI ethics frameworks',
                    'Practice with real-world datasets'
                ]
            }
            
            # Send completion message
            await self.sio.emit('agent_message', {
                'sessionId': session_id,
                'agentId': 'assessment_coordinator',
                'message': 'Congratulations! You\'ve completed the assessment. Based on our conversation, I can see you have a solid foundation in AI concepts. Your results are being generated now.',
                'messageType': 'assessment_complete',
                'timestamp': datetime.now().isoformat()
            }, room=client_sid)
            
            # Send final results
            await asyncio.sleep(2)
            await self.sio.emit('assessment_complete', results, room=client_sid)
            
            logger.info(f"Assessment {session_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error completing assessment: {e}")

    def get_asgi_app(self):
        """Get ASGI application for integration with FastAPI"""
        return socketio.ASGIApp(self.sio)

    async def broadcast_to_assessment(self, assessment_id: str, event: str, data: Any):
        """Broadcast event to all clients in an assessment room"""
        await self.sio.emit(event, data, room=f"assessment_{assessment_id}")

    def get_session_stats(self) -> Dict[str, Any]:
        """Get current session statistics"""
        return {
            'total_sessions': len(self.sessions),
            'active_sessions': len([s for s in self.sessions.values() if s.status == SessionStatus.ACTIVE]),
            'connected_clients': len(self.connected_clients),
            'agents_online': len([a for a in self.agents.values() if a.status == AgentStatus.ONLINE]),
            'total_messages': sum(len(s.messages) for s in self.sessions.values())
        }

# Create global WebSocket server instance
websocket_server = WebSocketServer()

# Export for use in main.py
def get_websocket_app():
    return websocket_server.get_asgi_app()

def get_websocket_server():
    return websocket_server