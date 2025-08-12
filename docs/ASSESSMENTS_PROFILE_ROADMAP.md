# AI Capability Profile Roadmap

Purpose: Unify AI Knowledge + Org Readiness assessments with implementation guides into a single profile that later feeds a CrewAI agentic system. This document is the operational plan and single source of truth.

## Objectives
- Aggregate latest assessment results into a versioned Profile per user
- Map gaps to curated guide modules and generate a Learning Plan
- Provide stable API contracts and sanitized context for future agents

## Key Concepts
- `AssessmentResult`: Normalized results of one assessment run
- `Profile`: Aggregated, derived view combining latest assessment results
- `GuideRegistry`: Metadata linking guide content to dimensions and maturity targets

## Data Flow
1. User completes an assessment → backend calculates results
2. Frontend posts “complete” → backend persists summary + emits recompute (or recompute on GET)
3. Profile endpoint aggregates latest results → returns derived strengths/gaps/priorities
4. Learning plan endpoint maps gaps to GuideRegistry → returns ordered plan
5. CrewAI (future) consumes `/profile/context` and `/profile/tasks` for planning

## Endpoints (planned)
- POST `/api/assessments/{type}/complete`
- GET `/api/assessments/profile`
- POST `/api/profile/learning-plan`
- GET `/api/guides/registry`
- GET `/api/assessments/profile/context`
- GET `/api/assessments/profile/tasks`

## Versioning
- Every schema includes `version` (e.g., "1.0"); breaking changes bump minor/major
- Profile response includes `last_updated` and `assessment_ids` provenance

## Security & PII
- Profile and context responses exclude PII; only org-level abstracted fields included
- Reports/visualizations referenced by URL or keys; raw data never embedded beyond safe summaries

## Acceptance Criteria
- Deterministic, reproducible profile outputs given inputs and version
- Robust with only one assessment present
- Learning plan items include dimension, difficulty, impact, and guide references

## Status Summary
- Unified tools UI/UX: Completed
- NLP migrated to UnifiedInteractiveTool: Completed
- Org Readiness results personalization: Completed
- This roadmap + schemas + API spec: In Progress

