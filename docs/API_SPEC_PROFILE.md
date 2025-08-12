# API Spec: Assessments Profile and Guides (v1.0)

## POST /api/assessments/{type}/complete
- Purpose: Persist normalized summary and trigger profile recompute
- Auth: Firebase Bearer token
- Body:
```
{
  "result": AssessmentResult (see schemas)
}
```
- Response: `{ "ok": true, "assessment_id": "..." }`

## GET /api/assessments/profile
- Purpose: Aggregate latest AI Knowledge + Org Readiness into a Profile
- Auth: Firebase Bearer token
- Response: `Profile` (see schema)

## POST /api/profile/learning-plan
- Purpose: Generate ordered learning plan from profile gaps
- Auth: Firebase Bearer token
- Body: Optional overrides `{ "max_items": 10 }`
- Response:
```
{
  "items": [ { "recommendation_id": "...", "title": "...", "dimension": "...", "guide_ref": "Guide#Section", "status": "todo" } ]
}
```

## GET /api/guides/registry
- Purpose: Provide mapping from dimensions/maturity to guide sections
- Auth: Public or authenticated (decide based on content strategy)
- Response:
```
[
  {
    "guide_id": "AIImplementationPlaybook",
    "title": "AI Implementation Playbook",
    "tags": ["strategy", "mlops"],
    "dimensions": ["Leadership & Strategy", "Technology Infrastructure"],
    "maturity_targets": ["Developing", "Mature"],
    "sections": [
      {"id": "strategy", "title": "Strategy Foundations", "anchors": ["vision", "roadmap"]},
      {"id": "mlops", "title": "MLOps", "anchors": ["registry", "deployment"]}
    ]
  }
]
```

## GET /api/assessments/profile/context
- Purpose: Agent-ready sanitized context payload
- Response:
```
{
  "version": "1.0",
  "profile": { /* Profile subset */ },
  "goals": ["Close gaps in Governance & Ethics", "Establish AI roadmap"],
  "resources": ["AIImplementationPlaybook#strategy"],
  "events": [ {"type": "assessment_completed", "id": "...", "ts": "..."} ]
}
```

## GET /api/assessments/profile/tasks (optional)
- Purpose: Task graph derived from recommendations with dependencies
- Response:
```
{
  "tasks": [
    {"id": "task-1", "title": "Define AI roadmap", "depends_on": [], "guide_ref": "AIImplementationPlaybook#strategy"},
    {"id": "task-2", "title": "Stand up governance", "depends_on": ["task-1"], "guide_ref": "AIReadinessAssessment#governance"}
  ]
}
```

## Notes
- All endpoints versioned by response `version`
- PII sanitized; org/user names optional and can be redacted server-side
