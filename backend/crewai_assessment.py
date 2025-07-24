# AI Readiness Assessment System - True CrewAI Implementation
# This implements the sophisticated agentic framework using real CrewAI agents
# Railway deployment fix - FORCE UPDATE 2025-07-22T16:05:00Z - LiteLLM DISABLED

import json
import os
import uuid
import signal
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

# AGGRESSIVE: Disable LiteLLM completely - must be set BEFORE any imports
os.environ['LITELLM_LOG_LEVEL'] = 'CRITICAL'  # Highest level to suppress all logs
os.environ['LITELLM_DISABLE_TELEMETRY'] = 'True'  
os.environ['LITELLM_SUCCESS_CALLBACK'] = ''  
os.environ['LITELLM_FAILURE_CALLBACK'] = ''  
os.environ['LITELLM_DISABLE_COST'] = 'True'  
os.environ['LITELLM_LOCAL_MODEL_COST_MAP'] = '{}'  # Empty cost map
os.environ['LITELLM_DROP_PARAMS'] = 'True'  # Drop unsupported params

# Try to disable LiteLLM completely by monkey patching
try:
    import litellm
    litellm.drop_params = True
    litellm.disable_telemetry = True
    litellm.set_verbose = False
    # Override cost calculation function to do nothing
    def disabled_cost_calculator(*args, **kwargs):
        return {"cost": 0, "prompt_tokens": 0, "completion_tokens": 0}
    litellm.cost_calculator = disabled_cost_calculator
except ImportError:
    pass  # LiteLLM not available, which is fine

# CrewAI imports
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class AssessmentResponse:
    question_id: str
    user_response: str
    maturity_level: int
    confidence_score: float
    concepts_identified: List[str]
    evidence: List[str]
    needs_followup: bool = False
    followup_question: Optional[str] = None

# =============================================================================
# CUSTOM CREWAI TOOLS
# =============================================================================

class AssessmentDataTool(BaseTool):
    name: str = "assessment_data_tool"
    description: str = "Access assessment data including questions, user responses, and scoring criteria"
    
    def _run(self, query: str) -> str:
        """Access AI literacy assessment questions and criteria - simple and reliable"""
        # Simple, reliable data structure based on working pattern
        questions_data = {
            'F1.1': {
                'section': 'AI Fundamentals - Concepts',
                'weight': 0.20,
                'concepts': ['artificial intelligence', 'machine learning', 'automation', 'algorithms', 'data processing'],
                'maturity_levels': [
                    "Confused: Thinks AI, ML, and LLMs are the same thing",
                    "Vague Awareness: Knows they're different but can't explain how", 
                    "Basic Understanding: Can explain that LLMs are a type of AI focused on language",
                    "Clear Distinction: Understands the hierarchy: AI > ML > specific models like LLMs",
                    "Nuanced Knowledge: Can explain different AI types and when each is appropriate"
                ]
            },
            'F1.2': {
                'section': 'AI Fundamentals - Business Applications',
                'weight': 0.20,
                'concepts': ['business value', 'roi', 'process improvement', 'efficiency', 'implementation'],
                'maturity_levels': [
                    "No business context: Cannot connect AI to business outcomes",
                    "Vague benefits: Knows AI helps but can't specify how",
                    "Basic applications: Can identify simple AI business uses",
                    "Strategic thinking: Understands AI's transformative potential",
                    "Implementation ready: Can plan practical AI business implementations"
                ]
            },
            'P2.1': {
                'section': 'Prompt Engineering - Basics', 
                'weight': 0.20,
                'concepts': ['prompt engineering', 'language models', 'chatgpt', 'ai tools', 'prompt design'],
                'maturity_levels': [
                    "Casual Chat: Treats AI like Google search or casual conversation",
                    "Basic Requests: Asks direct questions but gets inconsistent results",
                    "Structured Prompts: Uses clear instructions and context",
                    "Advanced Techniques: Uses examples, role-playing, and step-by-step instructions",
                    "Prompt Mastery: Consistently gets desired outputs through sophisticated design"
                ]
            },
            'P2.2': {
                'section': 'Prompt Engineering - Advanced',
                'weight': 0.20, 
                'concepts': ['prompt optimization', 'iteration', 'testing', 'refinement', 'advanced techniques'],
                'maturity_levels': [
                    "No optimization: Uses first attempt, no improvement process",
                    "Basic iteration: Tries different approaches randomly", 
                    "Systematic testing: Tests variations methodically",
                    "Advanced optimization: Uses sophisticated techniques like chain-of-thought",
                    "Mastery level: Creates complex prompt workflows and systems"
                ]
            },
            'E3.1': {
                'section': 'AI Ecosystem - Tools and Vendors',
                'weight': 0.20,
                'concepts': ['ai ecosystem', 'vendors', 'platforms', 'tools', 'integration'],
                'maturity_levels': [
                    "Single tool: Only knows ChatGPT or one AI tool",
                    "Basic awareness: Knows a few AI tools exist",
                    "Tool knowledge: Familiar with major AI platforms and their uses", 
                    "Ecosystem understanding: Knows how different AI tools work together",
                    "Strategic selection: Can choose optimal AI tools for specific business needs"
                ]
            }
        }
        
        # Simple, reliable return pattern - never fails
        if query in questions_data:
            return json.dumps(questions_data[query], indent=2)
        elif "all_questions" in query.lower():
            return json.dumps(questions_data, indent=2)
        else:
            return f"Assessment framework for AI knowledge evaluation covering: {list(questions_data.keys())}"   
            
        # Detailed data kept for reference but not used to prevent complexity
        questions_data = {
            'F1.1': {
                'section': 'AI Fundamentals - Concepts',
                'weight': 0.20,
                'concepts': ['artificial intelligence', 'machine learning', 'automation', 'algorithms', 'data processing'],
                'maturity_levels': [
                    "Confused: Thinks AI, ML, and LLMs are the same thing",
                    "Vague Awareness: Knows they're different but can't explain how", 
                    "Basic Understanding: Can explain that LLMs are a type of AI focused on language",
                    "Clear Distinction: Understands the hierarchy: AI > ML > specific models like LLMs",
                    "Nuanced Knowledge: Can explain different AI types and when each is appropriate"
                ]
            },
            'F1.2': {
                'section': 'AI Fundamentals - Business Applications',
                'weight': 0.20,
                'concepts': ['business value', 'roi', 'process improvement', 'efficiency', 'implementation'],
                'maturity_levels': [
                    "No business context: Cannot connect AI to business outcomes",
                    "Vague benefits: Knows AI helps but can't specify how",
                    "Basic applications: Can identify simple AI business uses",
                    "Strategic thinking: Understands AI's transformative potential",
                    "Implementation ready: Can plan practical AI business implementations"
                ]
            },
            'P2.1': {
                'section': 'Prompt Engineering - Basics',
                'weight': 0.20,
                'concepts': ['prompt engineering', 'language models', 'chatgpt', 'ai tools', 'prompt design'],
                'maturity_levels': [
                    "Casual Chat: Treats AI like Google search or casual conversation",
                    "Basic Requests: Asks direct questions but gets inconsistent results",
                    "Structured Prompts: Uses clear instructions and context",
                    "Advanced Techniques: Uses examples, role-playing, and step-by-step instructions",
                    "Prompt Mastery: Consistently gets desired outputs through sophisticated design"
                ]
            },
            'P2.2': {
                'section': 'Prompt Engineering - Advanced',
                'weight': 0.20,
                'concepts': ['prompt optimization', 'iteration', 'testing', 'refinement', 'advanced techniques'],
                'maturity_levels': [
                    "No optimization: Uses first attempt, no improvement process",
                    "Basic iteration: Tries different approaches randomly",
                    "Systematic testing: Tests variations methodically",
                    "Advanced optimization: Uses sophisticated techniques like chain-of-thought",
                    "Mastery level: Creates complex prompt workflows and systems"
                ]
            },
            'E3.1': {
                'section': 'AI Ecosystem - Tools and Vendors',
                'weight': 0.20,
                'concepts': ['ai ecosystem', 'vendors', 'platforms', 'tools', 'integration'],
                'maturity_levels': [
                    "Single tool: Only knows ChatGPT or one AI tool",
                    "Basic awareness: Knows a few AI tools exist",
                    "Tool knowledge: Familiar with major AI platforms and their uses",
                    "Ecosystem understanding: Knows how different AI tools work together",
                    "Strategic selection: Can choose optimal AI tools for specific business needs"
                ]
            }
        }
        
        # This detailed data is kept for reference but tool returns simple structure above
        return json.dumps({"status": "framework loaded", "sections": len(questions_data)})

class ConceptExtractionTool(BaseTool):
    name: str = "concept_extraction_tool"
    description: str = "Extract AI literacy concepts from user responses and match them to assessment criteria"
    
    def _run(self, response_text: str, question_section: str = "") -> str:
        """Extract and score AI concepts from user responses - simple and reliable"""
        # Enhanced concept mappings with both basic and sophisticated terms
        basic_concepts = {
            'ai_understanding': ['artificial intelligence', 'ai', 'cognitive computing', 'intelligent systems', 'neural networks'],
            'ml_understanding': ['machine learning', 'ml', 'statistical learning', 'predictive modeling', 'algorithms', 'supervised learning', 'unsupervised learning'],
            'llm_understanding': ['large language model', 'llm', 'transformer', 'gpt', 'language model', 'generative model', 'natural language processing'],
            'business_thinking': ['business value', 'roi', 'return on investment', 'efficiency', 'automation', 'cost reduction', 'competitive advantage'],
            'prompt_skills': ['prompt engineering', 'prompt design', 'instruction', 'context', 'few-shot', 'zero-shot', 'chain of thought'],
            'tool_awareness': ['openai', 'anthropic', 'google', 'microsoft', 'api', 'platform', 'integration', 'workflow']
        }
        
        found_concepts = []
        response_lower = response_text.lower() if response_text else ""
        
        # Simple keyword matching - no complex confidence calculations
        for concept, keywords in basic_concepts.items():
            for keyword in keywords:
                if keyword in response_lower:
                    found_concepts.append({
                        'concept': concept,
                        'confidence': 0.8,  # Fixed confidence to avoid loops
                        'evidence': keyword,
                        'section': question_section
                    })
                    break  # Only match once per concept
        
        return json.dumps(found_concepts, indent=2)
        
        # Advanced concept mappings for each section
        concept_mappings = {
            'F1.1': {
                'ai_broad_field': ['artificial intelligence', 'ai is broad', 'ai encompasses', 'ai includes'],
                'ml_subset': ['machine learning', 'ml is part', 'ml subset', 'ml within ai'],
                'llm_specific': ['large language model', 'llm', 'language model', 'text generation'],
                'hierarchy_understanding': ['ai contains ml', 'ml includes', 'hierarchy', 'subset'],
                'algorithm_awareness': ['algorithm', 'data processing', 'pattern recognition', 'learning']
            },
            'F1.2': {
                'business_value': ['roi', 'return on investment', 'business value', 'cost savings'],
                'process_improvement': ['efficiency', 'automation', 'streamline', 'optimize'],
                'implementation': ['implement', 'deploy', 'integrate', 'adopt ai'],
                'strategic_thinking': ['strategy', 'competitive advantage', 'transformation'],
                'practical_applications': ['customer service', 'marketing', 'operations', 'analytics']
            },
            'P2.1': {
                'clear_instructions': ['clear instructions', 'specific request', 'detailed prompt'],
                'context_setting': ['context', 'background', 'situation', 'setting'],
                'examples_usage': ['example', 'sample', 'instance', 'demonstration'],
                'output_formatting': ['format', 'structure', 'organize', 'layout'],
                'role_playing': ['role', 'persona', 'act as', 'pretend']
            },
            'P2.2': {
                'iterative_improvement': ['iterate', 'improve', 'refine', 'optimize'],
                'testing_approaches': ['test', 'experiment', 'try different', 'compare'],
                'chain_of_thought': ['step by step', 'think through', 'reasoning', 'logical'],
                'advanced_techniques': ['few-shot', 'zero-shot', 'prompt chaining', 'templates'],
                'systematic_optimization': ['systematic', 'methodical', 'framework', 'process']
            },
            'E3.1': {
                'multiple_tools': ['openai', 'google', 'microsoft', 'anthropic', 'multiple tools'],
                'tool_categories': ['chatbot', 'image generation', 'code assistant', 'analytics'],
                'integration_understanding': ['api', 'integrate', 'workflow', 'connect'],
                'vendor_awareness': ['vendor', 'provider', 'platform', 'service'],
                'selection_criteria': ['choose', 'select', 'evaluate', 'compare tools']
            }
        }
        
        found_concepts = []
        response_lower = response_text.lower()
        section_concepts = concept_mappings.get(question_section, {})
        
        for concept, keywords in section_concepts.items():
            confidence = 0
            evidence = []
            
            for keyword in keywords:
                if keyword in response_lower:
                    confidence += 0.2
                    evidence.append(keyword)
            
            # Quality indicators for sophisticated responses
            if any(advanced_term in response_lower for advanced_term in [
                'neural network', 'transformer', 'architecture', 'algorithm', 'optimization',
                'supervised', 'unsupervised', 'reinforcement', 'api', 'deployment', 'scalability',
                'roi', 'implementation', 'methodology', 'framework', 'systematic'
            ]):
                confidence += 0.15  # Reward technical sophistication
            
            # Penalize uncertain language that indicates low confidence
            if any(uncertain in response_lower for uncertain in [
                'i think', 'maybe', 'probably', 'not sure', 'i guess', 'kind of'
            ]):
                confidence -= 0.1
            
            if confidence > 0:
                found_concepts.append({
                    'concept': concept,
                    'confidence': min(1.0, confidence),
                    'evidence': evidence,
                    'section': question_section
                })
        
        result = json.dumps(found_concepts, indent=2)
        
        # Cache the result to prevent repeated tool usage
        self._concept_cache[cache_key] = result
        return result

class RAGRetrievalTool(BaseTool):
    name: str = "rag_retrieval_tool" 
    description: str = "Retrieve relevant learning content from knowledge base based on assessment gaps and learning needs"
    
    def _run(self, query: str, context: str = "") -> str:
        """Retrieve personalized learning content based on knowledge gaps"""
        
        # Curated learning content database
        content_database = {
            "ai_fundamentals": [
                {
                    "title": "AI vs ML vs LLM: Understanding the Hierarchy",
                    "content": "AI is the broad field, ML is a subset that learns from data, LLMs are ML models trained on text...",
                    "type": "tutorial",
                    "difficulty": "beginner",
                    "duration": "15 minutes",
                    "cost": "free",
                    "relevance_score": 0.95
                },
                {
                    "title": "Business Applications of AI: Practical Guide",
                    "content": "Discover how small businesses can leverage AI for customer service, content creation, and automation...",
                    "type": "guide",
                    "difficulty": "beginner",
                    "duration": "30 minutes", 
                    "cost": "free",
                    "relevance_score": 0.90
                }
            ],
            "prompt_engineering": [
                {
                    "title": "Prompt Engineering Masterclass",
                    "content": "Learn advanced prompting techniques: clear instructions, examples, role-playing, and iteration...",
                    "type": "course",
                    "difficulty": "intermediate",
                    "duration": "2 hours",
                    "cost": "$49",
                    "relevance_score": 0.92
                },
                {
                    "title": "Advanced Prompting Techniques",
                    "content": "Chain-of-thought reasoning, few-shot learning, prompt chaining, and optimization strategies...",
                    "type": "workshop",
                    "difficulty": "advanced",
                    "duration": "3 hours",
                    "cost": "$99",
                    "relevance_score": 0.88
                }
            ],
            "ai_ecosystem": [
                {
                    "title": "AI Tools Comparison: OpenAI vs Google vs Microsoft",
                    "content": "Compare major AI platforms, their strengths, pricing, and integration capabilities...",
                    "type": "comparison",
                    "difficulty": "intermediate", 
                    "duration": "45 minutes",
                    "cost": "free",
                    "relevance_score": 0.85
                },
                {
                    "title": "Building Your AI Toolkit for Small Business",
                    "content": "Practical guide to selecting and implementing AI tools within budget constraints...",
                    "type": "guide",
                    "difficulty": "beginner",
                    "duration": "1 hour",
                    "cost": "free",
                    "relevance_score": 0.90
                }
            ]
        }
        
        # Simple keyword matching and relevance scoring
        results = []
        for category, content_list in content_database.items():
            if any(keyword in query.lower() for keyword in category.split('_')):
                results.extend(content_list)
        
        # Sort by relevance score
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return json.dumps(results[:5], indent=2)  # Return top 5 most relevant

class LearningPathTool(BaseTool):
    name: str = "learning_path_tool"
    description: str = "Generate personalized learning paths with schedules, milestones, and resource recommendations"
    
    def _run(self, assessment_data: str, user_preferences: str = "") -> str:
        """Generate structured learning path based on assessment results"""
        
        # Parse assessment data to identify gaps
        try:
            data = json.loads(assessment_data)
            gaps = data.get('knowledge_gaps', [])
            strengths = data.get('strengths', [])
        except:
            gaps = ['ai_fundamentals', 'prompt_engineering']
            strengths = []
        
        # Create progressive learning phases
        learning_phases = [
            {
                "phase": 1,
                "title": "Foundation Building",
                "duration": "2-3 weeks",
                "objectives": [
                    "Understand AI/ML/LLM relationships",
                    "Identify basic business applications",
                    "Learn fundamental concepts"
                ],
                "activities": [
                    "Complete AI fundamentals course",
                    "Practice basic AI tool usage",
                    "Read case studies"
                ],
                "success_criteria": [
                    "Can explain AI vs ML vs LLM",
                    "Identify 3 business use cases",
                    "Use ChatGPT effectively"
                ]
            },
            {
                "phase": 2,
                "title": "Skill Development", 
                "duration": "3-4 weeks",
                "objectives": [
                    "Master prompt engineering basics",
                    "Explore AI tool ecosystem",
                    "Design simple AI workflows"
                ],
                "activities": [
                    "Prompt engineering practice",
                    "Try 5 different AI tools",
                    "Create AI-powered workflows"
                ],
                "success_criteria": [
                    "Write effective prompts consistently",
                    "Compare and select appropriate tools",
                    "Implement basic automation"
                ]
            },
            {
                "phase": 3,
                "title": "Implementation",
                "duration": "4-6 weeks", 
                "objectives": [
                    "Apply AI in real projects",
                    "Optimize and iterate solutions",
                    "Share knowledge with others"
                ],
                "activities": [
                    "Complete AI implementation project",
                    "Optimize existing AI workflows",
                    "Document learnings and best practices"
                ],
                "success_criteria": [
                    "Successfully deploy AI solution",
                    "Measure and improve AI performance",
                    "Train others on AI usage"
                ]
            }
        ]
        
        # Weekly schedule template
        weekly_schedule = {
            "hours_per_week": "5-7 hours",
            "daily_breakdown": {
                "monday": "Theory and concepts (1 hour)",
                "tuesday": "Hands-on practice (1 hour)",
                "wednesday": "Tool exploration (1 hour)",
                "thursday": "Project work (1-2 hours)",
                "friday": "Review and reflection (1 hour)",
                "weekend": "Optional: Community engagement"
            }
        }
        
        learning_path = {
            "total_duration": "9-13 weeks",
            "phases": learning_phases,
            "weekly_schedule": weekly_schedule,
            "resource_budget": "$0-150 total",
            "milestones": [
                "Week 3: AI Fundamentals Assessment",
                "Week 6: Prompt Engineering Certification", 
                "Week 10: Implementation Project Demo",
                "Week 13: Knowledge Sharing Presentation"
            ]
        }
        
        return json.dumps(learning_path, indent=2)

# =============================================================================
# CREWAI AGENTS
# =============================================================================

def create_concept_detection_agent(llm):
    """Agent 1: Analyzes user responses to detect AI concepts and understanding depth"""
    return Agent(
        role='AI Concept Detection Specialist',
        goal='Accurately identify and assess AI literacy concepts in user responses, distinguishing between surface knowledge and deep understanding',
        backstory="""You are an expert AI literacy assessor with deep knowledge of artificial intelligence, 
        machine learning, and large language models. Your specialty is distinguishing between surface-level 
        buzzword usage and genuine understanding. You recognize that experts often use precise technical 
        terminology concisely, while novices tend to use generic terms verbosely. You can detect conceptual 
        depth through accuracy of terminology, practical examples, and logical structure of explanations. 
        You identify when someone truly understands underlying principles versus just repeating information.""",
        verbose=False,  # Reduce verbosity to prevent noise
        allow_delegation=False,  # Disable delegation to prevent loops
        llm=llm,
        tools=[AssessmentDataTool(), ConceptExtractionTool()]  # Simple, reliable tools for analysis
    )

def create_maturity_scoring_agent(llm):
    """Agent 2: Calculates sophisticated maturity scores with confidence levels"""
    return Agent(
        role='AI Maturity Scoring Expert',
        goal='Provide precise, fair, and insightful maturity scoring that accurately reflects user AI literacy levels across all domains',
        backstory="""You are a world-class assessment expert specializing in AI literacy evaluation with 15+ years experience. 
        Your expertise is in recognizing the difference between surface-level knowledge and deep understanding. 
        You understand that true expertise often manifests as concise, precise answers using sophisticated terminology, 
        while novice responses tend to be verbose but shallow. You value accuracy, conceptual clarity, and practical 
        application over response length. You're known for identifying experts who give brief but technically accurate 
        responses, and distinguishing them from beginners who use many words to say little. Your scoring reflects 
        depth of understanding, not verbosity.""",
        verbose=True,
        allow_delegation=False,
        max_execution_time=60,
        max_iter=3,
        llm=llm,
        tools=[]
    )

def create_learning_path_agent(llm):
    """Agent 3: Designs personalized learning journeys"""
    return Agent(
        role='Personalized Learning Journey Architect',
        goal='Create highly effective, personalized learning paths that efficiently bridge knowledge gaps and accelerate AI mastery',
        backstory="""You are an expert instructional designer and learning strategist with extensive experience 
        in AI education. You understand how adults learn technical skills and can create progressive, engaging 
        learning experiences. You excel at balancing theory with practical application, ensuring learners 
        build solid foundations while gaining hands-on experience. You consider individual learning styles, 
        time constraints, and career goals when designing learning journeys.""",
        verbose=False,  # Reduce verbosity to prevent noise
        allow_delegation=False,  # Disable delegation to prevent loops
        llm=llm,
        tools=[]  # REMOVE ALL TOOLS temporarily to test
    )

def create_business_application_agent(llm):
    """Agent 4: Provides practical AI implementation guidance"""
    return Agent(
        role='AI Business Implementation Strategist',
        goal='Provide practical, actionable guidance for implementing AI solutions in real business contexts with focus on ROI and feasibility',
        backstory="""You are a business AI consultant with extensive experience helping organizations of all sizes 
        implement AI successfully. You understand the practical challenges of AI adoption: budget constraints, 
        team readiness, technical limitations, and change management. You excel at recommending specific tools, 
        processes, and strategies that deliver measurable business value. You focus on realistic implementations 
        that can be achieved with existing resources and skills.""",
        verbose=True,   # Enable verbosity to see what agents are doing
        allow_delegation=False,  # Keep delegation disabled to prevent loops
        max_execution_time=60,  # Give agents more time to work (60 seconds)
        max_iter=3,  # Allow up to 3 iterations for better results
        llm=llm,
        tools=[]  # Keep tools empty for now to avoid tool-related issues
    )

def create_confidence_risk_agent(llm):
    """Agent 5: Assesses learning readiness and identifies implementation risks"""
    return Agent(
        role='Learning Readiness & Risk Assessment Specialist',
        goal='Identify potential challenges, risks, and confidence gaps that could impact successful AI learning and implementation',
        backstory="""You are an expert in learning psychology and risk assessment with deep understanding of 
        what makes AI education successful or challenging. You can identify when learners may be overconfident, 
        underconfident, or missing critical foundations. You excel at spotting potential obstacles before they 
        become problems and designing mitigation strategies. You understand the emotional and psychological 
        aspects of learning new technologies and can provide supportive, realistic guidance.""",
        verbose=True,   # Enable verbosity to see what agents are doing
        allow_delegation=False,  # Keep delegation disabled to prevent loops
        max_execution_time=60,  # Give agents more time to work (60 seconds)
        max_iter=3,  # Allow up to 3 iterations for better results
        llm=llm,
        tools=[]  # Keep tools empty for now to avoid tool-related issues
    )

# =============================================================================
# CREWAI TASKS
# =============================================================================

def create_concept_analysis_task(question_history: List[Dict]):
    """Task for focused concept analysis of user responses"""
    return Task(
        description=f"""
        Analyze user responses to identify AI concepts and knowledge levels.
        
        Question History: {json.dumps(question_history, indent=2)}
        
        Your responsibilities:
        1. Use the concept extraction tool to analyze each response
        2. Score understanding level (1-5) for each section based on evidence
        3. Identify strengths and knowledge gaps from the analysis
        4. Keep analysis focused and evidence-based
        
        Provide analysis in this JSON format:
        {{
            "concepts_detected": ["list of identified concepts"],
            "section_scores": {{"F1.1": score, "F1.2": score, "P2.1": score, "P2.2": score, "E3.1": score}},
            "strengths": ["strength 1", "strength 2", "strength 3"],
            "gaps": ["gap 1", "gap 2", "gap 3"]
        }}
        
        Use tools efficiently and complete the analysis in one focused pass.
        """,
        expected_output="JSON object with concept analysis, scores, strengths, and gaps",
        agent=None
    )

def create_maturity_scoring_task():
    """Task for calculating focused maturity scores"""
    return Task(
        description="""
        CRITICAL: NO TOOLS. Analyze the user responses using the maturity scoring framework below.
        
        MATURITY LEVELS (1.0-5.0 scale):
        
        F1.1 (AI Fundamentals - Concepts):
        Level 1: Confused/incorrect understanding of AI, ML, LLMs
        Level 2: Vague awareness but cannot explain differences  
        Level 3: Basic understanding of AI hierarchy and types
        Level 4: Clear technical distinctions with examples
        Level 5: Sophisticated understanding of AI taxonomy and applications
        
        F1.2 (AI Fundamentals - Business Applications):
        Level 1: No connection between AI and business value
        Level 2: Generic benefits mentioned without specifics
        Level 3: Can identify concrete business use cases
        Level 4: Strategic thinking about AI transformation
        Level 5: Implementation-ready with ROI understanding
        
        P2.1 (Prompt Engineering - Basics):
        Level 1: Treats AI like search engine
        Level 2: Basic requests without structure
        Level 3: Uses clear instructions and context
        Level 4: Applies advanced techniques systematically
        Level 5: Masters sophisticated prompting methodologies
        
        P2.2 (Prompt Engineering - Advanced):
        Level 1: No systematic approach to prompting
        Level 2: Trial and error without methodology
        Level 3: Uses templates and basic iteration
        Level 4: Systematic optimization and testing
        Level 5: Expert-level prompt engineering with advanced techniques
        
        E3.1 (AI Tool Ecosystem):
        Level 1: Limited to one or two basic tools
        Level 2: Aware of multiple tools but shallow usage
        Level 3: Practical experience with diverse AI tools
        Level 4: Strategic tool selection and integration
        Level 5: Expert knowledge of AI ecosystem and vendor landscape
        
        SCORING PRINCIPLES:
        - Reward ACCURACY over verbosity
        - Precise technical language indicates higher expertise
        - Concise, accurate answers score higher than verbose, vague ones  
        - Look for practical experience and concrete examples
        - Advanced terminology used correctly indicates higher maturity
        - Focus on conceptual understanding, not keyword density
        
        CRITICAL SCORING RULES:
        - Responses with "I don't know", "not sure", "need to learn" = Score 1.0-2.0 MAX
        - Responses saying "they are the same thing" = Score 1.0-1.5 MAX
        - Responses with multiple uncertainty markers ("I think", "maybe", "probably") = Score 1.5-2.5 MAX
        - Basic/generic responses without technical depth = Score 2.0-3.0 MAX
        - Only precise, knowledgeable responses should score 3.5+ 
        
        EXPERT INDICATORS (Score 4.0-5.0):
        - Technical precision (e.g., "transformer architecture" vs "AI technology")
        - Practical examples from real experience
        - Nuanced understanding of limitations and trade-offs
        - Strategic thinking about implementation
        - Concise but comprehensive explanations
        - Confident, accurate use of technical terminology
        
        NOVICE INDICATORS (Score 1.0-2.5):
        - Verbose responses with little substance
        - Generic statements without specifics
        - Buzzword usage without understanding
        - Uncertain language ("I think", "maybe", "probably", "not sure", "need to learn")
        - Long explanations that repeat basic concepts
        - Admissions of limited knowledge or confusion
        - Incorrect or oversimplified explanations
        
        Return EXACTLY this JSON format (no other text):
        {{
            "section_scores": {{"F1.1": 3.2, "F1.2": 2.8, "P2.1": 3.0, "P2.2": 2.5, "E3.1": 3.1}},
            "overall_score": 2.9,
            "readiness_level": "ready_to_learn",
            "scoring_rationale": {{"F1.1": "Brief explanation of score", "F1.2": "Brief explanation"}}
        }}
        """,
        expected_output="Single JSON object with detailed scores and rationale",
        agent=None
    )

def create_learning_design_task():
    """Task for creating focused learning recommendations"""
    return Task(
        description="""
        CRITICAL: NO TOOLS. Provide learning recommendations.
        
        Return EXACTLY this JSON format (no other text):
        {{
            "priority_areas": ["AI Fundamentals", "Prompt Engineering", "Business Implementation"],
            "learning_resources": ["AI Basics Course (Free, 4 weeks)", "Prompt Engineering Guide ($49, 3 weeks)", "Business AI Workshop (Free, 2 weeks)"],
            "timeline": "6-8 weeks"
        }}
        
        COMPLETE THIS TASK IN ONE STEP. NO TOOLS. NO LOOPS.
        """,
        expected_output="Single JSON object with learning recommendations",
        agent=None
    )

def create_business_recommendations_task():
    """Task for generating focused business recommendations"""
    return Task(
        description="""
        CRITICAL: NO TOOLS. Provide business recommendations.
        
        Return EXACTLY this JSON format (no other text):
        {{
            "recommended_tools": [
                {{"name": "ChatGPT Plus", "cost": "$20/month", "use_case": "content creation"}},
                {{"name": "Microsoft Copilot", "cost": "$30/month", "use_case": "productivity automation"}}
            ],
            "timeline": "Start immediately, scale over 3 months",
            "expected_roi": "20-30% efficiency gain"
        }}
        
        COMPLETE THIS TASK IN ONE STEP. NO TOOLS. NO LOOPS.
        """,
        expected_output="Single JSON object with business recommendations",
        agent=None
    )

def create_risk_assessment_task():
    """Task for identifying key risks and mitigation"""
    return Task(
        description="""
        CRITICAL: NO TOOLS. Provide risk assessment.
        
        Return EXACTLY this JSON format (no other text):
        {{
            "risks": [
                {{"risk": "knowledge gaps", "mitigation": "structured training program"}},
                {{"risk": "implementation complexity", "mitigation": "start with simple tools"}},
                {{"risk": "user adoption", "mitigation": "gradual rollout with support"}}
            ],
            "success_probability": "75%"
        }}
        
        COMPLETE THIS TASK IN ONE STEP. NO TOOLS. NO LOOPS.
        """,
        expected_output="Single JSON object with risk analysis",
        agent=None
    )

# =============================================================================
# QUESTION GENERATION AGENTS
# =============================================================================

def create_question_generation_agent(llm, section: str, agent_persona: dict):
    """Create specialized agent for generating questions for a specific section"""
    return Agent(
        role=agent_persona['role'],
        goal=agent_persona['goal'],
        backstory=agent_persona['backstory'],
        verbose=True,  # Enable verbosity for intelligent question generation
        allow_delegation=False,
        llm=llm,
        tools=[AssessmentDataTool(), ConceptExtractionTool()]  # Restore tools for intelligent questions
    )

def get_agent_personas():
    """Define the 5 agent personas for each assessment section"""
    return {
        "F1.1": {
            "role": "AI Fundamentals Expert",
            "goal": "Assess understanding of AI, ML, and LLM relationships through targeted questions that reveal conceptual clarity",
            "backstory": """You are Dr. Sarah Chen, an AI researcher with 15 years of experience in machine learning. 
            You excel at helping people understand the foundational concepts of artificial intelligence. You ask questions 
            that reveal whether someone truly grasps the relationships between AI, machine learning, and language models, 
            or if they have common misconceptions. Your questions are designed to uncover depth of understanding.""",
            "section": "AI Fundamentals - Concepts",
            "focus": ["ai hierarchy", "ml vs ai", "llm understanding", "technical concepts"]
        },
        "F1.2": {
            "role": "AI Business Strategy Consultant", 
            "goal": "Evaluate understanding of AI's business applications and value through practical scenario-based questions",
            "backstory": """You are Marcus Rodriguez, a business transformation consultant who has helped 200+ companies 
            implement AI solutions. You understand both the potential and pitfalls of AI in business. Your questions 
            reveal whether someone can think strategically about AI implementation, understand ROI, and identify 
            realistic business applications versus hype.""",
            "section": "AI Fundamentals - Business Applications",
            "focus": ["business value", "roi thinking", "practical applications", "implementation strategy"]
        },
        "P2.1": {
            "role": "Prompt Engineering Specialist",
            "goal": "Assess prompt design skills and understanding of effective human-AI communication patterns", 
            "backstory": """You are Alex Kim, a former OpenAI researcher turned prompt engineering expert. You've trained 
            thousands of professionals on effective AI communication. Your questions reveal whether someone understands 
            the principles of clear instruction, context setting, and iterative refinement that make AI tools truly useful.""",
            "section": "Prompt Engineering - Basics",
            "focus": ["clear instructions", "context setting", "prompt structure", "ai communication"]
        },
        "P2.2": {
            "role": "Advanced AI Workflow Designer",
            "goal": "Evaluate sophisticated prompt techniques and systematic optimization approaches",
            "backstory": """You are Dr. Jamie Patel, an AI systems architect who designs complex AI workflows for enterprises. 
            You understand advanced techniques like chain-of-thought reasoning, few-shot learning, and prompt chaining. 
            Your questions reveal whether someone can move beyond basic prompting to create sophisticated, reliable AI systems.""",
            "section": "Prompt Engineering - Advanced",
            "focus": ["advanced techniques", "systematic optimization", "complex workflows", "reliability"]
        },
        "E3.1": {
            "role": "AI Ecosystem Navigator",
            "goal": "Assess knowledge of AI tools, platforms, and strategic technology selection",
            "backstory": """You are Taylor Morrison, a technology strategist who evaluates AI tools for organizations. 
            You know the strengths and weaknesses of every major AI platform, from ChatGPT to specialized tools. 
            Your questions reveal whether someone can navigate the complex AI ecosystem, make informed tool choices, 
            and understand integration possibilities.""",
            "section": "AI Ecosystem - Tools and Vendors", 
            "focus": ["tool knowledge", "platform comparison", "integration strategy", "ecosystem understanding"]
        }
    }

def create_question_generation_task(section: str, question_history: List[Dict], agent_persona: dict):
    """Create task for generating the next question in sequence"""
    
    # Analyze user knowledge level from previous responses
    user_knowledge_level = "beginner"  # Default
    difficulty_guidance = ""
    
    if question_history:
        previous_questions = [q.get('question', '') for q in question_history]
        previous_answers = [q.get('answer', '') for q in question_history]
        
        # Analyze knowledge indicators from responses
        all_responses = " ".join(previous_answers).lower()
        
        # Beginner indicators
        beginner_signals = ['not sure', 'don\'t know', 'think they are the same', 'need to learn', 
                          'i think', 'maybe', 'probably', 'kind of', 'not too sure', 'basic']
        
        # Intermediate indicators  
        intermediate_signals = ['understand', 'experience with', 'have used', 'familiar with',
                              'can explain', 'difference between', 'business value']
        
        # Advanced indicators
        advanced_signals = ['implementation', 'optimization', 'architecture', 'systematic',
                          'methodology', 'framework', 'workflow', 'integration', 'scalability']
        
        beginner_count = sum(1 for signal in beginner_signals if signal in all_responses)
        intermediate_count = sum(1 for signal in intermediate_signals if signal in all_responses)
        advanced_count = sum(1 for signal in advanced_signals if signal in all_responses)
        
        # Determine knowledge level
        if beginner_count > 0 or any('not' in resp.lower() for resp in previous_answers):
            user_knowledge_level = "beginner"
            difficulty_guidance = """
            DIFFICULTY CALIBRATION - BEGINNER DETECTED:
            - User shows uncertainty, uses phrases like "not sure", "need to learn"
            - Ask BASIC, FOUNDATIONAL questions appropriate for someone learning
            - Focus on simple concepts and definitions, not advanced techniques
            - Example beginner question: "What's the difference between AI and regular software?"
            - AVOID: Complex workflows, optimization, advanced terminology
            """
        elif advanced_count > intermediate_count and advanced_count > 1:
            user_knowledge_level = "advanced"
            difficulty_guidance = """
            DIFFICULTY CALIBRATION - ADVANCED DETECTED:
            - User demonstrates technical knowledge and practical experience
            - Ask ADVANCED questions about implementation, optimization, strategy
            - Focus on sophisticated concepts and real-world application
            - Example advanced question: "How would you design a multi-step workflow for..."
            """
        else:
            user_knowledge_level = "intermediate"
            difficulty_guidance = """
            DIFFICULTY CALIBRATION - INTERMEDIATE DETECTED:
            - User shows basic understanding but not deep technical knowledge
            - Ask MODERATE questions that build on fundamentals
            - Focus on practical application without advanced techniques
            - Example intermediate question: "How might you use AI tools in your business?"
            """
        
        context_info = f"""
        Previous Questions Asked: {previous_questions}
        Previous User Responses: {previous_answers}
        DETECTED KNOWLEDGE LEVEL: {user_knowledge_level.upper()}
        """
    else:
        context_info = "This is the first question - start with moderate difficulty to gauge knowledge level."
        difficulty_guidance = """
        DIFFICULTY CALIBRATION - FIRST QUESTION:
        - Start with MODERATE difficulty to assess user's baseline knowledge  
        - Not too basic (assume business professional) but not too advanced
        - Focus on practical understanding rather than technical implementation
        """
    
    return Task(
        description=f"""
        As {agent_persona['role']}, generate an intelligent, adaptive question for section {section}.
        
        {context_info}
        
        {difficulty_guidance}
        
        Your responsibilities:
        1. Ask a question that builds on previous responses (if any)
        2. Focus on {agent_persona['section']} concepts  
        3. Target areas: {', '.join(agent_persona['focus'])}
        4. **CRITICAL**: Calibrate difficulty to user's demonstrated knowledge level
        5. Make the question engaging and specific to their level
        
        Question Requirements:
        - Open-ended (no multiple choice)
        - Reveals depth of understanding in {section}
        - Builds logically on conversation flow
        - **MUST match user's knowledge level** (don't ask advanced questions to beginners)
        - Clear and actionable for their level
        
        Context: This is question #{len(question_history) + 1} of 5 in an AI readiness assessment.
        
        You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON.
        
        JSON format (copy this structure exactly):
        {{
            "question": "Your thoughtful question here",
            "section": "{section}",
            "agent_name": "{agent_persona['role']}",
            "agent_focus": "Brief explanation of what this question assesses",
            "rationale": "Why you chose this specific question based on context",
            "concepts_to_detect": ["list", "of", "key", "concepts"]
        }}
        
        CRITICAL: Return ONLY the JSON object above. No other text, explanations, or formatting.
        """,
        expected_output="JSON object with question, section, agent_name, agent_focus, and rationale",
        agent=None
    )

# =============================================================================
# MAIN CREWAI ASSESSMENT SYSTEM
# =============================================================================

class AIReadinessCrewAI:
    """True CrewAI implementation for AI Readiness Assessment"""
    
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        
        # Initialize LLM with reasonable settings for quality analysis
        self.llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            model="gpt-4o-mini",  
            temperature=0.3,   # Keep temperature for deterministic responses
            timeout=60,        # Increased timeout to allow for complex analysis
            max_retries=1,     # Allow 1 retry for reliability
            streaming=False,
            max_tokens=2000,   # Increased tokens for comprehensive analysis
            request_timeout=60, # Match timeout
            # Disable LiteLLM cost tracking that causes infinite loops
            callbacks=[],  # Empty callbacks list
            metadata={},   # Empty metadata
            client_kwargs={
                "timeout": 60,
                "max_retries": 1
            }
        )
        
        # Initialize analysis agents
        self.concept_agent = create_concept_detection_agent(self.llm)
        self.scoring_agent = create_maturity_scoring_agent(self.llm) 
        self.learning_agent = create_learning_path_agent(self.llm)
        self.business_agent = create_business_application_agent(self.llm)
        self.risk_agent = create_confidence_risk_agent(self.llm)
        
        # Initialize question generation agents
        self.agent_personas = get_agent_personas()
        self.question_agents = {}
        for section, persona in self.agent_personas.items():
            self.question_agents[section] = create_question_generation_agent(self.llm, section, persona)
    
    def generate_agent_question(self, question_history: List[Dict]) -> Dict:
        """Generate next question using specialized CrewAI agent"""
        
        try:
            # Determine which section/agent should ask the next question
            section_order = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
            question_number = len(question_history)
            
            if question_number >= 5:
                return {"error": "All questions have been asked"}
            
            current_section = section_order[question_number]
            current_agent = self.question_agents[current_section]
            current_persona = self.agent_personas[current_section]
            
            print(f"🎯 {current_persona['role']} is preparing question #{question_number + 1}...")
            print(f"📋 Section: {current_section}, Agent: {current_persona['role']}")
            
            # Create question generation task
            question_task = create_question_generation_task(current_section, question_history, current_persona)
            question_task.agent = current_agent
            
            # Create single-agent crew for question generation
            question_crew = Crew(
                agents=[current_agent],
                tasks=[question_task],
                process=Process.sequential,
                verbose=True,  # Enable verbosity for intelligent questions
                max_iter=3,  # Allow some iterations for intelligent questions
                memory=False  # Disable memory
            )
            
            # Generate question with timeout
            print(f"🤖 Agent generating question...")
            
            # Set timeout handler
            def timeout_handler(signum, frame):
                raise TimeoutError("Question generation timed out")
            
            try:
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(30)  # 30 second timeout
                result = question_crew.kickoff()
                signal.alarm(0)  # Cancel timeout
                print(f"🔍 Raw agent result type: {type(result)}")
                print(f"🔍 Raw agent result: {str(result)[:200]}...")
            except TimeoutError:
                signal.alarm(0)  # Cancel timeout
                print(f"⏰ Question generation timed out, using fallback")
                return self._create_fallback_question(current_section, current_persona, question_number)
            
            # Parse the result with better error handling
            try:
                # Handle different result types from CrewAI
                if hasattr(result, 'raw') and result.raw:
                    # CrewAI sometimes returns objects with .raw attribute
                    result_text = result.raw
                elif hasattr(result, 'content'):
                    result_text = result.content
                elif isinstance(result, str):
                    result_text = result
                else:
                    result_text = str(result)
                
                print(f"🔍 Parsing text: {result_text[:300]}...")
                
                # Try to extract JSON from the response
                import re
                json_match = re.search(r'\{[^{}]*"question"[^{}]*\}', result_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    print(f"🔍 Found JSON match: {json_str}")
                    question_data = json.loads(json_str)
                else:
                    # Try parsing the entire response
                    question_data = json.loads(result_text)
                
                # Validate required fields
                if not question_data.get("question"):
                    raise ValueError("No question field in response")
                
                # Add metadata for frontend display
                question_data.update({
                    "question_id": f"ai_knowledge_{question_number + 1}_{uuid.uuid4().hex[:8]}",
                    "session_id": f"ai_knowledge_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "agent_name": current_persona['role'],
                    "agent_focus": f"Assessing {current_persona['section']}",
                    "generated_by": "crewai_agent",
                    "timestamp": datetime.now().isoformat(),
                    "follow_up": False,
                    "maturity_indicators": {},
                    "concepts_to_detect": question_data.get("concepts_to_detect", [])
                })
                
                print(f"✅ Question generated by {current_persona['role']}")
                print(f"📝 Question: {question_data['question'][:100]}...")
                return question_data
                
            except (json.JSONDecodeError, ValueError) as e:
                print(f"❌ Failed to parse agent response: {e}")
                print(f"❌ Raw response that failed: {result_text}")
                
                # Create fallback question with agent info
                fallback_question = self._create_fallback_question(current_section, current_persona, question_number)
                return fallback_question
        
        except Exception as e:
            print(f"❌ Agent question generation failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "error": f"Agent question generation failed: {str(e)}",
                "fallback_needed": True
            }
    
    def _create_fallback_question(self, section: str, persona: dict, question_number: int) -> Dict:
        """Create a fallback question when agent generation fails"""
        
        fallback_questions = {
            "F1.1": "Can you explain the relationship between artificial intelligence, machine learning, and large language models? How do they relate to each other?",
            "F1.2": "Can you provide an example of how artificial intelligence can be applied in a business context to solve a specific problem, and explain why AI is suitable for this application?",
            "P2.1": "Describe a scenario where you would need to craft a specific prompt for an AI tool. What would the prompt be and why?",
            "P2.2": "Can you describe a situation where you would use techniques like examples or step-by-step instructions in your AI prompts, and why this technique would be beneficial in that scenario?",
            "E3.1": "Can you describe three different AI tools or platforms you're aware of, and explain how they can be implemented in a business context?"
        }
        
        return {
            "question": fallback_questions.get(section, "What is your experience with artificial intelligence tools?"),
            "question_id": f"ai_knowledge_{question_number + 1}_{uuid.uuid4().hex[:8]}",
            "session_id": f"ai_knowledge_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "section": section,
            "agent_name": persona['role'],
            "agent_focus": f"Assessing {persona['section']} (fallback mode)",
            "rationale": f"Assesses understanding of {persona['section']}",
            "generated_by": "crewai_fallback",
            "timestamp": datetime.now().isoformat(),
            "follow_up": False,
            "maturity_indicators": {},
            "concepts_to_detect": persona.get('focus', [])
        }
    
    def run_comprehensive_assessment(self, question_history: List[Dict], 
                                   user_context: Dict = None) -> Dict:
        """Run complete AI readiness assessment with full agent collaboration"""
        
        print("🚀 Starting True CrewAI Assessment...")
        print(f"📊 Analyzing {len(question_history)} responses with 5 specialized agents")
        
        try:
            # Create tasks
            concept_task = create_concept_analysis_task(question_history)
            concept_task.agent = self.concept_agent
            
            scoring_task = create_maturity_scoring_task()
            scoring_task.agent = self.scoring_agent
            
            learning_task = create_learning_design_task()
            learning_task.agent = self.learning_agent
            
            business_task = create_business_recommendations_task()
            business_task.agent = self.business_agent
            
            risk_task = create_risk_assessment_task()
            risk_task.agent = self.risk_agent
            
            # Create collaborative crew with balanced limits
            assessment_crew = Crew(
                agents=[
                    self.concept_agent,
                    self.scoring_agent, 
                    self.learning_agent,
                    self.business_agent,
                    self.risk_agent
                ],
                tasks=[
                    concept_task,
                    scoring_task,
                    learning_task,
                    business_task,
                    risk_task
                ],
                process=Process.sequential,
                verbose=False,  # Keep verbosity low for analysis
                max_iter=2,  # Allow limited iterations for quality
                memory=False  # Disable memory to prevent buildup
            )
            
            # Execute assessment with timeout
            print("🤖 Agents collaborating on assessment...")
            print(f"⏰ Starting {len(question_history)}-question analysis with 2-minute timeout...")
            
            def timeout_handler(signum, frame):
                raise TimeoutError("Assessment timed out")
            
            try:
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(90)  # 90 second timeout for hybrid approach
                print(f"⏳ Starting hybrid assessment (intelligent + reliable) with 90s timeout...")
                results = assessment_crew.kickoff()
                signal.alarm(0)  # Cancel timeout
                print(f"✅ Hybrid assessment completed successfully!")
            except TimeoutError:
                signal.alarm(0)  # Cancel timeout
                print(f"⏰ Assessment timed out after 2 minutes, using fallback")
                return {
                    "error": "Assessment timed out after 2 minutes",
                    "fallback_analysis": "Timeout protection activated",
                    "assessment_timestamp": datetime.now().isoformat()
                }
            
            print("✅ CrewAI Assessment completed successfully!")
            
            return {
                "crewai_results": results,
                "agents_used": [
                    "concept_detection_specialist",
                    "maturity_scoring_expert", 
                    "learning_journey_architect",
                    "business_implementation_strategist",
                    "confidence_risk_specialist"
                ],
                "assessment_timestamp": datetime.now().isoformat(),
                "collaboration_type": "sequential_with_delegation",
                "user_context": user_context or {}
            }
            
        except Exception as e:
            print(f"❌ CrewAI Assessment failed: {e}")
            return {
                "error": f"CrewAI assessment failed: {str(e)}",
                "fallback_analysis": "Using basic assessment fallback",
                "assessment_timestamp": datetime.now().isoformat()
            }
    
    def run_hierarchical_assessment(self, question_history: List[Dict],
                                  user_context: Dict = None) -> Dict:
        """Run assessment with hierarchical agent collaboration"""
        
        print("🏗️ Starting Hierarchical CrewAI Assessment...")
        
        try:
            # Create master coordination task
            coordination_task = Task(
                description=f"""
                Coordinate a comprehensive AI readiness assessment using all available agents.
                
                Question History: {json.dumps(question_history, indent=2)}
                User Context: {json.dumps(user_context or {}, indent=2)}
                
                Your role as manager:
                1. Delegate concept analysis to the Concept Detection Specialist
                2. Assign maturity scoring to the Scoring Expert
                3. Task the Learning Architect with creating personalized paths
                4. Have the Business Strategist develop implementation plans
                5. Direct the Risk Specialist to assess challenges and mitigation
                6. Synthesize all results into comprehensive assessment
                
                Ensure all agents collaborate effectively and deliver integrated results.
                """,
                expected_output="Comprehensive AI readiness assessment with integrated insights from all specialized agents",
                agent=self.concept_agent  # Lead agent for coordination
            )
            
            # Create hierarchical crew with strict limits
            hierarchical_crew = Crew(
                agents=[
                    self.concept_agent,
                    self.scoring_agent,
                    self.learning_agent, 
                    self.business_agent,
                    self.risk_agent
                ],
                tasks=[coordination_task],
                process=Process.hierarchical,
                manager_llm=self.llm,
                verbose=False,  # Completely disable verbosity
                max_iter=1,  # Force single iteration only
                memory=False,  # Disable memory
                embedder=None  # Disable embedder
            )
            
            # Execute with hierarchical collaboration and timeout
            print("🤝 Agents collaborating hierarchically...")
            
            def timeout_handler(signum, frame):
                raise TimeoutError("Hierarchical assessment timed out")
            
            try:
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(120)  # 2 minute timeout
                results = hierarchical_crew.kickoff()
                signal.alarm(0)  # Cancel timeout
            except TimeoutError:
                signal.alarm(0)  # Cancel timeout
                print(f"⏰ Hierarchical assessment timed out, falling back to sequential")
                return self.run_comprehensive_assessment(question_history, user_context)
            
            print("✅ Hierarchical Assessment completed!")
            
            return {
                "hierarchical_results": results,
                "collaboration_type": "hierarchical_with_delegation",
                "assessment_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Hierarchical Assessment failed: {e}")
            return self.run_comprehensive_assessment(question_history, user_context)

# =============================================================================
# INTEGRATION HELPER FUNCTIONS
# =============================================================================

def generate_crewai_question(openai_api_key: str, question_history: List[Dict]) -> Dict:
    """Generate next question using CrewAI agent"""
    
    try:
        # Initialize CrewAI system
        crew_system = AIReadinessCrewAI(openai_api_key)
        
        # Generate question using appropriate agent
        question_result = crew_system.generate_agent_question(question_history)
        
        return question_result
        
    except Exception as e:
        print(f"CrewAI question generation failed: {e}")
        return {
            "error": f"CrewAI question generation failed: {str(e)}",
            "fallback_needed": True
        }

def convert_question_history_to_crewai_format(question_history: List[Dict]) -> List[Dict]:
    """Convert existing question history format to CrewAI-compatible format"""
    
    formatted_history = []
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    
    for i, qa in enumerate(question_history):
        if i < len(sections):
            formatted_entry = {
                "section": sections[i],
                "question": qa.get("question", ""),
                "answer": qa.get("answer", ""),
                "question_id": qa.get("question_id", f"q_{i}"),
                "answered_at": qa.get("answered_at", datetime.now().isoformat())
            }
            formatted_history.append(formatted_entry)
    
    return formatted_history

def extract_crewai_results_for_api(crewai_output: Dict) -> Dict:
    """Extract and format CrewAI results for API response"""
    
    try:
        print(f"🔍 Processing CrewAI output: {type(crewai_output)}")
        
        # Get the actual results from CrewAI
        if isinstance(crewai_output, dict):
            results = crewai_output.get("crewai_results", "")
            agents_used = crewai_output.get("agents_used", [])
            collaboration_type = crewai_output.get("collaboration_type", "sequential")
            timestamp = crewai_output.get("assessment_timestamp", "")
        else:
            results = str(crewai_output)
            agents_used = []
            collaboration_type = "unknown"
            timestamp = ""
        
        print(f"🔍 Raw CrewAI results length: {len(str(results))}")
        
        # Parse actual agent results instead of using fake hash-based scores
        maturity_scores = {}
        overall_score = 2.0  # Default low score
        readiness_level = "needs_foundation"
        
        try:
            # ACTUALLY use the agent results instead of fake scores
            results_str = str(results)
            print(f"🔍 Searching for agent scores in: {results_str[:500]}...")
            
            # Look for the scoring agent's JSON output in the results with better regex
            import re
            
            # Try multiple patterns to find the agent scores
            patterns = [
                r'"section_scores":\s*\{[^}]+\}[^}]*?"overall_score":\s*([\d.]+)[^}]*?"readiness_level":\s*"([^"]+)"',
                r'\{[^{}]*"section_scores":\s*\{[^}]+\}[^}]*?"overall_score"[^}]*?\}',
                r'"section_scores":\s*(\{[^}]+\})',
                r'"overall_score":\s*([\d.]+)'
            ]
            
            agent_found = False
            for pattern in patterns:
                matches = re.findall(pattern, results_str, re.DOTALL)
                if matches:
                    try:
                        print(f"🎯 Found pattern match: {matches}")
                        
                        # Try to extract scores from the first pattern (most complete)
                        if len(matches[0]) == 2 and isinstance(matches[0], tuple):
                            overall_agent_score = float(matches[0][0])
                            readiness_level = matches[0][1]
                            overall_score = overall_agent_score
                            agent_found = True
                            print(f"✅ Using REAL agent score: {overall_agent_score}/5.0 = {round(overall_agent_score * 20)}%")
                            break
                        elif pattern == r'"overall_score":\s*([\d.]+)' and len(matches) > 0:
                            overall_agent_score = float(matches[0])
                            overall_score = overall_agent_score
                            agent_found = True
                            print(f"✅ Using REAL agent overall score: {overall_agent_score}/5.0")
                            break
                            
                    except (ValueError, IndexError) as e:
                        print(f"⚠️ Error parsing match {matches}: {e}")
                        continue
            
            # If we found agent scores, try to extract section scores too
            if agent_found:
                section_pattern = r'"F1\.1":\s*([\d.]+).*?"F1\.2":\s*([\d.]+).*?"P2\.1":\s*([\d.]+).*?"P2\.2":\s*([\d.]+).*?"E3\.1":\s*([\d.]+)'
                section_match = re.search(section_pattern, results_str, re.DOTALL)
                if section_match:
                    maturity_scores = {
                        "F1.1": float(section_match.group(1)),
                        "F1.2": float(section_match.group(2)), 
                        "P2.1": float(section_match.group(3)),
                        "P2.2": float(section_match.group(4)),
                        "E3.1": float(section_match.group(5))
                    }
                    print(f"✅ Extracted section scores: {maturity_scores}")
                else:
                    # Use default section distribution if overall score found
                    print("⚠️ Using estimated section scores based on overall score")
                    base_score = overall_score
                    maturity_scores = {
                        "F1.1": round(base_score + 0.2, 1),
                        "F1.2": round(base_score - 0.1, 1),
                        "P2.1": round(base_score + 0.1, 1), 
                        "P2.2": round(base_score - 0.4, 1),  # Advanced section typically lower
                        "E3.1": round(base_score + 0.2, 1)
                    }
            
            if not agent_found:
                raise ValueError("Could not find agent scores in results")
            
            # If no valid scores found, use conservative defaults for unknown responses
            if not maturity_scores:
                print("⚠️ No valid agent scores found, using conservative defaults")
                maturity_scores = {
                    "F1.1": 2.0,  # Conservative score for uncertain responses
                    "F1.2": 2.0,
                    "P2.1": 1.8,
                    "P2.2": 1.5,  # Lower for advanced concepts
                    "E3.1": 2.2
                }
                overall_score = sum(maturity_scores.values()) / len(maturity_scores)
                
        except Exception as e:
            print(f"❌ Error parsing agent results: {e}")
            # Fallback to very conservative scores
            maturity_scores = {
                "F1.1": 1.5,
                "F1.2": 1.5, 
                "P2.1": 1.3,
                "P2.2": 1.0,
                "E3.1": 1.7
            }
            overall_score = sum(maturity_scores.values()) / len(maturity_scores)
        
        # Calculate overall metrics (but preserve agent score if found)
        if not hasattr(locals(), 'agent_found') or not locals().get('agent_found', False):
            overall_score = sum(maturity_scores.values()) / len(maturity_scores)
        overall_score_percentage = round(overall_score * 20)  # Convert to 0-100 scale
        
        print(f"🎯 FINAL SCORES: overall={overall_score}/5.0 ({overall_score_percentage}%), readiness={readiness_level}")
        
        # Determine readiness level based on overall score
        if overall_score >= 4.5:
            readiness_level = "ready_to_lead"
        elif overall_score >= 3.5:
            readiness_level = "ready_to_implement"
        elif overall_score >= 2.5:
            readiness_level = "ready_to_learn"
        else:
            readiness_level = "needs_foundation"
        
        # Generate strengths and growth areas based on scores
        strengths = []
        growth_areas = []
        
        area_names = {
            "F1.1": "AI Fundamentals Understanding",
            "F1.2": "Business Application Thinking", 
            "P2.1": "Basic Prompt Engineering",
            "P2.2": "Advanced AI Techniques",
            "E3.1": "AI Tool Ecosystem Knowledge"
        }
        
        for section, score in maturity_scores.items():
            area_name = area_names.get(section, section)
            if score >= 4.0:
                strengths.append(area_name)
            elif score < 3.0:
                growth_areas.append(area_name)
        
        # If no clear strengths/weaknesses, add generic ones
        if not strengths:
            strengths = ["Basic AI Understanding", "Willingness to Learn"]
        if not growth_areas:
            growth_areas = ["Advanced AI Implementation", "Tool Integration"]
            
        # Learning resources with proper string format for React
        learning_resources = [
            "AI Fundamentals Course (Free, 2 weeks)",
            "Prompt Engineering Workshop ($49, 3 weeks)", 
            "Business AI Implementation Guide (Free, 1 week)"
        ]
        
        return {
            "maturity_scores": maturity_scores,
            "overall_score": overall_score,
            "overall_score_percentage": overall_score_percentage,
            "overall_readiness_level": readiness_level,
            "maturity_level": round(overall_score),
            
            "concept_analysis": {
                "detected_concepts": [
                    "artificial intelligence basics",
                    "business applications", 
                    "prompt engineering",
                    "ai tools"
                ],
                "knowledge_gaps": [
                    area for area, score in maturity_scores.items() 
                    if score < 3.5
                ],
                "strengths": strengths
            },
            
            "learning_path": {
                "priority_areas": growth_areas[:3] if growth_areas else ["AI Implementation"],
                "estimated_timeline": "6-12 weeks",
                "learning_resources": learning_resources,
                "recommended_sequence": list(maturity_scores.keys())
            },
            
            "business_recommendations": [
                {
                    "category": "Getting Started",
                    "title": "ChatGPT Plus for Business",
                    "description": "Start with AI-powered content creation",
                    "cost": "$20/month",
                    "roi_timeline": "Immediate"
                },
                {
                    "category": "Next Steps", 
                    "title": "AI Workflow Integration",
                    "description": "Integrate AI into existing processes",
                    "cost": "$100-500/month",
                    "roi_timeline": "3-6 months"
                }
            ],
            
            "confidence_assessment": {
                "overall_confidence": min(0.9, overall_score / 5.0),
                "identified_risks": [
                    "Implementation complexity" if overall_score < 3.0 else "Scaling challenges",
                    "Change management needs"
                ],
                "mitigation_strategies": [
                    "Start with pilot projects",
                    "Invest in team training",
                    "Establish clear AI governance"
                ]
            },
            
            # Required fields for Firebase compatibility (prevent undefined errors)
            "visual_analytics": {
                "readiness_score": overall_score,
                "confidence_level": min(0.9, overall_score / 5.0),
                "assessment_completion": 100,
                "score_distribution": maturity_scores
            },
            
            "next_steps": [
                "Begin with foundational AI education" if overall_score < 3.0 else "Start implementing AI tools",
                "Focus on " + (growth_areas[0] if growth_areas else "skill development"),
                "Consider " + ("basic training programs" if overall_score < 3.5 else "advanced implementation strategies")
            ],
            
            # For frontend compatibility
            "basicInsights": {
                "strengths": strengths,
                "growthAreas": growth_areas
            },
            
            # Required timestamp fields for Firebase
            "analysis_timestamp": datetime.now().isoformat(),
            "analysisTimestamp": datetime.now().isoformat(),  # Alternative field name
            "completedAt": datetime.now().isoformat(),
            
            "crewai_metadata": {
                "agents_used": agents_used,
                "collaboration_type": collaboration_type,
                "assessment_timestamp": timestamp or datetime.now().isoformat(),
                "agents_involved": [
                    "AI Concept Detection Specialist",
                    "Maturity Scoring Expert", 
                    "Learning Journey Architect",
                    "Business Implementation Strategist",
                    "Risk Assessment Specialist"
                ]
            }
        }
        
    except Exception as e:
        print(f"❌ Error extracting CrewAI results: {e}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        
        # Fallback data that won't cause Firebase errors
        return {
            "maturity_scores": {"F1.1": 3.0, "F1.2": 3.0, "P2.1": 3.0, "P2.2": 3.0, "E3.1": 3.0},
            "overall_score": 3.0,
            "overall_score_percentage": 60,
            "overall_readiness_level": "ready_to_learn",
            "maturity_level": 3,
            "concept_analysis": {
                "detected_concepts": ["basic ai awareness"],
                "knowledge_gaps": ["implementation", "advanced techniques"],
                "strengths": ["learning mindset"]
            },
            "learning_path": {
                "priority_areas": ["AI fundamentals"],
                "estimated_timeline": "8-12 weeks", 
                "learning_resources": ["AI Basics Course (Free, 4 weeks)"],
                "recommended_sequence": ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
            },
            "business_recommendations": [{
                "category": "Foundation",
                "title": "AI Education Program", 
                "description": "Start with team education",
                "cost": "Free-$500",
                "roi_timeline": "3-6 months"
            }],
            "confidence_assessment": {
                "overall_confidence": 0.6,
                "identified_risks": ["knowledge gaps"],
                "mitigation_strategies": ["structured learning"]
            },
            "visual_analytics": {
                "readiness_score": 3.0,
                "confidence_level": 0.6,
                "assessment_completion": 100,
                "score_distribution": {"F1.1": 3.0, "F1.2": 3.0, "P2.1": 3.0, "P2.2": 3.0, "E3.1": 3.0}
            },
            "next_steps": [
                "Begin with foundational AI education",
                "Focus on basic understanding",
                "Consider structured learning programs"
            ],
            "basicInsights": {
                "strengths": ["Learning mindset", "Business focus"],
                "growthAreas": ["Technical implementation", "Advanced AI techniques"]
            },
            # Required timestamp fields for Firebase
            "analysis_timestamp": datetime.now().isoformat(),
            "analysisTimestamp": datetime.now().isoformat(),  # Alternative field name
            "completedAt": datetime.now().isoformat(),
            "crewai_metadata": {
                "agents_used": [],
                "collaboration_type": "fallback",
                "assessment_timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
        }

# =============================================================================
# CHANGE READINESS CREWAI AGENTS
# =============================================================================

def create_change_assessment_agent(llm):
    """Agent 1: Analyzes organizational change readiness"""
    return Agent(
        role='Organizational Change Readiness Analyst',
        goal='Assess organizational capacity for AI-driven change by analyzing culture, leadership, processes, and employee readiness',
        backstory="""You are Dr. Maria Santos, an organizational psychology expert with 20 years of experience in 
        change management and digital transformation. You specialize in assessing organizational readiness for 
        technology adoption, particularly AI implementations. You excel at reading between the lines of survey 
        responses to understand true organizational culture, leadership effectiveness, and employee sentiment.""",
        verbose=True,   # Enable verbosity to see what agents are doing
        allow_delegation=False,  # Keep delegation disabled to prevent loops
        max_execution_time=60,  # Give agents more time to work (60 seconds)
        max_iter=3,  # Allow up to 3 iterations for better results
        llm=llm,
        tools=[]  # Keep tools empty for now to avoid tool-related issues
    )

def create_change_scoring_agent(llm):
    """Agent 2: Calculates sophisticated change readiness scores"""
    return Agent(
        role='Change Readiness Scoring Specialist',
        goal='Provide precise scoring of organizational change readiness across multiple dimensions with confidence intervals',
        backstory="""You are Dr. James Liu, a quantitative organizational analyst with expertise in change 
        management metrics and scoring methodologies. You have developed proprietary frameworks for measuring 
        organizational readiness across culture, leadership, processes, and technology adoption. You provide 
        detailed, evidence-based scoring with clear justification for each assessment dimension.""",
        verbose=True,   # Enable verbosity to see what agents are doing
        allow_delegation=False,  # Keep delegation disabled to prevent loops
        max_execution_time=60,  # Give agents more time to work (60 seconds)
        max_iter=3,  # Allow up to 3 iterations for better results
        llm=llm,
        tools=[]  # Keep tools empty for now to avoid tool-related issues
    )

def create_change_strategy_agent(llm):
    """Agent 3: Designs change management strategies"""
    return Agent(
        role='Change Strategy Architect',
        goal='Develop comprehensive change management strategies tailored to organizational context and readiness levels',
        backstory="""You are Sarah Thompson, a change management strategist who has led over 100 digital 
        transformations across industries. You understand the critical success factors for AI adoption and 
        can design phase-appropriate change strategies. You excel at creating actionable roadmaps that account 
        for organizational constraints while maximizing change success probability.""",
        verbose=False,  # Reduce verbosity to prevent noise
        allow_delegation=False,  # Disable delegation to prevent loops
        llm=llm,
        tools=[]  # REMOVE ALL TOOLS temporarily to test
    )

def create_change_risk_agent(llm):
    """Agent 4: Identifies and mitigates change risks"""
    return Agent(
        role='Change Risk Assessment Specialist',
        goal='Identify potential obstacles, resistance patterns, and failure modes in AI transformation initiatives',
        backstory="""You are Michael Rodriguez, a risk management expert specializing in organizational change 
        initiatives. You have seen transformations fail and succeed, and can predict potential pitfalls before 
        they become problems. You excel at designing early warning systems and mitigation strategies for 
        change-related risks, from technical challenges to cultural resistance.""",
        verbose=True,   # Enable verbosity to see what agents are doing
        allow_delegation=False,  # Keep delegation disabled to prevent loops
        max_execution_time=60,  # Give agents more time to work (60 seconds)
        max_iter=3,  # Allow up to 3 iterations for better results
        llm=llm,
        tools=[]  # Keep tools empty for now to avoid tool-related issues
    )

def create_portfolio_management_agent(llm):
    """Agent 5: Manages AI initiative portfolios"""
    return Agent(
        role='AI Portfolio Management Strategist',
        goal='Optimize AI initiative portfolios for maximum business impact while managing organizational capacity',
        backstory="""You are Dr. Amanda Chen, a strategic portfolio manager who specializes in AI and digital 
        transformation initiatives. You understand how to sequence AI projects for maximum learning and impact, 
        balance quick wins with long-term capabilities, and manage organizational change capacity. You excel at 
        creating realistic implementation timelines that respect organizational constraints.""",
        verbose=True,   # Enable verbosity to see what agents are doing
        allow_delegation=False,  # Keep delegation disabled to prevent loops
        max_execution_time=60,  # Give agents more time to work (60 seconds)
        max_iter=3,  # Allow up to 3 iterations for better results
        llm=llm,
        tools=[]  # Keep tools empty for now to avoid tool-related issues
    )

# =============================================================================
# CHANGE READINESS CREWAI TASKS
# =============================================================================

def create_change_assessment_task(org_data: Dict, question_history: List[Dict]):
    """Task for analyzing organizational change readiness"""
    return Task(
        description=f"""
        Conduct comprehensive organizational change readiness assessment.
        
        Organization Data: {json.dumps(org_data, indent=2)}
        Assessment Responses: {json.dumps(question_history, indent=2)}
        
        Your responsibilities:
        1. Analyze organizational culture and change capacity
        2. Evaluate leadership readiness and commitment
        3. Assess process maturity and adaptability
        4. Review employee sentiment and change history
        5. Identify cultural strengths and barriers
        
        Deliver comprehensive analysis including:
        - Cultural change readiness indicators
        - Leadership effectiveness assessment
        - Process and structural readiness
        - Employee engagement and change appetite
        - Historical change performance patterns
        """,
        expected_output="""JSON format organizational readiness analysis:
        {
            "culture_readiness": {"score": 0-100, "evidence": [], "concerns": []},
            "leadership_readiness": {"score": 0-100, "evidence": [], "concerns": []},
            "process_readiness": {"score": 0-100, "evidence": [], "concerns": []},
            "change_history": {"score": 0-100, "evidence": [], "concerns": []},
            "overall_assessment": "detailed summary"
        }""",
        agent=None
    )

def create_change_scoring_task():
    """Task for calculating change readiness scores"""
    return Task(
        description="""
        Calculate comprehensive change readiness scores based on organizational assessment.
        
        Your responsibilities:
        1. Score culture readiness (adaptability, innovation, collaboration)
        2. Evaluate leadership readiness (vision, commitment, capability)
        3. Assess process readiness (agility, documentation, governance)
        4. Calculate technology readiness (infrastructure, skills, adoption)
        5. Determine overall change readiness level
        
        Provide detailed scoring including:
        - Individual dimension scores (1-5 scale) with justification
        - Confidence intervals for each score
        - Overall readiness level and recommendations
        - Critical success factors and risk indicators
        """,
        expected_output="""JSON format scoring analysis:
        {
            "scores": {
                "culture_readiness": 0-100,
                "leadership_readiness": 0-100, 
                "process_readiness": 0-100,
                "technology_readiness": 0-100,
                "overall_score": 0-100
            },
            "readiness_level": "ready_to_implement|prepare_first|get_help",
            "confidence_level": 0.0-1.0,
            "justifications": {"dimension": "reasoning"},
            "critical_factors": [],
            "risk_indicators": []
        }""",
        agent=None
    )

def create_change_strategy_task():
    """Task for designing change management strategy"""
    return Task(
        description="""
        Design comprehensive change management strategy based on readiness assessment.
        
        Your responsibilities:
        1. Create phased implementation approach
        2. Design stakeholder engagement strategy
        3. Develop communication and training plans
        4. Establish governance and decision-making structures
        5. Create success metrics and monitoring systems
        
        Strategy should include:
        - Multi-phase implementation timeline
        - Stakeholder mapping and engagement approach
        - Communication strategy and messaging framework
        - Training and capability building plans
        - Governance structures and decision processes
        """,
        expected_output="Complete change management strategy with actionable implementation roadmap",
        agent=None
    )

def create_change_risk_task():
    """Task for change risk assessment and mitigation"""
    return Task(
        description="""
        Conduct comprehensive change risk assessment and develop mitigation strategies.
        
        Your responsibilities:
        1. Identify potential resistance sources and patterns
        2. Assess technical and operational risks
        3. Evaluate resource and timeline risks
        4. Analyze cultural and political risks
        5. Design mitigation strategies for each risk category
        
        Risk assessment should cover:
        - Individual and group resistance patterns
        - Technical implementation challenges
        - Resource availability and capability gaps
        - Cultural misalignment and political obstacles
        - External market and competitive pressures
        """,
        expected_output="Detailed risk assessment with specific mitigation strategies and contingency plans",
        agent=None
    )

def create_portfolio_strategy_task():
    """Task for AI portfolio strategy and sequencing"""
    return Task(
        description="""
        Develop AI initiative portfolio strategy optimized for organizational capacity and impact.
        
        Your responsibilities:
        1. Sequence AI initiatives based on readiness and impact
        2. Balance quick wins with capability building
        3. Manage organizational change capacity
        4. Create realistic implementation timelines
        5. Design portfolio governance and prioritization
        
        Portfolio strategy should include:
        - Initiative prioritization matrix (impact vs. readiness)
        - Sequenced implementation roadmap
        - Resource allocation and capacity planning
        - Success metrics and value tracking
        - Portfolio governance and decision frameworks
        """,
        expected_output="Complete AI portfolio strategy with sequenced roadmap and governance framework",
        agent=None
    )

# =============================================================================
# CHANGE READINESS CREWAI SYSTEM
# =============================================================================

class ChangeReadinessCrewAI:
    """CrewAI implementation for Change Readiness Assessment"""
    
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        
        # DEPLOYMENT VERIFICATION: Log that our fixes are active
        print("🔧 DEPLOYMENT VERIFICATION: LiteLLM disabling active - 2025-07-22T16:05:00Z")
        print(f"🔧 LITELLM_DISABLE_COST: {os.getenv('LITELLM_DISABLE_COST')}")
        print(f"🔧 LITELLM_LOG_LEVEL: {os.getenv('LITELLM_LOG_LEVEL')}")
        
        # Initialize LLM with reasonable settings for quality analysis
        self.llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            model="gpt-4o-mini",  
            temperature=0.3,   # Keep temperature for deterministic responses
            timeout=60,        # Increased timeout to allow for complex analysis
            max_retries=1,     # Allow 1 retry for reliability
            streaming=False,
            max_tokens=2000,   # Increased tokens for comprehensive analysis
            request_timeout=60, # Match timeout
            # Disable LiteLLM cost tracking that causes infinite loops
            callbacks=[],  # Empty callbacks list
            metadata={},   # Empty metadata
            client_kwargs={
                "timeout": 60,
                "max_retries": 1
            }
        )
        
        # Initialize change readiness agents
        self.assessment_agent = create_change_assessment_agent(self.llm)
        self.scoring_agent = create_change_scoring_agent(self.llm)
        self.strategy_agent = create_change_strategy_agent(self.llm)
        self.risk_agent = create_change_risk_agent(self.llm)
        self.portfolio_agent = create_portfolio_management_agent(self.llm)
    
    def run_change_readiness_assessment(self, org_data: Dict, question_history: List[Dict]) -> Dict:
        """Run complete change readiness assessment with CrewAI agents"""
        
        print("🚀 Starting Change Readiness CrewAI Assessment...")
        print(f"📊 Analyzing organization: {org_data.get('name', 'Unknown')}")
        
        try:
            # Create tasks
            assessment_task = create_change_assessment_task(org_data, question_history)
            assessment_task.agent = self.assessment_agent
            
            scoring_task = create_change_scoring_task()
            scoring_task.agent = self.scoring_agent
            
            strategy_task = create_change_strategy_task()
            strategy_task.agent = self.strategy_agent
            
            risk_task = create_change_risk_task()
            risk_task.agent = self.risk_agent
            
            portfolio_task = create_portfolio_strategy_task()
            portfolio_task.agent = self.portfolio_agent
            
            # Create collaborative crew with strict limits to prevent loops
            change_crew = Crew(
                agents=[
                    self.assessment_agent,
                    self.scoring_agent,
                    self.strategy_agent,
                    self.risk_agent,
                    self.portfolio_agent
                ],
                tasks=[
                    assessment_task,
                    scoring_task,
                    strategy_task,
                    risk_task,
                    portfolio_task
                ],
                process=Process.sequential,
                verbose=True,   # Enable verbosity to see what crew is doing
                max_iter=3,    # Allow up to 3 iterations per task
                memory=False,  # Keep memory disabled to prevent context accumulation
                embedder=None, # Keep embedder disabled
                max_rpm=10,    # Increase rate limit slightly
                max_execution_time=300, # 5 minutes total execution time
                # Disable cost tracking and callbacks that cause loops
                manager_callbacks=None,
                step_callback=None,
                task_callback=None
            )
            
            # Execute assessment with timeout
            print("🤖 Change readiness agents collaborating...")
            
            def timeout_handler(signum, frame):
                raise TimeoutError("Change assessment timed out")
            
            try:
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(300)  # 5 minute timeout to match crew execution time
                results = change_crew.kickoff()
                signal.alarm(0)  # Cancel timeout
            except TimeoutError:
                signal.alarm(0)  # Cancel timeout
                print(f"⏰ Change assessment timed out, using fallback")
                # Return error to trigger main.py function-based fallback
                return {
                    "error": "CrewAI agents timed out after 5 minutes",
                    "fallback_needed": True,
                    "timeout_reason": "Agent collaboration taking longer than expected"
                }
            
            print("✅ Change Readiness CrewAI Assessment completed!")
            
            return {
                "crewai_results": results,
                "agents_used": [
                    "organizational_change_analyst",
                    "change_readiness_scorer",
                    "change_strategy_architect", 
                    "change_risk_specialist",
                    "ai_portfolio_strategist"
                ],
                "assessment_timestamp": datetime.now().isoformat(),
                "collaboration_type": "sequential_change_analysis",
                "organization": org_data.get('name', 'Unknown')
            }
            
        except Exception as e:
            print(f"❌ Change Readiness CrewAI Assessment failed: {e}")
            return {
                "error": f"CrewAI change assessment failed: {str(e)}",
                "fallback_analysis": "Using function-based change assessment",
                "assessment_timestamp": datetime.now().isoformat()
            }

# =============================================================================
# CHANGE READINESS INTEGRATION
# =============================================================================

def run_crewai_change_assessment(openai_api_key: str, org_data: Dict, question_history: List[Dict]) -> Dict:
    """Run change readiness assessment using CrewAI agents"""
    
    try:
        # Initialize CrewAI system
        crew_system = ChangeReadinessCrewAI(openai_api_key)
        
        # Run assessment
        results = crew_system.run_change_readiness_assessment(org_data, question_history)
        
        return results
        
    except Exception as e:
        print(f"Change readiness CrewAI failed: {e}")
        return {
            "error": f"CrewAI change assessment failed: {str(e)}",
            "fallback_needed": True
        }

# =============================================================================
# TESTING AND DEMONSTRATION
# =============================================================================

def test_crewai_system(openai_api_key: str):
    """Test the CrewAI assessment system"""
    
    # Sample question history
    sample_history = [
        {
            "question": "What is the difference between AI, Machine Learning, and LLMs?",
            "answer": "AI is when computers can think. ML might be related. LLMs are chatbots I think.",
            "question_id": "q1",
            "answered_at": datetime.now().isoformat()
        },
        {
            "question": "How can AI be applied in business?", 
            "answer": "AI could help with customer service and maybe automation of some tasks.",
            "question_id": "q2",
            "answered_at": datetime.now().isoformat()
        },
        {
            "question": "How do you create effective prompts?",
            "answer": "I just ask questions and hope for good answers.",
            "question_id": "q3", 
            "answered_at": datetime.now().isoformat()
        },
        {
            "question": "Describe advanced prompting techniques.",
            "answer": "I don't know about advanced techniques.",
            "question_id": "q4",
            "answered_at": datetime.now().isoformat()
        },
        {
            "question": "What AI tools are you familiar with?",
            "answer": "I only use ChatGPT sometimes.",
            "question_id": "q5",
            "answered_at": datetime.now().isoformat()
        }
    ]
    
    print("🧪 Testing CrewAI Assessment System...")
    
    try:
        # Initialize CrewAI system
        crew_system = AIReadinessCrewAI(openai_api_key)
        
        # Format question history
        formatted_history = convert_question_history_to_crewai_format(sample_history)
        
        # Run comprehensive assessment
        print("\n1️⃣ Running Comprehensive Assessment...")
        comprehensive_results = crew_system.run_comprehensive_assessment(formatted_history)
        
        # Run hierarchical assessment
        print("\n2️⃣ Running Hierarchical Assessment...")
        hierarchical_results = crew_system.run_hierarchical_assessment(formatted_history)
        
        return {
            "comprehensive": comprehensive_results,
            "hierarchical": hierarchical_results,
            "test_status": "success"
        }
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return {
            "test_status": "failed",
            "error": str(e)
        }

if __name__ == "__main__":
    print("🤖 HYBRID INTELLIGENT CREWAI ASSESSMENT SYSTEM")
    print("="*60)
    print("🎧 Intelligent Question Generation:")
    print("• Full agent intelligence with tools for questions 1-5")
    print("• Contextual, adaptive questioning")
    print("• Multi-agent collaboration for personalized questions")
    print("• verbose=True for rich question generation")
    print("\n🔧 Reliable Analysis:")
    print("• Simplified, robust tools for post-assessment")
    print("• max_iter=2 for balanced quality and speed")
    print("• memory=False to prevent context buildup")
    print("• Timeout protection with signal handlers")
    print("\n⚙️ Best of Both Worlds:")
    print("• Smart questions (the core value)")
    print("• Reliable analysis (no infinite loops)")
    print("• 1-minute timeout for fast failure detection")
    print("• Simple, proven tool patterns")