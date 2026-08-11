---
title: "My iKame Full R0 Prototype — UI Kit Migration & Feature Completion"
description: "Rebuild the My iKame R0 prototype on the company @frontend-team/ui-kit design system and expand it to cover every R0-scoped screen from the product spec, mock data only, no backend."
status: pending
priority: P1
effort: 29h
tags: [frontend, design-system, prototype, mock-data]
created: 2026-08-11
---

# My iKame Full R0 Prototype — UI Kit Migration & Feature Completion

## Overview

Current `prototype-app/` covers a partial R0 slice (Home, Manager Overview preview, News, Events, notification drawer) on hand-rolled Core DS 1.1 CSS. This plan:

1. Swaps the hand-rolled CSS for the real company component library `@frontend-team/ui-kit` (confirmed to literally implement Core DS 1.1 — same token names: `bg_sidebar_primary`, `radius_6`, `body_s`, etc.).
2. Expands the app to every R0-scoped screen in `My-iKame-Product-Spec-v0.2.md`: iKamer Home, Manager Overview, My Team, News (list+detail), Events (list+detail), Notification Center (page, not just drawer), Global Search, Knowledge shell, Goals shell, Profile, Forbidden.
3. Keeps it a pure mock-data prototype — no backend, no MSW, no Redux. Existing lightweight React Context (`AppState.tsx`) pattern is extended, not replaced (YAGNI — there is no API to mock against).

**Not in scope:** My iKame Studio (Operations backstage), AI Assistant (R4/R5), real iWiki/iGoal integration, auth/SSO, any server code.

## ⚠️ Blocking dependency — read first

`@frontend-team/ui-kit` is hosted on a **private GitLab npm registry** (`gitlab.ikameglobal.com`). Installing it requires a `GITLAB_NPM_TOKEN` in `.npmrc`/env that this agent does not have. **Phase 1 cannot complete `npm install` without the user supplying this token.** See open questions at the end.

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Foundation: UI kit migration, app shell, shared data/ranking contracts | Pending | 6h | [phase-01](./phase-01-foundation-and-ui-kit-migration.md) |
| 2 | iKamer Home (`/home`) | Pending | 3h | [phase-02](./phase-02-ikamer-home.md) |
| 3 | Newsfeed (`/news`, `/news/:postId`) | Pending | 4h | [phase-03](./phase-03-newsfeed.md) |
| 4 | Events (`/events`, `/events/:eventId`) | Pending | 4h | [phase-04](./phase-04-events.md) |
| 5 | Manager experience (`/manager/overview`, `/manager/team`) | Pending | 4h | [phase-05](./phase-05-manager-experience.md) |
| 6 | Search, Notification Center, Profile | Pending | 3h | [phase-06](./phase-06-search-notifications-profile.md) |
| 7 | Knowledge & Goals shells (R2/R3 placeholders) | Pending | 2h | [phase-07](./phase-07-knowledge-goals-shells.md) |
| 8 | Hardening: responsive/a11y pass, cleanup, docs | Pending | 3h | [phase-08](./phase-08-hardening-and-cleanup.md) |

## Execution strategy (parallel mode)

- **Phase 1 is a hard sequential prerequisite** — everything else imports its types, ranking util, shared card components, and route stubs.
- **Phases 2–7 run in parallel** — each owns a disjoint set of page files (see per-phase "Related Code Files"). None of them touch `App.tsx`, `AppState.tsx`, `types/index.ts`, or shared `components/` files — those are Phase 1-owned and frozen after Phase 1 lands.
- **Phase 8 is sequential, after 2–7 all land** — it touches cross-cutting files (docs, visual-check script, every page for the a11y sweep).

## Key research inputs

- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — Input/Select/Badge/Chip/Modal/Drawer/Tabs/Alert/etc. reference.
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — Sidebar/Table/Card/Steps/Toast/Calendar reference + LLM usage rules.
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md) — current prototype-app architecture + product spec digest.

## Dependencies

- `@frontend-team/ui-kit` (npm, private registry) — **blocked on `GITLAB_NPM_TOKEN`**, see above.
- No other new external dependencies. Existing stack (Vite, React 18, TS strict, React Router v7, `@phosphor-icons/react`) stays; `@phosphor-icons/react` is dropped once ui-kit's own icon usage pattern is confirmed in Phase 1 (kit examples use `lucide-react` icons — likely a peer dependency).
