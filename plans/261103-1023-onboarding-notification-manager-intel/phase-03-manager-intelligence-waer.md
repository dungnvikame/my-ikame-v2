---
phase: 3
title: "Manager Intelligence lát mỏng + tile WAER cho COM"
status: pending
priority: P1
effort: "6h"
dependencies: [1]
---

# Phase 3: Manager Intelligence lát mỏng — Nhịp team, tín hiệu sớm, người mới; tile WAER

## Overview
Kéo sớm một lát mỏng của "Manager Intelligence Layer" (P3 deck): trên Tổng quan Manager, Mai thấy nhịp engagement team tuần này so tuần trước, ai đang chùng xuống, người mới đi tới đâu — mỗi thứ kèm hành động 2 phút. Cùng module dữ liệu engagement cấp tile **WAER** cho Tổng quan COM (North Star thay WAU).

## Requirements
- Functional
  - `data/team-engagement.ts`: `MemberWeekEngagement` theo `memberId` cho 2 tuần (`thisWeek`, `lastWeek`): `actions: { ack, post, kudosGiven, kudosReceived, checkIn, attendance, request }` + `active: boolean` (≥1 hành động); dữ liệu kể cùng chuyện với roster/attention: Lan (ack/post ok, check-in trễ), Minh (ít hoạt động, bỏ check-in), Hà/Ngọc Anh ổn, **Tuấn Lê giảm 2 tuần liên tiếp** (active tuần này = false, kudos 0, check-in trễ), Gia Huy (quest + post chào hỏi). Thêm `companyWeek` tổng hợp mock cho COM: `active 131/184 = 71%`, tuần trước 66%, phân rã hành động (xác nhận 58%, chấm công 69%, đăng/kudos 34%, request 21%, check-in OKR 47%).
  - `lib/engagement.ts` thuần: `teamWaer(members, week)`, `kudosStats`, `checkInOnTime`, `trend(this, last)` → `{ value, delta, tone }`, `earlySignals(members)` → danh sách `{ memberId, reason, suggestion, href }` (rule: inactive 2 tuần hoặc kudosReceived=0 & check-in trễ → "Đặt 1:1 trong tuần"; người mới quest trễ → "Nhắc buddy").
  - `pages/manager/TeamPulse.tsx` (section "Nhịp team tuần này", đặt sau `ManagerAiBrief`): 3 tile — **Team WAER** (5/6 · 83% · ▼ so tuần trước), **Kudos** (cho 4 · nhận 3 · "2 người chưa được ghi nhận 30 ngày"), **Check-in OKR đúng hạn** (3/6); dưới là **Tín hiệu sớm** tối đa 2 dòng (Tuấn Lê — "Không hoạt động 2 tuần, EKS 38%" → nút "Gửi ghi nhận" (mở composer kudos) + "Đặt 1:1" (link 360°)); copy nêu nguồn "Từ iKame Feed · iGoal · iCheck · tuần 45".
  - `pages/manager/NewJoinerCard.tsx` trong `team-moments` thay thẻ moment new_joiner: Gia Huy · Ngày 32/60 · 7/12 quest · buddy Lan · "Việc của manager tuần này: 1:1 mốc 30 ngày (chưa đặt)" → nút "Đặt 1:1" (receipt mock) + link hành trình (`/manager/team/member_giahuy` tab mới "Hành trình" tái dùng `JourneyTimeline` read-only).
  - `ManagerAiBrief` thêm bullet đầu khi có early signal ("Tuấn Lê chùng xuống 2 tuần — nên 1:1 trước thứ Sáu").
  - Tổng quan COM `AdminMetrics`: tile 1 đổi thành **WAER tuần này 71%** (hint "131/184 có ≥1 hành động · +5 điểm"), giữ WAU làm tile 2 (hint "WAU 78% — WAER là North Star từ T11"), 2 tile phân phối giữ nguyên; thêm hàng phân rã hành động `AdminWaerBreakdown` (5 thanh ngang, token contrast). Thẻ Đo lường agent (assistant) không đổi.
- Non-functional: mọi tín hiệu đều nêu nguồn + hành động; không hiển thị dữ liệu ngoài team Mai (scope filter theo `teamId` như ManagerPage); dark mode; mobile.

## Architecture
- `team-engagement.ts` là nguồn duy nhất cho cả Manager (lọc teamId) và COM (companyWeek); `lib/engagement.ts` thuần để test bằng `node`.
- TeamPulse là section mới trong `manager-main`, trên ApprovalQueue? → **Dưới ManagerAiBrief, trên ApprovalQueue** để câu chuyện "tín hiệu → hành động" đi trước hàng đợi duyệt; stats hàng đầu giữ nguyên 4 ô.
- NewJoinerCard dùng `lib/onboarding.ts` + `onboarding-data.ts` (Phase 1) qua AppState `journey` — không tính lại.

## Related Code Files
- Create: `prototype-app/src/data/team-engagement.ts`, `prototype-app/src/lib/engagement.ts`, `prototype-app/src/pages/manager/TeamPulse.tsx`, `prototype-app/src/pages/manager/NewJoinerCard.tsx`, `prototype-app/src/pages/admin/AdminWaerBreakdown.tsx`
- Modify: `pages/ManagerPage.tsx` (mount TeamPulse, NewJoinerCard), `pages/manager/ManagerAiBrief.tsx` (bullet early signal), `pages/team/member-tabs.tsx` + `MemberDetailPage.tsx` (tab Hành trình cho người mới), `pages/admin/AdminMetrics.tsx`, `pages/AdminPage.tsx` (mount breakdown), `styles/manager-vision.css`, `styles/admin.css`, `docs/my-ikame-c-level-pitch-2026-10.md` (WAER thay WAU trong câu chuyện — làm ở Phase 4)

## Implementation Steps
1. `team-engagement.ts` + `lib/engagement.ts` (+ test `node`: teamWaer Product = 5/6, earlySignals = [Tuấn]).
2. TeamPulse + css; mount ManagerPage; ManagerAiBrief bullet.
3. NewJoinerCard + tab Hành trình read-only ở 360°.
4. AdminMetrics WAER + AdminWaerBreakdown; mount AdminPage.
5. Build; preview Manager (Mai) + COM Admin (Ngọc); mobile; kiểm tra scope (Đỗ Quang Bình Finance không xuất hiện).

## Success Criteria
- [x] Tổng quan Manager: Nhịp team 83% ▼, Kudos 4/3, Check-in 4/6; Tín hiệu sớm Tuấn Lê với 2 nút chạy (composer kudos mở sẵn người nhận; link 360°)
- [x] Thẻ Gia Huy Ngày 32/60 · 7/12 · buddy Lan; "Đặt 1:1" → receipt; tab Hành trình trong 360°
- [x] Tổng quan COM: WAER 71% +5, phân rã 5 hành động; WAU vẫn hiện làm tham chiếu
- [x] Không rò dữ liệu ngoài team; build sạch

## Risk Assessment
- Số WAER team (83%) vs ô "Check-in tuần đã hoàn tất 2/6" (từ `status==='ok'`) kể chuyện khác nhau → đồng bộ: check-in đúng hạn 4/6 lấy từ engagement, ô stats cũ đổi nguồn sang engagement (1 dòng). Signal vỡ: hai số check-in khác nhau trên cùng màn → sửa ngay.
- Kudos composer mở sẵn người nhận cần prop/query (`/feed?compose=kudos&to=member_tuan`) — nếu PostComposer chưa hỗ trợ, thêm đọc query 5 dòng; không mở rộng composer thêm.
- Manager "Đặt 1:1" chỉ receipt mock (không tạo calendar) — ghi rõ "mô phỏng · Google Calendar qua MCP" để khớp nguyên tắc MCP.
