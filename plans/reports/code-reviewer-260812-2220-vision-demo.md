# Code Review — Vision Demo (e9670c1..13c275d)

## Scope
- 6 commits, 35 files, ~2330 insertions. App root: `prototype-app/`
- Focus: golden-path reliability, state consistency, a11y of new surfaces, fixture hygiene, Red Team F1/F2/F4/F5/F7/F13 verification
- Verification: `tsc --noEmit` clean; `npm run build` clean (2.68s). No ESLint config in project — no lint metrics.

## Overall Assessment
High quality for a demo prototype. Red Team findings are genuinely applied in code (not just commented). State flows through AppState consistently; scripts read live context; fixtures are fictional; no network/persistence beyond theme/perspective localStorage. One state-consistency gap found (S3 zero-state still renders draft action) — the exact class of bug F2 was meant to kill.

## Red Team Finding Verification

| Finding | Status | Evidence |
|---|---|---|
| F1 AiBadge single shared component | VERIFIED | Sole definition `src/components/AiBadge.tsx`; consumers AiMessage.tsx:2, VisionPage.tsx:8, ManagerAiBrief.tsx:3; single CSS block app.css:1873-1907. Minor deviation: VisionPage.tsx:108 hand-rolls an A0 pill reusing `.ai-badge` class (A0 outside `AiLevel` type — acceptable) |
| F2 scripts read live state | VERIFIED (1 gap) | `ScriptCtx` built from live AppState in AskIKamePanel.tsx:35-47; S2/S3/S4 paragraphs branch on live counts. Gap: S3 action block not gated (High #1 below) |
| F4 conversation survives close / clears on demoResetCount / Esc guard / trap covers textarea | VERIFIED | Panel mounted unconditionally (AppShell.tsx:196), returns null while closed so hook state survives; `useAskConversation` clears only on `demoResetCount` (use-ask-conversation.ts:29-32); `attemptClose` guarded by `hasPendingDraft` (AskIKamePanel.tsx:51-55) for both Esc and backdrop; trap selector includes `textarea, input:not([disabled])` (AskIKamePanel.tsx:70) |
| F5 Manager KPIs derive from live queue | VERIFIED | Header count + criticalCount from live scoped `attention` (ManagerPage.tsx:42-48); check-in KPI deliberately decoupled from queue with explanatory copy (ManagerPage.tsx:101-102) per rescope; AI-brief bullets pure mapping of live queue with zero-state (ManagerAiBrief.tsx:49-50, F6) |
| F7 S4 chip never on cancelled-event pages | VERIFIED | S4 routes pinned: `['/home','/events','/events/ai-product-workshop']` (ai-scripts.ts:128); `matchPath` exact-match means `/events/security-briefing-cancelled` never matches; `'*'` fallback only when no specific chip matched (ai-scripts.ts:181-186) |
| F13 resetDemo preserves theme/perspective | VERIFIED | resetDemo omits theme/perspective (AppState.tsx:153-162); both persisted to localStorage with try/catch (AppState.tsx:31-46, 92-93); presenter script documents reset-between-runs rule (docs/demo-presenter-script-bld.md:9) |
| F3 (spot-check) | VERIFIED | Reservation comment in mockData.ts above `ai-product-workshop`; presenter script rule + recovery path (script doc lines 10, 42); S4 `already` gate gives idempotent "Bạn đã đăng ký rồi" |
| F16 (spot-check) | VERIFIED | RBadge takes `Exclude<ReleaseTag,'R1'>` — no shipped variant; no md parser added |

## Critical Issues
None.

## High Priority

1. **S3 zero-state still renders the draft action block — scripted AI contradicts itself.**
   `use-ask-conversation.ts:40` sets `draftText` unconditionally for `kind:'draft'`, and `AskConversationList.tsx:41` renders `AiActionBlock` whenever `script.action` exists. After the presenter resolves the `event-response` attention item, re-asking the S3 chip renders "Không còn thành viên nào cần nhắc — mục này đã được xử lý." (ai-scripts.ts:114) **plus** an editable draft and "Duyệt & gửi"; sending shows "Đã gửi tới 3 người". Also, that stray draft flips `hasPendingDraft`, so Esc/backdrop close silently stops working until the presenter cancels. This is exactly the "AI visibly lies" failure F2 targets, and it is reachable in the scripted golden path (S3 → resolve → exec asks "run it again"). Fix: mirror the S4 `already` gate — in `askChip`, skip the draft action (or set a `zeroState` flag suppressing the action block) when `ctx.unresponsiveCount === 0`.

## Medium Priority

2. **Blocked close gives no feedback.** `attemptClose` (AskIKamePanel.tsx:51-55) silently no-ops while a draft is pending. During a live demo, Esc/backdrop-click appearing dead reads as a freeze; for a11y there is no announcement of why the dialog would not close. Suggest a one-line `role="status"` hint near the draft ("Gửi hoặc Hủy bản nháp trước khi đóng") or focus-jump to the textarea on blocked close.

3. **Fixture contradiction visible on the S3 golden path.** Attention item `event-response` and S3 copy name "Hà, Tuấn và 1 thành viên khác" as unresponsive (mockData.ts:306, ai-scripts.ts:111), but the roster shows Tuấn Lê as `status:'ok'` / "Đang ổn" (mockData.ts:350). S3's citation card navigates to `/manager/team`, where only Hà shows "Chưa phản hồi sự kiện" — an exec following the citation sees the AI's claim contradicted. Pre-existing R0 data, but Phase 2 newly routes attention there. Fix in fixtures: flip Tuấn's roster summary to "Chưa phản hồi sự kiện".

## Low Priority

4. **S4 double-ask duplicate confirm.** Asking the S4 chip twice before confirming creates two turns with confirm buttons (`already` snapshot at ask time, use-ask-conversation.ts:41-44); confirming both shows a second success receipt though state is unchanged. AppState mutator is idempotent (AppState.tsx:124-125) so no state corruption — cosmetic only, unlikely in a scripted run.
5. **Skip-animation affordance not keyboard-accessible.** `AiMessage.tsx:59` puts `onClick={revealAll}` on a plain div — no role/tabindex/key handler. Keyboard users just wait out the ~1-2s stagger; content is not blocked. Acceptable for demo.
6. **Reopen mid-animation re-animates.** If the panel closes before the last paragraph timer fires, `onRevealed` never runs and that turn re-animates on reopen (AiMessage.tsx:30-45). Cosmetic.
7. **Brittle trigger selector.** `ASK_TRIGGER_SELECTOR = 'button[aria-label="Hỏi iKame"]'` (AskIKamePanel.tsx:11) couples focus-return to a copy string; a ref-based approach (as NotificationsDrawer uses) would be sturdier. Fine for prototype.
8. **HomePage.tsx at 216 lines** slightly exceeds the 200-line guideline (pre-existing); AppShell.tsx at 199 is at the ceiling.

## Security / Fixture Hygiene
- All fixture content fictional (names, docs, stats sourced to public reports); no credentials, tokens, or real personal data. Finance doc gated by `audienceTeamIds` and enforced at list (KnowledgePages.tsx:20-23, filter before search index) and detail (KnowledgePages.tsx:81-82, not-found vs forbidden ordering correct — existence of the doc id is disclosed via /forbidden, acceptable and intentional for the demo permission story).
- Free-text input disabled by design (AskIKamePanel.tsx:126) — no off-script path.
- localStorage limited to theme/perspective enum values validated on read (AppState.tsx:31-38) — no injection surface.

## Positive Observations
- `scriptsForContext` fallback semantics ("*" only when nothing specific matched) is clean and testable.
- `setEventRegistration` capacity/status math handles going↔waitlist transitions and clamps at 0; cancelled/past status preserved.
- Focus management on both drawers: initial focus to close button, focus-return to trigger via rAF, `aria-modal`, Tab-wrap both directions.
- Receipts consistently use `role="status"`; goal progress bars carry full progressbar ARIA (GoalPages.tsx:71).
- ManagerPage/GoalsPage clear local receipt banners on `demoResetCount` — reset leaves no stale evidence.
- Synchronous double-click locks on send/confirm (use-ask-conversation.ts:61,68).
- Presenter script encodes F3 reservation, recovery paths, and reset rules — operational risk actually written down.

## Recommended Actions (priority order)
1. Gate S3 draft action on `ctx.unresponsiveCount > 0` (fixes contradiction + accidental close-lock) — small, low-risk change before rehearsal.
2. Add visible feedback when close is blocked by a pending draft.
3. Fix Tuấn Lê roster summary in mockData to match the attention item.
4. (Optional) suppress duplicate S4 confirm turns by re-deriving `already` at render from live events.

## Metrics
- TypeScript: strict, `tsc --noEmit` clean; production build clean.
- Lint: no ESLint config present (project convention — prototype).
- Tests: none in repo (demo prototype; consistent with plan scope).
- File size: all new files ≤ 131 lines except VisionPage.tsx (174) — within the 200-line rule.

## Unresolved Questions
1. Is "exec asks to re-run S3 after resolve" inside the rehearsed script? If categorically impossible live, High #1 drops to Medium — but the fix is ~5 lines, recommend applying regardless.
2. `/vision` copy is marked DRAFT pending owner review (VisionPage.tsx:5-6, F12 checkpoint) — has the copy-review checkpoint been signed off? Not verifiable from code.
3. `attentionHref` routes `iGoal`-sourced items to `/goals` (An's personal goals page) rather than a team view — intentional concept mapping per comment, but confirm the presenter narrative covers the mismatch.
