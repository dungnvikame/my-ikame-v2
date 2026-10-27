---
phase: 2
title: "Kudos + kiểm duyệt tự động"
status: pending
priority: P1
effort: "3h"
dependencies: []
---

# Phase 2: Kudos + kiểm duyệt tự động

## Overview
Composer có 2 chế độ (Chia sẻ / Ghi nhận đồng nghiệp) và bộ lọc tự động từ khóa nhạy cảm — đúng chính sách COM 06/08 (không duyệt trước, trả bài kèm lý do, hậu kiểm).

## Requirements
- Kudos: chọn người nhận (danh sách đồng nghiệp mock), lý do; bài kudos có card riêng (badge "Ghi nhận", "An → Minh Trần"); toast "Đã gửi ghi nhận tới …".
- Kiểm duyệt: khi bấm Đăng, chạy `checkContent(body)`; vi phạm → không đăng, hiện panel lý do + từ khóa bị bắt; sửa → đăng được. Áp dụng cho cả comment? Không (KISS, MVP chỉ bài đăng).

## Architecture
- `types`: `Post.kudos?: { toName: string; toShort: string }`.
- `data/community-data.ts`: `colleagues: { name; shortName; role }[]` (tái dùng tên có sẵn: Minh Trần, Lan Nguyễn, Hà Phạm, Tuấn Lê, Ngọc Anh).
- `lib/moderation.ts`: `SENSITIVE_RULES: { pattern: RegExp; reason: string }[]`; `checkContent(text): ModerationResult`.
- `PostComposer`: state `mode: 'share' | 'kudos'`, `recipient`, `error`; `onSubmit({ body, kudos? })`.
- `AppState.addPost` nhận `kudos`; `PostCard` render khối kudos trên body.
- `FeedPage.handleSubmitPost` → toast khác nhau theo mode.

## Related Code Files
- Create: `src/lib/moderation.ts`
- Modify: `src/types/index.ts`, `src/data/community-data.ts`, `src/AppState.tsx`, `src/pages/community/PostComposer.tsx`, `src/pages/community/PostCard.tsx`, `src/pages/FeedPage.tsx`, `src/styles/community.css`

## Implementation Steps
1. moderation.ts + rule list (C&B/bảo mật, ngôn từ, thông tin cá nhân).
2. Composer: tab chế độ, select người nhận, panel lỗi.
3. Post.kudos + addPost + PostCard render.
4. CSS kudos block + error panel.

## Success Criteria
- [x] Đăng kudos → card ghi nhận xuất hiện đầu tab Toàn công ty
- [x] Đăng bài có "mật khẩu"/"lương" → bị chặn kèm lý do; bỏ từ → đăng được

## Risk Assessment
- Rule regex tiếng Việt có dấu — dùng `toLocaleLowerCase('vi')` + pattern unicode; test nhanh 3 câu.
