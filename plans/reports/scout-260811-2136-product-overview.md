# Scout Report — My iKame R0 Prototype: Product & Codebase Overview

## What My iKame is

Employee Experience **Gate**, not god-app — role-based entry point surfacing short, cross-domain tasks/content, deep-linking out to iGoal/iWiki/iHiring/iRefer/HRIS for deep work (`My-iKame-Product-Spec-v0.2.md:6-48`). Two audiences only: **iKamer** (daily driver: read/join/do today) and **Manager** (+ triage team exceptions). **Operations** is backstage-only (authors/publishes via My iKame Studio, never in nav) — spec §4.3/D2.

9 executive decisions (D1-D9, spec:34-44) frame it: gate not super-app, iKamer+Manager only, action-before-info Home, Manager = attention canvas not BI dashboard, rule-based (non-ML) personalization at this stage, H2 production = Newsfeed+Event only, modular core+BFF+adapters, permission-aware-by-construction, AI as later accelerant.

## Release slices

- **R0 (this repo)** — vibe-code prototype: IA/card-hierarchy validation, app shell, iKamer Home, Manager Overview, News, Event, notif/search shells, mock data only.
- **R1** — production Newsfeed+Event, Keycloak SSO, audience rules, read/ack, RSVP/calendar, notifications, analytics/audit.
- R2 Knowledge read pilot (iWiki) — R3 Goal action pilot (iGoal) — R4 AI read-only — R5 assisted/confirmed AI action.

Non-goals (spec §6): no replacing domain tools, no Ops console in nav, no full social network at H2, no page-builder/microfrontend runtime/generic workflow engine in prototype, no AI deciding permissions/auto-publishing, no vanity dashboards, Manager never sees outside granted scope.

## Feature modules (spec sections 14-23)

| Feature | Route | Notes |
|---|---|---|
| iKamer Home | `/home` (proto: `/`) | priority hero(1) → active items(≤3) → quick actions(≤4) → news(≤4) → events(≤2); deterministic eligibility+ranking P0-P5 |
| Manager Overview | `/manager/overview` (proto: `/manager`) | "Requires attention" queue(≤5), team snapshot ≤3 KPIs, no vanity charts |
| My Team | `/manager/team` | search/filter direct reports |
| Newsfeed | `/news` | **read** (dwell-time, system) vs **acknowledge** (explicit click, append-only, revision-tied) — core rule spec§17.3; lifecycle Draft→...→Archived |
| Events | `/events` | RSVP state machine NotRegistered→Going/Waitlisted→Attended/NoShow; idempotent RSVP |
| Notification Center | `/notifications` | priority tiers Critical/Required/Transactional/Informational/Social; dedup key `userId+eventType+entityId+window` |
| Global Search | `/search` | R1 = News+Event only; permission filter before results leave search service |
| Knowledge / Goals | `/knowledge` `/goals` | shells only in R0, native = search/preview/simple check-in, authoring stays deep-link |
| AI Assistant | — | R4/R5, maturity ladder A0→A4, must cite sources / say "Không đủ dữ liệu" |

Nav uses need-based Vietnamese labels not tool names (spec §8): Tin tức, Sự kiện, Việc của tôi, Tìm kiếm, Tri thức, Mục tiêu, Tổng quan đội ngũ (Manager). Dual-role users get a perspective switcher (changes home perspective, not identity).

## Core DS 1.1 rules (`design-system-application.md`)

Three-tier surface: sidebar `bg_sidebar_secondary` / work area `bg_secondary` / focal `bg_primary`, `bg_tertiary` for filters/metadata. **Max one orange Primary CTA per screen**, everything else Dim/Borderless/link/neutral. Tokens only from `core-ds-1.1.css` — no raw brand colors. Radius: `radius_6` buttons/nav, `radius_8` compact, `radius_12` focal. Shadow reserved for notification drawer only. Inter font, `body_s` baseline for UI, `body_m` only for long-form reading.

## Data model (spec Part F, §28-34)

- `Capability` enum (news.read/acknowledge, event.read/rsvp, knowledge.search, goal.read.self/checkin.self, manager.overview.read/team.read/goal.attention.read, ai.ask) — backend-computed, UI never role-string-checks.
- `UserContext` — subjectId/personId/perspective/availablePerspectives/orgPathIds/managementScopeIds/capabilities/contextVersion.
- `AudienceRule` — versioned policy (org_unit/location/group/manager_scope depth 1|2/employment_attribute/all_active_ikamers), not a static list.
- `ExperienceCard` — universal card contract: kind/source/priorityBand(P0-P5)/severity/primaryAction/capability/permissionDecisionId/audienceDecisionId.
- `NewsPost`/`Event` — PublicationState lifecycle, mandatory block (reason/dueAt/acknowledgementRevisionId), EventRegistrationState.
- `ManagerAttentionItem` — managerScopeId/subjectRefs/ruleId+Version/evidence[]/severity/state.
- `SearchDocument` — contentType/aclRefs/sensitivity/authority. `NotificationMessage` — priority/deduplicationKey/sensitive.
- Roles/RACI (spec §44): Author/Editor/Publisher/Event Operator/Moderator/Analyst/Platform Admin/Auditor — Author cannot publish; mandatory company-wide content needs two-person control.

## Codebase (`prototype-app/`)

React 18.3 + TypeScript 5.9 + Vite 7 + React Router v7 + `@phosphor-icons/react`. Run: `npm install --cache /tmp/myikame-npm-cache && npm run dev -- --host 127.0.0.1`. Verify: `npm run typecheck && npm run build && npm run visual:check` (Playwright + packaged headless Chromium, writes to `../deployments/visual-check/`).

**Architecture**
- [App.tsx](prototype-app/src/App.tsx) — `BrowserRouter` → `AppStateProvider` → `AppShell`. `PerspectiveGuard` (App.tsx:12-16) redirects `/` / `/manager*` if current `perspective` mismatches route audience.
- [AppState.tsx](prototype-app/src/AppState.tsx) — single Context: `perspective`, `user`, `news`, `events`, `notifications`, `theme`, `notificationOpen` + mutators (`acknowledgeNews`, `toggleRegistration`, `markNotificationRead(All)`, `setPerspective`, `setTheme`). In-memory only via `useState`, resets on refresh. `user` derived from `perspective` (manager→`users.mai`, else→`users.an`).
- Perspective switch UI: `PerspectiveSwitch` in [AppShell.tsx:39-54](prototype-app/src/components/AppShell.tsx) — sets state AND navigates.

**Routes** (all in App.tsx:22-31): `/` HomePage · `/manager` ManagerPage · `/manager/team` TeamPage · `/news` + `/news/:postId` NewsPage/ArticlePage · `/events` + `/events/:eventId` EventsPage/EventDetailPage · `/search` SearchPage · `/not-found`, `*` NotFoundPage.

**Types** ([types/index.ts](prototype-app/src/types/index.ts)): `Perspective`, `User`, `NewsPost`, `EventItem`, `AttentionItem`, `NotificationItem`.

**Mock data** ([data/mockData.ts](prototype-app/src/data/mockData.ts)): 2 users (an=iKamer, mai=Manager), 4 news (1 mandatory unacked), 3 events (going/open/full), 3 attention items (critical/warning/info), 3 notifications (2 unread).

**Components**: [AppShell.tsx](prototype-app/src/components/AppShell.tsx) (sidebar/topbar/notif drawer/mobile bottom nav), [ContentCards.tsx](prototype-app/src/components/ContentCards.tsx) (NewsCard/EventCard/AttentionCard/QuickAction, pure presentational), [UI.tsx](prototype-app/src/components/UI.tsx) (Button/IconButton/SectionHeader/StatusPill/SourceLine/EmptyState/PriorityIcon).

**CSS**: [core-ds-1.1.css](prototype-app/src/styles/core-ds-1.1.css) (826 lines, generated design tokens, light `:root`/dark `[data-theme="dark"]`) + [app.css](prototype-app/src/styles/app.css) (1846 lines, feature CSS built on tokens).

## Task worklog (`task-worklog/local-001-r0-prototype/v1/`)

Task `local-001`: build R0 prototype from spec v0.2, via Codex Work Mode, status Completed locally, no Asana board connected. Plan chose three-tier SaaS shell pattern; routes/components as planned matched what shipped. Review scores avg **8.8/10** (10 categories, all pass on Core DS rules, no hard-fails). Reusable for production: shell/nav, card/button/section patterns, route structure, typed mock contracts. Mock-only: perspective identity, all News/Event/Manager data, ack/RSVP/notif mutations. Needed for real R1: Keycloak/OIDC UserContext, RTK Query/OpenAPI client, server-authoritative ack/RSVP idempotency, audience/permission enforcement, analytics/audit/feature flags.

## Unresolved questions / gaps

- Spec §70 decision log has 10 open questions with safe defaults — most consequential: News/Event source of truth (Q1), who can set `mandatory` (Q2, default Publisher-only + two-person control), audience dynamic-at-view vs snapshot-at-publish (Q3), Manager scope depth (Q4, default 1), comment moderation SLA (Q5, default off), event waitlist atomicity owner (Q6), iWiki/iGoal API/ACL readiness for R2/R3 (Q9/Q10).
- `review-and-handoff.md` claims dark-mode Core DS treatment complete, but the only concrete dark-mode evidence is the `[data-theme="dark"]` block in `core-ds-1.1.css` — worth a visual spot-check, not just a token-file check.
- `TeamPage.tsx:5-12` has its own untyped hardcoded 6-person `team` array, disconnected from `mockData.ts`/`AppState` and from the shared type system — duplicate source of truth for headcount.
- Manager `attentionItems` bypass `AppState` entirely (imported straight from `mockData.ts` into `ManagerPage`/`TeamPage`) — read-only, no "resolve attention item" action, unlike `acknowledgeNews`/`toggleRegistration`.
- `AppState.tsx:48` links notification→news via `href.endsWith(id)` substring match rather than explicit FK — fragile if ids collide as suffixes.
- Hardcoded copy not derived from state: `HomePage.tsx:16` static date string "THỨ BA · 11 THÁNG 8"; `ManagerPage.tsx:15-16` hardcoded "3 việc cần chú ý"/"6 thành viên" independent of actual array lengths.
- No mobile entry point for perspective switching yet (flagged in review doc, confirmed in `AppShell.tsx` bottom nav — only mirrors top nav items, no switcher).
- `scripts/visual-check.mjs` not read in this pass — worth checking if visual-check tooling itself ever needs auditing.
