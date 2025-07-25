"""
Assessment Core Module

Core system components including configuration and orchestration.
"""

from .config import AssessmentConfig, get_config, set_config
from .orchestrator import AssessmentOrchestrator

__all__ = [
    "AssessmentConfig",
    "get_config", 
    "set_config",
    "AssessmentOrchestrator"
]