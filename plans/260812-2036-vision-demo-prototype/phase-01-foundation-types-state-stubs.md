# Phase 1 — Foundation: Types, AppState Mutators, Fixtures, Shell Wiring, Stubs

## Context Links

- [plan.md](./plan.md) · [brainstorm summary](../reports/brainstorm-260812-2036-vision-demo-prototype.md) (requirements source of truth)
- Spec sections: §23 (AI ladder A0-A4), §21/§22 (Knowledge/Goals target), §15.3 (attention contract)
- Current shared files: `prototype-app/src/types/index.ts`, `AppState.tsx`, `data/mockData.ts`, `App.tsx`, `components/AppShell.tsx`, `components/ContentCards.tsx`, `main.tsx`, `styles/app.css`

## Overview

- **Priority:** P0 — hard sequential prerequisite for phases 2-5. **Effort:** 1d.
- Establish every shared contract the parallel phases consume: new types, AppState mutators, mock fixtures, routes, shell wiring for the assistant trigger + `/vision`, badge component, and empty stub files so all later imports resolve from day one.

## Key Insights

- Repeat the pattern proven in the R0 build: **Phase 1 commits ALL fixtures and mutators the downstream phases enumerated** — no phase discovers a missing fixture mid-parallel-run.
- `attentionItems` is currently imported directly from `mockData.ts` by `ManagerPage.tsx` — it must move INTO AppState so `resolveAttentionItem` can mutate it. Phase 1 adds the state + mutator but does **not** edit `ManagerPage.tsx` (Phase 4 owns it; the old direct import keeps compiling meanwhile).
- CSS import bottleneck: `main.tsx` is Phase-1-owned and frozen after — so Phase 1 creates **empty CSS stubs** for every later phase and imports them all now.
- All demo AI is scripted; nothing here calls a network. `resetDemo()` must restore every piece of mutable state so the presenter can re-run the golden path instantly.

## Requirements

### Functional
- New types compile; existing pages untouched by type changes (all additions optional/additive).
- `AppState` exposes: `attention` (stateful), `resolveAttentionItem(id)`, `knowledgeDocs`, `goals`, `checkInGoal(id)`, `askOpen`/`setAskOpen`, `resetDemo()`.
- `/vision` route resolves (stub); Ask iKame trigger visible in topbar (Sparkle icon) opening the stub panel; subtle "Tầm nhìn" entry in sidebar footer area.
- `npm run typecheck && npm run build` green before phases 2-5 dispatch.

### Non-functional
- TS strict, no `any`. Additive changes only to existing consumer-facing props.

## Architecture

### 1. `types/index.ts` — additive
```ts
export type AiLevel = 'A1' | 'A2' | 'A3' | 'A4';
export type ReleaseTag = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export type KnowledgeDoc = {
  id: string; title: string; summary: string; body: string[];
  source: 'iWiki'; topic: string; updatedAt: string;
  audienceTeamIds?: string[];
};

export type GoalStatus = 'needs_update' | 'on_track' | 'at_risk' | 'done';
export type Goal = {
  id: string; title: string; status: GoalStatus; progress: number; // 0-100
  cycle: string; lastCheckIn: string; nextDue: string; owner: string;
};
```
(AI script/message types live in Phase 2's `data/ai-scripts.ts` — assistant-internal, not shared.)

### 2. `AppState.tsx` — extend
- `const [attention, setAttention] = useState(attentionItems)` — expose `attention`; `resolveAttentionItem(id)` sets `state: 'resolved'` (consumers filter `state === 'open'`).
- `const [goals, setGoals] = useState(initialGoals)`; `checkInGoal(id)` → `lastCheckIn: 'Vừa xong'`, `status: 'on_track'`.
- `knowledgeDocs` exposed read-only (no mutator — YAGNI).
- `askOpen: boolean` + `setAskOpen` (mirrors `notificationOpen` pattern).
- `resetDemo()` → resets news/events/notifications/attention/goals to initial fixtures, closes panels, and increments `demoResetCount`. **(RED TEAM F13) Does NOT reset `theme`/`perspective`** — presenter stays where they are.
- **(RED TEAM F4)** `demoResetCount: number` exposed in context — the Ask panel (Phase 2) keys its conversation-clearing effect off this counter, since its conversation is component-local state `resetDemo()` can't reach directly.
- **(RED TEAM F13)** Persist `theme` + `perspective` to localStorage (init from storage, write on change — ~4 lines each): a mid-demo refresh must not flashbang light-mode onto the projector or dump the presenter back into iKamer perspective.

### 3. `data/mockData.ts` — add fixtures (complete list, downstream phases request nothing)
- `knowledgeDocs: KnowledgeDoc[]` — 5 docs: chính sách bảo mật (topic Chính sách), hướng dẫn onboarding, quy trình đặt phòng họp, template OKR, **1 doc audience-scoped to `TEAM_FINANCE`** (proves permission filter in Knowledge search AND the A2 "Không đủ dữ liệu" beat).
- `initialGoals: Goal[]` — 4 goals covering all 4 statuses, owner = An, realistic cycle labels (Q3-2026), one `needs_update` with nextDue gần kề (demo check-in flips it).
- **(RED TEAM F3) Event reservation comment** on `ai-product-workshop` in this file: "DÀNH RIÊNG cho kịch bản A4 của Ask iKame — beat 'RSVP hàng thật' trong demo dùng `global-webinar-us` (đăng ký) + `design-sprint-full` (waitlist)". Same rule goes into the presenter-script skeleton (§8 below).
- Fixture-naming hygiene: obviously fictional content, no real employee data.

### 4. `App.tsx` + `AppShell.tsx` wiring
- Route: `/vision` → `VisionPage` (stub). No PerspectiveGuard (accessible in both perspectives).
- Topbar: Sparkle `IconButton` "Hỏi iKame" → `setAskOpen(true)`; render `<AskIKamePanel />` next to `<NotificationsDrawer />`.
- Sidebar footer (above account row): borderless link `Tầm nhìn` (Compass icon) → `/vision`.

### 5. Badge components (new, shared — frozen contracts)
```tsx
<RBadge tag="R2" />   // "Concept · R2" pill, dashed/outline style — concept-labeling only
                      // (RED TEAM F16: no `shipped` variant — R1 surfaces carry no badge)
<AiBadge level="A2" /> // A-level pill + label map: A1 Tóm tắt · A2 Xuyên nguồn ·
                       // A3 Soạn thảo · A4 Thực thi. (RED TEAM F1: shared by phases
                       // 2 (panel), 4 (AI-brief), 5 (/vision ladder) — the closing
                       // "thu hoạch" beat requires pixel-identical pills, so this
                       // MUST live here, not in Phase 2's assistant/ dir.)
```
Both in `src/components/` as siblings; styles appended to `app.css` (`.r-badge`, `.ai-badge`, `.ai-badge--a1..a4`).

### 6. `components/ContentCards.tsx` — additive only
- `AttentionCard`: add optional `onAction?: () => void` (wires the existing action Button) and `onResolve?: () => void` (renders extra borderless "Đánh dấu đã xử lý"). No visual change when props absent. **(RED TEAM F16) Sole current consumer is `ManagerPage.tsx`** (NOT HomePage as an earlier draft claimed) — the verification gate is "ManagerPage renders identically post-change", which also validates the stale-window claim.

### 7. Stubs (created here, filled by owners)
- `components/assistant/AskIKamePanel.tsx` — renders `null` unless `askOpen`; minimal placeholder drawer.
- `pages/VisionPage.tsx` — heading placeholder.
- `styles/assistant.css`, `styles/vision.css`, `styles/knowledge-goals.css`, `styles/manager-vision.css` — empty with header comment; all imported in `main.tsx`.

### 8. Presenter-script skeleton v1 (`docs/demo-presenter-script-bld.md`) — (RED TEAM F8)
The brainstorm mandated "viết script song song với build, không để cuối". Phase 1 ships the skeleton: 7-stop table (thời lượng · click path · money moment · D-decision · stat) transcribed from brainstorm §4 with real routes, PLUS the F3 event-reservation rule and the A3 two-step choreography (AI gửi + receipt → item stays in queue → Mai manually resolves — user-arbitrated decision, 2026-08-12). Phases 2-5 build toward this script; Phase 6 verifies, times, and expands it.

## Related Code Files

**Modify:** `src/types/index.ts`, `src/AppState.tsx`, `src/data/mockData.ts`, `src/App.tsx`, `src/components/AppShell.tsx`, `src/components/ContentCards.tsx`, `src/main.tsx`, `src/styles/app.css`
**Create:** `src/components/RBadge.tsx`, `src/components/AiBadge.tsx`, `docs/demo-presenter-script-bld.md` (skeleton v1), `src/components/assistant/AskIKamePanel.tsx` (stub), `src/pages/VisionPage.tsx` (stub), 4 CSS stubs
**Delete:** none. **NOT touched:** `ManagerPage.tsx` (Phase 4), `KnowledgePages.tsx`/`GoalPages.tsx` (Phase 3), `ProfilePage.tsx` (Phase 6).

## Implementation Steps

1. Add types (§1). 2. Add fixtures + event-reservation comment (§3). 3. Extend AppState incl. demoResetCount + localStorage persist (§2). 4. Build `RBadge` + `AiBadge` + app.css styles (§5). 5. Extend `AttentionCard` props, verify ManagerPage renders identically (§6). 6. Create stubs + CSS files + `main.tsx` imports (§7). 7. Wire `App.tsx` route + `AppShell` trigger/panel/sidebar link (§4). 8. Write presenter-script skeleton v1 (§8). 9. `npm run typecheck && npm run build`. 10. Commit + push before dispatching phases 2-5.

## Todo List

- [ ] Types added (AiLevel, ReleaseTag, KnowledgeDoc, Goal)
- [ ] Fixtures: 5 knowledge docs (1 audience-scoped) + 4 goals (all statuses) + event-reservation comment
- [ ] AppState: attention stateful + resolveAttentionItem, goals + checkInGoal, askOpen, resetDemo + demoResetCount, theme/perspective localStorage persist
- [ ] RBadge + AiBadge components + styles (frozen shared contracts)
- [ ] AttentionCard optional onAction/onResolve; ManagerPage renders identically
- [ ] Stubs + CSS files + main.tsx imports
- [ ] /vision route + Ask trigger + sidebar link
- [ ] Presenter-script skeleton v1 (7 stops, click paths, event reservation, A3 two-step)
- [ ] typecheck && build green; committed

## Success Criteria

- Build green; all existing R0 flows unchanged (ack, RSVP, notifications still work).
- Sparkle trigger opens stub panel; `/vision` renders stub; `resetDemo()` callable from console and restores acknowledged/RSVP state.

## Risk Assessment

- **AttentionCard prop change breaks HomePage** → props optional, verify HomePage renders identically.
- **resetDemo misses a state slice** → single source: every `useState(initialX)` gets one reset line; grep `useState(` in AppState as checklist.

## Security Considerations

- Mock-only; no network. Audience-scoped knowledge doc reuses `isEligible` demo-fidelity pattern (not a security boundary — framing note already in `lib/audience.ts`).

## Next Steps

Phases 2-5 dispatch in parallel after commit. Each reads landed contracts from real files, not this doc.
