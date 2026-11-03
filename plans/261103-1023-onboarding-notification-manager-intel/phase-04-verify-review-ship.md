---
phase: 4
title: "Verify 3 lăng kính + overlay, review, pitch doc, commit"
status: pending
priority: P1
effort: "3h"
dependencies: [1, 2, 3]
---

# Phase 4: Verify, review, cập nhật pitch doc, commit

## Overview
Chạy trọn kịch bản demo mới trên preview (iKamer An → Người mới Gia Huy → Manager Mai → COM Admin Ngọc), rà số liệu/mốc thời gian khớp nhau, review subagent, cập nhật demo flow trong pitch doc với câu chuyện "Ngày 0 → Ngày 60 trên một hub, manager thấy tín hiệu sớm, COM đo WAER", commit.

## Requirements
- Số liệu khớp: Gia Huy Ngày 32/60 · 7/12 (→ 8/12 sau tick) giống nhau ở Home, /onboarding, Hồ sơ, thẻ Manager, 360°; WAER team 83% vs COM 71% (khác phạm vi — ghi chú nguồn); check-in 4/6 khớp 2 chỗ trên Tổng quan Manager.
- `resetDemo` phủ: journey progress, preferences, notifications (gồm digest seed), suppressedCount, demoNewJoiner (giữ như perspective — **không** reset, ghi chú).
- Pitch doc `docs/my-ikame-c-level-pitch-2026-10.md`: §A câu chuyện thêm "vòng đời" + WAER; §B demo flow chèn 3 bước: (Người mới) Home → Hành trình → tick quest → Feed huy hiệu; (iKamer) Bản tin sáng + Cài đặt thông báo; (Manager) Nhịp team → Tín hiệu sớm → Gia Huy; (COM) tile WAER. Cập nhật `docs/my-ikame-journey-map-insights-2026-10.md` §2 bảng trạng thái.
- Journal + đóng plan.

## Implementation Steps
1. Rà số liệu/mốc; sửa mock lệch.
2. `npm --prefix prototype-app run build` (PowerShell); preview `my-ikame-prototype`: 4 kịch bản + F4 reset + mobile 375px + dark mode; console sạch.
3. code-reviewer subagent (scope: diff từ `740114e`) → sửa major/minor hợp lý; build lại.
4. Cập nhật 2 docs; memory dự án.
5. Commit (conventional, Co-Authored-By theo quy ước phiên); `ak plan phase close` ×4; journal.

## Success Criteria
- [x] 4 kịch bản chạy không lỗi console; mobile + dark OK; F4 trả về trạng thái đầu
- [x] Review 0 blocker, major đã sửa
- [x] Pitch doc + insights doc cập nhật; commit trên master

## Risk Assessment
- Review tìm ra lỗi overlay/notification ảnh hưởng luồng cũ (COM push) → ưu tiên sửa luồng cũ trước, tính năng mới sau; nếu không kịp, tắt chip Người mới mặc định và ghi vào journal.
