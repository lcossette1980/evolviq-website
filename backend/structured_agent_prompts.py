# Structured Agent Prompts for Database-Compatible Responses
# These prompts enforce the structured response format

import json
from datetime import datetime, timedelta

def create_structured_scoring_task() -> str:
    """Enhanced scoring task with strict JSON output format"""
    return f"""
CRITICAL: You MUST respond with EXACTLY this JSON format. No other text, explanations, or formatting.

Analyze the user responses using the maturity scoring framework and return ONLY this JSON structure:

{{
    "section_scores": [
        {{
            "section_id": "F1.1",
            "section_name": "AI Fundamentals - Concepts",
            "score": 3.2,
            "score_percentage": 64,
            "confidence": 0.85,
            "evidence": ["specific evidence from user response 1", "evidence 2"],
            "improvement_areas": ["specific area to improve 1", "area 2"],
            "strengths": ["what user did well 1", "strength 2"]
        }},
        {{
            "section_id": "F1.2", 
            "section_name": "AI Fundamentals - Business Applications",
            "score": 2.8,
            "score_percentage": 56,
            "confidence": 0.78,
            "evidence": ["business thinking evidence"],
            "improvement_areas": ["needs roi understanding"],
            "strengths": ["recognizes ai value"]
        }},
        {{
            "section_id": "P2.1",
            "section_name": "Prompt Engineering - Basics", 
            "score": 3.0,
            "score_percentage": 60,
            "confidence": 0.80,
            "evidence": ["prompt structure evidence"],
            "improvement_areas": ["systematic approach needed"],
            "strengths": ["understands context importance"]
        }},
        {{
            "section_id": "P2.2",
            "section_name": "Prompt Engineering - Advanced",
            "score": 2.5,
            "score_percentage": 50,
            "confidence": 0.70,
            "evidence": ["limited advanced knowledge"],
            "improvement_areas": ["chain of thought", "optimization techniques"],
            "strengths": ["willing to learn"]
        }},
        {{
            "section_id": "E3.1",
            "section_name": "AI Tool Ecosystem",
            "score": 3.1,
            "score_percentage": 62,
            "confidence": 0.75,
            "evidence": ["knows multiple tools"],
            "improvement_areas": ["integration knowledge", "selection criteria"],
            "strengths": ["diverse tool awareness"]
        }}
    ],
    "overall_score": 2.9,
    "overall_score_percentage": 58,
    "readiness_level": "ready_to_learn",
    "confidence_level": 0.78,
    "scoring_rationale": {{
        "F1.1": "User shows basic understanding but lacks precision in technical distinctions",
        "F1.2": "Recognizes business value but needs deeper ROI thinking",
        "P2.1": "Understands basics but lacks systematic approach",
        "P2.2": "Limited knowledge of advanced techniques",
        "E3.1": "Good tool awareness but needs integration knowledge"
    }}
}}

SCORING GUIDELINES:
- Score 1.0-1.9: Fundamental gaps, incorrect understanding
- Score 2.0-2.9: Basic awareness, needs significant development  
- Score 3.0-3.9: Proficient understanding, some advanced areas needed
- Score 4.0-4.9: Advanced knowledge, ready for implementation
- Score 5.0: Expert level, can teach others

READINESS LEVELS:
- "needs_foundation": Overall score < 2.5
- "ready_to_learn": Overall score 2.5-3.4
- "ready_to_implement": Overall score 3.5-4.4  
- "ready_to_lead": Overall score 4.5+

Return ONLY the JSON. No other text.
"""

def create_structured_learning_plan_task() -> str:
    """Enhanced learning plan task with detailed structure"""
    return f"""
CRITICAL: You MUST respond with EXACTLY this JSON format. No other text.

Based on the assessment scores, create a personalized learning plan:

{{
    "personalized_learning_plan": {{
        "plan_id": "lp_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "estimated_completion_weeks": 8,
        "total_estimated_hours": 40.0,
        "difficulty_level": "beginner_to_intermediate",
        "learning_style_adaptations": ["visual learner accommodations", "hands-on practice emphasis"],
        "phases": [
            {{
                "phase_id": "phase_1_foundation",
                "phase_number": 1,
                "title": "Foundation Building",
                "description": "Establish core AI literacy and understanding",
                "duration_weeks": 3,
                "objectives": [
                    "Understand AI/ML/LLM relationships clearly",
                    "Identify basic business applications",
                    "Master fundamental terminology"
                ],
                "resources": [
                    {{
                        "resource_id": "ai_fundamentals_course",
                        "title": "AI Fundamentals for Business Professionals",
                        "description": "Comprehensive introduction to AI concepts", 
                        "resource_type": "course",
                        "provider": "evolviq",
                        "duration_hours": 12.0,
                        "difficulty_level": "beginner",
                        "cost": "free",
                        "prerequisites": [],
                        "learning_objectives": ["Define AI vs ML vs LLM", "Identify business use cases"],
                        "completion_criteria": "Pass final quiz with 80%+",
                        "internal_content_id": "course_ai_fundamentals_v2"
                    }}
                ],
                "milestones": [
                    {{
                        "milestone_id": "m1_concepts",
                        "title": "AI Concepts Mastery",
                        "description": "Demonstrate clear understanding of AI hierarchy",
                        "target_date": "{(datetime.now() + timedelta(weeks=2)).strftime('%Y-%m-%d')}",
                        "completion_criteria": "Explain AI/ML/LLM relationships accurately",
                        "success_metrics": ["80%+ on concept quiz", "Can teach concept to colleague"],
                        "dependencies": [],
                        "estimated_hours": 8.0,
                        "priority": "critical"
                    }}
                ],
                "prerequisites": [],
                "success_criteria": ["Complete all resources", "Pass all milestone assessments"]
            }},
            {{
                "phase_id": "phase_2_application",
                "phase_number": 2,
                "title": "Practical Application",
                "description": "Apply knowledge through hands-on practice",
                "duration_weeks": 3,
                "objectives": [
                    "Master basic prompt engineering",
                    "Explore AI tool ecosystem",
                    "Create first AI-powered workflow"
                ],
                "resources": [
                    {{
                        "resource_id": "prompt_engineering_workshop",
                        "title": "Prompt Engineering Mastery Workshop",
                        "description": "Hands-on prompt engineering practice",
                        "resource_type": "workshop", 
                        "provider": "evolviq",
                        "duration_hours": 8.0,
                        "difficulty_level": "intermediate",
                        "cost": "$49",
                        "prerequisites": ["AI fundamentals completion"],
                        "learning_objectives": ["Write effective prompts", "Use advanced techniques"],
                        "completion_criteria": "Complete 10 prompt challenges",
                        "internal_content_id": "workshop_prompt_eng_v3"
                    }}
                ],
                "milestones": [
                    {{
                        "milestone_id": "m2_prompting",
                        "title": "Prompt Engineering Proficiency",
                        "description": "Demonstrate effective prompting skills",
                        "target_date": "{(datetime.now() + timedelta(weeks=5)).strftime('%Y-%m-%d')}",
                        "completion_criteria": "Create 10 effective prompts for business scenarios",
                        "success_metrics": ["90%+ success rate on prompt challenges"],
                        "dependencies": ["m1_concepts"],
                        "estimated_hours": 6.0,
                        "priority": "high"
                    }}
                ],
                "prerequisites": ["phase_1_foundation"],
                "success_criteria": ["Demonstrate practical AI usage", "Complete workflow project"]
            }},
            {{
                "phase_id": "phase_3_implementation",
                "phase_number": 3,
                "title": "Business Implementation",
                "description": "Implement AI solutions in business context",
                "duration_weeks": 2,
                "objectives": [
                    "Design AI implementation strategy",
                    "Select appropriate tools for business needs",
                    "Create measurement framework"
                ],
                "resources": [
                    {{
                        "resource_id": "business_ai_guide",
                        "title": "AI Implementation for Small Business",
                        "description": "Practical guide to business AI adoption",
                        "resource_type": "guide",
                        "provider": "evolviq",
                        "duration_hours": 4.0,
                        "difficulty_level": "intermediate",
                        "cost": "free",
                        "prerequisites": ["Prompt engineering proficiency"],
                        "learning_objectives": ["Create implementation plan", "Select tools"],
                        "completion_criteria": "Complete business implementation plan",
                        "internal_content_id": "guide_business_ai_v1"
                    }}
                ],
                "milestones": [
                    {{
                        "milestone_id": "m3_implementation",
                        "title": "Business AI Implementation Plan",
                        "description": "Create comprehensive implementation roadmap",
                        "target_date": "{(datetime.now() + timedelta(weeks=8)).strftime('%Y-%m-%d')}",
                        "completion_criteria": "Present complete implementation plan",
                        "success_metrics": ["Stakeholder approval", "Clear ROI projections"],
                        "dependencies": ["m2_prompting"],
                        "estimated_hours": 6.0,
                        "priority": "high"
                    }}
                ],
                "prerequisites": ["phase_2_application"],
                "success_criteria": ["Working AI implementation", "Measurable business impact"]
            }}
        ],
        "priority_focus_areas": ["AI Fundamentals", "Prompt Engineering", "Business Implementation"],
        "quick_wins": [
            "Set up ChatGPT Plus account",
            "Create 3 useful prompts for daily work",
            "Automate one repetitive task with AI"
        ],
        "long_term_goals": [
            "Become organization's AI champion",
            "Implement 3+ AI tools successfully", 
            "Train team on AI best practices"
        ]
    }}
}}

Return ONLY the JSON. No other text.
"""

def create_structured_action_items_task() -> str:
    """Enhanced action items task with specific, trackable actions"""
    return f"""
CRITICAL: You MUST respond with EXACTLY this JSON format. No other text.

Based on assessment results, create specific action items with tracking metadata:

{{
    "immediate_action_items": [
        {{
            "action_id": "action_{datetime.now().strftime('%Y%m%d_%H%M%S')}_1",
            "title": "Complete AI Fundamentals Assessment",
            "description": "Take the baseline assessment to identify current knowledge level and create personalized learning path",
            "category": "assessment",
            "priority": "critical",
            "estimated_hours": 1.0,
            "due_date": "{(datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')}",
            "status": "not_started",
            "completion_percentage": 0,
            "dependencies": [],
            "success_criteria": "Complete assessment with 100% response rate",
            "resources_needed": ["30 minutes of focused time", "Computer/mobile device"],
            "tips": [
                "Be honest about current knowledge level",
                "Take time to think through each question",
                "Don't research answers - assess current knowledge"
            ],
            "created_at": "{datetime.now().isoformat()}"
        }},
        {{
            "action_id": "action_{datetime.now().strftime('%Y%m%d_%H%M%S')}_2", 
            "title": "Set Up AI Learning Environment",
            "description": "Create accounts and bookmarks for primary AI learning tools and platforms",
            "category": "setup",
            "priority": "high",
            "estimated_hours": 2.0,
            "due_date": "{(datetime.now() + timedelta(weeks=1)).strftime('%Y-%m-%d')}",
            "status": "not_started", 
            "completion_percentage": 0,
            "dependencies": [],
            "success_criteria": "All accounts created and tested",
            "resources_needed": ["Email address", "Credit card (for paid services)", "Browser bookmarks"],
            "tips": [
                "Start with free tiers to explore",
                "Organize bookmarks in AI folder",
                "Test each tool with simple task"
            ],
            "created_at": "{datetime.now().isoformat()}"
        }}
    ],
    "medium_term_actions": [
        {{
            "action_id": "action_{datetime.now().strftime('%Y%m%d_%H%M%S')}_3",
            "title": "Complete Prompt Engineering Certification",
            "description": "Finish structured prompt engineering course and earn completion certificate",
            "category": "learning",
            "priority": "high",
            "estimated_hours": 12.0,
            "due_date": "{(datetime.now() + timedelta(weeks=4)).strftime('%Y-%m-%d')}",
            "status": "not_started",
            "completion_percentage": 0,
            "dependencies": ["action_{datetime.now().strftime('%Y%m%d_%H%M%S')}_1"],
            "success_criteria": "Pass final exam with 85%+ score",
            "resources_needed": ["Prompt Engineering Course", "Practice exercises", "3 hours per week"],
            "tips": [
                "Practice with real work scenarios",
                "Join community discussions",
                "Create personal prompt library"
            ],
            "created_at": "{datetime.now().isoformat()}"
        }}
    ],
    "long_term_actions": [
        {{
            "action_id": "action_{datetime.now().strftime('%Y%m%d_%H%M%S')}_4",
            "title": "Implement AI Pilot Project",
            "description": "Choose and implement first AI solution in business context with measurable outcomes",
            "category": "implementation",
            "priority": "medium",
            "estimated_hours": 20.0,
            "due_date": "{(datetime.now() + timedelta(weeks=12)).strftime('%Y-%m-%d')}",
            "status": "not_started",
            "completion_percentage": 0,
            "dependencies": ["action_{datetime.now().strftime('%Y%m%d_%H%M%S')}_3"],
            "success_criteria": "Measurable business impact demonstrated",
            "resources_needed": ["AI tool subscription", "Stakeholder buy-in", "Success metrics"],
            "tips": [
                "Start small with clear success criteria",
                "Document lessons learned",
                "Prepare to scale successful implementations"
            ],
            "created_at": "{datetime.now().isoformat()}"
        }}
    ]
}}

ACTION ITEM CATEGORIES:
- "assessment": Evaluation and testing activities
- "learning": Educational content and skill building
- "setup": Tool configuration and environment preparation  
- "practice": Hands-on application and experimentation
- "implementation": Real business application projects
- "sharing": Knowledge transfer and teaching others

PRIORITY LEVELS:
- "critical": Must be done immediately, blocks other progress
- "high": Important for learning progression
- "medium": Valuable but can be scheduled flexibly
- "low": Nice to have, time permitting

Return ONLY the JSON. No other text.
"""

def create_structured_business_recommendations_task() -> str:
    """Enhanced business recommendations with implementation details"""
    return f"""
CRITICAL: You MUST respond with EXACTLY this JSON format. No other text.

Create detailed business implementation recommendations:

{{
    "business_implementation_plan": {{
        "plan_id": "biz_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "business_context": "Small to medium business with 10-50 employees",
        "implementation_phases": [
            {{
                "phase": 1,
                "title": "Foundation & Quick Wins",
                "duration_months": 2,
                "objectives": ["Establish AI basics", "Achieve early wins", "Build confidence"],
                "activities": [
                    "Team AI literacy training",
                    "Implement ChatGPT for content creation",
                    "Create prompt templates library"
                ],
                "success_metrics": ["100% team completion of AI basics", "3+ documented use cases", "20% content creation efficiency gain"],
                "budget_range": "$500-1500",
                "key_tools": ["ChatGPT Plus", "Claude Pro", "Internal training"]
            }},
            {{
                "phase": 2, 
                "title": "Process Integration",
                "duration_months": 3,
                "objectives": ["Integrate AI into workflows", "Automate routine tasks", "Measure impact"],
                "activities": [
                    "Workflow analysis and optimization",
                    "Custom AI integration development", 
                    "Staff training on advanced techniques"
                ],
                "success_metrics": ["5+ workflows enhanced", "30% efficiency gain in key processes", "ROI positive"],
                "budget_range": "$2000-5000",
                "key_tools": ["Microsoft Copilot", "Zapier AI", "Custom solutions"]
            }},
            {{
                "phase": 3,
                "title": "Advanced Implementation",
                "duration_months": 4,
                "objectives": ["Strategic AI integration", "Competitive advantage", "Scale successes"],
                "activities": [
                    "Advanced AI tool deployment",
                    "Custom model development consideration",
                    "AI governance framework creation"
                ],
                "success_metrics": ["Measurable competitive advantage", "50%+ processes AI-enhanced", "Team AI proficiency"],
                "budget_range": "$5000-15000",
                "key_tools": ["Advanced platforms", "Custom integrations", "Analytics tools"]
            }}
        ],
        "recommended_tools": [
            {{
                "tool_name": "ChatGPT Plus",
                "category": "Content Creation",
                "monthly_cost": "$20",
                "use_cases": ["Writing assistance", "Email drafting", "Content ideation"],
                "implementation_difficulty": "Low",
                "roi_timeline": "Immediate",
                "success_criteria": "Daily usage by 80%+ of team"
            }},
            {{
                "tool_name": "Microsoft Copilot",
                "category": "Productivity Suite",
                "monthly_cost": "$30 per user",
                "use_cases": ["Document creation", "Data analysis", "Meeting summaries"],
                "implementation_difficulty": "Medium", 
                "roi_timeline": "1-2 months",
                "success_criteria": "15% productivity improvement"
            }},
            {{
                "tool_name": "Custom AI Integration",
                "category": "Process Automation",
                "monthly_cost": "$200-800",
                "use_cases": ["Workflow automation", "Data processing", "Customer service"],
                "implementation_difficulty": "High",
                "roi_timeline": "3-6 months", 
                "success_criteria": "Automate 3+ manual processes"
            }}
        ],
        "budget_considerations": {{
            "total_first_year": "$15000-30000",
            "ongoing_annual": "$8000-20000",
            "roi_projection": "150-300% within 12 months",
            "payback_period": "6-9 months",
            "cost_breakdown": {{
                "software_subscriptions": "40%",
                "training_development": "30%", 
                "implementation_consulting": "20%",
                "infrastructure_setup": "10%"
            }}
        }},
        "roi_projections": {{
            "efficiency_gains": "30-50% in targeted processes",
            "cost_savings": "$25000-50000 annually",
            "revenue_opportunities": "$10000-30000 annually",
            "time_savings": "10-15 hours per employee per week",
            "quality_improvements": "Reduced errors, improved consistency"
        }},
        "risk_mitigation": [
            {{
                "risk": "Employee resistance to change",
                "likelihood": "Medium",
                "impact": "High",
                "mitigation": "Comprehensive training and change management program",
                "contingency": "Gradual rollout with champions program"
            }},
            {{
                "risk": "Technology integration challenges", 
                "likelihood": "High",
                "impact": "Medium",
                "mitigation": "Pilot testing and phased implementation",
                "contingency": "Professional services engagement"
            }},
            {{
                "risk": "ROI not achieved in timeline",
                "likelihood": "Low",
                "impact": "High", 
                "mitigation": "Clear success metrics and regular review cycles",
                "contingency": "Strategy adjustment and additional training"
            }}
        ],
        "success_metrics": [
            "Employee AI proficiency scores > 80%",
            "Process efficiency improvements > 25%",
            "ROI positive within 9 months",
            "Customer satisfaction maintained/improved",
            "Competitive advantage demonstrated"
        ],
        "timeline_months": 9
    }}
}}

Return ONLY the JSON. No other text.
"""

def get_all_structured_prompts():
    """Get all structured prompts for CrewAI agents"""
    return {
        "scoring_agent": create_structured_scoring_task(),
        "learning_agent": create_structured_learning_plan_task(), 
        "action_items_agent": create_structured_action_items_task(),
        "business_agent": create_structured_business_recommendations_task()
    }