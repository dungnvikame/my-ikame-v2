---
title: "My iKame Full R0 Prototype — UI Kit Migration & Feature Completion"
description: "Rebuild the My iKame R0 prototype on the company @frontend-team/ui-kit design system and expand it to cover every R0-scoped screen from the product spec, mock data only, no backend."
status: pending
priority: P1
effort: 30h
branch: n/a (no git remote configured yet; local repo initialized 2026-08-11 for this plan)
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

`@frontend-team/ui-kit` is hosted on a **private GitLab npm registry** (`gitlab.ikameglobal.com`). Installing it requires a `GITLAB_NPM_TOKEN` in `.npmrc`/env that this agent does not have. **Phase 1 cannot complete `npm install` without the user supplying this token.** See [Open Questions](#open-questions) below — this is Q1, unresolved as of plan creation.

Resolved during red-team review: this repo now has a local git history (`git init` + baseline commit, 2026-08-11) so the file-ownership and rollback checks in Phase 7/8 that reference `git status`/`git diff` are actually executable — an earlier draft assumed this without it being true.

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
| 8 | Hardening: responsive/a11y pass, cleanup, docs | Pending | 4h | [phase-08](./phase-08-hardening-and-cleanup.md) |

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
- No other new external dependencies planned. Existing stack (Vite, React 18, TS strict, React Router v7) stays. Icon library (`@phosphor-icons/react` vs. the kit's likely `lucide-react` peer dependency) is decoupled from the CSS/shell rewrite per the red-team review below — verified in Phase 1's install-time spike, not assumed, and not a blocker if unconfirmed.

## Open Questions

1. **`GITLAB_NPM_TOKEN`** — do you have a project-scoped GitLab deploy token (`read_package_registry` scope) for `gitlab.ikameglobal.com` project 1351, or does one need to be requested from the platform/frontend team? This blocks Phase 1 step 1 entirely; everything else in this plan is unbuildable until it's resolved. Prefer a scoped deploy token over a personal PAT (Phase 1 Security Considerations explains why).
2. This plan implements the full spec-scoped screen set (all R0 nav items, permission/audience guards, RSVP/ranking logic) rather than a minimal demo. You confirmed this is the right altitude during red-team review (2026-08-11) — flagging here as the recorded decision in case scope needs revisiting once Phase 1 lands and real effort becomes visible.
3. Phase 4 Unresolved Question: is deriving `Attended` from `going + past` (no explicit attendance-taking actor in a mock prototype) acceptable, or should mock data carry an explicit `attendance` field to demo `NoShow` too?
4. Phase 6 Unresolved Question: should "Cần làm" keep showing a critical/required notification after it's read but before its underlying business action (ack/RSVP) is done? Current definition drops it on read, which is arguably inconsistent with spec §19.1's "mark read ≠ done" — fixable with an additive `actionState?` field on `NotificationItem` if this matters for the demo.
5. Phase 5 Unresolved Question: render the Manager scope selector as a disabled `Select`, a static `Chip`, or omit it entirely in R0 (single scope in mock data either way)?

## Red Team Review

### Session — 2026-08-11
**Findings:** 22 raised across 4 adversarial lenses (Security Adversary, Failure Mode Analyst, Assumption Destroyer, Scope & Complexity Critic) → deduplicated to 15 distinct issues.
**Severity breakdown:** 5 Critical, 7 High, 3 Medium.
**Disposition:** All 15 accepted and applied directly to the affected phase files (user chose "apply all now" over individual review). One meta-finding (Scope Critic's argument that the whole plan is disproportionate to a one-sentence request) was surfaced as a direct question rather than unilaterally resolved — user chose to keep full spec-scoped depth with the 15 simplifications applied, not trim further.

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | Plan referenced a nonexistent "open questions" section; token blocker had no resolution path | Critical | Accept | plan.md (this section) |
| 2 | Tailwind utility-class availability in consumer code unverified against installed kit — contradicted the plan's own research report | Critical | Accept | Phase 1 (verification spike §0) |
| 3 | `EventItem.myRegistration` had contradictory 'cancelled' semantics between Phase 1 and Phase 4; `joinUrl` referenced without existing on the type; ISO-timestamp fallback would have defeated its own Gherkin test | Critical | Accept | Phase 1 (type), Phase 4 |
| 4 | Phase 1 didn't commit to the event-state fixtures Phase 4 required | Critical | Accept | Phase 1 (mockData §4) |
| 5 | Audience/permission-guard language ("never leak") oversold a client-side render filter as a real security boundary | Critical | Accept (reworded, feature kept) | Phase 1, 2, 3, 4, 5, 6 |
| 6 | Phase 2/3 dependency sections were stale after Phase 1 absorbed the requests they were still flagging as open | High | Accept | Phase 2, Phase 3 |
| 7 | AppShell↔NotificationList integration deferred to Phase 8 with no shared layout contract | High | Accept | Phase 1 (Drawer contract), Phase 6, Phase 8 |
| 8 | `TeamPage.tsx` double-claimed as an owned edit target by Phase 1 and Phase 5 | High | Accept | Phase 1 (removed), Phase 5 (sole owner) |
| 9 | Kit `DataTable` row-click and `Drawer`/`Modal` focus-trap behavior designed against, never verified against the installed package | High | Accept (folded into spike) | Phase 1, Phase 5, Phase 8 |
| 10 | Icon library swap decision bundled into the single highest-blast-radius phase without verification | High | Accept (decoupled) | Phase 1 |
| 11 | Repo wasn't a git repository, but Phase 7 named `git status` as its verification mechanism | High | Accept (git initialized) | This session (git init), noted above |
| 12 | `GITLAB_NPM_TOKEN` handling had no leak-prevention gate or scope guidance | High | Accept | Phase 1 |
| 13 | Several mechanisms over-engineered for single-mock-user demo value: RSVP idempotency lock guarding a manufactured race, 3s dwell-timer read-tracking, RFC-5545-correct `.ics` escaping, ranking logic re-adapted 3 times blind | Medium | Accept (simplified) | Phase 1 (ranking example), Phase 3 (read), Phase 4 (RSVP, ics) |
| 14 | Manager scope-filter commented as "rehearsal for a real permission boundary" for an out-of-scope backend | Medium | Accept (framing removed) | Phase 5 |
| 15 | Phase 8's a11y checklist scope contradicted its own stated R0/R1 boundary, at a budget too small for what it absorbs | Medium | Accept (trimmed checklist + effort 3h→4h) | Phase 8 |
