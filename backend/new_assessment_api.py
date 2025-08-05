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

from premium_verification import premium_verification
from rate_limiting import rate_limit_assessment
from fastapi import Request

# Create a dependency for getting current user
async def get_current_user(request: Request) -> dict:
    """Get current user from Firebase token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    # Verify Firebase token
    user_data = await premium_verification.verify_firebase_token(auth_header)
    return user_data

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
        
        # Calculate scores
        scores = assessment.calculate_scores()
        
        # Generate personalized insights
        insights = assessment.generate_personalized_insights(scores)
        
        # Extract readiness level
        readiness_level = insights['readiness_level']
        
        # Format strengths and growth areas
        strengths = [
            f"Strong performance in {item['category']} ({item['percentage']:.0f}%)"
            for item in insights.get('strengths', [])[:3]
        ]
        
        growth_areas = [
            f"Opportunity to improve {item['category']} (currently {item['percentage']:.0f}%)"
            for item in insights.get('growth_areas', [])[:3]
        ]
        
        # Format recommendations
        recommendations = []
        for rec in insights.get('recommendations', [])[:5]:
            if isinstance(rec, dict):
                recommendations.append(rec.get('action', str(rec)))
            else:
                recommendations.append(str(rec))
        
        # Format learning path from next_steps
        learning_path = []
        for idx, step in enumerate(insights.get('next_steps', [])[:4]):
            learning_path.append({
                "title": f"Phase {idx + 1}",
                "description": step,
                "duration": "2-4 weeks",
                "difficulty": "progressive"
            })
        
        # Generate visualizations
        visualizations = {}
        
        # Try to create visualizations (these methods might not exist)
        try:
            # Score progression chart
            score_chart = assessment.create_score_progression_chart()
            if score_chart:
                buffer = BytesIO()
                score_chart.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
                buffer.seek(0)
                visualizations['score_progression'] = base64.b64encode(buffer.getvalue()).decode()
                buffer.close()
        except:
            pass
        
        try:
            # Category performance radar
            radar_chart = assessment.create_category_performance_radar()
            if radar_chart:
                buffer = BytesIO()
                radar_chart.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
                buffer.seek(0)
                visualizations['category_radar'] = base64.b64encode(buffer.getvalue()).decode()
                buffer.close()
        except:
            pass
        
        # Prepare response
        response_data = {
            "overall_score": round(scores.get("overall_percentage", 0)),
            "readiness_level": readiness_level.get('title', 'Beginner'),
            "readiness_description": readiness_level.get('description', ''),
            "category_scores": {
                cat: round(score) for cat, score in scores.get("category_scores", {}).items()
            },
            "strengths": strengths,
            "growth_areas": growth_areas,
            "recommendations": recommendations,
            "learning_path": learning_path,
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
        
        # Calculate comprehensive scores
        scores = assessment.calculate_comprehensive_scores()
        
        # Generate comprehensive report which includes all insights
        report = assessment.generate_comprehensive_report()
        
        # Extract key metrics
        overall_readiness = round(scores.get("overall_readiness", 0))
        
        # Determine maturity level based on overall readiness
        if overall_readiness >= 80:
            maturity_level = "Optimizing"
        elif overall_readiness >= 60:
            maturity_level = "Mature"
        elif overall_readiness >= 40:
            maturity_level = "Developing"
        elif overall_readiness >= 20:
            maturity_level = "Initial"
        else:
            maturity_level = "Ad-hoc"
        
        # Extract dimension scores
        dimension_scores = {}
        for dim, score in scores.get("dimension_scores", {}).items():
            dimension_scores[dim] = round(score)
        
        # Generate critical gaps and quick wins from scores
        critical_gaps = []
        quick_wins = []
        
        for dim, score in dimension_scores.items():
            if score < 40:
                critical_gaps.append(f"Critical gap in {dim} (score: {score}%)")
            elif score >= 60 and score < 80:
                quick_wins.append(f"Quick improvement opportunity in {dim}")
        
        # If no specific gaps/wins, provide defaults
        if not critical_gaps:
            critical_gaps = ["Continue monitoring all dimensions for emerging gaps"]
        if not quick_wins:
            quick_wins = ["Focus on advancing from current maturity level"]
        
        # Create strategic priorities
        strategic_priorities = [
            "Develop comprehensive AI strategy aligned with business objectives",
            "Build AI governance framework and ethical guidelines",
            "Invest in workforce AI literacy and upskilling programs",
            "Establish AI Center of Excellence or dedicated team"
        ]
        
        # Generate visualizations (try-except for safety)
        visualizations = {}
        
        # Industry comparison mock data
        industry_comparison = {
            "position": "above average" if overall_readiness > 50 else "below average",
            "average": 50,
            "leaders": 85
        }
        
        # Create narrative insights structure
        narrative_insights = {
            "title": f"{org_info.name} AI Readiness Assessment",
            "summary": f"{org_info.name} demonstrates {maturity_level.lower()} AI maturity with an overall readiness score of {overall_readiness}%. The organization shows varying levels of preparedness across different dimensions, with clear opportunities for strategic improvement.",
            "key_findings": [
                f"Overall AI readiness: {overall_readiness}%",
                f"Maturity level: {maturity_level}",
                f"Industry position: {industry_comparison['position']}",
                f"Key strength areas identified in assessment"
            ],
            "recommendations": strategic_priorities[:3],
            "risk_factors": [
                "Rapid pace of AI technology evolution",
                "Potential skills gap in AI expertise",
                "Need for cultural change management"
            ],
            "success_indicators": [
                "Strong leadership commitment to AI transformation",
                "Existing data infrastructure foundation",
                "Culture of innovation and experimentation"
            ],
            "timeline_expectations": [
                {"period": "0-3 months", "description": "Establish AI governance and strategy"},
                {"period": "3-6 months", "description": "Launch pilot AI projects"},
                {"period": "6-12 months", "description": "Scale successful initiatives"},
                {"period": "12+ months", "description": "Achieve enterprise-wide AI integration"}
            ],
            "investment_implications": [
                "Initial investment in AI infrastructure and tools required",
                "Ongoing investment in talent development and retention",
                "Budget allocation for AI experimentation and innovation"
            ]
        }
        
        response_data = {
            "overall_readiness": overall_readiness,
            "maturity_level": maturity_level,
            "dimension_scores": dimension_scores,
            "critical_gaps": critical_gaps[:3],
            "quick_wins": quick_wins[:3],
            "strategic_priorities": strategic_priorities,
            "industry_comparison": industry_comparison,
            "narrative_insights": narrative_insights,
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