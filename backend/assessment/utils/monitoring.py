"""
Performance Monitoring System

Implements comprehensive monitoring and metrics collection as recommended
in the code review for production readiness.
"""

import time
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict, deque

from ..core.config import get_config, AssessmentConfig


logger = logging.getLogger(__name__)


@dataclass
class PerformanceMetric:
    """Individual performance metric"""
    name: str
    value: float
    timestamp: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "value": self.value,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


class PerformanceMonitor:
    """
    Comprehensive performance monitoring system
    
    Tracks:
    - Execution times
    - Success rates
    - Resource utilization
    - System health
    - Trend analysis
    """
    
    def __init__(self, config: AssessmentConfig = None):
        self.config = config or get_config()
        self.logger = logging.getLogger(f"{__name__}.PerformanceMonitor")
        
        # Metric storage (in production, use proper time-series DB)
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.counters: Dict[str, int] = defaultdict(int)
        self.timers: Dict[str, float] = {}
        
        # System start time
        self.start_time = datetime.now()
        
        self.logger.info("Performance monitor initialized")
    
    def record_metric(self, name: str, value: float, metadata: Dict[str, Any] = None) -> None:
        """Record a performance metric"""
        metric = PerformanceMetric(
            name=name,
            value=value,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        self.metrics[name].append(metric)
        
        if self.config.enable_detailed_logging:
            self.logger.debug(f"Recorded metric {name}: {value}")
    
    def increment_counter(self, name: str, increment: int = 1) -> None:
        """Increment a counter metric"""
        self.counters[name] += increment
        
        # Also record as time series
        self.record_metric(f"{name}_count", self.counters[name])
    
    def start_timer(self, name: str) -> None:
        """Start a timer"""
        self.timers[name] = time.time()
    
    def end_timer(self, name: str, metadata: Dict[str, Any] = None) -> float:
        """End a timer and record the duration"""
        if name not in self.timers:
            self.logger.warning(f"Timer {name} was not started")
            return 0.0
        
        duration = time.time() - self.timers[name]
        del self.timers[name]
        
        self.record_metric(f"{name}_duration", duration, metadata)
        return duration
    
    def record_execution_time(self, operation: str, execution_time: float, 
                            success: bool = True, metadata: Dict[str, Any] = None) -> None:
        """Record execution time for an operation"""
        self.record_metric(f"{operation}_execution_time", execution_time, metadata)
        self.increment_counter(f"{operation}_total")
        
        if success:
            self.increment_counter(f"{operation}_success")
        else:
            self.increment_counter(f"{operation}_failure")
    
    def get_metric_summary(self, name: str, duration: timedelta = None) -> Dict[str, Any]:
        """Get summary statistics for a metric"""
        if name not in self.metrics:
            return {"error": f"Metric {name} not found"}
        
        metric_data = list(self.metrics[name])
        
        # Filter by duration if specified
        if duration:
            cutoff_time = datetime.now() - duration
            metric_data = [m for m in metric_data if m.timestamp >= cutoff_time]
        
        if not metric_data:
            return {"error": f"No data for metric {name} in specified duration"}
        
        values = [m.value for m in metric_data]
        
        return {
            "name": name,
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "average": sum(values) / len(values),
            "latest": values[-1] if values else None,
            "first_recorded": metric_data[0].timestamp.isoformat(),
            "last_recorded": metric_data[-1].timestamp.isoformat()
        }
    
    def get_counter_summary(self) -> Dict[str, int]:
        """Get summary of all counters"""
        return dict(self.counters)
    
    def get_success_rate(self, operation: str) -> Dict[str, Any]:
        """Calculate success rate for an operation"""
        total_key = f"{operation}_total"
        success_key = f"{operation}_success"
        
        total = self.counters.get(total_key, 0)
        success = self.counters.get(success_key, 0)
        
        if total == 0:
            return {
                "operation": operation,
                "success_rate": 0.0,
                "total_operations": 0,
                "successful_operations": 0,
                "failed_operations": 0
            }
        
        return {
            "operation": operation,
            "success_rate": success / total,
            "total_operations": total,
            "successful_operations": success,
            "failed_operations": total - success
        }
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health metrics"""
        uptime = datetime.now() - self.start_time
        
        # Calculate key metrics
        assessment_success_rate = self.get_success_rate("assessment")
        question_generation_success_rate = self.get_success_rate("question_generation")
        
        # Get recent performance trends
        recent_assessments = self.get_metric_summary("assessment_execution_time", 
                                                    duration=timedelta(hours=1))
        
        return {
            "system_uptime": str(uptime),
            "start_time": self.start_time.isoformat(),
            "current_time": datetime.now().isoformat(),
            "assessment_success_rate": assessment_success_rate["success_rate"],
            "question_generation_success_rate": question_generation_success_rate["success_rate"],
            "total_assessments": self.counters.get("assessment_total", 0),
            "total_questions_generated": self.counters.get("question_generation_total", 0),
            "active_timers": len(self.timers),
            "recent_performance": recent_assessments,
            "health_status": self._calculate_health_status()
        }
    
    def _calculate_health_status(self) -> str:
        """Calculate overall system health status"""
        # Simple health calculation based on success rates
        assessment_rate = self.get_success_rate("assessment")["success_rate"]
        question_rate = self.get_success_rate("question_generation")["success_rate"]
        
        if assessment_rate >= 0.95 and question_rate >= 0.95:
            return "excellent"
        elif assessment_rate >= 0.90 and question_rate >= 0.90:
            return "good"
        elif assessment_rate >= 0.80 and question_rate >= 0.80:
            return "fair"
        elif assessment_rate >= 0.60 and question_rate >= 0.60:
            return "poor"
        else:
            return "critical"
    
    def get_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        return {
            "report_generated": datetime.now().isoformat(),
            "system_health": self.get_system_health(),
            "counter_summary": self.get_counter_summary(),
            "key_metrics": {
                "assessment_execution_time": self.get_metric_summary("assessment_execution_time"),
                "question_generation_duration": self.get_metric_summary("question_generation_duration"),
                "concept_detection_duration": self.get_metric_summary("concept_detection_duration"),
                "maturity_scoring_duration": self.get_metric_summary("maturity_scoring_duration")
            },
            "success_rates": {
                "assessments": self.get_success_rate("assessment"),
                "question_generation": self.get_success_rate("question_generation"),
                "concept_detection": self.get_success_rate("concept_detection"),
                "maturity_scoring": self.get_success_rate("maturity_scoring")
            }
        }
    
    def export_metrics(self, format: str = "json") -> str:
        """Export metrics in specified format"""
        if format.lower() == "json":
            import json
            return json.dumps(self.get_comprehensive_report(), indent=2)
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def reset_metrics(self) -> None:
        """Reset all metrics (use with caution)"""
        self.metrics.clear()
        self.counters.clear()
        self.timers.clear()
        self.start_time = datetime.now()
        
        self.logger.warning("All metrics have been reset")


# Global monitor instance
_monitor: Optional[PerformanceMonitor] = None


def get_monitor() -> PerformanceMonitor:
    """Get global performance monitor instance"""
    global _monitor
    if _monitor is None:
        _monitor = PerformanceMonitor()
    return _monitor


def record_metric(name: str, value: float, metadata: Dict[str, Any] = None) -> None:
    """Convenience function to record metric"""
    get_monitor().record_metric(name, value, metadata)


def increment_counter(name: str, increment: int = 1) -> None:
    """Convenience function to increment counter"""
    get_monitor().increment_counter(name, increment)


def record_execution_time(operation: str, execution_time: float, 
                         success: bool = True, metadata: Dict[str, Any] = None) -> None:
    """Convenience function to record execution time"""
    get_monitor().record_execution_time(operation, execution_time, success, metadata)