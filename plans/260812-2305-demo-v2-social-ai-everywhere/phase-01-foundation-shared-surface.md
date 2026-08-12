# Phase 1 — Foundation: Types, Fixtures, AppState Slices, Sidebar Categories, ⌘K Palette

## Context Links

- [plan.md](./plan.md) · [brainstorm-260812-2305](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md) (source of truth) · v1 foundation precedent: [v1 phase-01](../260812-2036-vision-demo-prototype/phase-01-foundation-types-state-stubs.md)
- Files read to ground contracts: `src/AppState.tsx`, `src/types/index.ts`, `src/data/mockData.ts`, `src/data/ai-scripts.ts`, `src/components/AppShell.tsx`, `src/pages/SearchPage.tsx`, `src/lib/audience.ts`

## Overview

- **Priority:** P0 — hard sequential prerequisite for phases 2-5. **Effort:** 1d. **Status:** pending.
- Land every shared contract the parallel phases consume: additive types, ALL fixtures enumerated below, AppState slices + mutators, extended `resetDemo`, categorized sidebar, `/community` route + stub, the full ⌘K SearchPalette (with an EMPTY answer store so Phase 6 fills answers without touching the palette), and CSS stubs imported from `main.tsx`.

## Key Insights

- v1 proved: **Phase 1 must ship every fixture downstream phases enumerated** — no phase discovers a missing fixture mid-parallel-run. Hence the exhaustive fixture list in §3.
- `main.tsx` is the CSS import bottleneck and is Phase-1-owned → create all per-phase CSS files empty now and import them all now.
- SearchPalette must be **complete** in Phase 1 (trigger, modal, grouped results, keyboard nav, Enter→`/search?q=`) and read AI answers through `findSeedAnswer()` from `data/search-answers.ts`, which returns `undefined` until Phase 6 fills the array. Zero palette edits in Phase 6.
- Live countdown + 6-month timeline need real timestamps: existing events only have `dateLabel`/`day`/`month` strings → add optional `startsAt` ISO field, populate for all events.
- Existing events span only THG 7-8 → a 6-month strip would be degenerate. Add 4 events (THG 9/9/10/11). Timeline insight line is **computed from live events**, never a hardcoded month (F2 spirit).
- `Citation` currently lives in `data/ai-scripts.ts`. Phase 1 declares it in `types/index.ts` for the search-answer store to reuse; ai-scripts.ts keeps its structurally identical local type (Phase 6 may re-point it — 1 line, sequential, safe).

## Requirements

### Functional
- New types compile; every addition to existing types is **optional** → existing pages untouched.
- AppState exposes new slices + mutators (§4) and `resetDemo()` restores all of them.
- Sidebar renders 3 categories; `/community` route resolves to a stub; mobile bottom-nav shows the fixed 5.
- ⌘K (and click on centered topbar search) opens the palette anywhere; ↑↓ navigates; Enter on a result navigates; Enter with no selection → `/search?q=<query>`; Esc closes and returns focus to the trigger. `/search` initializes from `?q=`.
- `npm run typecheck && npm run build` green; committed **before** phases 2-5 dispatch.

### Non-functional
- TS strict, no `any`. Files ≤200 lines (split palette into `SearchPalette.tsx` + `use-search-results.ts`).
- Palette respects `prefers-reduced-motion` (no entrance transform when set).

## Architecture

### 1. `types/index.ts` — additive

```ts
export type Citation = { title: string; source: string; href: string };

/** Feed */
export type ReactionKind = 'heart' | 'clap';
export type PostCover = { pattern: 'aurora' | 'grid' | 'wave' | 'confetti'; emoji: string; caption?: string };
export type Comment = { id: string; authorName: string; authorShort: string; role?: string; text: string; time: string };
export type Post = {
  id: string; authorName: string; authorShort: string; role: string;
  time: string; body: string; topic?: string;
  cover?: PostCover;
  official?: boolean; pinned?: boolean; pinnedUntilLabel?: string;
  mentionsMe?: boolean; saved?: boolean;
  reactions: Record<ReactionKind, number>;
  myReactions: ReactionKind[];
  comments: Comment[];
  audienceTeamIds?: string[]; // same audience contract as NewsPost/EventItem
};

/** Right rail + profile */
export type BirthdayPerson = { id: string; name: string; shortName: string; role: string; team: string; dateLabel: string; postId: string; congratulated: boolean };
export type Milestone = { id: string; name: string; shortName: string; years: number; dateLabel: string; note: string };
export type TopFan = { id: string; name: string; shortName: string; points: number; note: string };
export type DailyCheckIn = { done: boolean; mode?: 'WFO' | 'Remote'; timeLabel?: string };
export type LeaveBalance = { annualTotal: number; annualUsed: number; annualRemaining: number; carriedOver: number; sickUsed: number; insuranceLabel: string; healthCheckLabel: string };
export type Equipment = { id: string; name: string; model: string; serial: string; assignedAt: string; condition: string };
export type SeniorityEntry = { id: string; dateLabel: string; title: string; note: string };

/** Events upgrade */
export type EventAgendaItem = { time: string; title: string; speaker?: string };

/** Goals / OKR */
export type OkrLevel = 'company' | 'team' | 'personal';
export type KeyResult = { id: string; title: string; progress: number; unitLabel: string; status: GoalStatus };
export type Objective = {
  id: string; title: string; level: OkrLevel; parentId?: string;
  ownerName: string; ownerShort: string; progress: number; cycle: string;
  keyResults: KeyResult[]; linkedGoalId?: string;
};
export type CheckInReport = {
  id: string; goalId: string; goalTitle: string; authorName: string;
  periodLabel: string; progressBefore: number; progressAfter: number;
  content: string; blockers?: string; submittedAt: string; source: 'manual' | 'ai';
};

/** Search AI answers (store filled in Phase 6) */
export type SearchSeedAnswer = { id: string; keywords: string[]; question: string; level: AiLevel; paragraphs: string[]; citations: Citation[] };
```

Additive optional fields on existing types:
- `EventItem`: `startsAt?: string` (ISO w/ +07:00), `agenda?: EventAgendaItem[]`, `participantNames?: string[]`, `closingSoon?: boolean`, `registrationDeadlineLabel?: string`, `featured?: boolean`.
- `KnowledgeDoc`: `authorName?`, `authorShort?`, `emoji?`, `readingTime?`, `recommended?: boolean`, `recentlyViewedLabel?: string`.

### 2. `data/search-answers.ts` — new, EMPTY store (Phase 6 fills)

```ts
import type { SearchSeedAnswer } from '../types';
/** Seeded AI answers for the ~6 demo queries. Phase 6 fills this array; the palette never changes. */
export const searchSeedAnswers: SearchSeedAnswer[] = [];

export function findSeedAnswer(query: string): SearchSeedAnswer | undefined {
  const q = query.trim().toLocaleLowerCase('vi');
  if (q.length < 2) return undefined;
  return searchSeedAnswers.find((a) => a.keywords.some((k) => q.includes(k.toLocaleLowerCase('vi'))));
}
```

### 3. `data/mockData.ts` — fixtures (COMPLETE; downstream phases request nothing)

**`initialPosts: Post[]` — 9 posts, order = feed order (newest first after the pinned 3):**
| id | author | pinned/official | content gist | cover | reactions | comments |
|---|---|---|---|---|---|---|
| `post-pinned-culture` | iKame People (HR) | pinned + official, `pinnedUntilLabel: 'Ghim đến 31/08'` | Quy tắc văn hoá iKame 2026 | aurora 🏆 | 24/9 | 1 |
| `post-pinned-iconnect` | iKame People | pinned + official | iConnect tháng 8 · 20/08, link `/events/iconnect-2026-08` | confetti 🎉 | 31/12 | 2 |
| `post-pinned-wellness` | iKame People | pinned + official | Khám sức khoẻ định kỳ tháng 9, link doc phúc lợi | grid 🩺 | 12/3 | 0 |
| `post-mention-an` | Minh Trần (FE Dev) | `mentionsMe: true` | nhờ An review flow onboarding | — | 7/2 | 2 (drives mention banner) |
| `post-product-demo` | Lan Nguyễn (Product Designer) | — | recap Demo Day Core DS 1.1 | grid 🎨 | 18/6 | 2 |
| `post-birthday-vy` | iKame People | official | Chúc mừng sinh nhật Trần Ngọc Vy | confetti 🎂 | 15/8 | 2 (target of rail "Chúc") |
| `post-newcomer-huy` | iKame People | official | Chào Gia Huy gia nhập 17/08 | aurora 👋 | 21/5 | 1 |
| `post-running-club` | Hà Phạm (QA) | — | Running Club Hồ Tây cuối tuần | wave 🏃 | 9/4 | 3 |
| `post-tip-okr` | Tuấn Lê (BE Dev) | — | tip viết KR đo được, link doc `okr-template` | — | 6/1 | 1 |

Rules: `myReactions: []` on all seeds · comment authors drawn from existing roster (Lan, Minh, Hà, Tuấn, Ngọc Anh, Vy) · no real employee data · every comment ≤2 sentences.

**Rail fixtures:** `birthdays: BirthdayPerson[]` = 3 (Trần Ngọc Vy → `post-birthday-vy`; Lê Minh Quân, Data Analyst; Phạm Thu Hằng, HR Executive — each with own `postId`, so seed 2 extra tiny birthday posts OR point Quân/Hằng at `post-birthday-vy` — **decision: all 3 point to `post-birthday-vy`** (one shared birthday post, "Sinh nhật hôm nay" listing 3 names) → keeps feed lean, `congratulate` always has a target). `milestones: Milestone[]` = 2 (Lan Nguyễn 3 năm · Tuấn Lê 5 năm). `topFans: TopFan[]` = 5 (points 120→48, note = lý do "12 bài chia sẻ tuần này").

**`initialDailyCheckIn: DailyCheckIn` = `{ done: false }`.**

**Profile fixtures (An):** `leaveBalance` = `{ annualTotal: 12, annualUsed: 5, annualRemaining: 7, carriedOver: 2, sickUsed: 1, insuranceLabel: 'Bảo Việt An Gia — hiệu lực đến 31/12/2026', healthCheckLabel: 'Khám sức khoẻ định kỳ: 12/09/2026 (đã đặt lịch)' }` · `equipment` = 3 items (MacBook Pro 14" M3, màn hình Dell U2723QE, iPhone 13 test device — serial dạng `IK-2306-0142`) · `seniorityEntries` = 4 (gia nhập 01/06/2023 · lên Product Designer 01/2024 · giải iKame Star Q4-2025 · tròn 2 năm 06/2025).

**`knowledgeDocs` 5 → 12** (keep all 5 existing incl. `finance-budget-guideline` deny doc). Add 7, each with `authorName/authorShort/emoji/readingTime` + `recommended` on 4 + `recentlyViewedLabel` on 2:
`leave-request-process` (Quy trình xin nghỉ phép, Nhân sự, 🌴) · `benefits-insurance` (Phúc lợi & bảo hiểm, Phúc lợi, 🛡️) · `new-hire-handbook` (Sổ tay nhân viên mới, Nhân sự, 📘) · `okr-writing-guide` (Viết OKR chất lượng, Mục tiêu, 🎯) · `user-research-playbook` (Playbook nghiên cứu người dùng, Product, 🔍) · `core-ds-standard` (Chuẩn thiết kế Core DS 1.1, Design, 🎨) · `ask-ikame-guide` (Dùng My iKame & Ask iKame, Công cụ, ✨). Each: `summary` 1 câu + `body` 2-3 đoạn (đủ cho detail page + citations).

**`initialEvents` +4** (all `myRegistration: 'not_registered'`, `startsAt` populated, participantNames 4-6 initials-friendly names):
`hackathon-2026-09` (12/09, capacity 60 / remaining 29, `closingSoon: true`, `registrationDeadlineLabel: 'Đăng ký đóng 05/09'`) · `wellness-day-09` (26/09, capacity 80/remaining 52) · `town-hall-q3` (09/10, capacity 200/remaining 140) · `year-end-teaser` (20/11, capacity 300/remaining 300).
Also: add `startsAt` to all 8 existing events · `featured: true` on `iconnect-2026-08` (hero) · `agenda` (3-4 mốc) on `iconnect-2026-08`, `ai-product-workshop`, `hackathon-2026-09`, `town-hall-q3` · `participantNames` on all upcoming.
**(F3) Keep the reservation comment** on `ai-product-workshop`: reserved for the A4 execute script — no new fixture/flow may pre-register it.

**`okrTree: Objective[]` — 7 objectives, flat + `parentId` (page builds the tree):**
- `okr-company-growth` (company, Ban Lãnh Đạo, 62%, cycle `H2-2026`, 3 KRs)
- `okr-team-product` (team, Trần Thanh Mai, 58%, parent = company, 3 KRs)
- `okr-team-people` (team, Phạm Thu Hằng, 71%, parent = company, 2 KRs)
- 4 personal objectives (An), parent = `okr-team-product`, each `linkedGoalId` → the 4 existing `initialGoals` ids (`goal-design-refresh`, `goal-onboarding-journey`, `goal-research-repo`, `goal-a11y-audit`), 2 KRs each, `progress` mirroring the linked goal's progress.
**Cycle decision:** OKR nodes use `cycle: 'H2-2026'`; personal `Goal.cycle` stays `'Q3-2026'` (Q3 ⊂ H2 — coherent, no existing fixture edits). Selector shows `H2 2026` with `H1 2026` present but empty-state.

**`initialCheckInReports: CheckInReport[]` = 2** (đã có sẵn cho `goal-onboarding-journey` và `goal-research-repo`, `source: 'manual'`) — so "Tổng hợp báo cáo" is never empty before the demo submit.

### 4. `AppState.tsx` — new slices + mutators

```
posts: Post[]                     addPost({ body, cover?, official? })  // prepends, author = current user, time 'Vừa xong'
                                  toggleReaction(postId, kind)          // count ±1, myReactions add/remove
                                  addComment(postId, text)              // author = current user, time 'Vừa xong'
                                  toggleSavePost(postId)
birthdays: BirthdayPerson[]       congratulate(birthdayId)              // marks congratulated + addComment on person.postId
dailyCheckIn: DailyCheckIn        submitDailyCheckIn(mode)              // { done: true, mode, timeLabel: <HH:MM now> }
checkInReports: CheckInReport[]   submitReport(input)                   // prepends report AND flips linked goal
searchOpen: boolean               setSearchOpen(open)
milestones / topFans / leaveBalance / equipment / seniorityEntries / okrTree   (read-only pass-through, no mutators — YAGNI)
```
- `submitReport` is the single mutator for the money moment: prepends the report, then updates the linked `Goal` (`status: 'on_track'`, `lastCheckIn: 'Vừa xong'`, `progress: input.progressAfter`). Do NOT duplicate `checkInGoal` logic in the page (DRY).
- `congratulate` reuses the same comment-append reducer as `addComment` (extract a local `appendComment(posts, postId, comment)` helper).
- **resetDemo extended:** `setPosts(initialPosts)`, `setBirthdays(initialBirthdays)`, `setCheckInReports(initialCheckInReports)`, `setDailyCheckIn(initialDailyCheckIn)`, `setSearchOpen(false)` + existing resets + `demoResetCount++`. **Gate:** grep `useState(` in AppState.tsx — every one needs a reset line (F4). Theme/perspective still NOT reset (F13).
- Memo dep array must include every new stateful slice.

### 5. `AppShell.tsx` — sidebar categories + centered search + palette

```ts
const navGroups = (perspective) => [
  { label: 'KHÔNG GIAN CỦA BẠN', items: [Trang chủ|Tổng quan?, Cộng đồng /community, Tin tức, Sự kiện] },
  { label: 'PHÁT TRIỂN',        items: [Tri thức, Mục tiêu] },
  ...(perspective === 'manager' ? [{ label: 'QUẢN LÝ', items: [Tổng quan /manager/overview, Đội ngũ /manager/team] }] : []),
];
```
- iKamer group 1 starts with `Trang chủ /home`; manager group 1 omits `Trang chủ` (their home is Tổng quan in group QUẢN LÝ). Footer keeps `Tầm nhìn`.
- **Mobile bottom-nav = fixed 5** (not `navItems.slice(0,5)`): iKamer → Trang chủ, Cộng đồng, Sự kiện, Tri thức, Mục tiêu · manager → Tổng quan, Cộng đồng, Sự kiện, Tri thức, Mục tiêu.
- Topbar: search trigger moves to the **center** (`app.css` grid: `[mobile-logo] [1fr search] [actions]`); becomes a `<button>` calling `setSearchOpen(true)` (no longer a `NavLink`), keeps the `⌘K` kbd hint. Global listener: `keydown` on window → `(e.metaKey||e.ctrlKey) && e.key === 'k'` → `preventDefault(); setSearchOpen(true)`; also `/` ignored (avoid typing traps). Render `<SearchPalette />` next to `<AskIKamePanel />`.
- Icon for Cộng đồng: `UsersThree` (already imported) or `ChatsCircle` from phosphor.

### 6. `components/search/` — full palette (Phase-1 owned, frozen)

- `use-search-results.ts`: `useSearchResults(query)` → `{ groups: { key: 'news'|'events'|'docs'|'goals'|'people'; label; items: {id,title,meta,href}[] }[]; flat: item[]; count }`. Filters with `isEligible(user, audienceTeamIds)`, excludes expired news / past+cancelled events, min 2 chars, `toLocaleLowerCase('vi')` matching. People group = `teamMembers` + `users` roster (href `/profile` for self, `/manager/team` otherwise).
- `SearchPalette.tsx`: `role="dialog" aria-modal`, backdrop click + Esc close (focus back to trigger), autofocus input, `aria-activedescendant` on the highlighted row, ↑↓ cycles `flat`, Enter → navigate (close) / no selection → `navigate('/search?q=' + encodeURIComponent(q))`, empty query → suggestion chips (`nghỉ phép`, `OKR`, `iConnect`, `phúc lợi`, `bảo mật`, `check-in` — the 6 seeds, so the demo path is discoverable).
- AI answer slot: `const answer = findSeedAnswer(query)` rendered **above** groups when defined (`AiBadge level={answer.level}` + paragraphs + citation links); when `undefined` and query ≥2 chars, render the soft note: *"Trả lời AI tổng hợp sẽ mở rộng thêm chủ đề — hiện hiển thị kết quả tìm kiếm."* Phase 6 only fills the array (D4: never "đơ").

### 7. `pages/SearchPage.tsx` — `?q=` init only

`useSearchParams()` → seed `query`/`applied` on mount so palette-Enter lands on populated results. Nothing else (Phase 6 adds the AI answer block).

### 8. Stubs + CSS

- `pages/CommunityPage.tsx` — heading placeholder ("Cộng đồng" + 1 dòng); default export not required, named export `CommunityPage`.
- CSS created empty w/ header comment + imported in `main.tsx`: `search-palette.css` (Phase 1 fills), `community.css`, `events-v2.css`, `goals-v2.css`, `profile-v2.css`. `knowledge-goals.css` already exists (Phase 4 appends).
- `App.tsx`: `<Route path="/community" element={<CommunityPage />} />` — both perspectives, no guard.

## Related Code Files

**Modify:** `src/types/index.ts`, `src/AppState.tsx`, `src/data/mockData.ts`, `src/App.tsx`, `src/components/AppShell.tsx`, `src/pages/SearchPage.tsx`, `src/main.tsx`, `src/styles/app.css`
**Create:** `src/data/search-answers.ts`, `src/components/search/SearchPalette.tsx`, `src/components/search/use-search-results.ts`, `src/pages/CommunityPage.tsx` (stub), `src/styles/search-palette.css`, `src/styles/{community,events-v2,goals-v2,profile-v2}.css` (empty)
**Delete:** none. **NOT touched:** `EventPages.tsx` (P3), `KnowledgePages.tsx` (P4), `GoalPages.tsx` (P5), `ProfilePage.tsx`/`ai-scripts.ts`/`assistant/**` (P6).

## Implementation Steps

1. Types (§1) + `Citation`. 2. `search-answers.ts` empty store (§2). 3. Fixtures (§3) in dependency order: posts → birthdays/milestones/topFans → profile fixtures → knowledge docs → events (+startsAt/agenda/participants) → okrTree → checkInReports. 4. AppState slices/mutators + resetDemo sweep (§4). 5. `use-search-results.ts` then `SearchPalette.tsx` + `search-palette.css` (§6). 6. AppShell nav groups + centered trigger + ⌘K listener + palette mount (§5). 7. `SearchPage` `?q=` (§7). 8. Stub page + CSS files + `main.tsx` imports + `/community` route (§8). 9. `npm run typecheck && npm run build`. 10. Manual smoke: ⌘K opens/closes, arrow+Enter navigates, sidebar groups correct in both perspectives, `/community` renders, `resetDemo()` from ProfilePage button still works. 11. Commit `feat: demo v2 foundation — feed/OKR/profile fixtures, AppState slices, sidebar categories, ⌘K palette` → then dispatch phases 2-5.

## Todo List

- [ ] Types additive (+ optional fields on EventItem/KnowledgeDoc); no existing page breaks
- [ ] `search-answers.ts` empty store + `findSeedAnswer`
- [ ] Fixtures: 9 posts · 3 birthdays · 2 milestones · 5 topFans · dailyCheckIn · leave/equipment/seniority · 12 docs · +4 events & startsAt/agenda/participants on all · 7 OKR nodes · 2 seed reports
- [ ] AppState: posts+3 mutators, congratulate, dailyCheckIn, checkInReports+submitReport, searchOpen, read-only slices, resetDemo covers ALL (grep gate)
- [ ] SearchPalette + use-search-results (keyboard nav, audience filter, AI slot + off-seed note)
- [ ] AppShell: 3 nav categories, fixed 5 bottom-nav, centered search button, ⌘K listener, palette mount
- [ ] SearchPage `?q=` init; `/community` route + stub; CSS stubs imported in main.tsx
- [ ] typecheck + build green; smoke; committed before dispatch

## Success Criteria

- All v1 flows unchanged (ack, RSVP, notifications, Ask panel, /vision).
- ⌘K works from every route; Enter with no selection lands on `/search?q=` with results already applied.
- `resetDemo()` restores feed/birthday/report/check-in state (verify by posting, reacting, congratulating, then reset).
- Phases 2-5 can import every fixture/mutator they need — zero blockers filed for missing contracts.

## Risk Assessment

- **Fixture volume → mockData.ts grows past a comfortable size** (521 lines now). Mitigation: if it exceeds ~900 lines, split into `src/data/community-data.ts` + `src/data/people-data.ts` re-exported from `mockData.ts` (keeps every downstream import path stable). Decide during step 3, not later.
- **⌘K conflicts with browser/OS shortcut** → `preventDefault()`; verify in Chrome + Safari.
- **Centered search grid breaks the 1024px band** → check topbar at 1024px and mobile before commit (bottom-nav band hides the trigger label, keeps the icon).
- **resetDemo misses a slice** → grep-based checklist is the gate, run it explicitly.

## Security Considerations

Mock-only, no network. Palette reuses `isEligible` for demo-fidelity permission filtering (not a real boundary — framing note already in `lib/audience.ts`). No real employee data in any new fixture.

## Next Steps

Commit → dispatch phases 2-5 in parallel. Each phase reads landed contracts from the real files, not from this doc.
