---
phase: 1
title: "Gộp iKame Feed"
status: pending
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Gộp iKame Feed

## Overview
Hợp nhất `/news` (NewsPost) + `/community` (Post) thành một trang `/feed` ("iKame Feed") — kênh truyền thông chính thức duy nhất. Redirect route cũ.

## Requirements
- Functional: 4 tab (Toàn công ty / Team của mình / Thông báo / Đã lưu); News article hiển thị dạng article card trong feed; detail article tại `/feed/article/:postId` giữ đủ comment + acknowledge; composer/reaction/save/pinned giữ nguyên; CommunityRail (sinh nhật, cột mốc) giữ.
- Non-functional: không merge type Post/NewsPost; adapter union; a11y + reduced-motion như hiện tại.

## Architecture
- `src/pages/feed/feed-items.ts` (mới): `type FeedItem = { kind: 'post'; post: Post } | { kind: 'news'; news: NewsPost }`; hàm `buildFeed(posts, news, user, tab)` — lọc eligibility (`isEligible`), map tab:
  - `company`: post không audienceTeamIds + news không audienceTeamIds
  - `team`: post/news có audienceTeamIds
  - `official`: news official + post official (mandatory chưa ack nổi lên đầu, dùng `rankCards` với band P0/P1 như HomePage `toRankable`)
  - `saved`: post.saved
  - Key hiển thị: `post:{id}` / `news:{id}`.
- `src/pages/feed/FeedNewsCard.tsx` (mới, mỏng): article card trong feed — tái dùng visual `newsTopicVisual` + badge official/mandatory/ack + link `/feed/article/:id`. Cân nhắc tái dùng `NewsCard` (ContentCards) với prop `href` — nếu NewsCard đủ, KHÔNG tạo component mới (DRY).
- `FeedPage` = CommunityPage làm nền (đổi tên/route), chèn FeedItem render: `kind==='post'` → PostCard (expand inline như cũ), `kind==='news'` → news card.
- `ArticlePage`/`ArticleDetail` (NewsPages.tsx) giữ nguyên logic, đổi back-link → `/feed`, mount tại `/feed/article/:postId`.
- Routes (App.tsx): thêm `/feed`, `/feed/article/:postId`; `<Navigate>` redirect `/news`→`/feed`, `/community`→`/feed`, `/news/:postId`→`/feed/article/:postId` (component nhỏ đọc useParams).

## Related Code Files
- Create: `prototype-app/src/pages/feed/feed-items.ts`, (tùy chọn) `prototype-app/src/pages/feed/FeedNewsCard.tsx`
- Modify: `prototype-app/src/pages/CommunityPage.tsx` (→ FeedPage), `prototype-app/src/pages/NewsPages.tsx` (ArticleDetail back-link, bỏ NewsPage khỏi export nếu không còn dùng), `prototype-app/src/App.tsx` (routes + redirects), mọi file có link `'/news` hoặc `'/community'` (grep: SearchPalette, use-search-results, NotificationsPage, HomePage, ProfilePage, search-answers, mockData…)
- Delete: không xoá file nào (NewsPage component có thể giữ lại không route — ưu tiên xoá export không dùng nếu lint kêu)

## Implementation Steps
1. Viết `feed-items.ts` + unit logic tab mapping (thuần hàm).
2. Chuyển CommunityPage → FeedPage: đổi tab list theo 4 tab mới, render FeedItem hỗn hợp (sort: pinned giữ carousel riêng; feed chính sort theo thời gian/rank official).
3. Mount routes mới + 3 redirect; đổi back-link ArticleDetail.
4. Grep `'/news` `'/community'` toàn `src/`, cập nhật link sang `/feed`…
5. Banner mandatory chưa ack (từ HomePage hero pattern) hiển thị đầu tab Thông báo.

## Success Criteria
- [x] `/feed` render 4 tab đúng nội dung, trộn Post + NewsPost
- [x] Article mở từ feed đọc đủ, acknowledge được, quay lại `/feed`
- [x] 3 redirect hoạt động; không còn link chết tới `/news` `/community`
- [x] Composer đăng bài mới hiện ở tab Toàn công ty

## Risk Assessment
- ID trùng giữa posts/news → key tiền tố; article route chỉ tra `news`.
- Tab 'Thông báo' trộn 2 nguồn gây lộn xộn → official news xếp trước bằng rankCards; nếu rối, signal: demo thấy thứ tự phi lý → tách section "Chính thức từ công ty" trong tab.
