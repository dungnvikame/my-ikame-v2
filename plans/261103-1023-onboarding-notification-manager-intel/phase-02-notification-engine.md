---
phase: 2
title: "Notification engine: rule, preference, Bản tin sáng"
status: pending
priority: P1
effort: "8h"
dependencies: [1]
---

# Phase 2: Notification engine — một cửa `notify()`, rule, preference, Bản tin sáng

## Overview
Biến notification từ push ad-hoc (`setNotifications` rải ở pushNews/remindPendingAck) thành hạ tầng dùng chung: mọi sự kiện đi qua `notify(event)` → bảng rule quyết định kênh/ưu tiên/nhắc lại → lọc theo preference người dùng → vào drawer; buổi sáng gộp thành **Bản tin sáng**. Giải thách thức #2 pilot T4 (đăng nhiều, tương tác nghẽn vì không có notification).

## Requirements
- Functional
  - `lib/notification-rules.ts`: `NotificationEvent` (`kind`: `news_mandatory` | `news_official` | `news_reminder` | `feed_mention` | `feed_kudos` | `feed_comment` | `event_registration` | `event_reminder` | `icheck_missing` | `request_decided` | `onboarding_quest_due` | `onboarding_milestone` | `manager_approval_pending` | `digest_morning`; `title`, `body`, `href`, `groupKey?`, `targetPersonId?`), `NotificationGroup` (`official` | `com` | `feed` | `events` | `work` | `onboarding` | `manager`), bảng `RULES: Record<kind, { group, priority, channels: ('push'|'inapp'|'digest')[], remindAfterHours?, maxReminders?, locked? }>` — `news_mandatory`/`news_reminder` `locked: true` (không tắt được), `remindAfterHours: 24, maxReminders: 3`.
  - `NotificationPreference` = `Record<NotificationGroup, boolean>` + `digestTime: '08:00'` + `quietHours: '21:00–07:00'`; mặc định tất cả bật; lưu trong AppState theo personId (không persist localStorage; resetDemo về mặc định).
  - AppState `notify(event)`: tra rule → nếu nhóm tắt và không `locked` → bỏ (ghi `suppressedCount` để Cài đặt hiện "đã lọc N thông báo tuần này"); nếu có `'inapp'` → prepend `NotificationItem` (time "Vừa xong", priority từ rule); nếu `targetPersonId` khác user hiện tại → bỏ (một user demo). Thay toàn bộ emitter: `pushNews`, `remindPendingAck`, `setEventRegistration` (đăng ký thành công/chờ), `addPost` kudos (tới người nhận — bỏ qua vì khác user), `resolveApproval` (member nhận quyết định), `completeQuest`/mốc (Phase 1), `addAttendanceRequest` ("Đơn WFH đã gửi, chờ Mai duyệt").
  - **Bản tin sáng**: `buildMorningDigest(ctx)` trong `pages/assistant/daily-digest.ts` (tái dùng `buildDailyDigestItems`) → một `NotificationItem` `groupKey: 'digest'`, title "Bản tin sáng 08:00 · N việc hôm nay", body 3 dòng đầu, href `/home`; seed sẵn trong `initialNotifications` (time "08:00 hôm nay"); nút "Gửi lại Bản tin sáng" trong Cài đặt thông báo để demo.
  - UI Cài đặt thông báo: `pages/notifications/NotificationSettings.tsx` — toggle theo nhóm (switch `role="switch"`), nhóm locked hiện khoá + chú thích "Bắt buộc theo quy định COM", giờ digest, giờ yên lặng (hiển thị, không logic); mount ở `/notifications` tab "Cài đặt" và `ProfilePage` khối Cài đặt (link).
  - COM Admin: `OfficialNewsTable` cột/nhãn "Nhắc tự động: 24h · tối đa 3 · đã gửi {remindersSent}/3"; nút Nhắc lại thủ công giữ nguyên nhưng chặn khi đã 3 lần (disabled + tooltip).
  - Drawer/NotificationsPage: item `digest` render gộp (icon Sun, body dạng list 3 dòng); tab "Cần làm" giữ logic cũ.
- Non-functional: hành vi mặc định y hệt bản trước (mọi nhóm bật → cùng số notification); không timer thật (nhắc lại vẫn do COM bấm hoặc digest seed) — ghi rõ trong copy "mô phỏng".

## Architecture
- Rule table thuần + `notify` trong AppState là điểm vào duy nhất; component không gọi `setNotifications`.
- Preference theo personId (như sensitive) để Gia Huy/An/Mai độc lập; đổi lăng kính không reset preference (khác sensitive).
- Digest chỉ là một notification có `groupKey: 'digest'` — không cần type mới; `NotificationItem` thêm `lines?: string[]` optional để render gộp.

## Related Code Files
- Create: `prototype-app/src/lib/notification-rules.ts`, `prototype-app/src/pages/notifications/NotificationSettings.tsx`, `prototype-app/src/styles/notifications.css`
- Modify: `types/index.ts` (`NotificationItem.lines?`, `NotificationPreference`), `AppState.tsx` (`preferences`, `setPreference`, `notify`, `suppressedCount`, `resendMorningDigest`, thay 6 emitter, resetDemo), `data/mockData.ts` (seed digest), `pages/assistant/daily-digest.ts` (`buildMorningDigest`), `pages/NotificationsPage.tsx` (tab Cài đặt, render digest), `components/AppShell.tsx` (drawer render digest), `pages/ProfilePage.tsx` (link Cài đặt thông báo), `pages/admin/OfficialNewsTable.tsx` (nhắc tự động), `styles/app.css`

## Implementation Steps
1. Types + `notification-rules.ts` (+ test `node`: news_official khi `com=false` → suppressed; news_mandatory khi `official=false` → vẫn gửi).
2. AppState: preferences theo personId, `notify`, thay emitter từng cái (grep `setNotifications((items) => [`), `resendMorningDigest`, resetDemo.
3. `buildMorningDigest` + seed; render digest ở NotificationList (drawer + page).
4. `NotificationSettings` + tab ở /notifications + link ở Hồ sơ; css.
5. OfficialNewsTable nhắc tự động + chặn >3.
6. Build; preview: COM push tin thường → iKamer drawer có; tắt "Tin COM" → push lại → không có, push bắt buộc → có; Bản tin sáng mở → /home; đăng ký sự kiện → notification; mobile.

## Success Criteria
- [x] Không còn `setNotifications((items) => [` ngoài `notify`; kịch bản COM push → drawer vẫn chạy như bản trước
- [x] Tắt nhóm Tin COM lọc đúng, nhóm Bắt buộc khoá; Cài đặt hiện "đã lọc N"
- [x] Bản tin sáng gộp N mục đúng với Việc hôm nay của user hiện tại (An vs Gia Huy khác nhau); "Gửi lại" tạo item mới
- [x] Tick quest Phase 1 / đăng ký sự kiện / gửi đơn WFH đều sinh notification qua rule đúng nhóm; build sạch

## Risk Assessment
- Thay emitter sót một chỗ → notification mất: grep + review diff AppState; signal: drawer trống sau push → chặn.
- Preference theo personId nhưng notifications list dùng chung một mảng (một user demo) → khi đổi user, list không đổi: chấp nhận ở prototype, ghi chú trong plan; nếu phản cảm khi demo Gia Huy, lọc theo `targetPersonId` khi render (1 dòng).
- Digest seed "08:00 hôm nay" + bucket `dayBucket` regex `/phút|giờ/` → "08:00" không match → rơi "Trước đó"; sửa regex thêm `/\d{2}:\d{2}/` → Hôm nay.
