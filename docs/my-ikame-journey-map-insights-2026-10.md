# Journey Map "Vòng đời iKamer" → góc nhìn bổ sung cho My iKame (27/10/2026)

Nguồn: `previewhtml.web.app/preview/1781005062005_ikamer-journey-map.html` — "Định hướng sản phẩm v1.0 · 29/05/2026", khung Moments That Matter (McKinsey/Gartner), dùng cho buổi brainstorm BLĐ · Managers · PnOD. Đối chiếu với `my-ikame-direction-review-2026-10.md`, prototype commit `740114e`, Slack T6–T10.

## 1. Deck nói gì (tóm tắt có số liệu)
- **Bài toán hai trục**: iKamer *MUỐN* mở (cảm xúc: gắn kết, ghi nhận, vui) và *CẦN* mở (công việc: việc, thông tin, quy trình). Pilot T4 (30 người, 2,5 tuần) chứng minh trục cảm xúc chạy: **WAU >60% · DAU >43% · quest completion 78% · 120+ lượt đổi thưởng · 128 bài · 78% creator rate · rating 4/5**. Ba thách thức: thiếu động lực thúc đẩy, **thiếu notification** (đăng nhiều nhưng tương tác nghẽn), thiếu hoạt động thú vị ngoài "cày cấp đổi quà".
- **Định hướng**: từ "mạng xã hội nội bộ + gamification" → **Digital Employee Hub** xuyên vòng đời; gamification không còn là sản phẩm mà là *lớp động lực* phủ cả hai trục; **My Planner là viên gạch đầu tiên của trục công việc**.
- **8 giai đoạn** với mức phủ (5/2026): Tuyển dụng (trống) · **Pre-boarding (trống, vùng nóng)** · Onboarding (một phần, **ưu tiên #1**) · Gắn kết hằng ngày (mạnh) · Phát triển & Học tập (một phần) · Ghi nhận & Văn hóa (mạnh) · **Đánh giá & Thăng tiến (mỏng, vùng nóng)** · **Off-boarding & Alumni (trống, vùng nóng)**.
- **Gói Onboarding 60 ngày**: Pre-boarding (Digital Welcome Pack, buddy) → Tuần 1 (welcome post, quests: danh bạ, quiz văn hoá, tour) → 30 ngày (learning quest gắn iWiki, mục tiêu iGoal 30 ngày, badge, survey) → 60 ngày ("graduation" badge + post tự động, chuyển iGoal dài hạn). Số liệu: 80% quyết định ở/đi trong 90 ngày; preboarding tốt +82% retention; manager tham gia → 3,4× thành công.
- **Roadmap**: P1 My Planner + Onboarding 60 ngày + Notification engine + Kudos · P2 skill tree, milestone/promotion, sự kiện & mini-game, recognition theo Core Values · P3 Alumni, **Manager Intelligence Layer**, employer brand, endgame content.
- **North Star: WAER** (Weekly Active *Engagement* Rate) — mọi tính năng phải trả lời "tăng số iKamer hoạt động có ý nghĩa mỗi tuần thế nào". Giá trị 3 bên: nhân viên (được nhìn thấy/kết nối/thưởng/thuộc về), manager (tín hiệu sớm sức khoẻ văn hoá, ghi nhận 2 phút/ngày), công ty (retention, onboarding 2 tuần thay 2 tháng, knowledge sharing có động lực, employer brand).

## 2. Đối chiếu với những gì đã build và đã chốt

> **Cập nhật 03/11:** plan `261103-1023-onboarding-notification-manager-intel` đã triển khai — cột "Trạng thái" ghi cả trước (27/10) và sau.

| Điểm trong deck (5/2026) | Trạng thái 27/10 → 03/11 | Nhận xét |
|---|---|---|
| Trục CẦN mở — My Planner | **Đã có dạng "Daily Work Hub"**: Home *Việc hôm nay* (gom HRIS/iCheck/iGoal/Asana/Calendar), tab Công việc, iCheck widget | Cùng ý — tên khác. Giữ "Việc hôm nay" là gương mặt của My Planner |
| Kudos (P1 quick-win) | Đã build (composer Ghi nhận + card) → 03/11: mở sẵn người nhận từ Tín hiệu sớm của manager | ✓ |
| Notification engine (P1 quick-win) | Push ad-hoc → **03/11: `notify()` một cửa, bảng rule 14 loại sự kiện, preference theo nhóm (Bắt buộc khoá), Bản tin sáng gộp, nhắc tự động 24h × 3 hiện ở COM** | Thách thức #2 pilot đã có lớp hạ tầng; còn thiếu timer thật + push mobile |
| Onboarding 60 ngày (ưu tiên #1, KR2 OKR H2) | Chưa có → **03/11: overlay Người mới (joinedAt < 60 ngày), `/onboarding` 4 mốc · 12 quest, buddy/manager từ roster, khảo sát 30 ngày, huy hiệu mốc trên Hồ sơ + bài tự động trên Feed, Việc hôm nay ưu tiên quest** | Demo bằng user Gia Huy luôn ở Ngày 32/60; pre-boarding mới có dạng quest "Welcome Pack" |
| Gamification = lớp động lực | Để ngoài → 03/11: **huy hiệu mốc vòng đời** (30/60 ngày, 1/2/3 năm) không EXP/coin | Đúng liều theo deck; đổi thưởng chỉ bật theo chiến dịch COM (chưa làm) |
| Manager Intelligence Layer (P3) | Chưa có tín hiệu engagement → **03/11: Nhịp team (WAER, kudos, check-in đúng hạn, xu hướng), Tín hiệu sớm có hành động 2 phút, thẻ người mới + tab Hành trình trong 360°, bản tin AI nhắc đích danh** | Lát mỏng đã kéo lên; chưa có dữ liệu lịch sử >2 tuần |
| Đánh giá & Thăng tiến (mỏng) | Rail sinh nhật/thâm niên; **03/11: cơ chế bài tự động từ sự kiện vòng đời** (`Post.autoSource`) mới dùng cho mốc 30 ngày | Mở rộng sang sinh nhật/thâm niên/promote + COM duyệt 1 chạm là bước nhỏ tiếp theo |
| Pre-boarding / Alumni (trống) | Chưa có | Pre-boarding nằm trong gói Onboarding (chưa có đếm ngược trước ngày 1); Alumni để P3 |
| WAER North Star | OKR H2 đo WAU ≥80% → **03/11: tile WAER 71% + phân rã 5 hành động trên Tổng quan COM; WAU giữ làm tham chiếu** | Đề xuất với Long/chị Nguyệt sau pitch |

## 3. Góc nhìn bổ sung (điều chỉnh so với direction review)
1. **Onboarding Journey phải là bước tiếp theo**, không phải "để sau khi Feed thành thói quen" như tôi viết trước: nó là ưu tiên #1 trong deck, KR2 của OKR H2, nơi hai trục giao nhau, và dữ liệu 80%/90 ngày cho câu chuyện ROI với C-Level mạnh hơn bất kỳ tính năng nào. Cách làm **không cần gamification coin**: checklist + buddy + badge mốc + post tự động.
2. **"Người mới" là lăng kính thứ tư nhẹ** (overlay trên iKamer, không phải perspective riêng): khi `joinedAt < 60 ngày`, Home hiện thẻ *Hành trình của bạn · Ngày 12/60* thay vị trí nổi bật, Việc hôm nay ưu tiên quest onboarding; Manager thấy tiến độ người mới trong team (3,4×).
3. **Notification là hạ tầng, không phải tính năng COM**: pilot nghẽn vì thiếu notification. Cần một rule engine nhỏ: loại nội dung nào push, nhắc lại khi nào, digest sáng, tắt/bật theo nhóm — dùng chung cho Feed, iCheck, Onboarding, Manager.
4. **Manager Intelligence kéo sớm một lát mỏng**: 3 tín hiệu trên Tổng quan Manager — team WAER tuần, số kudos cho/nhận, check-in OKR đúng hạn — kèm "giảm so với tuần trước" → đúng ý "tín hiệu sớm trước resignation" của deck và nhu cầu manager dashboard của chị Nguyệt.
5. **Gamification quay lại dưới dạng "mốc & huy hiệu" gắn vòng đời** (30 ngày, 60 ngày, 1 năm, 100 kudos…), không EXP/coin; đổi thưởng chỉ bật cho chiến dịch COM có thời hạn. Giải quyết "thiếu hoạt động thú vị" bằng sự kiện/mini-game theo mùa (P2 deck) thay vì cày cấp.
6. **Đổi North Star sang WAER** trong pitch và OKR: WAU 80% dễ đạt giả tạo nếu COM ép mở app; WAER buộc sản phẩm phải *hữu dụng*. Dashboard COM Admin thêm tile WAER + phân rã theo loại hành động.

## 4. Đề xuất tính năng bổ sung (xếp theo cảm xúc cao × đang trống × khả thi)

| # | Tính năng | Giai đoạn | Vì sao | Phụ thuộc | Ước lượng (prototype) |
|---|---|---|---|---|---|
| 1 | **Onboarding Journey 60 ngày**: Welcome Pack pre-boarding (đếm ngược, checklist Ngày 1, buddy, lời chào team), quest checklist tuần 1 (danh bạ, quiz văn hoá, tour app, iWiki quy trình), mốc 30/60 (badge, survey, post "graduation" tự động), thẻ *Hành trình của bạn* trên Home, view người mới cho Manager | 2–3 | Ưu tiên #1 deck + KR2 OKR; ROI rõ nhất | HRIS joinedAt, buddy assignment (mock), iWiki link | 1,5–2 ngày |
| 2 | **Notification rule engine + preference + digest sáng** | 4 (hạ tầng) | Thách thức #2 pilot; cần cho Onboarding/Manager/COM | — | 1 ngày |
| 3 | **Manager Intelligence lát mỏng**: team WAER, kudos, check-in đúng hạn, xu hướng tuần + người mới trong team | 7 + Manager | Deck P3 kéo sớm; chị Nguyệt muốn manager dashboard | Dữ liệu mock engagement | 0,5–1 ngày |
| 4 | **Post tự động từ HRIS event**: sinh nhật, thâm niên, promote, cưới hỏi (COM duyệt 1 chạm) + Core Values tag trên Kudos | 6–7 | Vùng nóng "mỏng", chi phí thấp, tăng nội dung chính thống không cần COM viết | COM Admin queue | 0,5 ngày |
| 5 | **Tile WAER + phân rã hành động** trên Tổng quan COM; thẻ Đo lường agent nối vào | Đo lường | North Star | Có sẵn số liệu mock | 0,5 ngày |
| 6 | Badge mốc vòng đời (không coin) hiển thị trên Hồ sơ/Feed | 6 | Gamification "đúng liều" | #1 | 0,5 ngày |
| 7 | Tiện ích hằng ngày: hòm thư góp ý ẩn danh, khảo sát nhanh pulse, đặt đồ ăn (link) | 4 | Deck liệt kê; giữ nhỏ | — | 0,5 ngày |
| Sau | Skill tree/learning path (iWiki), sự kiện & mini-game theo mùa, Alumni/Hall of Fame | 5, 8 | P2–P3 deck | Dữ liệu L&D | — |

Gợi ý gói cho bản tiếp theo: **#1 + #2 + #3** (một plan 3 phase, ~3,5 ngày) — kể được câu chuyện "từ Ngày 0 tới ngày 60 trên một hub, manager thấy tín hiệu sớm", khớp cả deck 5/2026 lẫn OKR H2 KR2/KR3.

## 5. Cần chốt
1. Lăng kính "Người mới" là overlay trên iKamer (đề xuất) hay thêm user demo mới (ví dụ *Phạm Gia Huy*, gia nhập 17/08 — đã có trong mock feed)?
2. Buddy/manager tham gia journey: mock tên cố định hay lấy từ team roster?
3. Badge mốc có được xuất hiện trên Feed (post tự động) hay chỉ trong Hồ sơ?
4. WAER thay WAU trong OKR H2 — bạn muốn đề xuất với Long/chị Nguyệt trước hay chỉ dùng trong pitch?
