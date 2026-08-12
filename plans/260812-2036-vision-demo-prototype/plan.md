---
title: "My iKame Vision Demo Prototype — BLĐ Executive Demo"
description: "Extend the R0 prototype with a scripted Ask iKame AI layer (A1-A4), Knowledge/Goals concept demos, Manager vision moments, a /vision screen, and demo hardening for a 25-minute live executive tour."
status: implementation-complete-pending-rehearsal
priority: P1
effort: 9d
branch: master
tags: [frontend, prototype, ai-concept, demo, mock-data]
created: 2026-08-12
---

# My iKame Vision Demo Prototype — BLĐ Executive Demo

## Overview

Extend the working R0 prototype (`prototype-app/`, React 18 + TS + Vite, mock data, deployed) into a vision demo for the executive board: a 7-stop module tour where every stop plays two beats — *[hàng thật R1]* then *[cùng module khi có AI — concept có badge A1-A4]*. Requirements source of truth: [brainstorm-260812-2036-vision-demo-prototype.md](../reports/brainstorm-260812-2036-vision-demo-prototype.md). Market stats for `/vision`: [researcher-260812-2036-ai-ex-platform-trends.md](../reports/researcher-260812-2036-ai-ex-platform-trends.md).

**Hard constraints:** scripted AI only (suggested-prompt chips, NO free text, NO real LLM — consistent with spec D9); every concept surface labeled (R-badge/A-badge); golden path must run flawlessly live; 1-2 week timeline.

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Foundation: types, AppState mutators, fixtures, shell wiring, stubs | Complete | 1d | [phase-01](./phase-01-foundation-types-state-stubs.md) |
| 2 | Ask iKame scripted engine (panel, script store, A1-A4 flows) | Complete | 2.5d | [phase-02](./phase-02-ask-ikame-scripted-engine.md) |
| 3 | Knowledge & Goals concept demos (R2/R3) | Complete | 1d | [phase-03](./phase-03-knowledge-goals-concept-demos.md) |
| 4 | Manager vision moments (AI-brief, resolve flow) | Complete | 1d | [phase-04](./phase-04-manager-vision-moments.md) |
| 5 | `/vision` screen (North Star, ladder, roadmap, stats) | Complete — copy review pending | 1.5d (incl. owner copy-review checkpoint) | [phase-05](./phase-05-vision-screen.md) |
| 6 | Demo hardening: badges sweep, reset, script verify, rehearsal | Complete — rehearsal + push pending | 2d (0.5d rehearsal ring-fenced) | [phase-06](./phase-06-demo-hardening-presenter-script.md) |

## Execution strategy (parallel mode)

```
Phase 1 (sequential prerequisite)
   ├─→ Phase 2 ─┐
   ├─→ Phase 3 ─┤
   ├─→ Phase 4 ─┼─→ Phase 6 (sequential last)
   └─→ Phase 5 ─┘
```

- **Phase 1 freezes the shared surface**: `types/index.ts`, `AppState.tsx`, `data/mockData.ts`, `App.tsx`, `AppShell.tsx`, `main.tsx`, `components/ContentCards.tsx` (additive optional props only), `components/RBadge.tsx`, `styles/app.css`, plus **empty stubs** for every file a parallel phase will fill (`components/assistant/AskIKamePanel.tsx`, `pages/VisionPage.tsx`, and per-phase CSS files imported from `main.tsx`). After Phase 1 lands + commits, these files are frozen for phases 2-5.
- **Phases 2-5 own disjoint files** (see per-phase Related Code Files). A phase needing a shared-file change reports it as a blocker — no self-service edits.
- **Phase 6 is sequential** — cross-cutting sweep, docs, rehearsal.

## File ownership matrix

| Phase | Owns (create/modify) |
|---|---|
| 1 | `src/types/index.ts`, `src/AppState.tsx`, `src/data/mockData.ts`, `src/App.tsx`, `src/components/AppShell.tsx`, `src/main.tsx`, `src/components/ContentCards.tsx`, `src/components/RBadge.tsx` (new), `src/components/AiBadge.tsx` (new — RED TEAM: shared by phases 2/4/5, must be frozen contract), `src/styles/app.css`, `docs/demo-presenter-script-bld.md` (skeleton v1 — RED TEAM: brainstorm mandated script-in-parallel, not last), stubs: `src/components/assistant/AskIKamePanel.tsx`, `src/pages/VisionPage.tsx`, `src/styles/{assistant,vision,knowledge-goals,manager-vision}.css` |
| 2 | `src/components/assistant/**` (fill stub + subcomponents), `src/data/ai-scripts.ts` (new), `src/styles/assistant.css` |
| 3 | `src/pages/KnowledgePages.tsx`, `src/pages/GoalPages.tsx`, `src/styles/knowledge-goals.css` |
| 4 | `src/pages/ManagerPage.tsx`, `src/styles/manager-vision.css` |
| 5 | `src/pages/VisionPage.tsx` (fill), `src/styles/vision.css` |
| 6 | `docs/demo-presenter-script-bld.md` (verify/time/expand the Phase-1 skeleton), `prototype-app/scripts/visual-check.mjs` (static screenshots only), `src/pages/ProfilePage.tsx` (reset button), targeted badge/a11y fixes anywhere (sequential, safe) |

## Dependencies

- No new npm packages. Existing stack only (`@phosphor-icons/react` for icons, hand-rolled Core DS 1.1 components).
- Git: commit after Phase 1 before dispatching 2-5; commit per phase; push to `dungnvikame/my-ikame-v2` (Vercel auto-deploys — root `vercel.json` already configured).

## Key risks (full list per phase)

- **Demo-day dependency on Vercel** → presenter script includes local-run fallback; rehearse both.
- **Scripted AI asked off-script** → no free-text input by design; disabled input labeled "Nhập tự do mở ở R4".
- **State-change money moments** (A4 RSVP, resolve) **must visibly propagate** → they reuse the same AppState mutator patterns already proven in R0.
- **ManagerPage stale window**: Phase 1 moves `attentionItems` into AppState but does NOT touch ManagerPage (Phase 4 owns it); the old direct import still compiles until Phase 4 lands.

## Build-scope fallback (insurance — activate only if schedule compresses)

Demo date confirmed ~2 weeks out → full scope proceeds. If the date suddenly moves earlier, cut in THIS order: (1) Goals board → status-list-only, (2) new visual-check screenshots, (3) AI scenarios 5→3 (keep S2, S2b-deny, S3). **Never cut:** `/vision` copy-review checkpoint, 2 rehearsals.

## Execution log — 2026-08-12

All 6 phases implemented and committed on master:
- **e9670c1** phase 1 foundation (types, AppState, fixtures, shell, stubs)
- **04da39f** phase 2 Ask iKame engine (panel, 5 AI scenarios, receipts)
- **8a97acb** phase 3 Knowledge/Goals (search + board demos, badges)
- **37e6dbf** phase 4 Manager moments (AI-brief, resolve flow, live counts)
- **cc6ce37** phase 5 /vision (North Star, ladder, roadmap, market stats)
- **13c275d** phase 6 hardening (reset button, script, visual-check, full build)
- **da345d9** code-review fixes (3 items: S3 draft gated on applicability, blocked-close feedback note, Tuấn/Ngọc Anh roster consistency)

Gates green: typecheck, build, visual:check (7 PNGs). Tester: all pass. Code review: 0 critical; 1 high + 2 medium FIXED in da345d9; 4 low accepted as-is for demo prototype.

## Open questions (carried from brainstorm)

1. ~~Exact demo date~~ → **resolved: ~2 tuần trở lên** (2026-08-12). Full scope + 2 rehearsals fit.
2. Deep-technical BLĐ member? → optional architecture appendix (D7 BFF/adapters) in presenter script.
3. Partnership vs internal-build stance → one prepared answer in presenter script (MIT 2x stat).
4. Meeting-room display resolution → mitigated by Phase 6's 1024px/125%-zoom QA band; confirm exact setup before rehearsal.

## Red Team Review

### Session — 2026-08-12
**Findings:** 24 raised across 3 lenses (Assumption Destroyer, Failure Mode Analyst w/ live-demo focus, Scope & Complexity Critic) → deduplicated to 16 groups. **All 16 accepted** (user reviewed each individually). Two decisions user-arbitrated: A3 = two-step human-in-the-loop (AI sends + receipt; item stays in queue for manual resolve — receipt copy says so); demo date confirmed ~2 weeks (full scope).

| # | Finding | Severity | Applied to |
|---|---|---|---|
| F1 | AiBadge shared by 3 parallel phases but Phase-2-owned → closing "thu hoạch" beat dies on visual drift | Critical | plan.md, P1, P2, P4, P5 |
| F2 | Static scripts narrate mutable state → AI visibly lies on chip re-run | Critical | P2 (state-reading paragraphs) |
| F3 | S4 + real-RSVP beat compete for same event → idempotent fizzle | Critical | P1 (reservation note), P6 (script rule) |
| F4 | Esc/backdrop close wipes conversation + in-flight A3 draft; trap selector misses textarea; resetDemo can't reach panel state | Critical | P1 (demoResetCount), P2 (persist/guard/selector) |
| F5 | Check-in KPI can't recompute from static teamMembers → on-screen contradiction after resolve-all | High | P4 (rescope to queue-derived) |
| F6 | AI-brief zero-state unspecified at the planned resolve-all closing beat | High | P4 (zero-state line) |
| F7 | Route matcher semantics undefined; S4 chip leaks onto cancelled-event pages | Medium | P2 (matchPath + pinned routes) |
| F8 | Presenter script deferred to Phase 6 violates brainstorm's "song song, không để cuối" | High | P1 (skeleton deliverable), P6 (verify/time) |
| F9 | Phase 6 = 1.5d landfill; rehearsal would be the casualty | High | P6 → 2d, rehearsal ring-fenced |
| F10 | Panel Playwright automation = flaky gold-plating | Medium | P6 (static screenshots only) |
| F11 | Dead UI: no-op feedback buttons + unvisited goal detail page | Medium | P2 (fold into disclosure), P3 (minimal card) |
| F12 | /vision underbudgeted; exec-grade VN copy needs owner review cycle | High | P5 → 1.5d + copy checkpoint |
| F13 | Theme/perspective not persisted → refresh mid-demo = light-mode flashbang; nuclear reset destroys prior-stop evidence | Medium | P1 (localStorage), P6 (reset-between-runs rule) |
| F14 | Projector band (~1024px/125% zoom) untested; rehearse-then-push = performing an unrehearsed build | Medium | P6 (QA band + push→verify→rehearse→freeze) |
| F15 | Zero-slack schedule with no pre-agreed cut order | Medium | plan.md (fallback section above) |
| F16 | Housekeeping: AttentionCard consumer is ManagerPage not HomePage; unused RBadge `shipped` variant; needless md parser | Medium | P1, P2 |
