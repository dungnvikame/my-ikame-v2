# Phase 3 — Events Upgrade: Hero Countdown, 6-Month Timeline, Tabs, Detail Agenda

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-shared-surface.md) (`startsAt`, `agenda`, `participantNames`, `closingSoon`, `featured`, +4 events) · [brainstorm §3](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md)
- Read before coding: current `src/pages/EventPages.tsx` (RSVP state machine, waitlist, .ics), `src/components/ContentCards.tsx` (EventCard), `src/AppState.tsx` (`setEventRegistration`)

## Overview

- **Priority:** P1. **Effort:** 1d. **Status:** pending. **Parallel with 2, 4, 5.**
- Rebuild `/events` list into an overview surface (hero + timeline + stats + tabs) and enrich `/events/:eventId` (hero, countdown, agenda, participants, related) **without changing the RSVP/waitlist/.ics behavior that already works.**

## Key Insights

- **PRESERVE the v1 state machine.** Registration, waitlist, capacity math, cancelled/past handling, and the .ics download all stay byte-for-byte behavior-identical; this phase is presentation + navigation only. Any RSVP logic change is a regression.
- **(F3) `ai-product-workshop` is reserved for the A4 execute script** — do not auto-register, do not use it as the hero (`featured` is on `iconnect-2026-08`).
- Countdown must never show negative time: `startsAt` in the past → "Đang diễn ra" (within event window heuristic: <3h past) else "Đã diễn ra". `prefers-reduced-motion` → render static "còn N ngày · HH:MM" with no per-second tick (and clear the interval).
- Timeline insight line is **computed** ("Tháng 9 dày nhất với 2 sự kiện") — never a hardcoded month; fixture edits must not silently make it false.
- Tab/grouping logic derives from live `events`; empty tabs get a real `EmptyState`, not a blank area (owner will click every tab).

## Requirements

### Functional — `/events` (EventsPage)
1. **Hero** for `events.find(e => e.featured)` (fallback: nearest upcoming): cover pattern, title, dateLabel/time/location/format, live **countdown** (ngày · giờ · phút · giây), participant avatar row (`participantNames`, max 5 + "+N"), capacity/status line, primary CTA reusing the existing registration handler.
2. **Timeline strip, 6 months** from current month: month columns, one emoji dot per event (emoji derived from a small `formatEmoji` map by event id/format), **HÔM NAY** marker positioned by today's month/day, insight line computed from counts. Click a dot → `scrollIntoView` the matching card in the list below (+ brief `is-highlighted` outline, reduced-motion safe).
3. **3 live stat cards**: *Sự kiện tháng này* (count by `startsAt` month) · *Bạn sẽ tham gia* (`myRegistration === 'going'` upcoming) · *Sắp hết hạn đăng ký* (`closingSoon && status === 'open'`, tooltip/sub-line = `registrationDeadlineLabel`).
4. **Tabs**: `Sắp diễn ra` / `Đang diễn ra` / `Đã diễn ra` / `Của tôi`. Upcoming tab groups into `TUẦN NÀY` / `SẮP TỚI`. `Của tôi` = going + waitlisted.
5. **Event card (upgraded)**: date block, title, format/location, participant avatars, capacity bar (`31/60 chỗ` — bar = `(capacity-remaining)/capacity`), registration status pill, `closingSoon` warning pill. Keep cancelled/past visual treatments from v1.

### Functional — `/events/:eventId` (EventDetailPage)
6. Hero (cover + title + meta) + countdown + existing RSVP/waitlist controls + .ics button, unchanged in behavior.
7. **Agenda** section from `agenda` (time · title · speaker) with a rail-style timeline; hidden when absent.
8. **Người tham gia**: avatar grid from `participantNames` + "N người đã đăng ký".
9. **Sự kiện liên quan**: 2-3 other upcoming events (same format, else nearest by date), reusing the upgraded card.
10. Audience-ineligible / not-found behavior unchanged (existing guards).

### Non-functional
- One `setInterval(1000)` per mounted countdown, cleared on unmount; skipped entirely under reduced-motion.
- Timeline strip horizontally scrollable on mobile; stat cards wrap 3→1.
- All new classes prefixed `events-v2-` / `evt-` in `events-v2.css` only.

## Architecture

```
src/pages/EventPages.tsx           // EventsPage + EventDetailPage — orchestration only (<200 lines)
src/pages/events/EventHero.tsx     // cover + meta + countdown + CTA (shared by list & detail)
src/pages/events/EventCountdown.tsx// useCountdown hook + display; reduced-motion aware
src/pages/events/EventTimeline.tsx // 6-month strip + insight
src/pages/events/EventStats.tsx    // 3 live stat cards
src/pages/events/EventCardV2.tsx   // upgraded card (avatars + capacity bar)
src/pages/events/EventAgenda.tsx   // agenda + participants (detail only)
src/styles/events-v2.css
```

```ts
// EventCountdown.tsx
function useCountdown(startsAt?: string) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reduced → compute once; else setInterval 1000. Returns
  // { state: 'upcoming'|'live'|'past', days, hours, minutes, seconds }
}
```
Local date helpers live in `src/pages/events/event-dates.ts` (`parseStartsAt`, `daysUntil`, `monthKey`, `isThisWeek`) — Phase-3-owned; do not import from other phases' folders.

## Related Code Files

**Modify:** `src/pages/EventPages.tsx`, `src/styles/events-v2.css`
**Create:** `src/pages/events/{EventHero,EventCountdown,EventTimeline,EventStats,EventCardV2,EventAgenda}.tsx`, `src/pages/events/event-dates.ts`
**Must NOT touch:** `components/ContentCards.tsx` (HomePage/other pages still consume `EventCard` — leave it; `EventCardV2` is additive), `AppState.tsx`, `mockData.ts`, `types/index.ts`, `app.css`.

## Implementation Steps

1. `event-dates.ts` + `EventCountdown` (verify all three states with a temporarily edited local clock, then revert).
2. `EventCardV2` + capacity bar + avatars.
3. `EventStats` (3 live counts) and `EventTimeline` (+ computed insight, HÔM NAY marker, dot→scroll).
4. `EventHero` (list + detail reuse).
5. Rewire `EventsPage`: hero → stats → timeline → tabs → grouped lists (existing RSVP handlers untouched).
6. `EventDetailPage`: hero + countdown + agenda + participants + related; keep guards/.ics.
7. Dark + 1024px + mobile pass; verify RSVP on `global-webinar-us` (register) and `design-sprint-full` (waitlist) still work and that `ai-product-workshop` remains `not_registered`.
8. `npm run typecheck && npm run build`; commit `feat(events): overview hero, countdown, 6-month timeline, tabs and richer detail`.

## Todo List

- [ ] Countdown hook: upcoming/live/past, reduced-motion static, interval cleanup
- [ ] Hero (featured `iconnect-2026-08`) with avatars + capacity + CTA
- [ ] 6-month timeline strip, HÔM NAY marker, computed insight, dot→scroll+highlight
- [ ] 3 live stat cards (month count · đang tham gia · sắp hết hạn)
- [ ] Tabs 4 + TUẦN NÀY/SẮP TỚI grouping + EmptyState per tab
- [ ] EventCardV2 avatars + capacity bar + closingSoon pill; cancelled/past treatments preserved
- [ ] Detail: agenda, participants, related events; RSVP/waitlist/.ics behavior unchanged
- [ ] `ai-product-workshop` untouched by any new flow (F3)
- [ ] typecheck + build green; committed

## Success Criteria

- Every tab renders something meaningful; timeline insight matches the fixtures.
- Countdown ticks in the hero and detail, and degrades correctly for past/cancelled events.
- v1 RSVP golden path still passes: register `global-webinar-us`, waitlist `design-sprint-full`, cancel back to `not_registered`, .ics downloads.

## Risk Assessment

- **Regressing the RSVP machine while restyling** → do not refactor the handlers; wrap them. Smoke all 3 RSVP transitions before commit.
- **Fixture dates drift past demo day** → countdown/timeline handle past gracefully; note in Phase 6 smoke checklist that `startsAt` values may need a bump if the demo slips beyond Aug 2026.
- **Timeline overflow at 1024px** → horizontal scroll with fade edges; verify.
- **Duplicated date helpers with other phases** → accepted (ownership isolation beats DRY here); Phase 6 may consolidate if trivial.

## Security Considerations

None new; mock-only. `joinUrl` links keep `rel="noreferrer"` if rendered as anchors.

## Next Steps

Phase 6 adds the `/events` A2 chip ("Tuần này nên tham gia gì?") reading live registrations; the A4 workshop script stays as-is.
