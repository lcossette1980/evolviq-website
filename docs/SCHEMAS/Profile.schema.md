# Profile Schema (v1.0)

Aggregated view combining latest assessment results with derived insights, suitable for UI and agent context.

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Profile",
  "type": "object",
  "required": ["user_id", "version", "last_updated"],
  "properties": {
    "user_id": {"type": "string"},
    "latest_results": {
      "type": "object",
      "properties": {
        "ai_knowledge": {
          "type": "object",
          "properties": {
            "assessment_id": {"type": "string"},
            "overall_score": {"type": "number"},
            "maturity_level": {"type": "string"},
            "dimension_scores": {"type": "object"}
          },
          "additionalProperties": true
        },
        "org_readiness": {
          "type": "object",
          "properties": {
            "assessment_id": {"type": "string"},
            "overall_score": {"type": "number"},
            "maturity_level": {"type": "string"},
            "dimension_scores": {"type": "object"}
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "derived": {
      "type": "object",
      "properties": {
        "strengths": {"type": "array", "items": {"type": "string"}},
        "gaps": {"type": "array", "items": {"type": "string"}},
        "priorities": {"type": "array", "items": {"type": "string"}},
        "learning_plan": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["recommendation_id", "title", "dimension", "status"],
            "properties": {
              "recommendation_id": {"type": "string"},
              "title": {"type": "string"},
              "dimension": {"type": "string"},
              "difficulty": {"type": "string"},
              "impact": {"type": "string"},
              "guide_ref": {"type": "string"},
              "status": {"type": "string", "enum": ["todo", "in_progress", "done"]}
            },
            "additionalProperties": true
          }
        }
      },
      "additionalProperties": true
    },
    "guide_links": {
      "type": "array",
      "items": {"type": "string", "description": "guide_id#section_id"}
    },
    "provenance": {
      "type": "object",
      "properties": {
        "assessment_ids": {"type": "array", "items": {"type": "string"}},
        "inputs_summary": {"type": "object"}
      }
    },
    "last_updated": {"type": "string", "format": "date-time"},
    "version": {"type": "string"}
  },
  "additionalProperties": true
}
```

Example:
```
{
  "user_id": "uid_123",
  "latest_results": {
    "ai_knowledge": {"assessment_id": "ak_1", "overall_score": 58, "maturity_level": "Developing"},
    "org_readiness": {"assessment_id": "or_2", "overall_score": 62, "maturity_level": "Mature"}
  },
  "derived": {
    "strengths": ["Data Infrastructure"],
    "gaps": ["Governance & Ethics"],
    "priorities": ["Stand up AI governance"],
    "learning_plan": [
      {"recommendation_id": "rec-1", "title": "Define AI roadmap", "dimension": "Leadership & Strategy", "status": "todo", "guide_ref": "AIImplementationPlaybook#strategy"}
    ]
  },
  "guide_links": ["AIImplementationPlaybook#strategy"],
  "provenance": {"assessment_ids": ["ak_1", "or_2"]},
  "last_updated": "2025-08-11T17:20:00Z",
  "version": "1.0"
}
```
