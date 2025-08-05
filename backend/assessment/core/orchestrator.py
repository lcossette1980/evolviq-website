"""
Assessment Orchestrator

Main orchestration class that coordinates the entire assessment system.
Implements enhanced flow recommendations from the code review.
"""

import asyncio
import logging
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from ..core.config import get_config, AssessmentConfig
from ..models.assessment import AssessmentSession, QuestionData, UserResponse, AssessmentResponse
from ..models.results import AssessmentResult, ResultStatus, ValidationResult
from ..agents.base import AgentFactory, AgentRouter, StatefulAgent
from ..tools.assessment_data import AssessmentDataTool
from ..utils.validators import OutputValidator


logger = logging.getLogger(__name__)


@dataclass
class OrchestrationMetrics:
    """Track orchestration performance"""
    total_assessments: int = 0
    successful_assessments: int = 0
    average_completion_time: float = 0.0
    agent_utilization: Dict[str, int] = None
    
    def __post_init__(self):
        if self.agent_utilization is None:
            self.agent_utilization = {}


class AssessmentOrchestrator:
    """
    Main orchestrator for the assessment system
    
    Coordinates all components:
    - Agent management and routing
    - Question generation flow  
    - Assessment analysis pipeline
    - Result validation and synthesis
    """
    
    def __init__(self, config: AssessmentConfig = None):
        self.config = config or get_config()
        self.logger = logging.getLogger(f"{__name__}.AssessmentOrchestrator")
        
        # Initialize components
        self.agent_factory = AgentFactory(self.config)
        self.agents = self.agent_factory.create_agent_collection()
        self.agent_router = AgentRouter(self.agents)
        self.validator = OutputValidator(self.config)
        self.assessment_tool = AssessmentDataTool()
        
        # Metrics
        self.metrics = OrchestrationMetrics()
        
        # Active sessions
        self.active_sessions: Dict[str, AssessmentSession] = {}
        
        self.logger.info("Assessment orchestrator initialized successfully")
    
    async def start_assessment_session(self, user_id: Optional[str] = None, 
                                     session_config: Dict[str, Any] = None) -> AssessmentSession:
        """Start a new assessment session"""
        try:
            session = AssessmentSession.create(user_id=user_id)
            
            # Apply session configuration if provided
            if session_config:
                if 'max_questions' in session_config:
                    session.max_questions = session_config['max_questions']
                if 'target_sections' in session_config:
                    session.target_sections = session_config['target_sections']
            
            # Store active session
            self.active_sessions[session.session_id] = session
            
            self.logger.info(f"Started assessment session {session.session_id} for user {user_id}")
            
            return session
            
        except Exception as e:
            self.logger.error(f"Failed to start assessment session: {e}")
            raise
    
    async def generate_next_question(self, session_id: str, 
                                   question_history: List[Dict[str, Any]] = None) -> AssessmentResult:
        """
        Generate next question using adaptive question generation
        
        Implements enhanced question generation flow from code review.
        """
        start_time = time.time()
        
        try:
            # Get session
            session = self.active_sessions.get(session_id)
            if not session:
                return AssessmentResult(
                    status=ResultStatus.FAILURE,
                    error=f"Session {session_id} not found"
                )
            
            # Check if session is completed
            if session.is_completed():
                return AssessmentResult(
                    status=ResultStatus.SUCCESS,
                    data={"message": "Assessment session completed", "session": session.to_dict()}
                )
            
            # Determine next section
            question_number = len(session.questions)
            if question_number >= session.max_questions:
                session.status = "completed"
                session.completed_at = datetime.now()
                return AssessmentResult(
                    status=ResultStatus.SUCCESS,
                    data={"message": "All questions completed", "session": session.to_dict()}
                )
            
            # Get section for next question
            section_order = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
            current_section = section_order[question_number]
            
            # Select appropriate agent for question generation
            question_agent = self.agent_router.select_agent("question_generation")
            
            # Generate question using agent
            question_result = await self._generate_question_with_agent(
                agent=question_agent,
                section=current_section,
                question_history=question_history or [],
                session=session
            )
            
            if not question_result.is_success:
                return question_result
            
            # Create question data object
            question_data = QuestionData.create(
                question=question_result.data["question"],
                section=current_section,
                agent_name=question_agent.agent.role,
                focus_area=question_result.data.get("focus_area", "General AI Knowledge"),
                session_id=session_id,
                difficulty_level=question_result.data.get("difficulty_level", 3),
                expected_concepts=question_result.data.get("expected_concepts", [])
            )
            
            # Validate question
            validation = self._validate_question(question_data)
            if not validation.is_valid:
                self.logger.warning(f"Question validation issues: {[i.message for i in validation.issues]}")
                # Continue anyway for now, but log issues
            
            # Add question to session
            session.add_question(question_data)
            
            execution_time = time.time() - start_time
            
            return AssessmentResult(
                status=ResultStatus.SUCCESS,
                data={
                    "question": question_data.to_dict(),
                    "session": session.to_dict(),
                    "validation": validation.to_dict() if validation else None
                },
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Failed to generate question: {e}")
            
            return AssessmentResult(
                status=ResultStatus.FAILURE,
                error=str(e),
                execution_time=execution_time
            )
    
    async def process_user_response(self, session_id: str, question_id: str, 
                                  answer: str, response_metadata: Dict[str, Any] = None) -> AssessmentResult:
        """
        Process user response through the assessment pipeline
        
        Implements streamlined assessment pipeline from code review.
        """
        start_time = time.time()
        
        try:
            # Get session and validate
            session = self.active_sessions.get(session_id)
            if not session:
                return AssessmentResult(
                    status=ResultStatus.FAILURE,
                    error=f"Session {session_id} not found"
                )
            
            # Find question
            question_data = None
            for q in session.questions:
                if q.question_id == question_id:
                    question_data = q
                    break
            
            if not question_data:
                return AssessmentResult(
                    status=ResultStatus.FAILURE,
                    error=f"Question {question_id} not found in session"
                )
            
            # Create user response
            user_response = UserResponse.create(
                question_id=question_id,
                answer=answer,
                response_time_seconds=response_metadata.get('response_time') if response_metadata else None
            )
            
            # Validate user response
            response_validation = self._validate_user_response(user_response)
            if not response_validation.is_valid:
                return AssessmentResult(
                    status=ResultStatus.VALIDATION_ERROR,
                    error="Invalid user response",
                    data={"validation": response_validation.to_dict()}
                )
            
            # Run parallel analysis pipeline
            analysis_results = await self._run_parallel_analysis(question_data, user_response)
            
            # Create assessment response
            assessment_response = AssessmentResponse.create(
                question_data=question_data,
                user_response=user_response,
                maturity_level=analysis_results.get("maturity_level", 3),
                confidence_score=analysis_results.get("confidence_score", 0.5),
                concepts_identified=analysis_results.get("concepts", []),
                evidence=analysis_results.get("evidence", []),
                analysis_agent=analysis_results.get("agent_name", "unknown"),
                processing_time=analysis_results.get("processing_time", 0.0)
            )
            
            # Add response to session
            session.add_response(assessment_response)
            
            execution_time = time.time() - start_time
            
            return AssessmentResult(
                status=ResultStatus.SUCCESS,
                data={
                    "assessment_response": assessment_response.to_dict(),
                    "session": session.to_dict(),
                    "analysis_details": analysis_results
                },
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Failed to process user response: {e}")
            
            return AssessmentResult(
                status=ResultStatus.FAILURE,
                error=str(e),
                execution_time=execution_time
            )
    
    async def complete_assessment(self, session_id: str) -> AssessmentResult:
        """
        Complete assessment and generate final results
        
        Implements comprehensive result synthesis from code review.
        """
        start_time = time.time()
        
        try:
            # Get session
            session = self.active_sessions.get(session_id)
            if not session:
                return AssessmentResult(
                    status=ResultStatus.FAILURE,
                    error=f"Session {session_id} not found"
                )
            
            # Ensure session has responses
            if not session.responses:
                return AssessmentResult(
                    status=ResultStatus.FAILURE,
                    error="No responses found in session"
                )
            
            # Generate comprehensive assessment using parallel agents
            final_results = await self._generate_final_assessment(session)
            
            # Validate final results
            validation = self.validator.validate_assessment_result(final_results)
            
            # Update session status
            session.status = "completed"
            session.completed_at = datetime.now()
            
            # Update metrics
            self.metrics.total_assessments += 1
            if validation.is_valid:
                self.metrics.successful_assessments += 1
            
            execution_time = time.time() - start_time
            
            return AssessmentResult(
                status=ResultStatus.SUCCESS if validation.is_valid else ResultStatus.PARTIAL_SUCCESS,
                data={
                    "final_results": final_results,
                    "session": session.to_dict(),
                    "validation": validation.to_dict()
                },
                validation=validation,
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Failed to complete assessment: {e}")
            
            return AssessmentResult(
                status=ResultStatus.FAILURE,
                error=str(e),
                execution_time=execution_time
            )
    
    async def _generate_question_with_agent(self, agent: StatefulAgent, section: str,
                                          question_history: List[Dict], 
                                          session: AssessmentSession) -> AssessmentResult:
        """Generate question using selected agent"""
        try:
            try:
                from crewai import Task
            except ImportError:
                # Use the Task from our base module
                from ..agents.base import Task
            
            # Create question generation task
            task = Task(
                description=f"""
                Generate an assessment question for section {section}.
                
                Consider the user's progress and previous responses to create
                an appropriate question that assesses AI knowledge in this area.
                
                Question history: {len(question_history)} previous questions
                Session progress: {len(session.responses)}/{session.max_questions} completed
                
                Return a JSON response with:
                - question: The assessment question text
                - focus_area: What aspect is being assessed
                - difficulty_level: Integer 1-5
                - expected_concepts: List of concepts this question tests
                """,
                expected_output="JSON object with question details"
            )
            
            # Execute with context
            result = agent.execute_with_context(task)
            
            if result.is_success:
                # Parse agent response
                import json
                import re
                
                result_text = str(result.data.get("result", ""))
                
                # Try to extract JSON
                json_match = re.search(r'\{[^{}]*"question"[^{}]*\}', result_text, re.DOTALL)
                if json_match:
                    question_data = json.loads(json_match.group(0))
                    return AssessmentResult(
                        status=ResultStatus.SUCCESS,
                        data=question_data,
                        execution_time=result.execution_time
                    )
                else:
                    # Fallback parsing
                    return AssessmentResult(
                        status=ResultStatus.SUCCESS,
                        data={
                            "question": result_text[:500],  # Truncate if needed
                            "focus_area": f"Section {section}",
                            "difficulty_level": 3,
                            "expected_concepts": []
                        },
                        execution_time=result.execution_time
                    )
            else:
                return AssessmentResult(
                    status=ResultStatus.FAILURE,
                    error=result.error,
                    execution_time=result.execution_time
                )
                
        except Exception as e:
            self.logger.error(f"Agent question generation failed: {e}")
            return AssessmentResult(
                status=ResultStatus.FAILURE,
                error=str(e)
            )
    
    async def _run_parallel_analysis(self, question_data: QuestionData, 
                                   user_response: UserResponse) -> Dict[str, Any]:
        """Run parallel analysis pipeline"""
        try:
            # Select agents for analysis
            concept_agent = self.agent_router.select_agent("concept_detection")
            maturity_agent = self.agent_router.select_agent("maturity_scoring")
            
            # Create analysis tasks
            tasks = await asyncio.gather(
                self._analyze_concepts(concept_agent, question_data, user_response),
                self._score_maturity(maturity_agent, question_data, user_response),
                return_exceptions=True
            )
            
            # Combine results
            concept_result = tasks[0] if not isinstance(tasks[0], Exception) else {}
            maturity_result = tasks[1] if not isinstance(tasks[1], Exception) else {}
            
            return {
                "concepts": concept_result.get("concepts", []),
                "evidence": concept_result.get("evidence", []),
                "maturity_level": maturity_result.get("level", 3),
                "confidence_score": maturity_result.get("confidence", 0.5),
                "agent_name": "parallel_analysis",
                "processing_time": max(
                    concept_result.get("processing_time", 0),
                    maturity_result.get("processing_time", 0)
                )
            }
            
        except Exception as e:
            self.logger.error(f"Parallel analysis failed: {e}")
            return {
                "concepts": [],
                "evidence": [],
                "maturity_level": 3,
                "confidence_score": 0.3,
                "agent_name": "fallback",
                "processing_time": 0.0
            }
    
    async def _analyze_concepts(self, agent: StatefulAgent, question_data: QuestionData,
                              user_response: UserResponse) -> Dict[str, Any]:
        """Analyze concepts in user response"""
        # Simplified implementation - would use actual agent in production
        return {
            "concepts": ["artificial intelligence", "machine learning"],
            "evidence": ["mentioned AI capabilities", "discussed automation"],
            "processing_time": 0.5
        }
    
    async def _score_maturity(self, agent: StatefulAgent, question_data: QuestionData,
                            user_response: UserResponse) -> Dict[str, Any]:
        """Score maturity level of response"""
        # Simplified implementation - would use actual agent in production
        word_count = len(user_response.answer.split())
        
        if word_count < 10:
            level = 1
        elif word_count < 30:
            level = 2
        elif word_count < 60:
            level = 3
        elif word_count < 100:
            level = 4
        else:
            level = 5
            
        return {
            "level": level,
            "confidence": min(0.9, word_count / 100),
            "processing_time": 0.3
        }
    
    async def _generate_final_assessment(self, session: AssessmentSession) -> Dict[str, Any]:
        """Generate comprehensive final assessment"""
        try:
            # Calculate overall scores
            total_score = sum(r.maturity_level.value for r in session.responses)
            average_score = total_score / len(session.responses) if session.responses else 0
            
            # Determine readiness level
            if average_score < 2:
                readiness = "needs_foundation"
            elif average_score < 3:
                readiness = "ready_to_learn"
            elif average_score < 4:
                readiness = "ready_to_implement"
            else:
                readiness = "ready_to_lead"
            
            # Generate learning path (simplified)
            learning_path = await self._generate_learning_path(session)
            
            return {
                "overall_score": average_score,
                "readiness_level": readiness,
                "section_scores": self._calculate_section_scores(session),
                "learning_path": learning_path,
                "confidence": sum(r.confidence_score for r in session.responses) / len(session.responses),
                "completion_time": session.total_processing_time,
                "recommendations": await self._generate_recommendations(session)
            }
            
        except Exception as e:
            self.logger.error(f"Final assessment generation failed: {e}")
            return {
                "overall_score": 3.0,
                "readiness_level": "ready_to_learn",
                "error": str(e)
            }
    
    def _calculate_section_scores(self, session: AssessmentSession) -> Dict[str, float]:
        """Calculate scores by section"""
        section_scores = {}
        section_responses = {}
        
        for response in session.responses:
            section = response.question_data.section.value
            if section not in section_responses:
                section_responses[section] = []
            section_responses[section].append(response.maturity_level.value)
        
        for section, scores in section_responses.items():
            section_scores[section] = sum(scores) / len(scores)
        
        return section_scores
    
    async def _generate_learning_path(self, session: AssessmentSession) -> List[Dict[str, Any]]:
        """Generate personalized learning path"""
        # Simplified implementation
        return [
            {"topic": "AI Fundamentals", "priority": "high", "estimated_time": "2 weeks"},
            {"topic": "Prompt Engineering", "priority": "medium", "estimated_time": "1 week"},
            {"topic": "AI Implementation", "priority": "low", "estimated_time": "3 weeks"}
        ]
    
    async def _generate_recommendations(self, session: AssessmentSession) -> List[str]:
        """Generate personalized recommendations"""
        # Simplified implementation
        avg_score = sum(r.maturity_level.value for r in session.responses) / len(session.responses)
        
        if avg_score < 2:
            return ["Start with AI basics", "Take introductory course", "Practice with simple tools"]
        elif avg_score < 3:
            return ["Explore practical applications", "Try prompt engineering", "Join AI community"]
        else:
            return ["Focus on implementation", "Lead AI initiatives", "Mentor others"]
    
    def _validate_question(self, question_data: QuestionData) -> ValidationResult:
        """Validate generated question"""
        issues = question_data.validate()
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=[ValidationIssue(field="question", message=issue, severity=ValidationSeverity.ERROR) 
                   for issue in issues]
        )
    
    def _validate_user_response(self, user_response: UserResponse) -> ValidationResult:
        """Validate user response"""
        issues = user_response.validate()
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=[ValidationIssue(field="response", message=issue, severity=ValidationSeverity.ERROR)
                   for issue in issues]
        )
    
    def get_orchestrator_metrics(self) -> Dict[str, Any]:
        """Get comprehensive orchestrator metrics"""
        return {
            "total_assessments": self.metrics.total_assessments,
            "successful_assessments": self.metrics.successful_assessments,
            "success_rate": (self.metrics.successful_assessments / self.metrics.total_assessments 
                           if self.metrics.total_assessments > 0 else 0),
            "active_sessions": len(self.active_sessions),
            "agent_performance": {agent_id: agent.get_performance_summary() 
                                for agent_id, agent in self.agents.items()}
        }


# Add missing imports
from datetime import datetime
from ..models.results import ValidationIssue, ValidationSeverity