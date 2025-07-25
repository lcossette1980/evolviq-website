"""
Enhanced Agent Infrastructure

Implements agent state management, context tracking, and performance monitoring
as recommended in the code review.
"""

import logging
import time
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Protocol
from datetime import datetime
from collections import defaultdict
from abc import ABC, abstractmethod

from crewai import Agent, Task
from langchain_openai import ChatOpenAI

from ..core.config import get_config, AssessmentConfig
from ..models.results import BaseResult, ResultStatus
from ..models.assessment import AssessmentSection


logger = logging.getLogger(__name__)


@dataclass
class AgentContext:
    """
    Maintains context across agent interactions
    
    Addresses code review issue of no state tracking between agent interactions.
    """
    agent_id: str
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    shared_memory: Dict[str, Any] = field(default_factory=dict)
    confidence_scores: Dict[str, float] = field(default_factory=dict)
    performance_metrics: Dict[str, Any] = field(default_factory=dict)
    
    # Context metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    total_interactions: int = 0
    
    def add_interaction(self, role: str, content: str, metadata: Dict[str, Any] = None) -> None:
        """Add interaction to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        })
        self.total_interactions += 1
        self.last_updated = datetime.now()
    
    def update_confidence(self, domain: str, score: float) -> None:
        """Update confidence score for a domain"""
        self.confidence_scores[domain] = max(0.0, min(1.0, score))
        self.last_updated = datetime.now()
    
    def update_memory(self, key: str, value: Any) -> None:
        """Update shared memory"""
        self.shared_memory[key] = value
        self.last_updated = datetime.now()
    
    def get_recent_interactions(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent interactions"""
        return self.conversation_history[-limit:] if self.conversation_history else []
    
    def get_context_summary(self) -> Dict[str, Any]:
        """Get summary of current context"""
        return {
            "agent_id": self.agent_id,
            "total_interactions": self.total_interactions,
            "confidence_scores": self.confidence_scores,
            "shared_memory_keys": list(self.shared_memory.keys()),
            "last_updated": self.last_updated.isoformat(),
            "context_age_minutes": (datetime.now() - self.created_at).total_seconds() / 60
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "agent_id": self.agent_id,
            "conversation_history": self.conversation_history,
            "shared_memory": self.shared_memory,
            "confidence_scores": self.confidence_scores,
            "performance_metrics": self.performance_metrics,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
            "total_interactions": self.total_interactions
        }


@dataclass
class AgentPerformanceMetrics:
    """Track agent performance metrics"""
    agent_id: str
    total_tasks: int = 0
    successful_tasks: int = 0
    failed_tasks: int = 0
    total_execution_time: float = 0.0
    average_execution_time: float = 0.0
    confidence_scores: List[float] = field(default_factory=list)
    
    def update_task_completion(self, success: bool, execution_time: float, 
                              confidence: float = None) -> None:
        """Update metrics after task completion"""
        self.total_tasks += 1
        if success:
            self.successful_tasks += 1
        else:
            self.failed_tasks += 1
            
        self.total_execution_time += execution_time
        self.average_execution_time = self.total_execution_time / self.total_tasks
        
        if confidence is not None:
            self.confidence_scores.append(confidence)
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate"""
        return self.successful_tasks / self.total_tasks if self.total_tasks > 0 else 0.0
    
    @property
    def average_confidence(self) -> float:
        """Calculate average confidence"""
        return sum(self.confidence_scores) / len(self.confidence_scores) if self.confidence_scores else 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "agent_id": self.agent_id,
            "total_tasks": self.total_tasks,
            "successful_tasks": self.successful_tasks,
            "failed_tasks": self.failed_tasks,
            "success_rate": self.success_rate,
            "total_execution_time": self.total_execution_time,
            "average_execution_time": self.average_execution_time,
            "average_confidence": self.average_confidence
        }


class StatefulAgent:
    """
    Agent wrapper with persistent context and performance tracking
    
    Addresses code review recommendation for agent state management.
    """
    
    def __init__(self, agent: Agent, context: AgentContext, config: AssessmentConfig = None):
        self.agent = agent
        self.context = context
        self.config = config or get_config()
        self.metrics = AgentPerformanceMetrics(agent_id=context.agent_id)
        self.logger = logging.getLogger(f"{__name__}.{agent.role}")
    
    def execute_with_context(self, task: Task) -> BaseResult:
        """Execute task with context injection and performance tracking"""
        start_time = time.time()
        
        try:
            # Inject context into task
            enhanced_task = self._enhance_task_with_context(task)
            
            # Execute task
            result = self.agent.execute_task(enhanced_task)
            
            # Update context with results
            self.context.add_interaction(
                role="agent",
                content=str(result),
                metadata={"task_description": task.description}
            )
            
            # Calculate metrics
            execution_time = time.time() - start_time
            self.metrics.update_task_completion(
                success=True,
                execution_time=execution_time
            )
            
            self.logger.info(f"Task completed successfully in {execution_time:.2f}s")
            
            return BaseResult(
                status=ResultStatus.SUCCESS,
                data={"result": result, "context": self.context.get_context_summary()},
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.metrics.update_task_completion(
                success=False,
                execution_time=execution_time
            )
            
            self.logger.error(f"Task failed after {execution_time:.2f}s: {e}")
            
            return BaseResult(
                status=ResultStatus.FAILURE,
                error=str(e),
                execution_time=execution_time
            )
    
    def _enhance_task_with_context(self, task: Task) -> Task:
        """Inject context information into task"""
        context_info = self.context.get_context_summary()
        recent_interactions = self.context.get_recent_interactions(3)
        
        enhanced_description = f"""
        {task.description}
        
        CONTEXT INFORMATION:
        - Previous interactions: {len(recent_interactions)}
        - Confidence scores: {context_info['confidence_scores']}
        - Shared memory: {list(self.context.shared_memory.keys())}
        
        RECENT INTERACTIONS:
        {self._format_interactions(recent_interactions)}
        """
        
        # Create new task with enhanced description
        enhanced_task = Task(
            description=enhanced_description,
            agent=task.agent,
            tools=task.tools if hasattr(task, 'tools') else None,
            expected_output=task.expected_output if hasattr(task, 'expected_output') else None
        )
        
        return enhanced_task
    
    def _format_interactions(self, interactions: List[Dict[str, Any]]) -> str:
        """Format interactions for context injection"""
        if not interactions:
            return "No previous interactions."
        
        formatted = []
        for interaction in interactions:
            formatted.append(f"- {interaction['role']}: {interaction['content'][:100]}...")
        
        return "\n".join(formatted)
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary"""
        return {
            "agent_role": self.agent.role,
            "context": self.context.get_context_summary(),
            "metrics": self.metrics.to_dict()
        }


class AgentRouter:
    """
    Routes tasks to most appropriate agents based on context and performance
    
    Implements dynamic agent selection as recommended in code review.
    """
    
    def __init__(self, agents: Dict[str, StatefulAgent]):
        self.agents = agents
        self.performance_history = defaultdict(list)
        self.config = get_config()
        self.logger = logging.getLogger(f"{__name__}.AgentRouter")
    
    def select_agent(self, task_type: str, context: Optional[AgentContext] = None) -> StatefulAgent:
        """Select best agent based on past performance and context"""
        candidates = self._get_candidate_agents(task_type)
        
        if not candidates:
            # Fallback to first available agent
            fallback_agent = next(iter(self.agents.values()))
            self.logger.warning(f"No candidates for {task_type}, using fallback: {fallback_agent.agent.role}")
            return fallback_agent
        
        if len(candidates) == 1:
            return candidates[0]
        
        # Score candidates based on multiple factors
        best_agent = max(candidates, key=lambda a: self._score_agent(a, context))
        
        self.logger.info(f"Selected agent {best_agent.agent.role} for task type {task_type}")
        return best_agent
    
    def _get_candidate_agents(self, task_type: str) -> List[StatefulAgent]:
        """Get candidate agents for task type"""
        # Simple mapping - can be enhanced with more sophisticated logic
        task_agent_mapping = {
            "concept_detection": ["concept_detection", "general"],
            "maturity_scoring": ["maturity_scoring", "general"],  
            "learning_path": ["learning_path", "general"],
            "question_generation": ["question_generation", "general"]
        }
        
        eligible_roles = task_agent_mapping.get(task_type, ["general"])
        
        candidates = []
        for agent in self.agents.values():
            if any(role in agent.agent.role.lower() for role in eligible_roles):
                candidates.append(agent)
        
        return candidates
    
    def _score_agent(self, agent: StatefulAgent, context: Optional[AgentContext] = None) -> float:
        """Score agent based on performance, context, and load"""
        # Performance score (0-1)
        performance_score = agent.metrics.success_rate
        
        # Context relevance score (0-1)
        context_score = self._calculate_context_relevance(agent, context)
        
        # Load score (0-1) - prefer less busy agents
        load_score = 1.0 - min(1.0, agent.context.total_interactions / 100)
        
        # Weighted combination
        final_score = (0.5 * performance_score + 0.3 * context_score + 0.2 * load_score)
        
        self.logger.debug(f"Agent {agent.agent.role} scored: {final_score:.3f} "
                         f"(perf: {performance_score:.3f}, context: {context_score:.3f}, load: {load_score:.3f})")
        
        return final_score
    
    def _calculate_context_relevance(self, agent: StatefulAgent, context: Optional[AgentContext]) -> float:
        """Calculate how relevant agent is to current context"""
        if not context:
            return 0.5  # Neutral score
        
        # Check if agent has worked with similar contexts
        agent_domains = set(agent.context.confidence_scores.keys())
        context_domains = set(context.confidence_scores.keys())
        
        if not agent_domains or not context_domains:
            return 0.5
        
        # Calculate overlap
        overlap = len(agent_domains.intersection(context_domains))
        total_domains = len(agent_domains.union(context_domains))
        
        return overlap / total_domains if total_domains > 0 else 0.5


class AgentFactory:
    """
    Factory for creating properly configured agents
    
    Addresses code review issues around agent creation consistency.
    """
    
    def __init__(self, config: AssessmentConfig = None):
        self.config = config or get_config()
        self.logger = logging.getLogger(f"{__name__}.AgentFactory")
        self._llm_cache: Optional[ChatOpenAI] = None
    
    @property
    def llm(self) -> ChatOpenAI:
        """Get cached LLM instance"""
        if self._llm_cache is None:
            self._llm_cache = self._create_llm()
        return self._llm_cache
    
    def _create_llm(self) -> ChatOpenAI:
        """Create LLM instance with configuration"""
        llm_config = self.config.llm.to_dict()
        
        self.logger.info(f"Creating LLM with config: {llm_config}")
        
        return ChatOpenAI(**llm_config)
    
    def create_stateful_agent(self, role: str, goal: str, backstory: str,
                             tools: List[Any] = None, agent_id: str = None) -> StatefulAgent:
        """Create a stateful agent with context tracking"""
        
        # Create base CrewAI agent
        agent = Agent(
            role=role,
            goal=goal,
            backstory=backstory,
            llm=self.llm,
            tools=tools or [],
            verbose=self.config.agents.enable_verbose,
            memory=self.config.agents.enable_memory,
            max_iter=self.config.agents.max_iterations
        )
        
        # Create context
        context = AgentContext(
            agent_id=agent_id or f"{role.lower().replace(' ', '_')}_{int(time.time())}"
        )
        
        # Create stateful agent
        stateful_agent = StatefulAgent(agent, context, self.config)
        
        self.logger.info(f"Created stateful agent: {role} with ID {context.agent_id}")
        
        return stateful_agent
    
    def create_agent_collection(self) -> Dict[str, StatefulAgent]:
        """Create complete collection of assessment agents"""
        agents = {}
        
        # Define agent specifications
        agent_specs = [
            {
                "role": "AI Concept Detection Specialist",
                "goal": "Accurately identify AI concepts in user responses and assess understanding depth",
                "backstory": "Expert in AI education with deep knowledge of how people learn AI concepts",
                "agent_id": "concept_detection"
            },
            {
                "role": "AI Maturity Scoring Expert", 
                "goal": "Evaluate AI readiness maturity based on response analysis and provide accurate scoring",
                "backstory": "Specialist in AI adoption assessment with experience in organizational readiness",
                "agent_id": "maturity_scoring"
            },
            {
                "role": "Learning Path Designer",
                "goal": "Create personalized AI learning recommendations based on assessment results", 
                "backstory": "Educational technology expert specializing in personalized learning paths",
                "agent_id": "learning_path"
            },
            {
                "role": "Question Generation Expert",
                "goal": "Generate contextually appropriate assessment questions based on user progress",
                "backstory": "Assessment design specialist with expertise in adaptive questioning",
                "agent_id": "question_generation"
            }
        ]
        
        # Create agents
        for spec in agent_specs:
            agents[spec["agent_id"]] = self.create_stateful_agent(**spec)
        
        self.logger.info(f"Created {len(agents)} assessment agents")
        
        return agents