# Phase 3 — Knowledge & Goals Concept Demos (R2/R3)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-types-state-stubs.md) (frozen contracts: `KnowledgeDoc`, `Goal`, `knowledgeDocs`, `goals`, `checkInGoal`, `RBadge`, `isEligible`)
- Spec §21 (Knowledge: native search/preview vs deep-link authoring, permission rules) · §22 (Goals: 4 statuses, quick check-in, deep-link iGoal)
- Current files being replaced: `pages/KnowledgePages.tsx`, `pages/GoalPages.tsx` (honest "sắp có" shells from R0)

## Overview

- **Priority:** P2. **Effort:** 1d. **Status:** Complete (commit 8a97acb).
- Upgrade both shells to interactive concept demos labeled `Concept · R2` / `Concept · R3`: Knowledge gets search + preview + deep-link; Goals gets 4-status board + quick check-in. Tour stop #4 — includes the permission beat feeding scenario S2b's narrative.

## Key Insights

- These pages must feel **usably real, honestly labeled** — the R0 shells said "sắp có"; the vision demo shows the target UX working on mock data with an unmissable Concept badge. The distinction between "shipped-grade" and "concept" is carried by `RBadge`, not by lower fidelity.
- Knowledge search must apply `isEligible` BEFORE text match (same demo-fidelity pattern as SearchPage) — the Finance-scoped doc never appears for An/Mai. Presenter pairs this with Ask iKame's "Không đủ dữ liệu" beat.
- Goals check-in is the only mutation: `checkInGoal(id)` flips `needs_update → on_track` with visible receipt — a mini-WUAR moment ("useful action", not page view).
- Deep-link CTAs ("Mở trong iWiki" / "Cấu hình trong iGoal") point nowhere real — render as buttons with external-link icon + tooltip "Demo — sẽ deep-link sang hệ thống nguồn". Do NOT use fake URLs that could 404 live.

## Requirements

### Functional
- `/knowledge`: page header + `RBadge R2` + search input (client filter over eligible docs: title/summary/topic, diacritic-tolerant like TeamPage's normalize), doc cards (title, topic pill, source "iWiki", updatedAt, summary), zero-result EmptyState, click → `/knowledge/:documentId`.
- `/knowledge/:documentId`: guards not-found → `/not-found`, ineligible → `/forbidden` (same order as News detail); body paragraphs; sticky rail: source card (iWiki, updatedAt) + "Mở trong iWiki" CTA + ReasonDisclosure-style "Vì sao tôi thấy tài liệu này?".
- `/goals`: header + `RBadge R3` + 4 status sections in fixed order (Cần cập nhật → Có rủi ro → Đang đúng tiến độ → Hoàn thành), goal cards (title, progress bar, cycle, lần check-in gần nhất, hạn kế tiếp), quick "Check-in nhanh" button on `needs_update`/`at_risk` cards → `checkInGoal(id)` → receipt + card moves section; "Cấu hình trong iGoal" CTA.
- `/goals/:goalId`: **(RED TEAM F11)** minimal read-only card only (~15 lines: goal fields + iGoal CTA + back-link) — the route stays alive for BLĐ self-browsing but gets zero stage time and zero build investment beyond that; no check-in history, no editing. The board is the demo star.

### Non-functional
- Keep exact export names (`KnowledgePage`, `KnowledgeDetailPage`, `GoalsPage`, `GoalDetailPage`) — `App.tsx` is frozen. Files ≤200 lines. Reuse existing CSS classes (`collection-page`, `content-card`, `card-badges`, `empty-state`, `people-*` where fitting); new styles only in `styles/knowledge-goals.css`.

## Architecture

- Progress bar: simple div pair (`.goal-progress > .goal-progress-fill[style width%]`) in knowledge-goals.css — no component library.
- Status maps: `GoalStatus → {label, tone}` local const (needs_update→error "Cần cập nhật", at_risk→warning "Có rủi ro", on_track→success "Đang đúng tiến độ", done→neutral "Hoàn thành") rendered via `StatusPill`.
- Check-in receipt: existing `.receipt` role="status" pattern.
- Knowledge search: `useMemo` over `knowledgeDocs.filter(d => isEligible(user, d.audienceTeamIds))` then text match.

## Related Code Files

**Modify (owned):** `src/pages/KnowledgePages.tsx` (rewrite), `src/pages/GoalPages.tsx` (rewrite), `src/styles/knowledge-goals.css` (fill)
**Read-only (frozen):** `types/index.ts`, `AppState.tsx`, `mockData.ts`, `lib/audience.ts`, `components/{UI,RBadge,ContentCards}.tsx`, `App.tsx`

## Implementation Steps

1. Read landed fixtures/mutators (`knowledgeDocs`, `goals`, `checkInGoal`) from real files.
2. Rewrite `KnowledgePages.tsx`: list (search + eligibility) → detail (guards → body → rail).
3. Rewrite `GoalPages.tsx`: 4-section board + check-in flow + receipt; minimal detail page.
4. Fill `knowledge-goals.css` (cards grid, progress bar, section spacing) — light + dark.
5. Verify: Finance doc absent from list AND direct URL → `/forbidden`; check-in moves card between sections; `resetDemo()` restores.
6. `npm run typecheck && npm run build`.

## Todo List

- [x] Knowledge list: search + eligibility filter + zero-result state
- [x] Knowledge detail: guard order, body, iWiki rail, reason disclosure
- [x] Goals board: 4 sections ordered, progress bars, status pills
- [x] Quick check-in: mutator + receipt + card moves section
- [x] Deep-link CTAs labeled as demo (no fake URLs)
- [x] RBadge R2/R3 on both page headers
- [x] Dark + 390px pass; typecheck && build green

## Success Criteria

- Search "bảo mật" finds the policy doc; searching the Finance doc's exact title yields nothing; direct URL to it lands on `/forbidden` with no title in DOM.
- Check-in on a `needs_update` goal visibly moves it to "Đang đúng tiến độ" with receipt; reset-demo reverts it.
- Both pages read as polished product with clear Concept labeling — not lorem-ipsum mock.

## Risk Assessment

- **Scope creep toward full CMS** → list+detail+check-in ONLY; no create/edit/comment anything (YAGNI).
- **CSS drift from Core DS** → reuse tokens/classes; new css file limited to layout specifics.

## Security Considerations

- Same demo-fidelity eligibility framing as R0 (client-side filter, mock data resident; framing note exists in `lib/audience.ts`).

## Next Steps

- Phase 6 adds both pages to visual-check screenshots; presenter script stop #4 pairs Knowledge search with Ask iKame deny beat.
