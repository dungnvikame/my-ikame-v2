---
title: "Demo v2 — Cộng đồng + AI mọi module + nâng cấp Events/Tri thức/Mục tiêu/Hồ sơ"
description: "Add an internal social module (/community), extend the scripted AI script store to every module, rebuild Events/Knowledge/Goals/Profile UX, and ship a ⌘K search palette with seeded AI answers."
status: pending
priority: P1
effort: 6d
branch: master
tags: [frontend, prototype, social-feed, ai-concept, demo, mock-data]
created: 2026-08-12
---

# Demo v2 — Social module + AI everywhere + module upgrades

## Overview

Build on demo v1 (commits e9670c1..db8cfbf) inside `prototype-app/`. Eight owner requirements: internal social module, AI scenario on every module page, Events timeline+detail upgrade, ⌘K search palette with AI answer, Knowledge as iWiki-style learning hub, Goals as iGoal-style OKR tree + report flow, full personal profile, categorized sidebar. Requirements source of truth: [brainstorm-260812-2305](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md) (owner decisions D1-D4 FINAL).

**Hard constraints:** no new npm deps · mock-only, no network · Vietnamese UI · Core DS 1.1 tokens (hand-rolled) · TS strict · scripted AI only (chips + ~6 seeded search queries, never "đơ" off-seed) · code files ≤200 lines.
**Owner-mandated reduced QA:** gates = `npm run typecheck` + `npm run build` + manual smoke of the golden path. **No tester / code-review cycles.** Owner reviews the running build and lists fixes.

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Foundation: types, fixtures, AppState slices, sidebar categories, ⌘K palette shell | pending | 1d | [phase-01](./phase-01-foundation-shared-surface.md) |
| 2 | Cộng đồng `/community`: feed, composer, reactions, comments, right rail | pending | 2d | [phase-02](./phase-02-community-feed.md) |
| 3 | Events upgrade: hero countdown, 6-month timeline, tabs, detail agenda | pending | 1d | [phase-03](./phase-03-events-upgrade.md) |
| 4 | Tri thức learning hub (iWiki-style) | pending | 1d | [phase-04](./phase-04-knowledge-learning-hub.md) |
| 5 | Mục tiêu iGoal-style: OKR tree + check-in report flow | pending | 1.5d | [phase-05](./phase-05-goals-igoal.md) |
| 6 | AI everywhere + seeded search answers + Hồ sơ + R-badge sweep + script v3 | pending | 2d | [phase-06](./phase-06-ai-everywhere-profile-polish.md) |

## Execution strategy (parallel mode — repeats v1's proven shape)

```
Phase 1 (sequential prerequisite — freezes shared surface, commits before dispatch)
   ├─→ Phase 2 (Cộng đồng)   ─┐
   ├─→ Phase 3 (Events)      ─┤
   ├─→ Phase 4 (Tri thức)    ─┼─→ Phase 6 (sequential last: AI + Hồ sơ + sweep + script)
   └─→ Phase 5 (Mục tiêu)    ─┘
```

- **Phase 1 freezes** `types/index.ts`, `AppState.tsx`, `data/mockData.ts`, `App.tsx`, `AppShell.tsx`, `main.tsx`, `styles/app.css`, `components/search/**`, `data/search-answers.ts` — plus empty CSS stubs for every parallel phase, all imported from `main.tsx` up front.
- **Phases 2-5 own disjoint files.** A phase needing a frozen-file change reports a **blocker**, never self-fixes (F1).
- **Phase 6 is sequential** — cross-cutting: AI script store, search answers, Profile, badge sweep, presenter script v3, smoke.

## File ownership matrix

| Phase | Owns (create/modify) |
|---|---|
| 1 | `src/types/index.ts`, `src/AppState.tsx`, `src/data/mockData.ts`, `src/data/search-answers.ts` (new, empty store + lookup), `src/App.tsx`, `src/components/AppShell.tsx`, `src/components/search/SearchPalette.tsx` + `use-search-results.ts` (new, full impl), `src/pages/SearchPage.tsx` (`?q=` init only), `src/main.tsx`, `src/styles/app.css`, `src/styles/search-palette.css`, stubs: `src/pages/CommunityPage.tsx`, `src/styles/{community,events-v2,goals-v2,profile-v2}.css` |
| 2 | `src/pages/CommunityPage.tsx` (fill) + `src/pages/community/**` (new), `src/styles/community.css` |
| 3 | `src/pages/EventPages.tsx` + `src/pages/events/**` (new), `src/styles/events-v2.css` |
| 4 | `src/pages/KnowledgePages.tsx` + `src/pages/knowledge/**` (new), `src/styles/knowledge-goals.css` (append only — must NOT delete existing `.goal-*` rules) |
| 5 | `src/pages/GoalPages.tsx` + `src/pages/goals/**` (new), `src/styles/goals-v2.css` (new — split away from knowledge-goals.css to avoid P4 conflict) |
| 6 | `src/data/ai-scripts.ts`, `src/data/search-answers.ts` (fill answers), `src/components/assistant/**`, `src/pages/ProfilePage.tsx`, `src/styles/profile-v2.css`, `src/pages/SearchPage.tsx` (AI answer block), `docs/demo-presenter-script-bld.md` (v3), RBadge sweep in `src/pages/manager/ManagerAiBrief.tsx` |

## Carry-over rules from v1 (cite by F-number in phases)

- **F1** Shared surface frozen after Phase 1 commit; blockers reported, not self-fixed.
- **F2** AI scripts read **live** state from `ScriptCtx` — never recite stale hardcoded facts.
- **F2b** Every mutating script action carries `isApplicable(ctx)`; no draft offered when state can't honor it.
- **F3** `ai-product-workshop` stays RESERVED for the A4 execute script — do not pre-register it, do not consume it in new fixtures/flows.
- **F4/F13** `resetDemo()` covers **every** new slice; component-local state clears off `demoResetCount`; theme/perspective stay persisted (never reset).
- **F-fixtures** No real employee data; no real photos — visual patterns + emoji covers + initials avatars only.

## Key risks

- **Feed state surface grows fast** → resetDemo checklist = one reset line per `useState(initialX)` in AppState; grep as gate.
- **Live countdown ticks** → screenshots diff every run (accepted); `prefers-reduced-motion` → static "còn N ngày" fallback; past/ongoing events must render "Đang diễn ra"/"Đã diễn ra", never negative time.
- **Reduced QA** → higher chance of small UI bugs than v1; mitigated by owner review round + a written smoke checklist in Phase 6.
- **CSS collisions across parallel phases** → each phase writes only its own file and uses a page-scoped class prefix (`community-*`, `events-v2 *`, `khub-*`, `okr-*`).
- **R-badge removal vs future investor pitch** → `RBadge` component kept, only render sites removed; `/vision` keeps its badges.

## Open questions (carried, non-blocking)

1. Module display name — using "Cộng đồng" (owner may rename; single label constant in AppShell).
2. Real photos: default = patterns/emoji. If owner supplies files → Phase 6 embeds (hero events + feed first).
3. "Hôm nay của tôi" semantics — implemented as a daily work check-in receipt (WFO/Remote), per brainstorm's tentative answer.
