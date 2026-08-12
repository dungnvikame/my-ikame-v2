# Phase 5 — Mục tiêu: iGoal-style OKR Tree + Check-in Report Flow

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-shared-surface.md) (`okrTree`, `Objective/KeyResult`, `CheckInReport`, `submitReport`, `initialCheckInReports`) · [brainstorm §6](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md)
- Read before coding: current `src/pages/GoalPages.tsx` (v1 status board + `checkInGoal` flip + R-badge header + goal detail card), `src/AppState.tsx` (`goals`, `checkInGoal`, `checkInReports`, `submitReport`)

## Overview

- **Priority:** P1. **Effort:** 1.5d. **Status:** pending. **Parallel with 2, 3, 4.**
- Turn `/goals` into an iGoal-style surface: cycle selector, 3 tabs, OKR tree (company → 2 teams → personal with expandable KRs), a real "Tạo báo cáo" flow that writes a `CheckInReport` and flips the linked goal, plus the v1 "Mục tiêu của tôi" check-in section retained as a section.

## Key Insights

- **Money moment #3** lives here: `Tạo báo cáo` → prefilled form → submit → report appears in `Tổng hợp báo cáo` **and** the goal's status/progress visibly changes. Both effects come from the single `submitReport` mutator (do not also call `checkInGoal` — it is already inside).
- **No graph libraries** (YAGNI, and no new deps allowed): the "Sơ đồ" tab is an indented tree with connector borders in CSS. Same data, different density from the list tab.
- Tree is built from the flat `okrTree` by `parentId` — one small `buildTree()` helper, memoized. Personal objectives carry `linkedGoalId` so tree rows can show the live `Goal` status pill (F2 spirit: read live, never duplicate progress numbers into the tree UI when a linked goal exists).
- **R-badge removal (D2)**: rebuilt header must NOT render `<RBadge tag="R3" />`; remove the import.
- **CSS split decision:** Phase 5 owns a NEW `src/styles/goals-v2.css` and uses new prefixes (`okr-`, `goals-v2-`). Phase 4 keeps `knowledge-goals.css`. Stale v1 `.goal-*` rules there are left alone (harmless) — do not depend on them.

## Requirements

### Functional
1. **Header**: eyebrow `MỤC TIÊU`, h1 (no R-badge), 1-line purpose; **cycle selector** `H2 2026` (default) / `H1 2026` — selecting H1 shows an `EmptyState` "Chưa có dữ liệu chu kỳ này" (honest, no fake data).
2. **Tabs**: `Mục tiêu & báo cáo` (default) · `Sơ đồ mục tiêu` · `Báo cáo`.
3. **Tab 1 — Mục tiêu & báo cáo**:
   - **OKR list**: company objective row (owner avatar, progress bar + %, KR count) → team rows (2) → personal rows (4). Each row expandable → its `keyResults` with per-KR progress bar, `unitLabel`, status pill. Expand/collapse is keyboard accessible (`button` + `aria-expanded`).
   - **"Mục tiêu của tôi"** section (v1 carry-over): the 4 personal `goals` with status pill, progress, `lastCheckIn`/`nextDue`, existing `Check-in` button → `checkInGoal(id)` (unchanged behavior) + a `Tạo báo cáo` button opening the report form for that goal.
   - **Tổng hợp báo cáo** preview: latest 2 `checkInReports` + link to tab 3.
4. **Tab 2 — Sơ đồ mục tiêu**: indented tree (3 levels) with CSS connectors, compact rows (title, owner initials, progress %), all nodes expanded by default, horizontal scroll on mobile. Legend line explaining levels.
5. **Tab 3 — Báo cáo**: full `checkInReports` list (newest first) — goal title, `periodLabel`, `progressBefore → progressAfter`, content, blockers, `submittedAt`, `source` pill (`Tự soạn` / `AI soạn — đã duyệt`). `EmptyState` if empty.
6. **Report form** (inline panel or lightweight modal, page-local): fields prefilled from the goal → `periodLabel` (e.g. "Tuần 33 · 10-16/08"), `progressAfter` (number input, default `progress + 10` capped 100), `content` (textarea prefilled with a short template referencing the goal title), `blockers` (optional). `Gửi báo cáo` → `submitReport({...})` → close form, toast receipt, report visible in the preview + tab 3, goal row shows `on_track` + `Vừa xong` + new progress. `Huỷ` discards.
7. **Goal detail page** (`/goals/:goalId`): keep the minimal v1 card + add the goal's KRs (from the matching `Objective.linkedGoalId`) and its reports. Not a demo stop — keep it small, just not dead.

### Non-functional
- Files ≤200 lines → subcomponents under `src/pages/goals/`.
- Form state is component-local and clears on `demoResetCount` change (F4).
- a11y: `role="tablist"`/`tab`/`tabpanel` wiring, `aria-expanded` on rows, labeled inputs, progress bars with `aria-valuenow`.

## Architecture

```
src/pages/GoalPages.tsx              // GoalsPage (tabs/orchestration) + GoalDetailPage (<200 lines)
src/pages/goals/OkrTree.tsx          // list mode + diagram mode via `variant` prop (DRY)
src/pages/goals/GoalMyList.tsx       // "Mục tiêu của tôi" + check-in + open-report buttons
src/pages/goals/ReportForm.tsx       // prefilled form → submitReport
src/pages/goals/ReportList.tsx       // reports (preview `limit` + full list)
src/pages/goals/build-okr-tree.ts    // flat Objective[] → nested nodes
src/styles/goals-v2.css
```

```ts
type OkrNode = Objective & { children: OkrNode[] };
export function buildOkrTree(items: Objective[]): OkrNode[] { /* parentId → children, roots = no parentId */ }
```

```tsx
// submit path — single mutator, no duplicated goal update
submitReport({
  goalId: goal.id, goalTitle: goal.title, authorName: user.name,
  periodLabel, progressBefore: goal.progress, progressAfter,
  content, blockers: blockers || undefined, source: 'manual',
});
```

## Related Code Files

**Modify:** `src/pages/GoalPages.tsx`
**Create:** `src/pages/goals/{OkrTree,GoalMyList,ReportForm,ReportList}.tsx`, `src/pages/goals/build-okr-tree.ts`, `src/styles/goals-v2.css` (Phase 1 created it empty + imported in `main.tsx`)
**Must NOT touch:** `KnowledgePages.tsx` / `knowledge-goals.css` (Phase 4), `AppState.tsx`, `mockData.ts`, `types/index.ts`, `app.css`, `ai-scripts.ts` (Phase 6 wires the A3 chip to `submitReport`).

## Implementation Steps

1. `build-okr-tree.ts` + `OkrTree` list variant (rows, progress bars, KR expand).
2. Tabs shell + cycle selector (H1 empty state) + R-badge removal.
3. `GoalMyList` (v1 check-in preserved + `Tạo báo cáo` trigger).
4. `ReportForm` prefill + `submitReport` + toast + reset-clear effect.
5. `ReportList` (preview limit 2 + full tab 3, `source` pill).
6. `OkrTree` diagram variant (indent + connectors + legend).
7. Goal detail page: KRs + reports for that goal.
8. Dark + 1024px + mobile pass; verify money moment end-to-end twice (second run must not double-flip incorrectly).
9. `npm run typecheck && npm run build`; commit `feat(goals): iGoal-style OKR tree, cycle selector and check-in report flow`.

## Todo List

- [ ] `buildOkrTree` + OKR list rows with expandable KRs (7 objectives, 3 levels)
- [ ] Cycle selector (H2 default, H1 honest empty state) + 3 tabs (a11y wiring)
- [ ] "Mục tiêu của tôi" retains v1 check-in flip
- [ ] Report form prefilled → `submitReport` → report + goal status/progress flip + toast
- [ ] Reports tab (full list, source pill) + preview in tab 1
- [ ] Sơ đồ tab: indented tree, no graph libs, legend
- [ ] Goal detail: KRs + reports, not dead
- [ ] Local form state clears on demoResetCount; no shared-file edits
- [ ] typecheck + build green; committed

## Success Criteria

- Submitting a report visibly changes: reports list (+1), goal status `Cần cập nhật → Đúng tiến độ`, progress number, `lastCheckIn: Vừa xong`.
- `resetDemo()` returns to 4 goals + 2 seeded reports.
- Both tree modes render the same 7 objectives consistently; no orphan nodes.

## Risk Assessment

- **Tree UI over-engineering** → indent + border connectors only; if the diagram tab costs more than ~2h, ship the indent list with denser styling and move on.
- **Two mutators fighting** (`checkInGoal` + `submitReport`) → `submitReport` owns the goal update; the standalone `Check-in` button remains the quick path. Document in a code comment so the AI chip (Phase 6) uses `submitReport` only.
- **Progress input abuse** (>100, negatives) → clamp 0-100, `type="number"` + guard.
- **CSS conflict with Phase 4** → separate file + `okr-`/`goals-v2-` prefixes.

## Security Considerations

Mock-only. Report content rendered as plain text (free-text input → never `dangerouslySetInnerHTML`).

## Next Steps

Phase 6 adds the `/goals` A3 chip: draft a check-in report from live goal state → approve → `submitReport({ source: 'ai' })`, gated by `isApplicable` (a goal needing update must exist).
