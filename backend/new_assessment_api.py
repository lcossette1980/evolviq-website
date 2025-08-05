"""
New Assessment API for Enhanced AI Assessments

Provides endpoints for AI Knowledge and Organizational AI Readiness assessments
with visualization generation and report creation.
"""

import os
import sys
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import base64
from io import BytesIO
import tempfile

# Set up logger first
logger = logging.getLogger(__name__)

# Import assessment modules directly (they're now in the same directory)
try:
    from enhanced_ai_assessment import EnhancedAIAssessmentWithInsights
    from enhanced_org_ai_assessment import EnhancedOrganizationalAIReadiness
    logger.info("✅ Assessment modules loaded successfully")
except ImportError as e:
    logger.error(f"Failed to import assessment modules: {e}")
    logger.error(f"Current directory: {os.getcwd()}")
    logger.error(f"Files in backend directory: {os.listdir(os.path.dirname(__file__))}")
    raise

from premium_verification import get_current_user
from rate_limiting import rate_limit_assessment

# Create router
assessment_router = APIRouter(prefix="/api/assessments", tags=["assessments"])

# Pydantic models
class AssessmentResponse(BaseModel):
    question_id: int
    answer: str

class AssessmentSubmission(BaseModel):
    responses: Dict[int, str]
    user_info: Optional[Dict[str, Any]] = None

class OrganizationInfo(BaseModel):
    name: str
    industry: str
    size: str
    current_ai_usage: str

# Cache for assessment instances
_ai_assessment_cache = None
_org_assessment_cache = None

def get_ai_assessment():
    """Get or create AI Knowledge assessment instance"""
    global _ai_assessment_cache
    if _ai_assessment_cache is None:
        _ai_assessment_cache = EnhancedAIAssessmentWithInsights()
    return _ai_assessment_cache

def get_org_assessment():
    """Get or create Organizational AI Readiness assessment instance"""
    global _org_assessment_cache
    if _org_assessment_cache is None:
        _org_assessment_cache = EnhancedOrganizationalAIReadiness()
    return _org_assessment_cache

# AI KNOWLEDGE ASSESSMENT ENDPOINTS
@assessment_router.get("/ai-knowledge/questions")
async def get_ai_knowledge_questions(
    current_user: dict = Depends(get_current_user)
):
    """Get AI Knowledge assessment questions"""
    try:
        assessment = get_ai_assessment()
        questions = []
        
        for q in assessment.questions:
            # Format question for frontend
            formatted_q = {
                "id": q["id"],
                "category": q["category"],
                "subcategory": q.get("subcategory"),
                "question": q["question"],
                "context": q.get("context"),
                "options": {
                    key: {"text": opt["text"]} 
                    for key, opt in q["options"].items()
                }
            }
            questions.append(formatted_q)
        
        return {
            "questions": questions,
            "total_questions": len(questions),
            "assessment_type": "ai-knowledge",
            "version": "2.0"
        }
        
    except Exception as e:
        logger.error(f"Failed to get AI knowledge questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.post("/ai-knowledge/calculate")
async def calculate_ai_knowledge_results(
    submission: AssessmentSubmission,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_assessment)
):
    """Calculate AI Knowledge assessment results with visualizations"""
    try:
        assessment = get_ai_assessment()
        
        # Set user responses
        assessment.user_responses = submission.responses
        
        # Calculate comprehensive results
        results = assessment.calculate_comprehensive_results()
        insights = assessment.generate_insights()
        
        # Generate visualizations
        visualizations = {}
        
        # Score progression chart
        score_chart = assessment.create_score_progression_chart()
        if score_chart:
            buffer = BytesIO()
            score_chart.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            visualizations['score_progression'] = base64.b64encode(buffer.getvalue()).decode()
            buffer.close()
        
        # Category performance radar
        radar_chart = assessment.create_category_performance_radar()
        if radar_chart:
            buffer = BytesIO()
            radar_chart.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            visualizations['category_radar'] = base64.b64encode(buffer.getvalue()).decode()
            buffer.close()
        
        # Readiness gauge
        gauge_chart = assessment.create_readiness_gauge()
        if gauge_chart:
            visualizations['readiness_gauge'] = gauge_chart.to_json()
        
        # Prepare response
        response_data = {
            "overall_score": results["overall_score"],
            "readiness_level": results["readiness_level"]["title"],
            "readiness_description": results["readiness_level"]["description"],
            "category_scores": results["category_scores"],
            "strengths": insights["strengths"],
            "growth_areas": insights["growth_areas"],
            "recommendations": results["recommendations"]["immediate_actions"],
            "learning_path": results["learning_path"],
            "visualizations": visualizations,
            "metadata": {
                "completion_time": datetime.now().isoformat(),
                "questions_answered": len(submission.responses),
                "version": "2.0"
            }
        }
        
        return response_data
        
    except Exception as e:
        logger.error(f"Failed to calculate AI knowledge results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.post("/ai-knowledge/report")
async def generate_ai_knowledge_report(
    submission: AssessmentSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Generate downloadable PDF report for AI Knowledge assessment"""
    try:
        assessment = get_ai_assessment()
        assessment.user_responses = submission.responses
        
        # Generate comprehensive report
        # TODO: Implement proper PDF generation
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp_file:
            report_path = tmp_file.name
            report_data = assessment.generate_comprehensive_report()
            
            # For now, create a simple text report
            with open(report_path, 'w') as f:
                f.write(f"AI Knowledge Assessment Report\n")
                f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"="*50 + "\n\n")
                f.write(f"Overall Score: {assessment.calculate_scores().get('overall_score', 0)}%\n")
                f.write(f"\nDetailed results available in the web interface.\n")
        
        # Return file
        return FileResponse(
            report_path,
            media_type='application/pdf',
            filename=f'ai_knowledge_assessment_{datetime.now().strftime("%Y%m%d")}.pdf'
        )
        
    except Exception as e:
        logger.error(f"Failed to generate AI knowledge report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ORGANIZATIONAL AI READINESS ENDPOINTS
@assessment_router.get("/org-readiness/questions")
async def get_org_readiness_questions(
    current_user: dict = Depends(get_current_user)
):
    """Get Organizational AI Readiness assessment questions"""
    try:
        assessment = get_org_assessment()
        questions = []
        
        for q in assessment.questions:
            formatted_q = {
                "id": q["id"],
                "dimension": q["dimension"],
                "category": q["category"],
                "question": q["question"],
                "context": q.get("context"),
                "options": {
                    key: {
                        "text": opt["text"],
                        "description": opt.get("description", "")
                    }
                    for key, opt in q["options"].items()
                }
            }
            questions.append(formatted_q)
        
        return {
            "questions": questions,
            "total_questions": len(questions),
            "dimensions": list(set(q["dimension"] for q in assessment.questions)),
            "assessment_type": "org-readiness",
            "version": "2.0"
        }
        
    except Exception as e:
        logger.error(f"Failed to get org readiness questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.post("/org-readiness/calculate")
async def calculate_org_readiness_results(
    submission: AssessmentSubmission,
    org_info: OrganizationInfo,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_assessment)
):
    """Calculate Organizational AI Readiness results with visualizations"""
    try:
        assessment = get_org_assessment()
        
        # Set organization info
        assessment.set_organization_info(
            org_info.name,
            org_info.industry,
            org_info.size,
            org_info.current_ai_usage
        )
        
        # Set responses
        assessment.user_responses = submission.responses
        
        # Calculate results
        results = assessment.calculate_comprehensive_results()
        
        # Generate visualizations
        visualizations = {}
        
        # Executive dashboard
        exec_dashboard = assessment.create_executive_dashboard()
        if exec_dashboard:
            visualizations['executive_dashboard'] = exec_dashboard.to_json()
        
        # Dimension analysis
        dimension_chart = assessment.create_enhanced_dimension_analysis()
        if dimension_chart:
            buffer = BytesIO()
            dimension_chart.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            visualizations['dimension_analysis'] = base64.b64encode(buffer.getvalue()).decode()
            buffer.close()
        
        # Maturity heatmap
        heatmap = assessment.create_maturity_heatmap()
        if heatmap:
            visualizations['maturity_heatmap'] = heatmap.to_json()
        
        # Industry comparison
        industry_comp = assessment.create_industry_comparison()
        if industry_comp:
            visualizations['industry_comparison'] = industry_comp.to_json()
        
        # Generate narrative insights
        narrative = assessment.generate_executive_narrative()
        
        response_data = {
            "overall_readiness": results["overall_readiness"],
            "maturity_level": results["maturity_level"],
            "dimension_scores": results["dimension_scores"],
            "critical_gaps": results["critical_gaps"],
            "quick_wins": results["quick_wins"],
            "strategic_priorities": results["strategic_priorities"],
            "industry_comparison": results["industry_comparison"],
            "narrative_insights": {
                "title": narrative.title,
                "summary": narrative.summary,
                "key_findings": narrative.key_findings,
                "recommendations": narrative.recommendations,
                "risk_factors": narrative.risk_factors,
                "success_indicators": narrative.success_indicators,
                "timeline_expectations": narrative.timeline_expectations,
                "investment_implications": narrative.investment_implications
            },
            "visualizations": visualizations,
            "metadata": {
                "organization": org_info.name,
                "industry": org_info.industry,
                "completion_time": datetime.now().isoformat(),
                "version": "2.0"
            }
        }
        
        return response_data
        
    except Exception as e:
        logger.error(f"Failed to calculate org readiness results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.post("/org-readiness/report")
async def generate_org_readiness_report(
    submission: AssessmentSubmission,
    org_info: OrganizationInfo,
    current_user: dict = Depends(get_current_user)
):
    """Generate executive PDF report for Organizational AI Readiness"""
    try:
        assessment = get_org_assessment()
        
        # Set organization info and responses
        assessment.set_organization_info(
            org_info.name,
            org_info.industry,
            org_info.size,
            org_info.current_ai_usage
        )
        assessment.user_responses = submission.responses
        
        # Generate executive report
        # TODO: Implement proper PDF generation
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp_file:
            report_path = tmp_file.name
            
            # For now, create a simple text report
            with open(report_path, 'w') as f:
                f.write(f"{org_info.name} - AI Readiness Report\n")
                f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"="*50 + "\n\n")
                f.write(f"Organization: {org_info.name}\n")
                f.write(f"Industry: {org_info.industry}\n")
                f.write(f"Size: {org_info.size}\n")
                f.write(f"\nDetailed results available in the web interface.\n")
        
        return FileResponse(
            report_path,
            media_type='application/pdf',
            filename=f'{org_info.name.replace(" ", "_")}_ai_readiness_report_{datetime.now().strftime("%Y%m%d")}.pdf'
        )
        
    except Exception as e:
        logger.error(f"Failed to generate org readiness report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@assessment_router.get("/health")
async def assessment_health_check():
    """Check health of new assessment system"""
    return {
        "status": "healthy",
        "version": "2.0",
        "assessments_available": {
            "ai-knowledge": True,
            "org-readiness": True
        },
        "features": {
            "visualizations": True,
            "pdf_reports": True,
            "progress_tracking": True
        },
        "timestamp": datetime.now().isoformat()
    }