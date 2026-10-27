---
title: "Một shell, ba lăng kính — iCheck mỏng, Trang cá nhân như thật, AI hành động qua MCP, bật Manager"
description: "Bản phát triển tiếp của prototype My iKame theo docs/my-ikame-direction-review-2026-10.md: lăng kính iKamer hoàn chỉnh (Home + widget iCheck + tab Công việc), Trang cá nhân dữ liệu HRIS như thật, Trợ lý AI thực thi qua MCP mock có receipt/số đo, bật lăng kính Manager để demo, Ứng dụng theo quyền, dữ liệu mock đồng bộ về T10/2026."
status: completed
priority: P1
effort: "4d"
tags: [prototype, lenses, icheck, profile, mcp, manager]
created: 2026-10-27
---

# Một shell, ba lăng kính

## Overview
Prototype (`prototype-app/`, mock data, không backend) nhưng **phải "như thật"** để mọi người hình dung. Kiến trúc trải nghiệm: shell chung + lõi chung (Feed, Sự kiện, Ứng dụng, AI, Hồ sơ) + 3 lăng kính (iKamer / Manager / COM Admin) đổi Home, nav, quyền và intent AI. Nguyên tắc: native chỉ việc làm xong trong một phiên ngắn; hành động = *đề xuất → duyệt → thực thi qua MCP → receipt*; HRIS/iCheck là nguồn sự thật — My iKame hiển thị + nhắc + deep-link, không nhân bản nghiệp vụ.

Quyết định đã chốt (27/10): Vận hành = COM/HR Admin lens (đã có, không mở rộng ở bản này); iCheck = widget + deep-link + hành động qua MCP; Manager bật lại để demo; prototype mock nhưng như thật; gamification ngoài bản này; dữ liệu HRIS hiển thị theo đề xuất ở Phase 2.

Hiện trạng tái dùng: `perspective` 3 giá trị (manager parked), ManagerPage/TeamPage/MemberDetailPage (~600 dòng, chạy được), ProfilePage + profile/* (HR, leave, pay masked, equipment, timeline), AppState có `dailyCheckIn`/`submitDailyCheckIn`/`leaveBalance`/`requests`, AssistantWorkspace pattern form/okr/info + receipt, COM Admin, feed-items DEMO_NOW.

## Goals
| # | Goal | Priority |
|---|------|----------|
| 1 | Lăng kính iKamer hoàn chỉnh: Home = Việc hôm nay + widget iCheck + Feed/Sự kiện; tab **Công việc** `/work` | P1 |
| 2 | Trang cá nhân như thật: HRIS info đầy đủ, giấy tờ/hợp đồng + nhắc hạn, C&B gate xác thực lại | P1 |
| 3 | Trợ lý AI hành động qua **MCP mock**: registry connector/tool, intent iCheck (nghỉ phép, WFH, quên chấm công), receipt ghi tool call, số đo | P1 |
| 4 | Bật lăng kính **Manager** (switch 3 lựa chọn) + **Ứng dụng theo quyền** từ role/team | P1 |
| 5 | Dữ liệu mock đồng bộ T10/2026, verify toàn bộ 3 lăng kính, review, commit, cập nhật pitch demo flow | P1 |

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | [Lăng kính iKamer: Home + iCheck widget + /work](./phase-01-start.md) | Done |
| 2 | [Trang cá nhân như thật](./phase-02-profile-realistic.md) | Done |
| 3 | [Trợ lý AI hành động qua MCP mock](./phase-03-assistant-mcp-actions.md) | Done |
| 4 | [Bật Manager + Ứng dụng theo quyền](./phase-04-manager-lens-apps-permission.md) | Done |
| 5 | [Đồng bộ dữ liệu, verify, review, commit](./phase-05-realism-verify-ship.md) | Done |

## Success Criteria
- [x] Home iKamer: widget iCheck (trạng thái chấm công hôm nay, 4 nút nhanh, phép còn lại) + "Việc hôm nay" từ AI; bấm *Chấm công* → "Đã chấm công: 08:06 · Đúng giờ", EXP không hiện
- [x] `/work`: iCheck mỏng (dải tuần theo ngày máy + legend, đề xuất gần nhất, *Mở iCheck đầy đủ* handoff), OKR cần check-in, đơn/đề xuất; nav iKamer có mục Công việc (sidebar + bottom-nav)
- [x] `/profile`: Hồ sơ HRIS (17 trường, nguồn "HRIS · cập nhật 26/10"), Giấy tờ & hợp đồng (NDA sắp hết hạn đỏ, bằng ĐH thiếu + nút hành động), payslip/CCCD/bank ẩn → xác thực mock (mật khẩu/Face ID) → hiện 5 phút; ngày sinh dd/mm/yyyy
- [x] `/assistant`: "Hôm nay tôi làm việc từ xa (WFH)" → form → duyệt → receipt `#RCPT · via MCP · icheck.create_wfh_request`; `/work` đổi hôm nay = WFH + đề xuất "Chờ duyệt"; chip tool read (hris.get_profile, icheck.get_today_status…); connectors 7 server có trạng thái (Asana degraded); thẻ Đo lường 1 tác vụ · 10.6s · iCheck
- [x] PerspectiveSwitch 3 lựa chọn; Manager (Mai) thấy Tổng quan + widget iCheck + nav 8 mục; iKamer không thấy; COM Admin giữ nguyên
- [x] `/apps` + launcher theo quyền: An 6 app, Mai 9 app (thêm iHiring, BM Ops, iFinance)
- [x] Mock mới dùng ngày máy (27/10/2026, chấm công 08:06, phép 2,5/11 khớp ảnh iCheck); tsc + vite build sạch
- [x] Review subagent 0 blocker — 3 major (dữ liệu nhạy cảm theo personId + khoá khi đổi lăng kính, intent iCheck không nuốt câu hỏi chính sách, token contrast dark mode) + 7 minor đã sửa; build sạch
- [x] Commit

## Risks
- Mock feed/events đang theo kịch bản tháng 8 (DEMO_NOW 10/08) → chỉ đồng bộ dữ liệu **mới** (iCheck/Profile/MCP) về T10; không đụng feed/events để khỏi vỡ demo đã chốt. Signal vỡ: hai mốc thời gian lệch trên cùng Home → quyết ở Phase 5.
- Manager code 2 tháng không chạy: PerspectiveGuard/HOME_BY_PERSPECTIVE đã sẵn; test đủ 4 route manager trước khi bật switch.
- MCP là mock: contract tool (name/server/params/result) phải viết như thật để Tâm/Nghĩa đọc được — một file `lib/mcp-registry.ts` duy nhất.

<!-- slug: three-lenses-icheck-profile-mcp -->
