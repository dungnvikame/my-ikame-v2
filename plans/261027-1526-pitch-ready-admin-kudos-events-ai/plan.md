---
title: "Pitch-ready: COM Admin, Kudos, kiểm duyệt, album+khảo sát sự kiện, Trợ lý AI kết nối nguồn"
description: "Hoàn thiện bản vibe-code My iKame trước pitch C-Level: góc nhìn COM Admin (ghim/push/đo acknowledge & WAU), Kudos, kiểm duyệt tự động, album + khảo sát sự kiện đã diễn ra, Trợ lý AI hiện nguồn MCP + câu 'Hôm nay tôi cần làm gì'."
status: in-progress
priority: P1
effort: "2d"
tags: [pitch, admin, kudos, moderation, events, assistant]
created: 2026-10-27
---

# Pitch-ready: P1 + P2

## Overview
Bổ sung vào prototype (`prototype-app/`, mock data) đúng các điểm còn thiếu so với yêu cầu COM 06/08 và 4 quyết định cần lấy ở buổi C-Level (xem `docs/my-ikame-c-level-pitch-2026-10.md`, `docs/my-ikame-context-brief-2026-10.md`). Vòng lặp demo mục tiêu: **COM đăng/ghim → push → iKamer đọc/xác nhận → COM thấy ai chưa xác nhận, nhắc lại, đo WAU**.

Context: Perspective hiện chỉ `ikamer` (Manager parked). Composer chỉ có text. Events chưa có album/khảo sát. Trợ lý AI đã có intent engine keyword (`agent-replies.ts`) + capabilities chips.

## Goals
| # | Goal | Priority |
|---|------|----------|
| 1 | Góc nhìn **COM Admin** `/admin`: dashboard WAU/đọc/acknowledge, bảng thông báo chính thức (push, nhắc người chưa xác nhận), quản lý ghim | P1 |
| 2 | **Kudos** trong composer + card riêng trên Feed | P1 |
| 3 | **Kiểm duyệt tự động** khi đăng (không duyệt trước, trả bài + lý do) | P2 |
| 4 | Sự kiện đã diễn ra: **album ảnh + khảo sát 1 phút** có nhắc hạn | P2 |
| 5 | Trợ lý AI: dòng **kết nối nguồn (MCP)** + câu "Hôm nay tôi cần làm gì?" gộp 3 nguồn + chip nguồn trên câu trả lời | P2 |

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | [COM Admin perspective + /admin](./phase-01-start.md) | Pending |
| 2 | [Kudos + kiểm duyệt tự động](./phase-02-kudos-moderation.md) | Pending |
| 3 | [Album + khảo sát sự kiện](./phase-03-event-album-survey.md) | Pending |
| 4 | [Trợ lý AI kết nối nguồn](./phase-04-assistant-connectors.md) | Pending |
| 5 | [Verify + review + commit](./phase-05-verify-ship.md) | Pending |

## Success Criteria
- [x] Switch iKamer ↔ COM Admin trong sidebar; admin thấy nav riêng + `/admin`; iKamer không thấy nút admin trên feed
- [x] iKamer xác nhận bài chính sách → sang Admin thấy số acknowledge tăng (53%), tên biến khỏi danh sách chưa xác nhận (6→5)
- [x] Admin bấm *Gửi push* / *Nhắc lại* → badge thông báo 2→4; ghim/bỏ ghim (3→2) phản ánh ở carousel Feed
- [x] Composer có chế độ Ghi nhận đồng nghiệp; bài kudos hiển thị card riêng; toast gửi ghi nhận
- [x] Đăng bài chứa "mật khẩu" → chặn kèm lý do (regex lookaround \p{L} + NFC, test 10 case node); sửa lại → đăng được
- [x] Sự kiện đã diễn ra (Town Hall Q2) có album 6 ảnh + panel khảo sát; hoàn thành → panel "Cảm ơn"
- [x] Trợ lý AI: welcome hiện connectors MCP; "Hôm nay tôi cần làm gì?" → 7 việc từ 5 nguồn + chip nguồn
- [x] `npm run build` sạch (27/10); review subagent: 3 major đã sửa (regex tiếng Việt, admin không được ack hộ, read count), 4 minor đã sửa; resetDemo bao phủ state mới (news/events/posts)

## Risks
- `Perspective` type lan khắp (AgentCtx, guard, nav) → thêm `'admin'` và grep mọi `=== 'manager'`; manager vẫn parked.
- Mock metrics acknowledge phải nhất quán với hành động user → dồn logic vào `acknowledgeNews` (một chỗ).

<!-- slug: pitch-ready-admin-kudos-events-ai -->
