# Phase 5 — Manager Experience (`/manager/overview`, `/manager/team`)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-and-ui-kit-migration.md) (shared types, `lib/ranking.ts`, `AttentionCard`, `EmptyState`, `InlineError`, TeamMember fixture, `/manager` → `/manager/overview` redirect)
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — Avatar, Badge, Chip, Drawer, Input
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — Table/DataTable, Card, Progress
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md)
- Spec `My-iKame-Product-Spec-v0.2.md` §15.2 anatomy, §15.3 card contract, §15.4 privacy/scope, §15.5 acceptance, §16.1 My Team R0

## Overview

- **Priority:** P1. **Status:** Pending. **Effort:** 4h.
- Rebuild the two Manager screens on ui-kit: `/manager/overview` = attention canvas (5 ordered sections), `/manager/team` = roster `DataTable` + row-click `Drawer` side panel.
- Runs in parallel with phases 2/3/4/6/7 — owns only two page files.

## Key Insights

- Manager Overview is an **attention canvas, not a BI dashboard** (spec D4). `Goal completion: 73%` is the spec's explicit bad example. Every number must carry interpretation + drill-down link.
- Attention queue ordering comes from `lib/ranking.ts` — do **not** hand-roll a comparator. `AttentionItem` has no `priorityBand`/`updatedAt`, so map before ranking: `priorityBand = required ? 'P1' : 'P3'`, `updatedAt = freshnessAt`, pass `severity`/`dueAt` through. `dueAt` asc with nulls-last naturally gives overdue → due-soon → no-due; `priorityBand` sorts before it, so required-before-optional wins across the board — exactly spec §15.5 scenario 1.
- Scope filter is a **permission boundary, not a UI filter**: `items.filter(i => i.teamId === user.teamId)` runs before ranking and before slice(0,5). Out-of-scope items must be absent from the DOM entirely — not hidden with CSS, not truncated after render. Mirrors the spec's "BFF loại bỏ item Team B trước response", done client-side because there is no BFF in R0.
- Current `ManagerPage` hardcodes "3 việc cần chú ý"/"6 thành viên" (scout gap) — derive all counts from the filtered arrays so the numbers can never lie.
- Row click opens a kit `Drawer` (`side="right"`), never a Modal — spec §16.1 "không mở modal chồng modal". Drawer is controlled (`open`/`onOpenChange`) from page state, not `DrawerTrigger`, because the trigger is a table row.
- `DataTable` is desktop-only in practice; render a compact card list under `md` via the same `useIsDesktop()` hook Phase 1 introduces (no CSS-only duplicate render).

## Requirements

### Functional
- `/manager/overview` renders 5 sections in spec §15.2 order: Team context → Requires attention (≤5) → Team moments → Team snapshot (≤3 KPI) → Manager resources (≤3).
- Every attention card renders all 6 contract fields via shared `AttentionCard` (who/what, why now, severity, freshness, source, one next action).
- Attention items whose `teamId ≠ user.teamId` never render.
- Empty attention queue → `EmptyState` variant `success` ("Không có việc cần chú ý"), not a blank section.
- `/manager/team`: search by name (case/diacritic-tolerant substring), filter chips `Cần chú ý` / `Đã ổn` / `Chưa có dữ liệu` (+ implicit "Tất cả"), desktop table, mobile compact list, row click → side panel with member detail + their attention items.
- Team roster filtered by `teamId` too — same boundary rule.
- No-result search/filter → `EmptyState` variant `no-result` with a "Xóa bộ lọc" action.

### Non-functional
- Each page file ≤200 lines; extract per-page helpers into a local `components/` sibling only if unavoidable (prefer keeping both pages self-contained — DRY across pages is Phase 1's job, not this one's).
- TS strict, no `any`. One orange Primary CTA per screen max (Core DS): overview = the top-ranked attention card's action; team page = none (all actions Dim/link).
- Table interactive rows must be keyboard-reachable (Enter/Space opens the panel) with `aria-label`.

## Architecture

### `/manager/overview` (ManagerPage.tsx)

```
useAppState() → { user }
scoped   = attentionItems.filter(i => i.teamId === user.teamId && i.state === 'open')
ranked   = rankCards(scoped.map(toRankable))          // lib/ranking.ts
queue    = ranked.slice(0, 5)
```
- `toRankable(item)` → `{ id, priorityBand: item.required ? 'P1' : 'P3', severity, dueAt, updatedAt: item.freshnessAt }`; keep the original via a `byId` lookup or a wrapper `{ ...rankable, item }` — do not mutate `AttentionItem`.
- Section 1 Team context: kit `Card` — perspective eyebrow, `Chào {user.shortName}, team đang có {queue.length} việc cần chú ý`, line 2 `{user.team} · {roster.length} thành viên · Dữ liệu cập nhật {latestFreshness}`. Scope selector rendered as a disabled/single-option kit `Select` or `Chip` labelled with the granted scope — visible so the scope is explicit (§15.4), non-functional in R0 (single scope in mock data); annotate with a comment.
- Section 2 Requires attention: `SectionHeader` (title + meta "Required trước optional · Quá hạn trước sắp đến hạn" + "Xem tất cả" → `/manager/team`) + `queue.map(AttentionCard)`, `primary` on index 0 only.
- Section 3 Team moments: kit `Card` + `Avatar` + `Badge` per moment (new joiner / birthday / anniversary). Source from the TeamMember fixture where derivable (e.g. `status === 'no_data'` + a joining date) else a small local const array of 1–2 moments — local presentational fixture, no type/mockData edits.
- Section 4 Team snapshot: ≤3 kit `Card`s, each = number + `Progress` (where a ratio exists, e.g. 4/6 check-ins) + one-sentence interpretation + drill-down link. Never a bare percentage.
- Section 5 Manager resources: ≤3 link cards.

### `/manager/team` (TeamPage.tsx)

```
roster   = teamMembers.filter(m => m.teamId === user.teamId)
visible  = roster.filter(matchesQuery).filter(matchesStatusChip)
selected = visible.find(m => m.id === selectedId)   // drives Drawer
```
- Search: kit `Input` `leftIcon={<Search/>}` `size="m"`, controlled `query` state; normalize both sides with `.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'')`.
- Filter chips: kit `FilterChipRadioGroup` (single-select semantics) mapping `all | needs_attention | ok | no_data` → labels `Tất cả | Cần chú ý | Đã ổn | Chưa có dữ liệu`. Each chip shows its count.
- Desktop `Table`/`DataTable` columns per §16.1: `person` (Avatar + name + role, `pin="left"`), `team`, `attentionSummary`, `lastUpdated` (`align="right"`, `sortable`), `action` (Dim `Button` "Xem"). Props: `data={visible}`, `size="compact"`, `stickyHeader`, `emptyMessage` unused (we short-circuit to `EmptyState` before rendering the table). Row click → `setSelectedId(row.id)`; wire via the column `cell` action button **and** a row-level handler so both mouse and keyboard work.
- Mobile: same `visible` array rendered as kit `Card` rows (Avatar + name/role + status `Badge` + timestamp), whole card is a button opening the same Drawer.
- Side panel: `<Drawer open={!!selected} onOpenChange={o => !o && setSelectedId(null)}>` → `DrawerContent side="right" size="m"` → Header (Avatar + name + role + status `Badge`) → Body (attention summary, last updated, that member's in-scope attention items rendered with shared `AttentionCard`, or `EmptyState`) → Footer (Dim `Button` "Đóng" via `DrawerClose`; deep-link buttons are inert in R0).
- Any `Select`/`Popover` used inside the Drawer needs `portal={false}` / `portalContainer` per kit gotchas.

## Related Code Files

**Modify (owned by this phase):**
- `prototype-app/src/pages/ManagerPage.tsx` — full rewrite
- `prototype-app/src/pages/TeamPage.tsx` — full rewrite, consumes Phase 1's shared `TeamMember[]` fixture (local `team` array deleted)

**Create:** none.

**Delete:** the local hardcoded `team` array inside `TeamPage.tsx` (no file deletions).

**Read-only imports (must not edit):** `types/index.ts`, `data/mockData.ts`, `lib/ranking.ts`, `AppState.tsx`, `components/{AttentionCard,SectionHeader,EmptyState,InlineError,ReasonDisclosure}.tsx`, `App.tsx`.

## Implementation Steps

1. Confirm Phase 1 landed: `lib/ranking.ts` exports `rankCards`, `mockData.ts` exports `teamMembers: TeamMember[]` + an `AttentionItem` with a foreign `teamId`, `AttentionCard` renders all 6 fields. If any missing → stop, report as blocked (do not patch Phase 1 files).
2. `ManagerPage.tsx`: write `toRankable` + scope filter + `rankCards` + `slice(0,5)` pipeline; assert with a temporary console check that the foreign-`teamId` fixture is excluded, then remove the check.
3. Build sections 1–5 on kit `Card`/`Badge`/`Avatar`/`Progress`/`Select`; wire all counts and the freshness timestamp to derived values (zero hardcoded numbers).
4. Empty/degraded states: `EmptyState` when `queue.length === 0`; keep `InlineError` import path known but only render it if a section's fixture is missing (prototype has no fetch — use it for the "team moments policy off" case rather than inventing a fake error).
5. `TeamPage.tsx`: import shared fixture, add `query` / `statusFilter` / `selectedId` state, implement diacritic-insensitive filter helpers.
6. Build the `DataTable` column defs + compact mobile list behind `useIsDesktop()`.
7. Build the controlled `Drawer` side panel; render the selected member's in-scope attention items with `AttentionCard`.
8. Keyboard pass: row `tabIndex={0}` + `onKeyDown` Enter/Space, `aria-label` on icon-only buttons, focus returns to the triggering row on Drawer close.
9. Verify spec §15.5 scenarios manually (see Success Criteria), then `npm run typecheck && npm run build`.

## Todo List

- [ ] Phase 1 dependencies verified present
- [ ] Scope filter (`teamId`) applied before ranking on both pages
- [ ] `toRankable` mapping + `rankCards` + `slice(0,5)` queue
- [ ] Overview sections 1–5 in spec order, all counts derived
- [ ] Team snapshot ≤3 KPIs, each with interpretation + drill-down
- [ ] Attention empty state
- [ ] TeamPage consumes shared `TeamMember[]`; local array gone
- [ ] Search + 3 filter chips (+ Tất cả) with counts
- [ ] Desktop `DataTable` + mobile compact list
- [ ] Row-click `Drawer` side panel (no modal), keyboard accessible
- [ ] No-result `EmptyState` with clear-filter action
- [ ] Gherkin scenario 1 + 2 both verified
- [ ] `npm run typecheck && npm run build` clean

## Success Criteria

- **Gherkin 1 (required-first):** with a required-due-soon item and an optional-overdue item in the fixture, the required card renders above the optional one on `/manager/overview`. Verify by reading rendered order, not by trusting the comparator.
- **Gherkin 2 (no out-of-scope leak):** the foreign-`teamId` attention fixture appears nowhere in `document.body.innerHTML` on either page (check the serialized DOM, not just visually). Same for any foreign-team `TeamMember`.
- Attention queue never exceeds 5 cards; every card shows all 6 contract fields.
- Zero hardcoded counts/timestamps — changing the fixture changes the headline copy.
- Team page: typing a name narrows rows; each chip narrows to the matching status; clicking a row opens a right-side Drawer with that member's data; Esc closes it.
- Snapshot section contains no bare metric (each KPI has a sentence of interpretation and a drill-down affordance).
- Both pages usable at 375px width (compact list, full-width Drawer).

## Risk Assessment

- **`rankCards` shape mismatch** — `AttentionItem` lacks `priorityBand`/`updatedAt`. Mitigation: local `toRankable` adapter (above). If `rankCards`'s actual signature diverges from phase-01's sketch, adapt locally; do not edit `lib/ranking.ts`.
- **Kit `DataTable` row-click API** — Phase 1's verification spike (§0 in that phase) reads the installed `.d.ts` for this before any phase builds against it; check that phase's recorded findings first. If still undocumented when you get here, put the click handler on the `person` cell + a dedicated action cell. Do not fall back to a raw `<table>`.
- **Drawer width on mobile** — kit forces full-width <640px; fine for a side panel, but confirm the roster stays scrollable behind it.
- **Fixture coupling** — this phase's proofs depend on Phase 1 actually adding the foreign-`teamId` and required/optional pair fixtures. Listed in Next Steps as a hard dependency.
- **Scope selector overreach** — resist building multi-scope switching (YAGNI, R0 has one scope); render it read-only.

## Security Considerations

- Scope filtering is the whole point of §15.4: filter **before** ranking, slicing, counting, and before any array reaches JSX. Never render-then-hide.
- Counts and KPI aggregates are computed from the already-scoped array, so an out-of-scope member can't influence a number and be inferred from it (small-aggregate inference rule, §15.4).
- No sensitive attributes in card previews or table cells — roster shows role/team/attention summary/timestamp only; nothing about compensation, performance rating, or personal data.
- Drawer content is limited to the same scoped fields — opening a panel must not reveal anything the row didn't already permit.
- **(Red team framing fix)** This scope filter proves the spec §15.4 pattern renders correctly in the demo — it is not a real permission boundary; the full `attentionItems`/`teamMembers` arrays are resident client-side in `AppState` regardless of what this filter does. A one-line functional comment describing what the filter does today is enough; don't write it as a placeholder for a future backend team, since there's no backend in this plan's scope to hand it off to.

## Next Steps

**Depends on (Phase 1, hard):** `lib/ranking.ts::rankCards`; `types/index.ts` `AttentionItem` (incl. `teamId`, `required`, `freshnessAt`, `state`) + `TeamMember`; `mockData.ts` exporting `teamMembers`, an out-of-scope `AttentionItem`, and a required-due-soon / optional-overdue pair; `AttentionCard`, `SectionHeader`, `EmptyState`, `InlineError`; `useIsDesktop()`; `/manager` → `/manager/overview` redirect + `PerspectiveGuard` covering both routes.

**(Red team update) Both items below are already resolved in the landed Phase 1 spec:** `TeamMember` already carries optional `joinedAt`/`momentType`, and the fixture list already commits to ≥1 member per status. Use them if present; a local 1-2 item const for Team Moments is still an acceptable fallback if the optional fields aren't populated in the actual fixtures, but check first.

**Hands off to Phase 8:** a11y/responsive sweep of both pages; `scripts/visual-check.mjs` target URLs must include `/manager/overview` and `/manager/team`.

## Unresolved Questions

1. Does kit `DataTable` expose a row-click/`onRow` prop? Docs don't say — resolve at implementation time by reading the installed `.d.ts`.
2. Scope selector: render as disabled `Select`, static `Chip`, or omit entirely in R0? Spec §15.2 says "nếu được cấp" — leaning read-only `Chip` showing the granted scope, since showing scope explicitly is a §15.4 requirement even when it isn't switchable.
3. Team Moments policy gate — spec says "chỉ khi policy cho phép" but R0 has no policy model. Default: always show, with a code comment marking the future gate. Confirm acceptable.
