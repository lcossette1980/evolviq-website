# AssessmentResult Schema (v1.0)

Represents one normalized assessment run result. Works for both AI Knowledge and Org Readiness.

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AssessmentResult",
  "type": "object",
  "required": ["id", "type", "completed_at", "overall_score", "dimension_scores", "version"],
  "properties": {
    "id": {"type": "string", "description": "Assessment result id"},
    "type": {"type": "string", "enum": ["ai-knowledge", "org-readiness"]},
    "completed_at": {"type": "string", "format": "date-time"},
    "inputs": {
      "type": "object",
      "description": "User/org inputs used to compute results (sanitized)",
      "properties": {
        "org_info": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "industry": {"type": "string"},
            "size": {"type": "string"},
            "current_ai_usage": {"type": "string"}
          },
          "additionalProperties": true
        },
        "user_info": {"type": "object"}
      },
      "additionalProperties": true
    },
    "overall_score": {"type": "number", "minimum": 0, "maximum": 100},
    "maturity_level": {"type": "string"},
    "dimension_scores": {
      "type": "object",
      "additionalProperties": {"type": "number", "minimum": 0, "maximum": 100}
    },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "dimension"],
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"},
          "dimension": {"type": "string"},
          "difficulty": {"type": "string", "enum": ["low", "medium", "high"]},
          "impact": {"type": "string", "enum": ["low", "medium", "high"]},
          "guide_ref": {"type": "string", "description": "guide_id#section_id"}
        },
        "additionalProperties": true
      }
    },
    "artifacts": {
      "type": "object",
      "properties": {
        "visualizations": {"type": "object"},
        "report_url": {"type": "string"}
      },
      "additionalProperties": true
    },
    "version": {"type": "string"},
    "meta": {"type": "object", "additionalProperties": true}
  },
  "additionalProperties": true
}
```

Example (Org Readiness):
```
{
  "id": "org-2025-08-11-xyz",
  "type": "org-readiness",
  "completed_at": "2025-08-11T17:12:00Z",
  "inputs": {"org_info": {"name": "Acme", "industry": "Technology", "size": "medium", "current_ai_usage": "pilot"}},
  "overall_score": 62,
  "maturity_level": "Mature",
  "dimension_scores": {"Leadership & Strategy": 55, "Data Infrastructure": 68},
  "recommendations": [{"id": "rec-1", "title": "Define AI roadmap", "dimension": "Leadership & Strategy", "difficulty": "medium", "impact": "high", "guide_ref": "AIImplementationPlaybook#strategy"}],
  "artifacts": {"visualizations": {"dimension_analysis": "<base64>"}},
  "version": "1.0"
}
```
