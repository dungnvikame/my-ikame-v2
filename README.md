# My iKame Prototype Workspace

This folder stores the shared React design-engineering prototype for My iKame.

## Run

```bash
cd design-output/my-ikame/prototype-app
npm install
npm run dev
```

## Scope

**Routes implemented:**
- `/home` — iKamer Home (priority + active items)
- `/manager/overview`, `/manager/team` — Manager attention queue (AI-brief, resolve flow, KPIs) and My Team
- `/news`, `/news/:postId` — Newsfeed with mandatory acknowledgement
- `/events`, `/events/:eventId` — Events with RSVP state machine and .ics export
- `/search` — Global search
- `/notifications` — Notification center
- `/profile` — User profile (with demo reset button)
- `/knowledge`, `/knowledge/:documentId` — Knowledge concept demo (permission-aware search + reader with iWiki sources)
- `/goals`, `/goals/:goalId` — Goals concept demo (4-status board with quick check-in)
- `/vision` — North Star WUAR, A0–A4 maturity ladder, R1–R5 roadmap with market context
- `/forbidden` — Permission error state

**Ask iKame Panel:** Sparkle-triggered scripted AI with 6 scenarios (A1–A4 + fallback), state-reading answers with citations, action flows (A3 draft-confirm-receipt, A4 execute-with-receipt). Suggested prompts only; free-text mode deferred to R4.

**Design system:** Hand-rolled Core DS 1.1 (light/dark responsive CSS). UI kit migration (`@frontend-team/ui-kit`) deferred due to network access constraints; see `design-system-application.md` for details.

**Data:** Mock-only; no backend integration or persistence.

**Setup:** No `.npmrc` or registry configuration needed (npm packages only).

