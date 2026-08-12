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
- `/manager/overview`, `/manager/team` — Manager attention queue and My Team
- `/news`, `/news/:postId` — Newsfeed with mandatory acknowledgement
- `/events`, `/events/:eventId` — Events with RSVP state machine and .ics export
- `/search` — Global search
- `/notifications` — Notification center
- `/profile` — User profile
- `/knowledge`, `/knowledge/:documentId` — Knowledge shell (R2 placeholder)
- `/goals`, `/goals/:goalId` — Goals shell (R3 placeholder)
- `/forbidden` — Permission error state

**Design system:** Hand-rolled Core DS 1.1 (light/dark responsive CSS). UI kit migration (`@frontend-team/ui-kit`) deferred due to network access constraints; see `design-system-application.md` for details.

**Data:** Mock-only; no backend integration or persistence.

**Setup:** No `.npmrc` or registry configuration needed (npm packages only).

