"""
Base Tool Infrastructure

Provides abstract base classes for all assessment tools with consistent
error handling, validation, and logging.
"""

import json
import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

try:
    from crewai import BaseTool
except ImportError:
    # Fallback if CrewAI structure changed or not available
    from pydantic import BaseModel as BaseTool
from ..core.config import get_config
from ..models.results import ValidationResult, ValidationIssue, ValidationSeverity


logger = logging.getLogger(__name__)


class ToolError(Exception):
    """Base exception for tool operations"""
    pass


class ToolTimeoutError(ToolError):
    """Tool operation timed out"""
    pass


class ToolValidationError(ToolError):
    """Tool input validation failed"""
    pass


@dataclass
class ToolMetrics:
    """Tool execution metrics"""
    execution_time: float
    success: bool
    error: Optional[str] = None
    input_size: int = 0
    output_size: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "execution_time": self.execution_time,
            "success": self.success,
            "error": self.error,
            "input_size": self.input_size,
            "output_size": self.output_size
        }


class AssessmentTool(BaseTool, ABC):
    """
    Abstract base class for all assessment tools
    
    Provides:
    - Consistent error handling
    - Input validation
    - Performance monitoring
    - Proper logging
    """
    
    # Abstract properties that subclasses must define
    @property
    @abstractmethod
    def name(self) -> str:
        """Tool name"""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Tool description"""
        pass
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.config = get_config()
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
        self.metrics: List[ToolMetrics] = []
    
    @abstractmethod
    def _validate_input(self, query: str) -> ValidationResult:
        """
        Validate tool input
        
        Args:
            query: The input query to validate
            
        Returns:
            ValidationResult with validation status and issues
        """
        pass
    
    @abstractmethod
    def _process_query(self, query: str) -> Dict[str, Any]:
        """
        Process the validated query
        
        Args:
            query: The validated input query
            
        Returns:
            Dictionary containing the processing results
            
        Raises:
            ToolError: If processing fails
        """
        pass
    
    def _preprocess_input(self, query: str) -> str:
        """
        Preprocess input before validation
        
        Override this method to add custom preprocessing logic.
        
        Args:
            query: Raw input query
            
        Returns:
            Preprocessed query
        """
        return query.strip() if query else ""
    
    def _postprocess_output(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Postprocess output after processing
        
        Override this method to add custom postprocessing logic.
        
        Args:
            result: Raw processing result
            
        Returns:
            Postprocessed result
        """
        return result
    
    def _format_output(self, result: Dict[str, Any]) -> str:
        """
        Format the result for CrewAI consumption
        
        Args:
            result: Processing result dictionary
            
        Returns:
            JSON string formatted for CrewAI
        """
        try:
            return json.dumps(result, indent=2, ensure_ascii=False)
        except (TypeError, ValueError) as e:
            self.logger.error(f"Failed to format output as JSON: {e}")
            return json.dumps({"error": "Failed to format output", "details": str(e)})
    
    def _handle_error(self, error: Exception, query: str) -> str:
        """
        Handle errors consistently
        
        Args:
            error: The exception that occurred
            query: The input query that caused the error
            
        Returns:
            JSON formatted error response
        """
        error_details = {
            "error": str(error),
            "error_type": type(error).__name__,
            "tool_name": self.name,
            "query_preview": query[:100] + "..." if len(query) > 100 else query
        }
        
        self.logger.error(f"Tool {self.name} failed: {error}", exc_info=True)
        
        return json.dumps({
            "success": False,
            "error": str(error),
            "error_details": error_details
        })
    
    def _record_metrics(self, execution_time: float, success: bool, 
                       error: Optional[str] = None, input_size: int = 0, 
                       output_size: int = 0) -> None:
        """Record tool execution metrics"""
        metrics = ToolMetrics(
            execution_time=execution_time,
            success=success,
            error=error,
            input_size=input_size,
            output_size=output_size
        )
        
        self.metrics.append(metrics)
        
        # Log metrics if enabled
        if self.config.enable_performance_monitoring:
            self.logger.info(f"Tool {self.name} metrics: {metrics.to_dict()}")
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for this tool"""
        if not self.metrics:
            return {"total_executions": 0}
        
        total_executions = len(self.metrics)
        successful_executions = sum(1 for m in self.metrics if m.success)
        total_time = sum(m.execution_time for m in self.metrics)
        avg_time = total_time / total_executions if total_executions > 0 else 0
        
        return {
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "success_rate": successful_executions / total_executions if total_executions > 0 else 0,
            "total_execution_time": total_time,
            "average_execution_time": avg_time,
            "fastest_execution": min(m.execution_time for m in self.metrics),
            "slowest_execution": max(m.execution_time for m in self.metrics)
        }
    
    def _run(self, query: str) -> str:
        """
        Main execution method with comprehensive error handling
        
        This method implements the complete tool execution pipeline:
        1. Input preprocessing
        2. Input validation  
        3. Query processing
        4. Output postprocessing
        5. Output formatting
        6. Error handling
        7. Metrics recording
        """
        start_time = time.time()
        input_size = len(query) if query else 0
        
        try:
            # Step 1: Preprocess input
            processed_query = self._preprocess_input(query)
            
            # Step 2: Validate input
            validation = self._validate_input(processed_query)
            if not validation.is_valid:
                raise ToolValidationError(
                    f"Input validation failed: {[issue.message for issue in validation.issues]}"
                )
            
            # Step 3: Process query
            result = self._process_query(processed_query)
            
            # Step 4: Postprocess output
            final_result = self._postprocess_output(result)
            
            # Step 5: Format output
            formatted_output = self._format_output(final_result)
            
            # Step 6: Record success metrics
            execution_time = time.time() - start_time
            self._record_metrics(
                execution_time=execution_time,
                success=True,
                input_size=input_size,
                output_size=len(formatted_output)
            )
            
            return formatted_output
            
        except Exception as e:
            # Step 7: Handle errors and record failure metrics
            execution_time = time.time() - start_time
            error_response = self._handle_error(e, query)
            
            self._record_metrics(
                execution_time=execution_time,
                success=False,
                error=str(e),
                input_size=input_size,
                output_size=len(error_response)
            )
            
            return error_response


class SimpleValidationMixin:
    """Mixin providing simple validation methods"""
    
    def create_validation_issue(self, field: str, message: str, 
                               severity: ValidationSeverity = ValidationSeverity.ERROR,
                               value: Any = None, suggestion: str = None) -> ValidationIssue:
        """Helper method to create validation issues"""
        return ValidationIssue(
            field=field,
            message=message,
            severity=severity,
            value=value,
            suggestion=suggestion
        )
    
    def validate_required_field(self, value: Any, field_name: str) -> Optional[ValidationIssue]:
        """Validate that a required field has a value"""
        if not value or (isinstance(value, str) and not value.strip()):
            return self.create_validation_issue(
                field=field_name,
                message=f"{field_name} is required",
                suggestion=f"Provide a valid {field_name}"
            )
        return None
    
    def validate_string_length(self, value: str, field_name: str, 
                              min_length: int = 0, max_length: int = None) -> Optional[ValidationIssue]:
        """Validate string length constraints"""
        if not isinstance(value, str):
            return self.create_validation_issue(
                field=field_name,
                message=f"{field_name} must be a string",
                value=type(value).__name__
            )
        
        if len(value) < min_length:
            return self.create_validation_issue(
                field=field_name,
                message=f"{field_name} too short (minimum {min_length} characters)",
                value=len(value),
                suggestion=f"Provide at least {min_length} characters"
            )
        
        if max_length and len(value) > max_length:
            return self.create_validation_issue(
                field=field_name,
                message=f"{field_name} too long (maximum {max_length} characters)",
                value=len(value),
                severity=ValidationSeverity.WARNING,
                suggestion=f"Consider shortening to under {max_length} characters"
            )
        
        return None