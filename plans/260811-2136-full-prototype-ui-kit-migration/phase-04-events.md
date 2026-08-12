# Phase 4 — Events (`/events`, `/events/:eventId`)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-and-ui-kit-migration.md) (shared types, `lib/audience.ts`, `EventCard`, `EmptyState`, `InlineError`, `ReasonDisclosure`, `ForbiddenPage`)
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — Modal, Tabs, Badge, Alert, Chip
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — Toast, Progress, Card, Spinner, Steps
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md)
- Spec `My-iKame-Product-Spec-v0.2.md` §18.1–§18.7 (list/calendar, card fields, detail order, RSVP state machine, lifecycle, notification policy, acceptance criteria)
- File replaced: `prototype-app/src/pages/EventPages.tsx` (101 lines, hand-rolled CSS, boolean `registered` only)

## Overview

- **Priority:** P1. **Status:** Pending. **Effort:** 4h. **Depends on:** Phase 1 (hard).
- Rebuild the events list (3 tabs) and event detail (full §18.3 order) on ui-kit primitives; implement the RSVP state machine (`not_registered → going | waitlisted → cancel`), a double-click-safe RSVP action, dual-timezone display, distinct cancelled/full/waitlist states, client-side .ics download, and the `/forbidden` audience guard.

## Key Insights

- Current page models RSVP as one boolean → cannot express `waitlisted`. Phase 1's `myRegistration` union (3 values: `not_registered`/`going`/`waitlisted`) is the source of truth; drop `event.registered` entirely. Event-level cancellation is a *separate* concept on `EventItem.status === 'cancelled'` — never on `myRegistration` (red team caught a contradiction in an earlier draft that had both; resolved in Phase 1's type now).
- **(Red team simplification) Drop the manufactured race.** An earlier draft added a `useRef` lock + idempotency key + an artificial `sleep(400)` specifically so the double-click race would be "real and testable" — but there's no server, so the race was invented by the plan itself purely to give the guard code something to guard against. A plain `pending` boolean disabling the button during the (now much shorter, or removed) async gap delivers the same visible outcome — one registration, one toast — for a fraction of the code and zero manufactured-latency ceremony. See Architecture §3 (simplified) and Success Criteria (Gherkin 1 reworded accordingly).
- Timezone display needs a real instant, not the mock's `dateLabel`/`time` display strings → Phase 1's `EventItem.startsAt`/`endsAt` are now REQUIRED ISO fields with no fallback path (Phase 1 §3 type comment is explicit: missing timestamps are a blocker to report, not something this phase papers over). `Intl.DateTimeFormat` with `timeZone` does the conversion — no date library.
- .ics generation is pure string building + `Blob` + anchor click. No server, no dependency — correct call for a mock prototype. **(Red team simplification)** full RFC 5545 escaping/line-folding rigor is calendar-interop engineering nobody will stress-test in a demo; ship a minimal working VEVENT (see Architecture §1, simplified) and skip the escaping edge cases.
- **Deliberate deviations (not oversights):** (a) kit `Steps` is skipped — R0 RSVP is a single action, a 4-step wizard would be theatre (YAGNI); (b) desktop month calendar is skipped — spec §18.1 says MAY, list is the required view; (c) filters beyond the 3 tabs (format/location/taxonomy) skipped for R0 prototype scope.

## Requirements

### Functional
- `/events`: kit `Tabs` — `Sắp tới` / `Đã đăng ký` / `Đã qua`. Ineligible-audience events never appear in any tab.
- Event cards show all §18.2 fields available in mock data: title, time in user tz, location/platform, format, organizer, RSVP state, capacity/remaining (when present), audience reason (`ReasonDisclosure`), status badge.
- Today's event or RSVP-closing-soon gets priority treatment (§18.1) — leading `Badge` + first sort position.
- `/events/:eventId` renders sections in §18.3 order 1–9.
- RSVP transitions (§18.4): NotRegistered→Going; NotRegistered→Waitlisted (full + `waitlistEnabled`); Going→NotRegistered; Waitlisted→NotRegistered. Going+past → display `Đã tham gia` (Attended). Not implemented: seat-available promotion, check-in (no backend actor).
- Double-click on RSVP creates exactly one registration; UI shows `Đã đăng ký` once (§18.7 scenario 1).
- Detail shows time in **user timezone** primarily, with event's own timezone visible (§18.7 scenario 2).
- `cancelled` / `full` / `waitlisted` render visually distinct and disable the wrong actions.
- Add-to-calendar downloads a valid `.ics` (opens in Apple Calendar / Google Calendar import).
- Direct URL to an out-of-audience event → `<Navigate to="/forbidden" replace />`, no title/summary rendered or passed.

### Non-functional
- `EventPages.tsx` ≤ 200 lines — split detail sub-blocks into local components in the same file only if it stays under; otherwise extract `EventDetailPage` is NOT allowed to create new page files (ownership) → keep markup terse.
- TS strict, no `any`. `lib/ics.ts` is a pure function (no React import) so it stays unit-testable later.

## Architecture

### 1. `lib/ics.ts` (new, ~30 lines — simplified per red team, was ~60)
```ts
export interface IcsInput {
  uid: string; title: string; description?: string; location?: string
  startsAt: string; endsAt: string; timezone: string   // ISO w/ offset + IANA tz
}
export function buildIcs(input: IcsInput): string
export function downloadIcs(filename: string, ics: string): void
```
- `buildIcs`: `BEGIN:VCALENDAR/VERSION:2.0/PRODID:-//My iKame//Prototype//VI` → `VEVENT` with `UID`, `DTSTAMP`, `DTSTART`/`DTEND` as UTC basic format (`YYYYMMDDTHHMMSSZ`), `SUMMARY`, `DESCRIPTION`, `LOCATION`, `STATUS:CONFIRMED`. CRLF line endings.
- **(Simplified, red team)** No RFC 5545 escaping, no line-folding handling — mock titles/locations are short, developer-controlled strings with no `;`/`,`/newline in practice. If a future real-data path needs this, it's a self-contained addition to this one function, not a redesign. Manual test: download one file, open it once in a calendar app to confirm the date/title round-trip — not a hardened interop test suite.
- `downloadIcs`: `new Blob([ics], { type: 'text/calendar;charset=utf-8' })` → `URL.createObjectURL` → hidden `<a download>` → `click()` → `URL.revokeObjectURL` in a `setTimeout(…, 0)`.

### 2. Timezone helpers (local to `EventPages.tsx`, ~15 lines)
```ts
const fmt = (iso: string, tz: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short', timeZone: tz }).format(new Date(iso))
```
- Detail renders: primary line = user tz (`user.timezone`) + `timeZoneName: 'short'`; secondary muted line = `Giờ gốc sự kiện: … ({event.timezone})`. If `user.timezone === event.timezone`, render one line with the tz label appended (no redundant duplicate).
- Cards render user-tz short form only.

### 3. RSVP action (detail page) — simplified per red team (was a `lockRef`+`doneKeyRef`+manufactured-latency guard)
```ts
const [pending, setPending] = useState(false)  // drives disabled + Spinner
```
Handler: `if (pending) return` → `setPending(true)` → call the `AppState` setter synchronously (no artificial delay — there's no server round-trip to simulate) → `toast.success(...)` → `finally { setPending(false) }`. `pending` is set synchronously before any `await`, so a second click in the same tick sees `pending === true` and returns — this is enough for a single-user client demo. **Known, documented limitation:** this does not guard across browser tabs/reloads (no cross-tab coordination exists or is needed here — there's no shared server state to corrupt).
- Cancel (Going→NotRegistered) goes through a kit `Modal` confirm (`title="Hủy đăng ký?"`, footer = Huỷ/Xác nhận). Register does not (one primary CTA, low-friction).
- Receipts via kit `toast.success` / `toast.error` — replaces the inline `receipt` string state (§18.6 "RSVP success → transactional, ngay"). Toast text may include a timestamp; it's `new Date()` (browser clock), display-only, not an audit record.

### 4. State rendering matrix (detail RSVP panel)
| event.status | myRegistration | Panel |
|---|---|---|
| open | not_registered | `Đăng ký tham gia` (primary) |
| open/going | going | success `Alert` + `Hủy đăng ký` (dim) + `Thêm vào lịch` |
| full | not_registered, `waitlistEnabled` | warning `Alert` + `Vào danh sách chờ` |
| full | not_registered, no waitlist | warning `Alert`, CTA disabled |
| full/open | waitlisted | info `Alert` "Bạn đang ở danh sách chờ, vị trí sẽ được thông báo" + `Rời danh sách chờ` |
| cancelled | any | error `Alert` "Sự kiện đã bị huỷ" — no RSVP CTA, no calendar CTA |
| past | going | `Đã tham gia` `Badge` + recap/survey block (§18.3.9), no RSVP CTA |
| past | not_registered | muted `Đã kết thúc`, no CTA |

- Capacity block (§18.3.7): kit `Progress` `value={capacity - remaining}` `max={capacity}` + `showLabel` + `Còn N/M chỗ`; rendered only when `capacity != null`.
- Join link (§18.3.3): online/hybrid meeting URL revealed **only** when `myRegistration === 'going'`; otherwise "Link tham gia sẽ hiển thị sau khi bạn đăng ký".

### 5. List page
- `useMemo` pipeline: `events.filter(e => isEligible(user, e.audienceTeamIds))` → tab filter → priority sort (today/closing-soon first, then `startsAt` asc; `Đã qua` sorts desc).
- Tab predicates: `upcoming` = `status !== 'past'` (cancelled stays, rendered muted with `Đã huỷ` badge — a registered user must still see it); `registered` = `myRegistration === 'going' || 'waitlisted'`; `past` = `status === 'past'`.
- Empty per tab via shared `EmptyState` (`variant="filtered"` for registered/past, `"first-use"` for upcoming) with copy per tab.
- Toolbar: `Múi giờ hiển thị: {user.timezone}` note + count.

## Related Code Files

**Modify:** `prototype-app/src/pages/EventPages.tsx` (full rewrite)
**Create:** `prototype-app/src/lib/ics.ts`
**Delete:** none

**Read-only (Phase-1 owned, do not edit):** `types/index.ts`, `AppState.tsx`, `App.tsx`, `data/mockData.ts`, `components/EventCard.tsx`, `components/EmptyState.tsx`, `components/InlineError.tsx`, `components/ReasonDisclosure.tsx`, `pages/ForbiddenPage.tsx`, `lib/audience.ts`

## Implementation Steps

1. Read the landed Phase 1 files: `EventItem` (3-value `myRegistration`, `startsAt`/`endsAt`, `timezone`, `capacity/remaining/waitlistEnabled`, `joinUrl`, `audienceTeamIds`), `user.timezone`, `setEventRegistration` on `AppState`. All of these are committed in Phase 1's current spec — if any are actually missing when you read the real file, that's a blocker to report, not something to fall back around (especially `startsAt`/`endsAt` — see Key Insights).
2. Write `lib/ics.ts` (`buildIcs` + `downloadIcs`, simplified — no RFC 5545 escaping). Verify manually: download one file, import into a calendar app once.
3. Rewrite `EventsPage`: kit `Tabs` (`variant="underline"`) with `items[]`; eligibility filter → tab filter → priority sort; render shared `EventCard`; per-tab `EmptyState`; timezone toolbar note.
4. Rewrite `EventDetailPage` skeleton in §18.3 order 1–9 using kit `Card`/`Badge`/`Alert`; guards first: not found → `/not-found`; `!isEligible(...)` → `/forbidden` (**before** any render path that touches `event.title`).
5. Add the dual-timezone block (§18.3.2) with `Intl.DateTimeFormat`, user tz primary, event tz secondary.
6. Implement the RSVP panel state matrix (Architecture §4) incl. `Progress` capacity meter and gated join link.
7. Implement the RSVP handler with the `pending` guard + `toast` receipts (Architecture §3, simplified); wrap cancel in a kit `Modal` confirm.
8. Wire `Thêm vào lịch` → `downloadIcs(slug(event.title) + '.ics', buildIcs(...))`, shown only for `going` on a non-cancelled event.
9. Past-event recap/survey block (§18.3.9) + `Đã tham gia` badge; contact/support block (§18.3.8).
10. `npm run typecheck && npm run build`; then manual acceptance run (Success Criteria).

## Todo List

- [x] `lib/ics.ts` written; generated file imports cleanly into a real calendar app
- [x] `EventsPage` rebuilt on kit `Tabs`, 3 tabs filter correctly
- [x] Ineligible events absent from all tabs
- [x] Priority treatment (today / closing soon) visible + sorted first
- [x] Per-tab `EmptyState` renders
- [x] Detail page follows §18.3 order 1–9
- [x] Dual-timezone display (user primary, event secondary)
- [x] RSVP matrix: open / full+waitlist / full-no-waitlist / waitlisted / cancelled / past all render distinctly
- [x] Double-click RSVP → single registration (Gherkin 1, single-tab scope) verified manually
- [x] Cancel confirm `Modal` + `toast` receipts wired
- [x] Capacity `Progress` meter + gated join link
- [x] Out-of-audience direct URL → `/forbidden`, DOM contains no event title
- [x] `npm run typecheck && npm run build` clean, file ≤ 200 lines

## Success Criteria

- **Gherkin 1 (idempotency, single-tab scope):** rapid double-click `Đăng ký tham gia` → exactly one state transition, `remaining` decrements by exactly 1, one toast, badge reads `Đã đăng ký` once. Verify by clicking twice quickly (or via React DevTools state inspection). Explicitly out of scope: cross-tab/cross-reload coordination — not needed for a single-user client demo.
- **Gherkin 2 (timezone):** with `user.timezone` ≠ `event.timezone` in mock data, detail shows the user-tz time as the headline and the event's original tz on a secondary line.
- Cancelled event: no RSVP CTA, no calendar CTA, error `Alert`, still visible in `Sắp tới`.
- Full event with `waitlistEnabled`: CTA reads `Vào danh sách chờ`; after action, state is `waitlisted` with a leave-waitlist CTA.
- `.ics` downloads and imports with correct title/time/location.
- Direct URL to the audience-scoped-out event → `/forbidden`; page DOM (not just visual) contains no title/summary/id.
- Zero console errors; `npm run build` green.

## Risk Assessment

- **If `startsAt`/`endsAt` are somehow still missing when this phase starts** (shouldn't happen — Phase 1 §4 commits every event fixture to real ISO timestamps) → this is a stop-and-report blocker, not a fallback to build. A parser guessing an offset from `day`/`month`/`time` would defeat the exact Gherkin 2 timezone-difference test it would exist to pass — red team caught an earlier draft doing exactly this.
- **`pending`-boolean guard is a single-tab, single-session simplification** (see Key Insights) — do not over-build this into cross-tab-safe machinery; nothing in this prototype needs that.
- **Kit `Tabs` unmounts inactive content** → per-tab scroll/state loss. Acceptable for R0; do not add memoization complexity.
- **`Intl` timezone name output varies by browser/ICU** — do not assert exact strings in any later automated check; assert the tz identifier text we render ourselves.

## Security Considerations

- Eligibility guard runs **before** render, not inside a conditional branch of the JSX — an ineligible resource shouldn't reach the DOM (§18 + Phase 1 §6). No title in `document.title`, aria-labels, or the `/forbidden` redirect state. This is a demo-fidelity check, not a real access-control boundary — see Phase 1 `lib/audience.ts`'s framing note.
- Meeting/join links revealed only for `myRegistration === 'going'` (§18.3.3 "link online chỉ lộ theo policy") — omit from the DOM entirely when gated, do not `display:none` it.
- `.ics` content is built from developer-controlled mock event fields, not user input — no escaping needed for this prototype (simplified per red team; see Architecture §1). If a real-data path is ever added, add RFC 5545 escaping then, at that boundary.
- Blob URL revoked after download (no lingering object URLs).

## Next Steps

**(Red team update) All four items below are already resolved in the landed Phase 1 spec — nothing left to request.** Phase 1 now ships: `EventItem.startsAt`/`endsAt` as required ISO-with-offset fields; `setEventRegistration(eventId, next)` on the 3-value union with `remaining` bookkeeping; the full per-state fixture list (cancelled/full+waitlist/full-no-waitlist/past+going/tz-diff/joinUrl); and `<Toaster />` mounted at root. Read the real files and use them — do not re-derive fallbacks for gaps that are already closed.

**Follow-ups:** Phase 6 links notification items to `/events/:eventId` (deep links must survive the audience guard). Phase 8 owns the responsive/a11y sweep (tab roving focus, `aria-live` on the RSVP panel, icon-button `aria-label`s) and may add an automated double-click regression to `scripts/visual-check.mjs`.

## Unresolved Questions

1. Attended vs NoShow (§18.4) has no actor in a mock prototype — current plan derives `Attended` from `going` + `past`. Confirm that's acceptable, or should mock data carry an explicit `attendance` field to demo both outcomes?
