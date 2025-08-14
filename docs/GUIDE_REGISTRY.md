# Guide Registry (v2.0) - Single Master Guide Architecture

Purpose: Central configuration for the unified AI Project Implementation Guide that dynamically adapts content based on assessments and project context.

## Master Guide Model
```json
{
  "guide_id": "master_implementation_guide",
  "title": "AI Project Implementation Guide",
  "version": "2.0",
  "updated_at": "2024-12-14",
  "path": "/guides/AIProjectImplementation",
  "description": "Comprehensive, adaptive guide covering all aspects of AI project implementation",
  "sections": {
    "strategy": {
      "title": "AI Strategy & Planning",
      "dimensions": ["Leadership & Strategy"],
      "maturity_targets": ["Developing", "Mature"],
      "subsections": ["vision", "roadmap", "governance", "change-management"]
    },
    "readiness": {
      "title": "Organizational Readiness",
      "dimensions": ["Governance & Ethics", "Human Resources & Skills"],
      "maturity_targets": ["Initial", "Developing"],
      "subsections": ["assessment", "gap-analysis", "capability-building", "culture"]
    },
    "use_cases": {
      "title": "Use Case Development",
      "dimensions": ["Market & Customer Focus", "Financial Resources"],
      "maturity_targets": ["Developing", "Mature"],
      "subsections": ["identification", "prioritization", "roi-analysis", "business-case"]
    },
    "implementation": {
      "title": "Technical Implementation",
      "dimensions": ["Technology Infrastructure", "Data Infrastructure"],
      "maturity_targets": ["Developing", "Mature"],
      "subsections": ["architecture", "data-pipeline", "model-development", "mlops"]
    },
    "deployment": {
      "title": "Deployment & Scaling",
      "dimensions": ["Process & Operations"],
      "maturity_targets": ["Mature", "Advanced"],
      "subsections": ["pilot", "production", "monitoring", "optimization"]
    },
    "governance": {
      "title": "AI Governance & Ethics",
      "dimensions": ["Governance & Ethics"],
      "maturity_targets": ["Developing", "Advanced"],
      "subsections": ["ethics", "risk", "compliance", "transparency"]
    }
  }
}
```

## Dimension → Section Mapping
- **Leadership & Strategy** → strategy (vision, roadmap)
- **Governance & Ethics** → governance (ethics, compliance), readiness (assessment)
- **Data Infrastructure** → implementation (data-pipeline, architecture)
- **Technology Infrastructure** → implementation (mlops, model-development)
- **Human Resources & Skills** → readiness (capability-building, culture)
- **Process & Operations** → deployment (pilot, production)
- **Market & Customer Focus** → use_cases (identification, prioritization)
- **Financial Resources** → use_cases (roi-analysis, business-case)

## Legacy Guide Consolidation
All previous guides merged into master guide sections:
- `AIImplementationPlaybook` → Merged into strategy, implementation sections
- `AIReadinessAssessment` → Merged into readiness, governance sections  
- `AIUseCaseROIToolkit` → Merged into use_cases, deployment sections
- `AIStrategyStarterKit` → Merged into strategy, governance sections

Note: Legacy guide IDs preserved for backwards compatibility but all route to master guide.

## Storage
- Configuration stored as static JSON in backend
- Progress tracked per project in Firestore `projects/{projectId}/guide_progress`
- Personalization cache in Firestore `users/{userId}/guide_context`
