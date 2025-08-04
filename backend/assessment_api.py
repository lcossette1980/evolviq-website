"""
Assessment API Module

Provides REST API endpoints for AI Knowledge and Change Readiness assessments
using the CrewAI assessment orchestrator.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from assessment.core.orchestrator import AssessmentOrchestrator
from assessment.core.config import AssessmentConfig
from premium_verification import get_current_user
from rate_limiting import rate_limit_assessment
from session_storage import session_storage

logger = logging.getLogger(__name__)

# Create router
assessment_router = APIRouter(prefix="/api", tags=["assessments"])

# Pydantic models
class StartAssessmentRequest(BaseModel):
    name: Optional[str] = None
    assessment_type: str = "ai_knowledge"
    preferences: Optional[Dict[str, Any]] = None

class AssessmentResponseRequest(BaseModel):
    session_id: str
    question_id: str
    response: Any
    metadata: Optional[Dict[str, Any]] = None

# Global orchestrator instance
_orchestrator: Optional[AssessmentOrchestrator] = None

def get_orchestrator() -> AssessmentOrchestrator:
    """Get or create assessment orchestrator instance"""
    global _orchestrator
    if _orchestrator is None:
        config = AssessmentConfig.from_env()
        _orchestrator = AssessmentOrchestrator(config)
    return _orchestrator

# AI KNOWLEDGE ASSESSMENT ENDPOINTS
@assessment_router.post("/ai-knowledge/start")
async def start_ai_knowledge_assessment(
    request: StartAssessmentRequest,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_assessment)
):
    """Start AI Knowledge Assessment using CrewAI orchestrator"""
    try:
        orchestrator = get_orchestrator()
        user_id = current_user.get('user_id')
        user_name = request.name or current_user.get('name', 'User')
        
        logger.info(f"Starting AI Knowledge Assessment for user {user_id}")
        
        # Start assessment session with orchestrator
        session_config = {
            'max_questions': 10,
            'assessment_type': 'ai_knowledge',
            'user_name': user_name,
            'preferences': request.preferences or {}
        }
        
        session = await orchestrator.start_assessment_session(
            user_id=user_id,
            session_config=session_config
        )
        
        # Generate first question
        question_result = await orchestrator.generate_next_question(
            session_id=session.session_id,
            question_history=[]
        )
        
        if not question_result.is_success:
            raise HTTPException(status_code=500, detail=question_result.error)
        
        # Store session in session storage for persistence
        await session_storage.save_session(session.session_id, {
            'orchestrator_session': session.to_dict(),
            'user_id': user_id,
            'assessment_type': 'ai_knowledge',
            'started_at': datetime.now()
        })
        
        # Format response
        question_data = question_result.data['question']
        return {
            "sessionId": session.session_id,
            "assessmentType": "ai_knowledge",
            "status": "started",
            "currentQuestion": 1,
            "totalQuestions": session.max_questions,
            "question": {
                "id": question_data['question_id'],
                "text": question_data['question'],
                "type": "open_ended",
                "metadata": {
                    "section": question_data.get('section'),
                    "focus_area": question_data.get('focus_area'),
                    "difficulty_level": question_data.get('difficulty_level')
                }
            },
            "metadata": {
                "userId": user_id,
                "userName": user_name,
                "startedAt": session.created_at.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to start AI knowledge assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.post("/ai-knowledge/respond")
async def respond_ai_knowledge_assessment(
    request: AssessmentResponseRequest,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_assessment)
):
    """Submit response to AI Knowledge Assessment question"""
    try:
        orchestrator = get_orchestrator()
        
        # Verify session ownership
        session_data = await session_storage.get_session(request.session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session_data.get('user_id') != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Process response with orchestrator
        response_result = await orchestrator.process_user_response(
            session_id=request.session_id,
            question_id=request.question_id,
            answer=request.response,
            response_metadata=request.metadata
        )
        
        if not response_result.is_success:
            raise HTTPException(status_code=500, detail=response_result.error)
        
        # Check if assessment is complete
        orchestrator_session = response_result.data['session']
        if orchestrator_session['status'] == 'completed':
            # Generate final results
            final_result = await orchestrator.complete_assessment(request.session_id)
            
            if not final_result.is_success:
                raise HTTPException(status_code=500, detail=final_result.error)
            
            # Update session storage
            session_data['status'] = 'completed'
            session_data['completed_at'] = datetime.now()
            session_data['results'] = final_result.data['final_results']
            await session_storage.save_session(request.session_id, session_data)
            
            return {
                "sessionId": request.session_id,
                "status": "completed",
                "results": final_result.data['final_results']
            }
        
        # Generate next question
        next_question_result = await orchestrator.generate_next_question(
            session_id=request.session_id,
            question_history=orchestrator_session['questions']
        )
        
        if not next_question_result.is_success:
            raise HTTPException(status_code=500, detail=next_question_result.error)
        
        # Update session storage
        session_data['orchestrator_session'] = orchestrator_session
        await session_storage.save_session(request.session_id, session_data)
        
        # Format response
        question_data = next_question_result.data['question']
        current_question = len(orchestrator_session['questions'])
        
        return {
            "sessionId": request.session_id,
            "status": "in_progress",
            "currentQuestion": current_question,
            "totalQuestions": orchestrator_session['max_questions'],
            "question": {
                "id": question_data['question_id'],
                "text": question_data['question'],
                "type": "open_ended",
                "metadata": {
                    "section": question_data.get('section'),
                    "focus_area": question_data.get('focus_area'),
                    "difficulty_level": question_data.get('difficulty_level')
                }
            },
            "progress": ((current_question - 1) / orchestrator_session['max_questions']) * 100
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process AI knowledge assessment response: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# CHANGE READINESS ASSESSMENT ENDPOINTS
@assessment_router.post("/change-readiness/start")
async def start_change_readiness_assessment(
    request: StartAssessmentRequest,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_assessment)
):
    """Start Change Readiness Assessment using CrewAI orchestrator"""
    try:
        orchestrator = get_orchestrator()
        user_id = current_user.get('user_id')
        user_name = request.name or current_user.get('name', 'User')
        
        logger.info(f"Starting Change Readiness Assessment for user {user_id}")
        
        # Start assessment session
        session_config = {
            'max_questions': 8,
            'assessment_type': 'change_readiness',
            'user_name': user_name,
            'preferences': request.preferences or {}
        }
        
        session = await orchestrator.start_assessment_session(
            user_id=user_id,
            session_config=session_config
        )
        
        # Generate first question
        question_result = await orchestrator.generate_next_question(
            session_id=session.session_id,
            question_history=[]
        )
        
        if not question_result.is_success:
            raise HTTPException(status_code=500, detail=question_result.error)
        
        # Store session
        await session_storage.save_session(session.session_id, {
            'orchestrator_session': session.to_dict(),
            'user_id': user_id,
            'assessment_type': 'change_readiness',
            'started_at': datetime.now()
        })
        
        # Format response
        question_data = question_result.data['question']
        return {
            "sessionId": session.session_id,
            "assessmentType": "change_readiness",
            "status": "started",
            "currentQuestion": 1,
            "totalQuestions": session.max_questions,
            "question": {
                "id": question_data['question_id'],
                "text": question_data['question'],
                "type": "open_ended",
                "metadata": {
                    "section": question_data.get('section'),
                    "focus_area": question_data.get('focus_area')
                }
            },
            "metadata": {
                "userId": user_id,
                "userName": user_name,
                "startedAt": session.created_at.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to start change readiness assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.post("/change-readiness/respond")
async def respond_change_readiness_assessment(
    request: AssessmentResponseRequest,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_assessment)
):
    """Submit response to Change Readiness Assessment question"""
    # Similar implementation to AI Knowledge response handler
    # Reuses the same orchestrator logic with different assessment type
    return await respond_ai_knowledge_assessment(request, current_user, rate_limit)

# ASSESSMENT HEALTH CHECK
@assessment_router.get("/assessment/health")
async def assessment_health_check():
    """Check health of assessment system"""
    try:
        orchestrator = get_orchestrator()
        metrics = orchestrator.get_orchestrator_metrics()
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "assessments_available": {
                "ai_knowledge": True,
                "change_readiness": True,
                "ai_readiness": True
            },
            "orchestrator_metrics": metrics,
            "config": {
                "max_questions": orchestrator.config.max_questions,
                "llm_model": orchestrator.config.llm.model_name,
                "environment": orchestrator.config.environment
            }
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Assessment health check failed: {e}")
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }