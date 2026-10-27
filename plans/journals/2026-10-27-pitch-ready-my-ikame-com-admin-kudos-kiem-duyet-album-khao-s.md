---
title: "Pitch-ready My iKame: COM Admin, Kudos, kiem duyet, album/khao sat su kien, Tro ly AI nguon MCP"
date: 2026-10-27
summary: "Hoan thien ban vibe-code truoc pitch C-Level: vong lap dang-push-xac nhan-do cho COM, Kudos + loc tu dong, album/khao sat su kien, Tro ly AI gop viec tu 5 nguon"
---

# Pitch-ready My iKame: COM Admin, Kudos, kiem duyet, album/khao sat su kien, Tro ly AI nguon MCP

## What happened
- Context lấy từ Slack (27/10): My iKame trượt mốc 30/9 vì scope chưa chốt; pitch C-Level tuần 27/10; MCP framework dùng chung (Tâm PIC). Brief: `docs/my-ikame-context-brief-2026-10.md`, pitch: `docs/my-ikame-c-level-pitch-2026-10.md`.
- Plan `plans/261027-1526-pitch-ready-admin-kudos-events-ai` — 4 phase code + verify:
  - Perspective `admin` (COM Admin, user Lê Bảo Ngọc) + `/admin`: 4 tile (WAU, mở app, đọc, xác nhận), bảng thông báo chính thức (reach/đọc/ack, Gửi push, Nhắc N người, danh sách chưa xác nhận), PinManager; nút ghim trên PostCard cho admin.
  - `acknowledgeNews`/`markNewsRead` cập nhật `metrics` + `pendingAckNames` → vòng lặp iKamer xác nhận → COM thấy số tăng.
  - Composer 2 chế độ (Chia sẻ / Ghi nhận đồng nghiệp) + `lib/moderation.ts` lọc từ khóa nhạy cảm (không duyệt trước, trả bài kèm lý do).
  - Sự kiện đã diễn ra: `EventAlbum`, `EventSurveyPanel` (3 câu, nhắc "Còn 2 ngày").
  - Trợ lý AI: `CONNECTORS` (iGoal · iWiki · HRIS · Asana · Calendar), intent "Hôm nay tôi cần làm gì?" gộp 5 nguồn, chip `sources` trên mọi reply chính.
- Build tsc+vite sạch; verify toàn bộ vòng lặp trên preview :5180 + mobile 375px.

## Decision
- `\b` của JS không hiểu chữ có dấu → regex kiểm duyệt dùng lookaround `\p{L}\p{N}` + `normalize('NFC')`; bỏ term "thưởng" trần vì false positive với Kudos ("khen thưởng"). Test 10 case bằng node (Node 24 strip-types import .ts trực tiếp).
- COM Admin không được xác nhận hộ (guard trong AppState + UI article hiện số liệu phân phối thay nút).
- Bài "Vừa xong" phải xếp đầu feed (hoursAgo → 0).
- Manager vẫn parked; PerspectiveSwitch chỉ iKamer/COM Admin.

## Next steps
- Chưa commit (chờ người dùng).
- Mở: PinnedCarousel chưa có nút bỏ ghim (chỉ bỏ ghim ở /admin); radiogroup sao khảo sát chưa có arrow-key; COM Admin vẫn thấy banner "Cần xác nhận" trên /feed.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
