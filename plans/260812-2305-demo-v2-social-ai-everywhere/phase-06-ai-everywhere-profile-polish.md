# Phase 6 — AI Everywhere, Seeded Search Answers, Hồ sơ, R-badge Sweep, Presenter Script v3

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-shared-surface.md) · [brainstorm §2/§4/§7/§8](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md)
- Read before coding: `src/data/ai-scripts.ts` (AiScript/ScriptCtx/action contract), `src/components/assistant/{AskIKamePanel,AiActionBlock,AiMessage,use-ask-conversation}.tsx|ts`, `src/data/search-answers.ts` (empty store from Phase 1), `src/pages/ProfilePage.tsx`, `src/components/search/SearchPalette.tsx`, `docs/demo-presenter-script-bld.md`
- Runs **after** phases 2-5 land (needs their routes/flows live).

## Overview

- **Priority:** P1 — sequential last, cross-cutting. **Effort:** 2d. **Status:** pending.
- Six deliverables: (1) new AI scripts for every module, (2) the 6 seeded search answers, (3) full ProfilePage rebuild, (4) R-badge removal sweep, (5) presenter script v3, (6) smoke checklist + final commit.

## Key Insights

- **Engine stays; only the store grows.** Two mechanical extensions are needed, both minimal-diff: `ScriptCtx` gains live slices (posts/birthdays/docs/leave/goals/events), and the existing `draft` action gains an optional `commit` so an approved draft can *write* to the app instead of only printing a receipt.
- **(F2) Every new script reads live ctx.** Never hardcode counts, names, or dates that state can change (post count, birthday congratulated flag, registration status, goal progress).
- **(F2b) Every mutating script carries `isApplicable(ctx)`** → no birthday draft when everyone is already congratulated; no report draft when no goal needs updating. The panel already renders the "already handled" branch (`turn.already`).
- **(F3) Do not touch `ai-product-workshop`** in the new `/events` A2 chip — it suggests, it does not register; A4 keeps exclusive rights to that event.
- **D4 no-dead-end rule**: off-seed queries already show normal results + soft note (Phase 1). This phase only fills the array.
- R-badge sweep is *render-site only*; `RBadge.tsx` and `/vision` badges stay (30-min revert path for a future investor pitch).

## Requirements

### 1. Script store extensions (`src/data/ai-scripts.ts`)

`ScriptCtx` additions (all live from AppState): `posts: Post[]`, `birthdays: BirthdayPerson[]`, `upcomingEvents: EventItem[]` (sorted by `startsAt`), `eligibleDocs: KnowledgeDoc[]`, `goals: Goal[]`, `leaveBalance: LeaveBalance`, `userName: string`.

Action contract extension (single optional field, no new kind):
```ts
| { kind: 'draft'; draftText; confirmLabel; receipt; isApplicable;
    /** what the approved draft commits to. default 'message' = receipt only (v1 behavior) */
    commit?: 'message' | 'post' | 'report';
    buildReport?: (ctx: ScriptCtx, text: string) => Omit<CheckInReport, 'id' | 'submittedAt'>;
    buildPost?: (ctx: ScriptCtx, text: string) => { body: string; cover?: PostCover; official?: boolean } }
```
`use-ask-conversation.ts`: signature becomes `useAskConversation(demoResetCount, actions)` where `actions = { setEventRegistration, addPost, submitReport }`; `sendDraft` switches on `commit` and calls the matching mutator with the **user-edited** `draftText` before setting the receipt. Double-click lock (`lockRef`) is already there — keep it.

**New scripts (6):**
| id | route(s) | chip | level | behavior |
|---|---|---|---|---|
| `c1-community-hot` | `/community` | Tuần này có gì hot? | A2 | top post by `reactions.heart + reactions.clap` + birthday names + nearest upcoming event, all from live ctx; citations → post/`/community`, `/events/:id` |
| `c2-birthday-wish` | `/community` | Soạn lời chúc sinh nhật | A3 | `isApplicable`: some birthday not `congratulated`; draft = warm 2-sentence VN wish naming that person; `commit: 'post'` → `addPost({ body, cover: { pattern: 'confetti', emoji: '🎂' } })`; receipt: "Đã đăng lời chúc lên Cộng đồng · #RCPT-xxxx" |
| `e2-events-suggest` | `/events`, `/events/:eventId` | Tuần này nên tham gia gì? | A2 | 2-3 nearest upcoming events + your live `myRegistration` per event + `closingSoon` warning; explicitly says which ones you already registered for |
| `k2-newcomer-docs` | `/knowledge`, `/knowledge/:documentId` | Tài liệu cho người mới? | A2 | curated 3 from `eligibleDocs` (`new-hire-handbook`, `leave-request-process`, `ask-ikame-guide`) + citations; Finance deny script untouched |
| `g3-checkin-report` | `/goals`, `/goals/:goalId` | Soạn báo cáo check-in tuần | A3 | `isApplicable`: `goals.some(status === 'needs_update')`; draft references that goal's title/progress/lastCheckIn; `commit: 'report'` + `buildReport` (progressAfter = min(progress+10,100), `source: 'ai'`); receipt: "Đã gửi báo cáo · #RCPT-xxxx — hiện trong Tổng hợp báo cáo" |
| `p2-leave-balance` | `/profile` | Tôi còn bao nhiêu ngày phép? | A2 | reads `leaveBalance` (remaining/used/carried) + insurance + health-check line; citations → `leave-request-process` doc + `/profile` |

Keep all v1 scripts (S1, S2, S2b-deny, S3 manager, S4, fallback) unchanged. Add `/community` + `/profile` to the deny script's pinned route list so the permission beat is reachable from the new pages too.

### 2. Seeded search answers (`src/data/search-answers.ts`)

Fill 6 `SearchSeedAnswer` entries, `level: 'A2'`, 2-3 paragraphs each, 1-2 citations each (real hrefs only):
| keywords | answer gist | citations |
|---|---|---|
| `nghỉ phép`, `ngày phép` | phép năm 12 ngày, quy trình xin nghỉ, số ngày còn lại xem ở Hồ sơ | `/knowledge/leave-request-process`, `/profile` |
| `OKR`, `mục tiêu` | chu kỳ H2 2026, cấu trúc O→KR, nơi check-in | `/knowledge/okr-writing-guide`, `/goals` |
| `iConnect` | iConnect tháng 8 · 20/08, cách đăng ký | `/news/iconnect-august`, `/events/iconnect-2026-08` |
| `phúc lợi`, `bảo hiểm` | gói bảo hiểm + khám sức khoẻ định kỳ | `/knowledge/benefits-insurance` |
| `bảo mật`, `an toàn thông tin` | chính sách bảo mật mới + hạn xác nhận | `/news/security-update`, `/knowledge/security-policy-guide` |
| `check-in` | nhịp check-in tuần, cách tạo báo cáo | `/goals`, `/knowledge/okr-writing-guide` |

Answers must not contradict fixtures (cross-check numbers against `mockData.ts`). `/search` page (`SearchPage.tsx`): render the same answer block above results (AiBadge + paragraphs + citations) via `findSeedAnswer(applied)`, plus the off-seed soft note. Palette component itself is **not** edited.

### 3. ProfilePage full rebuild (`src/pages/ProfilePage.tsx`)

Sections in order (all mock, all from AppState):
1. **Header**: large initials avatar, name, role, team, contact rows (email `an.nguyen@ikameglobal.com`, Slack `@an.nguyen`, timezone), `Nhân viên chính thức` pill.
2. **Tổ chức**: manager card (Trần Thanh Mai) + đồng đội mini list (from `teamMembers` same `teamId`, max 5, initials avatars).
3. **Thâm niên & cột mốc**: `seniorityEntries` vertical timeline + "Thâm niên: 2 năm 2 tháng" summary (label from fixture, not computed).
4. **Nghỉ phép & phúc lợi**: `leaveBalance` — remaining/total ring or bar, used, carried over, sick used, `insuranceLabel`, `healthCheckLabel`. This is the source the `p2-leave-balance` chip cites (numbers must match).
5. **Thiết bị được cấp**: `equipment` table/cards (name, model, serial, assignedAt, condition).
6. **Hoạt động gần đây** (live): acknowledged news, registered/waitlisted events, submitted reports, posts authored by the user — derived from live state, newest-ish order, max 6, each linking to its object. Empty-state line if nothing yet.
7. **Hiển thị** (theme toggle) + **Demo** (reset button) blocks — carry over from v1 unchanged in behavior.

New CSS in `src/styles/profile-v2.css` (created empty + imported in Phase 1), classes prefixed `profile-`.

### 4. R-badge sweep (D2)

- Remove `<RBadge/>` render + import from `src/components/assistant/AskIKamePanel.tsx` (header) — keep/keep-visible the single disclosure line in the panel ("Concept: iKame trả lời bằng kịch bản dựng sẵn…"); merge the R4 wording into that one line so nothing is lost.
- `src/pages/manager/ManagerAiBrief.tsx`: replace `<RBadge tag="R4" />` with `<AiBadge level="A3" />` if no AiBadge is already present there; otherwise just remove it.
- Phases 4 and 5 already removed their own module-header badges. **Gate:** `grep -rn "RBadge" src` returns only `components/RBadge.tsx` and `pages/VisionPage.tsx`.

### 5. Presenter script v3 (`docs/demo-presenter-script-bld.md`)

Update in place (v3 header + changelog line): new stop **Cộng đồng** (composer → reaction → birthday "Chúc" → AI hot-topics → AI birthday post), upgraded **Events** stop (hero countdown + timeline + tabs), **⌘K search** beat (type `nghỉ phép` → AI answer + citations → Enter → /search), **Mục tiêu** stop (OKR tree → AI drafts report → approve → report + status flip), **Hồ sơ** stop (leave balance chip), sidebar-category talking point, and the D2 note that module headers no longer carry R-badges (AI answers still labeled). Keep the F3 event-reservation rule and the reset-between-runs rule.

### 6. Smoke checklist (in the presenter script, "Kiểm tra trước khi diễn")

`typecheck` · `build` · then click-through: sidebar 3 groups both perspectives · ⌘K from 3 different routes (seed + off-seed query) · post/react/comment/congratulate · events hero countdown + all 4 tabs + one RSVP + one waitlist · knowledge hero search + Finance doc still hidden · goals report submit → status flip · profile all 7 sections · all 6 new chips + 6 v1 chips on their routes · light/dark · 1024px band · `resetDemo` → every module back to opening state <5s.

## Related Code Files

**Modify:** `src/data/ai-scripts.ts`, `src/data/search-answers.ts`, `src/components/assistant/{AskIKamePanel.tsx,use-ask-conversation.ts,AiActionBlock.tsx}`, `src/pages/ProfilePage.tsx`, `src/pages/SearchPage.tsx`, `src/pages/manager/ManagerAiBrief.tsx`, `src/styles/profile-v2.css`, `docs/demo-presenter-script-bld.md`
**Create:** `src/pages/profile/` subcomponents only if `ProfilePage.tsx` exceeds 200 lines (likely: `ProfileOrgSection.tsx`, `ProfileHrSection.tsx`, `ProfileActivity.tsx`)
**Must NOT touch:** phases 2-5 page files (except a one-line bug fix that phase's owner cannot make — this phase is sequential, so such fixes are allowed but must be listed in the commit message).

## Implementation Steps

1. Extend `ScriptCtx` + build the new ctx fields in `AskIKamePanel` from AppState.
2. Extend the draft action with `commit`/`buildPost`/`buildReport`; wire `useAskConversation` actions; verify v1 S3/S4 still behave identically.
3. Add the 6 new scripts; check chip visibility per route (`scriptsForContext`) incl. `/community` and `/profile`.
4. Fill the 6 seeded search answers; verify in the palette and add the answer block to `/search`.
5. Rebuild ProfilePage (7 sections) + `profile-v2.css`.
6. R-badge sweep + grep gate.
7. Presenter script v3 + smoke checklist.
8. Run the full smoke checklist; fix findings.
9. `npm run typecheck && npm run build`; commit `feat(ai): module-wide AI scripts, seeded search answers, full profile and badge sweep`; push.

## Todo List

- [ ] ScriptCtx live slices + ctx construction in panel
- [ ] `commit` extension in draft action + `use-ask-conversation` actions (addPost, submitReport)
- [ ] 6 new scripts (2 community, 1 events, 1 knowledge, 1 goals, 1 profile) — all live-reading, mutating ones gated by `isApplicable`
- [ ] Deny script route list extended to `/community` + `/profile`
- [ ] 6 seeded search answers + `/search` answer block; off-seed note verified
- [ ] ProfilePage 7 sections incl. live activity + theme/reset blocks preserved
- [ ] RBadge grep gate clean (only RBadge.tsx + VisionPage)
- [ ] Presenter script v3 + smoke checklist
- [ ] Full smoke pass; typecheck + build green; committed + pushed

## Success Criteria

- Every module route offers at least one relevant chip; no chip leaks onto an unrelated route.
- AI birthday wish really appears in the feed; AI check-in report really appears in Tổng hợp báo cáo with the goal flipped — both re-runnable (second run shows the "already handled" branch instead of duplicating).
- `nghỉ phép` in ⌘K shows an AI answer whose numbers match the Profile leave section exactly.
- No R-badge on any module header; AI answers still badged; one disclosure line in the panel.
- `resetDemo()` returns the whole app (feed, reports, registrations, check-in, conversation) to opening state.

## Risk Assessment

- **`commit` extension breaks v1 scripts** → `commit` optional, default `'message'`; smoke S3 (manager nudge) and S4 (RSVP) explicitly.
- **AI answer contradicts fixtures** (e.g. wrong leave days) → write answers *after* ProfilePage is built, copy numbers from the fixture file, not from memory.
- **Duplicate posts/reports on double-approve** → existing `lockRef` guard + `isApplicable` re-check; verify by clicking approve twice fast.
- **Phase 2-5 bugs surface here with no test cycle left** → this phase's smoke checklist IS the QA gate; budget ~0.5d of the 2d for fixes.
- **Profile file size** → split into `src/pages/profile/*` before it crosses 200 lines.

## Security Considerations

Mock-only; no network, no LLM. AI-committed content flows through the same plain-text rendering as user content. Deny script still demonstrates the permission-aware framing; the audience filter remains demo-fidelity only.

## Next Steps

Owner reviews the running build → collects a fix list → iterate. Optional follow-ups: real photos for hero/feed (if owner supplies files), `/vision` copy review + rehearsal carried over from v1.
