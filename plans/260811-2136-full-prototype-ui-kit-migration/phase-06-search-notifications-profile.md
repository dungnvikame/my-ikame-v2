# Phase 6 — Search, Notification Center, Profile

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-and-ui-kit-migration.md) (shared contracts, owns `types/index.ts`, `AppState.tsx`, `AppShell.tsx`, `lib/audience.ts`, and the two stub pages this phase fleshes out)
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — Input, SegmentedControl-adjacent Chip/Tabs, Badge, Switch, Alert
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — Skeleton, Toast, Card, ScrollArea
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md) — current `SearchPage.tsx` (41 lines), AppState mutators
- Spec: §19.1 IA (tabs Tất cả/Cần làm/Đã đọc, group by day), §19.2 priority policy, §19.3 preference rules, §20.1 Global Search R1, §20.3 result ranking

## Overview

- **Priority:** P2 — runs in parallel with phases 2–5/7 after Phase 1 lands.
- **Status:** Pending. **Effort:** 3h.
- Rewrite `/search` as a real typeahead page; turn `/notifications` and `/profile` stubs into working pages. All client-side over existing mock arrays — no search index, no persistence.

## Key Insights

- Search is a **client-side filter over `news`/`events` from `AppState`**, not a service. But spec §20.3 rule 1 still applies in the prototype: run `isEligible(user, item.audienceTeamIds)` **before** matching, so an out-of-audience post can never appear even as a title in results (same leak rule as `/forbidden`).
- `NotificationItem.time` is a **human-relative string** ("8 phút trước", "Hôm qua"), not ISO — grouping "by day" (§19.1) must be derived from that string with a local `dayBucket()` helper (Hôm nay / Hôm qua / Trước đó). Do not add a date field to the shared type (Phase-1 owned); see Next Steps.
- `NotificationItem` has no `actor`/`source` field, so the §19.1 card anatomy is mapped as: message=`title`, reason=`body`, source=priority `Badge`, time=`time`, read-state=dot + surface tone, primary action=link to `href`. Deliberate reduction, flagged as a dependency.
- "Cần làm" has no business-state field to key off (`acknowledged`/RSVP live on News/Event, not on the notification). Define it as `priority ∈ {critical, required} && !read`. Marking read must NOT touch business state (§19.1 explicit) — `markNotificationRead` already only flips `read`, so reuse it verbatim.
- Profile has **no spec section**. This is a deliberate scope-fill to make the avatar link in the shell land somewhere real, not an attempt to spec the feature. Keep it to 3 blocks; do not invent preference/notification settings UI (§19.3 preferences are R1+).

## Requirements

### Functional
- `/search`: typeahead fires at **≥2 chars**, debounced 250ms; results grouped News / Sự kiện with per-group counts; type filter (Tất cả / Tin tức / Sự kiện); recent searches (session-only) shown when query empty; zero-result state with suggestion copy + one-click broader-term chips; match highlight in title that never alters the title text itself.
- `/notifications`: 3 tabs with live counts; within a tab, items grouped by day bucket then by `groupKey` when present; per-item click marks read + navigates; "Đánh dấu tất cả đã đọc" with Toast confirm; empty state per tab.
- `/profile`: current user (name, role, team, perspective + available perspectives), theme toggle (`useDarkMode`), disabled "Đăng xuất" button with an explanatory caption ("Prototype — chưa kết nối SSO").

### Non-functional
- Kit components only; no new CSS files, no new npm deps. TS strict, no `any`.
- Each page file ≤200 lines (repo convention); extract local sub-components inside the same file, not new shared files (ownership).
- Zero mutation of shared state beyond existing `markNotificationRead` / `markAllNotificationsRead`.

## Architecture

### SearchPage
```
query (raw)  --250ms debounce-->  applied (>=2 chars)
applied + typeFilter  -->  useMemo:
   news  = news.filter(isEligible).filter(matches)
   events= events.filter(isEligible).filter(matches)
```
- Match: normalize both sides with `toLocaleLowerCase('vi')`, test against `title + summary` (+ `topic` for news, `location`/`organizer` for events).
- `pending = query !== applied && query.length >= 2` → render 3 kit `Skeleton` rows instead of results (gives the typeahead visible latency without faking a network).
- Recent searches: local `useState<string[]>` (max 5, dedup, most-recent-first), pushed on debounce commit. **No localStorage** — matches AppState's no-persistence convention and sidesteps §20.1's "privacy policy" storage question in a prototype.
- Highlight: `highlight(text, term)` returns `ReactNode[]` splitting on the first case-insensitive occurrence and wrapping it in `<mark>`; falls back to plain text when term absent. Title characters are never dropped or re-cased.
- Result row = kit `Card` (`hoverable`) wrapped in react-router `Link`, with type icon, `Badge`(Chính thức / format), title (highlighted), meta line.
- Zero-result: shared `EmptyState` (variant `no-result`) + suggestion text + 3 `Chip`s of broad terms that set the query.

### NotificationsPage
- `Tabs` (kit, `items[]`, variant `underline`): `all` / `todo` / `read`, labels carry counts (`Cần làm (2)`).
- Filters: `all` = everything; `todo` = `(priority==='critical'||priority==='required') && !read`; `read` = `read`.
- Grouping: `dayBucket(time)` → `'Hôm nay' | 'Hôm qua' | 'Trước đó'` (matches `/phút|giờ/` → Hôm nay; `/Hôm qua/` → Hôm qua; else Trước đó). Within a bucket, consecutive items sharing `groupKey` render under one sub-heading with a count ("3 cập nhật về iConnect"), collapsed via kit `Accordion type="single" collapsible` only when the group has >2 items.
- Priority → `Badge`: critical=`error`, required=`warning`, transactional=`info`, informational=`default`.
- Header: title + unread total + "Đánh dấu tất cả đã đọc" (kit `Button variant` non-primary — the page's single primary CTA budget is spent on nothing, per Core DS one-primary rule) → `markAllNotificationsRead()` + `toast.success('Đã đánh dấu tất cả là đã đọc')`.
- Export `NotificationList` from this file so the AppShell drawer can render the same rows in compact mode (`compact` prop: hides day headings, caps at 5). Wiring the import into `AppShell.tsx` is Phase-1/8 work — see Next Steps.

### ProfilePage
- Three kit `Card`s: (1) identity — `Avatar` (initials fallback) + name/role/team + `Badge` per perspective in `availablePerspectives`, current one filled; (2) hiển thị — `Switch label="Chế độ tối"` bound to `useDarkMode()`; (3) phiên — disabled `Button` "Đăng xuất" + caption. No editable fields.

## Related Code Files

**Modify:** `prototype-app/src/pages/SearchPage.tsx` (full rewrite), `prototype-app/src/pages/NotificationsPage.tsx` (replace Phase-1 stub), `prototype-app/src/pages/ProfilePage.tsx` (replace Phase-1 stub)

**Create:** none.

**Delete:** none.

**Read-only deps (do not edit):** `types/index.ts`, `AppState.tsx`, `lib/audience.ts`, `components/EmptyState.tsx`, `components/SectionHeader.tsx`, `data/mockData.ts`, `App.tsx`, `AppShell.tsx`.

## Implementation Steps

1. Confirm Phase 1 landed: `NotificationItem.priority` includes `'critical'`, `groupKey?` exists, `lib/audience.ts` exports `isEligible`, stubs for Notifications/Profile exist, `Toaster` + `TooltipProvider` mounted.
2. **SearchPage** — scaffold: kit `Input size="l" leftIcon={<Search/>}` + `SegmentedControl` type filter; local `query`/`applied` state with a `useEffect` + `setTimeout(250)` debounce (clear timer on cleanup).
3. Add `useMemo` result computation: eligibility filter → text match → grouped `{news, events}` respecting the type filter.
4. Add `highlight()` helper + result row sub-component; render grouped sections with `SectionHeader` (title + count).
5. Add the three states: idle (recent searches + suggestion chips), pending (`Skeleton` rows), zero-result (`EmptyState` + suggestion chips). Query of 1 char = idle state, not zero-result.
6. Push committed queries into `recent` (dedup, cap 5); clicking a recent chip sets the query.
7. **NotificationsPage** — build `NotificationRow` (Badge/message/reason/time/unread dot/`Link` to href, `onClick` → `markNotificationRead(id)`).
8. Build `NotificationList` (exported): takes `items` + optional `compact`; applies `dayBucket` grouping and `groupKey` sub-grouping.
9. Build the page: header + mark-all button + `Tabs` with the 3 filtered lists; each tab renders `EmptyState` when its list is empty (distinct copy per tab — "Không có việc cần làm" vs "Chưa có thông báo nào đã đọc").
10. **ProfilePage** — three cards per Architecture; bind `Switch` to `useDarkMode()`; disabled sign-out.
11. Verify a11y: search `Input` has `aria-label`, tabs keyboard-navigable (kit default), unread dot has text alternative (`<span className="sr-only">Chưa đọc</span>`), icon-only buttons have `aria-label`.
12. `npm run typecheck && npm run build`; manual pass at `/search`, `/notifications`, `/profile` in both themes.

## Todo List

- [ ] SearchPage rewritten: debounced ≥2-char typeahead, eligibility-filtered
- [ ] Grouped News/Event results with counts + non-destructive match highlight
- [ ] Type filter (Tất cả/Tin tức/Sự kiện) working
- [ ] Idle (recent + suggestions), pending (Skeleton), zero-result states all render
- [ ] NotificationsPage: 3 tabs with counts, correct `todo` predicate
- [ ] Day-bucket grouping + `groupKey` sub-grouping
- [ ] Mark-read on click, mark-all-read + Toast, per-tab empty states
- [ ] `NotificationList` exported with `compact` mode for the shell drawer
- [ ] ProfilePage: identity card, dark-mode Switch, disabled sign-out + caption
- [ ] a11y pass (labels, sr-only unread text)
- [ ] `npm run typecheck && npm run build` clean

## Success Criteria

- Typing 1 char shows no results panel; 2+ chars shows results after ~250ms with at most one render of stale results.
- An out-of-audience news/event fixture (added by Phase 1) **never** appears in search results for `person_an` — verified by searching its exact title.
- Nonsense query renders zero-result state with suggestion chips, not a blank area.
- Tab counts equal rendered row counts; marking one item read moves it between Cần làm/Đã đọc and decrements the shell's `NotiBadge`.
- Mark-all-read leaves every `acknowledged`/`registered` flag unchanged (check a mandatory news item stays un-acknowledged).
- `/profile` dark-mode switch flips the whole app and survives a route change.
- No file in this phase exceeds 200 lines.

## Risk Assessment

- **`dayBucket` string parsing is brittle** if mock `time` copy changes (e.g. "2 ngày trước"). Mitigate: default branch is `Trước đó`, so unknown strings degrade gracefully instead of throwing; keep the matcher to 2 regexes.
- **Drawer/page duplication** — if Phase 1's drawer body ships its own list markup, we end up with two renderers (DRY break). Mitigate: export `NotificationList` and flag the wiring in Next Steps; do not silently fork the markup.
- **Highlight vs. Vietnamese diacritics** — `toLocaleLowerCase('vi')` matching is fine, but do NOT strip diacritics for matching, since re-inserting them into the highlighted title would alter the title (§20.1 forbids meaning-changing highlight). Accept that "bao mat" won't match "bảo mật" in the prototype.
- **Tabs + Accordion nesting** — kit `Accordion` inside `Tabs` content is untested here; if it misbehaves, drop the collapse and render grouped items flat with a count heading (grouping is the requirement, collapsing is not).

## Security Considerations

- Eligibility filter runs **before** the text match and before any result object reaches render — no ineligible title/summary in the DOM, matching the `/forbidden` no-leak rule from Phase 1.
- Recent searches stay in memory only — nothing written to localStorage/sessionStorage, so no query history survives a refresh (§20.1 privacy note, and §19.3's "no sensitive detail in previews" spirit).
- Notification rows render only `title`/`body` from the fixture; no ids, hrefs of ineligible resources, or debug payloads in the DOM.

## Next Steps

**Dependencies on Phase 1 (raise before starting if missing):**
- `NotificationItem.priority` must include `'critical'` and the type must carry `groupKey?` — the tabs and grouping depend on both.
- At least one `groupKey`-shared notification pair + one `critical` notification in `mockData.ts`, otherwise grouping and the critical Badge are unexercised.
- Ideally add `receivedAt` (ISO) to `NotificationItem` so day grouping is data-driven; if Phase 1 declines, `dayBucket()` string parsing stands (documented above).
- Optional: `actor`/`source` field on `NotificationItem` to satisfy the full §19.1 card anatomy.

**Hand-offs:**
- Phase 8 (hardening) wires `NotificationList compact` from `pages/NotificationsPage.tsx` into `AppShell.tsx`'s drawer body, and may relocate it to `components/NotificationList.tsx` if any third consumer appears.
- Phase 8 also adds `/search`, `/notifications`, `/profile` to `scripts/visual-check.mjs` targets.

## Unresolved Questions

1. Should "Cần làm" keep showing a critical/required item **after** it's read but before its business action (ack/RSVP) is done? Current definition drops it on read — arguably wrong per §19.1's "mark read ≠ done", but the notification fixture has no link to business state. Resolve by adding `actionState?: 'pending' | 'done'` to `NotificationItem` (Phase-1 change) if the reviewer disagrees.
2. §20.1 lists topic/date/source filters; this phase ships only the type filter. Enough for R0 IA validation, or does the topic filter need to land now?
3. Profile scope-fill: is a read-only identity card acceptable, or should it deep-link to HRIS (spec's "gate not god-app" pattern would suggest an external link stub)?
