---
title: "MVP My iKame — Newsfeed + Sự kiện + App Directory"
description: "Gộp News+Community thành 1 iKame Feed, trang Ứng dụng + topbar launcher, tinh gọn nav còn 5 mục, gọt Trang chủ. Giữ nguyên Trợ lý AI và Sự kiện."
status: completed
priority: P1
effort: "1d"
tags: [mvp, feed, events, apps, ia]
created: 2026-10-20
---

# MVP My iKame — Newsfeed + Sự kiện + App Directory

## Overview

Tái cấu trúc IA của prototype (`prototype-app/`, React 18 + Vite, mock data trong `AppState`) theo contract đã chốt tại `plans/reports/brainstorm-261020-1118-mvp-newsfeed-events-apps.md`:

1. **iKame Feed hợp nhất** (`/feed`) — gộp Tin tức (`/news`, `NewsPost`) + iKame Feed (`/community`, `Post`) thành một feed: kênh truyền thông chính thức thay Facebook & Slack. Tabs: Toàn công ty / Team của mình / Thông báo / Đã lưu. Giữ composer, reaction, comment, save, pinned, acknowledge.
2. **Ứng dụng** (`/apps`) — app directory nội bộ (search + category + SSO deep-link qua `PlatformHandoff`) + launcher grid trên topbar.
3. **Nav tinh gọn** — sidebar/bottom-nav chỉ còn: Trang chủ, iKame Feed, Sự kiện, Ứng dụng, Trợ lý AI. Module ngoài MVP (Tri thức, Mục tiêu, iRequest, Manager) ẩn khỏi nav, code + route giữ nguyên. Trang chủ gọt shortcut trỏ tới module ẩn.
4. **Không đổi:** Trợ lý AI (AssistantPage, QuickAskPanel, SearchPalette), module Sự kiện.

Nguyên tắc: tái dùng tối đa component hiện có (PostCard, PinnedCarousel, PostComposer, NewsCard, ArticleDetail, Event*, PlatformHandoff). Không merge type `Post`/`NewsPost` — dùng adapter discriminated union.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | `/feed` hợp nhất hoạt động đủ 4 tab, acknowledge, composer; `/news` `/community` redirect | P1 |
| 2 | `/apps` + topbar launcher, SSO handoff flow | P1 |
| 3 | Nav 5 mục, Home không còn trỏ module ẩn | P1 |
| 4 | Build sạch, không regress Assistant/Events, verify trên preview | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Gộp iKame Feed](./phase-01-start.md) | Done |
| 2 | [Trang Ứng dụng + Topbar launcher](./phase-02-apps-hub.md) | Done |
| 3 | [Tinh gọn Nav + gọt Trang chủ](./phase-03-nav-home-trim.md) | Done |
| 4 | [Build + Verify](./phase-04-verify.md) | Done |

## Success Criteria

- [x] `/feed`: 1 trang gộp — tab Toàn công ty / Team / Thông báo / Đã lưu; bài official có acknowledge + hạn; pinned carousel; composer hoạt động; bài News hiển thị dạng article card, mở detail đọc đủ (comment, ack)
- [x] `/news` → `/feed`, `/community` → `/feed`, `/news/:id` → `/feed/article/:id` (redirect, không 404)
- [x] `/apps`: grid app có search + category; click → PlatformHandoff SSO flow; topbar có launcher grid
- [x] Nav (sidebar + mobile tabbar) chỉ còn 5 mục MVP; Trang chủ không còn shortcut Mục tiêu/Tri thức
- [x] `/assistant`, `/events` không regress (verify trên preview 20/10)
- [x] `npm run build` sạch (tsc + vite, 20/10), không lỗi console mới, responsive mobile 375px

## Risks

- **ID collision giữa Post và NewsPost khi trộn feed** → FeedItem dùng key tiền tố (`post:{id}` / `news:{id}`); route article chỉ tra trong `news`.
- **Link `/news/...`, `/community` rải rác ở SearchPalette, Notifications, search-answers, Profile** → grep toàn bộ `'/news` và `'/community` sau Phase 1; signal vỡ: click từ search/notification ra 404 → sửa link, không thêm redirect mới.
- **Ẩn Manager (PerspectiveSwitch) có thể lộ route guard lạ** → PerspectiveGuard giữ nguyên; chỉ ẩn UI switch. Nếu demo cần manager lại, bật lại 1 dòng.

<!-- slug: mvp-newsfeed-events-apps -->
