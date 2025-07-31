# Assessment Response Schema for Database Integration
# This defines the structured format all CrewAI agents must follow

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum

class ReadinessLevel(Enum):
    NEEDS_FOUNDATION = "needs_foundation"
    READY_TO_LEARN = "ready_to_learn" 
    READY_TO_IMPLEMENT = "ready_to_implement"
    READY_TO_LEAD = "ready_to_lead"

class PriorityLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ActionStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"

@dataclass
class AssessmentScore:
    """Detailed scoring with evidence and confidence"""
    section_id: str  # F1.1, F1.2, P2.1, P2.2, E3.1
    section_name: str  # "AI Fundamentals - Concepts"
    score: float  # 1.0-5.0 scale
    score_percentage: int  # 0-100 scale for display
    confidence: float  # 0.0-1.0 confidence in scoring
    evidence: List[str]  # Specific evidence from user responses
    improvement_areas: List[str]  # Specific areas for growth
    strengths: List[str]  # What user did well in this section

@dataclass
class LearningResource:
    """Structured learning resource with tracking metadata"""
    resource_id: str  # Unique identifier for tracking
    title: str
    description: str
    resource_type: str  # "course", "article", "video", "workshop", "book"
    provider: str  # "evolviq", "coursera", "youtube", etc.
    duration_hours: float
    difficulty_level: str  # "beginner", "intermediate", "advanced"
    cost: str  # "free", "$49", "$99-199", etc.
    prerequisites: List[str]  # Required prior knowledge
    learning_objectives: List[str]  # What user will learn
    completion_criteria: str  # How to know it's complete
    url: Optional[str] = None
    internal_content_id: Optional[str] = None  # For evolviq content

@dataclass
class LearningMilestone:
    """Trackable milestone with deadline and criteria"""
    milestone_id: str
    title: str
    description: str
    target_date: str  # ISO format date
    completion_criteria: str
    success_metrics: List[str]
    dependencies: List[str]  # Other milestones that must complete first
    estimated_hours: float
    priority: PriorityLevel

@dataclass
class LearningPhase:
    """Structured learning phase with clear progression"""
    phase_id: str
    phase_number: int  # 1, 2, 3, etc.
    title: str
    description: str
    duration_weeks: int
    objectives: List[str]
    resources: List[LearningResource]
    milestones: List[LearningMilestone]
    prerequisites: List[str]  # What must be complete before starting
    success_criteria: List[str]

@dataclass
class PersonalizedLearningPlan:
    """Complete learning plan with progression tracking"""
    plan_id: str
    user_id: str
    created_at: str  # ISO timestamp
    estimated_completion_weeks: int
    total_estimated_hours: float
    difficulty_level: str  # Overall plan difficulty
    learning_style_adaptations: List[str]  # How plan adapts to user
    phases: List[LearningPhase]
    priority_focus_areas: List[str]  # Top 3 areas to focus on
    quick_wins: List[str]  # Things user can accomplish quickly
    long_term_goals: List[str]  # 6-12 month objectives

@dataclass
class ActionItem:
    """Specific, trackable action item for user"""
    action_id: str
    title: str
    description: str
    category: str  # "learning", "implementation", "assessment", "practice"
    priority: PriorityLevel
    estimated_hours: float
    due_date: str  # ISO format date
    status: ActionStatus
    completion_percentage: int  # 0-100
    dependencies: List[str]  # Other actions that must complete first
    success_criteria: str
    resources_needed: List[str]
    tips: List[str]  # Helpful tips for completion
    created_at: str
    completed_at: Optional[str] = None

@dataclass
class BusinessImplementationPlan:
    """Structured business implementation roadmap"""
    plan_id: str
    business_context: str  # Type/size of business
    implementation_phases: List[Dict[str, Any]]
    recommended_tools: List[Dict[str, Any]]
    budget_considerations: Dict[str, Any]
    roi_projections: Dict[str, Any]
    risk_mitigation: List[Dict[str, Any]]
    success_metrics: List[str]
    timeline_months: int

@dataclass
class StructuredAssessmentResponse:
    """Complete structured response from CrewAI agents"""
    # Core Assessment Data
    assessment_id: str
    user_id: str
    assessment_type: str  # "ai_knowledge" or "change_readiness"
    completed_at: str
    
    # Scoring Results
    section_scores: List[AssessmentScore]
    overall_score: float  # 1.0-5.0
    overall_score_percentage: int  # 0-100
    readiness_level: ReadinessLevel
    confidence_level: float  # 0.0-1.0
    
    # Learning & Development
    personalized_learning_plan: PersonalizedLearningPlan
    immediate_action_items: List[ActionItem]  # Next 2 weeks
    medium_term_actions: List[ActionItem]  # 2-8 weeks
    long_term_actions: List[ActionItem]  # 2+ months
    
    # Business Implementation (if applicable)
    business_implementation: Optional[BusinessImplementationPlan] = None
    
    # Analytics & Insights
    strengths_summary: List[str]
    growth_areas_summary: List[str]
    learning_style_indicators: List[str]
    motivation_factors: List[str]
    potential_obstacles: List[str]
    
    # Agent Metadata
    agents_involved: List[str]
    confidence_in_assessment: float
    recommendations_confidence: float
    assessment_duration_minutes: float

# VALIDATION SCHEMAS FOR CREWAI AGENTS
REQUIRED_AGENT_RESPONSE_FORMAT = {
    "ai_fundamentals_expert": {
        "required_fields": ["section_score", "evidence", "concepts_identified", "recommendations"],
        "score_range": (1.0, 5.0),
        "output_format": "json"
    },
    "business_strategy_consultant": {
        "required_fields": ["business_readiness_score", "implementation_recommendations", "roi_analysis"],
        "score_range": (1.0, 5.0),
        "output_format": "json"
    },
    "prompt_engineering_specialist": {
        "required_fields": ["skill_level", "specific_techniques_known", "improvement_areas"],
        "score_range": (1.0, 5.0),
        "output_format": "json"
    },
    "learning_journey_architect": {
        "required_fields": ["learning_phases", "timeline", "resource_recommendations"],
        "output_format": "structured_plan"
    }
}

def validate_agent_response(agent_type: str, response: Dict) -> bool:
    """Validate that agent response meets required format"""
    if agent_type not in REQUIRED_AGENT_RESPONSE_FORMAT:
        return False
    
    requirements = REQUIRED_AGENT_RESPONSE_FORMAT[agent_type]
    
    # Check required fields
    for field in requirements["required_fields"]:
        if field not in response:
            return False
    
    # Check score ranges if applicable
    if "score_range" in requirements:
        min_score, max_score = requirements["score_range"]
        for field in response:
            if "score" in field.lower() and isinstance(response[field], (int, float)):
                if not (min_score <= response[field] <= max_score):
                    return False
    
    return True

def generate_action_items_from_assessment(assessment: StructuredAssessmentResponse) -> List[ActionItem]:
    """Generate specific action items based on assessment results"""
    action_items = []
    
    # Immediate actions (next 2 weeks)
    if assessment.readiness_level == ReadinessLevel.NEEDS_FOUNDATION:
        action_items.extend([
            ActionItem(
                action_id=f"foundation_{assessment.assessment_id}_1",
                title="Complete AI Fundamentals Course",
                description="Take the foundational course on AI concepts to build basic understanding",
                category="learning",
                priority=PriorityLevel.CRITICAL,
                estimated_hours=8.0,
                due_date=(datetime.now() + timedelta(weeks=2)).isoformat(),
                status=ActionStatus.NOT_STARTED,
                completion_percentage=0,
                dependencies=[],
                success_criteria="Score 80%+ on course completion quiz",
                resources_needed=["AI Fundamentals Course", "2 hours per week"],
                tips=["Take notes on key concepts", "Complete all practice exercises"],
                created_at=datetime.now().isoformat()
            )
        ])
    
    # Generate actions based on specific weak areas
    for score in assessment.section_scores:
        if score.score < 3.0:  # Below proficient level
            action_items.append(
                ActionItem(
                    action_id=f"improve_{score.section_id}_{assessment.assessment_id}",
                    title=f"Improve {score.section_name}",
                    description=f"Focus on strengthening understanding in {score.section_name}",
                    category="learning",
                    priority=PriorityLevel.HIGH if score.score < 2.0 else PriorityLevel.MEDIUM,
                    estimated_hours=4.0,
                    due_date=(datetime.now() + timedelta(weeks=4)).isoformat(),
                    status=ActionStatus.NOT_STARTED,
                    completion_percentage=0,
                    dependencies=[],
                    success_criteria=f"Demonstrate proficiency through practical exercise",
                    resources_needed=score.improvement_areas,
                    tips=[f"Focus on: {', '.join(score.improvement_areas[:2])}"],
                    created_at=datetime.now().isoformat()
                )
            )
    
    return action_items

def create_database_storage_format(assessment: StructuredAssessmentResponse) -> Dict[str, Any]:
    """Convert structured assessment to database-friendly format"""
    return {
        # Primary keys and metadata
        "assessment_id": assessment.assessment_id,
        "user_id": assessment.user_id,
        "type": assessment.assessment_type,
        "completed_at": assessment.completed_at,
        "created_at": datetime.now().isoformat(),
        
        # Scores (for easy querying)
        "overall_score": assessment.overall_score,
        "overall_percentage": assessment.overall_score_percentage,
        "readiness_level": assessment.readiness_level.value,
        "confidence": assessment.confidence_level,
        
        # Section scores (nested object)
        "section_scores": {
            score.section_id: {
                "score": score.score,
                "percentage": score.score_percentage,
                "evidence": score.evidence,
                "strengths": score.strengths,
                "improvements": score.improvement_areas
            }
            for score in assessment.section_scores
        },
        
        # Learning plan structure
        "learning_plan": {
            "plan_id": assessment.personalized_learning_plan.plan_id,
            "total_weeks": assessment.personalized_learning_plan.estimated_completion_weeks,
            "total_hours": assessment.personalized_learning_plan.total_estimated_hours,
            "phases": [
                {
                    "phase_id": phase.phase_id,
                    "title": phase.title,
                    "weeks": phase.duration_weeks,
                    "objectives": phase.objectives,
                    "milestones": [
                        {
                            "milestone_id": m.milestone_id,
                            "title": m.title,
                            "target_date": m.target_date,
                            "criteria": m.completion_criteria
                        }
                        for m in phase.milestones
                    ]
                }
                for phase in assessment.personalized_learning_plan.phases
            ]
        },
        
        # Action items (for user dashboard)
        "action_items": {
            "immediate": [
                {
                    "id": item.action_id,
                    "title": item.title,
                    "description": item.description,
                    "category": item.category,
                    "priority": item.priority.value,
                    "hours": item.estimated_hours,
                    "due_date": item.due_date,
                    "status": item.status.value,
                    "completion": item.completion_percentage,
                    "tips": item.tips
                }
                for item in assessment.immediate_action_items
            ],
            "medium_term": [
                {
                    "id": item.action_id,
                    "title": item.title,
                    "category": item.category,
                    "priority": item.priority.value,
                    "due_date": item.due_date,
                    "status": item.status.value
                }
                for item in assessment.medium_term_actions
            ]
        },
        
        # Summary insights
        "insights": {
            "strengths": assessment.strengths_summary,
            "growth_areas": assessment.growth_areas_summary,
            "learning_style": assessment.learning_style_indicators,
            "obstacles": assessment.potential_obstacles
        },
        
        # Agent metadata
        "metadata": {
            "agents_used": assessment.agents_involved,
            "assessment_confidence": assessment.confidence_in_assessment,
            "duration_minutes": assessment.assessment_duration_minutes,
            "version": "structured_v1.0"
        }
    }