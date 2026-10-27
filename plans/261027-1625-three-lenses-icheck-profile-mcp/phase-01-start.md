---
phase: 1
title: "Lăng kính iKamer: Home + iCheck widget + /work"
status: pending
priority: P1
effort: "6h"
dependencies: []
---

# Phase 1: Lăng kính iKamer — Home + widget iCheck + tab Công việc

## Overview
Home trở thành màn hình mở app mỗi sáng: việc hôm nay (AI) + chấm công/phép (iCheck mỏng) + nội dung chính thức. Tab **Công việc** gom iCheck mỏng, OKR tóm tắt, đơn/đề xuất — mọi nghiệp vụ sâu deep-link sang iCheck/iGoal/iRequest.

## Requirements
- Functional (theo ảnh iCheck 27/10): widget `ICheckWidget` — banner trạng thái (chưa chấm → nút *Chấm công* / đã chấm 08:06 *Đúng giờ*; chế độ WFO/Remote), 4 nút nhanh (Xin đi muộn/về sớm, Xin nghỉ phép, Quên chấm công, Work from home → mở Trợ lý AI với prompt tương ứng), ô *Ngày phép còn lại* (2,5 · năm nay/năm cũ · phép hỉ · phép hàng năm 11). Home: "Việc hôm nay" (tái dùng digest của agent-replies dạng danh sách 3–5 mục, link `/assistant?q=`), widget iCheck, Tin dành cho bạn, Sự kiện sắp tới. `/work`: ICheckWidget đầy đủ + dải 7 ngày tuần hiện tại (trạng thái ngày: đúng giờ/muộn/phép/WFH theo legend ảnh) + *Mở iCheck đầy đủ* (PlatformHandoff `iCheck`), *Mục tiêu của tôi* tóm tắt (goals needs_update), *Đề xuất của tôi* (requests + đơn iCheck mới).
- Non-functional: không EXP/coin; mobile 1 cột; dùng token/Button/StatusPill hiện có.

## Architecture
- `types`: `AttendanceStatus = 'on_time' | 'late' | 'leave_full' | 'leave_half' | 'wfh' | 'holiday' | 'absent' | 'none'`; `DailyCheckIn` thêm `status?: AttendanceStatus`; `LeaveBalance` thêm `weddingLeave`, `annualQuota`, `lastYear` (map ảnh); `WeekAttendance = { dateLabel; weekday; status }[]`.
- `data/icheck-data.ts` (mới): `initialWeekAttendance` (T2–CN tuần 26/10–01/11), `ICHECK_LEGEND`.
- `AppState`: `weekAttendance` read-only; `submitDailyCheckIn` set status on_time + timeLabel; thêm `addAttendanceRequest(kind, note)` → thêm `RequestItem` type 'Nhân sự'/'Chấm công' (mở rộng `RequestType`) status pending.
- `components/icheck/ICheckWidget.tsx`, `components/icheck/WeekStrip.tsx`, `components/icheck/LeaveBalanceCard.tsx`; `pages/WorkPage.tsx`; `styles/icheck.css`.
- `HomePage`: thay khối "Việc của tôi" bằng `DailyDigest` (hàm thuần `buildDailyDigestItems(ctx)` tách từ agent-replies để dùng chung) + `ICheckWidget compact`.
- `AppShell`: nav iKamer thêm *Công việc* (/work) sau Trang chủ; bottom-nav thay *Ứng dụng* bằng *Công việc*? → giữ 5: Trang chủ, Công việc, Feed, Sự kiện, Trợ lý AI (Ứng dụng còn ở launcher topbar).
- `PlatformHandoff`: thêm `iCheck` vào PlatformKey/PLATFORM_META; `apps-data` thêm app iCheck (internal → /work).

## Related Code Files
- Create: `src/data/icheck-data.ts`, `src/components/icheck/*.tsx`, `src/pages/WorkPage.tsx`, `src/styles/icheck.css`, `src/pages/assistant/daily-digest.ts`
- Modify: `src/types/index.ts`, `src/AppState.tsx`, `src/pages/HomePage.tsx`, `src/components/AppShell.tsx`, `src/App.tsx`, `src/components/PlatformHandoff.tsx`, `src/data/apps-data.ts`, `src/pages/assistant/agent-replies.ts` (dùng daily-digest.ts), `src/main.tsx`

## Implementation Steps
1. Types + icheck-data + AppState (checkIn status, addAttendanceRequest, resetDemo).
2. `daily-digest.ts` thuần + refactor intent digest dùng nó.
3. ICheckWidget / WeekStrip / LeaveBalanceCard + CSS.
4. HomePage mới + WorkPage + route + nav.
5. apps-data + PlatformHandoff iCheck.

## Success Criteria
- [x] Home hiện Việc hôm nay + widget iCheck; bấm Chấm công → "Đã chấm công · HH:mm · Đúng giờ"
- [x] 4 nút nhanh mở Trợ lý AI đúng prompt
- [x] /work hiện tuần hiện tại theo legend, phép 2,5, đề xuất gần nhất; link Mở iCheck đầy đủ chạy handoff

## Risk Assessment
- HomePage hiện có `activeItems` (news+events ranking) — gộp vào digest, không giữ 2 danh sách song song. Nếu digest trống → fallback "Bạn đã xử lý hết".
