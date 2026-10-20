---
title: "MVP My iKame: hợp nhất iKame Feed, trang Ứng dụng, nav tinh gọn"
date: 2026-10-20
summary: "Gộp News+Community thành /feed, thêm /apps + topbar launcher, nav còn 5 mục; build sạch, review 3 major đã sửa"
---

# MVP My iKame: hợp nhất iKame Feed, trang Ứng dụng, nav tinh gọn

## What happened
- Triển khai đủ 4 phase của plan `plans/261020-1141-mvp-newsfeed-events-apps` (brainstorm contract: `plans/reports/brainstorm-261020-1118-mvp-newsfeed-events-apps.md`).
- Gộp Tin tức (`/news`, NewsPost) + iKame Feed (`/community`, Post) thành một trang `/feed`: adapter `src/pages/feed/feed-items.ts` (discriminated union, key tiền tố `post:`/`news:`), 4 tab (Toàn công ty / Team / Thông báo / Đã lưu), bài mandatory chưa ack boost lên đầu, banner "Cần xác nhận". `NewsPages.tsx` chỉ còn ArticlePage tại `/feed/article/:postId`; redirect `/news`, `/community`, `/news/:id`. `CommunityPage.tsx` xoá.
- Trang `/apps` (`AppsPage.tsx` + `apps-data.ts`, 6 app, search + category chips) + `AppLauncher.tsx` popover trên topbar; `PlatformKey` mở rộng iHiring/iRefer.
- Nav tinh gọn 5 mục (sidebar + bottom-nav); PerspectiveSwitch gỡ khỏi render, perspective ép 'ikamer' (Manager parked, không ghi đè localStorage); HomePage gọt quick-actions.
- Build `tsc + vite` sạch; verify đầy đủ trên preview :5180 (tabs, redirect, acknowledge, SSO handoff, launcher, mobile 375px).

## Decision
- Không merge type Post/NewsPost — adapter union để 2 nguồn mock giữ nguyên contract.
- Nhãn thời gian mock là chuỗi tiếng Việt → sort bằng quy đổi gần đúng quanh mốc `DEMO_NOW = 2026-08-10` (kịch bản demo tháng 8), tránh tin tháng 8 chìm đáy feed khi chạy tháng khác.
- Code-review (subagent): 0 blocker; 3 major đã sửa — (1) pinned/mention thiếu isEligible, (2) hoursAgo so đồng hồ thật, (3) role="menu" sai ARIA ở launcher (đổi sang list button + aria-haspopup/controls + focus vào panel).

## Next steps
- Chưa commit — chờ người dùng quyết.
- Mở: NewsPost chưa lưu được (tab Đã lưu chỉ gom bài social); search/topic-filter của NewsPage cũ không mang sang /feed (chấp nhận cho MVP, cần xác nhận lại).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
