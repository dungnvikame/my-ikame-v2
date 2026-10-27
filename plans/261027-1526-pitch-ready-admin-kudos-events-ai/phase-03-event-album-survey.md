---
phase: 3
title: "Album + khảo sát sự kiện đã diễn ra"
status: pending
priority: P2
effort: "2h"
dependencies: []
---

# Phase 3: Album + khảo sát sự kiện đã diễn ra

## Overview
Trang chi tiết sự kiện đã diễn ra có khối Album ảnh (mock cover blocks, link Drive) và panel Khảo sát 1 phút với nhắc hạn ≤3 ngày — hai yêu cầu COM nêu rõ.

## Requirements
- Chỉ hiện với `status === 'past'`. Album: grid 6 ô emoji/palette + caption + link "Mở album đầy đủ". Khảo sát: số câu, phút, hạn; bấm *Làm khảo sát* → mở form mini (3 câu rating/chọn) → gửi → receipt + panel chuyển "Đã hoàn thành". Nhắc: pill "Còn 2 ngày" khi chưa làm.
- EventCardV2 (tab Đã diễn ra): badge nhỏ "📷 Album" nếu có album.

## Architecture
- `types`: `EventItem.album?: { photos: { emoji; palette; caption }[]; driveUrl?: string }`, `EventItem.survey?: { questions: number; minutes: number; dueLabel: string; done?: boolean }`.
- `mockData`: thêm album + survey cho `town-hall-q2` (+ 1 sự kiện past khác nếu có).
- `AppState.completeEventSurvey(id)`.
- `pages/events/EventAlbum.tsx`, `pages/events/EventSurveyPanel.tsx`; mount trong `EventDetailPage` (album trong article, survey trong action-rail thay rsvp khi past).
- CSS vào `styles/events-v2.css`.

## Related Code Files
- Create: `src/pages/events/EventAlbum.tsx`, `src/pages/events/EventSurveyPanel.tsx`
- Modify: `src/types/index.ts`, `src/data/mockData.ts`, `src/AppState.tsx`, `src/pages/EventPages.tsx`, `src/pages/events/EventCardV2.tsx`, `src/styles/events-v2.css`

## Implementation Steps
1. Types + mock.
2. AppState action + resetDemo.
3. 2 component + mount + CSS.

## Success Criteria
- [x] /events/town-hall-q2 hiện album + khảo sát; hoàn thành → receipt, pill nhắc biến mất
- [x] Sự kiện sắp diễn ra không đổi

## Risk Assessment
- `rsvp-panel` CSS tái dùng cho survey panel để không viết mới nhiều.
