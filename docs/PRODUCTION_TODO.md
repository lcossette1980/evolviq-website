# Production Readiness Master TODO

Purpose: Single source of truth for getting the app production‑ready on Railway (backend) and Vercel (frontend). Each item includes a brief explanation and serves as a running checklist.

## 1) Environment & Configuration
- [ ] Configure Railway env vars (FIREBASE_SERVICE_ACCOUNT_KEY, ADMIN_EMAILS, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CORS_ALLOWED_ORIGINS, PROFILE_ENABLED, LEARNING_PLAN_ENABLED)
  - Ensures secure auth, Stripe, allowed origins, and feature flags.
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
- [x] Simplified ProjectsTab to show projects and single master guide
  - Cleaner UX with consolidated implementation guide.
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
