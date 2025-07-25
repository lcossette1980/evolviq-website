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
    
    def generate_agent_question(self, question_history: List[Dict]) -> Dict:
        """
        Generate next question using enhanced agent system
        
        Maintains backward compatibility with original API.
        """
        try:
            # Start monitoring
            self.monitor.start_timer("question_generation")
            
            # Create or get session
            session_id = self._get_or_create_session_id()
            
            # Use async orchestrator
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                result = loop.run_until_complete(
                    self.orchestrator.generate_next_question(session_id, question_history)
                )
            finally:
                loop.close()
            
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
    
    def analyze_assessment_responses(self, responses: List[Dict]) -> Dict:
        """
        Analyze assessment responses using enhanced pipeline
        
        Maintains backward compatibility with original API.
        """
        try:
            # Start monitoring
            self.monitor.start_timer("assessment_analysis")
            
            # Get or create session
            session_id = self._get_or_create_session_id()
            
            # Process each response through the new system
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Process responses
                for response_data in responses:
                    loop.run_until_complete(
                        self.orchestrator.process_user_response(
                            session_id=session_id,
                            question_id=response_data.get("question_id", f"q_{len(responses)}"),
                            answer=response_data.get("answer", ""),
                            response_metadata=response_data.get("metadata", {})
                        )
                    )
                
                # Complete assessment
                final_result = loop.run_until_complete(
                    self.orchestrator.complete_assessment(session_id)
                )
                
            finally:
                loop.close()
            
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
    
    def _get_or_create_session_id(self) -> str:
        """Get or create a session ID for backward compatibility"""
        # Simple session management for compatibility
        session_id = f"compat_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if session_id not in self.active_sessions:
            # Create session using orchestrator
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                session = loop.run_until_complete(
                    self.orchestrator.start_assessment_session(session_id)
                )
                self.active_sessions[session_id] = session
            finally:
                loop.close()
        
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