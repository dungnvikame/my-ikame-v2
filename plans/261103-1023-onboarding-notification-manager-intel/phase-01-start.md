---
phase: 1
title: "Onboarding Journey 60 ngày + overlay Người mới + huy hiệu mốc"
status: pending
priority: P1
effort: "12h"
dependencies: []
---

# Phase 1: Onboarding Journey 60 ngày — overlay Người mới, trang hành trình, huy hiệu

## Overview
Lấp giai đoạn vòng đời đang trống nhất: user mới (Gia Huy) thấy hành trình 60 ngày ngay trên Home, có checklist quest theo mốc, buddy/manager từ roster, huy hiệu mốc trên Hồ sơ và bài tự động trên Feed. iKamer lâu năm (An) không thấy gì thay đổi.

## Requirements
- Functional
  - User mock thứ tư `users.huy` (Phạm Gia Huy, Product Designer, team Product, `roleKey: 'member'`, `personId: 'person_huy'`); `hrProfiles.person_huy` với `joinedAt` = ngày máy − 31 ngày (dd/mm/yyyy), `documentsByPerson`/`sensitiveByPerson` tối thiểu (NDA đã ký, bằng ĐH thiếu).
  - Chip **"Người mới"** cạnh PerspectiveSwitch, chỉ hiện ở lăng kính iKamer; bật → `user = users.huy`, tắt → `users.an`. State `demoNewJoiner` trong AppState (không persist), reset khi đổi lăng kính.
  - `lib/onboarding.ts`: `journeyDay(joinedAt, today)`, `isNewJoiner(profile) = day ≤ 60`, `buildJourney(day, progress)` → 4 mốc (`Ngày 0 · Welcome Pack`, `Tuần 1 · Hoà nhập`, `30 ngày · Vững vàng`, `60 ngày · Tốt nghiệp`) với trạng thái done/current/upcoming, quest list 12 mục (danh bạ team, quiz văn hoá iKame, tour My iKame, đọc 3 quy trình iWiki, cà phê với buddy, 1:1 đầu tiên với manager, thiết lập mục tiêu thử việc iGoal, khoá An toàn thông tin, khảo sát 30 ngày, check-in OKR 30 ngày, trình bày dự án nhỏ, khảo sát 60 ngày), `dueDay`, `source` (My iKame/iWiki/iGoal/HRIS), `href`.
  - `data/onboarding-data.ts`: tiến độ mặc định cho person_huy (7/12 done; quest tuần 1 xong trừ "Cà phê với buddy"; "Khảo sát 30 ngày" đến hạn hôm nay), buddy = `member_lan` (Lan Nguyễn), manager = users.mai; `badges` mốc: `badge-30d` đã nhận (ngày 30), `badge-60d`, `badge-1y` chưa.
  - AppState: `journey` (progress theo personId), `completeQuest(id)` → receipt + (Phase 2) notification; `resetDemo` phủ.
  - Home (overlay khi `isNewJoiner`): thẻ **Hành trình của bạn · Ngày 32/60** (progress bar, quest kế tiếp, buddy/manager avatar, nút "Mở hành trình") đặt ngay dưới hero bắt buộc (hoặc thay vị trí hero khi không có tin bắt buộc). `buildDailyDigestItems` nhận `journeyQuests` → quest đến hạn hôm nay lên đầu Việc hôm nay (nguồn "Onboarding"), tối đa 2.
  - Trang `/onboarding` (`pages/OnboardingPage.tsx` + `pages/onboarding/{JourneyTimeline,QuestChecklist,BuddyCard}.tsx`): header "Ngày 32/60 · còn 28 ngày tới tốt nghiệp", timeline 4 mốc, checklist theo mốc (tick được, quest có `href` ngoài → PlatformHandoff iWiki/iGoal), thẻ buddy + manager (Slack/1:1 kế tiếp), huy hiệu đã nhận. Nav iKamer thêm mục "Hành trình" chỉ khi `isNewJoiner` (sidebar + bottom-nav).
  - Huy hiệu: `ProfilePage` hero thêm chip huy hiệu + `seniorityEntries` theo personId (person_huy: Gia nhập, Huy hiệu 30 ngày); Feed có bài chính thức tự động `authorName: 'My iKame'`, `official: true`, body "Gia Huy hoàn thành 30 ngày đầu tại iKame 🎉 — 7/12 cột mốc", `audienceTeamIds` team Product, nhãn "Tự động từ HRIS".
  - Data 360° của Gia Huy (`team-360.ts`, `teamMembers`, feed welcome post) đổi sang "đã gia nhập": `joinedAt` theo ngày máy, `tenureLabel: 'Ngày 32/60'`, signals onboarding 7/12, `attentionSummary: 'Người mới · Ngày 32/60'`; body bài chào mừng bỏ ngày cứng.
- Non-functional: không EXP/coin; copy tiếng Việt như COM viết; a11y (progress có `aria-valuenow`, checklist là `<input type=checkbox>` thật); dark mode dùng token contrast; mobile 375px.

## Architecture
- `lib/onboarding.ts` thuần (không React) để Home, OnboardingPage, Manager (Phase 3) và daily-digest cùng dùng. Ngày tính từ `hrProfile.joinedAt` (dd/mm/yyyy) vs ngày máy — giống pattern `buildWeekAttendance`.
- Overlay = điều kiện render trong HomePage + AppShell nav, không thêm Perspective. `demoNewJoiner` chỉ là công tắc chọn user demo; logic thật dựa trên joinedAt nên sau này bỏ chip không ảnh hưởng.
- Bài tự động là `Post` thường có `official: true` + `autoSource: 'HRIS'` (thêm field optional) để PostCard gắn nhãn; vào `initialPosts` (không cần COM duyệt ở bản này).

## Related Code Files
- Create: `prototype-app/src/lib/onboarding.ts`, `prototype-app/src/data/onboarding-data.ts`, `prototype-app/src/pages/OnboardingPage.tsx`, `prototype-app/src/pages/onboarding/JourneyTimeline.tsx`, `QuestChecklist.tsx`, `BuddyCard.tsx`, `prototype-app/src/components/onboarding/JourneyCard.tsx`, `prototype-app/src/styles/onboarding.css`
- Modify: `types/index.ts` (User không đổi; `Post.autoSource?`, `JourneyMilestone`, `JourneyQuest`, `LifecycleBadge`), `data/mockData.ts` (`users.huy`, teamMembers giahuy), `data/profile-data.ts` (hrProfiles/documents/sensitive person_huy, seniority theo personId), `data/team-360.ts` (giahuy), `data/community-data.ts` (bài chào mừng, bài tự động 30 ngày), `AppState.tsx` (`demoNewJoiner`, `journey`, `completeQuest`, seniorityEntries theo personId, resetDemo), `components/AppShell.tsx` (chip Người mới, nav Hành trình), `pages/HomePage.tsx`, `pages/assistant/daily-digest.ts` (+`journeyQuests`), `pages/ProfilePage.tsx` + `profile/ProfileHrSection.tsx` (huy hiệu), `pages/community/PostCard.tsx` (nhãn tự động), `App.tsx` (route `/onboarding`), `styles/app.css` (chip)

## Implementation Steps
1. Types + `lib/onboarding.ts` (+ test nhanh bằng `node` import .ts: day 32 → mốc 30 done, 60 upcoming).
2. Dữ liệu: users.huy, hrProfile/documents/sensitive/seniority person_huy, onboarding-data, cập nhật giahuy trong teamMembers/team-360/feed.
3. AppState: `demoNewJoiner` + `setDemoNewJoiner`, user resolve (`perspective==='ikamer' && demoNewJoiner ? users.huy : USER_BY_PERSPECTIVE[p]`), `journey`/`completeQuest`, `seniorityEntries` theo personId, resetDemo.
4. AppShell: chip "Người mới" (aria-pressed) chỉ ở iKamer; nav "Hành trình" có điều kiện.
5. Home: `JourneyCard` + digest quest; `/onboarding` page + 3 component + css.
6. Hồ sơ huy hiệu; Feed bài tự động + nhãn PostCard.
7. Build; preview: An (không overlay) → bật Người mới → Home → Hành trình → tick quest → Hồ sơ → Feed; mobile.

## Success Criteria
- [x] Bật chip Người mới: Home có thẻ Hành trình Ngày 32/60 · 7/12, Việc hôm nay có "Khảo sát 30 ngày" nguồn Onboarding; tắt chip: Home An như cũ
- [x] `/onboarding`: 4 mốc đúng trạng thái, tick "Cà phê với buddy" → 8/12 + receipt; buddy Lan Nguyễn, manager Trần Thanh Mai
- [x] Hồ sơ Gia Huy: huy hiệu "30 ngày đầu", timeline 2 mục, HRIS joinedAt = ngày máy − 31; Feed có bài tự động nhãn "Tự động từ HRIS"
- [x] Manager roster/360° Gia Huy không còn "sắp gia nhập"; build sạch

## Risk Assessment
- joinedAt động theo ngày máy làm nhãn thay đổi mỗi ngày (chấp nhận — đúng "như thật"); nếu demo cần số cố định, đổi hằng `JOURNEY_DEMO_DAY = 32` một chỗ trong onboarding-data.
- Home quá dài cho người mới → thẻ hành trình compact (1 hàng) khi có hero bắt buộc.
- `users` Record key union mở rộng ('huy') kéo theo chỗ dùng `keyof` — grep trước khi sửa.
