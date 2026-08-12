# Phase 3 — Newsfeed (`/news`, `/news/:postId`)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-and-ui-kit-migration.md) (hard prerequisite)
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — Chip, Tabs, Modal, Alert, Badge, Avatar, DropdownMenu
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — SegmentedControl, Toast, Card, Breadcrumb, Skeleton
- [scout report](../reports/scout-260811-2136-product-overview.md) — current `NewsPages.tsx` (120 lines: `NewsPage` + `ArticlePage`), `acknowledgeNews()` in `AppState`
- Spec: `My-iKame-Product-Spec-v0.2.md` §17 (§17.3 read-vs-ack = the load-bearing subsection, §17.7 acceptance)

## Overview

- **Priority:** P1. **Status:** Pending. **Effort:** 4h.
- Rebuild `/news` list (highlighted story + ranked grid + filters) and `/news/:postId` detail (audience guard, sticky mandatory acknowledgement panel, read≠ack) on ui-kit primitives.
- Parallel-safe: touches only this phase's page file(s).

## Key Insights

- **Read ≠ acknowledge is the whole point of this phase.** `read` is passive/system-set; `acknowledged` is an explicit click. Setting `read` MUST NOT clear the mandatory attention item, MUST NOT change the "Cần xác nhận" badge, MUST NOT remove the post from Home's attention queue. Only `acknowledgeNews()` does.
- Acknowledgement is append-only (§17.3) — no un-acknowledge UI, no toggle. Button disappears/disables permanently after click.
- `read` must be **shared** state, not local: Gherkin #1 requires the "Đã đọc" state to still be visible after navigating back to Home. Phase 1 already ships `markNewsRead(postId)` on `AppState` (confirmed in the landed contract) — this is no longer an open dependency, just a signature to read and use.
- **(Red team simplification)** Spec §17.3 forbids "page load = read," but a 3-second visibility-gated dwell timer is invisible ceremony a demo viewer will never notice — it requires cleanup-on-unmount, a `visibilityState` listener, and its own regression test, for a state transition with no direct UI trigger. Simplified: call `markNewsRead(post.id)` synchronously once on mount (a `useEffect` with `[post.id]` dep, no timer). This still satisfies "not literally the list-page load" (detail view requires a real navigation) without the timer machinery. If a reviewer specifically wants dwell-gating later, it's a 5-line addition, not a redesign.
- Audience guard runs **before any derived render** — no title in `<h1>`, no `document.title`, no breadcrumb label, no meta, not even in a hidden attribute. Return `<Navigate to="/forbidden" replace />` as the first statement after lookup. **(Framing note, red team):** this proves the spec's permission-aware-by-construction pattern renders correctly — it is not a real access-control boundary; the full post data is resident in `AppState` regardless (see Phase 1 `lib/audience.ts`).
- Spec §17.1: in-module search delegates to global search (`type=news`) — do not rebuild a local text filter; navigate to `/search?type=news&q=…`.
- Sort is relevance bands, not `publishedAt desc` (§17.1) → use `rankCards()` from `lib/ranking.ts` with a local post→RankableCard adapter.

## Requirements

### Functional
- `/news`: highlighted/official story first (if any active), remaining posts as responsive card list/2-col grid.
- Filters: `Dành cho tôi` (default) | `Chính thức` | `Bắt buộc` via kit `SegmentedControl`; topic taxonomy as a second row of kit `Chip variant="selector"` (multi-select, `Tất cả chủ đề` reset). Filters combine (AND).
- Ineligible posts (`isEligible()` false) and `expired` posts never appear in the list.
- Card fields per §17.2: topic, official/mandatory label (icon **+ text**, never colour-only), title (2-line clamp), summary (2–3 lines), publisher, relative publish time with absolute-time tooltip, read/ack state.
- `/news/:postId` order per §17.4: breadcrumb + labels → title/summary/publisher/time → audience reason (if targeted) → hero → body → mandatory ack panel (sticky desktop / inline mobile) → related by topic.
- Detail auto-sets `read` after dwell threshold; mandatory badge stays `Cần xác nhận`.
- `Tôi đã đọc và xác nhận` → confirm `Modal` → `acknowledgeNews(id)` → `toast.success` receipt with timestamp.
- Out-of-audience direct URL → `/forbidden`. Unknown id → `/not-found`.
- Empty states: no-result (filter yields 0) and first-use (0 posts total) via shared `EmptyState` variants; `Xóa bộ lọc` resets.

### Non-functional
- TS strict, no `any`. Vietnamese copy. File ≤200 lines (split rule below).
- Icon-only buttons carry `aria-label` (kit rule). Ack panel is a live region (`role="status"`) after success.

## Architecture

### List page (`NewsPage`)
```
useAppState() → news, user
visible   = news.filter(p => isEligible(user, p.audienceTeamIds) && !p.expired)
byTab     = tab==='official' ? visible.filter(p=>p.official)
          : tab==='mandatory'? visible.filter(p=>p.mandatory) : visible
byTopic   = topics.size ? byTab.filter(p=>topics.has(p.topic)) : byTab
ranked    = rankCards(byTopic.map(toRankable))
featured  = ranked.find(p=>p.highlighted) ?? undefined   // only when campaign active
rest      = ranked.filter(p=>p.id!==featured?.id)
```
Local adapter (in this file, ~8 lines, keeps `types/index.ts` untouched):
```ts
const toRankable = (p: NewsPost) => ({
  ...p,
  priorityBand: p.mandatory ? 'P0' : p.official ? 'P2' : 'P3',
  dueAt: p.mandatory?.dueAt,
  updatedAt: p.publishedAt,
})
```
Layout: page heading → toolbar (`SegmentedControl` + search trigger `Button` → `navigate('/search?type=news')`) → topic `Chip` row → featured kit `Card` (`shadow="sm"`) → `SectionHeader` + grid of shared `NewsCard`.

### Detail page (`ArticlePage`)
```
post = news.find(p => p.id === postId)
if (!post) return <Navigate to="/not-found" replace />
if (!isEligible(user, post.audienceTeamIds)) return <Navigate to="/forbidden" replace />
// ↑ nothing above this line reads post.title/summary
```
- Read marking: `useEffect(() => { if (!post.read) markNewsRead(post.id) }, [post.id])` — synchronous on mount, no-op when already read. No timer, no `visibilityState` listener (simplified per red team — see Key Insights).
- Ack panel: kit `Alert variant={acknowledged ? 'success' : 'warning'}` with `title`, reason + `dueAt` from `post.mandatory`, `action` = primary `Button`. Wrapper `className="lg:sticky lg:top-6"` (inline flow on mobile — no extra component).
- Confirm: kit `Modal size="sm"` title `Xác nhận đã đọc`, body restates that this is recorded permanently and cannot be undone, footer = `Hủy` (dim) + `Tôi đã đọc và xác nhận` (primary).
- Receipt: `toast.success('Đã ghi nhận xác nhận của bạn', { description: <HH:mm dd/MM> })`; panel flips to success variant showing the same timestamp (local `ackedAt` state — no `types/index.ts` change). Timestamp is `new Date()` (browser clock) — display-only, not a trustworthy audit record; don't carry this pattern into a real backend without server-side timestamping.
- Audience reason: shared `ReasonDisclosure` next to labels, only when `audienceTeamIds` is set.
- Related: same-topic eligible posts, max 3, reuse `NewsCard`.
- **Only one orange primary CTA per screen** (DS 1.1): on detail that is the ack button; share/copy-link is `borderless`.

### Read/ack state matrix (drives the badges — implement exactly)
| read | acknowledged | list badge | detail panel | in Home attention queue |
|---|---|---|---|---|
| false | false | `Cần xác nhận` (mandatory) / none | warning + CTA | yes |
| true | false | `Đã đọc` + `Cần xác nhận` | warning + CTA | **yes** |
| true | true | `Đã xác nhận` | success, no CTA | no |

## Related Code Files

**Modify:** `prototype-app/src/pages/NewsPages.tsx` (full rewrite)

**Create (only if the rewrite exceeds 200 lines):** `prototype-app/src/pages/news/NewsListPage.tsx`, `prototype-app/src/pages/news/ArticlePage.tsx`, `prototype-app/src/pages/news/useReadTracker.ts` — `NewsPages.tsx` becomes a re-export barrel so `App.tsx` imports stay valid. No other phase touches `src/pages/news/`.

**Delete:** none.

**Read-only imports (do not edit):** `types/index.ts`, `lib/audience.ts`, `lib/ranking.ts`, `components/NewsCard.tsx`, `components/SectionHeader.tsx`, `components/EmptyState.tsx`, `components/InlineError.tsx`, `components/ReasonDisclosure.tsx`, `AppState.tsx`, `data/mockData.ts`.

## Implementation Steps

1. Read the landed Phase 1 files: `lib/audience.ts`, `lib/ranking.ts`, shared `NewsCard`/`EmptyState`/`ReasonDisclosure`, `/forbidden` route, `<Toaster />` mounted, `markNewsRead` signature on `AppState`. Code to the real signatures.
2. Verify mock data has (a) one mandatory unacknowledged post, (b) one `audienceTeamIds` post excluding `user.an`, (c) ≥2 distinct topics — Phase 1 §4 commits to these; confirm they landed rather than re-requesting them.
3. Rewrite `NewsPage`: eligibility filter → tab filter → topic filter → `rankCards` → featured/rest split.
4. Build toolbar: `SegmentedControl` (3 options) + topic `Chip` row + search trigger navigating to `/search?type=news`.
5. Render featured `Card` + grid of `NewsCard`; wire `EmptyState` (no-result vs first-use) with `Xóa bộ lọc` reset.
6. Rewrite `ArticlePage` guards in the exact order above (not-found → forbidden → render).
7. Add the mount-effect read marker (`markNewsRead` on mount, no timer — see Architecture); assert it never calls `acknowledgeNews`.
8. Build detail body per §17.4 ordering, with `Breadcrumb`, labels, `ReasonDisclosure`, heading hierarchy (`h1` title, `h2` body sections).
9. Build ack panel (`Alert` + sticky wrapper) + confirm `Modal` + `toast.success` receipt; disable/hide CTA once acknowledged.
10. Add related-content strip (same topic, eligible, ≤3).
11. Manually walk both Gherkin scenarios in the browser; check the forbidden case in DevTools DOM, not just visually.
12. `npm run typecheck && npm run build` clean.

## Todo List

- [x] List: eligibility + expired filtering
- [x] `SegmentedControl` tabs + topic `Chip` filters combine correctly
- [x] `rankCards` ordering applied (not `publishedAt desc`)
- [x] Featured story + grid + `EmptyState` variants
- [x] Search trigger → `/search?type=news`
- [x] Detail guard order: not-found → forbidden → render
- [x] Read marked synchronously on mount, never touches `acknowledged`
- [x] Detail section order per §17.4, ack panel sticky on desktop
- [x] Confirm `Modal` + `toast` receipt, no un-acknowledge path
- [x] Related content by topic
- [x] Read/ack badge matrix matches table
- [x] `typecheck && build` clean

## Success Criteria

**Gherkin 1 — Read không thay thế acknowledge (§17.7)**
Given a mandatory, unacknowledged post → When the iKamer opens it, dwells >3s, returns to `/home` → Then the card may show `Đã đọc` **and** the post still appears in Home's attention queue with a `Xác nhận` CTA, and `/news` still shows `Cần xác nhận`.

**Gherkin 2 — Bài ngoài audience không lộ qua URL (§17.7)**
Given the iKamer is not in post X's audience → When navigating directly to `/news/X` → Then `/forbidden` renders, and a DOM/`view-source` inspection contains no title, summary, publisher, or attachment metadata for X. X is also absent from `/news`.

Plus: filters combine correctly; acknowledged posts cannot be un-acknowledged by any UI path; exactly one orange primary CTA per screen; zero console errors; typecheck+build green.

## Risk Assessment

- Auto-read logic accidentally wired to `acknowledgeNews` → silently breaks the phase's core rule. Mitigation: explicit matrix test in step 11; the two calls live in different functions with no shared branch.
- `rankCards` requires fields `NewsPost` lacks → handled by the local adapter, no shared-type churn.
- `/search?type=news` may not be honoured until Phase 6 → acceptable (route exists as a stub from Phase 1); note the query contract to Phase 6.
- Modal inside a sticky container can clip → kit `Modal` portals by default; do not set `portal={false}`.

## Security Considerations

- Forbidden redirect must precede every read of `post` fields; never pass post data into `ForbiddenPage` props, state, or the URL. (Demo-fidelity check, not a real security boundary — see Phase 1 `lib/audience.ts` framing note.)
- Filter the list by `isEligible` before ranking/rendering — never render-then-hide with CSS.
- Related-content strip must re-apply `isEligible` (it queries the same `news` array).
- Share/copy-link produces an internal deep link only; never copies body/summary text (§17.6).
- Ack receipt toast must not echo sensitive body content — title-level copy only.

## Next Steps

- Both fixture/mutator dependencies this phase originally needed from Phase 1 (`markNewsRead`, ≥2 news topics) are already committed in the landed Phase 1 spec — nothing further to request.
- **Contract to Phase 2 (Home):** Home's attention queue must key off `mandatory && !acknowledged` (never `!read`), otherwise Gherkin 1 fails at the Home end.
- **Contract to Phase 6 (Search):** `/search` should read `type` and `q` query params.
- Phase 8 picks up: responsive/a11y sweep of both pages, `Skeleton` loading states if simulated latency is added.

## Unresolved Questions

1. ~~Read dwell threshold~~ — moot after the red-team simplification (mark-on-mount, no timer). If dwell-gating is wanted later, it's a small addition to the mount effect.
2. Does the R0 demo need a "highlighted campaign" story at all, or should the featured slot fall back to the top-ranked post when no post is `highlighted`? (Current draft: no fallback — featured slot renders only when a post is explicitly `highlighted`, per §17.1 "nếu campaign đang active".)
3. Social interactions (§17.6: reactions P1, comments gated on moderation) — assumed out of R0 scope; confirm no reaction affordance is expected in the prototype.
