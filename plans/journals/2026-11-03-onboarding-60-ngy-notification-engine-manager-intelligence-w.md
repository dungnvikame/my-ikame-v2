---
title: "Onboarding 60 ngày, notification engine, Manager Intelligence + WAER"
date: 2026-11-03
summary: "Plan 261103-1023: 4 phase, review 5 major đã sửa, commit trên master"
---

# Onboarding 60 ngày, notification engine, Manager Intelligence + WAER

﻿## Bối cảnh
Plan `261103-1023-onboarding-notification-manager-intel` (4 phase) — bước tiếp theo sau khi đối chiếu deck "Vòng đời iKamer" (5/2026) với prototype: Onboarding 60 ngày (ưu tiên #1 deck, KR2 OKR H2), notification engine (thách thức #2 pilot T4), Manager Intelligence lát mỏng + WAER.

## Đã làm
- **Phase 1**: user mock thứ tư Gia Huy (`joinedAt = ngày máy − 31` → luôn Ngày 32/60), `lib/onboarding.ts` thuần (journeyDay, buildJourney với 4 trạng thái mốc done/open/current/upcoming, earnedBadges, journeyDigestQuests), `/onboarding` (timeline, checklist checkbox thật, khảo sát 30 ngày 1 chạm, buddy/manager từ roster, huy hiệu), chip "Người mới" cạnh PerspectiveSwitch + nút trong thẻ Demo của Hồ sơ (mobile), nav "Hành trình" có điều kiện, bài tự động `Post.autoSource` trên Feed, dữ liệu cá nhân theo personId (hồ sơ, giấy tờ, nhạy cảm, thâm niên, phép, hợp đồng, phiếu lương, thiết bị).
- **Phase 2**: `lib/notification-rules.ts` (14 kind, nhóm, kênh, nhắc lại 24h × 3, nhóm bắt buộc khoá), `notify()` một cửa trong AppState trả về đã-vào-hộp hay không, preference + bộ đếm "đã lọc" theo personId, Bản tin sáng gộp đúng 5 dòng của Home (`HOME_DIGEST_LIMIT`), tab Cài đặt + link từ Hồ sơ, COM thấy trần nhắc từ rule.
- **Phase 3**: `data/team-engagement.ts` + `lib/engagement.ts` (WAER team, kudos, check-in đúng hạn, trend, earlySignals risk/watch), TeamPulse, NewJoinerCard (Đặt 1:1 → resolve attention), tab Hành trình trong 360° (số liệu sống), ManagerAiBrief nhắc đích danh signal risk, kudos deep-link `/feed?compose=kudos&to=`, AdminMetrics WAER + AdminWaerBreakdown.
- **Phase 4**: build sạch, verify desktop/mobile/dark/F4, review subagent (0 blocker, 5 major đã sửa: toggle mobile, dữ liệu Hồ sơ theo người, digest lệch số, quest thiếu ở Trợ lý AI, chuỗi "7/12" cứng), docs pitch §A5/§B/§C2 + insights §2, memory.

## Bài học / quyết định
- Push từ COM Admin đi qua `notify` với `targetPersonId = person_an`: preference của **người nhận** quyết định, không phải của admin đang bấm — nếu không, kịch bản "tắt Tin COM" không demo được.
- Mốc hành trình cần 4 trạng thái: "open" (đã qua mốc nhưng còn việc) khác "done"; nếu chỉ có 3 thì ở Ngày 32 mốc 30 hiện "Sắp tới".
- Huy hiệu thâm niên chỉ hiện mốc cao nhất; huy hiệu onboarding chỉ cho người có hành trình — nếu không An (3 năm) đeo 5 huy hiệu kể cả "30 ngày đầu".
- Bash tool trong project này hỏng (`shopt` từ profile) → mọi lệnh qua PowerShell; `git commit -F -` với here-string không nhận stdin → ghi message ra file rồi `-F path`.

## Còn mở
- `resolveApproval` notify tới `member_*` không bao giờ vào hộp (không có hrProfile) — đúng ý "khác người demo" nhưng chỉ là no-op.
- `use-search-results`: "Phạm Gia Huy" ở Manager link tới `/manager/team/person_huy` (not found) — lỗi có sẵn với An.
- Tiền tố "Ngày 32/60" trong team-360 (tenureLabel, hint) vẫn là chuỗi cố định (Ngày luôn 32 nên không lệch, chỉ số cột mốc đã động).
- Nhắc lại tự động 24h và push mobile chỉ mô phỏng (không timer).
- Mốc "current" = mốc cuối đã tới (ở Ngày 32 là "Vững vàng" dù còn 2 việc) — reviewer đề xuất semantics khác; giữ nguyên vì dễ hiểu khi demo.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
