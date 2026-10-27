---
title: "Mot shell ba lang kinh: iCheck mong, Ho so HRIS nhu that, AI hanh dong qua MCP mock, bat Manager"
date: 2026-10-27
summary: "Trien khai 5 phase plan three-lenses: widget iCheck + /work, Trang ca nhan HRIS + gate C&B, Tro ly AI goi MCP mock co receipt/do luong, Manager lens + app theo quyen; review 0 blocker, sua 3 major"
---

# Mot shell ba lang kinh: iCheck mong, Ho so HRIS nhu that, AI hanh dong qua MCP mock, bat Manager

## What happened
- Plan `plans/261027-1625-three-lenses-icheck-profile-mcp` (5 phase) theo `docs/my-ikame-direction-review-2026-10.md`, người dùng chốt 6 quyết định (Vận hành = COM Admin lens; iCheck widget + MCP; bật Manager; prototype "như thật"; gamification để ngoài).
- P1 lăng kính iKamer: `components/icheck/*` (banner chấm công, 4 nút nhanh → Trợ lý AI, LeaveBalanceCard khớp ảnh iCheck 2,5/11, WeekStrip theo ngày máy + override), `pages/WorkPage.tsx` (/work), Home mới = widget iCheck + "Việc hôm nay" từ `daily-digest.ts` (dùng chung với intent AI). Nav thêm Công việc.
- P2 Hồ sơ: `data/profile-data.ts` (HrProfile 17 trường, giấy tờ có hạn, dữ liệu nhạy cảm theo personId), `SensitiveGate` (step-up auth mock, mở 5 phút, khoá khi đổi lăng kính), `ProfileHrisCard`, `ProfileDocuments`; payslip dùng gate; giấy tờ thiếu/sắp hết hạn đẩy lên digest.
- P3 MCP mock: `lib/mcp-registry.ts` (7 server, 20 tool, scope/approval), 4 intent iCheck (nghỉ phép/WFH/quên chấm công/đi muộn) đặt trước digest, `AgentAction.tool` + `commit 'attendance'`, receipt `via MCP · tool`, chip toolCalls, `AgentMetricsCard` (tác vụ, hỏi→receipt, hệ thống đã ghi) từ `agentMetrics` trong AppState; QuickAskPanel cùng đường đi.
- P4: PerspectiveSwitch 3 lựa chọn qua `NAV_BY_PERSPECTIVE`; Manager (Mai) có widget iCheck trên Tổng quan; `apps-data.access.roles` + `visibleApps(user)` cho /apps, launcher — An 6 app, Mai 9.
- P5: build sạch; verify trên preview từng luồng (chấm công, kudos, WFH qua MCP → /work đổi WFH + đề xuất, Hồ sơ gate, 3 lăng kính, mobile); pitch doc §B cập nhật demo flow 8 bước.

## Decision
- iCheck trong My iKame = widget + deep-link + hành động qua MCP; giờ chấm công cố định 08:06 "Đúng giờ" để demo buổi chiều không ra "Muộn" (bản thật lấy từ iCheck).
- Intent iCheck chỉ nhận câu YÊU CẦU; câu hỏi chính sách (`chính sách|quy định|là gì|...`) đi iWiki/Q&A. Regex digest siết lại để "hôm nay tôi làm việc từ xa" không bị nuốt. `isoDate` theo giờ máy (không dùng toISOString/UTC).
- Dữ liệu nhạy cảm & giấy tờ key theo personId; đổi lăng kính khoá gate. Banner/day-mark dùng cặp token contrast/on-contrast cho dark mode.
- Review subagent: 0 blocker; sửa 3 major + 7 minor. Để lại: focus-trap cho SensitiveGate, dải tuần không tự cập nhật qua nửa đêm, "Lịch hôm nay có gì" rơi vào digest, leaveBalance vẫn global cho 3 user.

## Next steps
- Chưa commit (chờ người dùng).
- Sau pitch: focus-trap modal, leaveBalance theo personId, lối tắt Home từ visibleApps, nối MCP thật khi framework của Tâm sẵn sàng.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
