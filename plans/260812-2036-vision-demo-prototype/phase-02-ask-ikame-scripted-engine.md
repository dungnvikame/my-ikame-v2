# Phase 2 — Ask iKame Scripted Engine (Panel, Script Store, A1-A4 Flows)

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-types-state-stubs.md) (frozen contracts: `askOpen`/`setAskOpen`, `setEventRegistration`, `AiLevel`, `RBadge`)
- [Brainstorm summary](../reports/brainstorm-260812-2036-vision-demo-prototype.md) §4-5 · Spec §23 (ladder + AI response requirements: citation, "Không đủ dữ liệu", feedback, kill switch)
- Reuse patterns: `AppShell.tsx` NotificationsDrawer (drawer-layer CSS + focus trap + Esc + return-focus), `TeamPage.tsx` (same trap ported), `.receipt` inline pattern

## Overview

- **Priority:** P1 — the demo's headline layer. **Effort:** 2.5d. **Status:** Complete (commit 04da39f, code-review fixes in da345d9).
- Build the global "Ask iKame" conversation panel: suggested-prompt chips (context-aware by route), scripted responses with typing effect, A-level badges, citation cards, A3 confirm-before-send, A4 execute-with-receipt. **NO free-text processing, NO LLM.**

## Key Insights

- **Determinism is the feature.** Chips are the only input; the disabled text input labeled "Nhập tự do sẽ mở ở R4" *is itself a talking point* (honest maturity framing — research shows wizard-of-oz honesty builds exec trust).
- **(RED TEAM F2) Scripted ≠ static.** "No LLM" constrains *generation*, not *reading local state*. Response paragraphs are `(ctx) => string[]` functions receiving derived counts from AppState (unacked-mandatory count, registered events, needs-update goals, unresponsive-member count). The prose is 100% authored; only the numbers/lists are live. Otherwise a chip re-run after the presenter acks/RSVPs/checks-in at earlier stops makes the AI recite stale facts — visibly "bịa" minutes after the "AI không bịa" beat.
- **A4 must cause a real, visible state change** — `setEventRegistration('ai-product-workshop', 'going')` — so the presenter can navigate to Events and show the badge flipped. This is the money moment; a chat-only receipt would be theatre. **(F3) `ai-product-workshop` is RESERVED for this scenario** — the real-RSVP beat uses other events (see Phase 1 fixture comment + presenter script).
- AI response requirements from spec §23.2 become UI affordances: citation per claim, "Không đủ dữ liệu" for out-of-permission, Concept badge = kill-switch story. **(F11)** No standalone feedback buttons — the "Vì sao trả lời này?" disclosure carries the explainability/feedback story as ONE affordance (a dead Hữu ích button a BLĐ member clicks post-demo undermines the honesty framing).
- Typing effect: paragraph-level fade-in with ~400-700ms stagger (not char-by-char — cheaper, calmer, skippable by click). Guard timers against StrictMode double-fire (`useRef`), clear on unmount.
- **(F4) Conversation PERSISTS across panel close** — cleared only when `demoResetCount` (Phase 1 contract) changes. Esc/backdrop-close while an A3 draft is pending is guarded (confirm-or-ignore), the focus-trap selector includes `textarea, input:not([disabled])`, and citation/receipt links close-the-panel-then-navigate deliberately (NotificationList `onItemOpen` pattern). The NotificationsDrawer pattern is the *starting point*, NOT copied verbatim — it never held state worth losing.

## Requirements

### Functional
- Panel opens from topbar Sparkle (Phase 1 trigger), right-side drawer, focus-trapped, Esc closes, focus returns to trigger.
- Header: "Ask iKame" + `<RBadge tag="R4" />` + one-line disclosure "Bản mô phỏng khái niệm — câu trả lời được dựng sẵn".
- Suggested chips filtered by current route (useLocation) + perspective; 2-4 chips visible; generic chips fallback on unmatched routes.
- Each response renders: `AiBadge` (Phase 1 shared component), paragraphs (live-count-aware per F2), optional citation cards (source icon + title + deep link), optional action block, "Vì sao trả lời này?" disclosure (giải thích nguồn + quyền — single explainability affordance, no separate feedback buttons).
- **Scenario S1 (A1, route `/news/:postId`):** "Tóm tắt bài này cho tôi" → 3-bullet summary + 1 citation card linking to the article itself.
- **Scenario S2 (A2, route `/home`):** "Hôm nay tôi cần làm gì?" → tổng hợp xuyên nguồn (mandatory chưa ack + sự kiện đã đăng ký + goal cần cập nhật) với 3 citations (News/Event/iGoal).
- **Scenario S2b (A2 permission-deny, any route):** "Ngân sách quý III của team Finance?" → **"Không đủ dữ liệu — bạn không có quyền truy cập nguồn này"** + explanation. Zero content leak.
- **Scenario S3 (A3, route `/manager/overview`, manager perspective only):** "Soạn tin nhắc 3 người chưa phản hồi iConnect" → draft preview in editable textarea → buttons `Duyệt & gửi` (primary) / `Hủy` → on send: receipt bubble "Đã gửi tới 3 người · #RCPT-xxxx · 2 kênh: chat + notification".
- **Scenario S4 (A4, routes `/events*` + `/home`):** "Đăng ký workshop Product Builder with AI cho tôi" → event summary + confirm → calls `setEventRegistration('ai-product-workshop','going')` → receipt + link "Xem trong Sự kiện". Guard: if already `going`, respond idempotently ("Bạn đã đăng ký rồi").
- **(F4)** Conversation persists across panel close/open — receipts remain showable if BLĐ asks "biên lai đâu?". Cleared ONLY by `resetDemo()` (via `demoResetCount`).

### Non-functional
- Files ≤200 lines each → split: panel shell, message components, script store. TS strict. All timers cleaned up. Works in dark mode + 390px (full-width drawer <640px per existing pattern).

## Architecture

### `data/ai-scripts.ts` (new — owned here; internal types local to this file)
```ts
type ScriptCtx = {                    // derived ONCE per render from AppState (F2)
  unackedMandatory: NewsPost[]; registeredEvents: EventItem[];
  needsUpdateGoals: Goal[]; unresponsiveCount: number;
};
export type AiScript = {
  id: string;
  chip: string;                          // suggested-prompt label
  routes: string[];                      // react-router patterns for matchPath:
                                         // '/home', '/news/:postId', '/manager/overview',
                                         // '/events', '/events/ai-product-workshop'.
                                         // (F7) '*' = fallback, shown ONLY when no other
                                         // chip matched the current pathname. S4 pinned to
                                         // /home + /events + /events/ai-product-workshop —
                                         // NEVER other event details (no "đăng ký workshop"
                                         // chip on the cancelled-event page).
  perspective?: 'ikamer' | 'manager';
  level: AiLevel;
  paragraphs: (ctx: ScriptCtx) => string[]; // (F2) authored prose, live numbers; plain
                                            // strings only — no md parsing (F16)
  citations?: { title: string; source: string; href: string }[];
  reason: string;                        // "Vì sao trả lời này?" — also carries the
                                         // explainability/feedback story (F11)
  action?:
    | { kind: 'draft'; draftText: (ctx: ScriptCtx) => string; confirmLabel: string; receipt: string }
    | { kind: 'execute'; targetEventId: string; confirmLabel: string; receipt: string }
    | { kind: 'denied' };                // "Không đủ dữ liệu" treatment
};
export function scriptsForContext(pathname: string, perspective: Perspective): AiScript[]
// implemented with react-router matchPath against each pattern; '*' scripts appended
// only when the matched list is empty
```

### `components/assistant/` (fill Phase-1 stub)
- `AskIKamePanel.tsx` — drawer shell adapted from the NotificationsDrawer pattern with the F4 deviations: focusable selector includes `textarea, input:not([disabled])`; Esc/backdrop-close guarded while a draft action is pending; conversation state lifted so it survives close (cleared on `demoResetCount` change); citation/receipt links close-then-navigate. Header, message list, chip row, disabled input footer ("Nhập tự do sẽ mở ở R4").
- `AiMessage.tsx` — `AiBadge` (import from Phase 1's `components/AiBadge.tsx` — do NOT create a local one) + staggered paragraphs + citation cards + reason disclosure (carries explainability/feedback story — no separate feedback buttons per F11).
- `AiActionBlock.tsx` — draft-textarea/confirm and execute/confirm variants + receipt rendering; calls AppState mutators. **S3 receipt copy (A3 two-step decision):** "Đã gửi tới 3 người · #RCPT-xxxx — item vẫn ở queue để bạn xác nhận đã xử lý" — the manual resolve afterward is deliberate choreography (human-in-the-loop), not a bug.
- `styles/assistant.css` — panel, bubbles, chips, citation card, action block, typing fade.

## Related Code Files

**Modify (owned):** `src/components/assistant/AskIKamePanel.tsx` (fill stub), `src/styles/assistant.css` (fill)
**Create (owned):** `src/components/assistant/{AiMessage,AiActionBlock,AiBadge}.tsx`, `src/data/ai-scripts.ts`
**Read-only (frozen):** `AppState.tsx`, `types/index.ts`, `AppShell.tsx`, `RBadge.tsx`, `UI.tsx`, `mockData.ts`, `App.tsx`

## Implementation Steps

1. Read landed Phase-1 contracts (`askOpen`, mutators, `AiLevel`, stub shape).
2. Write `ai-scripts.ts` with all 5 scenarios (S1, S2, S2b, S3, S4) + 1-2 generic fallback chips ("My iKame làm được gì?").
3. Build panel shell with trap/Esc/return-focus + close-resets-conversation.
4. Build `AiMessage` (badge, stagger, citations, feedback, reason).
5. Build `AiActionBlock` (draft + execute variants, receipts, idempotent guard for S4).
6. Wire chips → conversation flow; verify route/perspective filtering on every tour stop.
7. CSS: light+dark, mobile full-width; verify no layout shift during stagger.
8. Manual run of all 5 scenarios from their tour stops; `npm run typecheck && npm run build`.

## Todo List

- [x] `ai-scripts.ts`: 5 scenarios + fallback, matchPath filtering (F7), state-reading paragraphs (F2)
- [x] Panel shell: trap (selector incl. textarea), Esc/backdrop guard while draft pending, return-focus, conversation persists across close (F4)
- [x] Conversation clears on `demoResetCount` change only
- [x] AiMessage: shared AiBadge import, staggered paragraphs, citation cards, reason disclosure (no feedback buttons — F11)
- [x] AiActionBlock: A3 draft→edit→confirm→receipt ("item vẫn ở queue…" copy); A4 confirm→mutator→receipt+link; idempotent re-ask
- [x] Disabled free-text input with R4 label
- [x] S2b permission-deny renders "Không đủ dữ liệu", zero leaked content
- [x] S4 chip absent on non-workshop event details (F7 pinning verified per tour stop)
- [x] Dark mode + 390px pass; timers StrictMode-safe
- [x] typecheck && build green

## Success Criteria

- All 5 scenarios run from their tour stops without console errors; S4 visibly flips the Events badge after navigation; S3 receipt appears, draft editable before send, and receipt survives closing/reopening the panel.
- **Re-running S2 after ack/RSVP/check-in mutations reports the NEW state** (F2 acceptance) — no stale recitation.
- Panel never accepts free text; every AI surface carries an A-badge + Concept framing.
- `resetDemo()` clears the conversation and un-registers S4's RSVP.

## Risk Assessment

- **Chip visible on wrong route/perspective** → filtering unit-checked manually per stop; S3 gated to manager.
- **Stagger timers leak on rapid open/close** → cleanup in effect return; skip-on-click sets all visible.
- **S4 fires twice on double-click** → reuse `pending` guard pattern from EventPages.

## Security Considerations

- Scripted content only; no user input processed (input disabled). Deny scenario hard-codes refusal copy — no scoped fixture content in the script file's deny branch at all.

## Next Steps

- Phase 6 adds the panel to visual-check screenshots and the presenter script maps chips → tour stops.
