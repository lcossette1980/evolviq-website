"""
Output Validation Tool

Provides validation functionality for assessment outputs.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from .base import AssessmentTool, ToolValidationError
from ..models.results import ValidationResult, ValidationIssue, ValidationSeverity

logger = logging.getLogger(__name__)


class OutputValidationTool(AssessmentTool):
    """
    Tool for validating assessment outputs against expected schemas
    """
    
    name = "output_validation"
    description = "Validates assessment outputs for consistency and completeness"
    
    def __init__(self):
        super().__init__()
        self.validation_schemas = {
            "question": {
                "required_fields": ["question", "question_id", "section"],
                "optional_fields": ["difficulty_level", "focus_area", "expected_concepts"]
            },
            "response": {
                "required_fields": ["answer", "question_id"],
                "optional_fields": ["response_time", "confidence"]
            },
            "assessment_result": {
                "required_fields": ["overall_score", "readiness_level"],
                "optional_fields": ["section_scores", "learning_path", "recommendations"]
            }
        }
    
    def _execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate output data against schema
        
        Args:
            input_data: Must contain 'output_type' and 'data' keys
            
        Returns:
            Validation result with issues if any
        """
        output_type = input_data.get("output_type")
        data = input_data.get("data")
        
        if not output_type:
            raise ToolValidationError("output_type is required")
        
        if not data:
            raise ToolValidationError("data is required for validation")
        
        schema = self.validation_schemas.get(output_type)
        if not schema:
            return {
                "valid": False,
                "error": f"Unknown output type: {output_type}"
            }
        
        # Validate required fields
        issues = []
        for field in schema["required_fields"]:
            if field not in data:
                issues.append(f"Missing required field: {field}")
        
        # Check data types
        if isinstance(data, dict):
            for key, value in data.items():
                if value is None and key in schema["required_fields"]:
                    issues.append(f"Required field '{key}' cannot be null")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "output_type": output_type,
            "validated_fields": list(data.keys()) if isinstance(data, dict) else []
        }
    
    def _validate_input(self, input_data: Dict[str, Any]) -> ValidationResult:
        """Validate tool input"""
        issues = []
        
        if not isinstance(input_data, dict):
            issues.append(
                ValidationIssue(
                    field="input_data",
                    message="Input must be a dictionary",
                    severity=ValidationSeverity.ERROR
                )
            )
        elif "output_type" not in input_data:
            issues.append(
                ValidationIssue(
                    field="output_type",
                    message="output_type is required",
                    severity=ValidationSeverity.ERROR
                )
            )
        
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues
        )