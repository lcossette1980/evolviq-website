# Production Readiness Master TODO

Purpose: Single source of truth for getting the app production‑ready on Railway (backend) and Vercel (frontend). Each item includes a brief explanation and serves as a running checklist.

## 1) Environment & Configuration
- [ ] Configure Railway env vars (FIREBASE_SERVICE_ACCOUNT_KEY, ADMIN_EMAILS, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CORS_ALLOWED_ORIGINS, PROFILE_ENABLED, LEARNING_PLAN_ENABLED)
  - Ensures secure auth, Stripe, allowed origins, and feature flags.
  - CORS_ALLOWED_ORIGINS should be: "https://evolviq.ai,https://www.evolviq.ai,http://localhost:3000,http://localhost:3001"
- [ ] Restrict CORS to Vercel domain(s) and localhost only
  - Avoids wildcard access; reduces attack surface.
- [ ] Configure Vercel env vars (REACT_APP_FIREBASE_*, REACT_APP_API_BASE_URL, STRIPE_PUBLISHABLE_KEY)
  - Points the frontend to the live backend and initializes Firebase/Stripe.
- [ ] Verify feature flags for prod vs preview
  - Prevents unfinished features from going live inadvertently.

## 2) Backend Security Hardening
- [ ] Enforce Firebase Bearer tokens on protected endpoints
  - Blocks anonymous usage where not permitted.
- [ ] Server-side premium checks for paywalled routes
  - Removes any client-side bypass risk.
- [ ] Add security headers (CSP, HSTS, Referrer-Policy, Permissions-Policy, X-Frame-Options, X-Content-Type-Options)
  - Protects against XSS, clickjacking, and MIME sniffing.
- [ ] Harden file uploads (types, size limits, filename sanitization)
  - Minimizes risk from malicious uploads.
- [ ] Scrub PII in logs; sanitize org/user names in context endpoints
  - Ensures privacy compliance and safer logs.
- [ ] Confirm rate limits and return standard headers
  - Prevents abuse while giving clients visibility into limits.
- [ ] Normalize error responses; hide stack traces
  - Improves DX/UX while not leaking internals.

## 3) Stripe Integration
- [ ] Verify webhook signature and idempotency
  - Guarantees event integrity and avoids double-processing.
- [ ] E2E test: checkout, upgrade, portal flows
  - Confirms the billing experience is reliable.
- [ ] Confirm no card data is handled by our servers
  - PCI alignment via Stripe-hosted flows only.

## 4) Session & Data Retention
- [ ] Confirm session TTL and cleanup cadence
  - Frees resources and mitigates stale session buildup.
- [ ] Cleanup /tmp uploads; enforce row/size caps
  - Manages storage and prevents runaway memory usage.

## 5) Backend Functionality
- [ ] Keep normalized response shapes (validate, preprocess, train, analyze)
  - Ensures frontend stability across tools.
- [x] Classification visuals (ROC/AUC, confusion heatmap, feature importances)
  - Parity with regression visuals; better insights.
- [x] Clustering export endpoint (summary/labels CSV)
  - Enables downstream usage and documentation.
- [x] GET /api/assessments/profile endpoint (stub with mock data)
  - Foundation for unified capability profile.
- [ ] EDA completeness (quality, univariate, bivariate; Plotly option if needed)
  - Consistent visualization layer across tools.
- [ ] Export endpoints (JSON/CSV/Excel) with ownership checks
  - Secure data extraction that scales.
- [ ] Health endpoints with version/timestamp
  - Operational visibility for monitoring.

## 6) Firestore Rules & Indexes
- [ ] Users: owner read/write; admin read; audit updates
  - Protects user profile data.
- [ ] Projects: owner read/write (consider under users/{uid}/projects)
  - Tighter scoping for project data.
- [ ] Guides under projects: owner-only access
  - Keeps project‑scoped guides private.
- [ ] Guide progress docs: owner read/write only
  - Prevents progress leakage between users.
- [ ] Assessments summaries: user‑scoped collections
  - Isolates assessment data per user.
- [ ] Add indexes for lastUpdated/userId queries
  - Faster dashboard queries and lists.

## 7) Central Organization Profile
- [ ] Treat company/industry/teamSize as master source on user profile
  - Single truth, fewer re‑entries.
- [ ] Backfill older users missing these fields
  - Makes autofill consistent for legacy users.
- [ ] Surface org details in dashboard header/profile card
  - Visibility for the user and consistency across flows.

## 8) Frontend Flows
- [ ] EDA: Upload → Validate → Configure → Analyze (server) → Results
- [ ] Regression: Upload → Validate (target) → Preprocess (server) → Train (server) → Results (visuals)
- [ ] Classification: Upload → Validate → Select Target → Preprocess (server) → Configure → Train (server) → Results
- [ ] Clustering: Upload → Validate → Configure → Analyze (server) → Results (optimization/comparison/viz)
- [ ] NLP: Upload (text column required) → Validate → Configure → Analyze → Results
- [ ] Ensure all “Return to Dashboard” buttons navigate correctly
  - Smooth transitions back to the dashboard.

## 9) Guides & Projects UX
- [x] Simplified ProjectsTab to show per‑project tools (interactive guide + ROI)
  - Cleaner UX with consolidated, project‑attached tools.
- [x] Updated GUIDE_REGISTRY.md to single master entry architecture
  - Unified guide system with dynamic content adaptation.
- [ ] Clicking a guide opens it; Start/Resume updates progress and opens
  - Reduces confusion; direct navigation.
- [ ] Keep "New Project" CTA above guides list
  - Clear separation of actions vs content.
- [x] Remove Projects tab quick actions (clean layout)
  - Less visual noise.
- [ ] Support dynamic `/guides/:guideId` viewer and protect routes
  - Registry-driven guide access and fallback renderer.
- [ ] Autofill Create Project from org profile or last project
  - Saves time and keeps data consistent.

## 22) Projects Tab — Interactive Guide + ROI (Launch)

- [x] Remove Learning Plan tab from dashboard
  - Simplifies IA; focus on Projects, Tools, and Assessments.
- [x] Replace master guide with project-specific tools
  - New routes: `/projects/:projectId/guide` (interactive guide) and `/projects/:projectId/roi` (ROI calculator).
- [x] Persist tool outputs in Firestore under project
  - Store under `projects/{id}.tools.{interactiveGuide|roiCalculator}` with timestamps.
- [x] Add UI entrypoints per project card
  - Buttons for Interactive Implementation Guide and ROI Calculator.
- [x] Add tool progress badges to project cards
  - Show guide phase completion count and ROI saved indicator.
- [x] Append tool events to project timeline
  - Events like `tool_saved` with summary and timestamps.
- [x] Update ProjectInteractiveGuide to match new_files/interactive_ai_guide.tsx
  - Implemented Likert scale assessments (1-5 radio buttons) with detailed descriptions
  - Added Phase 0 (Readiness Assessment) with 5 dimensions
  - Added Phase 1 (Strategy & Vision) with problem definition and value hypothesis
  - Includes readiness scoring, strengths/improvements analysis, and recommendations
- [x] Update ProjectRoiCalculator to match new_files/updated_roi_calculator.html
  - Complete input restructure: Baseline Metrics, Implementation Costs, Expected Improvements
  - Added scenario buttons (Conservative, Realistic, Optimistic) 
  - Exact calculation logic from HTML including labor savings, error reduction, retention value
  - Instructions section and detailed financial breakdown

## 10) UI/UX Polish
- [x] ProfileCard component integrated in dashboard Overview tab
  - Shows unified AI capability profile when assessments completed.
- [ ] Consistent styles, spacing, and copy tone
  - Professional and predictable UI.
- [ ] Skeletons/toasts/empty states across tools & dashboard
  - Better perceived performance and clarity.
- [ ] Accessibility (semantics, focus, keyboard, contrast)
  - Inclusive usage and compliance.
- [ ] Mobile responsiveness for all key views
  - Usable on phones and tablets.

## 11) Copy, Branding, Messaging
- [ ] Unify plan names, features, pricing, trial terms (membership, paywall, checkout)
  - No contradictions; clear value proposition.
- [ ] Clarify Free vs Premium feature matrix
  - Sets expectations up front.
- [ ] Update privacy/terms language for current data flows
  - Accurate and trustworthy policies.
- [ ] Align CTAs (“Start Free Trial” vs “Upgrade to Premium”)
  - Same verbs and benefits across pages.

## 12) Pricing Review
- [ ] Benchmark current price vs features and market comps
  - Validate fitness of the price point.
- [ ] Decide tier structure: Free / Pro ($29–$49) / Team ($99–$199)
  - Match offerings to segments; upsell path.
- [ ] Decide annual discount and trial length (or Freemium gates)
  - Improves conversion while managing risk.
- [ ] Update copy and plan config after decision
  - Keep all surfaces in sync.

## 13) Observability
- [ ] Integrate Sentry (frontend+backend) with release tags
  - Catch errors quickly in production.
- [ ] Structured logs with request IDs; reduce PII
  - Troubleshoot without leaking data.
- [ ] Basic usage metrics; consider Prometheus later
  - Visibility into adoption and load.
- [ ] Configure Railway/Vercel alerts on errors/resources
  - Early warnings and faster remediation.

## 14) Performance
- [ ] Frontend bundle analysis; lazy‑load heavy charts/guides
  - Faster initial loads.
- [ ] Backend guardrails for memory/time; optimize hot paths
  - Stability under real workloads.

## 15) Testing & QA
- [ ] Unit tests for utils and normalization layers
  - Prevent regressions in data contracts.
- [ ] Integration tests for API shapes (validate/preprocess/train/analyze)
  - Confidence in backend–frontend contracts.
- [ ] E2E tests (Cypress/Playwright) for core tool flows, guide open, project create, profile fetch
  - User‑level confidence for main funnels.
- [ ] Cross‑browser/device tests (Chrome/Safari/Firefox/Edge; iOS/Android)
  - Coverage across common environments.
- [ ] Load/security tests (concurrency, CSV formula injection, rate‑limit abuse)
  - Hardening before scale.

## 16) SEO & Legal
- [ ] Meta tags and OG/Twitter cards for marketing pages
  - Sharable and descriptive previews.
- [ ] robots.txt & sitemap (block app routes)
  - Guide crawlers appropriately.
- [ ] Update Privacy & Cookie policies to current behavior
  - Compliance and transparency.
- [ ] Provide data export/deletion channel (and optional self‑serve delete)
  - User rights and trust.

## 17) Deployment
- [ ] Backend (Railway): set envs, restrict CORS, verify health, run smoke tests
  - Foundational checks before traffic.
- [ ] Stripe: test webhook end‑to‑end from Dashboard
  - Payment reliability check.
- [ ] Frontend (Vercel): envs, SPA fallback, custom domain, compression, disable prod source maps
  - Production‑grade hosting config.
- [ ] Promote from preview after live smoke tests
  - Reduce risk before full release.

## 18) Post‑Deployment
- [ ] Run live E2E smokes on prod domains (all tools, paywall, checkout)
  - Ensures nothing broke on live infra.
- [ ] Monitor Sentry/logs/alerts for 48 hours and fix criticals
  - Stabilization window.
- [ ] Update docs (README, deployment runbook, flags)
  - Keep ops knowledge current.
- [ ] Schedule pricing/plan review after first cohort feedback
  - Iterate on value/price alignment.

## 19) Follow‑Ups (Phase 2)
- [ ] Learning Plan: POST `/api/profile/learning-plan` + UI with progress
  - Personalized next steps from profile gaps.

## 20) Member Dashboard — Interactive Tools Fixes (UPDATED 2025-01-15)

Purpose: Consolidate current production issues from the Interactive Tools (Regression, Classification, Clustering, NLP) with actionable fixes and acceptance criteria.

- [x] Regression: Results 404/401 and visualization data-shape
  - Symptoms: `GET /api/regression/results/:session_id` returns 404; console shows "Univariate/Bivariate data structure: Object" and results loading error in `ResultsVisualization`.
  - Suspected cause: Results not persisted under session_id or frontend points to wrong endpoint; frontend expects arrays but API returns nested objects for univariate/bivariate.
  - Fix:
    - Backend: Added retry logic with delays to handle async save race conditions in `/api/regression/results/{session_id}` endpoint
    - Backend: Fixed feature_columns not being set in workflow - added auto-detection fallback and restore from preprocess session data
    - Frontend: Added guard clause in PredictionInterface to handle undefined featureColumns
  - Acceptance: No 404s; results load without errors; charts render; no "data structure: Object" warnings.

- [x] Regression: Background training returns "Training still in progress" indefinitely
  - Symptoms: When >3 models requested, training goes to background but results endpoint always returns HTTP 202 "Training still in progress"
  - Suspected cause: Background task was only simulating work with sleep instead of actually training models
  - Fix:
    - Backend: Replaced simulated training with actual model training in `train_models_background` function
    - Backend: Background task now properly calls workflow.train_models() with preprocessed data and feature_columns
    - Backend: Correctly updates session status to 'training_complete' when finished
  - Acceptance: Background training completes and results are available after processing

- [x] Regression/Classification: Train endpoint fails with serialization error (RECURRING ISSUE)
  - Symptoms: POST to /api/regression/train returns 500 with "dictionary update sequence element #0 has length 6; 2 is required"
  - Root cause: Train endpoint returning non-serializable model objects in response from workflows
  - Fixes applied (multiple iterations due to persistence of issue):
    - Backend: Separated model storage from serializable results in RegressionWorkflow and ClassificationWorkflow
    - Backend: Store models in self.models, self.best_model, keep only metrics in self.results
    - Backend: Updated make_prediction and visualization methods to use new attributes
    - Backend: Added aggressive cleanup in main.py train endpoint to strip non-serializable objects
    - Backend: Added field-by-field serialization testing with fallback to minimal response
    - Backend: Enhanced logging to identify problematic fields
  - Acceptance: Train endpoint returns proper JSON response without serialization errors
  - NOTE: This issue keeps recurring - need to ensure Railway deployment has latest code

- [x] CORS: Train endpoints missing CORS headers in production
  - Symptoms: "No 'Access-Control-Allow-Origin' header is present" for regression/classification train endpoints
  - Root cause: CORS error was secondary to 500 error from serialization issue
  - Fix:
    - Backend: Fixed underlying serialization errors which were causing 500 responses
    - Backend: CORS middleware already properly configured for all endpoints
    - Backend: Added fallback responses to ensure endpoint always returns valid response
  - Acceptance: All endpoints return proper CORS headers even on error conditions

- [x] Regression: Duplicate session creation
  - Symptoms: Multiple “✅ regression session created: …” logs for a single run.
  - Suspected cause: Effect or handler firing multiple times (React StrictMode/multiple submits).
  - Fix: Debounce/lock during session creation; ensure one POST per user action.
  - Acceptance: Exactly one session created per action; logs show single session id.

- [x] Classification: Train returns 500 Internal Server Error (serialization issue)
  - Symptoms: `POST /api/classification/train?session_id=…` -> 500; FastAPI serialization error "dictionary update sequence element #0 has length 7; 2 is required"
  - Suspected cause: Trained model objects stored in results dictionary cannot be serialized to JSON
  - Fix:
    - Backend: Separated model storage from serializable results in `enhanced_classification_framework.py`. Models stored in `self.models`, only metrics returned in API response
    - Backend: Updated visualization methods to use instance attributes instead of results dict for models
    - Backend: Fixed make_prediction method to use self.best_model instead of self.results['best_model']
  - Acceptance: Train succeeds and returns proper JSON response with metrics; visualizations still work correctly

- [x] Clustering: UI TypeError `toFixed` on undefined
  - Symptoms: Error at `ResultsVisualization` optimization tab: Cannot read `toFixed` of undefined; ErrorBoundary triggered.
  - Suspected cause: Optimization metrics missing from API response or not mapped yet.
  - Fix: Frontend guards (optional chaining/defaults) and display placeholders; align response contract to always include numeric metrics.
  - Acceptance: Clustering results render without exceptions even when metrics are missing; optimization tab shows values or clear placeholders.

- [ ] Clustering: Tab config `.component` undefined
  - Symptoms: `ClusteringExplorePage.jsx` reads `tab.component` but gets undefined; ErrorBoundary logs.
  - Suspected cause: Tab registry item missing `component` or mismatch in key names.
  - Fix: Ensure all tabs define a valid React component; add guards in renderer.
  - Acceptance: Tabs switch without errors; all expected tab content renders.

- [x] Clustering: Hierarchical algorithm `random_state` warning
  - Symptoms: Backend warning: `AgglomerativeClustering.__init__() got an unexpected keyword argument 'random_state'`.
  - Suspected cause: Passing unsupported param to scikit-learn AgglomerativeClustering.
  - Fix: Remove `random_state` from AgglomerativeClustering; rely on determinism from inputs or document non-determinism.
  - Acceptance: No warnings in logs; hierarchical clustering runs successfully when selected.

- [x] NLP: Validate requires `text_column` selection
  - Symptoms: 400 Bad Request; `NLPWorkflow.validate_data() missing 1 required positional argument: 'text_column'`.
  - Current state: Frontend passes 'text' as default but this doesn't work if column has different name
  - Fix: 
    - Backend: Added auto-detection logic for text column in validate endpoint
    - Backend: Looks for common text column names (text, content, body, message, etc.)
    - Backend: Returns available text_columns and selected_text_column in response
    - Backend: Stores detected text_column in session for downstream use
  - Acceptance: NLP automatically detects text column; returns available columns for user selection if needed.

- [ ] Dashboard store: noisy duplicate “data loaded” logs
  - Symptoms: Repeated `dashboardStore.js:132 Dashboard data loaded: Object` messages.
  - Suspected cause: Multiple subscriptions/effects; StrictMode double-invoke.
  - Fix: Add idempotent guards and conditional logging; dedupe fetch on mount.
  - Acceptance: Single load per mount; concise logs.

- [x] ResultsVisualization: Robust to object vs array inputs
  - Symptoms: Logs show univariate/bivariate data reported as `Object` and subsequent render issues.
  - Suspected cause: Mismatch between API contract and front-end expectations.
  - Fix: Introduce an adapter layer to coerce API results into consistent arrays for charts; add runtime checks and fallbacks.
  - Acceptance: All chart tabs render without errors across regression/classification/EDA.

- [x] Error handling: Surface backend messages to UI
  - Symptoms: Generic "Failed to get results" / "train processing failed" with no detail.
  - Suspected cause: Errors swallowed/normalized without messages.
  - Fix: Pass through `message/details` from backend to toasts; log error codes; add guidance links.
  - Acceptance: Users see clear error reasons and suggested fixes; dev console shows actionable details.

- [x] Regression: Results showing mock/placeholder data instead of actual results
  - Symptoms: Training completes successfully but results show fake data like "age", "income" features
  - Cause: Frontend was passing stepData.train?.results instead of stepData.train to ResultsVisualization
  - Fix: Updated LinearRegressionPage.jsx to pass correct data structure
  - Acceptance: Results show actual training data and metrics from the uploaded dataset

- [x] Classification: Missing navigation buttons after removing global Next/Previous
  - Symptoms: Classification tool steps have no way to navigate after global buttons were removed
  - Cause: StepContainer components weren't receiving onPrevious prop
  - Fix: Added onPrevious prop to all classification step components
  - Acceptance: All classification steps have working Previous/Next navigation

- [x] NLP: Add text column selection UI
  - Symptoms: NLP tool fails when text data isn't in a column named "text"
  - Cause: Tool was hardcoded to look for "text" column
  - Fix: 
    - Created TextColumnSelectionStep component
    - Added column selection step to NLP flow
    - Backend auto-detects common text column names
  - Acceptance: Users can select which column contains text data

- [x] UI Flow: Removed confusing generic Next/Previous buttons
  - Symptoms: Users confused by duplicate navigation buttons
  - Fix: Removed generic buttons from UnifiedInteractiveTool, kept step-specific action buttons
  - Acceptance: Each step has clear, context-specific action buttons

## 20.5) Production Deployment Issues

- [ ] Railway deployment lag
  - Symptoms: Fixes pushed to GitHub but production still shows old errors
  - Issue: Railway may not be automatically redeploying or using cached Docker layers
  - Action needed:
    - Manual trigger Railway redeploy after pushes
    - Verify Railway webhook is configured for auto-deploy
    - Check Railway build logs to ensure latest commit is being deployed
    - Consider adding deployment version endpoint for verification

- [ ] Persistent serialization errors
  - Symptoms: Same serialization errors keep appearing despite multiple fixes
  - Root causes identified:
    - Model objects being included in API responses
    - DataFrames not properly converted to dicts
    - Workflow methods returning different structures than expected
  - Comprehensive fixes applied:
    - Separated model storage from results in all workflows
    - Added aggressive cleanup in API endpoints
    - Field-by-field serialization testing
    - Fallback to minimal response on serialization failure
  - Next steps:
    - Add unit tests for serialization of all workflow outputs
    - Consider using Pydantic models for response validation
    - Add endpoint to check deployment version

## 20.6) UI/UX Redesign for Interactive Tools (COMPLETED)

- [x] Redesign tool layout with sidebar navigation
  - Current: Steps shown horizontally at top, requires scrolling up/down
  - Implemented: 
    - Left sidebar with vertical step list showing progress/completion status
    - Main content area for current step with clean layout
    - Tabbed results/visualizations integrated into sidebar
    - Visual indicators for completed steps (green checkmarks)
    - Active step highlighting with chestnut color
    - Session ID display in sidebar header
    - Reset tool and dashboard navigation in sidebar footer
  - Benefits: Better use of screen space, clearer navigation, persistent step visibility
  - Implementation: 
    - Created UnifiedInteractiveToolSidebar component
    - Created LinearRegressionPageSidebar, ClassificationExplorePageSidebar, NLPExplorePageSidebar
    - Added new routes with -v2 suffix for testing before full migration
    - Maintained backward compatibility with existing tool pages

## 20.7) UI Migration Complete with Build Fixes (DONE 2025-01-15)

- [x] Created sidebar UI versions for all tools
  - LinearRegressionPageSidebar 
  - EDAExplorePageSidebar
  - ClassificationExplorePageSidebar
  - ClusteringExplorePageSidebar
  - NLPExplorePageSidebar
  
- [x] Migrated all tool routes to new UI
  - All /tools/* routes now use sidebar versions
  - Removed old page components from imports
  - Removed temporary -v2 test routes
  - All tools now have consistent modern UI
  
- [x] Key improvements delivered:
  - Left sidebar with step navigation and completion tracking
  - Clean main content area for focused work
  - Integrated result tabs in sidebar workflow
  - Visual indicators (checkmarks, active highlighting)
  - Session info and reset controls readily accessible
  - No more scrolling up/down for navigation

- [x] Fixed all build errors
  - Created missing shared component: ValidationResultsStep
  - Created missing EDA components: EDAConfigurationStep, EDAAnalysisStep
  - Created missing Clustering components: ClusteringConfigurationStep, ClusteringAnalysisStep
  - Created missing Regression components: DataPreprocessingStep, ModelTrainingStep
  - Build now compiles successfully with only ESLint warnings (no errors)

- [ ] Future UI enhancements (nice-to-have):
  - Add animations for step transitions
  - Implement keyboard shortcuts for navigation
  - Add tooltips for step descriptions
  - Consider dark mode support
  - Mobile responsive sidebar (collapsible on small screens)

## 21) Post‑Launch Enhancements

Purpose: Nice‑to‑have refinements to ship after launch for stronger UX/robustness.

- [ ] Classification UX guardrails
  - Toggle to disable stratify on small/imbalanced classes; dynamic test_size guidance; clearer pre‑train warnings; model‑specific error messages.
- [ ] Export polish and options
  - Bundle multi‑CSV exports (e.g., comparison + feature_importance) into a zip; expose export format/options in UI; consider including prediction artifacts.
- [ ] EDA adapters and fallbacks
  - Broaden adapters to handle alternate shapes (array/map) and add fallback visuals; dev‑only diagnostics toggle.
- [ ] Observability & UX
  - Add Sentry for tool flows with release tags; propagate request IDs in frontend+backend logs; standardize toast messages and empty states.
- [ ] Performance/UX
  - Debounce remaining actions; background task status indicators; richer skeletons for tool steps and dashboard.
- [ ] Documentation
  - Update deployment runbook (flags, endpoints, exports), and publish API schemas for validate/preprocess/train/analyze/results/export.

- [ ] Agentic Context/Tasks: `/api/assessments/profile/context` and optional `/tasks`
  - Foundation for agent workflows.
- [ ] Classification visuals (Plotly) wired into Results
  - Visual parity across tools.
- [ ] Clustering exports + richer visualization options
  - More useful outcomes for users.
- [ ] Surface central org profile prominently in dashboard
  - Reinforce single source of truth.

---

## Related Docs & Integration Plan
- Roadmap: `docs/ASSESSMENTS_PROFILE_ROADMAP.md` (KEEP)
  - High‑level vision and phases; complements this execution‑focused TODO.
- API Spec: `docs/API_SPEC_PROFILE.md` (KEEP)
  - Contracts for endpoints; keep in sync when adding preprocess/train/analyze and exports.
- Schemas: `docs/SCHEMAS/*.md` (KEEP)
  - Update if response shapes evolve (e.g., visuals, exports).
- Guide Registry: `docs/GUIDE_REGISTRY.md` (KEEP)
  - Source of truth for registry→section mappings; used by GuideViewer.
- Profile Integration TODO: `docs/TODO_PROFILE_INTEGRATION.md` (MERGE INTO THIS)
  - Fold remaining items into this master; keep file as a pointer or mark as deprecated.
- Feedback Log: `FEEDBACK_TRACKING.md` (KEEP)
  - Continue logging issues/decisions with links to TODO items for traceability.

> Recommendation: Use this file as the master execution checklist. Keep roadmap/spec/schemas/registry separate as references. Merge the older profile TODO into this doc to avoid split task tracking.
## Top Priority: Consolidate Implementation Guides
- [x] Replace multiple overlapping guides with a single Master AI Project Implementation Guide
  - Rationale: remove redundancy, present a coherent end‑to‑end plan (Strategy → Readiness → Use Cases/ROI → Implementation/MLOps → Governance).
- [x] Update all routes and registry mappings to point to the master guide
  - Avoid duplication and stale links; redirect legacy guide paths.
- [x] Remove deprecated guide components/files and ensure no imports remain
  - Prevent dead code and confusion.


## 23) Tool Enhancements (Ship now)

- [x] Interactive Guide: phase dependencies + checklists
  - Gate phases until prior is complete; add per‑phase checklists; persist progress.
- [x] ROI Calculator: scenarios + sensitivity + PDF print
  - Named scenarios saved per project, simple sensitivity table, and print/save PDF via browser.

## 24) Post‑Launch Enhancements (moved/expanded)

- [ ] Classification UX guardrails
  - Toggle to disable stratify on small/imbalanced classes; dynamic test_size guidance; model‑specific error messages.
- [ ] Export polish and options
  - Bundle multi‑CSV exports into a zip; expose export format/options in UI; include prediction artifacts.
- [ ] EDA adapters and fallbacks
  - Broaden adapters to handle alternate shapes and add fallback visuals; dev‑only diagnostics toggle.
- [ ] Observability & UX
  - Integrate Sentry (frontend+backend) with release tags; add request IDs; standardize toasts/empty states.
- [ ] Performance/UX
  - Debounce remaining actions; background task status indicators; richer skeletons for tool steps and dashboard.
- [ ] Documentation
  - Update deployment runbook (flags, endpoints, exports), and publish API schemas for validate/preprocess/train/analyze/results/export.
