"""
Guide Registry API

Provides a static registry of implementation guides and their sections.
Future: can be backed by Firestore or CMS.
"""

from fastapi import APIRouter
from datetime import datetime

guide_router = APIRouter(prefix="/api/guides", tags=["guides"])


@guide_router.get("/registry")
async def get_guide_registry():
    """Return the guide registry (v1.0)."""
    registry = [
        {
            "guide_id": "AIImplementationPlaybook",
            "client_key": "implementation_playbook",
            "title": "AI Implementation Playbook",
            "tags": ["strategy", "mlops"],
            "dimensions": ["Leadership & Strategy", "Technology Infrastructure"],
            "maturity_targets": ["Developing", "Mature"],
            "sections": [
                {"id": "strategy", "title": "Strategy Foundations", "anchors": ["vision", "roadmap"], "dimensions": ["Leadership & Strategy"], "level": "foundational"},
                {"id": "mlops", "title": "MLOps", "anchors": ["registry", "deployment"], "dimensions": ["Technology Infrastructure"], "level": "developing"}
            ],
        },
        {
            "guide_id": "AIReadinessAssessment",
            "client_key": "ai_readiness_assessment",
            "title": "AI Readiness Assessment",
            "tags": ["governance", "capabilities"],
            "dimensions": ["Governance & Ethics", "Culture"],
            "maturity_targets": ["Developing", "Defined"],
            "sections": [
                {"id": "governance", "title": "Governance", "anchors": ["policy", "risk"], "dimensions": ["Governance & Ethics"], "level": "foundational"}
            ],
        },
        {
            "guide_id": "AIUseCaseROIToolkit",
            "client_key": "ai_use_case_roi_toolkit",
            "title": "AI Use Case ROI Toolkit",
            "tags": ["roi", "business"],
            "dimensions": ["Financial Resources", "Market & Customer Focus"],
            "maturity_targets": ["Developing", "Mature"],
            "sections": [
                {"id": "prioritization", "title": "Prioritization", "anchors": ["scoring", "impact"], "dimensions": ["Market & Customer Focus"], "level": "developing"}
            ],
        },
        {
            "guide_id": "AIStrategyStarterKit",
            "client_key": "ai_strategy_starter_kit",
            "title": "AI Strategy Starter Kit",
            "tags": ["strategy"],
            "dimensions": ["Leadership & Strategy"],
            "maturity_targets": ["Developing"],
            "sections": [
                {"id": "foundations", "title": "Foundations", "anchors": ["mission", "principles"], "dimensions": ["Leadership & Strategy"], "level": "foundational"}
            ],
        },
    ]

    return {
        "version": "1.0",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "guides": registry,
    }

