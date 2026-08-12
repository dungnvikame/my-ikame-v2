# Phase 7 — Knowledge & Goals Shells (R2/R3 placeholders)

## Context Links

- [plan.md](./plan.md) — phase table, parallel execution rules
- [phase-01-foundation-and-ui-kit-migration.md](./phase-01-foundation-and-ui-kit-migration.md) — creates the two stub files this phase fleshes out; owns `App.tsx`/nav/`types`
- [research/researcher-01-ui-kit-primitives.md](./research/researcher-01-ui-kit-primitives.md) — `Alert` (variant/title/description/icon/action)
- [research/researcher-02-ui-kit-layout-and-blocks.md](./research/researcher-02-ui-kit-layout-and-blocks.md) — `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`
- Spec: §7.1 release table (R0 = shell only), §7.2 (Knowledge/Goal integration explicitly out of R1), §9.1/§9.2 nav ("Tri thức" `/knowledge`, "Mục tiêu" `/goals`, both marked *R0 shell*), §9.3 route inventory, §21 Knowledge (R2), §22 Goals (R3)

## Overview

- **Priority:** P3 — smallest phase; nothing depends on it.
- **Status:** Pending. **Effort:** 2h.
- Turn the two Phase-1 stubs into honest, good-looking "coming later" pages so the nav items (which ship in R0 per §9.1/9.2) don't dead-end. Each page: title, one paragraph previewing the target R2/R3 experience per spec, and a visibly non-functional CTA.

## Key Insights

- R0 scope is a **shell**, not a feature. Spec §7.1 puts Knowledge at R2, Goals at R3; §7.2 lists "Knowledge/Goal integration" as explicitly not-in-R1. A page that *looks* functional would misrepresent scope to prototype reviewers — worse than an obviously-unbuilt page.
- Therefore: **no search input, no filter chips, no goal list, no forms.** Static content + disabled CTA only. This is the single hard constraint of the phase.
- Content is not filler: it previews the real target experience (§21.1 native-vs-deep-link split; §22.1 four goal statuses) so a reviewer understands what the nav item will become.
- Detail routes (`/knowledge/:documentId`, `/goals/:goalId`) exist in §9.3, so they must resolve — but there is no mock document/goal to show. Render a "not available in R0" card with a back link. **Never echo the route param** into the DOM (§21.2: no leaking title/snippet/author of unauthorized docs; also avoids implying the id resolved to something real).
- Both files are ~100% composition of Phase-1-owned kit primitives — no new shared components, no new types, no mock data. If a piece of copy feels like it needs a fixture, it doesn't belong in R0.

## Requirements

### Functional
- `/knowledge` renders: page title "Tri thức", intro paragraph, R2 status `Alert`, feature-preview `Card`, disabled CTA `Button` "Tìm kiếm tri thức (sắp có ở R2)".
- `/goals` renders: page title "Mục tiêu", intro paragraph, R3 status `Alert`, feature-preview `Card` listing the four statuses from §22.1 as plain text (not as interactive filters), disabled CTA `Button` "Cập nhật tiến độ (sắp có ở R3)".
- `/knowledge/:documentId` and `/goals/:goalId` render a "chưa khả dụng ở R0" `Card` + enabled `Button`/`Link` back to `/knowledge` / `/goals`.
- Every disabled control carries a visible "(sắp có ở R2/R3)" label — disabled state alone is not an explanation.

### Non-functional
- Vietnamese copy, matching the rest of the app.
- TS strict, no `any`. Each file < 200 lines (repo convention); these should land near ~80.
- Keep the exact component export names Phase 1's `App.tsx` imports — renaming would force an edit to a file this phase does not own.
- Zero new imports outside `@frontend-team/ui-kit`, `react-router`, and the icon lib Phase 1 standardises on.

## Architecture

Two files, four components, no state, no effects, no context reads.

```
pages/KnowledgePages.tsx
  ├── KnowledgePage()        → /knowledge
  └── KnowledgeDetailPage()  → /knowledge/:documentId
pages/GoalPages.tsx
  ├── GoalsPage()            → /goals
  └── GoalDetailPage()       → /goals/:goalId
```

Shared page skeleton (repeated inline in both files rather than extracted — 2 usages, extraction would mean a new shared component in Phase-1 territory; DRY does not justify crossing an ownership boundary here):

```
<main>
  <h1>{title}</h1>
  <p>{one-paragraph what-this-will-do}</p>
  <Alert variant="info" title="Sắp có ở R{n}" description={scope note} />
  <Card>
    <CardHeader><CardTitle>Khi hoàn thiện, bạn sẽ có thể…</CardTitle></CardHeader>
    <CardContent>{static bullet list from spec §21/§22}</CardContent>
    <CardFooter><Button disabled>{cta} (sắp có ở R{n})</Button></CardFooter>
  </Card>
</main>
```

Copy source of truth (paraphrase, do not invent capabilities):
- Knowledge (§21.1): tìm kiếm và lọc tài liệu theo quyền truy cập; xem trước và đọc nhanh trong My iKame; mở sâu sang iWiki để soạn/sửa/duyệt. Note per §21.2 that search will be permission-aware.
- Goals (§22.1): xem mục tiêu theo trạng thái *Cần cập nhật · Đang đúng tiến độ · Có rủi ro · Hoàn thành*; xem tiến độ, chu kỳ, lần check-in gần nhất, hạn kế tiếp; check-in nhanh; mở sâu sang iGoal cho cấu hình/phê duyệt.

Detail pages: single `Card` — "Chi tiết tài liệu chưa khả dụng ở bản R0" / "Chi tiết mục tiêu chưa khả dụng ở bản R0" + short line + back `Button`. Do not call `useParams()` at all; there is nothing legitimate to do with the value.

## Related Code Files

**Modify:** `prototype-app/src/pages/KnowledgePages.tsx`, `prototype-app/src/pages/GoalPages.tsx` (both Phase-1 stubs; ownership transfers here once Phase 1 lands)

**Create:** none

**Delete:** none

**Explicitly off-limits (Phase-1-owned, frozen):** `src/App.tsx`, `src/AppState.tsx`, `src/types/index.ts`, `src/data/mockData.ts`, `src/components/*`

## Implementation Steps

1. Read the Phase-1 stubs; note the exact exported component names and how `App.tsx` imports them (default vs named). Preserve them.
2. Confirm kit import surface: `import { Alert, Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@frontend-team/ui-kit"` (package root only — kit rule, research-02 §"LLM usage rules"). Confirm `Button` supports `disabled`; if the kit exposes a different disabled affordance, use it rather than a raw `<button>`.
3. Write `KnowledgePage()` per the skeleton, with §21 copy and the disabled "Tìm kiếm tri thức (sắp có ở R2)" CTA.
4. Write `KnowledgeDetailPage()` — static not-available `Card` + back-to-`/knowledge` `Button` (`asChild` + react-router `Link`, or `navigate()`; whichever pattern Phase 1 established).
5. Mirror both in `GoalPages.tsx` with §22 copy, four status names as static text, disabled "Cập nhật tiến độ (sắp có ở R3)" CTA.
6. Layout with plain Tailwind utilities on the kit stylesheet (`max-w-3xl space-y-6 p-6` etc.) — no custom CSS file, no `styles/` additions.
7. `npm run typecheck && npm run build` — clean.
8. Manual pass: `/knowledge`, `/knowledge/anything`, `/goals`, `/goals/anything` — no console errors, nothing clickable that does nothing silently.

## Todo List

- [x] Phase 1 landed; stub export names confirmed
- [x] `KnowledgePage` — title + intro + R2 `Alert` + preview `Card` + disabled CTA
- [x] `KnowledgeDetailPage` — not-available `Card` + back link, no `useParams`
- [x] `GoalsPage` — title + intro + R3 `Alert` + four statuses as static text + disabled CTA
- [x] `GoalDetailPage` — not-available `Card` + back link
- [x] No inputs/lists/forms anywhere in either file (grep: no `<Input`, no `<Select`, no `<form`)
- [x] `npm run typecheck && npm run build` clean
- [x] All four routes visually checked in light + dark theme

## Success Criteria

- All four routes render a deliberate page — no blank screen, no "Coming in Phase 7" leftover text.
- A reviewer who has never read the spec can tell from the page alone: (a) what this module will do, (b) that it is not built yet, (c) which release it lands in.
- Zero interactive affordances that do nothing. Every control is either disabled+labelled or actually navigates.
- Files touched: exactly the two owned files. `git status`-equivalent shows nothing else.
- Both pages inherit `AppShell` chrome correctly (sidebar highlight on "Tri thức"/"Mục tiêu") without this phase touching `AppShell`.

## Risk Assessment

- **Scope creep into fake functionality** (highest risk): a search box or goal list "just for looks" makes the prototype dishonest and invites reviewers to test flows that don't exist. Mitigation: the grep check in the todo list is a hard gate.
- Phase 1 may name the exports differently than assumed → build break. Mitigation: step 1 reads the stubs first; never rename.
- Kit `Card` subcomponent names unverified against the installed package (docs-derived). Mitigation: verify at implementation time from the installed `.d.ts`; fall back to `<Card>` + plain divs if the composable parts differ.
- Sidebar may visually treat these as first-class features. Out of scope here (nav is Phase-1-owned); if it reads as misleading, raise it for Phase 8, don't patch `AppShell`.

## Security Considerations

- Do not read or render `:documentId` / `:goalId` — no `useParams()`, no echo into text or attributes. Prevents reflected-content issues and keeps §21.2 (no leaking metadata of unauthorized documents) trivially satisfied by construction.
- No fabricated document titles, author names, or goal owners in copy — invented names could be mistaken for real employee data in a demo.
- Deep links to iWiki/iGoal are **not** implemented in R0. Do not add outbound URLs with `returnUrl`/`source` params (§21.1) — that contract belongs to R2/R3.

## Next Steps

- Runs in parallel with phases 2–6; needs only Phase 1.
- Phase 8 picks these pages up for the responsive/a11y sweep (heading order, disabled-button contrast, `aria-disabled` vs `disabled` semantics for screen readers).
- When R2/R3 work starts, these files are the insertion point — the preview bullets become the real feature list.

## Unresolved Questions

1. Should the disabled CTAs use `disabled` (removes from tab order) or `aria-disabled` (focusable, announced)? Defaulting to `disabled`; flag to Phase 8 a11y pass.
2. Confirm the copy tone/wording for "sắp có ở R2/R3" with the product owner — release codenames may not be meaningful to usability-test participants ("sắp có" alone may read better).
