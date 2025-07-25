"""
Output Validation System

Implements comprehensive validation as recommended in the code review
to ensure quality and consistency of assessment results.
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

from ..core.config import get_config, AssessmentConfig
from ..models.results import ValidationResult, ValidationIssue, ValidationSeverity
from ..models.assessment import AssessmentSession, QuestionData, AssessmentResponse


logger = logging.getLogger(__name__)


class OutputValidator:
    """
    Comprehensive output validator for assessment results
    
    Implements multi-layered validation as recommended in code review:
    - Schema validation
    - Business logic validation  
    - Consistency checks
    - Quality assurance
    """
    
    def __init__(self, config: AssessmentConfig = None):
        self.config = config or get_config()
        self.logger = logging.getLogger(f"{__name__}.OutputValidator")
    
    def validate_assessment_result(self, result: Dict[str, Any]) -> ValidationResult:
        """
        Comprehensive validation of assessment results
        
        Args:
            result: The assessment result dictionary to validate
            
        Returns:
            ValidationResult with validation status and detailed issues
        """
        issues = []
        
        # Schema validation
        schema_issues = self._validate_schema(result)
        issues.extend(schema_issues)
        
        # Business logic validation
        logic_issues = self._validate_business_logic(result)
        issues.extend(logic_issues)
        
        # Consistency checks
        consistency_issues = self._validate_consistency(result)
        issues.extend(consistency_issues)
        
        # Quality checks
        quality_issues = self._validate_quality(result)
        issues.extend(quality_issues)
        
        # Calculate overall confidence
        confidence = self._calculate_confidence(result, issues)
        
        return ValidationResult(
            is_valid=len([i for i in issues if i.severity in [ValidationSeverity.ERROR, ValidationSeverity.CRITICAL]]) == 0,
            issues=issues,
            confidence=confidence
        )
    
    def _validate_schema(self, result: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate required fields and types"""
        issues = []
        
        # Required top-level fields
        required_fields = {
            'overall_score': (float, int),
            'readiness_level': str,
            'section_scores': dict,
            'confidence': (float, int)
        }
        
        for field, expected_types in required_fields.items():
            if field not in result:
                issues.append(ValidationIssue(
                    field=field,
                    message=f"Missing required field: {field}",
                    severity=ValidationSeverity.ERROR,
                    suggestion=f"Ensure {field} is included in result"
                ))
            elif not isinstance(result[field], expected_types):
                issues.append(ValidationIssue(
                    field=field,
                    message=f"Invalid type for {field}: expected {expected_types}, got {type(result[field])}",
                    severity=ValidationSeverity.ERROR,
                    value=type(result[field]).__name__,
                    suggestion=f"Convert {field} to {expected_types}"
                ))
        
        # Validate nested structures
        if 'section_scores' in result:
            section_issues = self._validate_section_scores(result['section_scores'])
            issues.extend(section_issues)
        
        if 'learning_path' in result:
            learning_issues = self._validate_learning_path(result['learning_path'])
            issues.extend(learning_issues)
        
        return issues
    
    def _validate_business_logic(self, result: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate business logic constraints"""
        issues = []
        
        # Validate score ranges
        if 'overall_score' in result:
            score = result['overall_score']
            if not (1.0 <= score <= 5.0):
                issues.append(ValidationIssue(
                    field='overall_score',
                    message=f"Overall score {score} outside valid range [1.0, 5.0]",
                    severity=ValidationSeverity.ERROR,
                    value=score,
                    suggestion="Ensure overall score is between 1.0 and 5.0"
                ))
        
        # Validate confidence scores
        if 'confidence' in result:
            confidence = result['confidence']
            if not (0.0 <= confidence <= 1.0):
                issues.append(ValidationIssue(
                    field='confidence',
                    message=f"Confidence score {confidence} outside valid range [0.0, 1.0]",
                    severity=ValidationSeverity.ERROR,
                    value=confidence,
                    suggestion="Ensure confidence is between 0.0 and 1.0"
                ))
        
        # Validate readiness level
        if 'readiness_level' in result:
            valid_levels = ['needs_foundation', 'ready_to_learn', 'ready_to_implement', 'ready_to_lead']
            if result['readiness_level'] not in valid_levels:
                issues.append(ValidationIssue(
                    field='readiness_level',
                    message=f"Invalid readiness level: {result['readiness_level']}",
                    severity=ValidationSeverity.ERROR,
                    value=result['readiness_level'],
                    suggestion=f"Use one of: {valid_levels}"
                ))
        
        return issues
    
    def _validate_consistency(self, result: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate consistency between different result components"""
        issues = []
        
        # Check overall score vs section scores consistency
        if 'overall_score' in result and 'section_scores' in result:
            overall_score = result['overall_score']
            section_scores = result['section_scores']
            
            if section_scores:
                calculated_average = sum(section_scores.values()) / len(section_scores)
                score_diff = abs(overall_score - calculated_average)
                
                if score_diff > 0.5:  # Allow some tolerance
                    issues.append(ValidationIssue(
                        field='overall_score',
                        message=f"Overall score {overall_score} inconsistent with section average {calculated_average:.2f}",
                        severity=ValidationSeverity.WARNING,
                        value=score_diff,
                        suggestion="Verify score calculation methodology"
                    ))
        
        # Check readiness level vs overall score consistency
        if 'readiness_level' in result and 'overall_score' in result:
            readiness_level = result['readiness_level']
            overall_score = result['overall_score']
            
            expected_ranges = {
                'needs_foundation': (1.0, 2.0),
                'ready_to_learn': (2.0, 3.0),
                'ready_to_implement': (3.0, 4.0),
                'ready_to_lead': (4.0, 5.0)
            }
            
            if readiness_level in expected_ranges:
                min_score, max_score = expected_ranges[readiness_level]
                if not (min_score <= overall_score < max_score):
                    issues.append(ValidationIssue(
                        field='readiness_level',
                        message=f"Readiness level '{readiness_level}' inconsistent with score {overall_score}",
                        severity=ValidationSeverity.WARNING,
                        value=overall_score,
                        suggestion=f"Expected score range: {min_score}-{max_score}"
                    ))
        
        return issues
    
    def _validate_quality(self, result: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate quality indicators"""
        issues = []
        
        # Check for completeness
        optional_but_recommended = ['learning_path', 'recommendations', 'completion_time']
        missing_optional = [field for field in optional_but_recommended if field not in result]
        
        if len(missing_optional) > len(optional_but_recommended) / 2:
            issues.append(ValidationIssue(
                field='completeness',
                message=f"Missing several recommended fields: {missing_optional}",
                severity=ValidationSeverity.INFO,
                value=missing_optional,
                suggestion="Consider including more comprehensive assessment data"
            ))
        
        # Check for low confidence with high scores
        if 'confidence' in result and 'overall_score' in result:
            confidence = result['confidence']
            score = result['overall_score']
            
            if score >= 4.0 and confidence < 0.6:
                issues.append(ValidationIssue(
                    field='confidence',
                    message=f"High overall score ({score}) with low confidence ({confidence})",
                    severity=ValidationSeverity.WARNING,
                    value={"score": score, "confidence": confidence},
                    suggestion="Review assessment methodology for high-scoring, low-confidence results"
                ))
        
        return issues
    
    def _validate_section_scores(self, section_scores: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate section scores structure"""
        issues = []
        
        expected_sections = ['F1.1', 'F1.2', 'P2.1', 'P2.2', 'E3.1']
        
        for section in expected_sections:
            if section not in section_scores:
                issues.append(ValidationIssue(
                    field=f'section_scores.{section}',
                    message=f"Missing score for section {section}",
                    severity=ValidationSeverity.WARNING,
                    suggestion=f"Include score for section {section}"
                ))
            else:
                score = section_scores[section]
                if not isinstance(score, (int, float)) or not (1.0 <= score <= 5.0):
                    issues.append(ValidationIssue(
                        field=f'section_scores.{section}',
                        message=f"Invalid score for section {section}: {score}",
                        severity=ValidationSeverity.ERROR,
                        value=score,
                        suggestion="Ensure section scores are numeric between 1.0 and 5.0"
                    ))
        
        return issues
    
    def _validate_learning_path(self, learning_path: List[Dict[str, Any]]) -> List[ValidationIssue]:
        """Validate learning path structure"""
        issues = []
        
        if not isinstance(learning_path, list):
            issues.append(ValidationIssue(
                field='learning_path',
                message="Learning path must be a list",
                severity=ValidationSeverity.ERROR,
                value=type(learning_path).__name__,
                suggestion="Ensure learning path is formatted as a list of items"
            ))
            return issues
        
        if len(learning_path) == 0:
            issues.append(ValidationIssue(
                field='learning_path',
                message="Learning path is empty",
                severity=ValidationSeverity.WARNING,
                suggestion="Provide at least one learning recommendation"
            ))
        
        for i, item in enumerate(learning_path):
            if not isinstance(item, dict):
                issues.append(ValidationIssue(
                    field=f'learning_path[{i}]',
                    message=f"Learning path item {i} must be a dictionary",
                    severity=ValidationSeverity.ERROR,
                    value=type(item).__name__
                ))
                continue
            
            required_item_fields = ['topic', 'priority']
            for field in required_item_fields:
                if field not in item:
                    issues.append(ValidationIssue(
                        field=f'learning_path[{i}].{field}',
                        message=f"Missing required field '{field}' in learning path item {i}",
                        severity=ValidationSeverity.WARNING,
                        suggestion=f"Include '{field}' in learning path items"
                    ))
        
        return issues
    
    def _calculate_confidence(self, result: Dict[str, Any], issues: List[ValidationIssue]) -> float:
        """Calculate overall confidence in the validation result"""
        # Start with base confidence
        base_confidence = 1.0
        
        # Reduce confidence based on issues
        for issue in issues:
            if issue.severity == ValidationSeverity.CRITICAL:
                base_confidence -= 0.3
            elif issue.severity == ValidationSeverity.ERROR:
                base_confidence -= 0.2
            elif issue.severity == ValidationSeverity.WARNING:
                base_confidence -= 0.1
            elif issue.severity == ValidationSeverity.INFO:
                base_confidence -= 0.05
        
        # Ensure confidence stays within valid range
        return max(0.0, min(1.0, base_confidence))
    
    def validate_question_data(self, question_data: QuestionData) -> ValidationResult:
        """Validate question data structure"""
        issues = []
        
        # Use the question's built-in validation
        question_issues = question_data.validate()
        for issue_msg in question_issues:
            issues.append(ValidationIssue(
                field='question',
                message=issue_msg,
                severity=ValidationSeverity.ERROR
            ))
        
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            confidence=1.0 if len(issues) == 0 else 0.5
        )
    
    def validate_assessment_response(self, response: AssessmentResponse) -> ValidationResult:
        """Validate assessment response structure"""
        issues = []
        
        # Use the response's built-in validation
        response_issues = response.validate()
        for issue_msg in response_issues:
            issues.append(ValidationIssue(
                field='assessment_response',
                message=issue_msg,
                severity=ValidationSeverity.ERROR
            ))
        
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            confidence=1.0 if len(issues) == 0 else 0.5
        )
    
    def validate_session(self, session: AssessmentSession) -> ValidationResult:
        """Validate complete assessment session"""
        issues = []
        
        # Use the session's built-in validation
        session_issues = session.validate()
        for issue_msg in session_issues:
            issues.append(ValidationIssue(
                field='session',
                message=issue_msg,
                severity=ValidationSeverity.ERROR
            ))
        
        # Additional session-level validations
        if session.is_completed() and len(session.responses) < session.max_questions:
            issues.append(ValidationIssue(
                field='session.completion',
                message=f"Session marked complete but only has {len(session.responses)}/{session.max_questions} responses",
                severity=ValidationSeverity.WARNING,
                suggestion="Verify session completion logic"
            ))
        
        return ValidationResult(
            is_valid=len([i for i in issues if i.severity in [ValidationSeverity.ERROR, ValidationSeverity.CRITICAL]]) == 0,
            issues=issues,
            confidence=1.0 if len(issues) == 0 else 0.7
        )