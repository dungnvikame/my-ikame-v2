---
phase: 3
title: "Tinh gọn Nav + gọt Trang chủ"
status: pending
priority: P1
effort: "2h"
dependencies: [1, 2]
---

# Phase 3: Tinh gọn Nav + gọt Trang chủ

## Overview
Nav còn 5 mục MVP; ẩn module ngoài MVP khỏi mọi entry point UI (code + route giữ); Trang chủ bỏ shortcut tới module ẩn.

## Requirements
- Functional: sidebar iKamer = Trang chủ, iKame Feed (/feed), Sự kiện, Ứng dụng (/apps), Trợ lý AI (1 group 'KHÔNG GIAN CỦA BẠN'). Bottom-nav mobile = Trang chủ, Feed, Sự kiện, Ứng dụng, Trợ lý AI. Ẩn PerspectiveSwitch (manager parked — comment giải thích, bật lại 1 dòng). Home: quick-actions thay Mục tiêu/Tri thức bằng Ứng dụng + Danh bạ; section 'Tin dành cho bạn' đổi href → /feed; mọi link /news/:id trong Home → /feed/article/:id.
- Non-functional: không xoá route/page nào; PerspectiveGuard giữ nguyên.

## Architecture
- `AppShell.tsx`: thay `iKamerNavGroups` (bỏ Tin tức, iRequest, group PHÁT TRIỂN; thêm Ứng dụng icon SquaresFour; đổi iKame Feed → /feed); `managerNavGroups`/`managerBottomNav` giữ trong code nhưng không reachable khi switch ẩn; `iKamerBottomNav` cập nhật (bỏ Mục tiêu, thêm Ứng dụng).
- `HomePage.tsx`: bỏ import goals/knowledgeDocs nếu không còn dùng; quick-actions mới: Ứng dụng (/apps), iKame Feed (/feed), Danh bạ (/search); link news card → /feed/article.
- `ContentCards.tsx` NewsCard: href sang /feed/article/:id (đã làm ở Phase 1 nếu grep bắt được — xác nhận lại ở đây).

## Related Code Files
- Modify: `prototype-app/src/components/AppShell.tsx`, `prototype-app/src/pages/HomePage.tsx`, `prototype-app/src/components/ContentCards.tsx` (nếu còn sót)

## Implementation Steps
1. Trim nav groups + bottom nav + ẩn PerspectiveSwitch (giữ code, comment).
2. Gọt Home quick-actions + href các section.
3. Grep lần cuối `/knowledge` `/goals` `/requests` `/manager` trong các surface MVP (AppShell, HomePage, FeedPage, AppsPage, SearchPalette) — link từ surface MVP tới module ẩn chỉ giữ khi có chủ đích (iRequest trong /apps là chủ đích).

## Success Criteria
- [x] Sidebar + bottom nav đúng 5 mục; không còn group PHÁT TRIỂN/QUẢN LÝ
- [x] Home không render shortcut Mục tiêu/Tri thức; không import thừa
- [x] Gõ URL /goals /knowledge /requests vẫn mở trang (route sống)

## Risk Assessment
- SearchPalette/Trợ lý AI trả kết quả trỏ module ẩn → chấp nhận cho MVP (route sống); không lọc index search để tránh đụng Assistant giữ-nguyên.
