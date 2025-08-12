# TODO: Unified Profile, Guides, and CrewAI Prep

This is the actionable checklist with statuses and acceptance criteria. Update as tasks complete.

## Backend
- [ ] Define JSON Schemas (AssessmentResult, Profile) in `backend/schemas/` and link in README
- [ ] Implement POST `/api/assessments/{type}/complete` (persist summary + trigger recompute)
- [x] Implement GET `/api/assessments/profile` (stub with mock data implemented)
- [ ] Implement POST `/api/profile/learning-plan` (map gaps to guides)
- [ ] Implement GET `/api/guides/registry` (static JSON or Firestore-backed)
- [ ] Implement GET `/api/assessments/profile/context` (sanitized agent context)
- [ ] (Optional) Implement GET `/api/assessments/profile/tasks` (task graph)
- [ ] Add feature flags `PROFILE_ENABLED`, `LEARNING_PLAN_ENABLED`
- [ ] PII sanitization unit test
- [ ] Real PDF generation (WeasyPrint/ReportLab) for Org Readiness

## Frontend
- [ ] Add types in `src/types/assessments.ts` (AssessmentResult, Profile)
- [ ] After calculate: POST `complete` for AI Knowledge + Org Readiness
- [x] Dashboard: Add AI Capability Profile card (ProfileCard component created and integrated)
- [ ] Add Learning Plan view (persist per user; progress states)
- [ ] Guides registry integration and deep links to sections
- [ ] Friendly empty/error states

## Integration & Mapping
- [ ] Author GuideRegistry content with dimension→section mapping and maturity targets
- [ ] Extend recommendation catalog (difficulty, effort, impact)

## DevOps & Rules
- [ ] Firestore rules: profile/assessments summaries (user-scoped read/write); learning_plan writes
- [ ] Document environment flags and deployment steps

## QA
- [ ] Unit tests: profile aggregation under different inputs
- [ ] E2E: complete both assessments → aggregated profile → learning plan
- [ ] Performance: profile GET < 300ms (basic memoization)

## CrewAI Prep (no agent yet)
- [ ] Context payload contract documented and implemented
- [ ] Tasks payload contract documented and stubbed

## Completed (keep updated)
- [x] Tools UI/UX unified across EDA/Classification/Clustering/Regression
- [x] NLP migrated to UnifiedInteractiveTool and route updated
- [x] Org Readiness results personalized (industry-aware, dynamic priorities, narrative)
- [x] Roadmap + Schemas + API Spec + Guide Registry docs added under `docs/`

## References
- Roadmap: `docs/ASSESSMENTS_PROFILE_ROADMAP.md`
- Schemas: `docs/SCHEMAS/*.md`
- API: `docs/API_SPEC_PROFILE.md`
- Guides: `docs/GUIDE_REGISTRY.md`
