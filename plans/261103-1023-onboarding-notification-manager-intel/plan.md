---
title: "Hành trình 60 ngày, Notification engine, Manager Intelligence — bản tiếp theo của prototype My iKame"
description: "Theo docs/my-ikame-journey-map-insights-2026-10.md: bổ sung giai đoạn vòng đời đang trống nhất (Onboarding 60 ngày, overlay Người mới trên lăng kính iKamer, huy hiệu mốc trên Hồ sơ + Feed), lớp notification có rule/preference/digest sáng dùng chung, lát mỏng Manager Intelligence (nhịp team, tín hiệu sớm, người mới) và tile WAER cho COM Admin."
status: pending
priority: P1
effort: "3.5d"
tags: [prototype, onboarding, notification, manager, waer, lifecycle]
created: 2026-11-03
---

# Hành trình 60 ngày · Notification engine · Manager Intelligence

## Overview
Prototype (`prototype-app/`, React + Vite, mock data, không backend) phải **như thật** để pitch. Bản này lấp lỗ hổng lớn nhất khi đối chiếu deck *Vòng đời iKamer* (5/2026) với những gì đã build (commit `740114e`): prototype chưa có gì cho Onboarding (ưu tiên #1 deck, KR2 OKR H2), notification vẫn là push ad-hoc (thách thức #2 pilot T4), Manager chưa thấy tín hiệu engagement team, North Star vẫn đo WAU thay vì WAER.

Quyết định đã chốt (03/11):
- **"Người mới" là overlay trên lăng kính iKamer**, không phải perspective thứ tư: bật khi `hrProfile.joinedAt` < 60 ngày so với ngày máy. Demo bằng user mock thứ tư **Phạm Gia Huy** (`person_huy`, `joinedAt = ngày máy − 31` → luôn hiển thị *Ngày 32/60*), chọn qua chip "Người mới" cạnh PerspectiveSwitch khi đang ở lăng kính iKamer.
- **Buddy/manager** lấy từ roster mock: manager = Trần Thanh Mai (users.mai), buddy = Lan Nguyễn (`member_lan`).
- **Huy hiệu mốc** (30 ngày, 60 ngày, 1 năm…) hiện trên Hồ sơ (hero + timeline) **và** Feed dưới dạng bài chính thức tự động ("My iKame · tự động").
- **WAER** (≥1 hành động có nghĩa/tuần) dùng trong pitch + tile Tổng quan COM; không đổi OKR H2 trong bản này.
- Gamification chỉ ở dạng quest checklist + huy hiệu mốc — **không EXP/coin/đổi quà**.

Nguyên tắc giữ nguyên: HRIS/iCheck là nguồn sự thật; hành động = đề xuất → duyệt → MCP → receipt; dữ liệu mới dùng ngày máy (feed/events giữ kịch bản DEMO_NOW 10/08); `resetDemo` phủ mọi state mới; một file dữ liệu cho một khái niệm.

## Goals
| # | Goal | Priority |
|---|------|----------|
| 1 | **Onboarding Journey 60 ngày**: dữ liệu hành trình (4 mốc, quest checklist, buddy), overlay Người mới trên Home + Việc hôm nay, trang `/onboarding`, huy hiệu mốc trên Hồ sơ + bài tự động trên Feed | P1 |
| 2 | **Notification engine**: `notify(event)` một cửa với bảng rule (kênh, ưu tiên, nhắc lại), preference theo nhóm, **Bản tin sáng** gộp, tất cả emitter hiện có đi qua engine | P1 |
| 3 | **Manager Intelligence lát mỏng**: "Nhịp team tuần này" (team WAER, kudos, check-in đúng hạn, xu hướng), tín hiệu sớm, thẻ người mới trong team; **tile WAER** + phân rã hành động trên Tổng quan COM | P1 |
| 4 | Verify 3 lăng kính + overlay, review, cập nhật pitch demo flow, commit | P1 |

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | [Onboarding Journey 60 ngày + overlay Người mới + huy hiệu](./phase-01-start.md) | Pending |
| 2 | [Notification engine: rule, preference, Bản tin sáng](./phase-02-notification-engine.md) | Pending |
| 3 | [Manager Intelligence lát mỏng + tile WAER](./phase-03-manager-intelligence-waer.md) | Pending |
| 4 | [Verify, review, pitch doc, commit](./phase-04-verify-review-ship.md) | Pending |

Thứ tự: 1 → 2 → 3 → 4. Phase 2 cần event onboarding từ Phase 1 để demo nhắc quest; Phase 3 cần dữ liệu hành trình (thẻ người mới) và dùng cùng module engagement cho tile WAER.

## Success Criteria
- [ ] Chip "Người mới" (iKamer) → Home hiện thẻ *Hành trình của bạn · Ngày 32/60 · 7/12 quest*, Việc hôm nay ưu tiên quest đến hạn; `/onboarding` có 4 mốc, checklist tick được, buddy/manager đúng roster; tick quest cuối tuần 1 → receipt + notification
- [ ] Huy hiệu "30 ngày đầu" trên Hồ sơ Gia Huy (hero + timeline) và bài chính thức tự động trên Feed; An (2023) không thấy overlay
- [ ] `notify()` thay toàn bộ `setNotifications` rải rác; Cài đặt thông báo (Hồ sơ + /notifications) tắt nhóm "Tin COM" → push tin không bắt buộc không vào drawer, tin bắt buộc vẫn vào (khoá); "Bản tin sáng 08:00" gộp N mục, mở ra Việc hôm nay; COM Admin thấy lịch nhắc tự động (24h × tối đa 3)
- [ ] Tổng quan Manager (Mai): Nhịp team tuần này 3 tín hiệu + xu hướng, tín hiệu sớm (Tuấn Lê giảm 2 tuần → gợi ý 1:1), thẻ Gia Huy Ngày 32/60 + việc manager tuần này; Tổng quan COM: tile WAER 71% + phân rã theo hành động
- [ ] `tsc` + `vite build` sạch, console sạch, mobile 375px, F4 reset phủ journey/preference/notifications; review subagent 0 blocker; pitch doc §B có bước Người mới + Bản tin sáng + Nhịp team; commit

## Risks
- **Hai mốc thời gian** (feed tháng 8 vs ngày máy): bài chào mừng Gia Huy trên feed ghi "17/08" → bỏ ngày trong body; dữ liệu 360° của Gia Huy ("sắp gia nhập") phải chuyển sang "đã gia nhập, Ngày 32/60". Signal vỡ: cùng một màn hiện "sắp gia nhập" và "Ngày 32/60" → sửa data ở Phase 1, không đẩy sang Phase 3.
- **Overlay đè lên Home iKamer** làm Home dài: thẻ hành trình thay vị trí hero (khi không có tin bắt buộc) hoặc ngay dưới hero; không thêm section thứ ba. Signal vỡ: Home mobile > 2 màn cuộn tới "Tin dành cho bạn" → chuyển thẻ sang compact 1 dòng.
- **Notification engine phá luồng demo COM** (push → drawer): giữ hành vi mặc định y hệt (mọi nhóm bật), rule chỉ thêm metadata; test lại kịch bản COM sau Phase 2. Signal vỡ: push tin bắt buộc không hiện trong drawer → bug chặn, sửa ngay.
- **Số liệu engagement mock mâu thuẫn** với roster/attention hiện có (Tuấn Lê EKS 38%, Lan trễ check-in): dữ liệu tuần phải kể cùng câu chuyện — Tuấn giảm, Lan trễ, Hà/Ngọc Anh ổn. Một file `team-engagement.ts`, không nhân bản.

<!-- slug: onboarding-notification-manager-intel -->
