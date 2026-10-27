# My iKame — Context Brief (tổng hợp từ Slack, cập nhật 27/10/2026)

Nguồn: #ikame-myikame-project (C06F4G9MNHY), #ikame-myikame-pilot (C095QBPJBS5), #platform-product-manager (C0AJ4SRHGQN), #platform-business-management (C0736FT29B4), #platform-bm-ai-project (C0C2ABVJEEM), canvas Report BM 19–26/10, canvas Recap PM Monthly 02/10.

## 1. My iKame là gì — định vị
- **Employee Experience Gate / Central Hub nội bộ** cho iKamer & Manager (spec `docs/My-iKame-Product-Spec-v0.2.md`, D1–D9).
- Team COM kỳ vọng: **thay Facebook Group + Slack làm kênh truyền thông chính thống**, gom sự kiện, kho ảnh, link công cụ, tiện ích hằng ngày về một điểm vào.
- Thuộc OKR Team BM H2/2026 — **O1-KR4: My iKame — WAU ≥80%, launch 30/9, duy trì hết Q4**. PM: Dũng. Dev: Phú, Trung (UI kit), Hiệp; QA: Huyền; PO phía COM: Vân, Thanh Hường; sponsor: Long (BM lead), Nghĩa (CTO/AI), chị Nguyệt.

## 2. Lịch sử ngắn
| Mốc | Sự kiện |
|---|---|
| H1/2026 (T4–T5) | Pilot My iKame **v3 app + web** (newsfeed, quest/XP/coin, iReward đổi quà, leaderboard). Prod: `myikame-dev.ikameglobal.com`. Dữ liệu nhân sự lấy từ HRIS. |
| 28/07 | Catch-up: 2 mục tiêu H2 — (a) kênh truyền thông chính thức thay Facebook, (b) hỗ trợ onboarding nhân sự mới. |
| 06/08 | Họp COM × Tech: chốt **MVP = Newsfeed + Event**, không nhồi gamification/onboarding/CNB; launch dự kiến 20/08 tại iConnect. Recap đầy đủ trong channel (xem §4). |
| 07–10/08 | Long vibe-code v2→v9 (preview HTML); Dũng đẩy bản `my-ikame-vibe-v2.vercel.app` (áp ui-kit Trung, responsive); Trung bản `my-ikame-demo.vercel.app`. |
| 17–19/08 | Phú dev xong iNews (`myikame-dev/newsfeed`), QA thread feedback theo module, chốt checklist đóng gói. |
| 20/08 → 30/09 | **Không launch.** Channel im lặng. PM Monthly 02/10: *"chưa đạt mốc 30/09 — scope/định hướng chưa chốt, không hoàn toàn do Tech/BM"*. |
| 02/10 | Chốt: T11–T12 toàn team **không làm tính năng mới**, dồn vận hành/đo metrics; riêng My iKame: *"Dũng vibe code + chốt định hướng; dồn full lực T11–T12 ra bản chạy thực tế"*. Effort T10: Dũng 20%, Chung 20% (UI). |
| 20–21/10 | Next action: Dũng vibe-code My iKame để cuối tuần ngồi với Long/Nghĩa; Long book **1 buổi với C-Level về My iKame tuần sau** (tuần 27/10). |
| 26/10 | Report BM: My iKame 🔴 — quá mốc 4 tuần, "vẫn ở giai đoạn vibe coding & pitch C-Level", chưa có WAU. Việc #4 tuần này: **chốt ngày launch mới + cách đo WAU**. |
| 27/10 | Long mở thread "trao đổi bản vibecode My iKame" trong #platform-product-manager, chờ tham vấn anh Nghĩa — **chưa có reply**. |

## 3. OKR My iKame H2 (đề xuất của Dũng, đã chỉnh theo feedback Long/Linh — thread 07/08)
- **O:** Nền tảng Employee Experience tập trung, được yêu thích; tiếp cận thông tin & dịch vụ nội bộ thuận tiện; hiệu quả vận hành rõ ràng.
- **KR1:** 100% module truyền thông nội bộ cho COM: Newsfeed, Event, Push Notification, Album ảnh, CMS/Admin, Analytics Dashboard.
- **KR2:** 100% nhân sự mới đi Onboarding Journey trên My iKame; ≥80% đánh giá ≥4/5.
- **KR3:** **Daily Work Hub** — ≥80% iKamer biết việc cần làm trong ngày trên My iKame; ≥80% truy cập công cụ nội bộ qua My iKame (iGoal, iWiki, My Planner, Asana, Calendar, đặt phòng).
- **KR4:** WAU ≥80% từ ngày ra mắt; hài lòng ≥4.0/5.

## 4. Yêu cầu chi tiết từ team COM (recap 06/08) — checklist cho Newsfeed/Event
**Newsfeed**
- Slideshow tiêu điểm đầu trang; ghim bài công ty — bài ghim của COM phải **nổi bật khác hẳn bài user**.
- Push notification toàn công ty khi Admin đăng bài chính thống (cần rule nhóm nội dung nào được push).
- **Không duyệt trước** bài user; lọc tự động từ khóa nhạy cảm → trả về + báo lý do; Admin/Moderator hậu kiểm.
- Bắt buộc xác nhận "Đã đọc" cho thông báo nhạy cảm (C&B, chính sách); ghi nhận trạng thái.
- Admin Dashboard đo: tỷ lệ mở app, đọc bài, xem video, share, comment, lưu, reaction.
- Phân quyền: Admin / Editor / Moderator / Analyst (COM chưa trả lời rule).
- Peer-to-peer Kudos hiển thị công khai trên feed.
**Event**
- Tổng quan đã / đang / sắp diễn ra; truyền thông sớm sự kiện lớn.
- Album ảnh gắn vào trang sự kiện; đăng ký tham gia trong app; hỗ trợ workshop L&D.
- Khảo sát nhanh sau sự kiện, tự nhắc trong ≤3 ngày.
**Ý tưởng giai đoạn sau (không MVP):** onboarding screen lần đầu, AI trợ lý viết bài theo vai trò, Stories "đã bỏ lỡ", iJourney, Album kỷ niệm kiểu Google Photos, Clubs, hồ sơ cá nhân + FaceID cho C&B, gợi ý tool theo phòng ban, đặt phòng thông minh, quản lý thiết bị, gamification/EXP/nhiệm vụ theo chiến dịch COM.

## 5. Định hướng Agent Platform / AI (quan trọng cho hướng đi tiếp)
- Nghĩa (26/10): **MCP phải chuẩn hóa dùng chung toàn iKame** (BM, Data, BS, IT); **Tâm Trần là PIC MCP**, output = framework dùng chung; team AI Platform cùng build. Rủi ro MCP nhiều dù tiện.
- iGoal là dự án AI đầu tiên (kick-off 21/10): phase 1 MCP + giữ tính năng trên UI; usecase: làm báo cáo qua Claude, tóm tắt, chat truy xuất, handbook; voice→báo cáo (Tâm). Dũng: MCP viết cho tập Manager trước, member chỉ MCP đọc.
- Roadmap AI Platform 3 phase: (1) liên kết dữ liệu + feature AI + MCP, bảo mật; (2) AI Agent; (3) tối ưu trải nghiệm.
- Dũng ↔ Nghĩa (23/09): MCP là hướng dài hạn cho cả iGoal và My iKame.
- Spec D9: AI là lớp tăng tốc **sau** search & data foundation; không build chatbot chung khi chưa có permission-aware retrieval + citation + audit + action API.
- Hệ quả cho My iKame: giữ Trợ lý AI như lớp "agent entry point" gọi MCP của iGoal/iWiki/HRIS thay vì tự build intelligence; app directory (/apps) là bề mặt điều hướng cho KR3.

## 6. Trạng thái prototype trong repo này (prototype-app/)
- Bản vibe-code MVP (commit `40853c4`, 20/10): iKame Feed hợp nhất `/feed`, `/events`, `/apps` + launcher, Trợ lý AI, nav 5 mục; Manager parked. Mock data, không backend.
- Hệ thống thật đang chạy: `myikame-dev.ikameglobal.com` (backend H1 ổn định, HRIS sync) — spec nói "modular core + BFF + adapters"; tận dụng nền tảng H1, không build lại từ đầu (quyết định 06/08 §3.2).

## 7. Việc đang mở / cần chốt (theo thứ tự ưu tiên)
1. **Buổi pitch C-Level tuần 27/10** (Long book) — cần bản demo + câu chuyện định hướng (agent platform / daily work hub).
2. **Chốt ngày launch mới + cách đo WAU** (Report BM yêu cầu tuần 26/10).
3. Thread 27/10 của Long chờ tham vấn Nghĩa — bản vibe-code cần gửi vào đó.
4. COM chưa trả lời: rule phân quyền Admin/Editor/Moderator/Analyst; danh sách sự kiện đến cuối năm.
5. Chưa quyết: Newsfeed MVP có Album ảnh + Push + Admin CMS + Analytics không (KR1 ghi có, MVP 06/08 chỉ 2 module).

## Unresolved questions
- Bản launch "chạy thực tế T11–T12" build trên nền `myikame-dev` (H1 backend) hay trên prototype mới? Ai dev khi T11–T12 "không làm tính năng mới"?
- Kết quả buổi C-Level (nếu đã diễn ra) chưa thấy trên Slack.
