"""
Enhanced CrewAI Assessment System v2.0

Production-ready replacement for the monolithic crewai_assessment.py file.
Provides backward compatibility while leveraging the new modular architecture.

This file serves as the main entry point and API compatibility layer.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

# Import the new modular system
from assessment import (
    AssessmentConfig,
    AssessmentOrchestrator, 
    AssessmentResult,
    ValidationResult,
    AssessmentResponse,
    QuestionData
)
from assessment.core.config import get_config, set_config
from assessment.utils.monitoring import get_monitor


logger = logging.getLogger(__name__)


class AIReadinessCrewAI:
    """
    Enhanced AI Readiness Assessment System
    
    Backward-compatible interface that uses the new modular architecture.
    Addresses all code review issues while maintaining API compatibility.
    """
    
    def __init__(self, config_override: Dict[str, Any] = None):
        """
        Initialize the assessment system
        
        Args:
            config_override: Optional configuration overrides
        """
        # Setup configuration
        if config_override:
            config = AssessmentConfig.from_env()
            # Apply overrides (simplified - would need more sophisticated merging)
            if 'model_name' in config_override:
                config.llm.model_name = config_override['model_name']
            if 'temperature' in config_override:
                config.llm.temperature = config_override['temperature']
            set_config(config)
        
        # Initialize orchestrator
        self.orchestrator = AssessmentOrchestrator()
        self.monitor = get_monitor()
        
        # Active sessions for compatibility
        self.active_sessions: Dict[str, Any] = {}
        
        logger.info("Enhanced AI Readiness Assessment System v2.0 initialized")
    
    async def generate_agent_question_async(self, question_history: List[Dict]) -> Dict:
        """
        Generate next question using enhanced agent system with proper async handling
        """
        # Start monitoring
        self.monitor.start_timer("question_generation")
        
        # Create or get session
        session_id = await self._get_or_create_session_id_async()
        
        # Use async orchestrator with timeout
        try:
            result = await asyncio.wait_for(
                self.orchestrator.generate_next_question(session_id, question_history),
                timeout=30.0  # 30 second timeout for question generation
            )
        except asyncio.TimeoutError:
            raise Exception("Question generation timed out after 30 seconds")
        
        return result
    
    def generate_agent_question(self, question_history: List[Dict]) -> Dict:
        """
        Generate next question using enhanced agent system
        
        Maintains backward compatibility with original API.
        """
        try:
            # Use existing event loop if available, otherwise create new one
            try:
                loop = asyncio.get_running_loop()
                # If we're in an async context, we can't use run_until_complete
                # This is a compatibility layer issue - ideally callers should use async version
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        lambda: asyncio.run(self.generate_agent_question_async(question_history))
                    )
                    result = future.result(timeout=35.0)  # Slightly longer than internal timeout
            except RuntimeError:
                # No event loop running, safe to create new one
                result = asyncio.run(self.generate_agent_question_async(question_history))
            
            # Record metrics
            execution_time = self.monitor.end_timer("question_generation")
            success = result.is_success
            self.monitor.record_execution_time("question_generation", execution_time, success)
            
            if result.is_success:
                question_data = result.data["question"]
                
                # Convert to legacy format for backward compatibility
                return {
                    "question": question_data["question"],
                    "question_id": question_data["question_id"],
                    "session_id": question_data["session_id"],
                    "agent_name": question_data["agent_name"],
                    "agent_focus": question_data["focus_area"],
                    "generated_by": "enhanced_crewai_agent",
                    "timestamp": question_data["timestamp"],
                    "follow_up": question_data["follow_up"],
                    "difficulty_level": question_data.get("difficulty_level", 3),
                    "expected_concepts": question_data.get("expected_concepts", []),
                    "validation": result.data.get("validation", {}),
                    "execution_time": execution_time,
                    "system_version": "2.0"
                }
            else:
                return {
                    "error": result.error,
                    "fallback_question": self._generate_fallback_question(len(question_history)),
                    "execution_time": execution_time,
                    "system_version": "2.0"
                }
                
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            return {
                "error": str(e),
                "fallback_question": self._generate_fallback_question(len(question_history)),
                "system_version": "2.0"
            }
    
    async def analyze_assessment_responses_async(self, responses: List[Dict]) -> Dict:
        """
        Analyze assessment responses using enhanced pipeline with concurrent processing
        """
        # Start monitoring
        self.monitor.start_timer("assessment_analysis")
        
        # Get or create session
        session_id = await self._get_or_create_session_id_async()
        
        # Process all responses concurrently with timeout
        try:
            # Create response processing tasks
            response_tasks = [
                self.orchestrator.process_user_response(
                    session_id=session_id,
                    question_id=response_data.get("question_id", f"q_{i}"),
                    answer=response_data.get("answer", ""),
                    response_metadata=response_data.get("metadata", {})
                )
                for i, response_data in enumerate(responses)
            ]
            
            # Process responses concurrently with 2 minute timeout
            await asyncio.wait_for(
                asyncio.gather(*response_tasks, return_exceptions=True),
                timeout=120.0
            )
            
            # Complete assessment with 1 minute timeout
            final_result = await asyncio.wait_for(
                self.orchestrator.complete_assessment(session_id),
                timeout=60.0
            )
            
        except asyncio.TimeoutError:
            raise Exception("Assessment analysis timed out - responses processed concurrently")
        
        return final_result
    
    def analyze_assessment_responses(self, responses: List[Dict]) -> Dict:
        """
        Analyze assessment responses using enhanced pipeline
        
        Maintains backward compatibility with original API.
        """
        try:
            # Use existing event loop if available, otherwise create new one
            try:
                loop = asyncio.get_running_loop()
                # If we're in an async context, use ThreadPoolExecutor
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        lambda: asyncio.run(self.analyze_assessment_responses_async(responses))
                    )
                    final_result = future.result(timeout=200.0)  # 3+ minutes total timeout
            except RuntimeError:
                # No event loop running, safe to create new one
                final_result = asyncio.run(self.analyze_assessment_responses_async(responses))
            
            # Record metrics
            execution_time = self.monitor.end_timer("assessment_analysis")
            success = final_result.is_success
            self.monitor.record_execution_time("assessment", execution_time, success)
            
            if final_result.is_success:
                assessment_data = final_result.data["final_results"]
                
                # Convert to legacy format
                return {
                    "success": True,
                    "maturity_scores": assessment_data.get("section_scores", {}),
                    "overall_score": assessment_data.get("overall_score", 3.0),
                    "readiness_level": assessment_data.get("readiness_level", "ready_to_learn"),
                    "confidence": assessment_data.get("confidence", 0.7),
                    "learning_path": assessment_data.get("learning_path", []),
                    "recommendations": assessment_data.get("recommendations", []),
                    "analysis_timestamp": datetime.now().isoformat(),
                    "execution_time": execution_time,
                    "validation": final_result.validation.to_dict() if final_result.validation else None,
                    "system_version": "2.0",
                    "enhanced_features": {
                        "modular_architecture": True,
                        "comprehensive_validation": True,
                        "performance_monitoring": True,
                        "state_management": True
                    }
                }
            else:
                return {
                    "success": False,
                    "error": final_result.error,
                    "fallback_analysis": self._generate_fallback_analysis(responses),
                    "execution_time": execution_time,
                    "system_version": "2.0"
                }
                
        except Exception as e:
            logger.error(f"Assessment analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_analysis": self._generate_fallback_analysis(responses),
                "system_version": "2.0"
            }
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health and performance metrics"""
        return {
            "system_version": "2.0",
            "architecture": "modular",
            "health": self.monitor.get_system_health(),
            "performance": self.monitor.get_comprehensive_report(),
            "capabilities": {
                "agent_state_management": True,
                "dynamic_agent_routing": True,
                "parallel_processing": True,
                "comprehensive_validation": True,
                "performance_monitoring": True,
                "error_recovery": True,
                "configuration_management": True
            }
        }
    
    async def _get_or_create_session_id_async(self) -> str:
        """Get or create a session ID with proper async handling"""
        session_id = f"compat_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if session_id not in self.active_sessions:
            # Create session using orchestrator with timeout
            session = await asyncio.wait_for(
                self.orchestrator.start_assessment_session(session_id),
                timeout=10.0  # 10 second timeout for session creation
            )
            self.active_sessions[session_id] = session
        
        return session_id
    
    def _get_or_create_session_id(self) -> str:
        """Get or create a session ID for backward compatibility"""
        # Simple session management for compatibility
        session_id = f"compat_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if session_id not in self.active_sessions:
            # Use existing event loop if available
            try:
                loop = asyncio.get_running_loop()
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        lambda: asyncio.run(self._get_or_create_session_id_async())
                    )
                    return future.result(timeout=15.0)
            except RuntimeError:
                # No event loop running, safe to create new one
                return asyncio.run(self._get_or_create_session_id_async())
        
        return session_id
    
    def _generate_fallback_question(self, question_number: int) -> Dict[str, Any]:
        """Generate fallback question for error cases"""
        fallback_questions = [
            "How would you explain artificial intelligence to someone who has never heard of it?",
            "What business problems do you think AI could help solve in your organization?", 
            "Describe your experience with AI tools like ChatGPT or similar systems.",
            "How do you think AI might change your industry in the next 5 years?",
            "What concerns or challenges do you see with AI adoption in business?"
        ]
        
        question_index = min(question_number, len(fallback_questions) - 1)
        
        return {
            "question": fallback_questions[question_index],
            "question_id": f"fallback_{question_index}",
            "agent_name": "Fallback Agent",
            "focus_area": "General AI Knowledge",
            "is_fallback": True
        }
    
    def _generate_fallback_analysis(self, responses: List[Dict]) -> Dict[str, Any]:
        """Generate fallback analysis for error cases"""
        # Simple fallback analysis based on response length
        total_words = sum(len(r.get("answer", "").split()) for r in responses)
        avg_words = total_words / len(responses) if responses else 0
        
        if avg_words < 10:
            level = "needs_foundation"
            score = 1.5
        elif avg_words < 30:
            level = "ready_to_learn"
            score = 2.5
        elif avg_words < 60:
            level = "ready_to_implement"
            score = 3.5
        else:
            level = "ready_to_lead"
            score = 4.5
        
        return {
            "overall_score": score,
            "readiness_level": level,
            "confidence": 0.3,  # Low confidence for fallback
            "analysis_method": "fallback_word_count",
            "recommendations": [
                "Consider retaking the assessment for more accurate results",
                "Ensure stable internet connection for full system functionality"
            ]
        }


# Backward compatibility: Create global instance
def create_ai_readiness_system(config_override: Dict[str, Any] = None) -> AIReadinessCrewAI:
    """Factory function for creating the assessment system"""
    return AIReadinessCrewAI(config_override)


# Export for backward compatibility
__all__ = [
    "AIReadinessCrewAI",
    "create_ai_readiness_system",
    "AssessmentConfig",
    "AssessmentOrchestrator",
    "AssessmentResult"
]