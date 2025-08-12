# Guide Registry (v1.0)

Purpose: Central map from assessment dimensions and maturity targets to guide modules/sections for learning plan generation.

## Model
```
{
  "guide_id": "AIImplementationPlaybook",
  "title": "AI Implementation Playbook",
  "tags": ["strategy", "mlops"],
  "dimensions": ["Leadership & Strategy", "Technology Infrastructure"],
  "maturity_targets": ["Developing", "Mature"],
  "sections": [
    {"id": "strategy", "title": "Strategy Foundations", "anchors": ["vision", "roadmap"], "dimensions": ["Leadership & Strategy"], "level": "foundational"},
    {"id": "mlops", "title": "MLOps", "anchors": ["registry", "deployment"], "dimensions": ["Technology Infrastructure"], "level": "developing"}
  ]
}
```

## Initial Mapping Examples
- Leadership & Strategy → AIImplementationPlaybook#strategy, AIStrategyStarterKit#foundations
- Governance & Ethics → AIReadinessAssessment#governance
- Data Infrastructure → AIImplementationPlaybook#data, AIUseCaseROIToolkit#data-readiness
- Technology Infrastructure → AIImplementationPlaybook#mlops
- Human Resources & Skills → AIReadinessAssessment#training, AIImplementationPlaybook#people
- Process & Operations → AIImplementationPlaybook#process
- Market & Customer Focus → AIUseCaseROIToolkit#prioritization
- Financial Resources → AIUseCaseROIToolkit#roi

## Storage
- Start as a static JSON in the backend or serve from Firestore collection `guide_registry`
- Must include `version` and `updated_at`
