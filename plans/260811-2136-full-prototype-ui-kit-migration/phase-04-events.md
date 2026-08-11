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

- Current page models RSVP as one boolean → cannot express `waitlisted` or `cancelled`. Phase 1's `myRegistration` union is the source of truth; drop `event.registered` entirely.
- **The disabled-button trick alone does not satisfy §18.7 idempotency.** Two clicks in the same tick both read the pre-render `disabled` value. The real guard is a `useRef` lock read+set synchronously inside the handler; `disabled` is UX polish on top.
- Timezone display needs a real instant, not the mock's `dateLabel`/`time` display strings → requires ISO `startsAt`/`endsAt` on `EventItem` (dependency on Phase 1, fallback below). `Intl.DateTimeFormat` with `timeZone` does the conversion — no date library.
- .ics generation is pure string building + `Blob` + anchor click. No server, no dependency. Correct call for a mock prototype.
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

### 1. `lib/ics.ts` (new, ~60 lines)
```ts
export interface IcsInput {
  uid: string; title: string; description?: string; location?: string
  startsAt: string; endsAt: string; timezone: string   // ISO w/ offset + IANA tz
}
export function buildIcs(input: IcsInput): string
export function downloadIcs(filename: string, ics: string): void
```
- `buildIcs`: `BEGIN:VCALENDAR/VERSION:2.0/PRODID:-//My iKame//Prototype//VI` → `VEVENT` with `UID`, `DTSTAMP`, `DTSTART`/`DTEND` as UTC basic format (`YYYYMMDDTHHMMSSZ` — avoids shipping a VTIMEZONE block, still correct), `SUMMARY`, `DESCRIPTION`, `LOCATION`, `STATUS:CONFIRMED`. CRLF line endings.
- Escape per RFC 5545: `\` `;` `,` → escaped, newline → `\n`. No line folding (values are short; note the 75-octet limit as a known simplification).
- `downloadIcs`: `new Blob([ics], { type: 'text/calendar;charset=utf-8' })` → `URL.createObjectURL` → hidden `<a download>` → `click()` → `URL.revokeObjectURL` in a `setTimeout(…, 0)`.

### 2. Timezone helpers (local to `EventPages.tsx`, ~15 lines)
```ts
const fmt = (iso: string, tz: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short', timeZone: tz }).format(new Date(iso))
```
- Detail renders: primary line = user tz (`user.timezone`) + `timeZoneName: 'short'`; secondary muted line = `Giờ gốc sự kiện: … ({event.timezone})`. If `user.timezone === event.timezone`, render one line with the tz label appended (no redundant duplicate).
- Cards render user-tz short form only.

### 3. RSVP action (detail page)
```ts
const lockRef = useRef(false)                 // synchronous double-submit guard
const doneKeyRef = useRef<string | null>(null) // idempotency key: `${event.id}:${next}`
const [pending, setPending] = useState(false)  // drives disabled + Spinner
```
Handler: `if (lockRef.current) return` → `const key = ...; if (doneKeyRef.current === key) return` → `lockRef.current = true; setPending(true)` → `await sleep(400)` (mock latency, makes the race real and testable) → call AppState setter → `doneKeyRef.current = key` → `toast.success(...)` → `finally { lockRef.current = false; setPending(false) }`.
- Cancel (Going→NotRegistered) goes through a kit `Modal` confirm (`title="Hủy đăng ký?"`, footer = Huỷ/Xác nhận). Register does not (one primary CTA, low-friction).
- Receipts via kit `toast.success` / `toast.error` — replaces the inline `receipt` string state (§18.6 "RSVP success → transactional, ngay").

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

1. Verify Phase-1 contract present: `EventItem.myRegistration`, `timezone`, `capacity/remaining/waitlistEnabled`, `audienceTeamIds`, `user.timezone`, plus `startsAt`/`endsAt` and an AppState registration setter. If ISO fields or setter are missing → apply the fallbacks in Next Steps and log it there, do not edit Phase-1 files.
2. Write `lib/ics.ts` (`buildIcs` + `downloadIcs` + RFC 5545 escaping). Verify manually: download one file, import into a calendar app.
3. Rewrite `EventsPage`: kit `Tabs` (`variant="underline"`) with `items[]`; eligibility filter → tab filter → priority sort; render shared `EventCard`; per-tab `EmptyState`; timezone toolbar note.
4. Rewrite `EventDetailPage` skeleton in §18.3 order 1–9 using kit `Card`/`Badge`/`Alert`; guards first: not found → `/not-found`; `!isEligible(...)` → `/forbidden` (**before** any render path that touches `event.title`).
5. Add the dual-timezone block (§18.3.2) with `Intl.DateTimeFormat`, user tz primary, event tz secondary.
6. Implement the RSVP panel state matrix (Architecture §4) incl. `Progress` capacity meter and gated join link.
7. Implement the RSVP handler with `lockRef` + idempotency key + mock 400ms delay + `pending` disabled state + `toast` receipts; wrap cancel in a kit `Modal` confirm.
8. Wire `Thêm vào lịch` → `downloadIcs(slug(event.title) + '.ics', buildIcs(...))`, shown only for `going` on a non-cancelled event.
9. Past-event recap/survey block (§18.3.9) + `Đã tham gia` badge; contact/support block (§18.3.8).
10. `npm run typecheck && npm run build`; then manual acceptance run (Success Criteria).

## Todo List

- [ ] `lib/ics.ts` written; generated file imports cleanly into a real calendar app
- [ ] `EventsPage` rebuilt on kit `Tabs`, 3 tabs filter correctly
- [ ] Ineligible events absent from all tabs
- [ ] Priority treatment (today / closing soon) visible + sorted first
- [ ] Per-tab `EmptyState` renders
- [ ] Detail page follows §18.3 order 1–9
- [ ] Dual-timezone display (user primary, event secondary)
- [ ] RSVP matrix: open / full+waitlist / full-no-waitlist / waitlisted / cancelled / past all render distinctly
- [ ] Double-click RSVP → single registration (Gherkin 1) verified manually
- [ ] Cancel confirm `Modal` + `toast` receipts wired
- [ ] Capacity `Progress` meter + gated join link
- [ ] Out-of-audience direct URL → `/forbidden`, DOM contains no event title
- [ ] `npm run typecheck && npm run build` clean, file ≤ 200 lines

## Success Criteria

- **Gherkin 1 (idempotency):** rapid double-click `Đăng ký tham gia` → exactly one state transition, `remaining` decrements by exactly 1, one toast, badge reads `Đã đăng ký` once. Verify by clicking twice within ~50ms (or via React DevTools state inspection), not by eyeballing the button.
- **Gherkin 2 (timezone):** with `user.timezone` ≠ `event.timezone` in mock data, detail shows the user-tz time as the headline and the event's original tz on a secondary line.
- Cancelled event: no RSVP CTA, no calendar CTA, error `Alert`, still visible in `Sắp tới`.
- Full event with `waitlistEnabled`: CTA reads `Vào danh sách chờ`; after action, state is `waitlisted` with a leave-waitlist CTA.
- `.ics` downloads and imports with correct title/time/location.
- Direct URL to the audience-scoped-out event → `/forbidden`; page DOM (not just visual) contains no title/summary/id.
- Zero console errors; `npm run build` green.

## Risk Assessment

- **Missing ISO datetimes on `EventItem`** → timezone + .ics both break. Mitigation: fallback parser in `ics.ts` composing an ISO string from `day`/`month`/`time` assuming `+07:00`; flag to Phase 1 owner. This is the single most likely blocker.
- **Missing AppState setter for the 4-value union** → cannot express `waitlisted`. Mitigation (temporary): local `useState` overlay in the detail page for the waitlist branch + existing `toggleRegistration` for going/cancel; replace as soon as Phase 1 lands the setter. Do not fork mock data.
- **`disabled`-only guard mistaken for idempotency** → silently fails the acceptance criterion. Mitigation: the `lockRef` is mandatory; a reviewer must see it.
- **Kit `Tabs` unmounts inactive content** → per-tab scroll/state loss. Acceptable for R0; do not add memoization complexity.
- **`Intl` timezone name output varies by browser/ICU** — do not assert exact strings in any later automated check; assert the tz identifier text we render ourselves.

## Security Considerations

- Eligibility guard runs **before** render, not inside a conditional branch of the JSX — an ineligible resource must never reach the DOM (§18 + Phase 1 §6). No title in `document.title`, aria-labels, or the `/forbidden` redirect state.
- Meeting/join links revealed only for `myRegistration === 'going'` (§18.3.3 "link online chỉ lộ theo policy") — omit from the DOM entirely when gated, do not `display:none` it.
- `.ics` content is built from mock event fields; escape all user-facing strings per RFC 5545 so a title with `;`/`,`/newline cannot corrupt or inject extra calendar properties.
- Blob URL revoked after download (no lingering object URLs).

## Next Steps

**Dependencies to raise with Phase 1 (blocking, no self-service edits):**
1. `EventItem.startsAt: string` and `endsAt: string` — ISO 8601 **with offset** (e.g. `2026-08-20T15:30:00+07:00`). Required by dual-timezone display and .ics.
2. AppState: `setEventRegistration(eventId: string, next: 'not_registered' | 'going' | 'waitlisted')` replacing boolean `toggleRegistration`; must also adjust `remaining` and flip `status` open↔full at capacity.
3. Mock data: at least one event per state — `cancelled`, `full` + `waitlistEnabled: true`, `full` + no waitlist, `past` + `myRegistration: 'going'`, one audience-scoped-out event, and one event whose `timezone` differs from `user.timezone`.
4. `<Toaster />` mounted at app root (already in Phase 1 step 3) — confirm before using `toast`.

**Follow-ups:** Phase 6 links notification items to `/events/:eventId` (deep links must survive the audience guard). Phase 8 owns the responsive/a11y sweep (tab roving focus, `aria-live` on the RSVP panel, icon-button `aria-label`s) and may add an automated double-click regression to `scripts/visual-check.mjs`.

## Unresolved Questions

1. Is a registration setter (dep #2) acceptable to add in Phase 1, or should Phase 4 own a small `useEventRegistration` hook instead? Ownership call for the plan lead.
2. Mock data has no meeting URL field — add `joinUrl?: string` to `EventItem` (Phase 1), or drop the gated-join-link requirement to a static "Link sẽ được gửi qua email" string?
3. Attended vs NoShow (§18.4) has no actor in a mock prototype — current plan derives `Attended` from `going` + `past`. Confirm that's acceptable, or should mock data carry an explicit `attendance` field to demo both outcomes?
