"""
Centralized Configuration Management

Addresses the code review issue of hardcoded values scattered throughout
the codebase by providing a single source of truth for all configuration.
"""

import os
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List
from enum import Enum

logger = logging.getLogger(__name__)


class ModelProvider(Enum):
    """Supported AI model providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE_OPENAI = "azure_openai"


class LogLevel(Enum):
    """Logging levels"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class LLMConfig:
    """LLM-specific configuration"""
    model_name: str = "gpt-4o-mini"
    provider: ModelProvider = ModelProvider.OPENAI
    temperature: float = 0.3
    max_tokens: int = 2000
    timeout: int = 60
    max_retries: int = 3
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for agent initialization"""
        return {
            "model": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "timeout": self.timeout,
            "max_retries": self.max_retries
        }


@dataclass 
class AgentConfig:
    """Agent-specific configuration"""
    max_iterations: int = 3
    max_concurrent_agents: int = 5
    enable_memory: bool = False
    enable_verbose: bool = True
    execution_timeout: int = 30
    performance_tracking: bool = True
    
    # Agent-specific timeouts
    question_generation_timeout: int = 30
    concept_detection_timeout: int = 45  
    maturity_scoring_timeout: int = 30
    learning_path_timeout: int = 60


@dataclass
class AssessmentConfig:
    """Main configuration class consolidating all settings"""
    
    # LLM Configuration
    llm: LLMConfig = field(default_factory=LLMConfig)
    
    # Agent Configuration  
    agents: AgentConfig = field(default_factory=AgentConfig)
    
    # Assessment Parameters
    assessment_sections: List[str] = field(default_factory=lambda: [
        "F1.1", "F1.2", "P2.1", "P2.2", "E3.1"
    ])
    max_questions: int = 5
    min_confidence_threshold: float = 0.7
    
    # Quality Assurance
    enable_validation: bool = True
    enable_fallback_questions: bool = True
    require_schema_validation: bool = True
    
    # Performance & Monitoring
    enable_performance_monitoring: bool = True
    log_level: LogLevel = LogLevel.INFO
    enable_detailed_logging: bool = False
    
    # Environment
    environment: str = "production"
    debug_mode: bool = False
    
    @classmethod
    def from_env(cls) -> 'AssessmentConfig':
        """Create configuration from environment variables"""
        
        # LLM Config from environment
        llm_config = LLMConfig(
            model_name=os.getenv('AI_MODEL', 'gpt-4o-mini'),
            provider=ModelProvider(os.getenv('AI_PROVIDER', 'openai')),
            temperature=float(os.getenv('AI_TEMPERATURE', '0.3')),
            max_tokens=int(os.getenv('AI_MAX_TOKENS', '2000')),
            timeout=int(os.getenv('AI_TIMEOUT', '60')),
            max_retries=int(os.getenv('AI_MAX_RETRIES', '3'))
        )
        
        # Agent Config from environment  
        agent_config = AgentConfig(
            max_iterations=int(os.getenv('AGENT_MAX_ITERATIONS', '3')),
            max_concurrent_agents=int(os.getenv('AGENT_MAX_CONCURRENT', '5')),
            enable_memory=os.getenv('AGENT_ENABLE_MEMORY', 'false').lower() == 'true',
            enable_verbose=os.getenv('AGENT_VERBOSE', 'true').lower() == 'true',
            execution_timeout=int(os.getenv('AGENT_TIMEOUT', '30')),
            performance_tracking=os.getenv('AGENT_PERFORMANCE_TRACKING', 'true').lower() == 'true'
        )
        
        return cls(
            llm=llm_config,
            agents=agent_config,
            max_questions=int(os.getenv('ASSESSMENT_MAX_QUESTIONS', '5')),
            min_confidence_threshold=float(os.getenv('ASSESSMENT_MIN_CONFIDENCE', '0.7')),
            enable_validation=os.getenv('ENABLE_VALIDATION', 'true').lower() == 'true',
            enable_performance_monitoring=os.getenv('ENABLE_MONITORING', 'true').lower() == 'true',
            log_level=LogLevel(os.getenv('LOG_LEVEL', 'INFO')),
            environment=os.getenv('ENVIRONMENT', 'production'),
            debug_mode=os.getenv('DEBUG_MODE', 'false').lower() == 'true'
        )
    
    def validate(self) -> List[str]:
        """Validate configuration settings"""
        issues = []
        
        if self.llm.temperature < 0 or self.llm.temperature > 2:
            issues.append("LLM temperature must be between 0 and 2")
            
        if self.llm.max_tokens < 100:
            issues.append("LLM max_tokens must be at least 100")
            
        if self.agents.max_iterations < 1:
            issues.append("Agent max_iterations must be at least 1")
            
        if self.min_confidence_threshold < 0 or self.min_confidence_threshold > 1:
            issues.append("Confidence threshold must be between 0 and 1")
            
        if self.max_questions < 1 or self.max_questions > 20:
            issues.append("Max questions must be between 1 and 20")
            
        return issues
    
    def setup_logging(self) -> None:
        """Configure logging based on config settings"""
        logging.basicConfig(
            level=getattr(logging, self.log_level.value),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        if self.enable_detailed_logging:
            logging.getLogger('assessment').setLevel(logging.DEBUG)
            
        logger.info(f"Assessment system configured for {self.environment} environment")
        
        if validation_issues := self.validate():
            logger.warning(f"Configuration validation issues: {validation_issues}")


# Global configuration instance
_config: Optional[AssessmentConfig] = None


def get_config() -> AssessmentConfig:
    """Get global configuration instance"""
    global _config
    if _config is None:
        _config = AssessmentConfig.from_env()
        _config.setup_logging()
    return _config


def set_config(config: AssessmentConfig) -> None:
    """Set global configuration instance"""
    global _config
    _config = config
    config.setup_logging()