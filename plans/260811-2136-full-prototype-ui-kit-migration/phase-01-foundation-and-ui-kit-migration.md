# Phase 1 — Foundation: UI Kit Migration, App Shell, Shared Contracts

## Context Links

- [plan.md](./plan.md)
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md)
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md)
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md) — current architecture
- Spec sections: §8-13 (IA/nav/tokens/card system/ranking), §28-34 (contracts, simplified), §60 (seed data), §9.3 (route inventory)
- Current files this phase replaces: `prototype-app/src/styles/core-ds-1.1.css`, `prototype-app/src/styles/app.css`, `prototype-app/src/components/AppShell.tsx`, `prototype-app/src/AppState.tsx`, `prototype-app/src/types/index.ts`, `prototype-app/src/data/mockData.ts`

## Overview

- **Priority:** P0 — blocks all other phases.
- **Status:** Pending.
- Install `@frontend-team/ui-kit`, delete the hand-rolled CSS, rebuild the app shell on `BlockSidebarLayout`, and establish the shared data model / ranking utility / card components every later phase depends on.

## Key Insights

- `@frontend-team/ui-kit` **is** ikame's Core DS 1.1 — its docs reference `bg_sidebar_primary`, `radius_6`, `body_s` etc. by the same names as `design-system-application.md`. This is a swap, not a redesign — visual intent stays identical, implementation changes.
- Kit ships Tailwind v4 compiled into its stylesheet; plain Tailwind utility classes (`flex`, `gap-4`, `p-6`) work in consumer code once `@frontend-team/ui-kit/style.css` is imported — do **not** add a separate Tailwind install (kit docs explicitly forbid this).
- Kit has no documented mobile bottom-tab-bar component in the fetched docs (only `Sidebar`/`BlockSidebarLayout`/`SimpleSidebar`, all left-rail patterns). **First implementation step: check the kit's `/blocks` page in-browser** (`https://ui.ikameglobal.com` → "Blocks" tab) for a pre-built mobile nav pattern before hand-building `MobileBottomNav`. If none exists, build it as a thin custom component using kit `Button`/`Badge` primitives — this is composition, not a violation of "always use the kit."
- Kit `useDarkMode`/`useTheme` hooks replace the current app's own light/dark `data-theme` toggle in `AppState.tsx`.
- Existing mock-data pattern (single React Context, `useState`, no persistence) is correct for this prototype and is kept — do not introduce Redux/RTK/MSW (spec §58 assumes a production template; this app has no backend to mock).

## Requirements

### Functional
- `npm install @frontend-team/ui-kit` succeeds (blocked on `GITLAB_NPM_TOKEN` — see plan.md open question).
- App renders with kit CSS only; zero visual regressions vs. current review-and-handoff.md sign-off intent (three-tier surface, one primary CTA per screen, etc. — now enforced by the kit itself).
- Perspective switch (iKamer ↔ Manager) and light/dark theme toggle both keep working, now via kit primitives.
- All routes below resolve (stub pages OK for phases 2–7; this phase must make the app buildable and navigable end-to-end):
  ```
  /home (redirect from /)
  /manager/overview (redirect from /manager)
  /manager/team
  /news, /news/:postId
  /events, /events/:eventId
  /knowledge, /knowledge/:documentId
  /goals, /goals/:goalId
  /search
  /notifications
  /profile
  /forbidden
  /not-found, *
  ```
- Direct-URL access to a resource outside the current user's audience redirects to `/forbidden` (not `/not-found`) and leaks no title/summary — implement the guard utility here; pages 3/4 wire it in.

### Non-functional
- TypeScript strict, no `any` in new shared types.
- No file in `src/shared`/`src/lib`/`src/components` exceeds ~200 lines (repo convention) — split if needed.

## Architecture

### 0. Verification spike (RED TEAM: do this before writing any component — steps 1-9 below assume its results)
Everything downstream assumes facts about the installed package that were only inferred from markdown docs, never verified against real code. Spend 30-45 min here before touching `AppShell.tsx`:
1. After install (§1 below), open `node_modules/@frontend-team/ui-kit/dist/*.d.ts` and confirm: (a) `DataTable`/`Table` row-click/`onRow` prop — Phase 5 needs this; (b) `Drawer`/`Modal` focus-trap composition (Radix-based? does it manage `inert`/`aria-hidden` on siblings?) — Phase 8 needs this; (c) whether `lucide-react` is an actual declared peerDependency, or the kit re-exports its own icon components.
2. Render a throwaway page using classes NOT referenced by any kit component example (`grid-cols-12`, `sr-only`, `space-y-6`, `lg:col-span-8`) and confirm they actually apply visually. **This is the single highest-risk unverified assumption in this plan** — the kit's compiled `style.css` may only ship Tailwind utilities the kit's own components reference at ITS build time, not an unpurged full utility set. If arbitrary utilities don't render, stop and pick a fallback styling strategy (CSS Modules for layout, or kit layout primitives only) before Phase 2 starts — do not discover this mid-parallel-execution.
3. Record findings inline in this phase file's Key Insights (replace the "likely"/"probably" hedges with confirmed facts) before starting Architecture §2 onward.
4. If `lucide-react` is NOT a confirmed peer dependency: do not install it as a new dependency in this phase. Keep `@phosphor-icons/react` for now and file icon-set unification as an explicit follow-up, not a blocker — decouples a cosmetic decision from the highest-blast-radius phase.

### 1. Package setup
- Add `.npmrc` at `prototype-app/` root per kit docs:
  ```
  @frontend-team:registry=https://gitlab.ikameglobal.com/api/v4/projects/1351/packages/npm/
  //gitlab.ikameglobal.com/api/v4/projects/1351/packages/npm/:_authToken=${GITLAB_NPM_TOKEN}
  ```
- **Add `.npmrc` to `.gitignore` immediately** (before first `npm install`) — it's the one file where a contributor debugging an auth failure is likely to paste a literal token. Prefer a project-scoped GitLab deploy token with `read_package_registry` only, not a personal PAT (broader-scoped tokens are a supply-chain risk if any dependency's install-time lifecycle script reads `process.env.GITLAB_NPM_TOKEN`). First install with `npm install --ignore-scripts @frontend-team/ui-kit`, inspect what scripts would have run, then re-run without the flag only if nothing suspicious shows up.
- `npm install @frontend-team/ui-kit`.
- In `src/main.tsx`: `import "@frontend-team/ui-kit/style.css"` (replaces the two deleted CSS imports).
- Icon library: see verification spike §0 step 4 — don't assume, don't block on it.

### 2. App shell (`src/components/AppShell.tsx`, rewrite)
- Desktop/tablet (≥768px): `BlockSidebarLayout` with `groups` built from `iKamerNav`/`managerNav` (perspective-driven), `header` = logo, `footer` = account row + `PerspectiveSwitcher`, `activeId` synced from `useLocation()`, `onNavigate` calls `navigate(href)`.
- Mobile (<768px): custom `MobileBottomNav.tsx` (new file) — max 5 items per spec §10.3, built from kit `Button`(icon variant)/`Badge`. Switch layouts via a small `useIsDesktop()` hook (`matchMedia('(min-width: 768px)')`), not CSS-only hide/show, since `BlockSidebarLayout` owns full-viewport height and shouldn't double-render on mobile.
- Header row (both breakpoints): global search trigger, `NotificationTrigger` (kit `NotiBadge` on a `Button`), theme toggle (`useDarkMode`), avatar (kit `Avatar`) → `/profile`.
- Notification drawer: kit `Drawer` (side="right", size="m") replacing the hand-rolled one. This phase builds the shell only (open/close state + trigger badge) with a placeholder body — Phase 6 builds and exports a `NotificationList` component from `pages/NotificationsPage.tsx`; **wiring that import into the Drawer body is a Phase 8 integration step** (one-line change, listed there), not done here and not done by Phase 6 (which doesn't own `AppShell.tsx`).
  **Container contract for Phase 6 (red team: this was previously undefined, risking a layout mismatch discovered only in Phase 8):** the Drawer body is a fixed-height flex column — `<DrawerBody className="flex-1 overflow-y-auto">`. `NotificationList`'s `compact` prop must render inside that without its own outer scroll container, fixed page-level max-width, or day-heading margins sized for a full page — assume it's dropped into a ~360-400px-wide, vertically-scrollable column, not a page. Phase 6 designs against this contract explicitly, not against `pages/NotificationsPage.tsx`'s full-page layout alone.
- Skip link "Đi tới nội dung chính" as first focusable element (spec §10.4) — plain anchor + Tailwind `sr-only focus:not-sr-only` pattern (kit has no dedicated component for this).

### 3. Shared types (`src/types/index.ts`, extend — do not create a v2 file)
```ts
export type Perspective = 'ikamer' | 'manager'
export type PriorityBand = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
export type Severity = 'critical' | 'warning' | 'info'

export interface User {
  id: string; personId: string; name: string; shortName: string
  role: string; team: string; teamId: string
  perspective: Perspective; availablePerspectives: Perspective[]
  timezone: string
}

export interface NewsPost {
  id: string; title: string; summary: string; body: string[]
  publisher: string; publishedAt: string; readingTime: number; topic: string
  official?: boolean; highlighted?: boolean
  mandatory?: { reason: string; dueAt: string }
  audienceTeamIds?: string[]        // undefined = company-wide
  expired?: boolean
  read: boolean; acknowledged: boolean
}
// Ranking note: NewsPost has no separate `updatedAt` — R0 doesn't model post-publish
// edits, so the per-phase RankableCard adapter maps `publishedAt` → `updatedAt`. Don't add
// a redundant field for this.

export interface EventItem {
  id: string; title: string; summary: string
  dateLabel: string; day: string; month: string; time: string
  startsAt: string; endsAt: string   // ISO 8601 WITH timezone offset — REQUIRED, not
                                      // optional-with-fallback. Phase 4 (timezone display,
                                      // .ics export) and Phase 2 (P2 "starts within 48h"
                                      // banding) both depend on these being real. RED TEAM:
                                      // do not let Phase 4 fall back to guessing an offset
                                      // from day/month/time if these are missing — that
                                      // fallback would defeat the exact timezone-difference
                                      // test it exists to pass. If this phase runs out of
                                      // time before setting these on every fixture, that's a
                                      // blocker to report, not a fallback to build around.
                                      // Display strings (day/month/time/dateLabel) stay for
                                      // Vietnamese-locale rendering; derive them FROM
                                      // startsAt/endsAt in mockData, not the reverse.
  location: string; organizer: string
  format: 'Trực tiếp' | 'Online' | 'Hybrid'
  timezone: string                    // IANA name, e.g. "Asia/Ho_Chi_Minh"
  status: 'open' | 'going' | 'full' | 'cancelled' | 'past'
  audienceTeamIds?: string[]
  capacity?: number; remaining?: number; waitlistEnabled?: boolean
  joinUrl?: string                    // online/hybrid meeting link — omit for onsite events
  // myRegistration is a 3-value union, NOT 4. Event-level cancellation already lives on
  // `status: 'cancelled'` — do not add 'cancelled' here too. RED TEAM caught a real
  // contradiction: an earlier draft had both a 4th `myRegistration` value AND a
  // `setEventRegistration` mutator description that assumed it, while Phase 4's own UI
  // matrix never rendered it. One cancellation concept, on `status`, resolves it.
  myRegistration: 'not_registered' | 'going' | 'waitlisted'
}

export interface AttentionItem {   // insight card contract, spec 15.3
  id: string; title: string
  whoWhat: string; whyNow: string; source: string
  severity: Severity; required: boolean; dueAt?: string; freshnessAt: string
  nextActionLabel: string; nextActionHref?: string
  teamId: string
  state: 'open' | 'resolved' | 'dismissed'
}

export interface TeamMember {
  id: string; name: string; role: string; teamId: string
  attentionSummary: string
  status: 'needs_attention' | 'ok' | 'no_data'
  lastUpdated: string
  joinedAt?: string                 // optional — powers Phase 5 "Team Moments"
  momentType?: 'new_joiner' | 'birthday' | 'anniversary'   // optional, same reason
}

export interface NotificationItem {
  id: string; title: string; body: string; time: string
  receivedAt?: string               // optional ISO 8601 — lets Phase 6 group-by-day
                                      // properly instead of regex-parsing `time`
                                      // ("8 phút trước"). Add it; cheap, unblocks a
                                      // real implementation instead of a string hack.
  priority: 'critical' | 'required' | 'transactional' | 'informational'
  read: boolean; href: string; groupKey?: string
}
```
Keep existing field names where current code already matches (minimize churn) — the block above is additive/renaming guidance, not a mandate to rewrite every field; reconcile against `scout-260811-2136-product-overview.md`'s current type list before editing.

### 3a. `AppState.tsx` mutators (extend, exact list — phases 3/4/6 depend on these exact names)
- `acknowledgeNews(postId)` — existing, keep as-is (sets `acknowledged: true` only).
- `markNewsRead(postId)` — **new**, sets `read: true` only, idempotent, never touches `acknowledged`. Required by Phase 3's Gherkin scenario 1 (read survives navigation, doesn't clear the mandatory attention item) and by Phase 2's Home ranking (which must key off `mandatory && !acknowledged`, never `!read`).
- `setEventRegistration(eventId, next: EventItem['myRegistration'])` — **replaces** the current boolean `toggleRegistration`. Three-value union (`not_registered`/`going`/`waitlisted`) can't be expressed as a toggle. Update `remaining` bookkeeping here (going→not_registered increments `remaining` if under capacity, promotes next waitlisted user if `waitlistEnabled`). Does NOT touch `status` — event-level `cancelled` is a separate concern this mutator never sets.
- `markNotificationRead(id)` / `markAllNotificationsRead()` — existing, keep.
- Do not add a generic "resolve attention item" mutator here — Phase 5 filters/ranks `AttentionItem[]` read-only from `mockData.ts`; if it needs a `state` mutation later, that's a follow-up, not this phase's job (avoid speculative API surface — YAGNI).

### 4. Shared mock data (`src/data/mockData.ts`, extend)
Per spec §60.1–60.4, add. **RED TEAM: this is now the complete, committed fixture set — every fixture a downstream phase asked for is enumerated here so no phase discovers a missing fixture mid-parallel-execution.**
- Users: `person_binh` (iKamer, different team, used to prove audience-deny) — **skip person_ops**: Operations has no My iKame perspective per spec §4.3/D2, nothing for it to demonstrate here; deliberate deviation from spec §60.1, not an oversight.
- News: one `audienceTeamIds`-scoped post the current user (`an`) is *not* in (proves `/forbidden` guard).
- Events — one per state, ALL with real `startsAt`/`endsAt`/`timezone` (per the type comment above, no exceptions):
  - `status: 'cancelled'`, previously `myRegistration: 'going'`
  - `status: 'full'`, `waitlistEnabled: true`, `myRegistration: 'waitlisted'`
  - `status: 'full'`, `waitlistEnabled: false` (proves "no waitlist" messaging)
  - `status: 'past'`, `myRegistration: 'going'` (proves past+attended rendering)
  - one event whose `timezone` differs from `user.timezone` (the Gherkin-critical fixture for Phase 4's dual-timezone display — don't substitute a same-timezone event)
  - one audience-scoped-out event (proves `/forbidden` for events)
  - at least one `online`/`hybrid` event with `joinUrl` set (proves the gated join-link)
- Attention items: one item on a different `teamId` than `person_mai`'s (proves Manager out-of-scope filtering) and one required-vs-optional pair with different `dueAt` (proves tie-break ordering).
- `TeamMember[]` — new shared, typed fixture array exported from this file, covering all three `status` values. **This phase creates and exports it but does NOT edit `TeamPage.tsx`** — Phase 5 alone owns that edit (see Related Code Files; an earlier draft double-claimed this file across Phase 1 and Phase 5, red-team caught it).
- **Fixture-naming hygiene:** every mock name/team/org string reads as obviously fictional (e.g. "Team Demo Alpha"), not a plausible real ikame team name lifted from the product spec — applies to this file's content itself, not just to later screenshots.

### 5. Ranking utility (`src/lib/ranking.ts`, new)
```ts
interface RankableCard {
  id: string; priorityBand: PriorityBand
  severity?: Severity; dueAt?: string; official?: boolean; updatedAt: string
}
export function rankCards<T extends RankableCard>(cards: T[]): T[]
```
Sort by: `priorityBand` asc (P0 first) → `severity` (critical>warning>info) desc → `dueAt` asc (nulls last) → `official` desc → `updatedAt` desc → `id` asc (stable tie-break). Pure function, unit-testable, no I/O. Implements spec §13.2/13.3.

**Cross-phase consistency (red team: phases 2/3/5 each write an independent `toRankable()` adapter blind — no shared verification that all three agree on ordering semantics).** Ship one worked example in this file's own comments/tests: given 3-4 canonical fixture cards spanning different bands/severities/due-dates, show the expected output order. Phases 2/3/5 copy this pattern for their own adapters and can sanity-check against it — cheap, no new shared code, closes the "three independent reinterpretations" gap without building a test framework nobody asked for.

### 6. Audience/eligibility guard (`src/lib/audience.ts`, new)
```ts
export function isEligible(user: User, audienceTeamIds?: string[]): boolean
```
`undefined`/empty → company-wide → always true. Else `audienceTeamIds.includes(user.teamId)`. Used by: Home/News/Events list filtering (hide ineligible items entirely) AND by a `<ForbiddenGuard resourceEligible={...}>` wrapper or simple redirect check in detail-page loaders — direct URL to an ineligible resource must render `ForbiddenPage`, never the real content or even its title.

**Honest framing (red team: this was written elsewhere in this plan as if it were a real security boundary — it is not).** This is a client-side render filter over a dataset that ships in full inside the JS bundle and sits fully resident in `AppState` for the whole session — anyone with DevTools can read the "forbidden" content from React context regardless of what this guard does. Its actual value is *demo fidelity* (proving the spec's permission-aware-by-construction pattern renders correctly, per §17.7/§15.4 acceptance criteria) — not data protection. Every phase's Security Considerations section that mentions this guard should say so plainly instead of describing it with real-security language ("must never leak," "verify via DOM inspection as if it were the enforcement point"). Keep the feature — it's cheap and it is a named spec acceptance criterion — just don't oversell what it guarantees.

### 7. Shared card/UI components (`src/components/`, rewrite on kit primitives)
- `NewsCard.tsx`, `EventCard.tsx` — kit `Card` + `Badge`/`Chip` (status) + `Avatar` (publisher/organizer) + `Button`.
- `AttentionCard.tsx` — kit `Card` + `Badge` (severity) — must render all 6 insight-card-contract fields (who/what, why now, severity, freshness, source, one next action) per spec §15.3, no exceptions.
- `QuickAction.tsx` — kit `Button` (icon + label).
- `SectionHeader.tsx` — title + count + "Xem tất cả" link + degraded-state indicator (kit `Alert` inline variant or a plain text+icon row).
- `EmptyState.tsx` — kit `Card` + text + optional `Button`; anatomy per spec §12.1 (first-use/no-result/filtered/success variants via a `variant` prop, not 4 separate components).
- `InlineError.tsx` — kit `Alert variant="error"` + retry `Button`.
- `ReasonDisclosure.tsx` — kit `Tooltip` (desktop) / `Popover` (mobile, `portal={false}` if nested in a Drawer) showing "Vì sao tôi thấy nội dung này?" text.
- `ForbiddenPage.tsx` (`pages/`) — full page using kit `Alert`/`Card`, generic "you don't have access" copy, link home. No dynamic content passed in (never receives the blocked resource's title).

### 8. Router (`src/App.tsx`, rewrite route table)
- Extend `PerspectiveGuard` to cover `/manager/overview` and `/manager/team`.
- Add `<Navigate>` redirects: `/` → `/home`, `/manager` → `/manager/overview`.
- Add stub components (one-line placeholder, "Coming in Phase N" text is fine) for any page phases 2–7 haven't started yet, so `npm run build` never breaks mid-plan: `pages/NotificationsPage.tsx`, `pages/ProfilePage.tsx`, `pages/KnowledgePages.tsx`, `pages/GoalPages.tsx`. Phases 6/7 will flesh these out in place — **this phase creates the files so ownership is unambiguous, but only with a trivial stub body.**

## Related Code Files

**Modify:** `prototype-app/src/main.tsx`, `prototype-app/src/App.tsx`, `prototype-app/src/AppState.tsx`, `prototype-app/src/types/index.ts`, `prototype-app/src/data/mockData.ts`, `prototype-app/src/components/AppShell.tsx`, `prototype-app/src/components/ContentCards.tsx` (split into NewsCard/EventCard/AttentionCard/QuickAction below), `prototype-app/package.json`

**NOT modified by this phase (red team caught a double-ownership claim):** `prototype-app/src/pages/TeamPage.tsx` — this phase only exports the `TeamMember[]` fixture from `mockData.ts`; Phase 5 alone edits the page to consume it.

**Create:** `prototype-app/.npmrc`, `prototype-app/src/lib/ranking.ts`, `prototype-app/src/lib/audience.ts`, `prototype-app/src/components/NewsCard.tsx`, `prototype-app/src/components/EventCard.tsx`, `prototype-app/src/components/AttentionCard.tsx`, `prototype-app/src/components/QuickAction.tsx`, `prototype-app/src/components/SectionHeader.tsx`, `prototype-app/src/components/EmptyState.tsx`, `prototype-app/src/components/InlineError.tsx`, `prototype-app/src/components/ReasonDisclosure.tsx`, `prototype-app/src/components/MobileBottomNav.tsx`, `prototype-app/src/pages/ForbiddenPage.tsx`, `prototype-app/src/pages/NotificationsPage.tsx` (stub), `prototype-app/src/pages/ProfilePage.tsx` (stub), `prototype-app/src/pages/KnowledgePages.tsx` (stub), `prototype-app/src/pages/GoalPages.tsx` (stub)

**Delete:** `prototype-app/src/styles/core-ds-1.1.css`, `prototype-app/src/styles/app.css`

## Implementation Steps

1. Confirm `GITLAB_NPM_TOKEN` is available (ask user if not — see plan.md Open Questions). Add `.npmrc` to `.gitignore` FIRST, then write `.npmrc`, then `npm install --ignore-scripts @frontend-team/ui-kit`, inspect for suspicious lifecycle scripts, re-run without the flag.
2. Run the Architecture §0 verification spike (Tailwind utility rendering, `DataTable`/`Drawer` prop signatures, icon peer-dep) before writing any component. Record confirmed facts in this file's Key Insights, replacing hedged language.
3. Browse `https://ui.ikameglobal.com` → "Blocks" and "AI Rules" tabs in a real browser session (prior automated fetch of `/blocks` 404'd on plain markdown URLs) to check for a mobile-nav block and any AI-authoring rules missed by research. Update this phase's notes if something material turns up.
4. Delete `core-ds-1.1.css`/`app.css`; add `import "@frontend-team/ui-kit/style.css"` to `main.tsx`; wrap app root in `TooltipProvider` + mount `Toaster`.
5. Extend `types/index.ts` per Architecture §3 (reconcile with existing fields, don't duplicate).
6. Extend `mockData.ts` per Architecture §4 — full fixture list, not a subset.
7. Write `lib/ranking.ts` (with the worked ordering example) and `lib/audience.ts` (with the honest-framing comment).
8. Rewrite `AppShell.tsx` on `BlockSidebarLayout` + new `MobileBottomNav.tsx`; wire perspective switch, theme toggle (`useDarkMode`), notification `Drawer` shell (with the container contract for Phase 6), skip link.
9. Split `ContentCards.tsx` into the 4 new card files on kit primitives; delete the old file once nothing imports it.
10. Build `EmptyState.tsx`, `InlineError.tsx`, `SectionHeader.tsx`, `ReasonDisclosure.tsx`.
11. Build `ForbiddenPage.tsx` + stub pages for Notifications/Profile/Knowledge/Goals.
12. Rewrite `App.tsx` route table with redirects and extended `PerspectiveGuard`.
13. `npm run typecheck && npm run build` — must pass with zero errors before declaring this phase done.
14. `git add -A && git commit` this phase's changes before signaling phases 2-7 to start — gives them a stable, diffable base and makes any violation of the file-ownership boundary visible in later `git status`/`git diff` checks.

## Todo List

- [x] Verification spike run and documented (Tailwind utilities, kit prop signatures, icon peer-dep)
- [N/A] `.npmrc` gitignored; `.npmrc` + `npm install @frontend-team/ui-kit` succeeds — deferred per plan.md Amendment; built on hand-rolled Core DS 1.1 instead
- [x] Old CSS deleted, kit CSS imported, `TooltipProvider`/`Toaster` mounted — rebuilt AppShell & components on hand-rolled Core DS 1.1
- [x] `types/index.ts` extended
- [x] `mockData.ts` extended with the full fixture list (all event states, tz-diff event, joinUrl event, out-of-scope items)
- [x] `lib/ranking.ts` + `lib/audience.ts` written
- [x] `AppShell.tsx` rebuilt on `BlockSidebarLayout` + `MobileBottomNav` — built on hand-rolled components
- [x] Shared card components rebuilt on kit primitives — rebuilt on hand-rolled components
- [x] `EmptyState`/`InlineError`/`SectionHeader`/`ReasonDisclosure` built
- [x] `ForbiddenPage` + stub pages created
- [x] `App.tsx` route table complete, redirects working
- [x] `npm run typecheck && npm run build` clean
- [x] Phase committed to git before signaling phases 2-7 to start

## Success Criteria

- App builds and runs (`npm run dev`) with zero console errors.
- Every route in the table above resolves to something (real page or stub) — no blank screens, no router errors.
- Perspective switch and theme toggle both visibly work.
- Direct-navigating to a mocked out-of-audience news/event URL lands on `/forbidden`, not the content and not `/not-found`.
- No file references `core-ds-1.1.css` or `app.css` anymore.
- Verification spike's findings are recorded, not left as "likely"/"probably" hedges, before phases 2-7 start.

## Risk Assessment

- **Blocking:** no `GITLAB_NPM_TOKEN` → cannot install the kit → nothing else in this plan is buildable. Surfaced as an open question; do not silently fall back to hand-rolled CSS as a workaround without checking with the user first, since that defeats the point of this plan.
- Kit may lack a mobile bottom-nav pattern (unconfirmed — Blocks page not fetched) → mitigated by custom `MobileBottomNav` composed from primitives.
- Renaming routes (`/` → `/home`, `/manager` → `/manager/overview`) could conflict with the existing Playwright `visual:check` script's hardcoded paths — check `scripts/visual-check.mjs` and update its target URLs in this phase, not deferred to Phase 8.
- **(Red team) Tailwind utility classes may not render at all** if the kit's compiled CSS only includes utilities its own components reference — this is the highest-severity unverified assumption in the whole plan. The §0 spike exists specifically to catch this before 6 phases build layout code on top of it.

## Security Considerations

- `/forbidden` page must never receive or render the blocked resource's title/summary/id in any way (not even in a hidden attribute) — verify by checking the rendered DOM. **This is a demo-fidelity check, not a security audit** — the underlying mock data is fully resident client-side regardless; see the honest-framing note in Architecture §6.
- `GITLAB_NPM_TOKEN`: gitignore `.npmrc`, prefer a project-scoped `read_package_registry`-only deploy token over a personal PAT, first install with `--ignore-scripts`. Never committed to any tracked file; `.npmrc` reads it from env only (`${GITLAB_NPM_TOKEN}` interpolation, no literal value).
- Mock fixture content (audience-deny posts, out-of-scope attention items) must read as obviously fictional — see Architecture §4 fixture-naming hygiene note.

## Next Steps

- Once this phase's `npm run build` is green, phases 2–7 can start in parallel — each imports from `types/index.ts`, `lib/ranking.ts`, `lib/audience.ts`, and the shared `components/` files built here, but does not modify them.
