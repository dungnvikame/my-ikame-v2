---
phase: 1
title: "COM Admin perspective + /admin"
status: pending
priority: P1
effort: "5h"
dependencies: []
---

# Phase 1: COM Admin perspective + /admin

## Overview
Thêm góc nhìn **COM Admin** (thay vị trí Manager đang parked) với trang `/admin`: dashboard đo lường + quản lý thông báo chính thức + ghim bài. Chứng minh ownership của COM và cách đo WAU/acknowledge.

## Requirements
- Functional: switch iKamer/COM Admin ở sidebar; nav admin = Tổng quan COM (/admin), iKame Feed, Sự kiện, Ứng dụng, Trợ lý AI. `/admin`: 4 tile (WAU, tỷ lệ mở app, tỷ lệ đọc thông báo, tỷ lệ xác nhận bắt buộc); bảng thông báo chính thức (title, reach, read%, ack%, *Gửi push*, *Nhắc N người chưa xác nhận*, danh sách tên); khối ghim (bài đang ghim + bỏ ghim; bài gần đây + ghim). Trên Feed, admin thấy nút Ghim/Bỏ ghim ở PostCard.
- Non-functional: resetDemo reset metrics; không đụng manager code; a11y table.

## Architecture
- `types`: `Perspective = 'ikamer' | 'manager' | 'admin'`; `NewsPost.metrics?: { reach: number; read: number; acknowledged: number }`, `NewsPost.pendingAckNames?: string[]`, `NewsPost.pushedLabel?: string`, `NewsPost.remindersSent?: number`.
- `mockData`: `users.ngoc` (Lê Bảo Ngọc · Communication Lead · People & Culture, perspective admin); metrics cho các bài official/mandatory; `pendingAckNames` gồm cả "Nguyễn Hoàng An" cho bài security-update.
- `AppState`: user theo perspective (admin → ngoc); `acknowledgeNews` cập nhật metrics.acknowledged+1 và bỏ user.name khỏi pendingAckNames; mới: `togglePinPost(id)`, `pushNews(id)` (set pushedLabel + thêm NotificationItem critical), `remindPendingAck(id)` (remindersSent+1 + NotificationItem required).
- `AppShell`: PerspectiveSwitch 2 lựa chọn iKamer / COM Admin; `adminNavGroups`, `adminBottomNav`; HomePage guard: admin → `/admin`.
- `pages/AdminPage.tsx` + `pages/admin/AdminMetrics.tsx`, `pages/admin/OfficialNewsTable.tsx`, `pages/admin/PinManager.tsx`; `styles/admin.css`.
- `PostCard`: prop `onTogglePin?` → nút ghim (admin only, FeedPage truyền khi perspective==='admin').

## Related Code Files
- Create: `src/pages/AdminPage.tsx`, `src/pages/admin/*.tsx`, `src/styles/admin.css`
- Modify: `src/types/index.ts`, `src/data/mockData.ts`, `src/AppState.tsx`, `src/components/AppShell.tsx`, `src/App.tsx`, `src/pages/FeedPage.tsx`, `src/pages/community/PostCard.tsx`, `src/main.tsx`, `src/pages/assistant/assistant-shared.tsx` (capabilitiesFor admin → như ikamer)

## Implementation Steps
1. Types + mock data (user admin, metrics, pending names).
2. AppState actions + perspective→user mapping + resetDemo.
3. AppShell switch + nav; App route `/admin` + guard.
4. AdminPage (tiles, table, pin manager) + CSS.
5. PostCard nút ghim cho admin.

## Success Criteria
- [x] Switch sang COM Admin → nav đổi, `/admin` render tiles + bảng + ghim
- [x] iKamer ack → Admin thấy ack tăng, tên biến khỏi pending
- [x] Gửi push / Nhắc lại → notification mới trong drawer; ghim/bỏ ghim phản ánh ở carousel Feed

## Risk Assessment
- `PerspectiveGuard` hiện redirect manager → /manager/overview; thêm nhánh admin → /admin. Grep `'manager'` để không bỏ sót.
