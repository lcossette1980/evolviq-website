"""
Enhanced CrewAI Assessment System

A production-ready, modular AI readiness assessment platform built on CrewAI.
Addresses architectural issues from expert code review while maintaining 
sophisticated agentic AI capabilities.

Key improvements:
- Modular architecture with separation of concerns
- Centralized configuration management
- Consistent error handling with result types
- Enhanced type safety and Pythonic patterns
- Agent state management and context tracking
- Comprehensive logging and monitoring
"""

__version__ = "2.0.0"
__author__ = "EvolvIQ"

from .core.config import AssessmentConfig
from .core.orchestrator import AssessmentOrchestrator
from .models.results import AssessmentResult, ValidationResult
from .models.assessment import AssessmentResponse, QuestionData

__all__ = [
    "AssessmentConfig",
    "AssessmentOrchestrator", 
    "AssessmentResult",
    "ValidationResult",
    "AssessmentResponse",
    "QuestionData"
]