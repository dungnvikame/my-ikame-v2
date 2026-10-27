---
phase: 4
title: "Bật lăng kính Manager + Ứng dụng theo quyền"
status: pending
priority: P1
effort: "4h"
dependencies: [1, 3]
---

# Phase 4: Bật lăng kính Manager + Ứng dụng theo quyền

## Overview
Bật lại Manager (code sẵn) để demo đủ 3 lăng kính; Ứng dụng/launcher lọc theo quyền role/team (spec D8: không lộ cả tên app không có quyền).

## Requirements
- PerspectiveSwitch 3 lựa chọn: iKamer · Manager · COM Admin (ẩn mục không có trong `user.availablePerspectives`? — demo: luôn hiện 3). Manager → `/manager/overview`; nav manager (sẵn) + thêm *Công việc* (manager cũng chấm công) + *Ứng dụng*; bottom-nav manager cập nhật.
- Kiểm tra 4 route manager + GoalPages manager view + agent manager intents + QuickAsk chạy, link `/news` cũ nếu còn trong manager pages → `/feed`.
- Ứng dụng theo quyền: `InternalApp.access = { roles?: string[]; teams?: string[]; perspectives?: Perspective[] }`; `visibleApps(user, perspective)`; thêm app: BM Ops (manager+BM), iHiring (manager/People), iFinance (Finance), iCheck (all), iWiki/iGoal/iRequest (all), iRefer (all), iHRM (all). AppsPage + AppLauncher + Home lối tắt dùng `visibleApps`; không render app bị ẩn; section nhỏ "Cần thêm quyền? Gửi yêu cầu qua iRequest" (không liệt kê tên app).
- Manager Home: thêm widget iCheck compact + digest manager (đơn chờ duyệt, thành viên trễ check-in) — tái dùng attention queue sẵn có, không thêm dữ liệu mới.

## Architecture
- `AppShell`: `NAV_BY_PERSPECTIVE` record 3 bộ; PerspectiveSwitch map qua `PERSPECTIVE_LABELS`.
- `AppState`: `USER_BY_PERSPECTIVE` đã có; manager user `users.mai` bổ sung `roleKey: 'manager'`, `teamId`.
- `data/apps-data.ts`: `access` + `visibleApps`.

## Related Code Files
- Modify: `src/components/AppShell.tsx`, `src/data/apps-data.ts`, `src/pages/AppsPage.tsx`, `src/components/AppLauncher.tsx`, `src/pages/HomePage.tsx`/`ManagerPage.tsx` (widget), `src/data/mockData.ts` (users roleKey), `src/types/index.ts` (User.roleKey)

## Implementation Steps
1. Switch 3 lựa chọn + nav manager + smoke 4 route.
2. apps access + visibleApps + 3 bề mặt.
3. Manager Home widget iCheck + smoke AI manager.

## Success Criteria
- [x] Chuyển 3 lăng kính không lỗi; mỗi lăng kính Home/nav khác nhau; COM Admin không regress
- [x] iKamer An không thấy BM Ops/iHiring/iFinance; Manager Mai thấy BM Ops + iHiring; launcher khớp
- [x] Manager hỏi "Team tôi hôm nay có gì cần chú ý?" chạy như cũ

## Risk Assessment
- Manager pages có thể còn import module đã đổi (NewsCard href…) → build sẽ bắt; chạy build sớm ngay sau bước 1.
