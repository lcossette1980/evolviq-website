import json
import datetime
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
import statistics
from matplotlib.patches import Rectangle
import matplotlib.patches as mpatches
import textwrap
from dataclasses import dataclass

@dataclass
class InsightNarrative:
    """Container for rich narrative insights"""
    title: str
    summary: str
    key_findings: List[str]
    recommendations: List[str]
    risk_factors: List[str]
    success_indicators: List[str]
    timeline_expectations: str
    investment_implications: str

class EnhancedOrganizationalAIReadiness:
    """
    Enhanced Organizational AI Readiness Assessment with Rich Narratives and Deep Insights
    
    This comprehensive assessment tool evaluates organizational readiness for AI adoption
    across 8 critical dimensions, providing executive-level insights, detailed visual
    analytics, and actionable strategic recommendations.
    """
    
    def __init__(self):
        self.questions = self._initialize_questions()
        self.user_responses = {}
        self.organization_info = {}
        self.insights_cache = {}
        
        # Enhanced visualization styling
        plt.style.use('seaborn-v0_8-darkgrid')
        sns.set_palette("husl")
        
        # Define industry benchmarks and characteristics
        self.industry_profiles = self._initialize_industry_profiles()
        self.maturity_frameworks = self._initialize_maturity_frameworks()
        
    def _initialize_industry_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Initialize industry-specific AI readiness profiles and benchmarks"""
        return {
            'Technology': {
                'avg_readiness': 75,
                'critical_factors': ['Data Infrastructure', 'Human Resources & Skills'],
                'common_challenges': ['Scaling AI across products', 'Talent competition', 'Technical debt'],
                'success_patterns': ['Cloud-first architecture', 'Strong data culture', 'Agile methodologies'],
                'investment_focus': ['Advanced ML platforms', 'AI talent acquisition', 'Infrastructure scaling']
            },
            'Financial Services': {
                'avg_readiness': 70,
                'critical_factors': ['Governance & Ethics', 'Data Infrastructure'],
                'common_challenges': ['Regulatory compliance', 'Legacy systems', 'Risk management'],
                'success_patterns': ['Robust governance', 'Gradual digital transformation', 'Partnership strategies'],
                'investment_focus': ['Compliance tools', 'Legacy modernization', 'Risk management AI']
            },
            'Healthcare': {
                'avg_readiness': 60,
                'critical_factors': ['Governance & Ethics', 'Data Infrastructure'],
                'common_challenges': ['Data privacy regulations', 'Integration complexity', 'Clinical workflow adoption'],
                'success_patterns': ['Interdisciplinary teams', 'Pilot-driven approach', 'Strong clinical leadership'],
                'investment_focus': ['Privacy-preserving AI', 'Clinical decision support', 'Integration platforms']
            },
            'Manufacturing': {
                'avg_readiness': 55,
                'critical_factors': ['Technology Infrastructure', 'Process & Operations'],
                'common_challenges': ['OT/IT integration', 'Workforce training', 'ROI measurement'],
                'success_patterns': ['IoT foundation', 'Operational excellence culture', 'Phased automation'],
                'investment_focus': ['Industrial IoT', 'Predictive maintenance', 'Quality systems']
            },
            'Retail': {
                'avg_readiness': 65,
                'critical_factors': ['Market & Customer Focus', 'Data Infrastructure'],
                'common_challenges': ['Customer data integration', 'Omnichannel complexity', 'Personalization scale'],
                'success_patterns': ['Customer-centric culture', 'Agile marketing', 'Data-driven decisions'],
                'investment_focus': ['Customer analytics', 'Personalization engines', 'Supply chain optimization']
            },
            'Education': {
                'avg_readiness': 50,
                'critical_factors': ['Human Resources & Skills', 'Financial Resources'],
                'common_challenges': ['Limited budgets', 'Change resistance', 'Privacy concerns'],
                'success_patterns': ['Faculty champions', 'Student engagement', 'Incremental adoption'],
                'investment_focus': ['Learning platforms', 'Faculty training', 'Student analytics']
            },
            'Government': {
                'avg_readiness': 45,
                'critical_factors': ['Governance & Ethics', 'Process & Operations'],
                'common_challenges': ['Procurement processes', 'Public accountability', 'Legacy systems'],
                'success_patterns': ['Citizen-centric design', 'Transparency initiatives', 'Cross-agency collaboration'],
                'investment_focus': ['Citizen services', 'Process automation', 'Decision support tools']
            }
        }
    
    def _initialize_maturity_frameworks(self) -> Dict[str, Dict[str, Any]]:
        """Initialize AI maturity framework definitions"""
        return {
            'not_ready': {
                'label': 'Not Ready',
                'description': 'Organization lacks fundamental prerequisites for AI adoption',
                'characteristics': [
                    'No AI strategy or leadership commitment',
                    'Poor data quality and infrastructure',
                    'Limited technical capabilities',
                    'Resistance to technological change'
                ],
                'timeline': '12-18 months to reach basic readiness',
                'investment_priority': 'Foundation building - data, skills, culture'
            },
            'limited': {
                'label': 'Limited Readiness',
                'description': 'Basic prerequisites exist but significant gaps remain',
                'characteristics': [
                    'Emerging leadership interest in AI',
                    'Some data collection but quality issues',
                    'Limited technical expertise',
                    'Mixed attitudes toward change'
                ],
                'timeline': '9-12 months to pilot readiness',
                'investment_priority': 'Capability building - training, infrastructure, governance'
            },
            'emerging': {
                'label': 'Emerging Readiness',
                'description': 'Foundational elements in place, ready for structured AI exploration',
                'characteristics': [
                    'Basic AI awareness and some strategic interest',
                    'Adequate data with improvement opportunities',
                    'Some technical skills but need AI expertise',
                    'Generally positive attitude toward innovation'
                ],
                'timeline': '6-9 months to first pilots',
                'investment_priority': 'Pilot preparation - use case identification, team building'
            },
            'developing': {
                'label': 'Developing Readiness',
                'description': 'Good foundation with clear path to AI implementation',
                'characteristics': [
                    'Strategic AI planning underway',
                    'Good data infrastructure with some gaps',
                    'Growing technical capabilities',
                    'Active change management processes'
                ],
                'timeline': '3-6 months to pilot launch',
                'investment_priority': 'Implementation focus - platforms, advanced training, scaling'
            },
            'advanced': {
                'label': 'Advanced Readiness',
                'description': 'Strong readiness for immediate AI deployment and scaling',
                'characteristics': [
                    'Comprehensive AI strategy and commitment',
                    'High-quality data and modern infrastructure',
                    'Strong technical team with AI expertise',
                    'Culture of innovation and data-driven decisions'
                ],
                'timeline': '1-3 months to deployment',
                'investment_priority': 'Scaling and optimization - advanced AI, automation, innovation'
            }
        }
    
    def _initialize_questions(self) -> List[Dict[str, Any]]:
        """Initialize comprehensive organizational readiness questions with enhanced context"""
        return [
            {
                "id": 1,
                "category": "Leadership & Strategy",
                "weight": 2.2,
                "question": "How committed is your organization's leadership to AI initiatives?",
                "context": "Leadership commitment is the strongest predictor of AI success. Organizations with executive champions achieve 2.5x better outcomes.",
                "business_impact": "High - Sets tone, allocates resources, drives adoption",
                "options": {
                    "A": {"text": "Executives actively champion AI with dedicated resources and clear accountability", "score": 5, "level": "advanced"},
                    "B": {"text": "Leadership supports AI with allocated budget and some strategic planning", "score": 3, "level": "developing"},
                    "C": {"text": "Leadership is interested but commitments remain informal and limited", "score": 2, "level": "emerging"},
                    "D": {"text": "Leadership is skeptical or neutral, requiring significant convincing", "score": 1, "level": "limited"},
                    "E": {"text": "Leadership actively resists or blocks AI initiatives", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 2,
                "category": "Leadership & Strategy",
                "weight": 1.9,
                "question": "Does your organization have a defined AI strategy or roadmap?",
                "context": "Strategic planning prevents ad-hoc AI investments and ensures alignment with business objectives. 70% of successful AI organizations have documented strategies.",
                "business_impact": "High - Guides investment, prevents fragmentation, ensures ROI",
                "options": {
                    "A": {"text": "Comprehensive AI strategy with timeline, metrics, governance, and regular reviews", "score": 5, "level": "advanced"},
                    "B": {"text": "Basic AI strategy document with goals and high-level roadmap", "score": 3, "level": "developing"},
                    "C": {"text": "Informal AI plans and discussions but no documented strategy", "score": 2, "level": "emerging"},
                    "D": {"text": "Considering AI but no strategic planning has begun", "score": 1, "level": "limited"},
                    "E": {"text": "No AI strategy or strategic planning discussions", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 3,
                "category": "Data Infrastructure",
                "weight": 2.4,
                "question": "How would you describe your organization's data quality and accessibility?",
                "context": "Data is the foundation of AI. Poor data quality is the #1 reason for AI project failure, affecting 85% of unsuccessful initiatives.",
                "business_impact": "Critical - Determines AI feasibility, accuracy, and business value",
                "options": {
                    "A": {"text": "High-quality, well-governed data with automated pipelines and real-time access", "score": 5, "level": "advanced"},
                    "B": {"text": "Good data quality with some manual processes and minor integration gaps", "score": 4, "level": "developing"},
                    "C": {"text": "Adequate data but inconsistent quality, formats, and accessibility", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited data collection with significant quality and integration issues", "score": 2, "level": "limited"},
                    "E": {"text": "Poor data quality with minimal collection and major accessibility barriers", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 4,
                "category": "Data Infrastructure",
                "weight": 2.1,
                "question": "How secure and compliant is your data management?",
                "context": "Data security and compliance are non-negotiable for AI success. Breaches can cost organizations $4.45M on average and destroy AI program credibility.",
                "business_impact": "Critical - Enables AI deployment, prevents legal issues, builds trust",
                "options": {
                    "A": {"text": "Robust security with full regulatory compliance (GDPR, HIPAA, SOX) and regular audits", "score": 5, "level": "advanced"},
                    "B": {"text": "Good security practices with most compliance requirements met and monitoring", "score": 4, "level": "developing"},
                    "C": {"text": "Basic security measures with some compliance gaps and informal monitoring", "score": 3, "level": "emerging"},
                    "D": {"text": "Minimal security protocols with significant compliance concerns", "score": 1, "level": "limited"},
                    "E": {"text": "Major security vulnerabilities or compliance violations", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 5,
                "category": "Technology Infrastructure",
                "weight": 1.9,
                "question": "How would you rate your organization's current technology infrastructure?",
                "context": "Modern, scalable infrastructure is essential for AI workloads. Cloud adoption accelerates AI deployment by 60% compared to on-premise only.",
                "business_impact": "High - Affects AI performance, scalability, and implementation speed",
                "options": {
                    "A": {"text": "Modern, cloud-native architecture with scalable computing and AI-ready platforms", "score": 5, "level": "advanced"},
                    "B": {"text": "Hybrid cloud infrastructure with good scalability and modern development practices", "score": 4, "level": "developing"},
                    "C": {"text": "Mix of modern and legacy systems with limited cloud capabilities", "score": 3, "level": "emerging"},
                    "D": {"text": "Primarily legacy systems with minimal modernization and cloud adoption", "score": 2, "level": "limited"},
                    "E": {"text": "Outdated systems requiring major upgrades before AI consideration", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 6,
                "category": "Technology Infrastructure",
                "weight": 1.7,
                "question": "What is your organization's experience with automation technologies?",
                "context": "Automation experience builds organizational comfort with AI and demonstrates ability to adopt algorithmic decision-making.",
                "business_impact": "Medium - Indicates change readiness and technical maturity",
                "options": {
                    "A": {"text": "Extensive automation across business processes with measurable ROI and expansion plans", "score": 5, "level": "advanced"},
                    "B": {"text": "Several automated processes with documented benefits and ongoing expansion", "score": 4, "level": "developing"},
                    "C": {"text": "Basic automation in some areas (email, scheduling) with interest in expansion", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited automation, mostly manual processes with some tool usage", "score": 2, "level": "limited"},
                    "E": {"text": "Minimal or no automation, manual approach to most business processes", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 7,
                "category": "Human Resources & Skills",
                "weight": 2.0,
                "question": "What technical skills exist within your organization?",
                "context": "Technical expertise is crucial for AI success. Organizations with in-house AI skills achieve 40% better outcomes than those relying solely on external resources.",
                "business_impact": "Critical - Determines implementation capability and long-term sustainability",
                "options": {
                    "A": {"text": "Data scientists, ML engineers, or AI specialists on staff with proven track record", "score": 5, "level": "advanced"},
                    "B": {"text": "Strong technical team with data analysis capabilities and AI learning initiatives", "score": 4, "level": "developing"},
                    "C": {"text": "Basic technical skills with some data analysis but no specialized AI expertise", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited technical capabilities, heavily dependent on external support", "score": 2, "level": "limited"},
                    "E": {"text": "Minimal technical skills across the organization", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 8,
                "category": "Human Resources & Skills",
                "weight": 1.8,
                "question": "How receptive are employees to technological change?",
                "context": "Employee acceptance is critical for AI adoption. Change resistance causes 60% of technology implementations to fail or underperform.",
                "business_impact": "High - Affects adoption speed, user satisfaction, and ultimate success",
                "options": {
                    "A": {"text": "Employees embrace new technology, actively seek training, and drive innovation", "score": 5, "level": "advanced"},
                    "B": {"text": "Generally positive attitude with structured change management reducing resistance", "score": 4, "level": "developing"},
                    "C": {"text": "Mixed reactions with both enthusiasm and concerns requiring active management", "score": 3, "level": "emerging"},
                    "D": {"text": "Significant resistance to technological changes requiring intensive change management", "score": 2, "level": "limited"},
                    "E": {"text": "Strong resistance to any technological changes", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 9,
                "category": "Financial Resources",
                "weight": 1.8,
                "question": "What is your organization's capacity for AI investment?",
                "context": "Adequate funding is essential for AI success. Successful AI implementations typically require 18-24 months of sustained investment.",
                "business_impact": "High - Determines scope, timeline, and sustainability of AI initiatives",
                "options": {
                    "A": {"text": "Dedicated AI budget with multi-year funding commitment and success metrics", "score": 5, "level": "advanced"},
                    "B": {"text": "Allocated funds within technology budget with business case approval process", "score": 4, "level": "developing"},
                    "C": {"text": "Limited budget but willingness to invest for proven AI solutions with clear ROI", "score": 3, "level": "emerging"},
                    "D": {"text": "Tight budget constraints requiring strong ROI proof before any investment", "score": 2, "level": "limited"},
                    "E": {"text": "No available budget for AI initiatives", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 10,
                "category": "Financial Resources",
                "weight": 1.6,
                "question": "How does your organization typically approach technology investments?",
                "context": "Investment approach indicates organizational maturity and ability to sustain long-term AI initiatives.",
                "business_impact": "Medium - Affects investment timeline and success sustainability",
                "options": {
                    "A": {"text": "Strategic, long-term technology investments with portfolio approach and measured ROI", "score": 5, "level": "advanced"},
                    "B": {"text": "Regular technology updates with business case requirements and ROI tracking", "score": 4, "level": "developing"},
                    "C": {"text": "Cautious approach, investing in proven technologies with clear business benefits", "score": 3, "level": "emerging"},
                    "D": {"text": "Minimal technology investment, reactive approach to critical needs", "score": 2, "level": "limited"},
                    "E": {"text": "Avoid technology investments unless absolutely critical for operations", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 11,
                "category": "Process & Operations",
                "weight": 1.8,
                "question": "How well-documented and standardized are your business processes?",
                "context": "Well-defined processes are essential for AI integration. Process standardization reduces AI implementation time by 40%.",
                "business_impact": "High - Affects AI integration complexity and success probability",
                "options": {
                    "A": {"text": "Fully documented, standardized processes with regular reviews and continuous improvement", "score": 5, "level": "advanced"},
                    "B": {"text": "Most processes documented with good standardization and periodic updates", "score": 4, "level": "developing"},
                    "C": {"text": "Basic documentation with some standardization but inconsistent execution", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited documentation with processes varying significantly by person/department", "score": 2, "level": "limited"},
                    "E": {"text": "Minimal documentation with ad-hoc approach to most business processes", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 12,
                "category": "Process & Operations",
                "weight": 1.7,
                "question": "How does your organization handle change management?",
                "context": "Effective change management increases technology adoption success rates by 75% and reduces implementation risks.",
                "business_impact": "High - Determines adoption success and user satisfaction",
                "options": {
                    "A": {"text": "Structured change management with proven methodologies, training programs, and success tracking", "score": 5, "level": "advanced"},
                    "B": {"text": "Good change communication and training programs with stakeholder engagement", "score": 4, "level": "developing"},
                    "C": {"text": "Basic change communication but limited formal change management processes", "score": 3, "level": "emerging"},
                    "D": {"text": "Informal approach to change management with inconsistent results", "score": 2, "level": "limited"},
                    "E": {"text": "Poor change management leading to frequent implementation failures", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 13,
                "category": "Governance & Ethics",
                "weight": 1.9,
                "question": "How does your organization approach data governance and AI ethics?",
                "context": "Strong governance prevents AI failures and ensures responsible deployment. 90% of AI leaders cite governance as critical for scaling.",
                "business_impact": "Critical - Prevents risks, enables scaling, ensures responsible AI",
                "options": {
                    "A": {"text": "Established data governance with comprehensive AI ethics framework and regular compliance reviews", "score": 5, "level": "advanced"},
                    "B": {"text": "Good data governance policies with emerging AI ethics considerations and monitoring", "score": 4, "level": "developing"},
                    "C": {"text": "Basic data policies with some ethics awareness but no formal AI governance", "score": 3, "level": "emerging"},
                    "D": {"text": "Minimal data governance with limited consideration of AI ethics and risks", "score": 2, "level": "limited"},
                    "E": {"text": "No formal data governance or AI ethics policies", "score": 0, "level": "not_ready"}
                }
            },
            {
                "id": 14,
                "category": "Governance & Ethics",
                "weight": 1.8,
                "question": "How does your organization handle risk management?",
                "context": "Effective risk management is crucial for AI success. Organizations with mature risk frameworks achieve 50% fewer AI-related incidents.",
                "business_impact": "High - Prevents failures, ensures compliance, builds stakeholder confidence",
                "options": {
                    "A": {"text": "Comprehensive risk management with regular assessments, mitigation strategies, and board oversight", "score": 5, "level": "advanced"},
                    "B": {"text": "Good risk identification and mitigation with documented processes and regular reviews", "score": 4, "level": "developing"},
                    "C": {"text": "Basic risk management for major initiatives with some documented procedures", "score": 3, "level": "emerging"},
                    "D": {"text": "Informal risk management approach with limited documentation or consistency", "score": 2, "level": "limited"},
                    "E": {"text": "Minimal risk management practices", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 15,
                "category": "Market & Customer Focus",
                "weight": 1.6,
                "question": "How well does your organization understand customer needs and market trends?",
                "context": "Customer insight drives AI value creation. Organizations with strong market understanding achieve 3x better AI ROI.",
                "business_impact": "Medium - Guides AI use case selection and value creation",
                "options": {
                    "A": {"text": "Regular customer research with advanced analytics, market intelligence, and trend prediction", "score": 5, "level": "advanced"},
                    "B": {"text": "Good customer feedback systems with market monitoring and competitive analysis", "score": 4, "level": "developing"},
                    "C": {"text": "Basic customer insights with some market awareness and periodic research", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited customer research with minimal market analysis and trend awareness", "score": 2, "level": "limited"},
                    "E": {"text": "Minimal customer insights or market awareness", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 16,
                "category": "Market & Customer Focus",
                "weight": 1.5,
                "question": "How competitive is your industry regarding AI adoption?",
                "context": "Competitive pressure accelerates AI adoption but also increases implementation urgency and complexity.",
                "business_impact": "Medium - Affects timeline urgency and competitive advantage potential",
                "options": {
                    "A": {"text": "High AI competition with industry leaders demonstrating significant competitive advantages", "score": 5, "level": "advanced"},
                    "B": {"text": "Growing AI adoption among key competitors with visible business impact", "score": 4, "level": "developing"},
                    "C": {"text": "Some competitors exploring AI with pilot projects and initial implementations", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited AI adoption in industry with mostly exploratory activities", "score": 2, "level": "limited"},
                    "E": {"text": "No significant AI adoption among competitors", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 17,
                "category": "Performance Measurement",
                "weight": 1.7,
                "question": "How does your organization measure and track performance?",
                "context": "Strong measurement capabilities are essential for AI success. Data-driven organizations are 2.5x more likely to achieve AI goals.",
                "business_impact": "High - Enables AI ROI measurement and continuous improvement",
                "options": {
                    "A": {"text": "Comprehensive KPIs with real-time dashboards, predictive analytics, and automated reporting", "score": 5, "level": "advanced"},
                    "B": {"text": "Regular performance metrics with good reporting systems and trend analysis", "score": 4, "level": "developing"},
                    "C": {"text": "Basic metrics tracking with periodic reviews and standard reporting", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited performance measurement with manual reporting and irregular reviews", "score": 2, "level": "limited"},
                    "E": {"text": "Minimal or no systematic performance tracking", "score": 1, "level": "not_ready"}
                }
            },
            {
                "id": 18,
                "category": "Performance Measurement",
                "weight": 1.6,
                "question": "How data-driven is your organization's decision-making process?",
                "context": "Data-driven decision making is fundamental to AI culture. Organizations with strong data cultures achieve 30% better AI outcomes.",
                "business_impact": "High - Indicates cultural readiness for AI-driven insights",
                "options": {
                    "A": {"text": "Consistently data-driven decisions with advanced analytics, A/B testing, and evidence-based culture", "score": 5, "level": "advanced"},
                    "B": {"text": "Good mix of data-driven and experiential decision making with regular analysis", "score": 4, "level": "developing"},
                    "C": {"text": "Some use of data in decisions but often rely on experience and intuition", "score": 3, "level": "emerging"},
                    "D": {"text": "Limited use of data in decision making with primarily intuitive approaches", "score": 2, "level": "limited"},
                    "E": {"text": "Decisions primarily based on intuition, tradition, or hierarchy", "score": 1, "level": "not_ready"}
                }
            }
        ]
    
    def record_response(self, question_num: int, answer: str) -> bool:
        """Record user response with enhanced validation and context"""
        if question_num >= len(self.questions):
            return False
            
        answer = answer.upper().strip()
        q = self.questions[question_num]
        
        if answer in q['options']:
            self.user_responses[question_num] = {
                'answer': answer,
                'question_id': q['id'],
                'category': q['category'],
                'weight': q['weight'],
                'score': q['options'][answer]['score'],
                'level': q['options'][answer]['level'],
                'context': q.get('context', ''),
                'business_impact': q.get('business_impact', ''),
                'question_text': q['question']
            }
            return True
        else:
            return False
    
    def calculate_comprehensive_scores(self) -> Dict[str, Any]:
        """Calculate comprehensive organizational readiness scores with deep insights"""
        if not self.user_responses:
            return {}
        
        # Basic score calculations
        total_raw_score = sum(resp['score'] for resp in self.user_responses.values())
        max_possible_raw = sum(5 for _ in self.questions)
        
        total_weighted_score = sum(resp['score'] * resp['weight'] for resp in self.user_responses.values())
        max_possible_weighted = sum(5 * q['weight'] for q in self.questions)
        
        # Enhanced category analysis
        category_scores = {}
        for resp in self.user_responses.values():
            cat = resp['category']
            if cat not in category_scores:
                category_scores[cat] = {
                    'score': 0, 'max_score': 0, 'weight': 0, 'questions': 0, 
                    'responses': [], 'levels': [], 'business_impact': []
                }
            
            category_scores[cat]['score'] += resp['score'] * resp['weight']
            category_scores[cat]['max_score'] += 5 * resp['weight']
            category_scores[cat]['weight'] += resp['weight']
            category_scores[cat]['questions'] += 1
            category_scores[cat]['responses'].append(resp['score'])
            category_scores[cat]['levels'].append(resp['level'])
            category_scores[cat]['business_impact'].append(resp['business_impact'])
        
        # Calculate enhanced category metrics
        for cat, cat_data in category_scores.items():
            cat_data['percentage'] = (cat_data['score'] / cat_data['max_score']) * 100
            cat_data['consistency'] = 5 - statistics.stdev(cat_data['responses']) if len(cat_data['responses']) > 1 else 5
            cat_data['maturity_distribution'] = {level: cat_data['levels'].count(level) for level in set(cat_data['levels'])}
            cat_data['critical_impact_count'] = cat_data['business_impact'].count('Critical')
            cat_data['high_impact_count'] = cat_data['business_impact'].count('High')
        
        # Level distribution analysis
        level_counts = {}
        level_weighted_scores = {}
        for resp in self.user_responses.values():
            level = resp['level']
            weight = resp['weight']
            level_counts[level] = level_counts.get(level, 0) + 1
            level_weighted_scores[level] = level_weighted_scores.get(level, 0) + (resp['score'] * weight)
        
        # Overall metrics
        overall_percentage = (total_weighted_score / max_possible_weighted) * 100
        
        # Calculate readiness indicators
        readiness_indicators = self._calculate_readiness_indicators(category_scores, overall_percentage)
        
        # Risk assessment
        risk_assessment = self._calculate_risk_factors(category_scores)
        
        # Industry comparison
        industry_comparison = self._calculate_industry_comparison(overall_percentage, category_scores)
        
        return {
            'total_raw_score': total_raw_score,
            'max_possible_raw': max_possible_raw,
            'total_weighted_score': total_weighted_score,
            'max_possible_weighted': max_possible_weighted,
            'overall_percentage': overall_percentage,
            'category_scores': category_scores,
            'level_distribution': level_counts,
            'level_weighted_scores': level_weighted_scores,
            'questions_answered': len(self.user_responses),
            'readiness_indicators': readiness_indicators,
            'risk_assessment': risk_assessment,
            'industry_comparison': industry_comparison
        }
    
    def _calculate_readiness_indicators(self, category_scores: Dict, overall_score: float) -> Dict[str, Any]:
        """Calculate comprehensive readiness indicators"""
        # Critical success factors
        critical_categories = ['Leadership & Strategy', 'Data Infrastructure', 'Human Resources & Skills']
        critical_avg = np.mean([category_scores.get(cat, {}).get('percentage', 0) for cat in critical_categories])
        
        # Infrastructure readiness
        infrastructure_categories = ['Technology Infrastructure', 'Data Infrastructure']
        infrastructure_avg = np.mean([category_scores.get(cat, {}).get('percentage', 0) for cat in infrastructure_categories])
        
        # Cultural readiness
        cultural_categories = ['Human Resources & Skills', 'Process & Operations']
        cultural_avg = np.mean([category_scores.get(cat, {}).get('percentage', 0) for cat in cultural_categories])
        
        # Governance readiness
        governance_avg = category_scores.get('Governance & Ethics', {}).get('percentage', 0)
        
        # Success probability calculation
        success_factors = {
            'leadership': category_scores.get('Leadership & Strategy', {}).get('percentage', 0) * 0.25,
            'data': category_scores.get('Data Infrastructure', {}).get('percentage', 0) * 0.20,
            'skills': category_scores.get('Human Resources & Skills', {}).get('percentage', 0) * 0.20,
            'technology': category_scores.get('Technology Infrastructure', {}).get('percentage', 0) * 0.15,
            'governance': governance_avg * 0.10,
            'financial': category_scores.get('Financial Resources', {}).get('percentage', 0) * 0.10
        }
        
        success_probability = sum(success_factors.values())
        
        return {
            'critical_success_factors': critical_avg,
            'infrastructure_readiness': infrastructure_avg,
            'cultural_readiness': cultural_avg,
            'governance_readiness': governance_avg,
            'success_probability': success_probability,
            'success_factors_breakdown': success_factors,
            'implementation_timeline': self._estimate_implementation_timeline(overall_score),
            'investment_priority': self._calculate_investment_priority(category_scores)
        }
    
    def _calculate_risk_factors(self, category_scores: Dict) -> Dict[str, Any]:
        """Calculate comprehensive risk assessment"""
        risk_factors = {
            'data_security_risk': max(0, 85 - category_scores.get('Data Infrastructure', {}).get('percentage', 0)),
            'skills_gap_risk': max(0, 80 - category_scores.get('Human Resources & Skills', {}).get('percentage', 0)),
            'budget_constraint_risk': max(0, 75 - category_scores.get('Financial Resources', {}).get('percentage', 0)),
            'change_resistance_risk': max(0, 70 - category_scores.get('Process & Operations', {}).get('percentage', 0)),
            'technical_debt_risk': max(0, 80 - category_scores.get('Technology Infrastructure', {}).get('percentage', 0)),
            'governance_risk': max(0, 85 - category_scores.get('Governance & Ethics', {}).get('percentage', 0)),
            'market_pressure_risk': max(0, 60 - category_scores.get('Market & Customer Focus', {}).get('percentage', 0))
        }
        
        # Overall risk level
        high_risk_count = sum(1 for risk in risk_factors.values() if risk > 40)
        medium_risk_count = sum(1 for risk in risk_factors.values() if 20 <= risk <= 40)
        
        overall_risk_level = 'High' if high_risk_count >= 3 else 'Medium' if high_risk_count >= 1 or medium_risk_count >= 4 else 'Low'
        
        return {
            'risk_factors': risk_factors,
            'high_risk_count': high_risk_count,
            'medium_risk_count': medium_risk_count,
            'overall_risk_level': overall_risk_level,
            'top_risks': sorted(risk_factors.items(), key=lambda x: x[1], reverse=True)[:3]
        }
    
    def _calculate_industry_comparison(self, overall_score: float, category_scores: Dict) -> Dict[str, Any]:
        """Calculate industry-specific comparison and insights"""
        industry = self.organization_info.get('industry', 'Other')
        industry_profile = self.industry_profiles.get(industry, self.industry_profiles['Technology'])
        
        benchmark_score = industry_profile['avg_readiness']
        performance_vs_benchmark = overall_score - benchmark_score
        
        # Category performance vs industry critical factors
        industry_critical_performance = {}
        for critical_factor in industry_profile['critical_factors']:
            if critical_factor in category_scores:
                industry_critical_performance[critical_factor] = category_scores[critical_factor]['percentage']
        
        return {
            'industry': industry,
            'benchmark_score': benchmark_score,
            'performance_vs_benchmark': performance_vs_benchmark,
            'industry_position': 'Above Average' if performance_vs_benchmark > 5 else 'Below Average' if performance_vs_benchmark < -5 else 'Average',
            'critical_factors_performance': industry_critical_performance,
            'industry_challenges': industry_profile['common_challenges'],
            'success_patterns': industry_profile['success_patterns'],
            'recommended_investments': industry_profile['investment_focus']
        }
    
    def _estimate_implementation_timeline(self, overall_score: float) -> Dict[str, Any]:
        """Estimate realistic implementation timeline based on readiness"""
        if overall_score >= 85:
            return {
                'pilot_ready': '1-2 months',
                'production_ready': '3-6 months',
                'scaling_ready': '6-12 months',
                'maturity_level': 'Advanced - Ready for immediate deployment'
            }
        elif overall_score >= 70:
            return {
                'pilot_ready': '2-4 months',
                'production_ready': '6-9 months',
                'scaling_ready': '12-18 months',
                'maturity_level': 'Developing - Good foundation for structured implementation'
            }
        elif overall_score >= 55:
            return {
                'pilot_ready': '4-6 months',
                'production_ready': '9-15 months',
                'scaling_ready': '18-24 months',
                'maturity_level': 'Emerging - Requires capability building before pilots'
            }
        elif overall_score >= 40:
            return {
                'pilot_ready': '6-12 months',
                'production_ready': '15-24 months',
                'scaling_ready': '24-36 months',
                'maturity_level': 'Limited - Significant preparation needed'
            }
        else:
            return {
                'pilot_ready': '12-18 months',
                'production_ready': '24-36 months',
                'scaling_ready': '36+ months',
                'maturity_level': 'Not Ready - Foundation building required'
            }
    
    def _calculate_investment_priority(self, category_scores: Dict) -> List[Dict[str, Any]]:
        """Calculate investment priority matrix"""
        priorities = []
        
        for category, data in category_scores.items():
            gap = 100 - data['percentage']
            impact_score = data['weight'] * (data['critical_impact_count'] * 3 + data['high_impact_count'] * 2)
            
            priority = {
                'category': category,
                'gap': gap,
                'impact_score': impact_score,
                'priority_score': gap * impact_score / 100,
                'investment_urgency': 'High' if gap > 40 and impact_score > 6 else 'Medium' if gap > 25 or impact_score > 4 else 'Low'
            }
            priorities.append(priority)
        
        return sorted(priorities, key=lambda x: x['priority_score'], reverse=True)
    
    def generate_narrative_insights(self, scores: Dict[str, Any]) -> InsightNarrative:
        """Generate comprehensive narrative insights and recommendations"""
        overall_score = scores['overall_percentage']
        category_scores = scores['category_scores']
        risk_assessment = scores['risk_assessment']
        industry_comparison = scores['industry_comparison']
        readiness_indicators = scores['readiness_indicators']
        
        # Determine overall readiness level
        if overall_score >= 85:
            readiness_level = "Advanced AI Readiness"
            readiness_description = "exceptional foundation for immediate AI deployment"
        elif overall_score >= 70:
            readiness_level = "Strong AI Readiness" 
            readiness_description = "solid foundation with clear path to implementation"
        elif overall_score >= 55:
            readiness_level = "Moderate AI Readiness"
            readiness_description = "emerging capabilities requiring targeted improvements"
        elif overall_score >= 40:
            readiness_level = "Limited AI Readiness"
            readiness_description = "foundational gaps requiring significant preparation"
        else:
            readiness_level = "Early-Stage AI Readiness"
            readiness_description = "extensive foundation building needed before AI initiatives"
        
        # Generate key findings
        key_findings = []
        
        # Leadership and strategy insights
        leadership_score = category_scores.get('Leadership & Strategy', {}).get('percentage', 0)
        if leadership_score >= 80:
            key_findings.append(f"Strong executive leadership provides excellent foundation for AI success with {leadership_score:.1f}% readiness")
        elif leadership_score >= 60:
            key_findings.append(f"Leadership commitment exists but requires strengthening strategic planning and resource allocation ({leadership_score:.1f}% readiness)")
        else:
            key_findings.append(f"Leadership engagement is the critical bottleneck requiring immediate attention ({leadership_score:.1f}% readiness)")
        
        # Data infrastructure insights
        data_score = category_scores.get('Data Infrastructure', {}).get('percentage', 0)
        if data_score >= 80:
            key_findings.append(f"Excellent data foundation enables advanced AI applications with {data_score:.1f}% infrastructure readiness")
        elif data_score >= 60:
            key_findings.append(f"Good data foundation with improvement opportunities in quality and governance ({data_score:.1f}% readiness)")
        else:
            key_findings.append(f"Data infrastructure requires significant investment before AI implementation ({data_score:.1f}% readiness)")
        
        # Skills and culture insights
        skills_score = category_scores.get('Human Resources & Skills', {}).get('percentage', 0)
        if skills_score >= 80:
            key_findings.append(f"Strong technical capabilities and positive culture support rapid AI adoption ({skills_score:.1f}% readiness)")
        elif skills_score >= 60:
            key_findings.append(f"Good foundation with targeted skill development and change management needed ({skills_score:.1f}% readiness)")
        else:
            key_findings.append(f"Significant skills gap and cultural challenges require comprehensive development program ({skills_score:.1f}% readiness)")
        
        # Industry context
        benchmark_performance = industry_comparison['performance_vs_benchmark']
        if benchmark_performance > 10:
            key_findings.append(f"Organization significantly outperforms industry average by {benchmark_performance:.1f} points, positioning for competitive advantage")
        elif benchmark_performance > 0:
            key_findings.append(f"Organization performs {benchmark_performance:.1f} points above industry average with room for differentiation")
        else:
            key_findings.append(f"Organization trails industry benchmark by {abs(benchmark_performance):.1f} points, creating competitive urgency")
        
        # Generate recommendations
        recommendations = []
        
        # Top 3 priority areas
        investment_priorities = readiness_indicators['investment_priority'][:3]
        for i, priority in enumerate(investment_priorities, 1):
            category = priority['category']
            gap = priority['gap']
            urgency = priority['investment_urgency']
            
            if urgency == 'High':
                recommendations.append(f"Priority {i}: Immediate investment in {category} - {gap:.1f}% improvement potential with high business impact")
            elif urgency == 'Medium':
                recommendations.append(f"Priority {i}: Strategic focus on {category} - {gap:.1f}% improvement opportunity for sustained growth")
            else:
                recommendations.append(f"Priority {i}: Optimize {category} - {gap:.1f}% enhancement potential for competitive advantage")
        
        # Industry-specific recommendations
        industry_recommendations = industry_comparison['recommended_investments']
        recommendations.extend([f"Industry best practice: Focus on {rec}" for rec in industry_recommendations[:2]])
        
        # Risk-based recommendations
        top_risks = risk_assessment['top_risks'][:2]
        for risk_name, risk_level in top_risks:
            if risk_level > 40:
                risk_readable = risk_name.replace('_', ' ').title()
                recommendations.append(f"Critical risk mitigation: Address {risk_readable} with {risk_level:.1f}% risk exposure")
        
        # Generate risk factors
        risk_factors = []
        for risk_name, risk_level in risk_assessment['top_risks']:
            if risk_level > 20:
                risk_readable = risk_name.replace('_', ' ').title()
                severity = 'High' if risk_level > 40 else 'Medium'
                risk_factors.append(f"{severity} risk: {risk_readable} ({risk_level:.1f}% exposure)")
        
        if not risk_factors:
            risk_factors.append("Low overall risk profile with well-managed organizational factors")
        
        # Generate success indicators
        success_indicators = []
        success_prob = readiness_indicators['success_probability']
        
        if success_prob >= 80:
            success_indicators.append(f"Excellent success probability ({success_prob:.1f}%) with strong foundation across all factors")
        elif success_prob >= 65:
            success_indicators.append(f"Good success probability ({success_prob:.1f}%) with minor gaps to address")
        else:
            success_indicators.append(f"Moderate success probability ({success_prob:.1f}%) requiring targeted improvements")
        
        # Timeline and implementation indicators
        timeline = readiness_indicators['implementation_timeline']
        success_indicators.append(f"Pilot readiness timeline: {timeline['pilot_ready']}")
        success_indicators.append(f"Production deployment: {timeline['production_ready']}")
        success_indicators.append(f"Full scaling capability: {timeline['scaling_ready']}")
        
        # Investment implications
        if overall_score >= 80:
            investment_implication = f"Ready for significant AI investment ({overall_score:.1f}% readiness) with high probability of rapid returns. Focus on scaling and optimization rather than foundation building."
        elif overall_score >= 60:
            investment_implication = f"Good foundation ({overall_score:.1f}% readiness) justifies moderate AI investment with phased approach. Expect 12-18 month ROI timeline."
        elif overall_score >= 40:
            investment_implication = f"Emerging readiness ({overall_score:.1f}%) requires foundational investment before AI initiatives. Plan 18-24 month capability building phase."
        else:
            investment_implication = f"Limited readiness ({overall_score:.1f}%) indicates need for comprehensive organizational development before AI consideration. 24+ month preparation timeline recommended."
        
        return InsightNarrative(
            title=f"{readiness_level} Assessment",
            summary=f"Your organization demonstrates {readiness_description} with an overall AI readiness score of {overall_score:.1f}%. {industry_comparison['industry_position']} performance relative to {industry_comparison['industry']} industry standards.",
            key_findings=key_findings,
            recommendations=recommendations,
            risk_factors=risk_factors,
            success_indicators=success_indicators,
            timeline_expectations=f"Based on current readiness: {timeline['maturity_level']}",
            investment_implications=investment_implication
        )
    
    def create_executive_dashboard_enhanced(self, scores: Dict[str, Any], narrative: InsightNarrative, save_path: str = None) -> str:
        """Create enhanced executive dashboard with rich narratives and insights"""
        
        # Create comprehensive executive dashboard with narrative elements
        fig = make_subplots(
            rows=4, cols=3,
            subplot_titles=[
                'Overall AI Readiness Score', 'Critical Success Factors Analysis', 'Readiness Maturity Distribution',
                'Strategic Priority Matrix', 'Industry Benchmark Comparison', 'Risk Assessment Dashboard',
                'Implementation Roadmap', 'Investment Priority Framework', 'Success Probability Indicators',
                'Category Performance Heatmap', 'Cultural Readiness Assessment', 'ROI Projection Timeline'
            ],
            specs=[
                [{"type": "indicator"}, {"type": "bar"}, {"type": "pie"}],
                [{"type": "scatter"}, {"type": "bar"}, {"type": "bar"}],
                [{"type": "scatter"}, {"type": "scatter"}, {"type": "indicator"}],
                [{"type": "table", "colspan": 3}, None, None]
            ],
            vertical_spacing=0.08,
            horizontal_spacing=0.08
        )
        
        # Add comprehensive title with narrative summary
        main_title = f"""
        <b>{narrative.title}</b><br>
        <span style="font-size:14px">{narrative.summary}</span><br>
        <span style="font-size:12px; color:gray">Assessment Date: {datetime.datetime.now().strftime('%B %d, %Y')} | 
        Organization: {self.organization_info.get('name', 'Your Organization')}</span>
        """
        
        category_scores = scores['category_scores']
        overall_score = scores['overall_percentage']
        readiness_indicators = scores['readiness_indicators']
        risk_assessment = scores['risk_assessment']
        industry_comparison = scores['industry_comparison']
        
        # 1. Overall Readiness Gauge with Enhanced Context
        fig.add_trace(
            go.Indicator(
                mode="gauge+number+delta",
                value=overall_score,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': f"AI Readiness Score<br><span style='font-size:12px'>Success Probability: {readiness_indicators['success_probability']:.1f}%</span>"},
                delta={'reference': industry_comparison['benchmark_score'], 'increasing': {'color': "green"}},
                gauge={
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 40], 'color': "#FF6B6B"},
                        {'range': [40, 55], 'color': "#FFD93D"},
                        {'range': [55, 70], 'color': "#A8E6CF"},
                        {'range': [70, 85], 'color': "#6BCF7F"},
                        {'range': [85, 100], 'color': "#4CAF50"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': industry_comparison['benchmark_score']
                    }
                }
            ),
            row=1, col=1
        )
        
        # 2. Critical Success Factors with Impact Analysis
        critical_categories = ['Leadership & Strategy', 'Data Infrastructure', 'Human Resources & Skills', 'Technology Infrastructure']
        critical_scores = [category_scores.get(cat, {}).get('percentage', 0) for cat in critical_categories]
        critical_weights = [category_scores.get(cat, {}).get('weight', 1) for cat in critical_categories]
        
        # Color based on both performance and importance
        colors = []
        for score, weight in zip(critical_scores, critical_weights):
            if score < 50 and weight > 2.0:
                colors.append('#FF4444')  # High priority
            elif score < 70 and weight > 1.5:
                colors.append('#FF8800')  # Medium priority
            elif score >= 80:
                colors.append('#44AA44')  # Strong performance
            else:
                colors.append('#FFAA44')  # Developing
        
        fig.add_trace(
            go.Bar(
                x=critical_scores,
                y=[cat.replace(' & ', '<br>& ') for cat in critical_categories],
                orientation='h',
                marker_color=colors,
                text=[f'{score:.1f}%<br>Weight: {weight:.1f}' for score, weight in zip(critical_scores, critical_weights)],
                textposition='inside',
                textfont={'color': 'white', 'size': 10}
            ),
            row=1, col=2
        )
        
        # 3. Enhanced Readiness Level Distribution
        level_counts = scores['level_distribution']
        level_labels = {
            'advanced': f'Advanced<br>({level_counts.get("advanced", 0)} areas)',
            'developing': f'Developing<br>({level_counts.get("developing", 0)} areas)', 
            'emerging': f'Emerging<br>({level_counts.get("emerging", 0)} areas)',
            'limited': f'Limited<br>({level_counts.get("limited", 0)} areas)',
            'not_ready': f'Not Ready<br>({level_counts.get("not_ready", 0)} areas)'
        }
        
        labels = [level_labels.get(k, k) for k in level_counts.keys()]
        values = list(level_counts.values())
        colors_pie = ['#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#F44336']
        
        fig.add_trace(
            go.Pie(
                labels=labels,
                values=values,
                marker_colors=colors_pie[:len(labels)],
                hole=0.4,
                textinfo='label+percent',
                textfont={'size': 10}
            ),
            row=1, col=3
        )
        
        # 4. Strategic Priority Matrix with Investment Focus
        categories = list(category_scores.keys())
        urgency = [100 - category_scores[cat]['percentage'] for cat in categories]
        impact = [category_scores[cat]['weight'] * 15 for cat in categories]
        
        # Enhanced priority colors and sizing
        priority_colors = []
        bubble_sizes = []
        for urg, imp, cat in zip(urgency, impact, categories):
            if urg > 40 and imp > 30:
                priority_colors.append('#FF0000')  # Critical priority
                bubble_sizes.append(25)
            elif urg > 25 and imp > 20:
                priority_colors.append('#FF8800')  # High priority
                bubble_sizes.append(20)
            elif urg > 15:
                priority_colors.append('#FFAA00')  # Medium priority
                bubble_sizes.append(15)
            else:
                priority_colors.append('#44AA44')  # Maintain/optimize
                bubble_sizes.append(10)
        
        fig.add_trace(
            go.Scatter(
                x=urgency,
                y=impact,
                mode='markers+text',
                marker=dict(size=bubble_sizes, color=priority_colors, opacity=0.8, line=dict(width=2, color='white')),
                text=[cat.split(' ')[0] for cat in categories],
                textposition="middle center",
                textfont=dict(color="white", size=8, family="Arial Black"),
                showlegend=False,
                hovertemplate='<b>%{text}</b><br>Gap: %{x:.1f}%<br>Impact: %{y:.1f}<extra></extra>'
            ),
            row=2, col=1
        )
        
        # 5. Industry Benchmark Comparison
        benchmark_data = [
            industry_comparison['benchmark_score'],
            industry_comparison['benchmark_score'] + 15,  # Top quartile estimate
            overall_score
        ]
        benchmark_labels = [
            f"{industry_comparison['industry']}<br>Average",
            f"{industry_comparison['industry']}<br>Top Quartile",
            "Your<br>Organization"
        ]
        benchmark_colors = ['#888888', '#4CAF50', '#2196F3']
        
        fig.add_trace(
            go.Bar(
                x=benchmark_labels,
                y=benchmark_data,
                marker_color=benchmark_colors,
                text=[f'{score:.1f}%' for score in benchmark_data],
                textposition='outside',
                textfont={'size': 12, 'color': 'black'}
            ),
            row=2, col=2
        )
        
        # 6. Enhanced Risk Assessment
        risk_factors = risk_assessment['risk_factors']
        risk_names = [name.replace('_', ' ').title() for name in risk_factors.keys()]
        risk_values = list(risk_factors.values())
        risk_colors = ['#FF4444' if risk > 50 else '#FF8800' if risk > 30 else '#FFAA00' if risk > 15 else '#44AA44' for risk in risk_values]
        
        fig.add_trace(
            go.Bar(
                x=risk_names,
                y=risk_values,
                marker_color=risk_colors,
                text=[f'{risk:.0f}%' for risk in risk_values],
                textposition='outside',
                textfont={'size': 10}
            ),
            row=2, col=3
        )
        
        # 7. Implementation Roadmap with Milestones
        timeline_data = readiness_indicators['implementation_timeline']
        phases = ['Foundation', 'Pilot Phase', 'Production', 'Scale & Optimize']
        months = [0, 3, 8, 15]  # Adjust based on readiness
        
        if overall_score >= 80:
            readiness_curve = [95, 90, 85, 80]
        elif overall_score >= 60:
            readiness_curve = [80, 70, 60, 50]
        elif overall_score >= 40:
            readiness_curve = [60, 45, 35, 25]
        else:
            readiness_curve = [40, 25, 15, 10]
        
        fig.add_trace(
            go.Scatter(
                x=months,
                y=readiness_curve,
                mode='lines+markers+text',
                line=dict(color='#9C27B0', width=4),
                marker=dict(size=12, color='#9C27B0', line=dict(color='white', width=2)),
                text=phases,
                textposition="top center",
                textfont=dict(size=10, color='#9C27B0'),
                fill='tonexty'
            ),
            row=3, col=1
        )
        
        # 8. Investment Priority Framework
        investment_priorities = readiness_indicators['investment_priority'][:6]
        invest_categories = [p['category'].split(' ')[0] for p in investment_priorities]
        invest_priority_scores = [p['priority_score'] for p in investment_priorities]
        invest_urgency = [p['investment_urgency'] for p in investment_priorities]
        
        urgency_colors = {'High': '#FF4444', 'Medium': '#FF8800', 'Low': '#44AA44'}
        invest_colors = [urgency_colors[urgency] for urgency in invest_urgency]
        
        fig.add_trace(
            go.Scatter(
                x=invest_priority_scores,
                y=list(range(len(invest_categories))),
                mode='markers+text',
                marker=dict(
                    size=[20 + score/5 for score in invest_priority_scores],
                    color=invest_colors,
                    opacity=0.8,
                    line=dict(color='white', width=2)
                ),
                text=invest_categories,
                textposition="middle center",
                textfont=dict(color='white', size=9),
                showlegend=False
            ),
            row=3, col=2
        )
        
        # 9. Success Probability Indicators
        success_prob = readiness_indicators['success_probability']
        fig.add_trace(
            go.Indicator(
                mode="gauge+number",
                value=success_prob,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': f"Success<br>Probability<br><span style='font-size:10px'>{timeline_data['maturity_level']}</span>"},
                gauge={
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "purple"},
                    'steps': [
                        {'range': [0, 30], 'color': "#FFCDD2"},
                        {'range': [30, 60], 'color': "#FFF9C4"},
                        {'range': [60, 80], 'color': "#DCEDC8"},
                        {'range': [80, 100], 'color': "#C8E6C9"}
                    ]
                }
            ),
            row=3, col=3
        )
        
        # 10. Narrative Summary Table
        narrative_data = [
            ['Key Findings', '<br>'.join(narrative.key_findings[:3])],
            ['Top Recommendations', '<br>'.join(narrative.recommendations[:3])],
            ['Risk Factors', '<br>'.join(narrative.risk_factors[:3])],
            ['Success Indicators', '<br>'.join(narrative.success_indicators[:2])],
            ['Investment Focus', narrative.investment_implications]
        ]
        
        fig.add_trace(
            go.Table(
                header=dict(
                    values=['<b>Assessment Category</b>', '<b>Executive Summary</b>'],
                    fill_color='#1f77b4',
                    font_color='white',
                    font_size=12,
                    align='left'
                ),
                cells=dict(
                    values=[[row[0] for row in narrative_data], [row[1] for row in narrative_data]],
                    fill_color='#f8f9fa',
                    font_size=10,
                    align='left',
                    height=40
                )
            ),
            row=4, col=1
        )
        
        # Update layout with enhanced styling
        fig.update_layout(
            title={
                'text': main_title,
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 16, 'color': '#1A237E'}
            },
            height=1400,
            showlegend=False,
            font=dict(size=10, family="Arial"),
            plot_bgcolor='white',
            paper_bgcolor='#FAFAFA'
        )
        
        # Update specific subplot properties with enhanced labels
        fig.update_xaxes(title_text="Implementation Gap (%)", row=2, col=1)
        fig.update_yaxes(title_text="Strategic Impact (Weighted)", row=2, col=1)
        fig.update_xaxes(title_text="Benchmark Comparison", row=2, col=2)
        fig.update_yaxes(title_text="Readiness Score (%)", row=2, col=2)
        fig.update_xaxes(title_text="Risk Categories", row=2, col=3)
        fig.update_yaxes(title_text="Risk Exposure (%)", row=2, col=3)
        fig.update_xaxes(title_text="Timeline (Months)", row=3, col=1)
        fig.update_yaxes(title_text="Success Probability (%)", row=3, col=1)
        fig.update_xaxes(title_text="Priority Score", row=3, col=2)
        fig.update_yaxes(title_text="Investment Categories", row=3, col=2)
        
        # Add quadrant lines and annotations
        fig.add_hline(y=np.mean([category_scores[cat]['weight'] * 15 for cat in categories]), 
                      line_dash="dash", line_color="red", opacity=0.5, row=2, col=1)
        fig.add_vline(x=np.mean([100 - category_scores[cat]['percentage'] for cat in categories]), 
                      line_dash="dash", line_color="red", opacity=0.5, row=2, col=1)
        
        # Add annotations for quadrants
        fig.add_annotation(x=75, y=35, text="High Impact<br>High Urgency", showarrow=False, 
                          font=dict(size=10, color="red"), row=2, col=1)
        fig.add_annotation(x=25, y=35, text="High Impact<br>Low Urgency", showarrow=False, 
                          font=dict(size=10, color="orange"), row=2, col=1)
        fig.add_annotation(x=75, y=15, text="Low Impact<br>High Urgency", showarrow=False, 
                          font=dict(size=10, color="orange"), row=2, col=1)
        fig.add_annotation(x=25, y=15, text="Low Impact<br>Low Urgency", showarrow=False, 
                          font=dict(size=10, color="green"), row=2, col=1)
        
        if save_path:
            fig.write_html(save_path)
        else:
            save_path = f"enhanced_executive_dashboard_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            fig.write_html(save_path)
        
        return save_path
    
    def create_detailed_analysis_enhanced(self, scores: Dict[str, Any], narrative: InsightNarrative, save_path: str = None) -> str:
        """Create enhanced detailed analysis with rich insights and explanations"""
        category_scores = scores['category_scores']
        readiness_indicators = scores['readiness_indicators']
        risk_assessment = scores['risk_assessment']
        industry_comparison = scores['industry_comparison']
        
        # Create comprehensive analysis figure with enhanced styling
        fig, axes = plt.subplots(4, 3, figsize=(24, 20))
        fig.suptitle(f'{narrative.title} - Comprehensive Analysis\n{self.organization_info.get("name", "Your Organization")} | {datetime.datetime.now().strftime("%B %d, %Y")}', 
                     fontsize=28, fontweight='bold', y=0.98)
        
        # Add narrative summary as subtitle
        fig.text(0.5, 0.94, narrative.summary, ha='center', va='top', fontsize=14, 
                style='italic', wrap=True, color='#444444')
        
        # 1. Enhanced Category Readiness Heatmap with Insights
        ax1 = axes[0, 0]
        categories = list(category_scores.keys())
        percentages = [category_scores[cat]['percentage'] for cat in categories]
        consistency_scores = [category_scores[cat]['consistency'] for cat in categories]
        
        # Create dual heatmap: performance and consistency
        heatmap_data = np.column_stack([percentages, consistency_scores])
        im = ax1.imshow(heatmap_data, cmap='RdYlGn', aspect='auto', vmin=0, vmax=100)
        
        ax1.set_yticks(range(len(categories)))
        ax1.set_yticklabels([cat.replace(' & ', '\n& ') for cat in categories], fontsize=11)
        ax1.set_xticks([0, 1])
        ax1.set_xticklabels(['Performance', 'Consistency'], fontsize=12, fontweight='bold')
        ax1.set_title('Category Performance & Consistency Matrix', fontweight='bold', fontsize=14, pad=20)
        
        # Add detailed annotations
        for i, (perf, cons) in enumerate(zip(percentages, consistency_scores)):
            ax1.text(0, i, f'{perf:.1f}%', ha='center', va='center', 
                    color='white' if perf < 50 else 'black', fontweight='bold', fontsize=10)
            ax1.text(1, i, f'{cons:.1f}', ha='center', va='center', 
                    color='white' if cons < 3 else 'black', fontweight='bold', fontsize=10)
        
        # Add colorbar with interpretation
        cbar = plt.colorbar(im, ax=ax1, shrink=0.6)
        cbar.set_label('Readiness Level (%)', rotation=270, labelpad=20, fontsize=12)
        
        # 2. Enhanced AI Maturity Assessment with Industry Context
        ax2 = axes[0, 1]
        maturity_levels = ['Not Ready', 'Limited', 'Emerging', 'Developing', 'Advanced']
        level_counts = scores['level_distribution']
        
        # Get organization's distribution
        org_data = [
            level_counts.get('not_ready', 0),
            level_counts.get('limited', 0),
            level_counts.get('emerging', 0),
            level_counts.get('developing', 0),
            level_counts.get('advanced', 0)
        ]
        
        # Industry benchmark distribution (estimated)
        industry = industry_comparison['industry']
        if industry == 'Technology':
            industry_data = [1, 2, 4, 6, 5]
        elif industry == 'Financial Services':
            industry_data = [2, 3, 5, 5, 3]
        elif industry == 'Healthcare':
            industry_data = [3, 4, 6, 4, 1]
        else:
            industry_data = [2, 4, 6, 4, 2]
        
        x = np.arange(len(maturity_levels))
        width = 0.35
        
        bars1 = ax2.bar(x - width/2, org_data, width, label='Your Organization', 
                       color=['#F44336', '#FF9800', '#FFEB3B', '#8BC34A', '#4CAF50'], alpha=0.8)
        bars2 = ax2.bar(x + width/2, industry_data, width, label=f'{industry} Average', 
                       color='gray', alpha=0.6)
        
        ax2.set_title('AI Maturity Distribution vs Industry', fontweight='bold', fontsize=14)
        ax2.set_ylabel('Number of Assessment Areas', fontsize=12)
        ax2.set_xlabel('Maturity Level', fontsize=12)
        ax2.set_xticks(x)
        ax2.set_xticklabels(maturity_levels, rotation=15, ha='right')
        ax2.legend(fontsize=11)
        ax2.grid(True, alpha=0.3)
        
        # Add value labels
        for bars in [bars1, bars2]:
            for bar in bars:
                height = bar.get_height()
                if height > 0:
                    ax2.text(bar.get_x() + bar.get_width()/2, height + 0.1, 
                            str(int(height)), ha='center', va='bottom', fontweight='bold', fontsize=10)
        
        # 3. Strategic Success Factors Radar with Benchmarks
        ax3 = axes[0, 2]
        success_factors = list(readiness_indicators['success_factors_breakdown'].keys())
        success_values = [readiness_indicators['success_factors_breakdown'][factor] 
                         for factor in success_factors]
        
        # Industry benchmark values (estimated)
        benchmark_values = [industry_comparison['benchmark_score'] * 0.8 for _ in success_factors]
        
        # Create radar chart
        angles = np.linspace(0, 2 * np.pi, len(success_factors), endpoint=False).tolist()
        success_values_plot = success_values + [success_values[0]]
        benchmark_values_plot = benchmark_values + [benchmark_values[0]]
        angles += angles[:1]
        
        ax3 = plt.subplot(4, 3, 3, projection='polar')
        ax3.plot(angles, success_values_plot, 'o-', linewidth=3, color='#2196F3', label='Your Organization')
        ax3.fill(angles, success_values_plot, alpha=0.25, color='#2196F3')
        ax3.plot(angles, benchmark_values_plot, 's--', linewidth=2, color='#FF5722', label='Industry Benchmark')
        ax3.fill(angles, benchmark_values_plot, alpha=0.15, color='#FF5722')
        
        ax3.set_xticks(angles[:-1])
        ax3.set_xticklabels([factor.replace('_', ' ').title() for factor in success_factors], fontsize=10)
        ax3.set_ylim(0, 100)
        ax3.set_title('Critical Success Factors Analysis', fontweight='bold', fontsize=14, pad=30)
        ax3.grid(True)
        ax3.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0), fontsize=10)
        
        # 4. Enhanced Investment Priority Matrix with ROI Indicators
        ax4 = axes[1, 0]
        investment_needed = [100 - category_scores[cat]['percentage'] for cat in categories]
        potential_impact = [category_scores[cat]['weight'] * 20 for cat in categories]
        
        # Calculate estimated ROI for each category
        roi_estimates = []
        for inv, impact in zip(investment_needed, potential_impact):
            if inv > 0:
                roi_estimates.append(min(impact / inv * 100, 500))  # Cap at 500% ROI
            else:
                roi_estimates.append(0)
        
        scatter = ax4.scatter(investment_needed, potential_impact, 
                            s=[r*2 + 50 for r in roi_estimates], alpha=0.7,
                            c=roi_estimates, cmap='viridis', vmin=0, vmax=300)
        
        # Add category labels with ROI information
        for i, cat in enumerate(categories):
            ax4.annotate(f'{cat.split(" ")[0]}\nROI: {roi_estimates[i]:.0f}%', 
                        (investment_needed[i], potential_impact[i]),
                        xytext=(5, 5), textcoords='offset points', fontsize=9,
                        bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8))
        
        ax4.set_xlabel('Investment Needed (% Gap)', fontsize=12)
        ax4.set_ylabel('Potential Impact (Weighted Score)', fontsize=12)
        ax4.set_title('Investment Priority Matrix with ROI Estimates', fontweight='bold', fontsize=14)
        ax4.grid(True, alpha=0.3)
        
        # Add quadrant lines and labels
        ax4.axhline(y=np.mean(potential_impact), color='red', linestyle='--', alpha=0.5)
        ax4.axvline(x=np.mean(investment_needed), color='red', linestyle='--', alpha=0.5)
        
        quadrant_labels = ['High Impact\nLow Investment', 'High Impact\nHigh Investment', 
                          'Low Impact\nLow Investment', 'Low Impact\nHigh Investment']
        positions = [(10, 35), (80, 35), (10, 10), (80, 10)]
        colors = ['green', 'orange', 'gray', 'red']
        
        for label, pos, color in zip(quadrant_labels, positions, colors):
            ax4.text(pos[0], pos[1], label, ha='center', va='center', 
                    bbox=dict(boxstyle='round,pad=0.5', facecolor=color, alpha=0.3),
                    fontsize=10, fontweight='bold')
        
        # Add colorbar for ROI
        cbar = plt.colorbar(scatter, ax=ax4, shrink=0.6)
        cbar.set_label('Estimated ROI (%)', rotation=270, labelpad=20, fontsize=12)
        
        # 5. Comprehensive Risk Assessment with Mitigation Strategies
        ax5 = axes[1, 1]
        risk_factors = risk_assessment['risk_factors']
        risk_names = [name.replace('_', ' ').title() for name in risk_factors.keys()]
        risk_values = list(risk_factors.values())
        
        # Risk mitigation difficulty (estimated based on risk type)
        mitigation_difficulty = {
            'Data Security Risk': 3,
            'Skills Gap Risk': 4,
            'Budget Constraint Risk': 2,
            'Change Resistance Risk': 5,
            'Technical Debt Risk': 3,
            'Governance Risk': 2,
            'Market Pressure Risk': 1
        }
        
        difficulties = [mitigation_difficulty.get(name, 3) for name in risk_names]
        risk_colors = []
        
        for risk, diff in zip(risk_values, difficulties):
            if risk > 40 and diff >= 4:
                risk_colors.append('#FF0000')  # Critical - high risk, hard to mitigate
            elif risk > 40 or diff >= 4:
                risk_colors.append('#FF4444')  # High risk or hard to mitigate
            elif risk > 20:
                risk_colors.append('#FF8800')  # Medium risk
            else:
                risk_colors.append('#44AA44')  # Low risk
        
        bars = ax5.bar(risk_names, risk_values, color=risk_colors, alpha=0.8)
        ax5.set_title('Risk Assessment with Mitigation Complexity', fontweight='bold', fontsize=14)
        ax5.set_ylabel('Risk Exposure (%)', fontsize=12)
        ax5.tick_params(axis='x', rotation=45, labelsize=10)
        ax5.grid(True, alpha=0.3)
        
        # Add risk level and difficulty annotations
        for bar, risk, diff, name in zip(bars, risk_values, difficulties, risk_names):
            if risk > 10:
                difficulty_text = ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'][diff-1]
                ax5.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                        f'{risk:.0f}%\n({difficulty_text})', ha='center', va='bottom', 
                        fontweight='bold', fontsize=9)
        
        # Add risk threshold lines
        ax5.axhline(y=50, color='red', linestyle='--', alpha=0.7, label='Critical Risk Threshold')
        ax5.axhline(y=25, color='orange', linestyle='--', alpha=0.7, label='High Risk Threshold')
        ax5.legend(fontsize=10)
        
        # 6. Implementation Roadmap with Resource Requirements
        ax6 = axes[1, 2]
        timeline = readiness_indicators['implementation_timeline']
        phases = ['Foundation\n(Months 1-3)', 'Pilot Development\n(Months 4-8)', 
                 'Production Deploy\n(Months 9-15)', 'Scale & Optimize\n(Months 16-24)']
        
        # Resource requirements by phase (estimated based on readiness)
        overall_score = scores['overall_percentage']
        if overall_score >= 80:
            resource_requirements = [60, 80, 100, 120]  # Lower initial investment needed
            success_probabilities = [95, 90, 85, 80]
        elif overall_score >= 60:
            resource_requirements = [80, 100, 120, 140]
            success_probabilities = [80, 75, 70, 65]
        elif overall_score >= 40:
            resource_requirements = [100, 120, 140, 160]
            success_probabilities = [65, 55, 45, 40]
        else:
            resource_requirements = [120, 140, 160, 180]
            success_probabilities = [50, 40, 30, 25]
        
        # Create dual-axis plot
        ax6_twin = ax6.twinx()
        
        line1 = ax6.plot(phases, resource_requirements, 'o-', linewidth=3, markersize=8, 
                        color='#E91E63', label='Resource Requirements')
        line2 = ax6_twin.plot(phases, success_probabilities, 's-', linewidth=3, markersize=8, 
                             color='#4CAF50', label='Success Probability')
        
        ax6.set_ylabel('Resource Requirements (Index)', fontsize=12, color='#E91E63')
        ax6_twin.set_ylabel('Success Probability (%)', fontsize=12, color='#4CAF50')
        ax6.set_title('Implementation Roadmap: Resources vs Success', fontweight='bold', fontsize=14)
        ax6.tick_params(axis='x', rotation=15, labelsize=10)
        ax6.grid(True, alpha=0.3)
        
        # Add value labels
        for i, (phase, resource, prob) in enumerate(zip(phases, resource_requirements, success_probabilities)):
            ax6.text(i, resource + 5, f'{resource}', ha='center', va='bottom', 
                    fontweight='bold', color='#E91E63', fontsize=10)
            ax6_twin.text(i, prob + 2, f'{prob}%', ha='center', va='bottom', 
                         fontweight='bold', color='#4CAF50', fontsize=10)
        
        # Combine legends
        lines1, labels1 = ax6.get_legend_handles_labels()
        lines2, labels2 = ax6_twin.get_legend_handles_labels()
        ax6.legend(lines1 + lines2, labels1 + labels2, loc='upper left', fontsize=10)
        
        # 7. Organizational Capability Gap Analysis with Industry Benchmarks
        ax7 = axes[2, 0]
        target_scores = [industry_comparison['benchmark_score'] + 15] * len(categories)  # Industry leading performance
        current_scores = [category_scores[cat]['percentage'] for cat in categories]
        industry_avg = [industry_comparison['benchmark_score']] * len(categories)
        
        gap_to_target = [target - current for target, current in zip(target_scores, current_scores)]
        gap_to_industry = [industry - current for industry, current in zip(industry_avg, current_scores)]
        
        x_pos = np.arange(len(categories))
        width = 0.35
        
        bars1 = ax7.barh(x_pos - width/2, gap_to_industry, width, 
                        label='Gap to Industry Average', 
                        color=['#FF4444' if g > 10 else '#FF8800' if g > 0 else '#44AA44' for g in gap_to_industry],
                        alpha=0.8)
        bars2 = ax7.barh(x_pos + width/2, gap_to_target, width, 
                        label='Gap to Industry Leader', 
                        color=['#FF6666' if g > 20 else '#FFAA44' if g > 10 else '#66AA66' for g in gap_to_target],
                        alpha=0.8)
        
        ax7.set_yticks(x_pos)
        ax7.set_yticklabels([cat.replace(' & ', '\n& ') for cat in categories], fontsize=10)
        ax7.set_xlabel('Performance Gap (%)', fontsize=12)
        ax7.set_title('Capability Gap Analysis vs Industry', fontweight='bold', fontsize=14)
        ax7.legend(fontsize=11)
        ax7.grid(True, alpha=0.3, axis='x')
        
        # Add gap values
        for bars, gaps in [(bars1, gap_to_industry), (bars2, gap_to_target)]:
            for bar, gap in zip(bars, gaps):
                if abs(gap) > 2:
                    ax7.text(bar.get_width() + (1 if gap > 0 else -1), bar.get_y() + bar.get_height()/2, 
                            f'{gap:+.1f}%', va='center', ha='left' if gap > 0 else 'right', 
                            fontweight='bold', fontsize=9)
        
        # Add reference lines
        ax7.axvline(x=0, color='black', linestyle='-', alpha=0.8)
        ax7.axvline(x=10, color='orange', linestyle='--', alpha=0.5, label='Competitive Gap')
        ax7.axvline(x=-10, color='green', linestyle='--', alpha=0.5, label='Competitive Advantage')
        
        # 8. Change Readiness and Cultural Assessment
        ax8 = axes[2, 1]
        change_factors = ['Leadership\nCommitment', 'Employee\nEngagement', 'Process\nMaturity', 
                         'Technology\nAdoption', 'Innovation\nCulture', 'Data\nCulture']
        
        # Calculate change readiness scores
        change_scores = [
            category_scores.get('Leadership & Strategy', {}).get('percentage', 0),
            category_scores.get('Human Resources & Skills', {}).get('percentage', 0),
            category_scores.get('Process & Operations', {}).get('percentage', 0),
            category_scores.get('Technology Infrastructure', {}).get('percentage', 0),
            (category_scores.get('Human Resources & Skills', {}).get('percentage', 0) + 
             category_scores.get('Leadership & Strategy', {}).get('percentage', 0)) / 2,
            category_scores.get('Performance Measurement', {}).get('percentage', 0)
        ]
        
        # Create stacked bar chart showing maturity levels
        low_scores = [min(score, 40) for score in change_scores]
        med_scores = [min(max(score - 40, 0), 30) for score in change_scores]
        high_scores = [max(score - 70, 0) for score in change_scores]
        
        bars1 = ax8.bar(change_factors, low_scores, color='#F44336', alpha=0.8, label='Developing (0-40%)')
        bars2 = ax8.bar(change_factors, med_scores, bottom=low_scores, color='#FF9800', alpha=0.8, 
                       label='Moderate (40-70%)')
        bars3 = ax8.bar(change_factors, high_scores, 
                       bottom=[l + m for l, m in zip(low_scores, med_scores)], 
                       color='#4CAF50', alpha=0.8, label='Strong (70-100%)')
        
        ax8.set_title('Change Readiness & Cultural Factors', fontweight='bold', fontsize=14)
        ax8.set_ylabel('Readiness Level (%)', fontsize=12)
        ax8.legend(fontsize=10)
        ax8.tick_params(axis='x', rotation=15, labelsize=10)
        ax8.grid(True, alpha=0.3, axis='y')
        
        # Add total score labels
        for i, (factor, score) in enumerate(zip(change_factors, change_scores)):
            ax8.text(i, score + 2, f'{score:.0f}%', ha='center', va='bottom', 
                    fontweight='bold', fontsize=10)
        
        # 9. ROI Projection with Scenario Analysis
        ax9 = axes[2, 2]
        months = np.arange(0, 37, 3)
        
        # Create three scenarios based on readiness level
        current_score = scores['overall_percentage']
        
        # Optimistic scenario (everything goes well)
        if current_score >= 80:
            optimistic_roi = [0, 5, 15, 30, 50, 75, 105, 140, 180, 220, 260, 300, 340]
        elif current_score >= 60:
            optimistic_roi = [0, 0, 8, 20, 38, 60, 88, 120, 155, 195, 235, 275, 315]
        elif current_score >= 40:
            optimistic_roi = [0, -5, 2, 12, 25, 45, 70, 100, 135, 175, 215, 255, 295]
        else:
            optimistic_roi = [0, -10, -5, 5, 15, 30, 50, 75, 105, 140, 175, 210, 245]
        
        # Realistic scenario (expected performance)
        realistic_roi = [roi * 0.7 for roi in optimistic_roi]
        
        # Conservative scenario (challenges and delays)
        conservative_roi = [roi * 0.4 for roi in optimistic_roi]
        
        ax9.plot(months, optimistic_roi, 'o-', linewidth=3, markersize=6, color='#4CAF50', 
                label='Optimistic Scenario', alpha=0.8)
        ax9.plot(months, realistic_roi, 's-', linewidth=3, markersize=6, color='#2196F3', 
                label='Realistic Scenario', alpha=0.8)
        ax9.plot(months, conservative_roi, '^-', linewidth=3, markersize=6, color='#FF9800', 
                label='Conservative Scenario', alpha=0.8)
        
        # Fill areas between scenarios
        ax9.fill_between(months, conservative_roi, realistic_roi, alpha=0.2, color='orange')
        ax9.fill_between(months, realistic_roi, optimistic_roi, alpha=0.2, color='green')
        
        ax9.axhline(y=0, color='red', linestyle='--', alpha=0.5)
        ax9.set_xlabel('Months from Implementation Start', fontsize=12)
        ax9.set_ylabel('ROI (%)', fontsize=12)
        ax9.set_title('ROI Projection Scenarios', fontweight='bold', fontsize=14)
        ax9.legend(fontsize=11)
        ax9.grid(True, alpha=0.3)
        
        # Add break-even annotations
        scenarios = [('Optimistic', optimistic_roi, '#4CAF50'), 
                    ('Realistic', realistic_roi, '#2196F3'), 
                    ('Conservative', conservative_roi, '#FF9800')]
        
        for scenario_name, roi_data, color in scenarios:
            break_even_month = None
            for i, roi in enumerate(roi_data):
                if roi > 0:
                    break_even_month = months[i]
                    break
            
            if break_even_month and break_even_month <= 36:
                ax9.annotate(f'{scenario_name}\nBreak-even: {break_even_month}mo', 
                            (break_even_month, roi_data[months.tolist().index(break_even_month)]),
                            xytext=(10, 20), textcoords='offset points',
                            bbox=dict(boxstyle='round,pad=0.3', facecolor=color, alpha=0.3),
                            arrowprops=dict(arrowstyle='->', color=color),
                            fontsize=9)
        
        # 10. Key Insights and Recommendations Summary
        ax10 = axes[3, 0]
        ax10.axis('off')
        
        # Create text summary of key insights
        insights_text = "KEY INSIGHTS & STRATEGIC RECOMMENDATIONS\n\n"
        insights_text += "🎯 TOP PRIORITIES:\n"
        for i, rec in enumerate(narrative.recommendations[:3], 1):
            insights_text += f"{i}. {rec[:80]}...\n"
        
        insights_text += f"\n⚠️ CRITICAL RISKS:\n"
        for risk in narrative.risk_factors[:2]:
            insights_text += f"• {risk[:80]}...\n"
        
        insights_text += f"\n✅ SUCCESS FACTORS:\n"
        for factor in narrative.success_indicators[:2]:
            insights_text += f"• {factor[:80]}...\n"
        
        insights_text += f"\n💰 INVESTMENT FOCUS:\n{narrative.investment_implications[:200]}..."
        
        ax10.text(0.05, 0.95, insights_text, transform=ax10.transAxes, fontsize=11,
                 verticalalignment='top', horizontalalignment='left',
                 bbox=dict(boxstyle='round,pad=1', facecolor='#f0f0f0', alpha=0.8),
                 family='monospace')
        
        # 11. Implementation Timeline with Milestones
        ax11 = axes[3, 1]
        timeline_phases = ['Assessment\n& Planning', 'Foundation\nBuilding', 'Pilot\nDevelopment', 
                          'Production\nDeployment', 'Scaling\n& Optimization']
        timeline_months = [0, 3, 8, 15, 24]
        
        # Success probability by milestone
        milestone_success = []
        base_success = readiness_indicators['success_probability']
        for i, month in enumerate(timeline_months):
            # Success probability decreases over time due to execution risk
            decay_factor = 0.95 ** (month / 6)  # 5% decay every 6 months
            milestone_success.append(base_success * decay_factor)
        
        # Create timeline visualization
        ax11.plot(timeline_months, milestone_success, 'o-', linewidth=4, markersize=10, 
                 color='#9C27B0', markerfacecolor='white', markeredgewidth=3)
        
        # Add milestone markers and labels
        for i, (month, phase, success) in enumerate(zip(timeline_months, timeline_phases, milestone_success)):
            ax11.annotate(phase, (month, success), xytext=(0, 20), 
                         textcoords='offset points', ha='center', va='bottom',
                         bbox=dict(boxstyle='round,pad=0.5', facecolor='lightblue', alpha=0.7),
                         fontsize=10, fontweight='bold')
            ax11.text(month, success - 5, f'{success:.0f}%', ha='center', va='top',
                     fontweight='bold', fontsize=10, color='#9C27B0')
        
        ax11.set_xlabel('Timeline (Months)', fontsize=12)
        ax11.set_ylabel('Success Probability (%)', fontsize=12)
        ax11.set_title('Implementation Milestones & Success Trajectory', fontweight='bold', fontsize=14)
        ax11.grid(True, alpha=0.3)
        ax11.set_ylim(0, 100)
        
        # Add phase duration indicators
        for i in range(len(timeline_months) - 1):
            duration = timeline_months[i+1] - timeline_months[i]
            mid_point = (timeline_months[i] + timeline_months[i+1]) / 2
            ax11.annotate(f'{duration} months', (mid_point, 10), ha='center', va='center',
                         bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.5),
                         fontsize=9)
        
        # 12. Competitive Positioning and Market Context
        ax12 = axes[3, 2]
        
        # Create competitive positioning matrix
        competitors = ['Industry\nLaggards', 'Industry\nFollowers', 'Industry\nAverage', 
                      'Industry\nLeaders', 'Your\nOrganization']
        readiness_scores = [35, 55, industry_comparison['benchmark_score'], 
                           industry_comparison['benchmark_score'] + 20, overall_score]
        market_impact = [20, 40, 60, 85, 
                        min(85, 40 + (overall_score - 40) * 0.8)]  # Estimated market impact
        
        # Color code based on competitive position
        colors = ['#FF6B6B', '#FFB74D', '#81C784', '#4CAF50', '#2196F3']
        sizes = [100, 150, 200, 250, 300]  # Your org gets biggest marker
        
        scatter = ax12.scatter(readiness_scores, market_impact, s=sizes, c=colors, alpha=0.8,
                              edgecolors='white', linewidths=2)
        
        # Add labels
        for i, (comp, ready, impact) in enumerate(zip(competitors, readiness_scores, market_impact)):
            if i == 4:  # Your organization
                ax12.annotate(comp, (ready, impact), xytext=(10, 10), 
                             textcoords='offset points', ha='left', va='bottom',
                             bbox=dict(boxstyle='round,pad=0.5', facecolor='#2196F3', 
                                     alpha=0.8, edgecolor='white'),
                             fontsize=11, fontweight='bold', color='white')
            else:
                ax12.annotate(comp, (ready, impact), xytext=(5, 5), 
                             textcoords='offset points', ha='left', va='bottom',
                             fontsize=10)
        
        ax12.set_xlabel('AI Readiness Score (%)', fontsize=12)
        ax12.set_ylabel('Market Impact Potential (%)', fontsize=12)
        ax12.set_title('Competitive Positioning in AI Readiness', fontweight='bold', fontsize=14)
        ax12.grid(True, alpha=0.3)
        
        # Add quadrant lines and labels
        ax12.axhline(y=60, color='red', linestyle='--', alpha=0.5)
        ax12.axvline(x=60, color='red', linestyle='--', alpha=0.5)
        
        quadrant_labels = ['High Impact\nLow Readiness\n(Risk Zone)', 'High Impact\nHigh Readiness\n(Leaders)', 
                          'Low Impact\nLow Readiness\n(Laggards)', 'Low Impact\nHigh Readiness\n(Followers)']
        quad_positions = [(40, 75), (80, 75), (40, 35), (80, 35)]
        quad_colors = ['orange', 'green', 'red', 'blue']
        
        for label, pos, color in zip(quadrant_labels, quad_positions, quad_colors):
            ax12.text(pos[0], pos[1], label, ha='center', va='center',
                     bbox=dict(boxstyle='round,pad=0.5', facecolor=color, alpha=0.2),
                     fontsize=9, fontweight='bold')
        
        plt.tight_layout(rect=[0, 0.03, 1, 0.92])
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
        else:
            save_path = f"enhanced_detailed_analysis_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
        
        plt.close()
        return save_path
    
    def create_action_plan_enhanced(self, scores: Dict[str, Any], narrative: InsightNarrative, save_path: str = None) -> str:
        """Create enhanced action plan with detailed implementation guidance"""
        
        fig = make_subplots(
            rows=3, cols=3,
            subplot_titles=[
                'Strategic Priority Matrix', 'Implementation Roadmap', 'Resource Allocation Plan',
                'Quick Wins vs Long-term Investments', 'Risk Mitigation Timeline', 'Success Milestones',
                'Budget Planning by Phase', 'Team Development Plan', 'Performance Tracking Framework'
            ],
            specs=[
                [{"type": "scatter"}, {"type": "bar"}, {"type": "pie"}],
                [{"type": "scatter"}, {"type": "bar"}, {"type": "scatter"}],
                [{"type": "bar"}, {"type": "bar"}, {"type": "table"}]
            ],
            vertical_spacing=0.12
        )
        
        category_scores = scores['category_scores']
        readiness_indicators = scores['readiness_indicators']
        risk_assessment = scores['risk_assessment']
        
        # 1. Enhanced Priority Action Matrix
        categories = list(category_scores.keys())
        urgency = [100 - category_scores[cat]['percentage'] for cat in categories]
        impact = [category_scores[cat]['weight'] * 12 for cat in categories]
        implementation_effort = [category_scores[cat]['questions'] * 20 for cat in categories]
        
        # Create bubble chart with implementation effort as size
        fig.add_trace(
            go.Scatter(
                x=urgency,
                y=impact,
                mode='markers+text',
                marker=dict(
                    size=[20 + e/2 for e in implementation_effort],
                    color=urgency,
                    colorscale='Reds',
                    opacity=0.7,
                    line=dict(width=2, color='white'),
                    colorbar=dict(title="Urgency Level", x=0.35)
                ),
                text=[cat.split(' ')[0] for cat in categories],
                textposition="middle center",
                textfont=dict(color="white", size=10, family="Arial Black"),
                showlegend=False,
                hovertemplate='<b>%{text}</b><br>Urgency: %{x:.1f}%<br>Impact: %{y:.1f}<br>Effort: %{marker.size}<extra></extra>'
            ),
            row=1, col=1
        )
        
        # 2. Detailed Implementation Roadmap
        phases = ['Phase 1: Foundation\n(0-6 months)', 'Phase 2: Pilot\n(6-12 months)', 
                 'Phase 3: Production\n(12-18 months)', 'Phase 4: Scale\n(18-24 months)']
        
        current_score = scores['overall_percentage']
        
        # Effort allocation by phase based on readiness
        if current_score >= 80:
            effort_allocation = [25, 35, 25, 15]  # Less foundation needed
        elif current_score >= 60:
            effort_allocation = [35, 30, 25, 10]
        elif current_score >= 40:
            effort_allocation = [45, 30, 20, 5]
        else:
            effort_allocation = [60, 25, 15, 0]  # Focus on foundation
        
        colors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF']
        fig.add_trace(
            go.Bar(
                x=phases,
                y=effort_allocation,
                marker_color=colors,
                text=[f'{e}%<br>effort' for e in effort_allocation],
                textposition='inside',
                textfont={'color': 'white', 'size': 12, 'family': 'Arial Black'}
            ),
            row=1, col=2
        )
        
        # 3. Enhanced Resource Allocation
        if current_score >= 70:
            allocations = [25, 20, 15, 20, 10, 10]  # More advanced focus
            labels = ['AI Platforms', 'Advanced Training', 'Consulting', 'Infrastructure', 'Governance', 'Innovation']
        elif current_score >= 50:
            allocations = [20, 30, 20, 15, 10, 5]  # Balanced approach
            labels = ['Technology', 'Skills Training', 'Consulting', 'Infrastructure', 'Governance', 'Change Mgmt']
        else:
            allocations = [15, 35, 25, 15, 10, 0]  # Foundation focus
            labels = ['Basic Tech', 'Foundation Training', 'Expert Consulting', 'Infrastructure', 'Basic Governance', 'Future']
        
        fig.add_trace(
            go.Pie(
                labels=labels,
                values=allocations,
                hole=0.4,
                marker_colors=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
                textinfo='label+percent',
                textfont={'size': 11}
            ),
            row=1, col=3
        )
        
        # 4. Quick Wins vs Long-term Investments
        categories_short = [cat.split(' ')[0] for cat in categories]
        quick_win_potential = []
        long_term_impact = []
        
        for cat in categories:
            cat_data = category_scores[cat]
            # Quick wins: high current score, low investment needed
            quick_win = min(cat_data['percentage'], 100 - cat_data['percentage'])
            # Long-term: high weight, high improvement potential
            long_term = cat_data['weight'] * (100 - cat_data['percentage']) / 100
            
            quick_win_potential.append(quick_win)
            long_term_impact.append(long_term * 10)  # Scale for visualization
        
        fig.add_trace(
            go.Scatter(
                x=quick_win_potential,
                y=long_term_impact,
                mode='markers+text',
                marker=dict(
                    size=20,
                    color=['#4CAF50' if qw > 30 and lt > 15 else '#FF9800' if qw > 20 or lt > 10 else '#F44336' 
                          for qw, lt in zip(quick_win_potential, long_term_impact)],
                    opacity=0.8,
                    line=dict(color='white', width=2)
                ),
                text=categories_short,
                textposition="middle center",
                textfont=dict(color="white", size=9),
                showlegend=False
            ),
            row=2, col=1
        )
        
        # 5. Risk Mitigation Timeline
        risk_factors = list(risk_assessment['risk_factors'].keys())[:6]
        risk_values = list(risk_assessment['risk_factors'].values())[:6]
        
        # Mitigation timeline (months to address each risk)
        mitigation_timeline = []
        for risk_name, risk_value in zip(risk_factors, risk_values):
            if 'skills' in risk_name.lower():
                timeline = 12 + (risk_value / 10)  # Skills take longer
            elif 'budget' in risk_name.lower():
                timeline = 3 + (risk_value / 20)  # Budget issues can be quicker
            elif 'governance' in risk_name.lower():
                timeline = 6 + (risk_value / 15)  # Moderate timeline
            else:
                timeline = 6 + (risk_value / 12)  # Default timeline
            mitigation_timeline.append(min(timeline, 24))  # Cap at 24 months
        
        risk_colors = ['#FF4444' if rv > 40 else '#FF8800' if rv > 25 else '#FFAA44' for rv in risk_values]
        
        fig.add_trace(
            go.Bar(
                x=[name.replace('_', ' ').title()[:15] for name in risk_factors],
                y=mitigation_timeline,
                marker_color=risk_colors,
                text=[f'{t:.1f} mo' for t in mitigation_timeline],
                textposition='outside'
            ),
            row=2, col=2
        )
        
        # 6. Success Milestones
        milestones = ['Foundation\nComplete', 'First Pilot\nLaunched', 'Production\nDeployment', 
                     'Measurable\nROI', 'Full Scale\nOperation']
        timeline_months = [6, 12, 18, 24, 30]
        
        # Success probability decreases over time but varies by readiness
        base_prob = readiness_indicators['success_probability']
        milestone_probs = []
        for month in timeline_months:
            decay = 0.98 ** (month / 3)  # 2% decay every 3 months
            prob = base_prob * decay
            milestone_probs.append(prob)
        
        fig.add_trace(
            go.Scatter(
                x=timeline_months,
                y=milestone_probs,
                mode='lines+markers+text',
                line=dict(color='#9C27B0', width=4),
                marker=dict(size=12, color='#9C27B0', line=dict(color='white', width=2)),
                text=[f'{p:.0f}%' for p in milestone_probs],
                textposition="top center",
                textfont=dict(size=11, color='#9C27B0'),
                showlegend=False
            ),
            row=2, col=3
        )
        
        # 7. Budget Planning by Phase
        total_budget_index = 100  # Baseline budget index
        
        if current_score >= 80:
            phase_budgets = [20, 35, 30, 15]  # Less upfront investment
        elif current_score >= 60:
            phase_budgets = [30, 30, 25, 15]
        elif current_score >= 40:
            phase_budgets = [40, 30, 20, 10]
        else:
            phase_budgets = [50, 30, 15, 5]  # Heavy foundation investment
        
        cumulative_budget = np.cumsum(phase_budgets)
        
        fig.add_trace(
            go.Bar(
                x=['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
                y=phase_budgets,
                name='Phase Budget',
                marker_color='#42A5F5',
                text=[f'{b}%' for b in phase_budgets],
                textposition='inside'
            ),
            row=3, col=1
        )
        
        fig.add_trace(
            go.Scatter(
                x=['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
                y=cumulative_budget,
                mode='lines+markers',
                name='Cumulative',
                line=dict(color='#FF7043', width=3),
                marker=dict(size=8),
                yaxis='y2'
            ),
            row=3, col=1
        )
        
        # 8. Team Development Plan
        skill_categories = ['Data Science', 'AI/ML Engineering', 'Change Management', 
                           'Business Analysis', 'Technical Leadership']
        
        current_skills = [
            category_scores.get('Human Resources & Skills', {}).get('percentage', 0) * 0.6,  # Data Science
            category_scores.get('Technology Infrastructure', {}).get('percentage', 0) * 0.7,  # AI/ML
            category_scores.get('Process & Operations', {}).get('percentage', 0) * 0.8,  # Change Mgmt
            category_scores.get('Performance Measurement', {}).get('percentage', 0) * 0.9,  # Business Analysis
            category_scores.get('Leadership & Strategy', {}).get('percentage', 0) * 0.8   # Leadership
        ]
        
        target_skills = [80, 75, 85, 70, 90]  # Target skill levels
        skill_gaps = [target - current for target, current in zip(target_skills, current_skills)]
        
        fig.add_trace(
            go.Bar(
                x=skill_categories,
                y=current_skills,
                name='Current Level',
                marker_color='#66BB6A',
                text=[f'{s:.0f}%' for s in current_skills],
                textposition='inside'
            ),
            row=3, col=2
        )
        
        fig.add_trace(
            go.Bar(
                x=skill_categories,
                y=skill_gaps,
                name='Gap to Target',
                marker_color='#FF7043',
                text=[f'+{g:.0f}%' for g in skill_gaps],
                textposition='inside'
            ),
            row=3, col=2
        )
        
        # 9. Performance Tracking Framework
        kpi_data = [
            ['KPI Category', 'Metric', 'Target', 'Timeline'],
            ['Leadership', 'Executive Sponsorship Score', '85%', '3 months'],
            ['Data Quality', 'Data Readiness Index', '80%', '6 months'],
            ['Skills', 'AI Competency Score', '75%', '12 months'],
            ['Technology', 'Infrastructure Readiness', '85%', '9 months'],
            ['Process', 'Process Automation %', '60%', '15 months'],
            ['ROI', 'AI Initiative ROI', '150%', '18 months'],
            ['Risk', 'Risk Mitigation Score', '90%', '6 months'],
            ['Culture', 'Change Adoption Rate', '80%', '12 months']
        ]
        
        fig.add_trace(
            go.Table(
                header=dict(
                    values=['<b>' + col + '</b>' for col in kpi_data[0]],
                    fill_color='#1976D2',
                    font_color='white',
                    font_size=12,
                    align='center'
                ),
                cells=dict(
                    values=[[row[i] for row in kpi_data[1:]] for i in range(4)],
                    fill_color=[['#E3F2FD', '#FFFFFF'] * 4],
                    font_size=11,
                    align=['left', 'left', 'center', 'center'],
                    height=25
                )
            ),
            row=3, col=3
        )
        
        # Update layout
        fig.update_layout(
            title={
                'text': f'AI Implementation Action Plan & Strategic Roadmap<br><span style="font-size:14px">{narrative.summary}</span>',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 18}
            },
            height=1200,
            showlegend=True
        )
        
        # Update axes labels
        fig.update_xaxes(title_text="Urgency (Gap %)", row=1, col=1)
        fig.update_yaxes(title_text="Strategic Impact", row=1, col=1)
        fig.update_xaxes(title_text="Implementation Phase", row=1, col=2)
        fig.update_yaxes(title_text="Effort Allocation (%)", row=1, col=2)
        fig.update_xaxes(title_text="Quick Win Potential", row=2, col=1)
        fig.update_yaxes(title_text="Long-term Impact", row=2, col=1)
        fig.update_xaxes(title_text="Risk Factors", row=2, col=2)
        fig.update_yaxes(title_text="Mitigation Timeline (Months)", row=2, col=2)
        fig.update_xaxes(title_text="Timeline (Months)", row=2, col=3)
        fig.update_yaxes(title_text="Success Probability (%)", row=2, col=3)
        fig.update_xaxes(title_text="Implementation Phase", row=3, col=1)
        fig.update_yaxes(title_text="Budget Allocation (%)", row=3, col=1)
        fig.update_xaxes(title_text="Skill Categories", row=3, col=2)
        fig.update_yaxes(title_text="Skill Level (%)", row=3, col=2)
        
        if save_path:
            fig.write_html(save_path)
        else:
            save_path = f"enhanced_action_plan_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            fig.write_html(save_path)
        
        return save_path
    
    def generate_comprehensive_report(self, include_all: bool = True) -> Dict[str, Any]:
        """Generate comprehensive visual report with enhanced narratives"""
        scores = self.calculate_comprehensive_scores()
        
        if not scores:
            return {"error": "No assessment data available"}
        
        # Generate narrative insights
        narrative = self.generate_narrative_insights(scores)
        
        visual_files = {}
        
        try:
            # 1. Enhanced Executive Dashboard
            dashboard_file = self.create_executive_dashboard_enhanced(scores, narrative)
            visual_files['executive_dashboard'] = dashboard_file
            print(f"✅ Created enhanced executive dashboard: {dashboard_file}")
            
            # 2. Enhanced Detailed Analysis
            if include_all:
                analysis_file = self.create_detailed_analysis_enhanced(scores, narrative)
                visual_files['detailed_analysis'] = analysis_file
                print(f"✅ Created enhanced detailed analysis: {analysis_file}")
            
            # 3. Enhanced Action Plan
            action_file = self.create_action_plan_enhanced(scores, narrative)
            visual_files['action_plan'] = action_file
            print(f"✅ Created enhanced action plan: {action_file}")
            
            # 4. Generate text summary
            summary_file = self._generate_text_summary(scores, narrative)
            visual_files['text_summary'] = summary_file
            print(f"✅ Created comprehensive text summary: {summary_file}")
            
            print(f"\n🎯 Generated {len(visual_files)} enhanced visualization files")
            
        except Exception as e:
            print(f"❌ Error generating enhanced visualizations: {str(e)}")
            visual_files['error'] = str(e)
            import traceback
            traceback.print_exc()
        
        return {
            'visual_files': visual_files,
            'scores': scores,
            'narrative': narrative,
            'assessment_date': datetime.datetime.now().strftime('%B %d, %Y'),
            'organization': self.organization_info
        }
    
    def _generate_text_summary(self, scores: Dict[str, Any], narrative: InsightNarrative, save_path: str = None) -> str:
        """Generate comprehensive text summary report"""
        
        report_content = f"""
# {narrative.title}
## Comprehensive AI Readiness Assessment Report

**Organization:** {self.organization_info.get('name', 'Your Organization')}
**Industry:** {self.organization_info.get('industry', 'Not specified')}
**Assessment Date:** {datetime.datetime.now().strftime('%B %d, %Y')}
**Overall Readiness Score:** {scores['overall_percentage']:.1f}%

---

## Executive Summary

{narrative.summary}

**Key Readiness Indicators:**
- Success Probability: {scores['readiness_indicators']['success_probability']:.1f}%
- Critical Success Factors: {scores['readiness_indicators']['critical_success_factors']:.1f}%
- Industry Position: {scores['industry_comparison']['industry_position']}
- Overall Risk Level: {scores['risk_assessment']['overall_risk_level']}

---

## Key Findings

"""
        
        for i, finding in enumerate(narrative.key_findings, 1):
            report_content += f"{i}. {finding}\n\n"
        
        report_content += """
---

## Strategic Recommendations

"""
        
        for i, rec in enumerate(narrative.recommendations, 1):
            report_content += f"### Priority {i}\n{rec}\n\n"
        
        report_content += """
---

## Risk Assessment

"""
        
        for risk in narrative.risk_factors:
            report_content += f"⚠️ {risk}\n\n"
        
        report_content += f"""
---

## Implementation Timeline

{narrative.timeline_expectations}

**Milestone Timeline:**
- Pilot Ready: {scores['readiness_indicators']['implementation_timeline']['pilot_ready']}
- Production Ready: {scores['readiness_indicators']['implementation_timeline']['production_ready']}
- Scaling Ready: {scores['readiness_indicators']['implementation_timeline']['scaling_ready']}

---

## Investment Implications

{narrative.investment_implications}

---

## Category Performance Breakdown

"""
        
        for category, data in scores['category_scores'].items():
            report_content += f"""
### {category}
- **Score:** {data['percentage']:.1f}%
- **Weight:** {data['weight']:.1f}
- **Questions:** {data['questions']}
- **Consistency:** {data['consistency']:.1f}
- **Maturity Distribution:** {data['maturity_distribution']}

"""
        
        report_content += f"""
---

## Industry Comparison

**Industry:** {scores['industry_comparison']['industry']}
**Benchmark Score:** {scores['industry_comparison']['benchmark_score']:.1f}%
**Performance vs Benchmark:** {scores['industry_comparison']['performance_vs_benchmark']:+.1f} points

**Industry Success Patterns:**
"""
        
        for pattern in scores['industry_comparison']['success_patterns']:
            report_content += f"- {pattern}\n"
        
        report_content += """
**Recommended Industry Focus Areas:**
"""
        
        for investment in scores['industry_comparison']['recommended_investments']:
            report_content += f"- {investment}\n"
        
        report_content += """
---

## Success Indicators

"""
        
        for indicator in narrative.success_indicators:
            report_content += f"✅ {indicator}\n\n"
        
        report_content += """
---

## Next Steps

Based on this assessment, immediate next steps should include:

1. **Leadership Alignment:** Ensure executive team reviews and endorses findings
2. **Priority Investment:** Focus resources on top 3 recommended areas
3. **Risk Mitigation:** Address critical risk factors identified
4. **Team Development:** Begin capability building in identified gap areas
5. **Pilot Planning:** Develop specific use cases for initial AI pilots

---

*This report was generated using the Enhanced Organizational AI Readiness Assessment tool.*
*For questions or additional analysis, please consult with your AI strategy team.*
"""
        
        if save_path:
            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(report_content)
        else:
            save_path = f"ai_readiness_summary_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(report_content)
        
        return save_path

# Enhanced Usage Example
if __name__ == "__main__":
    # Create enhanced organizational assessment
    org_assessment = EnhancedOrganizationalAIReadiness()
    
    # Simulate comprehensive organization info
    org_assessment.organization_info = {
        'name': 'InnovateFirst Solutions',
        'industry': 'Technology',
        'size': '201-500',
        'type': 'For-profit',
        'annual_revenue': '$50-100M',
        'employees': 350,
        'locations': 'Multiple',
        'ai_maturity': 'Emerging'
    }
    
    print("🏢 Running Enhanced Organizational AI Readiness Assessment...")
    print(f"📊 Organization: {org_assessment.organization_info['name']}")
    print(f"🏭 Industry: {org_assessment.organization_info['industry']}")
    print(f"👥 Size: {org_assessment.organization_info['size']} employees")
    
    # Simulate realistic mixed responses for a technology company
    sample_responses = [
        'B', 'C', 'B', 'B', 'C', 'B', 'C', 'B', 'B', 'C',  # Mixed developing/emerging
        'B', 'C', 'B', 'B', 'C', 'B', 'B', 'C'             # Consistent with tech industry
    ]
    
    print(f"\n📝 Recording {len(sample_responses)} assessment responses...")
    for i, response in enumerate(sample_responses):
        org_assessment.record_response(i, response)
        print(f"   Question {i+1}: {response}")
    
    # Generate comprehensive enhanced report
    print("\n🚀 Generating comprehensive enhanced visual report...")
    report_results = org_assessment.generate_comprehensive_report(include_all=True)
    
    print("\n" + "="*80)
    print("🎨 ENHANCED ORGANIZATIONAL AI READINESS REPORT GENERATED")
    print("="*80)
    
    if 'error' not in report_results:
        print(f"📈 Overall AI Readiness Score: {report_results['scores']['overall_percentage']:.1f}%")
        print(f"🎯 Success Probability: {report_results['scores']['readiness_indicators']['success_probability']:.1f}%")
        print(f"🏭 Industry Position: {report_results['scores']['industry_comparison']['industry_position']}")
        print(f"⚠️  Overall Risk Level: {report_results['scores']['risk_assessment']['overall_risk_level']}")
        
        print(f"\n📁 Generated Files:")
        for viz_type, filename in report_results['visual_files'].items():
            if viz_type != 'error':
                print(f"   📄 {viz_type.replace('_', ' ').title()}: {filename}")
        
        # Display narrative insights summary
        narrative = report_results['narrative']
        print(f"\n🎯 KEY STRATEGIC INSIGHTS:")
        print(f"   📌 Assessment: {narrative.title}")
        print(f"   📝 Summary: {narrative.summary[:100]}...")
        
        print(f"\n🔥 TOP 3 PRIORITY RECOMMENDATIONS:")
        for i, rec in enumerate(narrative.recommendations[:3], 1):
            print(f"   {i}. {rec[:80]}...")
        
        print(f"\n⚠️  TOP RISK FACTORS:")
        for risk in narrative.risk_factors[:2]:
            print(f"   🚨 {risk[:80]}...")
        
        print(f"\n💰 INVESTMENT FOCUS:")
        print(f"   {narrative.investment_implications[:120]}...")
        
        # Show category performance summary
        print(f"\n📊 CATEGORY PERFORMANCE SUMMARY:")
        category_scores = report_results['scores']['category_scores']
        sorted_categories = sorted(
            [(cat, data['percentage']) for cat, data in category_scores.items()],
            key=lambda x: x[1], reverse=True
        )
        
        for i, (category, percentage) in enumerate(sorted_categories, 1):
            status = "🟢" if percentage >= 80 else "🟡" if percentage >= 60 else "🟠" if percentage >= 40 else "🔴"
            print(f"   {i:2d}. {status} {category:<25} {percentage:6.1f}%")
        
        print(f"\n📈 IMPLEMENTATION TIMELINE:")
        timeline = report_results['scores']['readiness_indicators']['implementation_timeline']
        print(f"   🎯 Pilot Ready: {timeline['pilot_ready']}")
        print(f"   🚀 Production Ready: {timeline['production_ready']}")
        print(f"   📈 Scaling Ready: {timeline['scaling_ready']}")
        print(f"   🏆 Maturity Assessment: {timeline['maturity_level']}")
        
    else:
        print(f"❌ Error generating report: {report_results['error']}")
    
    print(f"\n🎉 Enhanced assessment complete! Review the generated files for detailed insights.")
    print(f"💡 Pro tip: Start with the executive dashboard for high-level insights,")
    print(f"   then dive into detailed analysis for comprehensive understanding.")
    print(f"📋 Use the action plan for step-by-step implementation guidance.")
    print(f"📄 The text summary provides a comprehensive written report.")
    
    # Additional utility functions for enhanced analysis
    
    def create_custom_industry_benchmark(self, industry_data: Dict[str, float]) -> None:
        """Allow custom industry benchmark setup"""
        if industry_data:
            self.industry_profiles['Custom'] = {
                'avg_readiness': industry_data.get('avg_readiness', 60),
                'critical_factors': industry_data.get('critical_factors', ['Leadership & Strategy', 'Data Infrastructure']),
                'common_challenges': industry_data.get('common_challenges', ['Custom challenges']),
                'success_patterns': industry_data.get('success_patterns', ['Custom patterns']),
                'investment_focus': industry_data.get('investment_focus', ['Custom investments'])
            }
    
    def export_assessment_data(self, filename: str = None) -> str:
        """Export assessment data to JSON for external analysis"""
        if not filename:
            filename = f"ai_readiness_data_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        export_data = {
            'organization_info': self.organization_info,
            'responses': self.user_responses,
            'assessment_date': datetime.datetime.now().isoformat(),
            'questions': self.questions,
            'scores': self.calculate_comprehensive_scores() if self.user_responses else {}
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return filename
    
    def load_assessment_data(self, filename: str) -> bool:
        """Load previously saved assessment data"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            self.organization_info = data.get('organization_info', {})
            self.user_responses = data.get('responses', {})
            return True
        except Exception as e:
            print(f"Error loading assessment data: {e}")
            return False
    
    def create_comparison_report(self, other_assessment_data: Dict) -> Dict[str, Any]:
        """Create comparative analysis between two assessments"""
        current_scores = self.calculate_comprehensive_scores()
        
        if not current_scores or not other_assessment_data:
            return {"error": "Insufficient data for comparison"}
        
        comparison = {
            'current_org': {
                'name': self.organization_info.get('name', 'Current Organization'),
                'score': current_scores['overall_percentage']
            },
            'comparison_org': {
                'name': other_assessment_data.get('organization_info', {}).get('name', 'Comparison Organization'),
                'score': other_assessment_data.get('scores', {}).get('overall_percentage', 0)
            },
            'score_difference': current_scores['overall_percentage'] - other_assessment_data.get('scores', {}).get('overall_percentage', 0),
            'category_comparison': {}
        }
        
        # Category-by-category comparison
        current_categories = current_scores['category_scores']
        other_categories = other_assessment_data.get('scores', {}).get('category_scores', {})
        
        for category in current_categories:
            if category in other_categories:
                comparison['category_comparison'][category] = {
                    'current': current_categories[category]['percentage'],
                    'other': other_categories[category]['percentage'],
                    'difference': current_categories[category]['percentage'] - other_categories[category]['percentage']
                }
        
        return comparison
    
    def generate_executive_briefing(self, scores: Dict[str, Any], narrative: InsightNarrative) -> str:
        """Generate concise executive briefing (1-page summary)"""
        
        briefing = f"""
# EXECUTIVE BRIEFING: AI READINESS ASSESSMENT
## {self.organization_info.get('name', 'Your Organization')} | {datetime.datetime.now().strftime('%B %Y')}

### 🎯 BOTTOM LINE UP FRONT
**Overall AI Readiness: {scores['overall_percentage']:.0f}%** | **Success Probability: {scores['readiness_indicators']['success_probability']:.0f}%**

{narrative.summary}

### 📊 KEY METRICS
- Industry Position: **{scores['industry_comparison']['industry_position']}** ({scores['industry_comparison']['performance_vs_benchmark']:+.0f} pts vs benchmark)
- Risk Level: **{scores['risk_assessment']['overall_risk_level']}** 
- Timeline to Pilot: **{scores['readiness_indicators']['implementation_timeline']['pilot_ready']}**
- Investment Readiness: **{scores['readiness_indicators']['implementation_timeline']['maturity_level'].split(' - ')[0]}**

### 🚀 IMMEDIATE ACTIONS REQUIRED
"""
        
        for i, rec in enumerate(narrative.recommendations[:3], 1):
            briefing += f"{i}. **{rec.split(':')[0] if ':' in rec else rec[:30]}**\n"
        
        briefing += f"""
### ⚠️ CRITICAL RISKS TO MANAGE
"""
        
        for risk in narrative.risk_factors[:2]:
            briefing += f"- {risk}\n"
        
        briefing += f"""
### 💰 INVESTMENT IMPLICATIONS
{narrative.investment_implications[:200]}...

### 📈 SUCCESS INDICATORS
- {narrative.success_indicators[0] if narrative.success_indicators else 'Monitor progress against baseline metrics'}
- Regular assessment reviews recommended every 6 months

---
*Full detailed analysis and implementation roadmap available in comprehensive report.*
"""
        
        filename = f"executive_briefing_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(briefing)
        
        return filename
    
    # Add these methods to the main class
    org_assessment.create_custom_industry_benchmark = create_custom_industry_benchmark.__get__(org_assessment)
    org_assessment.export_assessment_data = export_assessment_data.__get__(org_assessment)
    org_assessment.load_assessment_data = load_assessment_data.__get__(org_assessment)
    org_assessment.create_comparison_report = create_comparison_report.__get__(org_assessment)
    org_assessment.generate_executive_briefing = generate_executive_briefing.__get__(org_assessment)
    
    # Demonstrate additional features
    print(f"\n🔧 ADDITIONAL FEATURES DEMONSTRATED:")
    
    # Export data
    export_file = org_assessment.export_assessment_data()
    print(f"   📤 Assessment data exported: {export_file}")
    
    # Generate executive briefing
    if 'scores' in report_results and 'narrative' in report_results:
        briefing_file = org_assessment.generate_executive_briefing(
            report_results['scores'], 
            report_results['narrative']
        )
        print(f"   📋 Executive briefing created: {briefing_file}")
    
    print(f"\n📚 FEATURE SUMMARY:")
    print(f"   ✅ Comprehensive 18-question assessment across 8 categories")
    print(f"   ✅ Industry-specific benchmarking and insights")
    print(f"   ✅ Advanced risk assessment with mitigation strategies")
    print(f"   ✅ Detailed implementation roadmap with resource planning")
    print(f"   ✅ Success probability modeling and timeline estimation")
    print(f"   ✅ Rich narrative insights and strategic recommendations")
    print(f"   ✅ Multiple visualization formats (HTML interactive, PNG static)")
    print(f"   ✅ Comprehensive text reports and executive briefings")
    print(f"   ✅ Data export/import for longitudinal tracking")
    print(f"   ✅ Comparative analysis capabilities")
    
    print(f"\n🎓 ASSESSMENT METHODOLOGY:")
    print(f"   📊 Weighted scoring system with business impact consideration")
    print(f"   🏭 Industry-specific benchmarking and best practices")
    print(f"   📈 Maturity framework aligned with AI adoption stages")
    print(f"   🎯 Multi-dimensional analysis (readiness, risk, timeline, ROI)")
    print(f"   📋 Evidence-based recommendations with implementation guidance")
    
    print(f"\n🔄 CONTINUOUS IMPROVEMENT:")
    print(f"   📅 Recommended reassessment every 6 months")
    print(f"   📊 Progress tracking against baseline and targets")
    print(f"   🎯 Iterative refinement of strategy and priorities")
    print(f"   📈 Benchmark updates as industry standards evolve")