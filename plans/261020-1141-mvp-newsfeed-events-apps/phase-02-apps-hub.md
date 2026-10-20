---
phase: 2
title: "Trang Ứng dụng + Topbar launcher"
status: pending
priority: P1
effort: "3h"
dependencies: []
---

# Phase 2: Trang Ứng dụng + Topbar launcher

## Overview
App directory nội bộ tại `/apps` (search, category, mô tả, SSO deep-link) + nút launcher grid trên topbar kiểu Google apps.

## Requirements
- Functional: danh sách app nội bộ (iGoal, iWiki, iHRM, iHiring, iRefer, iRequest); search theo tên/mô tả; lọc category; card có mô tả + CTA. App ngoài (iGoal/iWiki/iHRM/iHiring/iRefer) → `PlatformHandoffButton` SSO flow; app nội tại (iRequest) → Link `/requests`. Topbar launcher: popover grid 6 app + link "Xem tất cả ứng dụng" → `/apps`.
- Non-functional: popover keyboard-accessible (Escape đóng, focus trả về trigger — theo pattern NotificationsDrawer), responsive.

## Architecture
- `src/data/apps-data.ts` (mới): `type InternalApp = { id; name; tagline; description; category: 'Công việc' | 'Nhân sự' | 'Tri thức'; emoji; kind: 'external' | 'internal'; platform?: PlatformKey; href?: string }`. Mô tả lấy từ PLATFORM_META hiện có + spec (iHiring, iRefer từ Product Spec §0).
- `src/pages/AppsPage.tsx` (mới): page-heading chuẩn (eyebrow + h1), filter-input search (pattern NewsPage), topic-chips category (pattern NewsPage), grid card. Route `/apps` (cả 2 perspective, không guard).
- `PlatformHandoff.tsx`: mở rộng `PlatformKey` + `PLATFORM_META` thêm `iHiring`, `iRefer`.
- `AppShell.tsx`: thêm IconButton (icon `SquaresFour`) trong topbar-actions → popover `AppLauncher` (component trong AppsPage module hoặc components/AppLauncher.tsx nếu >60 dòng); đóng khi click ngoài/Escape/chọn app.

## Related Code Files
- Create: `prototype-app/src/data/apps-data.ts`, `prototype-app/src/pages/AppsPage.tsx`, `prototype-app/src/components/AppLauncher.tsx`
- Modify: `prototype-app/src/components/PlatformHandoff.tsx`, `prototype-app/src/components/AppShell.tsx`, `prototype-app/src/App.tsx` (route `/apps`), `prototype-app/src/index.css`/styles (card grid + popover — theo token hiện có)

## Implementation Steps
1. `apps-data.ts` với 6 app + category + mapping platform.
2. Mở rộng PLATFORM_META (iHiring, iRefer).
3. `AppsPage` (search + chips + grid) + route.
4. `AppLauncher` popover + nút topbar.
5. Style theo design tokens hiện có (tái dùng class card/quick-action nếu khớp).

## Success Criteria
- [x] `/apps` tìm kiếm + lọc được; card SSO mở handoff overlay; iRequest điều hướng nội bộ
- [x] Topbar launcher mở/đóng bằng chuột + bàn phím, focus không kẹt
- [x] Mobile: grid xuống 1-2 cột, popover không tràn màn hình

## Risk Assessment
- Popover topbar chồng NotificationsDrawer/QuickAsk → chỉ 1 overlay mở tại 1 thời điểm (mở launcher thì không mở drawer; đơn giản: launcher tự đóng khi blur).
