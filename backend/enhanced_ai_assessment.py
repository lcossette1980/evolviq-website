import json
import datetime
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
import base64
from io import BytesIO

class EnhancedAIAssessmentWithInsights:
    """
    Comprehensive AI Assessment Tool with Rich Insights and Detailed Visualizations
    
    This tool provides a thorough evaluation of AI readiness across multiple dimensions,
    offering detailed insights, personalized recommendations, and comprehensive visualizations
    to guide organizations in their AI adoption journey.
    """
    
    def __init__(self):
        self.questions = self._initialize_questions()
        self.user_responses = {}
        self.current_question = 0
        self.assessment_metadata = {
            'start_time': datetime.datetime.now(),
            'version': '2.0',
            'total_questions': len(self.questions)
        }
        
        # Enhanced visualization styling
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
        # Define readiness levels with detailed descriptions
        self.readiness_levels = {
            'beginner': {
                'range': (0, 30),
                'title': 'AI Awareness Building',
                'description': 'Starting the AI journey with foundational learning',
                'focus': 'Understanding basic AI concepts and identifying potential use cases',
                'timeline': '3-6 months for foundation building'
            },
            'developing': {
                'range': (30, 50),
                'title': 'AI Foundation Development',
                'description': 'Building essential AI knowledge and exploring opportunities',
                'focus': 'Pilot projects, tool evaluation, and team education',
                'timeline': '6-12 months for structured learning'
            },
            'intermediate': {
                'range': (50, 70),
                'title': 'AI Implementation Ready',
                'description': 'Ready to implement AI solutions with proper planning',
                'focus': 'Strategic implementation, process integration, and measurement',
                'timeline': '12-18 months for full implementation'
            },
            'advanced': {
                'range': (70, 85),
                'title': 'AI Strategic Integration',
                'description': 'Successfully integrating AI across business functions',
                'focus': 'Scaling successful solutions and optimizing ROI',
                'timeline': '18-24 months for strategic integration'
            },
            'expert': {
                'range': (85, 100),
                'title': 'AI Innovation Leadership',
                'description': 'Leading AI innovation and driving competitive advantage',
                'focus': 'Innovation, thought leadership, and advanced applications',
                'timeline': 'Continuous evolution and innovation'
            }
        }
        
    def _initialize_questions(self) -> List[Dict[str, Any]]:
        """Initialize comprehensive assessment questions with enhanced metadata"""
        return [
            {
                "id": 1,
                "category": "Basic AI Understanding",
                "subcategory": "Core Concepts",
                "weight": 1.0,
                "difficulty": "fundamental",
                "question": "What is the primary goal of artificial intelligence in business?",
                "context": "This question assesses understanding of AI's business value proposition and realistic expectations.",
                "learning_objective": "Understand AI's role in business transformation and value creation",
                "options": {
                    "A": {
                        "text": "To replace all human workers", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "This reflects a common misconception. AI is designed to augment human capabilities, not replace all workers.",
                        "insight": "Organizations with this view often create unnecessary resistance to AI adoption."
                    },
                    "B": {
                        "text": "To automate repetitive tasks and enhance decision-making", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Correct! AI excels at automating routine tasks while providing data-driven insights for better decisions.",
                        "insight": "This understanding indicates readiness for strategic AI implementation."
                    },
                    "C": {
                        "text": "To collect and analyze customer data", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "Partially correct but limited. Data analysis is one application, not the primary goal.",
                        "insight": "This view may lead to narrow AI applications missing broader opportunities."
                    },
                    "D": {
                        "text": "To reduce business costs only", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Cost reduction is one benefit, but AI's primary value is in capability enhancement and innovation.",
                        "insight": "Cost-only focus may undervalue AI's strategic potential."
                    },
                    "E": {
                        "text": "I'm not sure", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "Honesty is valuable. This indicates need for foundational AI education.",
                        "insight": "Perfect starting point for structured AI learning journey."
                    }
                },
                "key_concepts": ["AI value proposition", "Business transformation", "Human-AI collaboration"],
                "recommended_resources": ["AI for Business Leaders courses", "Case study analysis", "Industry reports"]
            },
            {
                "id": 2,
                "category": "Basic AI Understanding",
                "subcategory": "Current Capabilities",
                "weight": 1.2,
                "difficulty": "fundamental",
                "question": "Which statement best describes current AI capabilities?",
                "context": "Understanding AI's current limitations and strengths is crucial for realistic implementation planning.",
                "learning_objective": "Develop realistic expectations about AI capabilities and limitations",
                "options": {
                    "A": {
                        "text": "AI can think and reason exactly like humans", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "AI processes information differently than humans and has significant limitations in reasoning.",
                        "insight": "This misconception can lead to unrealistic expectations and project failures."
                    },
                    "B": {
                        "text": "AI excels at specific tasks but requires human oversight", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Excellent understanding! AI is powerful for narrow tasks but needs human judgment and oversight.",
                        "insight": "This balanced view enables successful human-AI collaboration strategies."
                    },
                    "C": {
                        "text": "AI is only useful for large tech companies", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "AI tools are increasingly accessible to organizations of all sizes through cloud services and SaaS.",
                        "insight": "This belief may prevent exploration of available AI opportunities."
                    },
                    "D": {
                        "text": "AI can solve any business problem automatically", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "AI requires careful problem definition, data preparation, and ongoing management.",
                        "insight": "This view often leads to poorly planned AI initiatives."
                    },
                    "E": {
                        "text": "AI is too complex for me to understand", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "While AI can be complex, the business applications can be understood with proper education.",
                        "insight": "Growth mindset is essential for AI adoption success."
                    }
                },
                "key_concepts": ["AI limitations", "Human oversight", "Narrow AI", "Task-specific performance"],
                "recommended_resources": ["AI myths debunking articles", "Human-AI collaboration frameworks", "Technical literacy courses"]
            },
            {
                "id": 3,
                "category": "Basic AI Understanding",
                "subcategory": "AI vs Traditional Systems",
                "weight": 1.0,
                "difficulty": "fundamental",
                "question": "What is the key difference between AI and traditional automation?",
                "context": "This distinction is fundamental to understanding when and how to apply AI versus traditional solutions.",
                "learning_objective": "Distinguish between AI and traditional automation capabilities",
                "options": {
                    "A": {
                        "text": "AI can learn and adapt from data, automation follows fixed rules", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Perfect! AI systems can improve their performance through learning, while traditional automation executes predetermined rules.",
                        "insight": "This understanding enables appropriate technology selection for different use cases."
                    },
                    "B": {
                        "text": "AI is newer and more expensive than automation", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "While often true, this focuses on implementation details rather than fundamental capabilities.",
                        "insight": "Cost considerations are important but shouldn't be the primary differentiator."
                    },
                    "C": {
                        "text": "There is no meaningful difference", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "There are significant differences in adaptability, learning capability, and complexity handling.",
                        "insight": "This view may lead to suboptimal technology choices."
                    },
                    "D": {
                        "text": "AI only works with customer service", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "AI has applications across all business functions, not just customer service.",
                        "insight": "Limited view may restrict AI exploration to narrow use cases."
                    },
                    "E": {
                        "text": "I don't know the difference", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "Understanding this difference is crucial for effective AI strategy development.",
                        "insight": "Excellent opportunity to build foundational AI knowledge."
                    }
                },
                "key_concepts": ["Machine learning", "Adaptability", "Rule-based systems", "Data-driven insights"],
                "recommended_resources": ["AI vs automation comparisons", "Machine learning basics", "Technology selection frameworks"]
            },
            {
                "id": 4,
                "category": "Business Applications",
                "subcategory": "Small Business Applications",
                "weight": 1.5,
                "difficulty": "applied",
                "question": "Which AI application would most likely provide immediate value to a small retail business?",
                "context": "This tests practical understanding of AI applications and their business impact for smaller organizations.",
                "learning_objective": "Identify high-impact, accessible AI applications for small businesses",
                "options": {
                    "A": {
                        "text": "Chatbots for customer service and inventory alerts", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Excellent choice! These applications provide immediate ROI with relatively low implementation complexity.",
                        "insight": "This demonstrates strong understanding of practical AI applications and business value."
                    },
                    "B": {
                        "text": "Custom machine learning models", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "While powerful, custom ML models require significant resources and expertise not typically available to small retailers.",
                        "insight": "This choice may indicate overestimating small business AI capabilities."
                    },
                    "C": {
                        "text": "Autonomous delivery robots", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "This technology is expensive, complex, and not yet practical for most small retail businesses.",
                        "insight": "Focus on sci-fi applications rather than practical business solutions."
                    },
                    "D": {
                        "text": "Basic email automation tools", 
                        "score": 3, 
                        "level": "intermediate",
                        "explanation": "Good practical choice, though not necessarily AI-powered. Shows understanding of incremental automation.",
                        "insight": "Pragmatic approach, though may not fully leverage AI capabilities."
                    },
                    "E": {
                        "text": "I wouldn't know where to start", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "This is a common feeling, and there are many resources to help identify starting points.",
                        "insight": "Perfect opportunity for guided AI exploration and education."
                    }
                },
                "key_concepts": ["ROI optimization", "Implementation complexity", "Small business constraints", "Immediate value applications"],
                "recommended_resources": ["Small business AI toolkits", "ROI calculators", "Implementation guides", "Vendor comparison tools"]
            },
            {
                "id": 5,
                "category": "Business Applications",
                "subcategory": "Non-Profit Applications",
                "weight": 1.3,
                "difficulty": "applied",
                "question": "How can non-profits most effectively use AI to enhance their mission?",
                "context": "This assesses understanding of AI applications in resource-constrained, mission-driven organizations.",
                "learning_objective": "Apply AI thinking to non-profit contexts and mission-driven outcomes",
                "options": {
                    "A": {
                        "text": "Donor management, volunteer matching, and personalized outreach", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Outstanding! These applications directly support core non-profit functions while maximizing limited resources.",
                        "insight": "Shows deep understanding of how AI can amplify mission impact in resource-constrained environments."
                    },
                    "B": {
                        "text": "Only for social media posting", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "While social media automation can help, this severely limits AI's potential for non-profits.",
                        "insight": "May be missing opportunities for greater mission impact through AI."
                    },
                    "C": {
                        "text": "To replace human volunteers entirely", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "Non-profits rely on human connection and passion. AI should enhance, not replace, volunteer engagement.",
                        "insight": "This view could damage the heart of non-profit operations."
                    },
                    "D": {
                        "text": "Basic email newsletters and event reminders", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "These are useful but basic applications that don't fully leverage AI's potential for non-profits.",
                        "insight": "Conservative approach that may underutilize available opportunities."
                    },
                    "E": {
                        "text": "AI isn't relevant for non-profits", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "AI can significantly amplify non-profit impact through better resource allocation and outreach.",
                        "insight": "This belief may prevent exploration of mission-enhancing opportunities."
                    }
                },
                "key_concepts": ["Mission amplification", "Resource optimization", "Stakeholder engagement", "Impact measurement"],
                "recommended_resources": ["Non-profit AI case studies", "Mission-driven technology guides", "Volunteer management platforms", "Donor analytics tools"]
            },
            {
                "id": 6,
                "category": "Business Applications",
                "subcategory": "Implementation Strategy",
                "weight": 1.4,
                "difficulty": "applied",
                "question": "What's the most realistic first step for AI implementation in small organizations?",
                "context": "This evaluates understanding of practical AI adoption pathways for resource-constrained organizations.",
                "learning_objective": "Develop realistic AI implementation strategies for small organizations",
                "options": {
                    "A": {
                        "text": "Start with existing AI-powered tools and services", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Perfect strategy! Leveraging existing AI tools minimizes risk while providing learning opportunities.",
                        "insight": "This approach demonstrates strategic thinking and practical understanding of AI adoption."
                    },
                    "B": {
                        "text": "Hire a team of data scientists", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "This is expensive and unnecessary for most small organizations starting their AI journey.",
                        "insight": "May indicate overcomplicating AI adoption or misunderstanding resource requirements."
                    },
                    "C": {
                        "text": "Build custom AI solutions from scratch", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Custom development is complex and expensive. Better to start with proven solutions.",
                        "insight": "This approach often leads to failed projects due to complexity and resource constraints."
                    },
                    "D": {
                        "text": "Wait for AI technology to become simpler", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "AI tools are already quite accessible. Waiting means missing current opportunities.",
                        "insight": "Perfectionism or fear may be preventing beneficial AI exploration."
                    },
                    "E": {
                        "text": "Attend a few webinars first", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "Education is important, but should be combined with practical experimentation.",
                        "insight": "Good starting point, but may indicate over-emphasis on theory versus practice."
                    }
                },
                "key_concepts": ["Incremental adoption", "Risk management", "Learning by doing", "Resource optimization"],
                "recommended_resources": ["AI tool directories", "Implementation playbooks", "Pilot project guides", "Vendor evaluation frameworks"]
            },
            {
                "id": 7,
                "category": "Business Applications",
                "subcategory": "Limitation Awareness",
                "weight": 1.1,
                "difficulty": "analytical",
                "question": "Which business function is currently LEAST enhanced by practical AI applications?",
                "context": "This tests nuanced understanding of AI's current capabilities and limitations across business functions.",
                "learning_objective": "Recognize where AI provides less value and where human skills remain essential",
                "options": {
                    "A": {
                        "text": "In-person relationship building and networking", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Excellent insight! Human relationships, trust-building, and emotional intelligence remain distinctly human strengths.",
                        "insight": "This understanding prevents over-reliance on AI and recognizes the continued value of human skills."
                    },
                    "B": {
                        "text": "Customer service and support", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "AI has significantly enhanced customer service through chatbots, automated responses, and sentiment analysis.",
                        "insight": "May not be aware of current AI applications in customer service."
                    },
                    "C": {
                        "text": "Marketing and lead generation", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "AI has revolutionized marketing through personalization, predictive analytics, and automated campaigns.",
                        "insight": "This suggests unfamiliarity with modern marketing AI applications."
                    },
                    "D": {
                        "text": "Financial analysis and reporting", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "AI has improved financial analysis, though human judgment remains crucial for interpretation.",
                        "insight": "Partially correct but not the least enhanced area."
                    },
                    "E": {
                        "text": "All business functions benefit equally", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "AI's impact varies significantly across business functions based on the nature of tasks involved.",
                        "insight": "This view may lead to inappropriate AI applications or unrealistic expectations."
                    }
                },
                "key_concepts": ["AI limitations", "Human-centered functions", "Emotional intelligence", "Relationship building"],
                "recommended_resources": ["Human-AI collaboration studies", "Emotional intelligence resources", "Network building strategies", "AI limitation analyses"]
            },
            {
                "id": 8,
                "category": "Implementation Readiness",
                "subcategory": "Common Barriers",
                "weight": 1.6,
                "difficulty": "strategic",
                "question": "What's typically the biggest barrier to successful AI implementation in small organizations?",
                "context": "This assesses understanding of real-world implementation challenges beyond technical considerations.",
                "learning_objective": "Identify and prepare for the primary obstacles in AI implementation",
                "options": {
                    "A": {
                        "text": "Lack of clear strategy and defined problems to solve", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Exactly right! Without clear objectives and problem definition, AI projects often fail regardless of technical capabilities.",
                        "insight": "This strategic thinking indicates readiness to lead successful AI initiatives."
                    },
                    "B": {
                        "text": "Not having enough technical staff", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "While technical capacity matters, strategic clarity is more fundamental to success.",
                        "insight": "May be overemphasizing technical versus strategic aspects."
                    },
                    "C": {
                        "text": "AI technology being too expensive", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Many AI tools are now affordable, and cost often reflects poor project scoping rather than technology expense.",
                        "insight": "This view may prevent exploration of cost-effective AI solutions."
                    },
                    "D": {
                        "text": "Employee resistance to change", 
                        "score": 3, 
                        "level": "intermediate",
                        "explanation": "Change management is important, but typically secondary to having a clear strategy and use case.",
                        "insight": "Good awareness of human factors, though not the primary barrier."
                    },
                    "E": {
                        "text": "All barriers are equally challenging", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "Different organizations face different primary barriers, but strategy issues are most fundamental.",
                        "insight": "This view may prevent prioritized problem-solving approaches."
                    }
                },
                "key_concepts": ["Strategic planning", "Problem definition", "Success metrics", "Project scoping"],
                "recommended_resources": ["AI strategy frameworks", "Project management methodologies", "Success metric development", "Problem definition techniques"]
            },
            {
                "id": 9,
                "category": "Implementation Readiness",
                "subcategory": "Prerequisites",
                "weight": 1.5,
                "difficulty": "strategic",
                "question": "Before implementing AI, what should organizations prioritize first?",
                "context": "This evaluates understanding of proper preparation and sequencing for AI initiatives.",
                "learning_objective": "Establish proper foundations for successful AI implementation",
                "options": {
                    "A": {
                        "text": "Clearly define business problems and success metrics", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Outstanding! Clear problem definition and success metrics are essential foundations for any AI project.",
                        "insight": "This strategic approach significantly increases the likelihood of AI project success."
                    },
                    "B": {
                        "text": "Purchase the latest AI software", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "Technology purchases without clear objectives often result in wasted resources and failed projects.",
                        "insight": "This approach frequently leads to 'solutions looking for problems.'"
                    },
                    "C": {
                        "text": "Train all employees on AI concepts", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "Education is valuable but should follow strategic planning to ensure relevance and focus.",
                        "insight": "Good emphasis on preparation, but may be putting cart before horse."
                    },
                    "D": {
                        "text": "Hire AI consultants immediately", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Consultants can help, but organizations need internal clarity on objectives before engaging external help.",
                        "insight": "May indicate over-reliance on external expertise without building internal understanding."
                    },
                    "E": {
                        "text": "Wait for more advanced AI tools", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "Current AI tools are quite capable. Waiting prevents learning and competitive advantage.",
                        "insight": "Perfectionism or analysis paralysis may be preventing beneficial action."
                    }
                },
                "key_concepts": ["Strategic planning", "Objective setting", "Success measurement", "Foundational preparation"],
                "recommended_resources": ["Strategic planning templates", "KPI development guides", "Business case frameworks", "Readiness assessment tools"]
            },
            {
                "id": 10,
                "category": "Implementation Readiness",
                "subcategory": "Timeline Expectations",
                "weight": 1.3,
                "difficulty": "practical",
                "question": "What's a realistic timeline for seeing ROI from AI implementation?",
                "context": "This tests realistic expectations about AI project timelines and return on investment.",
                "learning_objective": "Set appropriate expectations for AI project timelines and returns",
                "options": {
                    "A": {
                        "text": "3-6 months for simple tools, 12+ months for complex solutions", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Perfect! This shows realistic understanding of how complexity affects implementation timelines.",
                        "insight": "Realistic timeline expectations are crucial for project success and stakeholder management."
                    },
                    "B": {
                        "text": "Immediate results within weeks", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "Even simple AI implementations require planning, integration, and optimization time.",
                        "insight": "Unrealistic expectations often lead to disappointment and project abandonment."
                    },
                    "C": {
                        "text": "2-3 years minimum for any results", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "This is overly conservative. Many AI tools can provide value much sooner.",
                        "insight": "Over-caution may prevent exploration of quick-win opportunities."
                    },
                    "D": {
                        "text": "ROI varies greatly by implementation approach", 
                        "score": 3, 
                        "level": "intermediate",
                        "explanation": "True, but the specific timeline ranges are more helpful for planning.",
                        "insight": "Good general understanding, but may benefit from more specific planning guidance."
                    },
                    "E": {
                        "text": "ROI is impossible to measure accurately", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "ROI can be measured with proper metrics and baseline establishment.",
                        "insight": "This view may prevent proper project evaluation and learning."
                    }
                },
                "key_concepts": ["ROI measurement", "Timeline planning", "Complexity assessment", "Expectation management"],
                "recommended_resources": ["ROI calculation methods", "Project timeline templates", "Complexity assessment tools", "Success tracking systems"]
            },
            {
                "id": 11,
                "category": "Costs and Resources",
                "subcategory": "Cost-Effective Approaches",
                "weight": 1.4,
                "difficulty": "practical",
                "question": "What's the most cost-effective way for small businesses to start with AI?",
                "context": "This evaluates understanding of budget-conscious AI adoption strategies.",
                "learning_objective": "Identify cost-effective entry points for AI adoption",
                "options": {
                    "A": {
                        "text": "Use existing AI-powered SaaS tools and services", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Excellent! SaaS AI tools offer enterprise capabilities at small business prices with minimal upfront investment.",
                        "insight": "This approach minimizes risk while providing immediate access to sophisticated AI capabilities."
                    },
                    "B": {
                        "text": "Build everything in-house for full control", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "In-house development is expensive and time-consuming, especially for organizations new to AI.",
                        "insight": "This approach often leads to failed projects due to underestimating complexity and costs."
                    },
                    "C": {
                        "text": "Wait for prices to drop significantly", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "AI tool prices are already quite reasonable, and waiting means missing current competitive advantages.",
                        "insight": "This passive approach may result in being left behind by more proactive competitors."
                    },
                    "D": {
                        "text": "Start with free trial versions of AI tools", 
                        "score": 3, 
                        "level": "intermediate",
                        "explanation": "Good approach for testing, but should be part of a broader strategy including paid implementations.",
                        "insight": "Practical approach that shows cost consciousness and testing mindset."
                    },
                    "E": {
                        "text": "Partner with universities for research projects", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "This can provide access to expertise but may not address immediate business needs.",
                        "insight": "Academic partnerships can be valuable but are often too theoretical for immediate business impact."
                    }
                },
                "key_concepts": ["SaaS solutions", "Cost optimization", "Risk management", "Scalable adoption"],
                "recommended_resources": ["SaaS AI tool directories", "Cost comparison tools", "Trial evaluation frameworks", "Scaling strategies"]
            },
            {
                "id": 12,
                "category": "Costs and Resources",
                "subcategory": "Cost Factors",
                "weight": 1.2,
                "difficulty": "analytical",
                "question": "Which factor most significantly affects AI implementation costs?",
                "context": "This assesses understanding of the primary cost drivers in AI projects.",
                "learning_objective": "Understand and manage the primary cost drivers in AI implementation",
                "options": {
                    "A": {
                        "text": "Complexity of business problem and data quality requirements", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Exactly! Problem complexity and data preparation typically drive 60-80% of AI project costs.",
                        "insight": "This understanding enables better project scoping and cost estimation."
                    },
                    "B": {
                        "text": "Size of the company only", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Company size affects scale but not the fundamental cost drivers of AI projects.",
                        "insight": "This view may lead to underestimating project complexity regardless of company size."
                    },
                    "C": {
                        "text": "Geographic location", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "With cloud-based AI services, geographic location has minimal impact on AI implementation costs.",
                        "insight": "This outdated view may not reflect modern AI service delivery models."
                    },
                    "D": {
                        "text": "Industry type determines all costs", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "Industry affects requirements but complexity and data quality are more fundamental cost drivers.",
                        "insight": "Partially correct but misses the more fundamental cost factors."
                    },
                    "E": {
                        "text": "All factors affect costs equally", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "Some factors have much greater impact on costs than others.",
                        "insight": "This view may prevent focused attention on the most important cost management areas."
                    }
                },
                "key_concepts": ["Project complexity", "Data quality", "Cost estimation", "Resource planning"],
                "recommended_resources": ["Project costing methodologies", "Data assessment frameworks", "Complexity evaluation tools", "Resource planning guides"]
            },
            {
                "id": 13,
                "category": "Ethics and Risk Management",
                "subcategory": "Primary Ethical Concerns",
                "weight": 1.5,
                "difficulty": "strategic",
                "question": "What's the primary ethical concern small businesses should address with AI?",
                "context": "This evaluates awareness of ethical responsibilities in AI implementation.",
                "learning_objective": "Recognize and address primary ethical considerations in AI deployment",
                "options": {
                    "A": {
                        "text": "Customer data privacy, transparency, and algorithmic fairness", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Outstanding! These are the core ethical pillars for responsible AI implementation.",
                        "insight": "This comprehensive ethical awareness indicates readiness for responsible AI leadership."
                    },
                    "B": {
                        "text": "Competing with large tech companies", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Competition is a business concern, not an ethical issue related to AI implementation.",
                        "insight": "This view may be missing the ethical responsibilities that come with AI deployment."
                    },
                    "C": {
                        "text": "AI taking over the world", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "This science fiction concern distracts from real, immediate ethical responsibilities.",
                        "insight": "Focus on fictional threats may prevent attention to actual ethical obligations."
                    },
                    "D": {
                        "text": "Ensuring AI systems work properly", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "System reliability is important but doesn't address the broader ethical implications of AI use.",
                        "insight": "Technical focus is good but misses ethical dimensions of AI deployment."
                    },
                    "E": {
                        "text": "Ethics don't apply to small business AI use", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "All organizations using AI have ethical responsibilities, regardless of size.",
                        "insight": "This view could lead to irresponsible AI use and potential legal/reputational issues."
                    }
                },
                "key_concepts": ["Data privacy", "Algorithmic fairness", "Transparency", "Responsible AI"],
                "recommended_resources": ["AI ethics frameworks", "Privacy compliance guides", "Fairness assessment tools", "Transparency best practices"]
            },
            {
                "id": 14,
                "category": "Ethics and Risk Management",
                "subcategory": "Bias Management",
                "weight": 1.3,
                "difficulty": "strategic",
                "question": "How should organizations handle potential AI bias in their systems?",
                "context": "This tests understanding of proactive bias management strategies.",
                "learning_objective": "Implement systematic approaches to identify and mitigate AI bias",
                "options": {
                    "A": {
                        "text": "Regular auditing, diverse reviews, and bias testing protocols", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Perfect! Systematic bias management requires ongoing monitoring and diverse perspectives.",
                        "insight": "This comprehensive approach demonstrates mature understanding of responsible AI governance."
                    },
                    "B": {
                        "text": "Ignore it - bias is unavoidable in all systems", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "While bias exists, it can be significantly reduced through proper management practices.",
                        "insight": "This fatalistic view could lead to discriminatory outcomes and legal liability."
                    },
                    "C": {
                        "text": "Only use AI for internal processes", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "Limiting AI use reduces risk but doesn't address bias management for implemented systems.",
                        "insight": "Risk-averse approach that may limit AI benefits without solving bias issues."
                    },
                    "D": {
                        "text": "Trust that vendors handle bias issues", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Organizations remain responsible for bias in their AI applications, regardless of vendor claims.",
                        "insight": "This passive approach may not protect against bias-related problems."
                    },
                    "E": {
                        "text": "Bias isn't a concern for small businesses", 
                        "score": 0, 
                        "level": "beginner",
                        "explanation": "All organizations using AI can be affected by bias, with potential legal and ethical implications.",
                        "insight": "This view could lead to discriminatory practices and missed opportunities for inclusive AI."
                    }
                },
                "key_concepts": ["Bias detection", "Algorithmic auditing", "Diverse perspectives", "Continuous monitoring"],
                "recommended_resources": ["Bias testing frameworks", "Algorithmic auditing tools", "Diversity and inclusion guides", "Fairness metrics"]
            },
            {
                "id": 15,
                "category": "Ethics and Risk Management",
                "subcategory": "Vendor Selection",
                "weight": 1.4,
                "difficulty": "strategic",
                "question": "What's the best approach to AI vendor selection and evaluation?",
                "context": "This assesses ability to evaluate AI vendors comprehensively beyond just features.",
                "learning_objective": "Develop comprehensive vendor evaluation criteria for AI solutions",
                "options": {
                    "A": {
                        "text": "Evaluate security, support, business fit, and scalability", 
                        "score": 4, 
                        "level": "advanced",
                        "explanation": "Excellent! Comprehensive evaluation covering technical, business, and operational dimensions.",
                        "insight": "This holistic approach significantly reduces implementation risks and increases success probability."
                    },
                    "B": {
                        "text": "Always choose the cheapest option available", 
                        "score": 0, 
                        "level": "misconception",
                        "explanation": "Cost-only decisions often lead to poor outcomes due to inadequate support, security, or functionality.",
                        "insight": "This penny-wise, pound-foolish approach often results in higher total costs."
                    },
                    "C": {
                        "text": "Only work with the largest tech companies", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Size doesn't guarantee the best fit. Many specialized vendors offer superior solutions for specific needs.",
                        "insight": "This approach may miss innovative solutions and better-fit options from smaller vendors."
                    },
                    "D": {
                        "text": "Focus primarily on features and functionality", 
                        "score": 2, 
                        "level": "basic",
                        "explanation": "Features matter, but implementation success depends on many other factors.",
                        "insight": "This technical focus may miss business-critical evaluation criteria."
                    },
                    "E": {
                        "text": "Go with vendor recommendations from others", 
                        "score": 1, 
                        "level": "limited",
                        "explanation": "Recommendations are valuable but must be evaluated against specific organizational needs.",
                        "insight": "This approach may not account for unique organizational requirements and context."
                    }
                },
                "key_concepts": ["Vendor evaluation", "Risk assessment", "Business alignment", "Long-term partnership"],
                "recommended_resources": ["Vendor evaluation frameworks", "Security assessment checklists", "Reference checking guides", "Contract negotiation tips"]
            }
        ]
    
    def get_readiness_level(self, percentage: float) -> Dict[str, Any]:
        """Determine readiness level based on percentage score with detailed insights"""
        for level, data in self.readiness_levels.items():
            if data['range'][0] <= percentage < data['range'][1]:
                return {**data, 'level': level, 'percentage': percentage}
        
        # Handle edge case for perfect score
        if percentage >= 85:
            return {**self.readiness_levels['expert'], 'level': 'expert', 'percentage': percentage}
        else:
            return {**self.readiness_levels['beginner'], 'level': 'beginner', 'percentage': percentage}
    
    def generate_personalized_insights(self, scores: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive, personalized insights based on assessment results"""
        
        readiness_level = self.get_readiness_level(scores['overall_percentage'])
        category_scores = scores['category_scores']
        level_distribution = scores['level_distribution']
        
        # Identify strengths and growth areas
        strengths = []
        growth_areas = []
        
        for category, data in category_scores.items():
            percentage = (data['score'] / data['max_score']) * 100
            if percentage >= 75:
                strengths.append({'category': category, 'percentage': percentage})
            elif percentage < 50:
                growth_areas.append({'category': category, 'percentage': percentage})
        
        # Sort by performance
        strengths.sort(key=lambda x: x['percentage'], reverse=True)
        growth_areas.sort(key=lambda x: x['percentage'])
        
        # Generate specific recommendations
        recommendations = self._generate_specific_recommendations(scores, readiness_level)
        
        # Calculate learning priorities
        learning_priorities = self._calculate_learning_priorities(category_scores)
        
        # Generate success probability
        success_factors = self._analyze_success_factors(scores)
        
        # Create timeline projection
        timeline_projection = self._create_timeline_projection(scores)
        
        return {
            'readiness_level': readiness_level,
            'strengths': strengths,
            'growth_areas': growth_areas,
            'recommendations': recommendations,
            'learning_priorities': learning_priorities,
            'success_factors': success_factors,
            'timeline_projection': timeline_projection,
            'key_insights': self._generate_key_insights(scores, readiness_level),
            'next_steps': self._generate_next_steps(readiness_level, growth_areas)
        }
    
    def _generate_specific_recommendations(self, scores: Dict[str, Any], readiness_level: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate specific, actionable recommendations based on assessment results"""
        recommendations = []
        
        # Base recommendations on readiness level
        level = readiness_level['level']
        
        if level == 'beginner':
            recommendations.extend([
                {
                    'category': 'Foundation Building',
                    'priority': 'high',
                    'title': 'Start with AI Literacy',
                    'description': 'Build foundational AI knowledge through structured learning programs',
                    'actions': [
                        'Complete "AI for Business Leaders" online course',
                        'Read 2-3 AI business case studies weekly',
                        'Attend AI webinars and industry events',
                        'Join AI-focused business communities'
                    ],
                    'timeline': '1-2 months',
                    'expected_outcome': 'Solid understanding of AI capabilities and business applications'
                },
                {
                    'category': 'Opportunity Identification',
                    'priority': 'high',
                    'title': 'Identify Quick Wins',
                    'description': 'Look for immediate AI opportunities in your organization',
                    'actions': [
                        'Audit current repetitive tasks and processes',
                        'Identify customer service pain points',
                        'List data-rich decisions that could benefit from insights',
                        'Research AI tools already used by competitors'
                    ],
                    'timeline': '2-4 weeks',
                    'expected_outcome': 'List of 3-5 potential AI applications for your organization'
                }
            ])
        
        elif level == 'developing':
            recommendations.extend([
                {
                    'category': 'Pilot Planning',
                    'priority': 'high',
                    'title': 'Design Your First AI Pilot',
                    'description': 'Plan and execute a low-risk, high-impact AI pilot project',
                    'actions': [
                        'Select a specific business problem with clear success metrics',
                        'Evaluate 3-5 relevant AI tools or services',
                        'Develop a 90-day pilot project plan',
                        'Identify key stakeholders and champions'
                    ],
                    'timeline': '1-2 months',
                    'expected_outcome': 'Running AI pilot with measurable business impact'
                },
                {
                    'category': 'Team Development',
                    'priority': 'medium',
                    'title': 'Build Internal AI Capability',
                    'description': 'Develop your team\'s AI knowledge and skills',
                    'actions': [
                        'Identify AI champions within your organization',
                        'Provide targeted AI training for key team members',
                        'Create an AI knowledge sharing process',
                        'Establish connections with AI experts or mentors'
                    ],
                    'timeline': '2-3 months',
                    'expected_outcome': 'Internal team capable of evaluating and implementing AI solutions'
                }
            ])
        
        elif level == 'intermediate':
            recommendations.extend([
                {
                    'category': 'Strategic Integration',
                    'priority': 'high',
                    'title': 'Develop AI Strategy',
                    'description': 'Create comprehensive AI strategy aligned with business objectives',
                    'actions': [
                        'Conduct AI readiness assessment across all departments',
                        'Develop 12-18 month AI roadmap',
                        'Establish AI governance and ethics guidelines',
                        'Create budget allocation for AI initiatives'
                    ],
                    'timeline': '2-3 months',
                    'expected_outcome': 'Comprehensive AI strategy with clear implementation plan'
                },
                {
                    'category': 'Scaling Success',
                    'priority': 'high',
                    'title': 'Scale Successful Pilots',
                    'description': 'Expand successful AI applications across the organization',
                    'actions': [
                        'Document lessons learned from initial pilots',
                        'Identify departments ready for AI implementation',
                        'Develop scaling frameworks and best practices',
                        'Create change management plan for broader adoption'
                    ],
                    'timeline': '3-6 months',
                    'expected_outcome': 'AI applications successfully integrated across multiple business functions'
                }
            ])
        
        elif level in ['advanced', 'expert']:
            recommendations.extend([
                {
                    'category': 'Innovation Leadership',
                    'priority': 'high',
                    'title': 'Drive AI Innovation',
                    'description': 'Lead industry innovation and competitive differentiation through AI',
                    'actions': [
                        'Explore cutting-edge AI applications in your industry',
                        'Develop proprietary AI capabilities or datasets',
                        'Partner with AI research institutions or startups',
                        'Share AI insights and best practices externally'
                    ],
                    'timeline': '6-12 months',
                    'expected_outcome': 'Industry leadership position in AI innovation and application'
                },
                {
                    'category': 'Optimization',
                    'priority': 'medium',
                    'title': 'Optimize AI ROI',
                    'description': 'Maximize return on investment from existing AI implementations',
                    'actions': [
                        'Conduct comprehensive AI ROI analysis',
                        'Optimize existing AI systems for better performance',
                        'Integrate AI applications for synergistic benefits',
                        'Develop AI performance dashboards and KPIs'
                    ],
                    'timeline': '3-6 months',
                    'expected_outcome': 'Optimized AI portfolio delivering maximum business value'
                }
            ])
        
        return recommendations
    
    def _calculate_learning_priorities(self, category_scores: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate learning priorities based on importance and current performance"""
        priorities = []
        
        for category, data in category_scores.items():
            percentage = (data['score'] / data['max_score']) * 100
            importance = data['weight']
            
            # Priority score: high importance + low performance = high priority
            priority_score = importance * (100 - percentage) / 100
            
            priorities.append({
                'category': category,
                'current_performance': percentage,
                'importance_weight': importance,
                'priority_score': priority_score,
                'recommended_focus': self._get_category_focus(category, percentage)
            })
        
        # Sort by priority score (highest first)
        priorities.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return priorities
    
    def _get_category_focus(self, category: str, percentage: float) -> str:
        """Get specific focus area recommendations for each category"""
        focus_areas = {
            'Basic AI Understanding': {
                'low': 'Focus on AI fundamentals, capabilities, and business applications',
                'medium': 'Deepen understanding of AI implementation and integration',
                'high': 'Explore advanced AI concepts and emerging technologies'
            },
            'Business Applications': {
                'low': 'Learn about practical AI use cases in your industry',
                'medium': 'Develop expertise in AI solution evaluation and selection',
                'high': 'Focus on innovative applications and competitive differentiation'
            },
            'Implementation Readiness': {
                'low': 'Build project management and change management skills',
                'medium': 'Develop AI strategy and governance frameworks',
                'high': 'Focus on scaling and optimization strategies'
            },
            'Costs and Resources': {
                'low': 'Learn about AI economics and resource planning',
                'medium': 'Develop ROI measurement and cost optimization skills',
                'high': 'Focus on investment strategy and portfolio optimization'
            },
            'Ethics and Risk Management': {
                'low': 'Understand basic AI ethics and risk principles',
                'medium': 'Develop bias detection and mitigation capabilities',
                'high': 'Lead industry best practices in responsible AI'
            }
        }
        
        if percentage < 50:
            level = 'low'
        elif percentage < 75:
            level = 'medium'
        else:
            level = 'high'
        
        return focus_areas.get(category, {}).get(level, 'Continue developing expertise in this area')
    
    def _analyze_success_factors(self, scores: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze factors contributing to AI implementation success"""
        
        success_probability = min(scores['overall_percentage'] / 70 * 100, 100)  # 70% is considered good readiness
        
        critical_factors = []
        supporting_factors = []
        risk_factors = []
        
        category_scores = scores['category_scores']
        
        for category, data in category_scores.items():
            percentage = (data['score'] / data['max_score']) * 100
            
            if percentage >= 75:
                supporting_factors.append({
                    'factor': category,
                    'score': percentage,
                    'impact': 'Positive - Strong foundation for success'
                })
            elif percentage >= 50:
                critical_factors.append({
                    'factor': category,
                    'score': percentage,
                    'impact': 'Neutral - Adequate but could be strengthened'
                })
            else:
                risk_factors.append({
                    'factor': category,
                    'score': percentage,
                    'impact': 'Risk - May hinder successful implementation'
                })
        
        return {
            'success_probability': success_probability,
            'critical_factors': critical_factors,
            'supporting_factors': supporting_factors,
            'risk_factors': risk_factors,
            'key_recommendations': self._get_success_recommendations(success_probability, risk_factors)
        }
    
    def _get_success_recommendations(self, success_probability: float, risk_factors: List[Dict]) -> List[str]:
        """Generate specific recommendations to improve success probability"""
        recommendations = []
        
        if success_probability < 50:
            recommendations.append("Focus on building foundational AI knowledge before attempting implementation")
            recommendations.append("Start with very simple AI applications to build confidence and experience")
            recommendations.append("Invest significantly in education and training before proceeding")
        
        elif success_probability < 70:
            recommendations.append("Address key knowledge gaps before launching major AI initiatives")
            recommendations.append("Consider partnering with experienced AI consultants for guidance")
            recommendations.append("Start with pilot projects to build internal capability")
        
        else:
            recommendations.append("You have strong readiness for AI implementation")
            recommendations.append("Focus on strategic planning and execution excellence")
            recommendations.append("Consider leading AI adoption efforts in your industry")
        
        # Add specific recommendations for risk factors
        for risk in risk_factors:
            if 'Ethics' in risk['factor']:
                recommendations.append("Prioritize AI ethics and governance training to avoid compliance issues")
            elif 'Implementation' in risk['factor']:
                recommendations.append("Strengthen project management and change management capabilities")
            elif 'Costs' in risk['factor']:
                recommendations.append("Develop better understanding of AI economics and ROI measurement")
        
        return recommendations
    
    def _create_timeline_projection(self, scores: Dict[str, Any]) -> Dict[str, Any]:
        """Create realistic timeline projection for AI maturity journey"""
        
        current_score = scores['overall_percentage']
        
        # Define milestones
        milestones = [
            {'score': 30, 'title': 'AI Awareness', 'description': 'Basic understanding of AI capabilities'},
            {'score': 50, 'title': 'AI Readiness', 'description': 'Ready to start pilot projects'},
            {'score': 70, 'title': 'AI Implementation', 'description': 'Successfully implementing AI solutions'},
            {'score': 85, 'title': 'AI Integration', 'description': 'AI integrated across business functions'},
            {'score': 95, 'title': 'AI Innovation', 'description': 'Leading AI innovation in industry'}
        ]
        
        # Calculate timeline based on current score and typical learning curves
        timeline = []
        current_time = 0
        
        for milestone in milestones:
            if current_score < milestone['score']:
                # Estimate time to reach milestone
                score_gap = milestone['score'] - current_score
                
                # Learning velocity decreases as scores get higher (diminishing returns)
                if current_score < 30:
                    months_per_10_points = 2  # Fast initial learning
                elif current_score < 50:
                    months_per_10_points = 3  # Moderate learning
                elif current_score < 70:
                    months_per_10_points = 4  # Slower as complexity increases
                else:
                    months_per_10_points = 6  # Much slower at advanced levels
                
                months_needed = (score_gap / 10) * months_per_10_points
                current_time += months_needed
                
                timeline.append({
                    'milestone': milestone['title'],
                    'target_score': milestone['score'],
                    'description': milestone['description'],
                    'estimated_months': round(current_time),
                    'confidence': self._calculate_timeline_confidence(current_score, milestone['score'])
                })
                
                current_score = milestone['score']  # Update for next calculation
        
        return {
            'current_score': scores['overall_percentage'],
            'milestones': timeline,
            'total_journey_time': round(current_time) if timeline else 0,
            'key_factors': [
                'Timeline assumes consistent learning and implementation effort',
                'Actual progress depends on resource allocation and organizational commitment',
                'External factors like technology changes may accelerate or slow progress'
            ]
        }
    
    def _calculate_timeline_confidence(self, current_score: float, target_score: float) -> str:
        """Calculate confidence level for timeline projections"""
        gap = target_score - current_score
        
        if gap <= 20:
            return 'High - Achievable with focused effort'
        elif gap <= 40:
            return 'Medium - Requires sustained commitment'
        else:
            return 'Low - Significant transformation needed'
    
    def _generate_key_insights(self, scores: Dict[str, Any], readiness_level: Dict[str, Any]) -> List[str]:
        """Generate key insights from the assessment"""
        insights = []
        
        # Overall readiness insight
        insights.append(f"Your AI readiness level is '{readiness_level['title']}' with {readiness_level['percentage']:.1f}% overall score")
        
        # Category analysis
        category_scores = scores['category_scores']
        best_category = max(category_scores.items(), key=lambda x: x[1]['score'] / x[1]['max_score'])
        worst_category = min(category_scores.items(), key=lambda x: x[1]['score'] / x[1]['max_score'])
        
        best_pct = (best_category[1]['score'] / best_category[1]['max_score']) * 100
        worst_pct = (worst_category[1]['score'] / worst_category[1]['max_score']) * 100
        
        insights.append(f"Strongest area: {best_category[0]} ({best_pct:.1f}%)")
        insights.append(f"Biggest opportunity: {worst_category[0]} ({worst_pct:.1f}%)")
        
        # Level distribution insight
        level_dist = scores['level_distribution']
        total_questions = sum(level_dist.values())
        
        if level_dist.get('advanced', 0) / total_questions > 0.4:
            insights.append("Strong advanced knowledge indicates readiness for strategic AI initiatives")
        elif level_dist.get('misconception', 0) / total_questions > 0.2:
            insights.append("Some misconceptions present - focus on foundational education first")
        elif level_dist.get('basic', 0) / total_questions > 0.4:
            insights.append("Solid basic understanding - ready to move to practical applications")
        
        # Gap analysis
        score_gap = 85 - scores['overall_percentage']  # 85% is considered excellent
        if score_gap > 50:
            insights.append("Significant learning journey ahead - recommend structured education program")
        elif score_gap > 25:
            insights.append("Moderate development needed - focus on practical experience and pilot projects")
        else:
            insights.append("Strong AI readiness - focus on strategic implementation and innovation")
        
        return insights
    
    def _generate_next_steps(self, readiness_level: Dict[str, Any], growth_areas: List[Dict]) -> List[Dict[str, Any]]:
        """Generate specific next steps based on readiness level and growth areas"""
        next_steps = []
        
        # Immediate actions (1-2 weeks)
        if readiness_level['level'] == 'beginner':
            next_steps.append({
                'timeframe': 'Immediate (1-2 weeks)',
                'priority': 'high',
                'action': 'Complete AI literacy assessment',
                'description': 'Take online AI fundamentals course and assess current team knowledge',
                'outcome': 'Clear understanding of AI basics and team knowledge gaps'
            })
        else:
            next_steps.append({
                'timeframe': 'Immediate (1-2 weeks)',
                'priority': 'high',
                'action': 'Identify AI pilot opportunity',
                'description': 'Select specific business problem suitable for AI pilot project',
                'outcome': 'Defined pilot project scope with success metrics'
            })
        
        # Short-term actions (1-3 months)
        if growth_areas:
            top_growth_area = growth_areas[0]['category']
            next_steps.append({
                'timeframe': 'Short-term (1-3 months)',
                'priority': 'high',
                'action': f'Address {top_growth_area} knowledge gap',
                'description': f'Focused learning and development in {top_growth_area}',
                'outcome': f'Improved competency in {top_growth_area}'
            })
        
        # Medium-term actions (3-6 months)
        if readiness_level['percentage'] >= 50:
            next_steps.append({
                'timeframe': 'Medium-term (3-6 months)',
                'priority': 'medium',
                'action': 'Implement first AI solution',
                'description': 'Deploy and measure success of initial AI implementation',
                'outcome': 'Working AI solution with measurable business impact'
            })
        else:
            next_steps.append({
                'timeframe': 'Medium-term (3-6 months)',
                'priority': 'medium',
                'action': 'Build AI knowledge and skills',
                'description': 'Comprehensive team education and capability building',
                'outcome': 'Team ready for AI pilot projects'
            })
        
        # Long-term actions (6+ months)
        next_steps.append({
            'timeframe': 'Long-term (6+ months)',
            'priority': 'strategic',
            'action': 'Develop AI strategy',
            'description': 'Create comprehensive AI roadmap aligned with business strategy',
            'outcome': 'Strategic AI implementation plan with clear ROI targets'
        })
        
        return next_steps

    def record_response(self, question_num: int, answer: str) -> bool:
        """Record user response with enhanced validation and insights"""
        if question_num >= len(self.questions):
            return False
            
        answer = answer.upper().strip()
        q = self.questions[question_num]
        
        if answer in q['options']:
            self.user_responses[question_num] = {
                'answer': answer,
                'question_id': q['id'],
                'category': q['category'],
                'subcategory': q['subcategory'],
                'weight': q['weight'],
                'difficulty': q['difficulty'],
                'score': q['options'][answer]['score'],
                'level': q['options'][answer]['level'],
                'explanation': q['options'][answer]['explanation'],
                'insight': q['options'][answer]['insight'],
                'timestamp': datetime.datetime.now()
            }
            return True
        else:
            print(f"Invalid answer. Please choose from: {', '.join(q['options'].keys())}")
            return False
    
    def calculate_scores(self) -> Dict[str, Any]:
        """Calculate comprehensive scoring metrics with enhanced analytics"""
        if not self.user_responses:
            return {}
        
        # Raw scores
        total_raw_score = sum(resp['score'] for resp in self.user_responses.values())
        max_possible_raw = sum(4 for _ in self.questions)
        
        # Weighted scores
        total_weighted_score = sum(resp['score'] * resp['weight'] for resp in self.user_responses.values())
        max_possible_weighted = sum(4 * q['weight'] for q in self.questions)
        
        # Category breakdown with enhanced metrics
        category_scores = {}
        for resp in self.user_responses.values():
            cat = resp['category']
            if cat not in category_scores:
                category_scores[cat] = {
                    'score': 0, 
                    'max_score': 0, 
                    'weight': 0, 
                    'questions': 0,
                    'difficulty_distribution': {},
                    'subcategories': {}
                }
            
            category_scores[cat]['score'] += resp['score'] * resp['weight']
            category_scores[cat]['max_score'] += 4 * resp['weight']
            category_scores[cat]['weight'] += resp['weight']
            category_scores[cat]['questions'] += 1
            
            # Track difficulty distribution
            difficulty = resp['difficulty']
            if difficulty not in category_scores[cat]['difficulty_distribution']:
                category_scores[cat]['difficulty_distribution'][difficulty] = 0
            category_scores[cat]['difficulty_distribution'][difficulty] += 1
            
            # Track subcategory performance
            subcategory = resp['subcategory']
            if subcategory not in category_scores[cat]['subcategories']:
                category_scores[cat]['subcategories'][subcategory] = {'score': 0, 'max_score': 0}
            category_scores[cat]['subcategories'][subcategory]['score'] += resp['score']
            category_scores[cat]['subcategories'][subcategory]['max_score'] += 4
        
        # Level distribution with insights
        level_counts = {}
        level_insights = {}
        
        for resp in self.user_responses.values():
            level = resp['level']
            level_counts[level] = level_counts.get(level, 0) + 1
            
            if level not in level_insights:
                level_insights[level] = {
                    'explanations': [],
                    'insights': [],
                    'categories': set()
                }
            
            level_insights[level]['explanations'].append(resp['explanation'])
            level_insights[level]['insights'].append(resp['insight'])
            level_insights[level]['categories'].add(resp['category'])
        
        # Convert sets to lists for JSON serialization
        for level_data in level_insights.values():
            level_data['categories'] = list(level_data['categories'])
        
        # Overall percentage
        overall_percentage = (total_weighted_score / max_possible_weighted) * 100
        
        # Performance consistency analysis
        category_percentages = [(cat_data['score'] / cat_data['max_score']) * 100 
                               for cat_data in category_scores.values()]
        performance_consistency = {
            'std_deviation': np.std(category_percentages),
            'range': max(category_percentages) - min(category_percentages),
            'coefficient_of_variation': np.std(category_percentages) / np.mean(category_percentages) if np.mean(category_percentages) > 0 else 0
        }
        
        # Question difficulty analysis
        difficulty_performance = {}
        for resp in self.user_responses.values():
            difficulty = resp['difficulty']
            if difficulty not in difficulty_performance:
                difficulty_performance[difficulty] = {'scores': [], 'count': 0}
            difficulty_performance[difficulty]['scores'].append(resp['score'])
            difficulty_performance[difficulty]['count'] += 1
        
        # Calculate average performance by difficulty
        for difficulty, data in difficulty_performance.items():
            data['average_score'] = np.mean(data['scores'])
            data['performance_rate'] = (data['average_score'] / 4) * 100
        
        return {
            'total_raw_score': total_raw_score,
            'max_possible_raw': max_possible_raw,
            'total_weighted_score': total_weighted_score,
            'max_possible_weighted': max_possible_weighted,
            'overall_percentage': overall_percentage,
            'category_scores': category_scores,
            'level_distribution': level_counts,
            'level_insights': level_insights,
            'performance_consistency': performance_consistency,
            'difficulty_performance': difficulty_performance,
            'questions_answered': len(self.user_responses),
            'assessment_metadata': self.assessment_metadata
        }
    
    def create_enhanced_dashboard(self, scores: Dict[str, Any], insights: Dict[str, Any], save_path: str = None) -> str:
        """Create comprehensive dashboard with insights and narratives"""
        
        # Create figure with enhanced subplots
        fig = make_subplots(
            rows=4, cols=3,
            subplot_titles=[
                'Overall AI Readiness Score', 'Category Performance Analysis', 'Knowledge Level Distribution',
                'Readiness Level Progression', 'Performance Consistency Analysis', 'Learning Priority Matrix',
                'Success Probability Factors', 'Timeline to AI Maturity', 'Difficulty vs Performance',
                'Subcategory Deep Dive', 'Action Priority Heatmap', 'ROI Projection Timeline'
            ],
            specs=[
                [{"type": "indicator"}, {"type": "bar"}, {"type": "pie"}],
                [{"type": "bar"}, {"type": "scatter"}, {"type": "scatter"}],
                [{"type": "bar"}, {"type": "scatter"}, {"type": "scatter"}],
                [{"type": "bar"}, {"type": "xy"}, {"type": "scatter"}]
            ],
            vertical_spacing=0.08,
            horizontal_spacing=0.08
        )
        
        readiness_level = insights['readiness_level']
        
        # 1. Enhanced Overall Score Gauge with Readiness Level
        fig.add_trace(
            go.Indicator(
                mode="gauge+number+delta",
                value=scores['overall_percentage'],
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': f"AI Readiness<br><span style='font-size:14px'>{readiness_level['title']}</span>"},
                delta={'reference': 70, 'increasing': {'color': "green"}},
                gauge={
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 30], 'color': "#ffcccb", 'name': 'Beginner'},
                        {'range': [30, 50], 'color': "#ffd700", 'name': 'Developing'},
                        {'range': [50, 70], 'color': "#87ceeb", 'name': 'Intermediate'},
                        {'range': [70, 85], 'color': "#90ee90", 'name': 'Advanced'},
                        {'range': [85, 100], 'color': "#32cd32", 'name': 'Expert'}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 85
                    }
                }
            ),
            row=1, col=1
        )
        
        # 2. Enhanced Category Performance with Insights
        categories = list(scores['category_scores'].keys())
        cat_percentages = [(scores['category_scores'][cat]['score'] / 
                           scores['category_scores'][cat]['max_score']) * 100 
                          for cat in categories]
        
        # Color code based on performance
        colors = []
        for pct in cat_percentages:
            if pct >= 75:
                colors.append('#32cd32')  # Green for good
            elif pct >= 50:
                colors.append('#ffd700')  # Yellow for moderate
            else:
                colors.append('#ff6347')  # Red for needs improvement
        
        fig.add_trace(
            go.Bar(
                x=cat_percentages,
                y=[cat[:25] + '...' if len(cat) > 25 else cat for cat in categories],
                orientation='h',
                marker_color=colors,
                text=[f'{p:.1f}%' for p in cat_percentages],
                textposition='inside',
                hovertemplate='<b>%{y}</b><br>Score: %{x:.1f}%<br>Questions: %{customdata}<extra></extra>',
                customdata=[scores['category_scores'][cat]['questions'] for cat in categories]
            ),
            row=1, col=2
        )
        
        # 3. Enhanced Knowledge Level Distribution
        level_labels = {
            'advanced': 'Advanced',
            'intermediate': 'Intermediate', 
            'basic': 'Basic',
            'limited': 'Limited',
            'misconception': 'Misconceptions',
            'beginner': 'Beginner'
        }
        
        level_data = scores['level_distribution']
        labels = [level_labels.get(k, k) for k in level_data.keys()]
        values = list(level_data.values())
        
        # Enhanced color scheme
        colors_pie = {
            'Advanced': '#2E8B57',
            'Intermediate': '#4169E1', 
            'Basic': '#FFD700',
            'Limited': '#FFA500',
            'Misconceptions': '#FF6347',
            'Beginner': '#D3D3D3'
        }
        pie_colors = [colors_pie.get(label, '#CCCCCC') for label in labels]
        
        fig.add_trace(
            go.Pie(
                labels=labels,
                values=values,
                marker_colors=pie_colors,
                hole=0.4,
                hovertemplate='<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
            ),
            row=1, col=3
        )
        
        # 4. Readiness Level Progression
        progression_data = {
            'Current Level': readiness_level['percentage'],
            'Target (6mo)': min(readiness_level['percentage'] + 20, 100),
            'Target (12mo)': min(readiness_level['percentage'] + 35, 100),
            'Expert Level': 90
        }
        
        fig.add_trace(
            go.Bar(
                x=list(progression_data.keys()),
                y=list(progression_data.values()),
                marker_color=['#ff6347', '#ffd700', '#90ee90', '#32cd32'],
                text=[f'{v:.1f}%' for v in progression_data.values()],
                textposition='outside'
            ),
            row=2, col=1
        )
        
        # 5. Performance Consistency Analysis
        consistency = scores['performance_consistency']
        fig.add_trace(
            go.Scatter(
                x=categories,
                y=cat_percentages,
                mode='markers+lines',
                marker=dict(
                    size=15,
                    color=cat_percentages,
                    colorscale='RdYlGn',
                    showscale=True,
                    colorbar=dict(title="Performance %")
                ),
                line=dict(color='gray', dash='dot'),
                hovertemplate='<b>%{x}</b><br>Performance: %{y:.1f}%<extra></extra>'
            ),
            row=2, col=2
        )
        
        # Add consistency metrics as annotations
        fig.add_annotation(
            x=0.77, y=0.65,
            text=f"Consistency Score: {100 - consistency['coefficient_of_variation']*10:.0f}/100<br>" +
                 f"Range: {consistency['range']:.1f}%",
            showarrow=False,
            bgcolor="lightyellow",
            bordercolor="gray",
            xref="paper", yref="paper"
        )
        
        # 6. Learning Priority Matrix
        priorities = insights['learning_priorities']
        priority_x = [p['current_performance'] for p in priorities]
        priority_y = [p['importance_weight'] for p in priorities]
        priority_labels = [p['category'][:20] for p in priorities]
        
        fig.add_trace(
            go.Scatter(
                x=priority_x,
                y=priority_y,
                mode='markers+text',
                marker=dict(
                    size=[p['priority_score']*10 for p in priorities],
                    color='red',
                    opacity=0.6
                ),
                text=priority_labels,
                textposition="middle center",
                hovertemplate='<b>%{text}</b><br>Performance: %{x:.1f}%<br>Importance: %{y:.1f}<br>Priority Score: %{customdata:.2f}<extra></extra>',
                customdata=[p['priority_score'] for p in priorities]
            ),
            row=2, col=3
        )
        
        # 7. Success Probability Factors
        success_factors = insights['success_factors']
        factor_names = []
        factor_scores = []
        factor_colors = []
        
        for factor_list, color in [(success_factors['supporting_factors'], 'green'),
                                  (success_factors['critical_factors'], 'orange'),
                                  (success_factors['risk_factors'], 'red')]:
            for factor in factor_list:
                factor_names.append(factor['factor'][:20])
                factor_scores.append(factor['score'])
                factor_colors.append(color)
        
        fig.add_trace(
            go.Bar(
                x=factor_names,
                y=factor_scores,
                marker_color=factor_colors,
                text=[f'{s:.1f}%' for s in factor_scores],
                textposition='outside'
            ),
            row=3, col=1
        )
        
        # 8. Timeline to AI Maturity
        timeline = insights['timeline_projection']
        if timeline['milestones']:
            milestone_names = [m['milestone'] for m in timeline['milestones']]
            milestone_months = [m['estimated_months'] for m in timeline['milestones']]
            
            fig.add_trace(
                go.Scatter(
                    x=milestone_months,
                    y=milestone_names,
                    mode='markers+lines',
                    marker=dict(size=12, color='blue'),
                    line=dict(color='blue', width=3),
                    hovertemplate='<b>%{y}</b><br>Estimated Time: %{x} months<br>Target Score: %{customdata}%<extra></extra>',
                    customdata=[m['target_score'] for m in timeline['milestones']]
                ),
                row=3, col=2
            )
        
        # 9. Difficulty vs Performance Analysis
        difficulty_perf = scores['difficulty_performance']
        diff_names = list(difficulty_perf.keys())
        diff_performance = [difficulty_perf[d]['performance_rate'] for d in diff_names]
        diff_counts = [difficulty_perf[d]['count'] for d in diff_names]
        
        fig.add_trace(
            go.Scatter(
                x=diff_names,
                y=diff_performance,
                mode='markers',
                marker=dict(
                    size=[c*5 for c in diff_counts],
                    color='purple',
                    opacity=0.7
                ),
                hovertemplate='<b>%{x}</b><br>Performance: %{y:.1f}%<br>Questions: %{customdata}<extra></extra>',
                customdata=diff_counts
            ),
            row=3, col=3
        )
        
        # 10. Subcategory Deep Dive
        subcategory_data = []
        for category, cat_data in scores['category_scores'].items():
            for subcategory, sub_data in cat_data['subcategories'].items():
                subcategory_data.append({
                    'category': category,
                    'subcategory': subcategory,
                    'performance': (sub_data['score'] / sub_data['max_score']) * 100
                })
        
        if subcategory_data:
            fig.add_trace(
                go.Bar(
                    x=[d['subcategory'][:15] for d in subcategory_data],
                    y=[d['performance'] for d in subcategory_data],
                    marker_color=[hash(d['category']) % 256 / 256 for d in subcategory_data],
                    text=[f"{d['performance']:.1f}%" for d in subcategory_data],
                    textposition='outside'
                ),
                row=4, col=1
            )
        
        # 11. Action Priority Heatmap
        next_steps = insights['next_steps']
        priority_mapping = {'high': 3, 'medium': 2, 'low': 1, 'strategic': 2}
        
        if next_steps:
            step_names = [step['action'][:20] for step in next_steps]
            step_priorities = [priority_mapping.get(step['priority'], 1) for step in next_steps]
            step_timeframes = [step['timeframe'] for step in next_steps]
            
            fig.add_trace(
                go.Scatter(
                    x=step_names,
                    y=step_priorities,
                    mode='markers',
                    marker=dict(
                        size=20,
                        color=step_priorities,
                        colorscale='Reds',
                        showscale=True
                    ),
                    hovertemplate='<b>%{x}</b><br>Priority Level: %{y}<br>Timeframe: %{customdata}<extra></extra>',
                    customdata=step_timeframes
                ),
                row=4, col=2
            )
        
        # 12. ROI Projection Timeline
        current_score = scores['overall_percentage']
        months = list(range(0, 25, 3))  # 0 to 24 months, every 3 months
        
        # Simulate ROI curve based on readiness level
        if current_score < 30:
            roi_curve = [max(0, -10 + month * 2) for month in months]  # Start negative, slow growth
        elif current_score < 50:
            roi_curve = [max(0, -5 + month * 3) for month in months]   # Start slightly negative, moderate growth
        elif current_score < 70:
            roi_curve = [month * 4 for month in months]                # Positive from start, good growth
        else:
            roi_curve = [month * 5 + 10 for month in months]           # Strong positive from start
        
        fig.add_trace(
            go.Scatter(
                x=months,
                y=roi_curve,
                mode='lines+markers',
                line=dict(color='green', width=3),
                marker=dict(size=8),
                fill='tonexty',
                hovertemplate='Month %{x}<br>Projected ROI: %{y}%<extra></extra>'
            ),
            row=4, col=3
        )
        
        # Update layout with enhanced styling
        fig.update_layout(
            title={
                'text': f'<b>AI Readiness Assessment Dashboard</b><br><sub>Current Level: {readiness_level["title"]} ({readiness_level["percentage"]:.1f}%)</sub>',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 28, 'color': '#2C3E50'}
            },
            height=1600,
            showlegend=False,
            font=dict(size=11),
            plot_bgcolor='white',
            paper_bgcolor='#F8F9FA'
        )
        
        # Update subplot titles with enhanced formatting
        subplot_annotations = [
            "Overall AI Readiness Score",
            "Category Performance Analysis", 
            "Knowledge Level Distribution",
            "Readiness Level Progression",
            "Performance Consistency Analysis",
            "Learning Priority Matrix",
            "Success Probability Factors",
            "Timeline to AI Maturity",
            "Difficulty vs Performance",
            "Subcategory Performance",
            "Action Priority Matrix",
            "ROI Projection Timeline"
        ]
        
        # Add detailed annotations with insights
        key_insights_text = "<br>".join([f"• {insight}" for insight in insights['key_insights'][:3]])
        fig.add_annotation(
            x=0.02, y=0.98,
            text=f"<b>Key Insights:</b><br>{key_insights_text}",
            showarrow=False,
            bgcolor="lightblue",
            bordercolor="navy",
            xref="paper", yref="paper",
            align="left",
            font=dict(size=10)
        )
        
        # Save file
        if save_path:
            fig.write_html(save_path)
        else:
            save_path = f"enhanced_ai_dashboard_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            fig.write_html(save_path)
        
        return save_path
    
    def create_detailed_insights_report(self, scores: Dict[str, Any], insights: Dict[str, Any], save_path: str = None) -> str:
        """Create a comprehensive insights report with detailed analysis and recommendations"""
        
        fig, axes = plt.subplots(3, 4, figsize=(24, 18))
        fig.suptitle('AI Readiness - Comprehensive Insights Report', fontsize=24, fontweight='bold', y=0.98)
        
        # 1. Readiness Level Progression
        ax = axes[0, 0]
        readiness_level = insights['readiness_level']
        levels = ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert']
        level_scores = [15, 40, 60, 77.5, 92.5]  # Midpoints of ranges
        current_index = next((i for i, (level, data) in enumerate(self.readiness_levels.items()) 
                             if data['range'][0] <= readiness_level['percentage'] < data['range'][1]), 0)
        
        colors = ['lightgray'] * len(levels)
        colors[current_index] = 'darkblue'
        
        bars = ax.bar(levels, level_scores, color=colors, alpha=0.7)
        bars[current_index].set_color('darkblue')
        ax.axhline(y=readiness_level['percentage'], color='red', linestyle='--', linewidth=2, label=f'Your Score: {readiness_level["percentage"]:.1f}%')
        ax.set_title('AI Readiness Level Progression', fontweight='bold')
        ax.set_ylabel('Score Range (%)')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # 2. Category Strengths vs Growth Areas
        ax = axes[0, 1]
        strengths = insights['strengths']
        growth_areas = insights['growth_areas']
        
        categories = list(scores['category_scores'].keys())
        percentages = [(scores['category_scores'][cat]['score'] / scores['category_scores'][cat]['max_score']) * 100 
                      for cat in categories]
        
        colors = ['green' if any(s['category'] == cat for s in strengths) else 
                 'red' if any(g['category'] == cat for g in growth_areas) else 'orange' 
                 for cat in categories]
        
        bars = ax.barh(categories, percentages, color=colors, alpha=0.7)
        ax.set_xlabel('Performance (%)')
        ax.set_title('Strengths vs Growth Areas', fontweight='bold')
        ax.axvline(x=50, color='gray', linestyle=':', alpha=0.7, label='Minimum Competency')
        ax.axvline(x=75, color='blue', linestyle=':', alpha=0.7, label='Strong Performance')
        ax.legend()
        
        # Add performance labels
        for i, (bar, pct) in enumerate(zip(bars, percentages)):
            ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2, 
                   f'{pct:.1f}%', va='center', fontweight='bold')
        
        # 3. Learning Priority Analysis
        ax = axes[0, 2]
        priorities = insights['learning_priorities']
        priority_categories = [p['category'][:15] for p in priorities]
        priority_scores = [p['priority_score'] for p in priorities]
        
        colors = plt.cm.Reds([score/max(priority_scores) for score in priority_scores])
        bars = ax.bar(priority_categories, priority_scores, color=colors)
        ax.set_title('Learning Priority Ranking', fontweight='bold')
        ax.set_ylabel('Priority Score')
        ax.tick_params(axis='x', rotation=45)
        
        # Add priority rank labels
        for i, (bar, score) in enumerate(zip(bars, priority_scores)):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                   f'#{i+1}', ha='center', va='bottom', fontweight='bold')
        
        # 4. Success Probability Analysis
        ax = axes[0, 3]
        success_factors = insights['success_factors']
        success_prob = success_factors['success_probability']
        
        # Create a donut chart for success probability
        labels = ['Success Probability', 'Risk Factors']
        sizes = [success_prob, 100 - success_prob]
        colors = ['green', 'red']
        
        wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%',
                                         startangle=90, pctdistance=0.85)
        
        # Add a circle at the center to create donut effect
        centre_circle = plt.Circle((0,0), 0.70, fc='white')
        ax.add_artist(centre_circle)
        ax.set_title('AI Implementation Success Probability', fontweight='bold')
        
        # 5. Timeline Projection with Milestones
        ax = axes[1, 0]
        timeline = insights['timeline_projection']
        
        if timeline['milestones']:
            milestones = timeline['milestones']
            milestone_names = [m['milestone'] for m in milestones]
            milestone_months = [m['estimated_months'] for m in milestones]
            milestone_scores = [m['target_score'] for m in milestones]
            
            # Create timeline visualization
            ax.plot(milestone_months, milestone_scores, 'o-', linewidth=3, markersize=8, color='blue')
            ax.fill_between(milestone_months, milestone_scores, alpha=0.3, color='lightblue')
            
            # Add milestone labels
            for i, (month, score, name) in enumerate(zip(milestone_months, milestone_scores, milestone_names)):
                ax.annotate(name, (month, score), xytext=(10, 10), textcoords='offset points',
                           bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7),
                           arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
            
            ax.set_xlabel('Months from Now')
            ax.set_ylabel('AI Readiness Score (%)')
            ax.set_title('AI Maturity Timeline Projection', fontweight='bold')
            ax.grid(True, alpha=0.3)
            ax.set_ylim(0, 100)
        
        # 6. Knowledge Level Deep Dive
        ax = axes[1, 1]
        level_insights = scores['level_insights']
        
        # Create stacked bar for categories by level
        level_categories = {}
        for level, data in level_insights.items():
            level_categories[level] = len(data['categories'])
        
        levels = list(level_categories.keys())
        counts = list(level_categories.values())
        colors_map = {'advanced': 'green', 'intermediate': 'blue', 'basic': 'orange', 
                     'limited': 'red', 'misconception': 'darkred', 'beginner': 'gray'}
        bar_colors = [colors_map.get(level, 'gray') for level in levels]
        
        bars = ax.bar(levels, counts, color=bar_colors, alpha=0.7)
        ax.set_title('Knowledge Level Distribution Analysis', fontweight='bold')
        ax.set_ylabel('Number of Responses')
        ax.tick_params(axis='x', rotation=45)
        
        # Add count labels
        for bar, count in zip(bars, counts):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                   str(count), ha='center', va='bottom', fontweight='bold')
        
        # 7. Performance Consistency Analysis
        ax = axes[1, 2]
        consistency = scores['performance_consistency']
        categories = list(scores['category_scores'].keys())
        percentages = [(scores['category_scores'][cat]['score'] / scores['category_scores'][cat]['max_score']) * 100 
                      for cat in categories]
        
        # Create consistency visualization
        mean_performance = np.mean(percentages)
        std_performance = np.std(percentages)
        
        ax.scatter(range(len(categories)), percentages, s=100, alpha=0.7, c=percentages, cmap='RdYlGn')
        ax.axhline(y=mean_performance, color='blue', linestyle='-', alpha=0.7, label=f'Average: {mean_performance:.1f}%')
        ax.axhline(y=mean_performance + std_performance, color='red', linestyle='--', alpha=0.7, label=f'+1 STD: {mean_performance + std_performance:.1f}%')
        ax.axhline(y=mean_performance - std_performance, color='red', linestyle='--', alpha=0.7, label=f'-1 STD: {mean_performance - std_performance:.1f}%')
        
        ax.set_xticks(range(len(categories)))
        ax.set_xticklabels([cat[:15] for cat in categories], rotation=45)
        ax.set_ylabel('Performance (%)')
        ax.set_title(f'Performance Consistency (σ={std_performance:.1f})', fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # 8. Difficulty vs Performance Matrix
        ax = axes[1, 3]
        difficulty_perf = scores['difficulty_performance']
        
        difficulties = list(difficulty_perf.keys())
        performances = [difficulty_perf[d]['performance_rate'] for d in difficulties]
        question_counts = [difficulty_perf[d]['count'] for d in difficulties]
        
        # Create bubble chart
        colors = plt.cm.viridis([p/100 for p in performances])
        scatter = ax.scatter(range(len(difficulties)), performances, 
                           s=[c*50 for c in question_counts], c=colors, alpha=0.7)
        
        ax.set_xticks(range(len(difficulties)))
        ax.set_xticklabels(difficulties)
        ax.set_ylabel('Performance Rate (%)')
        ax.set_title('Question Difficulty vs Performance', fontweight='bold')
        ax.grid(True, alpha=0.3)
        
        # Add performance labels
        for i, (perf, count) in enumerate(zip(performances, question_counts)):
            ax.text(i, perf + 2, f'{perf:.1f}%\n({count}q)', ha='center', va='bottom', fontsize=8)
        
        # 9. Next Steps Priority Matrix
        ax = axes[2, 0]
        next_steps = insights['next_steps']
        
        if next_steps:
            step_names = [step['action'][:20] + '...' if len(step['action']) > 20 else step['action'] for step in next_steps]
            priority_mapping = {'high': 4, 'medium': 3, 'strategic': 2, 'low': 1}
            step_priorities = [priority_mapping.get(step['priority'], 1) for step in next_steps]
            timeframe_mapping = {'Immediate': 1, 'Short-term': 2, 'Medium-term': 3, 'Long-term': 4}
            step_timeframes = [timeframe_mapping.get(step['timeframe'].split()[0], 2) for step in next_steps]
            
            # Create priority vs timeframe matrix
            colors = ['red' if p >= 4 else 'orange' if p >= 3 else 'yellow' if p >= 2 else 'gray' for p in step_priorities]
            scatter = ax.scatter(step_timeframes, step_priorities, s=200, c=colors, alpha=0.7)
            
            # Add step labels
            for i, (name, x, y) in enumerate(zip(step_names, step_timeframes, step_priorities)):
                ax.annotate(name, (x, y), xytext=(5, 5), textcoords='offset points', fontsize=8)
            
            ax.set_xlabel('Timeframe (1=Immediate, 4=Long-term)')
            ax.set_ylabel('Priority Level')
            ax.set_title('Next Steps Priority Matrix', fontweight='bold')
            ax.grid(True, alpha=0.3)
        
        # 10. ROI Projection Analysis
        ax = axes[2, 1]
        current_score = scores['overall_percentage']
        months = list(range(0, 25, 3))
        
        # Create multiple ROI scenarios based on different implementation approaches
        conservative_roi = [max(0, month * 1.5 - 5) for month in months]
        moderate_roi = [max(0, month * 3 - 10) for month in months]
        aggressive_roi = [max(0, month * 5 - 15) for month in months]
        
        ax.plot(months, conservative_roi, 'r--', label='Conservative Approach', linewidth=2)
        ax.plot(months, moderate_roi, 'b-', label='Balanced Approach', linewidth=3)
        ax.plot(months, aggressive_roi, 'g:', label='Aggressive Approach', linewidth=2)
        
        ax.fill_between(months, conservative_roi, moderate_roi, alpha=0.2, color='yellow')
        ax.fill_between(months, moderate_roi, aggressive_roi, alpha=0.2, color='green')
        
        ax.set_xlabel('Months from Implementation')
        ax.set_ylabel('Projected ROI (%)')
        ax.set_title('AI Implementation ROI Scenarios', fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # 11. Risk Assessment Heatmap
        ax = axes[2, 2]
        
        # Create risk assessment matrix
        risk_categories = ['Technical', 'Financial', 'Organizational', 'Strategic', 'Ethical']
        risk_levels = ['Low', 'Medium', 'High', 'Critical']
        
        # Generate risk scores based on assessment results
        risk_matrix = np.random.rand(len(risk_categories), len(risk_levels)) * 100
        
        # Adjust based on actual assessment results
        if scores['overall_percentage'] < 50:
            risk_matrix[:, -1] *= 1.5  # Higher critical risks for low readiness
        else:
            risk_matrix[:, 0] *= 1.5   # Lower risks for high readiness
        
        im = ax.imshow(risk_matrix, cmap='RdYlGn_r', aspect='auto')
        ax.set_xticks(range(len(risk_levels)))
        ax.set_xticklabels(risk_levels)
        ax.set_yticks(range(len(risk_categories)))
        ax.set_yticklabels(risk_categories)
        ax.set_title('AI Implementation Risk Assessment', fontweight='bold')
        
        # Add text annotations
        for i in range(len(risk_categories)):
            for j in range(len(risk_levels)):
                text = f'{risk_matrix[i, j]:.0f}'
                ax.text(j, i, text, ha="center", va="center", color="black" if risk_matrix[i, j] > 50 else "white")
        
        plt.colorbar(im, ax=ax, label='Risk Score')
        
        # 12. Recommendations Summary
        ax = axes[2, 3]
        recommendations = insights['recommendations']
        
        if recommendations:
            rec_categories = [rec['category'] for rec in recommendations]
            rec_priorities = [4 if rec['priority'] == 'high' else 2 if rec['priority'] == 'medium' else 1 for rec in recommendations]
            
            bars = ax.barh(rec_categories, rec_priorities, color=['red' if p >= 4 else 'orange' if p >= 2 else 'gray' for p in rec_priorities])
            ax.set_xlabel('Priority Level')
            ax.set_title('Key Recommendations by Priority', fontweight='bold')
            
            # Add timeline labels
            for i, (bar, rec) in enumerate(zip(bars, recommendations)):
                ax.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, 
                       rec['timeline'], va='center', fontsize=8)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        else:
            save_path = f"ai_insights_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.close()
        return save_path
    
    def generate_comprehensive_report(self, include_interactive: bool = True) -> Dict[str, Any]:
        """Generate comprehensive report with enhanced insights and visualizations"""
        
        # Calculate scores
        scores = self.calculate_scores()
        if not scores:
            return {"error": "No assessment data available"}
        
        # Generate insights
        insights = self.generate_personalized_insights(scores)
        
        # Create visualizations
        visual_files = {}
        
        try:
            # 1. Enhanced dashboard
            dashboard_file = self.create_enhanced_dashboard(scores, insights)
            visual_files['enhanced_dashboard'] = dashboard_file
            print(f"✅ Created enhanced dashboard: {dashboard_file}")
            
            # 2. Detailed insights report
            insights_file = self.create_detailed_insights_report(scores, insights)
            visual_files['insights_report'] = insights_file
            print(f"✅ Created insights report: {insights_file}")
            
            # 3. Create text-based comprehensive report
            text_report = self._create_text_report(scores, insights)
            
            # 4. Save text report
            report_filename = f"ai_assessment_comprehensive_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(report_filename, 'w', encoding='utf-8') as f:
                f.write(text_report)
            visual_files['text_report'] = report_filename
            print(f"✅ Created comprehensive text report: {report_filename}")
            
            print(f"\n🎯 Generated {len(visual_files)} comprehensive report files")
            
        except Exception as e:
            print(f"❌ Error generating comprehensive report: {str(e)}")
            visual_files['error'] = str(e)
        
        return {
            'visual_files': visual_files,
            'scores': scores,
            'insights': insights,
            'text_report': text_report if 'text_report' in locals() else None
        }
    
    def _create_text_report(self, scores: Dict[str, Any], insights: Dict[str, Any]) -> str:
        """Create comprehensive text-based report with detailed insights"""
        
        report = []
        report.append("="*80)
        report.append("AI READINESS ASSESSMENT - COMPREHENSIVE REPORT")
        report.append("="*80)
        report.append(f"Generated: {datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        report.append(f"Assessment Version: {self.assessment_metadata['version']}")
        report.append(f"Questions Answered: {scores['questions_answered']}/{self.assessment_metadata['total_questions']}")
        report.append("")
        
        # Executive Summary
        readiness_level = insights['readiness_level']
        report.append("EXECUTIVE SUMMARY")
        report.append("-" * 40)
        report.append(f"Overall AI Readiness Score: {scores['overall_percentage']:.1f}%")
        report.append(f"Readiness Level: {readiness_level['title']}")
        report.append(f"Description: {readiness_level['description']}")
        report.append(f"Primary Focus: {readiness_level['focus']}")
        report.append(f"Expected Timeline: {readiness_level['timeline']}")
        report.append("")
        
        # Key Insights
        report.append("KEY INSIGHTS")
        report.append("-" * 40)
        for i, insight in enumerate(insights['key_insights'], 1):
            report.append(f"{i}. {insight}")
        report.append("")
        
        # Category Performance Analysis
        report.append("CATEGORY PERFORMANCE ANALYSIS")
        report.append("-" * 40)
        category_scores = scores['category_scores']
        
        for category, data in category_scores.items():
            percentage = (data['score'] / data['max_score']) * 100
            report.append(f"\n{category.upper()}")
            report.append(f"  Score: {percentage:.1f}% ({data['score']:.1f}/{data['max_score']:.1f} points)")
            report.append(f"  Questions: {data['questions']}")
            report.append(f"  Weight: {data['weight']:.1f}")
            
            # Performance level
            if percentage >= 75:
                performance_level = "STRONG - This is a key strength area"
            elif percentage >= 50:
                performance_level = "ADEQUATE - Room for improvement"
            else:
                performance_level = "NEEDS ATTENTION - Priority development area"
            
            report.append(f"  Performance: {performance_level}")
            
            # Subcategory breakdown
            if data['subcategories']:
                report.append("  Subcategory Performance:")
                for subcategory, sub_data in data['subcategories'].items():
                    sub_pct = (sub_data['score'] / sub_data['max_score']) * 100
                    report.append(f"    - {subcategory}: {sub_pct:.1f}%")
        
        report.append("")
        
        # Strengths and Growth Areas
        report.append("STRENGTHS AND GROWTH AREAS")
        report.append("-" * 40)
        
        report.append("KEY STRENGTHS:")
        if insights['strengths']:
            for strength in insights['strengths']:
                report.append(f"  • {strength['category']}: {strength['percentage']:.1f}%")
        else:
            report.append("  • Focus on building foundational knowledge across all areas")
        
        report.append("\nPRIORITY GROWTH AREAS:")
        if insights['growth_areas']:
            for growth in insights['growth_areas']:
                report.append(f"  • {growth['category']}: {growth['percentage']:.1f}% - Needs immediate attention")
        else:
            report.append("  • Continue strengthening all areas for advanced AI implementation")
        
        report.append("")
        
        # Learning Priorities
        report.append("LEARNING PRIORITY RANKING")
        report.append("-" * 40)
        priorities = insights['learning_priorities']
        
        for i, priority in enumerate(priorities, 1):
            report.append(f"{i}. {priority['category']}")
            report.append(f"   Current Performance: {priority['current_performance']:.1f}%")
            report.append(f"   Priority Score: {priority['priority_score']:.2f}")
            report.append(f"   Recommended Focus: {priority['recommended_focus']}")
            report.append("")
        
        # Success Factors Analysis
        report.append("SUCCESS FACTORS ANALYSIS")
        report.append("-" * 40)
        success_factors = insights['success_factors']
        
        report.append(f"AI Implementation Success Probability: {success_factors['success_probability']:.1f}%")
        report.append("")
        
        if success_factors['supporting_factors']:
            report.append("SUPPORTING FACTORS (Strengths):")
            for factor in success_factors['supporting_factors']:
                report.append(f"  ✓ {factor['factor']}: {factor['score']:.1f}% - {factor['impact']}")
            report.append("")
        
        if success_factors['critical_factors']:
            report.append("CRITICAL FACTORS (Need Attention):")
            for factor in success_factors['critical_factors']:
                report.append(f"  ⚠ {factor['factor']}: {factor['score']:.1f}% - {factor['impact']}")
            report.append("")
        
        if success_factors['risk_factors']:
            report.append("RISK FACTORS (High Priority):")
            for factor in success_factors['risk_factors']:
                report.append(f"  ❌ {factor['factor']}: {factor['score']:.1f}% - {factor['impact']}")
            report.append("")
        
        # Detailed Recommendations
        report.append("DETAILED RECOMMENDATIONS")
        report.append("-" * 40)
        
        for i, recommendation in enumerate(insights['recommendations'], 1):
            report.append(f"\nRECOMMendation {i}: {recommendation['title']}")
            report.append(f"Category: {recommendation['category']}")
            report.append(f"Priority: {recommendation['priority'].upper()}")
            report.append(f"Timeline: {recommendation['timeline']}")
            report.append(f"Description: {recommendation['description']}")
            
            report.append("Action Steps:")
            for j, action in enumerate(recommendation['actions'], 1):
                report.append(f"  {j}. {action}")
            
            report.append(f"Expected Outcome: {recommendation['expected_outcome']}")
        
        report.append("")
        
        # Timeline Projection
        report.append("AI MATURITY TIMELINE PROJECTION")
        report.append("-" * 40)
        timeline = insights['timeline_projection']
        
        report.append(f"Current AI Readiness Score: {timeline['current_score']:.1f}%")
        
        if timeline['milestones']:
            report.append(f"Estimated Journey Time: {timeline['total_journey_time']} months")
            report.append("\nMILESTONE TIMELINE:")
            
            for milestone in timeline['milestones']:
                report.append(f"  {milestone['estimated_months']} months: {milestone['milestone']}")
                report.append(f"    Target Score: {milestone['target_score']}%")
                report.append(f"    Description: {milestone['description']}")
                report.append(f"    Confidence: {milestone['confidence']}")
                report.append("")
        
        report.append("Key Timeline Factors:")
        for factor in timeline['key_factors']:
            report.append(f"  • {factor}")
        
        report.append("")
        
        # Next Steps Action Plan
        report.append("NEXT STEPS ACTION PLAN")
        report.append("-" * 40)
        
        for step in insights['next_steps']:
            report.append(f"\n{step['timeframe'].upper()} - Priority: {step['priority'].upper()}")
            report.append(f"Action: {step['action']}")
            report.append(f"Description: {step['description']}")
            report.append(f"Expected Outcome: {step['outcome']}")
        
        report.append("")
        
        # Performance Analytics
        report.append("PERFORMANCE ANALYTICS")
        report.append("-" * 40)
        
        consistency = scores['performance_consistency']
        report.append(f"Performance Consistency Analysis:")
        report.append(f"  Standard Deviation: {consistency['std_deviation']:.2f}")
        report.append(f"  Performance Range: {consistency['range']:.1f}%")
        report.append(f"  Coefficient of Variation: {consistency['coefficient_of_variation']:.2f}")
        
        if consistency['coefficient_of_variation'] < 0.2:
            consistency_assessment = "Very consistent performance across categories"
        elif consistency['coefficient_of_variation'] < 0.4:
            consistency_assessment = "Moderately consistent performance"
        else:
            consistency_assessment = "Inconsistent performance - focus on weaker areas"
        
        report.append(f"  Assessment: {consistency_assessment}")
        report.append("")
        
        # Knowledge Level Analysis
        level_distribution = scores['level_distribution']
        total_responses = sum(level_distribution.values())
        
        report.append("Knowledge Level Distribution:")
        for level, count in level_distribution.items():
            percentage = (count / total_responses) * 100
            report.append(f"  {level.title()}: {count} responses ({percentage:.1f}%)")
        
        report.append("")
        
        # Difficulty Analysis
        difficulty_perf = scores['difficulty_performance']
        report.append("Question Difficulty Performance:")
        for difficulty, data in difficulty_perf.items():
            report.append(f"  {difficulty.title()}: {data['performance_rate']:.1f}% avg ({data['count']} questions)")
        
        report.append("")
        
        # Conclusion and Next Steps
        report.append("CONCLUSION")
        report.append("-" * 40)
        
        if scores['overall_percentage'] >= 85:
            conclusion = ("You demonstrate expert-level AI readiness with strong knowledge across all categories. "
                         "Focus on leading AI innovation and sharing best practices with others.")
        elif scores['overall_percentage'] >= 70:
            conclusion = ("You have advanced AI readiness and are well-positioned for strategic AI implementation. "
                         "Focus on scaling successful applications and optimizing ROI.")
        elif scores['overall_percentage'] >= 50:
            conclusion = ("You have intermediate AI readiness with a solid foundation for implementation. "
                         "Focus on pilot projects and building practical experience.")
        elif scores['overall_percentage'] >= 30:
            conclusion = ("You have developing AI readiness with basic understanding in place. "
                         "Focus on structured learning and identifying quick-win opportunities.")
        else:
            conclusion = ("You are at the beginning of your AI journey with significant learning opportunities ahead. "
                         "Focus on foundational education and building basic AI literacy.")
        
        report.append(conclusion)
        report.append("")
        
        report.append("IMMEDIATE NEXT STEPS (Next 30 Days):")
        immediate_steps = [step for step in insights['next_steps'] if 'Immediate' in step['timeframe']]
        if immediate_steps:
            for step in immediate_steps:
                report.append(f"  1. {step['action']}")
                report.append(f"     {step['description']}")
        else:
            report.append("  1. Complete foundational AI education")
            report.append("  2. Assess organizational AI opportunities")
            report.append("  3. Connect with AI community and resources")
        
        report.append("")
        report.append("="*80)
        report.append("END OF REPORT")
        report.append("="*80)
        
        return "\n".join(report)

# Usage example and demonstration
if __name__ == "__main__":
    print("🚀 Starting Enhanced AI Assessment with Rich Insights...")
    print("="*60)
    
    # Create enhanced assessment
    assessment = EnhancedAIAssessmentWithInsights()
    
    # Simulate comprehensive responses for testing
    print("🔬 Running comprehensive assessment simulation...")
    
    # Mix of responses to show different readiness levels
    sample_responses = [
        'B',  # Q1: Advanced understanding of AI business goals
        'B',  # Q2: Realistic view of AI capabilities
        'A',  # Q3: Understands AI vs automation difference
        'A',  # Q4: Good grasp of practical AI applications
        'A',  # Q5: Understands non-profit AI applications
        'A',  # Q6: Strategic approach to implementation
        'A',  # Q7: Recognizes AI limitations
        'A',  # Q8: Identifies key implementation barriers
        'B',  # Q9: Some gaps in preparation strategy
        'A',  # Q10: Realistic timeline expectations
        'A',  # Q11: Cost-effective approach understanding
        'A',  # Q12: Understands cost factors
        'A',  # Q13: Strong ethical awareness
        'A',  # Q14: Good bias management understanding
        'A'   # Q15: Comprehensive vendor evaluation
    ]
    
    # Record all responses
    for i, response in enumerate(sample_responses):
        success = assessment.record_response(i, response)
        if success:
            print(f"✅ Question {i+1}: {response}")
        else:
            print(f"❌ Question {i+1}: Failed to record {response}")
    
    print(f"\n📊 Generating comprehensive AI readiness report...")
    print("This may take a moment as we create detailed visualizations and insights...")
    
    # Generate comprehensive report
    comprehensive_report = assessment.generate_comprehensive_report(include_interactive=True)
    
    if 'error' in comprehensive_report:
        print(f"❌ Error generating report: {comprehensive_report['error']}")
    else:
        print("\n" + "="*80)
        print("🎨 ENHANCED AI READINESS ASSESSMENT COMPLETED")
        print("="*80)
        
        # Display file results
        visual_files = comprehensive_report['visual_files']
        for file_type, filename in visual_files.items():
            if file_type != 'error':
                print(f"📁 {file_type.replace('_', ' ').title()}: {filename}")
        
        # Display key metrics
        scores = comprehensive_report['scores']
        insights = comprehensive_report['insights']
        
        print(f"\n📈 KEY RESULTS:")
        print(f"  Overall AI Readiness Score: {scores['overall_percentage']:.1f}%")
        print(f"  Readiness Level: {insights['readiness_level']['title']}")
        print(f"  Questions Answered: {scores['questions_answered']}")
        print(f"  Success Probability: {insights['success_factors']['success_probability']:.1f}%")
        
        # Display top insights
        print(f"\n🔍 TOP INSIGHTS:")
        for i, insight in enumerate(insights['key_insights'][:3], 1):
            print(f"  {i}. {insight}")
        
        # Display next steps
        print(f"\n🎯 IMMEDIATE NEXT STEPS:")
        immediate_steps = [step for step in insights['next_steps'] if 'Immediate' in step['timeframe']]
        for i, step in enumerate(immediate_steps[:2], 1):
            print(f"  {i}. {step['action']}")
        
        print(f"\n📋 Total Files Generated: {len([f for f in visual_files.keys() if f != 'error'])}")
        print("✨ Assessment complete! Check the generated files for detailed insights.")
        
        # Display sample of text report
        if comprehensive_report['text_report']:
            print(f"\n📄 SAMPLE FROM TEXT REPORT:")
            print("-" * 50)
            lines = comprehensive_report['text_report'].split('\n')
            for line in lines[6:16]:  # Show a sample of the executive summary
                print(line)
            print("... (See full text report file for complete analysis)")
        
        print("\n" + "="*80)
            