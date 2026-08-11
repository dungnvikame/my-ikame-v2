# Phase 8 — Hardening: Responsive/A11y Pass, Cleanup, Docs

## Context Links

- [plan.md](./plan.md) — Phase 8 is sequential, runs only after phases 2–7 all land.
- [phase-01-foundation-and-ui-kit-migration.md](./phase-01-foundation-and-ui-kit-migration.md) — owns route renames (`/`→`/home`, `/manager`→`/manager/overview`), icon-library decision, deletion of `core-ds-1.1.css`/`app.css`.
- [plans/reports/scout-260811-2136-product-overview.md](../reports/scout-260811-2136-product-overview.md) — current tooling + doc inventory.
- Spec: §10 (app shell breakpoints), §49 (a11y release gate), §63 (prototype acceptance suite), §12 (empty/error states).

## Overview

- **Priority:** P1 — last phase, gates handoff.
- **Status:** Pending. **Effort:** 4h (bumped from 3h — red team flagged the original budget as inconsistent with what it absorbs: defects from 6 converged parallel phases + the AppShell/NotificationList integration step + doc rewrites + visual-check updates. Keyboard checklist trimmed in exchange, see Architecture, to make the total realistic rather than raising the budget without cutting anything).
- Cross-cutting QA + doc truth-up. Three workstreams: (a) responsive + keyboard pass across every route, (b) `visual-check.mjs` updated for renamed routes and new scenarios, (c) root docs rewritten to describe the ui-kit reality instead of the hand-rolled CSS reality.

## Key Insights

- Phase 1 was told to update `visual-check.mjs` route URLs when renaming routes. **Verify first, don't redo** — if Phase 1 already changed them, this phase only adds scenarios.
- The kit's `Modal`/`Drawer`/`Popover` are Radix-based per research reports, so focus-trap + return-focus is likely free. **Verify by keyboard, don't assume** — the notification `Drawer` and any confirm modal are the two that matter.
- Skip link, mobile bottom nav, and `ReasonDisclosure` (Tooltip/Popover) are the three hand-composed bits with no kit a11y guarantee → highest chance of defects.
- Docs are stale in a specific way: `design-system-application.md` reads as a *rule list to hand-enforce*. Post-migration it should read as *what the kit enforces + the few rules that remain human judgment* (one Primary CTA per screen, `body_m` reserved for reading, tier assignment).
- Scope cut is deliberate: a full 8-journey Playwright suite is production-grade investment on a throwaway prototype. Extend the existing single-file script instead of introducing a test runner + config + CI.

## Requirements

### Functional
- Every route renders with no horizontal scroll at 1440×900, 1024×768, 390×844.
- Mobile (<768px): bottom nav visible, ≤5 items, all targets ≥44×44px, every item navigates.
- Tablet (768–1279px): sidebar collapsed or drawer; no content clipped.
- Desktop: sidebar collapse/expand toggles and persists across route changes within a session.
- Keyboard-only: skip link is first focusable and jumps to `<main>`; visible focus on every interactive element; no trap outside modal/drawer; drawer/modal trap focus and return it to the trigger on close.
- `npm run visual:check` passes against the renamed routes and writes ≥6 screenshots.
- Zero references remain to deleted files/packages anywhere in `prototype-app/`.

### Non-functional
- A11y fixes are surgical (add `aria-label`, `alt`, heading level, `role`, `lang`) — no component rewrites. If a fix needs >20 lines, log it as a follow-up instead.
- Docs stay short; no doc grows past ~120 lines.

## Architecture

### Responsive matrix (spec §10)
| Viewport | Size | Expect |
|---|---|---|
| Desktop | 1440×900 | sidebar 240px expanded / 72px collapsed, content max 1200px |
| Tablet | 1024×768 | sidebar collapsed or drawer, side rail stacks below main |
| Mobile | 390×844 | header 56px, bottom nav ≤5 items, 44px targets, no hover-only actions |

Routes to sweep: `/home`, `/news`, `/news/:id`, `/events`, `/events/:id`, `/manager/overview`, `/manager/team`, `/search`, `/notifications`, `/profile`, `/knowledge`, `/goals`, `/forbidden`, `/not-found`.

### Keyboard checklist — trimmed to 4 (red team: a 10-item manual audit contradicted this phase's own "R1 gate, not R0" admission and couldn't realistically fit a 3h budget alongside everything else)
1. Skip link focus-first, activates, focus lands in `<main>`.
2. Notification drawer + any confirm `Modal`: opens by keyboard, traps focus, `Esc` closes, focus returns to the trigger — logged as an explicit pass/fail per interaction, not a single eyeballed pass (this is the one item with real regression risk from the kit's Radix composition, per Phase 1's spike findings).
3. Acknowledge (News detail) and RSVP (Event detail) completable keyboard-only — spec §63 journey 6, the two flows a live demo walkthrough actually exercises.
4. Focus ring visible on all controls incl. cards-as-links and icon-only buttons, in both themes (spot-check, not exhaustive).

**Explicitly deferred to R1, not attempted here** (unchanged from before, just no longer contradicted by an oversized R0 checklist): tab-order-matches-visual-order audit across every page, landmark/heading-hierarchy audit, 200%-zoom/320px-reflow sweep, NVDA/VoiceOver runs, full contrast audit, axe automation wiring. Record this split explicitly in `review-and-handoff.md` §R0.1 rather than silently doing a partial job on all ten.

### `visual-check.mjs` changes
- Base URL nav: `${baseUrl}/home`; perspective-switch assertion `waitForURL('**/manager/overview')`.
- Existing shots keep names: `ikamer-home-desktop`, `manager-overview-desktop`, `mandatory-article-desktop`, `ikamer-home-mobile`.
- Add: `mandatory-article-acknowledged-desktop.png` (after ack click — proves receipt state), `event-detail-rsvp-desktop.png` (after RSVP — proves going state), `manager-overview-tablet.png` at 1024×768.
- Add the same overflow guard already used on mobile to the tablet page.
- Add a 3-line assertion: direct-nav to the out-of-audience news URL (Phase 1 fixture) lands on `/forbidden` — spec §63 journey 4, near-zero cost.
- Keep the single-file script + `node scripts/visual-check.mjs` shape. No Playwright test runner, no config file, no CI.

### Spec §63 automation scope cut (deliberate SHOULD, not MUST)
- **Automate** (extend existing script): J1 ack flow, J2 RSVP, J7 mobile no-h-scroll + bottom nav. Rationale: already scripted or one line away, and they're the two state mutations that silently break during a component-library swap.
- **Cheap bonus:** J4 forbidden direct URL (asserted above).
- **Manual QA, documented in `review-and-handoff.md`:** J3 degraded-section (needs fault injection the mock layer doesn't have), J5 Manager attention ordering (visual judgment), J6 keyboard-only (a human is faster than the automation), J8 search out-of-audience (fixture-dependent, verified by reading the filter code).

### Doc rewrites
- `design-system-application.md` — retitle to "Design System Application — My iKame R0 (@frontend-team/ui-kit)". Replace "tokens from `src/styles/core-ds-1.1.css`" with "tokens ship in `@frontend-team/ui-kit/style.css`; same Core DS 1.1 names (`bg_sidebar_primary`, `radius_6`, `body_s`)". Replace the component inventory with kit component names actually used (`BlockSidebarLayout`, `Card`, `Badge`, `Chip`, `Drawer`, `Modal`, `Tabs`, `Alert`, `Toaster`, `Avatar`, `Tooltip`, `Popover`) + the short list of hand-composed components (`MobileBottomNav`, skip link, `AttentionCard` composition). Convert "Forbidden checks" into "Enforced by kit" vs "Still human judgment" (one Primary CTA/screen, `body_m` only for reading, surface-tier assignment, no shadow on inline surfaces).
- `review-and-handoff.md` — **append**, never delete. Keep the R0 sign-off + 8.8/10 table as historical record under a "R0 original sign-off (2026-08, hand-rolled Core DS CSS)" heading. New section: "R0.1 — UI kit migration + scope expansion" covering new routes shipped, kit adoption, responsive/keyboard results, which §63 journeys are automated vs manual, and updated known risks.
- `README.md` (prototype-focused) — route list updated to the full inventory, `.npmrc`/`GITLAB_NPM_TOKEN` prerequisite added if Phase 1 changed install, `visual:check` description updated.
- `README 2.md` (workspace-level) — fix the stale `cd design-output/my-ikame/prototype-app` path, update scope bullets to the expanded route set, note kit dependency. If it's a pure duplicate of `README.md` after edits, note the redundancy rather than deleting a file this phase doesn't need to remove.

### Final sweep greps (across `prototype-app/`, incl. `package.json`, `index.html`, `scripts/`)
`core-ds-1.1`, `app.css`, `@phosphor-icons/react`, `styles/`, `data-theme`, `to="/manager"`, `to="/"`, `href="/manager"`, `ContentCards`, `components/UI`.

**Also (red team, SA finding on fixture hygiene):** read through `src/data/mockData.ts` once specifically for names/teams/org fragments that read as plausible real ikame structure rather than obviously fictional — the mandatory-deny and out-of-scope fixtures were deliberately crafted to look like real sensitive content, which is exactly the risk if a real-sounding name slipped in during phases 3-7 authoring their own test data. This is a content read, not a grep pattern.

## Related Code Files

**Modify:** `prototype-app/scripts/visual-check.mjs`, `prototype-app/package.json` (drop `@phosphor-icons/react` if unused), `design-system-application.md`, `review-and-handoff.md`, `README.md`, `README 2.md`, `prototype-app/src/components/AppShell.tsx` (one-line integration: import `NotificationList` from `pages/NotificationsPage.tsx` and render it inside the notification `Drawer` body Phase 1 left as a placeholder — this is the one exception to "AppShell is Phase-1-owned," explicitly deferred here since it needs Phase 6's export to exist first), plus targeted a11y edits inside `prototype-app/src/**` (labels/alt/roles/headings only).

**Create:** none.

**Delete:** none (Phase 1 owns CSS deletion). Delete `prototype-app/src/components/UI.tsx` / `ContentCards.tsx` only if the sweep proves zero importers and Phase 1 left them behind.

## Implementation Steps

1. Confirm phases 2–7 are all done and `npm run typecheck && npm run build` is green before starting.
2. Wire the notification drawer: import `NotificationList` from `pages/NotificationsPage.tsx` into `AppShell.tsx`'s `Drawer` body, passing `compact`. Verify mark-read/mark-all-read still work from inside the drawer.
4. Run the sweep greps. Fix or delete every hit. Drop dead deps from `package.json`, re-run `npm install`.
5. Responsive sweep: `npm run dev`, walk all 14 routes at the three viewports in a real browser. Log each defect as one line (route / viewport / symptom) before fixing anything.
6. Fix responsive defects — Tailwind class tweaks and kit prop changes only. Escalate anything structural to a follow-up note.
7. Keyboard sweep: the 4-item checklist above, on Home, News detail, Event detail, Notification drawer. Log then fix; log the drawer/modal focus-trap result as an explicit pass/fail per interaction, not a single eyeballed check.
8. Apply surgical a11y fixes (`aria-label` on icon-only buttons, `alt` on avatars/images, heading levels, `role="status"` on receipts, `lang="vi"` on `<html>` if missing).
9. Update `visual-check.mjs` per Architecture; run `npm run visual:check` until green; eyeball all screenshots in `../deployments/visual-check/`.
10. Rewrite `design-system-application.md`.
11. Append the R0.1 section to `review-and-handoff.md` (results from steps 5–9 go here — including the §63 automated-vs-manual split and any deferred defects).
12. Update `README.md` + `README 2.md`.
13. Final gate: `npm run typecheck && npm run build && npm run visual:check` all green.

## Todo List

- [ ] Notification drawer wired to Phase 6's `NotificationList`, mark-read/mark-all-read verified from inside it
- [ ] Sweep greps clean; dead deps removed from `package.json`
- [ ] `mockData.ts` fixture content read through for accidental real-sounding names/teams
- [ ] Responsive pass at 1440×900 / 1024×768 / 390×844 across all 14 routes
- [ ] Mobile bottom nav operable, ≤5 items, 44px targets
- [ ] Sidebar collapse/expand verified desktop + tablet
- [ ] Keyboard 4-item checklist executed with explicit pass/fail log; defects fixed or logged
- [ ] Drawer/modal focus-trap + return-focus verified (not assumed)
- [ ] `visual-check.mjs` routes renamed + 3 new screenshots + forbidden assertion
- [ ] `design-system-application.md` rewritten for ui-kit
- [ ] `review-and-handoff.md` R0.1 section appended, R0 history intact
- [ ] `README.md` + `README 2.md` updated
- [ ] `typecheck && build && visual:check` all green

## Success Criteria

- Zero horizontal scroll at all three viewports on all routes (tablet + mobile asserted in script; desktop by inspection).
- Keyboard-only user can complete acknowledge and RSVP end-to-end (spec §63 J6) with focus visible throughout.
- Drawer closes on `Esc` and returns focus to the bell trigger.
- `npm run visual:check` green, ≥6 screenshots written to `../deployments/visual-check/`.
- `grep -r "core-ds-1.1\|app.css\|@phosphor-icons" prototype-app/` returns nothing.
- No root doc still describes hand-maintained CSS as the source of design truth.
- `review-and-handoff.md` still contains the original R0 score table.

## Risk Assessment

- **Defect pile-up:** parallel phases 2–7 may each ship small a11y/responsive gaps → this phase absorbs them all. Mitigation: log-then-fix (step 3/5) so scope is visible before hours are spent; anything structural becomes a follow-up, not scope creep here.
- **Kit-owned defects:** if a responsive/focus bug lives inside a kit component, don't patch with `!important` overrides — record it and pick a different kit component or a documented workaround.
- **Phase 1 route-rename drift:** if Phase 1 skipped the `visual-check.mjs` update, the script fails at step 1 rather than step 7 — check early.
- **Doc/reality drift:** write the doc updates *after* the QA passes, so they describe what shipped, not what was planned.

## Security Considerations

- The `/forbidden` assertion must check the DOM contains no blocked-resource title/summary/id (`expect(page.locator('body')).not.toContainText(<title>)`), not just that the URL changed.
- `.npmrc` / `GITLAB_NPM_TOKEN` must not appear literally in any README or committed file — document it as an env var only.
- Screenshots in `../deployments/visual-check/` contain only fictional mock data — confirm no real employee names/emails leaked into fixtures during phases 2–7 before publishing.

## Next Steps

- Plan complete after this phase. Handoff artifacts: updated `review-and-handoff.md`, screenshot set, `design-system-application.md`.
- Follow-ups for R1 (do not do here): axe/Playwright automation + full §49.2 test matrix, remaining 4 P0 journeys, NVDA/VoiceOver runs, contrast audit, mobile perspective-switch entry point (open since original R0 review).

## Unresolved questions

1. Does the kit ship a collapse toggle for `BlockSidebarLayout`, or is collapsed/expanded consumer-owned state? Changes whether "sidebar collapse works" is a verify or a build task — resolve in Phase 1, report forward.
2. `README.md` vs `README 2.md` — is the second file intentional (workspace vs app scope) or an accidental duplicate? Confirm with user before consolidating.
3. Is the original R0 8.8/10 review re-scored after migration, or is the R0.1 section qualitative only? Assumed qualitative unless told otherwise.
