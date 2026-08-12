# Phase 2 — Cộng đồng `/community`: Feed, Composer, Reactions, Comments, Right Rail

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-shared-surface.md) (contracts) · [brainstorm §1](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md)
- Read before coding: `src/AppState.tsx` (posts/birthdays/dailyCheckIn mutators), `src/types/index.ts` (Post/Comment/PostCover/BirthdayPerson/Milestone/TopFan), `src/data/mockData.ts` (`initialPosts`), `src/components/UI.tsx` (Button/IconButton/SectionHeader/StatusPill/EmptyState), `src/components/ContentCards.tsx` (EventCard for the rail)

## Overview

- **Priority:** P1 — biggest wow surface, main money moment. **Effort:** 2d. **Status:** pending. **Parallel with 3-5.**
- Fill the `/community` stub: pinned carousel + working composer + interactive PostCard + mention banner + right rail. Replaces the external Facebook group in the narrative.

## Key Insights

- **Everything must be really clickable.** Composer → post appears at feed head; reaction → count moves; comment → appears; "Chúc" → comment appears on the birthday post. Owner demos by clicking, unguided (brainstorm §Tiêu chí).
- **No real photos** (F-fixtures): covers = CSS gradient/pattern + big emoji + optional caption. Avatars = initials circles (reuse `.avatar` from `app.css`).
- Rail "Sự kiện" reads **live** `events` from AppState so a Phase-3 RSVP or the A4 script shows up here too (F2 spirit for UI, not just AI).
- Keep files ≤200 lines → split into `src/pages/community/` subcomponents. `CommunityPage.tsx` = layout + data wiring only.
- All new state already exists in AppState — **do not add state to AppState** (frozen, F1). Component-local UI state (expanded comments, composer draft) must clear on `demoResetCount` change (F4).

## Requirements

### Functional
1. **Pinned carousel**: horizontal scroll of `posts.filter(p => p.pinned)` (3), each with `Chính thức` pill + `pinnedUntilLabel` (static label — no expiry logic). Snap scroll, keyboard-reachable (native overflow + focusable cards).
2. **Composer**: avatar + textarea (`placeholder: "Bạn muốn chia sẻ gì với iKame?"`) + optional cover picker (4 pattern/emoji presets, none selected by default) + `Đăng` button disabled when empty/whitespace → `addPost({ body, cover })` → new post at head, textarea cleared, toast "Đã đăng lên Cộng đồng".
3. **PostCard**: author initials avatar + name + role + time; `Chính thức` pill when `official`; body (preserve line breaks, linkify nothing — plain text); cover block when present; reaction row `❤️ n` / `👏 n` → `toggleReaction` (active state styling + count animation, `prefers-reduced-motion` → no animation); `Bình luận (n)` toggles the comment list; comment composer (Enter or `Gửi` → `addComment`); `Chia sẻ` and `Đã lưu/Lưu` (`toggleSavePost`) → toast receipt.
4. **Mention banner** above the feed when any post has `mentionsMe`: "Bài viết nhắc tên bạn có N bình luận mới" + `Xem ngay` → scrolls to that post (`scrollIntoView({ block: 'center' })`, respect reduced-motion → `behavior: 'auto'`) and expands its comments. Dismissible (local state).
5. **Right rail** (5 widgets, in order):
   - *Hôm nay của tôi* — if `!dailyCheckIn.done`: two buttons `Ở văn phòng` / `Làm từ xa` → `submitDailyCheckIn(mode)`; after: receipt line "Đã check-in HH:MM · WFO" + `StatusPill tone="success"`.
   - *Sự kiện sắp tới* — top 2 upcoming from live `events` sorted by `startsAt`, each with "còn N ngày" (computed) + link to detail.
   - *Fan iKame tuần* — `topFans` avatar row + points + note line.
   - *Sinh nhật hôm nay* — `birthdays`; per person: `Chúc` button → `congratulate(id)`; after: button becomes disabled "Đã chúc ✓" and a toast points to the birthday post.
   - *Cột mốc thâm niên* — `milestones` (name, N năm, dateLabel, note).
6. Toast: one lightweight local `useToast` hook in `pages/community/` (auto-dismiss ~2.5s, `role="status"`). Do **not** add a global toast to shared files.

### Non-functional
- Layout: feed column max ~640px + rail ~320px; rail stacks under the feed <1024px; composer + cards full-width on mobile.
- a11y: reaction buttons `aria-pressed`; comment lists in `<ul>`; carousel `aria-label`; all interactive elements keyboard-reachable.
- Light + dark theme both verified.

## Architecture

```
src/pages/CommunityPage.tsx          // layout, AppState wiring, mention banner, toast host  (<200 lines)
src/pages/community/PinnedCarousel.tsx
src/pages/community/PostComposer.tsx
src/pages/community/PostCard.tsx      // reactions + comments + share/save
src/pages/community/CommunityRail.tsx // 5 widgets
src/pages/community/use-toast.ts      // { toast, show }  — local only
src/styles/community.css              // all classes prefixed `community-` / `post-`
```

```tsx
// CommunityPage skeleton
const { posts, birthdays, milestones, topFans, events, dailyCheckIn, user, demoResetCount,
        addPost, toggleReaction, addComment, toggleSavePost, congratulate, submitDailyCheckIn } = useAppState();
const [expanded, setExpanded] = useState<Set<string>>(new Set());
useEffect(() => { setExpanded(new Set()); setBannerDismissed(false); }, [demoResetCount]); // F4
const pinned = posts.filter(p => p.pinned);
const feed = posts.filter(p => !p.pinned);        // pinned live only in the carousel
const mentioned = posts.find(p => p.mentionsMe);
```

Cover rendering: `<div className={`post-cover post-cover--${cover.pattern}`}><span>{cover.emoji}</span>{cover.caption && <small>…</small>}</div>` — patterns are pure CSS gradients in `community.css`.

Days-until helper: local `daysUntil(startsAt)` in `CommunityRail.tsx` (Phase 3 has its own copy in its own file — duplication accepted over cross-phase shared-file edits; Phase 6 may DRY it if trivial).

## Related Code Files

**Modify:** `src/pages/CommunityPage.tsx` (fill stub), `src/styles/community.css`
**Create:** `src/pages/community/{PinnedCarousel,PostComposer,PostCard,CommunityRail}.tsx`, `src/pages/community/use-toast.ts`
**Must NOT touch:** `AppState.tsx`, `types/index.ts`, `mockData.ts`, `AppShell.tsx`, `main.tsx`, `app.css`, any other page, `ai-scripts.ts` (Phase 6 adds the community chips).

## Implementation Steps

1. `community.css` skeleton: 2-col grid, card surface, cover patterns, avatar row, reaction row, comment list.
2. `PostCard` first (highest reuse) — reactions, comments expand, comment composer, share/save toasts.
3. `PostComposer` + cover presets + validation.
4. `PinnedCarousel`.
5. `CommunityRail` 5 widgets (check-in receipt → events → fans → birthdays → milestones).
6. `CommunityPage` layout + mention banner + toast host + reset-clear effect.
7. Responsive + dark pass at 1024px and mobile width.
8. `npm run typecheck && npm run build`; smoke the 5 interactions; commit `feat(community): social feed with composer, reactions, comments and activity rail`.

## Todo List

- [ ] Pinned carousel (3 posts, Chính thức pill, snap scroll)
- [ ] Composer posts real state → head of feed + toast
- [ ] PostCard: reactions toggle w/ counts, comments expand + add comment, share/save toasts
- [ ] Mention banner → scroll + expand target post, dismissible
- [ ] Rail: daily check-in receipt · live events + days-left · top fans · birthdays "Chúc" → comment · milestones
- [ ] Local state clears on demoResetCount; no AppState/shared-file edits
- [ ] Responsive (rail stacks <1024px) + dark theme + a11y (aria-pressed, labels)
- [ ] typecheck + build green; committed

## Success Criteria

- Post → react → comment → congratulate all visible without a page reload; `resetDemo()` returns the feed to 9 seeded posts.
- Rail event widget reflects a registration made on `/events` (cross-module live state).
- No console errors/warnings; no layout overflow at 1024px.

## Risk Assessment

- **Feed feels empty/fake without photos** → invest in cover patterns + generous whitespace + real-sounding VN copy; emoji cover is a deliberate style, not a placeholder.
- **File-size creep in PostCard** → keep comment list as a small inner component in the same file; if >200 lines, split `PostComments.tsx`.
- **Missing fixture discovered mid-build** → file a blocker (F1), do not edit `mockData.ts`.
- **Comment composer submit-on-Enter fights multiline** → Enter submits, Shift+Enter newline; document in the code comment.

## Security Considerations

Mock-only; no user input leaves memory. Render post/comment text as plain text (never `dangerouslySetInnerHTML`) — the composer accepts free text, so this is the one real XSS-shaped risk in the prototype.

## Next Steps

Phase 6 adds the two community AI chips (hot-topics A2, birthday-post A3 → `addPost`). Do not stub them here.
