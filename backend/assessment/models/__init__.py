"""
Assessment Data Models

Enhanced data structures with proper typing and validation.
"""

from .assessment import (
    AssessmentSection,
    MaturityLevel,
    QuestionData,
    UserResponse,
    AssessmentResponse,
    AssessmentSession
)
from .results import (
    ResultStatus,
    ReadinessLevel,
    ValidationSeverity,
    ValidationIssue,
    ValidationResult,
    BaseResult,
    AssessmentResult,
    create_success_result,
    create_failure_result
)

__all__ = [
    # Assessment models
    "AssessmentSection",
    "MaturityLevel", 
    "QuestionData",
    "UserResponse",
    "AssessmentResponse",
    "AssessmentSession",
    # Result models
    "ResultStatus",
    "ReadinessLevel",
    "ValidationSeverity",
    "ValidationIssue",
    "ValidationResult",
    "BaseResult",
    "AssessmentResult",
    "create_success_result",
    "create_failure_result"
]