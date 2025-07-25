"""
Result Models with Consistent Error Handling

Addresses the code review issue of inconsistent error handling by providing
standardized result types that encapsulate success/failure states.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Union
from enum import Enum
import json
from datetime import datetime


class ResultStatus(Enum):
    """Standardized result status codes"""
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"  
    FAILURE = "failure"
    TIMEOUT = "timeout"
    VALIDATION_ERROR = "validation_error"
    

class ReadinessLevel(Enum):
    """AI readiness assessment levels"""
    NEEDS_FOUNDATION = "needs_foundation"
    READY_TO_LEARN = "ready_to_learn"
    READY_TO_IMPLEMENT = "ready_to_implement"
    READY_TO_LEAD = "ready_to_lead"


class ValidationSeverity(Enum):
    """Validation issue severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ValidationIssue:
    """Individual validation issue"""
    field: str
    message: str
    severity: ValidationSeverity
    value: Any = None
    suggestion: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "field": self.field,
            "message": self.message,
            "severity": self.severity.value,
            "value": self.value,
            "suggestion": self.suggestion
        }


@dataclass
class ValidationResult:
    """Comprehensive validation result"""
    is_valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)
    confidence: float = 1.0
    validation_timestamp: datetime = field(default_factory=datetime.now)
    
    @property
    def has_errors(self) -> bool:
        """Check if any critical or error-level issues exist"""
        return any(
            issue.severity in [ValidationSeverity.ERROR, ValidationSeverity.CRITICAL] 
            for issue in self.issues
        )
    
    @property
    def has_warnings(self) -> bool:
        """Check if any warning-level issues exist"""
        return any(
            issue.severity == ValidationSeverity.WARNING 
            for issue in self.issues
        )
    
    def get_issues_by_severity(self, severity: ValidationSeverity) -> List[ValidationIssue]:
        """Get issues filtered by severity"""
        return [issue for issue in self.issues if issue.severity == severity]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "issues": [issue.to_dict() for issue in self.issues],
            "confidence": self.confidence,
            "has_errors": self.has_errors,
            "has_warnings": self.has_warnings,
            "validation_timestamp": self.validation_timestamp.isoformat()
        }


@dataclass
class BaseResult:
    """Base result class with consistent error handling"""
    status: ResultStatus
    data: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    execution_time: Optional[float] = None
    timestamp: datetime = field(default_factory=datetime.now)
    
    @property
    def is_success(self) -> bool:
        """Check if operation was successful"""
        return self.status == ResultStatus.SUCCESS
    
    @property
    def is_partial_success(self) -> bool:
        """Check if operation had partial success"""
        return self.status == ResultStatus.PARTIAL_SUCCESS
    
    @property
    def is_failure(self) -> bool:
        """Check if operation failed"""
        return self.status in [ResultStatus.FAILURE, ResultStatus.TIMEOUT, ResultStatus.VALIDATION_ERROR]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "status": self.status.value,
            "data": self.data,
            "error": self.error,
            "error_details": self.error_details,
            "execution_time": self.execution_time,
            "timestamp": self.timestamp.isoformat(),
            "is_success": self.is_success,
            "is_failure": self.is_failure
        }
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class QuestionGenerationResult(BaseResult):
    """Result from question generation process"""
    question_id: Optional[str] = None
    agent_name: Optional[str] = None
    section: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result.update({
            "question_id": self.question_id,
            "agent_name": self.agent_name,
            "section": self.section
        })
        return result


@dataclass  
class ConceptDetectionResult(BaseResult):
    """Result from concept detection analysis"""
    concepts_found: List[str] = field(default_factory=list)
    confidence_scores: Dict[str, float] = field(default_factory=dict)
    evidence: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result.update({
            "concepts_found": self.concepts_found,
            "confidence_scores": self.confidence_scores,
            "evidence": self.evidence
        })
        return result


@dataclass
class MaturityScoringResult(BaseResult):
    """Result from maturity scoring analysis"""
    section_scores: Dict[str, int] = field(default_factory=dict)
    overall_score: float = 0.0
    readiness_level: Optional[ReadinessLevel] = None
    confidence: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result.update({
            "section_scores": self.section_scores,
            "overall_score": self.overall_score,
            "readiness_level": self.readiness_level.value if self.readiness_level else None,
            "confidence": self.confidence
        })
        return result


@dataclass
class LearningPathResult(BaseResult):
    """Result from learning path generation"""
    learning_path: List[Dict[str, Any]] = field(default_factory=list)
    focus_areas: List[str] = field(default_factory=list)
    estimated_timeline: Optional[str] = None
    resources: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result.update({
            "learning_path": self.learning_path,
            "focus_areas": self.focus_areas,
            "estimated_timeline": self.estimated_timeline,
            "resources": self.resources
        })
        return result


@dataclass
class AssessmentResult(BaseResult):
    """Comprehensive assessment result combining all analyses"""
    question_results: List[QuestionGenerationResult] = field(default_factory=list)
    concept_detection: Optional[ConceptDetectionResult] = None
    maturity_scoring: Optional[MaturityScoringResult] = None
    learning_path: Optional[LearningPathResult] = None
    validation: Optional[ValidationResult] = None
    
    # Overall assessment metrics
    overall_confidence: float = 0.0
    completion_percentage: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result.update({
            "question_results": [q.to_dict() for q in self.question_results],
            "concept_detection": self.concept_detection.to_dict() if self.concept_detection else None,
            "maturity_scoring": self.maturity_scoring.to_dict() if self.maturity_scoring else None,
            "learning_path": self.learning_path.to_dict() if self.learning_path else None,
            "validation": self.validation.to_dict() if self.validation else None,
            "overall_confidence": self.overall_confidence,
            "completion_percentage": self.completion_percentage
        })
        return result


# Utility functions for creating standardized results

def create_success_result(data: Dict[str, Any], execution_time: float = None) -> BaseResult:
    """Create a successful result"""
    return BaseResult(
        status=ResultStatus.SUCCESS,
        data=data,
        execution_time=execution_time
    )


def create_failure_result(error: str, error_details: Dict[str, Any] = None, 
                         execution_time: float = None) -> BaseResult:
    """Create a failure result"""
    return BaseResult(
        status=ResultStatus.FAILURE,
        error=error,
        error_details=error_details,
        execution_time=execution_time
    )


def create_timeout_result(timeout_duration: float) -> BaseResult:
    """Create a timeout result"""
    return BaseResult(
        status=ResultStatus.TIMEOUT,
        error=f"Operation timed out after {timeout_duration} seconds",
        execution_time=timeout_duration
    )


def create_validation_error_result(validation: ValidationResult) -> BaseResult:
    """Create a validation error result"""
    return BaseResult(
        status=ResultStatus.VALIDATION_ERROR,
        error="Validation failed",
        error_details={"validation": validation.to_dict()}
    )