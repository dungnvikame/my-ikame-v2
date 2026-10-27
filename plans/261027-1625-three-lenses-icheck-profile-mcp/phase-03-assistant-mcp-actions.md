---
phase: 3
title: "Trợ lý AI hành động qua MCP mock"
status: pending
priority: P1
effort: "6h"
dependencies: [1]
---

# Phase 3: Trợ lý AI hành động qua MCP mock

## Overview
Biến Trợ lý AI thành *client của MCP framework chung*: registry connector/tool viết như hợp đồng thật, intent iCheck mới (nghỉ phép, WFH, quên chấm công, đi muộn/về sớm), mọi receipt ghi tool đã gọi, thẻ đo lường — đúng pattern anh Nghĩa (agent đề xuất → người duyệt → thực thi → audit) và cho Tâm một use-case cụ thể.

## Requirements
- `lib/mcp-registry.ts`: `McpServer = { id: 'icheck'|'igoal'|'iwiki'|'hris'|'irequest'|'asana'|'calendar'; name; status: 'connected'|'degraded'|'offline'; tools: McpTool[] }`, `McpTool = { name; description; params; scope: 'read'|'write'; approval: 'auto'|'human' }`. Ví dụ: `icheck.get_today_status`, `icheck.create_leave_request`, `icheck.create_wfh_request`, `icheck.report_missing_checkin`, `igoal.submit_checkin`, `irequest.create_ticket`, `hris.get_profile`, `calendar.find_free_room`.
- Intent mới (agent-replies): *xin nghỉ phép* (đã có form → nay commit `icheck`), *WFH hôm nay/ngày mai*, *quên chấm công sáng nay*, *xin đi muộn/về sớm* → workspace form điền sẵn (ngày, giờ, lý do, người duyệt = quản lý trực tiếp từ HRIS) + steps ghi tool read đã gọi; action commit `attendance` → `addAttendanceRequest` + cập nhật weekAttendance (WFH) / dailyCheckIn (quên chấm công → "Đã gửi bổ sung").
- Receipt: `#RCPT-xxxx · via MCP icheck.create_leave_request · 0.8s` (mock timing) — hiển thị trong chat + AssistantWorkspace.
- Connectors line (welcome) đọc từ registry: dot xanh/vàng theo status; tooltip số tool.
- Thẻ *Đo lường* (dưới composer hoặc rail): số tác vụ hoàn thành phiên này, thời gian trung bình "từ hỏi → receipt", tỷ lệ duyệt — đếm trong AppState `agentMetrics` (reset demo xoá). Phục vụ tiêu chí hiệu quả của anh Nghĩa.
- Không chạm manager intents (bật ở Phase 4).

## Architecture
- `AgentAction.commit` mở rộng `'attendance'`; `action.attendance = { kind; dateLabel; note }`.
- `AgentMessage.toolCalls?: { tool: string; server: string; phase: 'read'|'write' }[]` → steps + receipt.
- AssistantPage `runAction`: commit attendance → AppState; ghi `agentMetrics`.
- QuickAskPanel dùng chung engine → tự có.

## Related Code Files
- Create: `src/lib/mcp-registry.ts`, `src/components/assistant/AgentMetricsCard.tsx`
- Modify: `src/pages/assistant/agent-replies.ts`, `src/pages/assistant/assistant-shared.tsx` (CONNECTORS → registry), `src/pages/AssistantPage.tsx`, `src/pages/assistant/AssistantWorkspace.tsx` (receipt tool line), `src/AppState.tsx`, `src/styles/assistant-page.css`

## Implementation Steps
1. mcp-registry + connectors từ registry.
2. 4 intent iCheck + toolCalls trên intent sẵn có (ack, OKR, request, nghỉ phép).
3. runAction commit attendance + metrics.
4. UI receipt tool line + AgentMetricsCard.

## Success Criteria
- [x] 4 câu iCheck → form → duyệt → receipt có tool name; /work và /requests phản ánh
- [x] Welcome hiện 7 connector với trạng thái; thẻ Đo lường tăng sau mỗi tác vụ
- [x] Intent cũ không regress; QuickAskPanel vẫn chạy

## Risk Assessment
- Regex giao nhau: "nghỉ phép" (hỏi số dư) vs "xin nghỉ" (tạo đơn) — thứ tự: tạo đơn trước, số dư sau (đã vậy); "wfh|work from home|làm từ xa" đặt trước "sự kiện|lịch".
