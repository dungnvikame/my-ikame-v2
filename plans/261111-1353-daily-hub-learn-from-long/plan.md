---
title: "Daily Work Hub cho prototype — học từ bản demo của Long"
description: "Bổ sung vào prototype My iKame các mẫu trải nghiệm tốt nhất ở bản Long (Hôm nay gom việc cần làm, Đề xuất một câu, Cá nhân hub, Lịch và phòng họp, Kết nối công cụ, đo lường + góp ý), vẫn dùng dữ liệu mẫu. Giữ thế mạnh sẵn có: Feed, Sự kiện, Onboarding, Notification, Manager, COM Admin."
status: pending
priority: P1
effort: "5d"
tags: [prototype, daily-work-hub, requests, profile, metrics, demo]
created: 2026-11-11
---

# Daily Work Hub cho prototype

## Overview
Hai bản demo (của Dũng, của Long) cùng trình stakeholder; bản tốt hơn được chọn làm mẫu. Bản Long mạnh ở Daily Work Hub (KR3); bản này mạnh ở Feed/Sự kiện/Onboarding/Manager/COM Admin (KR1, KR2). Mục tiêu: **lấy hết phần tốt của Long vào bản này**, để bản này phủ cả hai phía.

Quyết định đã chốt (11/11):
- **Vẫn là prototype, dữ liệu mẫu, không nối dữ liệu thật.** Không build bản artifact, không gọi MCP thật.
- **Dữ liệu mẫu phải giống thật**: lấy hình dạng, tên trường, con số theo đúng những gì các công cụ thật trả về (iCheck, iGoal, iHiring, IT Platform, iWiki, Asana, Lịch) để stakeholder nhìn thấy "đúng việc của mình".
- **Người xem pilot = stakeholder** (Long, anh Nghĩa, chị Nguyệt, Linh, COM: Vân/Thanh Hường). Phát hành qua link Vercel.
- Feed/Sự kiện giữ nguyên cách lưu hiện tại (mock trong app).

## Học gì từ bản Long → làm gì
| # | Mẫu ở bản Long | Bản mình hiện tại | Phase |
|---|---|---|---|
| 1 | **Hôm nay = "Cần làm ngay"**: ứng viên chờ đánh giá (kèm số ngày chờ), báo cáo tuần đến hạn, khoảng trống trong ngày, việc cũ được gom | Việc hôm nay 5 mục; chưa có iHiring, báo cáo tuần, khoảng trống | 1 |
| 2 | **Lịch + phòng họp**: lịch ngày, phòng trống gợi ý | Chỉ có tool mock trong trợ lý | 1 |
| 3 | **Công việc Asana** có gợi ý xếp vào khoảng trống | Chưa có | 1 |
| 4 | **Đề xuất bằng một câu**: gõ → form đủ loại, ngày, buổi, người duyệt, phép còn lại, trích quy định iWiki | Phải đi vòng `/requests` → Trợ lý AI | 2 |
| 5 | **Đánh giá ứng viên ngay trong app** | Chưa có | 2 |
| 6 | **Nhãn DEMO** rõ cho thao tác mô phỏng | Receipt trông như thật, không phân biệt | 2 |
| 7 | **Cá nhân là một hub**: Mục tiêu, Chấm công và phép, Hồ sơ, Hành trình, Phát triển, Thiết bị + license | Hồ sơ và Công việc tách rời; chưa có thiết bị/license, KR chi tiết | 3 |
| 8 | **Chế độ riêng tư**: che số nhạy cảm, tự che sau 3 phút | `SensitiveGate` chỉ cho lương | 3 |
| 9 | **Trang Kết nối công cụ**: nguồn nào đã nối, trạng thái | Trạng thái server mock, không có trang | 3 |
| 10 | **Tự nhận vai có giải thích** "vì sao tôi thấy vai này" | Chọn tay, không giải thích | 3 |
| 11 | **Tìm nhanh ra tài liệu iWiki**; trợ lý trả lời khớp số trên trang | Search mock; trợ lý kịch bản riêng | 3 |
| 12 | **Đo trong sản phẩm**: người dùng, DAU, tỷ lệ hoàn tất luồng, mức dễ dùng, NPS, nút Góp ý | Tile WAER số cố định; chưa có Góp ý | 4 |
| 13 | **Cách phát hành**: 1 link, khung thời gian, nêu chỗ cần thử, kêu gọi góp ý | Chỉ demo trực tiếp | 5 |

**Không lấy:** CLB, Khoảnh khắc, sinh nhật/thâm niên (ngoài MVP 06/08), lăng kính BOD/Trưởng khối.

**Giữ nguyên:** Feed + ghim + xác nhận đã đọc + lọc từ khoá, Sự kiện (RSVP, album, khảo sát), Onboarding 60 ngày, Notification engine + Bản tin sáng, Manager intelligence, COM Admin.

## Nguyên tắc
- Một file dữ liệu cho một khái niệm; mọi dữ liệu mới kể **cùng một câu chuyện** với roster hiện có (An, Mai, Gia Huy, Lan, Tuấn Lê).
- Chỉ đưa lên Hôm nay thứ có hành động; thống kê (đi muộn…) nằm ở Cá nhân.
- Số ở chuông, Hôm nay, Cá nhân, Trợ lý phải khớp nhau vì đọc chung một nguồn.
- `resetDemo` phủ mọi state mới; 3 lăng kính + overlay Người mới không hỏng.

## Phases
| # | Phase | Effort | Status |
|---|---|---|---|
| 1 | [Hôm nay, Lịch và phòng họp, Công việc](./phase-01-today-calendar-work.md) | 1.5d | Pending |
| 2 | [Đề xuất một câu, đánh giá ứng viên, nhãn DEMO](./phase-02-quick-request-evaluation.md) | 1d | Pending |
| 3 | [Cá nhân hub, riêng tư, Kết nối, vai, tìm kiếm](./phase-03-personal-hub-connections.md) | 1.5d | Pending |
| 4 | [Đo lường, Góp ý, trang Hiệu quả](./phase-04-metrics-feedback.md) | 0.5d | Pending |
| 5 | [Verify, deploy, gửi stakeholder, docs](./phase-05-verify-release.md) | 0.5d | Pending |

Thứ tự 1 → 5. Phase 2 dùng dữ liệu ứng viên + lịch của Phase 1; Phase 3 dùng chung các file dữ liệu mới.

## Success Criteria
- [ ] Trang chủ (An): "Cần làm ngay" có ứng viên chờ đánh giá, báo cáo tuần đến hạn, quest/việc khẩn; có thẻ lịch hôm nay + khoảng trống; mọi dòng bấm tới nơi xử lý
- [ ] Gõ "mai em xin nghỉ buổi sáng" trên `/requests` hoặc Trang chủ → form đúng loại, ngày, buổi, người duyệt, phép còn lại, trích quy định; gửi xong hiện ở Đề xuất của tôi với nhãn DEMO
- [ ] Đánh giá ứng viên: thấy CV tóm tắt + tiêu chí vòng, không chọn sẵn kết quả, lưu xong ứng viên rời "Cần làm ngay"
- [ ] Cá nhân có 6 tab; riêng tư che số nhạy cảm ở mọi trang, tự che sau 3 phút
- [ ] `/connections` liệt kê 8 nguồn + trạng thái; có dòng "vì sao tôi thấy vai này"
- [ ] Trang Hiệu quả (COM Admin) tăng số khi đi hết một luồng; nút Góp ý lưu được và hiện trong trang
- [ ] `tsc` + `vite build` sạch, console sạch, 375px, F4 reset phủ state mới; link Vercel mới + tin gửi stakeholder sẵn sàng

## Risks
- **Home quá dài** khi thêm lịch + nhiều nguồn việc. Tín hiệu: mobile cuộn > 2 màn mới tới "Tin dành cho bạn" → thẻ lịch thu về 1 dòng, "Cần làm ngay" tối đa 5 + dòng gom.
- **Dữ liệu mẫu mâu thuẫn** giữa các trang (phép còn lại, tiến độ KR). Một nguồn duy nhất, không chép số vào component.
- **Parser câu tự nhiên trượt** khi stakeholder gõ câu lạ. Không nhận ra → hiện form trống có gợi ý 4 loại, không báo lỗi.
- **Stakeholder so với bản Long về dữ liệu thật**: bản này vẫn là mẫu. Ghi rõ ở trang Kết nối "bản demo, dữ liệu mẫu theo cấu trúc công cụ thật"; nêu trong tin phát hành.
- **Hai mốc thời gian** (feed kịch bản 10/08 vs ngày máy): dữ liệu mới dùng ngày máy như quy ước cũ.

## Câu hỏi chưa rõ
- Hạn trình stakeholder là ngày nào (trước hay sau 25/11, ngày bản Long kết thúc pilot)? Nếu gấp, cắt Phase 4.

<!-- slug: daily-hub-learn-from-long -->
