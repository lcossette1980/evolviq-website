"""
Assessment Data Models

Enhanced data structures with proper typing and validation.
Addresses code review issues around data consistency and type safety.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum
import uuid
import json


class AssessmentSection(Enum):
    """Assessment sections with proper enumeration"""
    AI_FUNDAMENTALS_CONCEPTS = "F1.1"
    AI_FUNDAMENTALS_BUSINESS = "F1.2"  
    PROMPT_ENGINEERING_BASIC = "P2.1"
    PROMPT_ENGINEERING_ADVANCED = "P2.2"
    AI_ECOSYSTEM = "E3.1"


class MaturityLevel(Enum):
    """Maturity levels as enumeration"""
    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4
    LEVEL_5 = 5


@dataclass
class QuestionData:
    """Enhanced question data structure"""
    question_id: str
    question: str
    section: AssessmentSection
    agent_name: str
    focus_area: str
    
    # Metadata
    generated_by: str = "crewai_agent"
    timestamp: datetime = field(default_factory=datetime.now)
    session_id: Optional[str] = None
    follow_up: bool = False
    context: Dict[str, Any] = field(default_factory=dict)
    
    # Question attributes
    difficulty_level: int = 3  # 1-5 scale
    expected_concepts: List[str] = field(default_factory=list)
    scoring_criteria: List[str] = field(default_factory=list)
    
    @classmethod
    def create(cls, question: str, section: str, agent_name: str, 
               focus_area: str, **kwargs) -> 'QuestionData':
        """Factory method for creating question data"""
        return cls(
            question_id=f"ai_knowledge_{uuid.uuid4().hex[:8]}",
            question=question,
            section=AssessmentSection(section),
            agent_name=agent_name,
            focus_area=focus_area,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "question_id": self.question_id,
            "question": self.question,
            "section": self.section.value,
            "agent_name": self.agent_name,
            "focus_area": self.focus_area,
            "generated_by": self.generated_by,
            "timestamp": self.timestamp.isoformat(),
            "session_id": self.session_id,
            "follow_up": self.follow_up,
            "context": self.context,
            "difficulty_level": self.difficulty_level,
            "expected_concepts": self.expected_concepts,
            "scoring_criteria": self.scoring_criteria
        }
    
    def validate(self) -> List[str]:
        """Validate question data"""
        issues = []
        
        if not self.question.strip():
            issues.append("Question text is empty")
            
        if not self.agent_name.strip():
            issues.append("Agent name is required")
            
        if self.difficulty_level < 1 or self.difficulty_level > 5:
            issues.append("Difficulty level must be between 1 and 5")
            
        if len(self.question) < 10:
            issues.append("Question too short (minimum 10 characters)")
            
        if len(self.question) > 1000:
            issues.append("Question too long (maximum 1000 characters)")
            
        return issues


@dataclass
class UserResponse:
    """User response to assessment question"""
    response_id: str
    question_id: str
    answer: str
    timestamp: datetime = field(default_factory=datetime.now)
    
    # Response metadata
    response_time_seconds: Optional[float] = None
    word_count: int = field(init=False)
    char_count: int = field(init=False)
    
    def __post_init__(self):
        """Calculate derived fields"""
        self.word_count = len(self.answer.split()) if self.answer else 0
        self.char_count = len(self.answer) if self.answer else 0
    
    @classmethod
    def create(cls, question_id: str, answer: str, **kwargs) -> 'UserResponse':
        """Factory method for creating user responses"""
        return cls(
            response_id=f"response_{uuid.uuid4().hex[:8]}",
            question_id=question_id,
            answer=answer,
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "response_id": self.response_id,
            "question_id": self.question_id,
            "answer": self.answer,
            "timestamp": self.timestamp.isoformat(),
            "response_time_seconds": self.response_time_seconds,
            "word_count": self.word_count,
            "char_count": self.char_count
        }
    
    def validate(self) -> List[str]:
        """Validate user response"""
        issues = []
        
        if not self.answer.strip():
            issues.append("Answer cannot be empty")
            
        if self.word_count < 5:
            issues.append("Answer too short (minimum 5 words)")
            
        if self.word_count > 500:
            issues.append("Answer too long (maximum 500 words)")
            
        return issues


@dataclass
class AssessmentResponse:
    """Enhanced assessment response with analysis results"""
    response_id: str
    question_data: QuestionData
    user_response: UserResponse
    
    # Analysis results
    maturity_level: MaturityLevel
    confidence_score: float
    concepts_identified: List[str] = field(default_factory=list)
    evidence: List[str] = field(default_factory=list)
    
    # Follow-up information
    needs_followup: bool = False
    followup_question: Optional[str] = None
    
    # Analysis metadata
    analyzed_at: datetime = field(default_factory=datetime.now)
    analysis_agent: Optional[str] = None
    processing_time: Optional[float] = None
    
    @classmethod
    def create(cls, question_data: QuestionData, user_response: UserResponse,
               maturity_level: int, confidence_score: float, **kwargs) -> 'AssessmentResponse':
        """Factory method for creating assessment responses"""
        return cls(
            response_id=f"assessment_{uuid.uuid4().hex[:8]}",
            question_data=question_data,
            user_response=user_response,
            maturity_level=MaturityLevel(maturity_level),
            confidence_score=max(0.0, min(1.0, confidence_score)),  # Clamp to [0,1]
            **kwargs
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "response_id": self.response_id,
            "question_data": self.question_data.to_dict(),
            "user_response": self.user_response.to_dict(),
            "maturity_level": self.maturity_level.value,
            "confidence_score": self.confidence_score,
            "concepts_identified": self.concepts_identified,
            "evidence": self.evidence,
            "needs_followup": self.needs_followup,
            "followup_question": self.followup_question,
            "analyzed_at": self.analyzed_at.isoformat(),
            "analysis_agent": self.analysis_agent,
            "processing_time": self.processing_time
        }
    
    def validate(self) -> List[str]:
        """Validate assessment response"""
        issues = []
        
        # Validate nested objects
        issues.extend(self.question_data.validate())
        issues.extend(self.user_response.validate())
        
        # Validate confidence score
        if self.confidence_score < 0 or self.confidence_score > 1:
            issues.append("Confidence score must be between 0 and 1")
            
        # Validate concepts
        if not self.concepts_identified:
            issues.append("No concepts identified in response")
            
        # Validate evidence
        if self.confidence_score > 0.8 and not self.evidence:
            issues.append("High confidence response should have supporting evidence")
            
        return issues


@dataclass
class AssessmentSession:
    """Complete assessment session data"""
    session_id: str
    user_id: Optional[str] = None
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    
    # Session data
    questions: List[QuestionData] = field(default_factory=list)
    responses: List[AssessmentResponse] = field(default_factory=list)
    
    # Session metadata
    status: str = "in_progress"  # in_progress, completed, failed
    completion_percentage: float = 0.0
    total_processing_time: float = 0.0
    
    # Session configuration
    max_questions: int = 5
    target_sections: List[AssessmentSection] = field(default_factory=lambda: list(AssessmentSection))
    
    @classmethod
    def create(cls, user_id: Optional[str] = None, **kwargs) -> 'AssessmentSession':
        """Factory method for creating assessment sessions"""
        return cls(
            session_id=f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            **kwargs
        )
    
    def add_question(self, question: QuestionData) -> None:
        """Add question to session"""
        self.questions.append(question)
        self._update_completion()
    
    def add_response(self, response: AssessmentResponse) -> None:
        """Add response to session"""
        self.responses.append(response)
        if response.processing_time:
            self.total_processing_time += response.processing_time
        self._update_completion()
    
    def _update_completion(self) -> None:
        """Update completion percentage"""
        if self.max_questions > 0:
            self.completion_percentage = min(100.0, (len(self.responses) / self.max_questions) * 100)
            
        if self.completion_percentage >= 100.0:
            self.status = "completed"
            self.completed_at = datetime.now()
    
    def is_completed(self) -> bool:
        """Check if session is completed"""
        return self.status == "completed"
    
    def get_section_responses(self, section: AssessmentSection) -> List[AssessmentResponse]:
        """Get responses for specific section"""
        return [r for r in self.responses if r.question_data.section == section]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "questions": [q.to_dict() for q in self.questions],
            "responses": [r.to_dict() for r in self.responses],
            "status": self.status,
            "completion_percentage": self.completion_percentage,
            "total_processing_time": self.total_processing_time,
            "max_questions": self.max_questions,
            "target_sections": [s.value for s in self.target_sections]
        }
    
    def validate(self) -> List[str]:
        """Validate assessment session"""
        issues = []
        
        if self.max_questions < 1:
            issues.append("Max questions must be at least 1")
            
        if len(self.questions) > self.max_questions:
            issues.append(f"Too many questions ({len(self.questions)} > {self.max_questions})")
            
        if len(self.responses) > len(self.questions):
            issues.append("More responses than questions")
            
        # Validate all nested objects
        for question in self.questions:
            issues.extend([f"Question {question.question_id}: {issue}" 
                          for issue in question.validate()])
            
        for response in self.responses:
            issues.extend([f"Response {response.response_id}: {issue}" 
                          for issue in response.validate()])
            
        return issues