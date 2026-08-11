# Phase 2 — iKamer Home (`/home`)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-and-ui-kit-migration.md) (frozen contracts this phase consumes)
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — Badge/Chip/Alert/Tooltip/Avatar
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — Card, Skeleton, Spinner, Toast, LLM rules
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md)
- Spec: §13 (eligibility + P0–P5 bands + tie-breaks), §14 (anatomy/interaction/states/acceptance), §12.1 (card anatomy), §12.3 (slot limits)

## Overview

- **Priority:** P1 — flagship screen, validates the whole ranking + section-resilience thesis.
- **Status:** Pending. Blocked by Phase 1.
- **Effort:** 3h.
- Rewrite `HomePage.tsx` on Phase-1 shared components + `lib/ranking.ts` + `lib/audience.ts`. Eight sections per spec §14.2, each with its own loading/empty/error state; no cross-section failure coupling.

## Key Insights

- Current `HomePage.tsx` (89 lines) is a hardcoded mock of a mock: static date string, invented active items, invented "2 việc" count, priority hero picked by `news.find(mandatory && !acknowledged)` instead of ranking. Everything visible must now be **derived** from state.
- Spec §14.5 scenario 2 requires *independent* section failure, but there is no backend. Solution: a `useHomeSections()` hook that wraps each section's data in `{ status, data, retry }` and simulates staggered async resolution client-side. Failure is injected by a dev-only fixture flag — this is a demo affordance, not a fake API layer (no MSW, YAGNI).
- `rankCards()` needs a `priorityBand`; `NewsPost`/`EventItem` don't carry one (frozen types). Band derivation is **page-local** — a pure `toRankable()` mapper in the hook file implements spec §13.2 from existing fields. No type edits.
- Slot limits are hard caps, not suggestions (§12.3): hero 1, active 3, quick actions 4, news 4, events 2. Enforce with `.slice()` after ranking, never before.
- Empty ≠ error ≠ loading. Spec §14.4: no priority → **hide hero entirely** (not a full-screen "you're all clear"); no active items → **compact** success state.
- Skeletons must reserve the final height (§14.3) — fixed `h-*` on skeleton blocks matching real card heights, else the reflow noise defeats the point.

## Requirements

### Functional

- Sections in DOM order (§14.2): context header → priority hero → my active items → quick actions → news preview → upcoming events → knowledge teaser → goals teaser.
- Eligibility before ranking (§13.1): `isEligible(user, item.audienceTeamIds)` filters candidates; expired/past items dropped. Ineligible items never enter any list.
- Ranking via `rankCards()` — page never re-implements sort order.
- Per-section states: `loading` (skeleton), `ok` + data (content), `ok` + no data (empty/success state), `error` (`InlineError` + retry). A section in `error` renders its own error box only; siblings unaffected.
- `retry()` on an errored section returns it to `loading` then `ok` (fixture flag consumed once), proving recovery.
- Knowledge/Goals teasers = shells linking to `/knowledge` and `/goals` (Phase 7 pages), labelled R2/R3 respectively. No fake data.
- Context header content derived from live state: date via `Intl.DateTimeFormat('vi-VN')`, greeting from local hour, status sentence from actual counts.
- Every targeted item exposes `ReasonDisclosure` ("Vì sao tôi thấy nội dung này?") — hero always, news cards where the shared card supports it.
- One primary CTA on the page (hero's). All other actions = secondary/borderless/link (Core DS rule).

### Non-functional

- `HomePage.tsx` ≤ 200 lines; split section subcomponents into `src/pages/home/` if it grows past that (see Related Code Files).
- TS strict, no `any`. Hook is pure-ish: timers cleaned up on unmount.
- Dev fixture flag inert in production build (`import.meta.env.DEV` guard).
- No layout shift between skeleton and loaded content (visually verify at 1440px and 390px).

## Architecture

### `useHomeSections()` — `src/hooks/useHomeSections.ts` (new)

```ts
export type SectionStatus = 'loading' | 'ok' | 'error'
export interface Section<T> { status: SectionStatus; data: T; retry: () => void }
export interface HomeSections {
  priority: Section<HomeCard | null>
  activeItems: Section<HomeCard[]>
  news: Section<NewsPost[]>
  events: Section<EventItem[]>
}
export function useHomeSections(): HomeSections
```

- `HomeCard` = page-local discriminated union `{ kind: 'news'; post: NewsPost } | { kind: 'event'; event: EventItem }` + derived `reason: string`, `ctaLabel`, `href`. Declared in the hook file, not in frozen `types/`.
- Pipeline per render: `news`/`events` from `useAppState()` → `filter(isEligible)` → `filter(active)` → `map(toRankable)` → `rankCards()` → slice.
- `toRankable()` band rules (spec §13.2): mandatory + `dueAt` past → `P0`; mandatory unacknowledged → `P1`; event starting ≤48h or `dueAt` ≤48h → `P2`; `official` news → `P4`; else `P5`. (`P3` = manager-only, unused here.) Maps `publishedAt`→`updatedAt`, `mandatory.dueAt`→`dueAt`.
- `priority` = ranked[0] **only if** its band ≤ `P2`, else `null` (hero hidden).
- `activeItems` = registered upcoming events + unacknowledged targeted news, minus whatever the hero took, `.slice(0,3)`.
- Simulated async: `useEffect` sets each section `loading`→`ok` on staggered `setTimeout` (news 300ms, events 500ms, priority 200ms, active 350ms) so independence is observable. `useRef` guards double-fire in StrictMode.
- Fixture flag: `useSearchParams()` → `?fail=events,news` / `?slow=events`, honoured only when `import.meta.env.DEV`. Listed sections resolve to `status:'error'` instead of `'ok'`. `retry()` clears that section from the failure set and re-runs its timer.

### `HomePage.tsx` composition (kit primitives + Phase-1 shared components)

```tsx
<div className="flex flex-col gap-6 p-6">
  <ContextHeader … />                                     {/* 1 */}
  {priority.status !== 'ok' || priority.data ? <PriorityHero … /> : null}  {/* 2 */}
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
      <HomeSection section={activeItems} title="Việc của tôi" …/>   {/* 3 */}
      <HomeSection section={news} title="Tin dành cho bạn" href="/news" …/>  {/* 5 */}
      <TeaserCard title="Tri thức gợi ý" badge="R2" href="/knowledge" />     {/* 7 */}
    </div>
    <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      <QuickActionsBlock actions={…} />                                     {/* 4 */}
      <HomeSection section={events} title="Sự kiện sắp tới" href="/events" …/> {/* 6 */}
      <TeaserCard title="Mục tiêu của tôi" badge="R3" href="/goals" />      {/* 8 */}
    </aside>
  </div>
</div>
```

- `HomeSection` = local generic wrapper: renders `SectionHeader` (title + count + "Xem tất cả" + degraded indicator when `status==='error'`), then switch on status → `skeleton` prop | `<InlineError onRetry={section.retry} />` | `<EmptyState variant=… />` | `children(data)`.
- `PriorityHero` = kit `Card shadow="sm"` + `Badge variant="error"` (band label) + `Badge` (due) + `h2` title + summary + `ReasonDisclosure` + one primary `Button` → `nextActionHref`. Loading = skeleton of identical height; error = `InlineError`.
- News list = shared `NewsCard`; events rail = shared `EventCard compact`; active items = shared `AttentionCard`-styled rows or `NewsCard compact` per kind; quick actions = 4× shared `QuickAction` in a `grid grid-cols-2 gap-3`.
- Skeletons: kit `Skeleton` composed with explicit `h-[…]`/`w-` utilities matching loaded heights.
- Section headings use `aria-labelledby` on each `<section>`; live regions (`role="status"`) announce error/retry transitions.

## Related Code Files

**Modify:** `prototype-app/src/pages/HomePage.tsx` (full rewrite)

**Create:** `prototype-app/src/hooks/useHomeSections.ts`; *conditionally* `prototype-app/src/pages/home/{PriorityHero,HomeSection,ContextHeader,TeaserCard}.tsx` if `HomePage.tsx` exceeds 200 lines — `pages/HomePage.tsx` stays the route entry either way (App.tsx import path is frozen).

**Delete:** none.

## Implementation Steps

1. Read the landed Phase-1 `types/index.ts`, `lib/ranking.ts`, `lib/audience.ts`, and shared component props before writing anything — code to the real signatures, not to this doc's sketch.
2. Create `useHomeSections.ts`: `HomeCard` union, `toRankable()` band mapper, eligibility+active filtering, `rankCards()` call, slot slicing.
3. Add staggered `setTimeout` status machine + cleanup + StrictMode guard; add `retry()` per section.
4. Add dev-only `?fail=`/`?slow=` fixture flag parsing (`import.meta.env.DEV` guarded).
5. Rewrite `HomePage.tsx` skeleton-first: page grid + 8 section slots, all rendering `loading` state, verify no console errors.
6. Build `ContextHeader` (derived date/greeting/status sentence — kill the hardcoded "THỨ BA · 11 THÁNG 8").
7. Build `PriorityHero` with the 3 states + hidden-when-null rule + single primary CTA + `ReasonDisclosure`.
8. Wire `HomeSection` generic wrapper; plug active items, news (≤4), events (≤2).
9. Build quick actions block (≤4, derived labels/counts from state, no invented numbers).
10. Build Knowledge/Goals teaser shells with R2/R3 badges linking to Phase-7 pages.
11. Verify Gherkin scenario 1 manually; verify scenario 2 via `/home?fail=events`.
12. Split into `pages/home/` if over 200 lines; then `npm run typecheck && npm run build`.

## Todo List

- [ ] `useHomeSections.ts` created; ranking + eligibility + slot limits wired
- [ ] Band mapper implements §13.2 P0/P1/P2/P4/P5
- [ ] Per-section `loading|ok|error` + `retry()` working, timers cleaned up
- [ ] Dev-only `?fail=` / `?slow=` fixture flag, inert in prod build
- [ ] `HomePage.tsx` rewritten: 8 sections in spec order, 12-col grid
- [ ] Context header fully derived (date, greeting, counts)
- [ ] Hero: single primary CTA, reason disclosure, hidden when no priority
- [ ] Active items ≤3 with compact success empty state
- [ ] Quick actions ≤4, news ≤4, events ≤2
- [ ] Knowledge/Goals teasers link to Phase-7 pages, badged R2/R3
- [ ] Skeletons height-matched, no layout shift
- [ ] Both §14.5 scenarios pass; `typecheck && build` clean

## Success Criteria

- **Scenario 1 (mandatory beats fresh news):** with 1 unacknowledged mandatory post + 3 newer non-mandatory posts, `/home` shows the mandatory post in Priority hero, and the 3 newer posts in "Tin dành cho bạn" — verified without touching mock data ordering (i.e. ranking does it, not array order).
- **Scenario 2 (independent section failure):** `/home?fail=events` renders the events section as error + retry, while news/active/hero render normally; clicking retry recovers events without remounting the page.
- No priority → hero absent from DOM (not an empty box, not a full-width "nothing to do" panel).
- No active items → compact success row "Bạn đã xử lý hết việc cần chú ý".
- Ineligible (out-of-audience) news/event fixtures from Phase 1 appear in **no** section.
- Zero hardcoded dates/counts remain in `HomePage.tsx` (grep for digit-literal strings).
- Exactly one primary-variant button on the page.
- `npm run typecheck && npm run build` clean; no console errors/warnings at runtime.

## Risk Assessment

- **`rankCards()` input shape differs from the sketch** → read the landed signature first (step 1) and adapt `toRankable()`; do not fork the sort logic into this page.
- **`EventItem` has no machine-readable start timestamp** (only `day`/`month`/`time`/`dateLabel`) → P2 "starts within 48h" band can't be computed deterministically. See Next Steps dependency; interim fallback: treat events with `status==='going'|'open'` and array position 0 as near-term, and flag the imprecision in a code comment rather than parsing Vietnamese date labels.
- **Simulated async mistaken for a real data layer** → keep the hook <120 lines, comment it as a prototype affordance, no request/cache/abort abstractions (YAGNI).
- **StrictMode double-effect** re-runs timers and flickers skeletons → `useRef` guard.
- **Section wrapper over-generalisation** → one generic `HomeSection`, not a per-section HOC family (KISS).

## Security Considerations

- Eligibility filter runs **before** ranking and before any render path; an ineligible item's title/summary must never reach the DOM, including inside a skeleton or `aria-label`.
- `ReasonDisclosure` copy stays human ("Dành cho toàn bộ iKamer") — never echoes `audienceTeamIds`, rule ids, or team ids (§13.4).
- Dev fixture flag must not become a content-visibility control — it only flips section status, never filters or reveals data.
- Quick action targets are static in-app routes; no user-supplied href interpolation.

## Next Steps

- **Dependency on Phase 1 (do not edit these here):**
  1. `EventItem` needs an ISO `startsAt: string` for deterministic P2 banding and "upcoming" sorting — request as an additive field.
  2. `NewsPost` needs `updatedAt` (or confirmation that `publishedAt` is the canonical freshness key for `rankCards`).
  3. Confirm `SectionHeader` supports a degraded/error indicator slot and a `count` prop; `EmptyState` supports a `success` variant.
  4. Confirm shared `NewsCard`/`EventCard` accept a `compact` prop and an optional `reason` slot.
- Phase 3/4 reuse the same section-status pattern for list pages — keep `Section<T>` exported from this hook so they can import rather than redefine.
- Phase 8 owns the responsive/a11y sweep; only obvious breakpoints handled here.

## Unresolved Questions

1. Should the hero also be able to surface a Manager attention item when a dual-role user is in iKamer perspective? Spec §14.2 implies iKamer-scope only — assumed **no**.
2. Quick actions are "theo capability" (§14.2) but R0 has no capability model in mock data — assumed a static 4-item list. Confirm which 4 (registered events / saved posts / directory / help?).
3. Does "Tin dành cho bạn" exclude the post already shown in the hero (assumed **yes**, no duplication), or intentionally repeat it?
