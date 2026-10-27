---
phase: 4
title: "Trợ lý AI kết nối nguồn"
status: pending
priority: P2
effort: "2h"
dependencies: []
---

# Phase 4: Trợ lý AI kết nối nguồn (MCP story)

## Overview
Kể câu chuyện agent platform bằng sản phẩm: Trợ lý AI hiển thị các nguồn đang kết nối qua MCP, câu hỏi "Hôm nay tôi cần làm gì?" gộp việc từ nhiều nguồn, mỗi câu trả lời gắn chip nguồn.

## Requirements
- Welcome: dòng connectors `Đang kết nối qua MCP: iGoal · iWiki · HRIS · Asana · Google Calendar` (dot xanh).
- Capability chip mới (ikamer/admin): "Hôm nay tôi cần làm gì?".
- Intent `/hôm nay.*(làm|cần)|việc hôm nay|cần làm gì/`: gộp (a) thông báo bắt buộc chưa ack (HRIS/COM), (b) sự kiện đã đăng ký/sắp diễn ra (My iKame), (c) mục tiêu cần check-in (iGoal), (d) 2 task Asana mock, (e) 1 lịch họp mock; links tới từng mục; `sources: ['HRIS','My iKame','iGoal','Asana','Google Calendar']`.
- `AgentMessage.sources?: string[]` → render chip "Nguồn" dưới bubble cho mọi reply có sources; gắn sources cho 4–5 intent sẵn có (ack-news → HRIS/COM; nghỉ phép → HRIS; OKR → iGoal; iWiki → iWiki).

## Architecture
- `assistant-shared.tsx`: `CONNECTORS` const + capability mới; `capabilitiesFor('admin')` = ikamer.
- `agent-replies.ts`: `buildDailyDigestReply(q, ctx)` đặt trước intent cá nhân; thêm `sources` vào các reply chính.
- `AssistantPage.tsx`: render connectors ở welcome + `message.sources` chips; CSS `styles/assistant-page.css`.

## Related Code Files
- Modify: `src/pages/assistant/assistant-shared.tsx`, `src/pages/assistant/agent-replies.ts`, `src/pages/AssistantPage.tsx`, `src/pages/assistant/assistant-history.ts` (sanitize giữ sources nếu cần), `src/styles/assistant-page.css`

## Implementation Steps
1. Types sources + connectors const.
2. Intent daily digest.
3. UI welcome + chips + CSS.

## Success Criteria
- [x] Hỏi "Hôm nay tôi cần làm gì?" → ≥4 mục từ ≥3 nguồn + links + chip nguồn
- [x] Các intent cũ không regress (ack, đặt phòng, OKR)

## Risk Assessment
- Regex giao nhau với intent "hôm nay" của đặt phòng → kiểm tra thứ tự: đặt phòng match `/đặt phòng/` trước.
