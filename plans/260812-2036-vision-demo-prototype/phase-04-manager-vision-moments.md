# Phase 4 — Manager Vision Moments (AI-Brief, Resolve Flow)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-types-state-stubs.md) (frozen contracts: `attention` in AppState, `resolveAttentionItem`, `AttentionCard.onAction/onResolve`, `RBadge`)
- Spec §15 (attention canvas, insight contract, D4) · Brainstorm §4 stop 5 (the 5-minute Manager beat) · North Star WUAR (§54: "Manager resolve attention item" = useful action)
- Current file: `pages/ManagerPage.tsx` (121 lines — scope filter → toRankable → rankCards → slice(5), derived counts, snapshot KPIs, moments)

## Overview

- **Priority:** P1 — the tour's longest stop and the WUAR story's proof. **Effort:** 1d. **Status:** Complete (commit 37e6dbf).
- Two additions to Manager Overview: (a) **AI-brief đầu tuần** block (A2 concept, on-canvas — not chatbot), (b) **resolve flow** — attention item leaves the queue with receipt, counts update live.

## Key Insights

- The AI-brief demonstrates the thesis "AI làm giàu trải nghiệm có sẵn": it sits ON the attention canvas, derives its 3 bullets from the LIVE scoped attention state (counts real, not hardcoded — same lesson as R0's derived-copy fixes), and carries `AiBadge A2` + `RBadge R4`. If an item gets resolved, the brief's numbers change on next render — that's a demo money moment ("số liệu này sống").
- **Switch from direct `attentionItems` import to `useAppState().attention`** — this closes Phase 1's known stale window and is what makes resolve work.
- Resolve semantics: `state: 'resolved'` filtered out of the queue (`state === 'open'` filter already exists in the pipeline). No undo UI (resetDemo covers rehearsals) — YAGNI.
- The A3 draft-reminder scenario lives in the Ask panel (Phase 2); this phase's job is making sure its narrative target (the "3 thành viên chưa phản hồi" item) can then be resolved on-canvas, completing the loop: *AI drafts → human approves → work happens → manager resolves → queue shrinks*.

## Requirements

### Functional
- `ManagerPage` reads `attention` from context; queue pipeline unchanged otherwise (scope filter → rank → slice 5).
- AI-brief block between context header and attention queue: title "Bản tin AI đầu tuần" + `AiBadge`-style A2 pill + `RBadge R4`; 3 bullets derived from live state (e.g. "1 việc bắt buộc quá hạn — 2 thành viên", "3 người chưa phản hồi iConnect — RSVP đóng sau 2 ngày", "1 thành viên mới bắt đầu 17/08"); each bullet has "vì sao" mini-reason + links to the item/source; footer line "Tổng hợp từ iGoal · Event · HRIS — mô phỏng khái niệm".
- Every `AttentionCard` in the queue gets `onResolve` → confirm-free single click "Đánh dấu đã xử lý" → item disappears, inline receipt "Đã xử lý · WUAR +1" (playful but on-message; exact copy final call in implementation).
- **(RED TEAM F5) Live-recompute scope:** header count ("team đang có N việc cần chú ý") and the critical-severity KPI recompute from live `attention`. The check-in KPI CANNOT honestly recompute (static `teamMembers`, no member↔item linkage) — its copy is decoupled from the queue: "4/6 đã hoàn tất check-in tuần" WITHOUT the "còn lại nằm trong attention queue" clause. Never promise on-screen what the data model can't deliver.
- **(RED TEAM F6) AI-brief zero-state:** when the open queue is empty, the brief collapses to a single line — "Không còn việc tồn đọng — tuần này bắt đầu sạch." (itself the stop's closing line). `buildBrief` must handle `[]` without rendering an empty husk or "0 việc" nonsense.
- `onAction` (primary CTA) wires to sensible navigation: goal item → `/goals`, event-response item → `/events/iconnect-2026-08`, new-joiner → `/manager/team`.
- Empty queue (all resolved) → existing success EmptyState ("Không có việc cần chú ý") — presenter's closing beat for this stop.

### Non-functional
- File ≤200 lines (currently 121; brief block may push it — extract `ManagerAiBrief` as local component in same file, or move to `styles/manager-vision.css`-adjacent local file ONLY if over limit: `pages/manager/ManagerAiBrief.tsx` is acceptable, directory is unowned).
- New styles only in `styles/manager-vision.css`. Dark + 390px pass.

## Architecture

- Brief bullets derived: `const briefItems = useMemo(() => buildBrief(scopedOpenAttention, teamMembers), ...)` — pure function mapping severity/required/dueAt into sentence + reason + href. No AI script store dependency (this is on-canvas enrichment, not chat).
- Resolve: `resolveAttentionItem(item.id)` from context; receipt via local `useState<string|null>` + `.receipt` pattern; `role="status"` for announcement.
- KPI cards: critical-count KPI switches to live `attention` from context; check-in KPI keeps static roster data with decoupled copy (F5). The A-brief pill imports the shared `AiBadge` from Phase 1 — never a local re-implementation.

## Related Code Files

**Modify (owned):** `src/pages/ManagerPage.tsx`, `src/styles/manager-vision.css` (fill)
**Create (only if >200 lines):** `src/pages/manager/ManagerAiBrief.tsx`
**Read-only (frozen):** `AppState.tsx`, `types/index.ts`, `mockData.ts`, `components/{ContentCards,UI,RBadge}.tsx`, `lib/ranking.ts`

## Implementation Steps

1. Read landed contracts (`attention`, `resolveAttentionItem`, `AttentionCard` props).
2. Swap direct import → context; verify queue/counts unchanged.
3. Build `buildBrief()` + AI-brief block with badges + reasons + links.
4. Wire `onResolve` + receipt + live recompute of header/KPIs; wire `onAction` navigations.
5. Fill `manager-vision.css`; dark + mobile pass.
6. Manual loop test: resolve all 3 items → empty-success state → `resetDemo()` → queue back; `npm run typecheck && npm run build`.

## Todo List

- [x] ManagerPage reads attention from context (direct import removed)
- [x] AI-brief block: 3 derived bullets, reasons, links, A2 + R4 badges, source footer
- [x] Resolve: item leaves queue, header count + critical KPI recompute (check-in KPI copy decoupled — F5), receipt announced
- [x] AI-brief zero-state single line renders when queue empty (F6)
- [x] onAction navigations wired per item type
- [x] Empty-queue success state reachable live
- [x] Dark + 390px; typecheck && build green

## Success Criteria

- Resolving "2 mục tiêu chưa check-in" removes the card, drops header count 3→2, and the AI-brief bullet list updates on next open — all without refresh.
- Brief contains zero hardcoded numbers (grep digit literals).
- Full stop-5 demo beat runs: AI-brief → Ask panel A3 draft/send (Phase 2) → resolve → empty state.

## Risk Assessment

- **Brief reads as fake dashboard** (D4 violation) → every bullet = who/what + why + next action link; no bare metrics.
- **KPI cards still derived from stale source** → single source `attention` from context, verified by resolve test.

## Security Considerations

- Scope filter (`teamId`) stays BEFORE ranking/counting — resolve must not bypass it. Demo-fidelity framing unchanged.

## Next Steps

- Presenter script (Phase 6) choreographs stop 5: brief → A3 → resolve → "đây chính là North Star WUAR".
