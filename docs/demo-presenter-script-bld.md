# Demo Presenter Script — BLĐ Executive Tour (v3, demo v2 golden path)

> **Trạng thái:** v3 — cập nhật cho demo v2 (Cộng đồng + AI mọi module + ⌘K + nâng cấp Events/Tri thức/Mục tiêu/Hồ sơ). v2 (7 trạm, click-verified 2026-08-12) đã archive dưới dạng lịch sử — nội dung click path v2 vẫn đúng cho các trạm không đổi (Home, News, Manager, Vision).
> **Tổng thời lượng:** ~34 phút · 11 trạm. **Express path (~20'):** bỏ trạm 6 (Tri thức) + trạm 7 (Mục tiêu chi tiết, giữ 1 chip); gộp trạm 3+4 (Cộng đồng+Events) còn 6'.
> **URL:** Vercel production (pin URL đã rehearse vào đây: `______`) · Fallback local: `cd prototype-app && npm run dev` → http://localhost:5173

## Quy tắc vàng (đọc trước MỖI lần chạy)

1. **Reset giữa các lượt:** Hồ sơ → **"Đặt lại dữ liệu demo"** TRƯỚC khi bắt đầu lượt mới. KHÔNG reset giữa chừng — reset xoá bằng chứng các trạm đã qua (lời chúc AI vừa đăng, báo cáo AI vừa gửi, workshop vừa đăng ký sẽ biến mất). Lỗi giữa chừng → kể chuyện tiếp. Theme/perspective không bị reset; refresh giữa demo cũng không mất theme/perspective (đã persist).
2. **Event reservation (F3):** `ai-product-workshop` (Workshop Product Builder with AI) CHỈ để AI đăng ký ở trạm Events. Beat "RSVP tay" dùng **Global Product Webinar** (đăng ký) + **Design Sprint** (waitlist). Lỡ RSVP tay vào workshop → beat A4 sẽ trả lời "Bạn đã đăng ký rồi" (idempotent) — vẫn kể được human-story nhưng mất money moment.
3. **Birthday & check-in reservation (mới, F2b):** Rail Cộng đồng có 3 người sinh nhật (Vy, Quân, Hằng) — chỉ bấm "Chúc" TAY cho **1 người** (ví dụ Quân) trước khi mở chip AI "Soạn lời chúc sinh nhật", để AI còn người để soạn (Vy hoặc Hằng). Bấm "Chúc" cả 3 → chip AI hiện "đã xử lý", vẫn minh hoạ được idempotency nhưng mất money moment đăng bài. Tương tự, mục tiêu "Design system Core DS 1.1" là mục tiêu `needs_update` DUY NHẤT — đừng bấm "Check-in" tay trên card này trước khi dùng chip AI "Soạn báo cáo check-in tuần" ở trạm Mục tiêu.
4. **A3 hai bước (giữ từ v1):** AI soạn + gửi/đăng/duyệt sau khi bạn xem và sửa draft; với S3 (nhắc iConnect), biên lai ghi rõ *"item vẫn ở queue để bạn xác nhận đã xử lý"* — Mai TỰ bấm "Đánh dấu đã xử lý" (human-in-the-loop). Với lời chúc sinh nhật và báo cáo check-in (mới), gửi/đăng là commit thật ngay — không có bước xử lý phụ.
5. **Scripted AI:** chỉ chip gợi ý; ô nhập tự do disabled ghi "Nhập tự do sẽ mở ở R4". BLĐ hỏi ngoài kịch bản → trả lời miệng bằng thang A1-A4 (xem Prepared answers).
6. **D2 — không còn "Concept · Rx" trên header module:** mọi banner/badge Concept ở đầu trang Cộng đồng/Events/Tri thức/Mục tiêu/Hồ sơ đã gỡ. Câu trả lời AI (Ask iKame + ⌘K) VẪN có nhãn A1-A4 — chỉ gỡ nhãn ở cấp module, không gỡ ở cấp câu trả lời. `/vision` vẫn giữ toàn bộ badge Concept (bản đồ đầu tư, không đổi).
7. **Bắt đầu ở perspective iKamer, giao diện sáng** (chọn trước theo phòng họp). Đóng panel Ask iKame bằng nút X hoặc Esc (Esc bị chặn khi đang có draft A3 chưa gửi — chủ ý).

## 11 trạm

| # | Trạm | Mục tiêu | Đo thật | Click path (verified) | Money moment | Talking point | D / Stat |
|---|---|---|---|---|---|---|---|
| 0 | Mở màn `/vision` | 2' | __ | Sidebar footer → **Tầm nhìn** | Bản đồ R1→R5 + "CHÚNG TA Ở ĐÂY" | "Đây là bản đồ; giờ đi thăm từng vùng. Mọi thứ gắn nhãn thật/concept — chúng tôi không giả vờ." | D1 gate-thesis |
| 1 | Home iKamer | 3' | __ | `/home` → Sparkle ✦ (topbar) → chip **"Hôm nay tôi cần làm gì?"** | A2 đọc ĐÚNG trạng thái màn hình: 1 tin bắt buộc, sự kiện, goal cần check-in — kèm 3 citation bấm được | "Trả lời xuyên nguồn, có trích dẫn, phản ánh đúng state thật — không bịa." | D3, D5 |
| 2 | Cộng đồng (mới) | 4' | __ | `/community` → đăng 1 bài ngắn qua composer → thả ❤️ 1 bài → rail "Sinh nhật hôm nay" → **Chúc** tay 1 người (VD Quân) → mở Ask ✦ chip **"Tuần này có gì hot?"** (A2) → chip **"Soạn lời chúc sinh nhật"** (A3) → sửa 1 chữ → **Duyệt & đăng** → cuộn feed thấy bài chúc AI thật xuất hiện | Bài đăng THẬT của AI nằm trong feed, không phải receipt giả | "Đây là A3 mới: AI không chỉ soạn tin nhắc, nó viết ra một bài đăng thật — bạn vẫn duyệt trước khi công khai." | Sidebar nhóm "Kết nối" |
| 3 | News | 3' | __ | `/news` → bài "Cập nhật chính sách bảo mật" → đọc → **Xác nhận đã đọc** → receipt | Ack ≠ đọc; badge đổi toàn hệ thống (Home hero biến mất) | "Staffbase pattern: mandatory có audit trail. AI tóm tắt (A1) vẫn giữ nút xác nhận cho người." | Staffbase |
| 4 | Events (nâng cấp) | 4' | __ | `/events` → hero countdown iConnect → cuộn timeline 6 tháng → đổi tab (Sắp tới/Của tôi/Đã qua) → **Global Webinar** đăng ký tay (+dual-timezone) → mở Ask ✦ chip **"Tuần này nên tham gia gì?"** (A2, đọc đúng trạng thái đăng ký từng sự kiện) → chip **"Đăng ký workshop... cho tôi"** (A4) → **Xác nhận đăng ký** → receipt #RCPT → "Xem trong Sự kiện" | Event card đổi "Đã đăng ký", còn 3/20 chỗ — không reload | "A4 = thực thi tác vụ rủi ro thấp, có confirm + receipt + trạng thái thật." | Thang A4 |
| 5 | ⌘K tìm kiếm (mới) | 2' | __ | Bất kỳ trang nào → **⌘K** (hoặc icon tìm kiếm topbar) → gõ **"nghỉ phép"** → AI answer (A2) + 2 citation hiện trên kết quả → **Enter** → sang `/search` thấy lại đúng answer + citation | Số ngày phép trong câu trả lời khớp CHÍNH XÁC với mục Nghỉ phép ở Hồ sơ (trạm 8) | "Tìm kiếm toàn cục không chỉ trả kết quả, còn tổng hợp câu trả lời có trích dẫn — và số liệu không lệch giữa 2 nơi." | D4 no-dead-end |
| 6 | Tri thức | 3' | __ | `/knowledge` → search thử → mở 1 doc (source iWiki + deep link) → mở Ask ✦ chip **"Tài liệu cho người mới?"** (A2, 3 tài liệu curated) → chip **"Ngân sách quý III team Finance?"** → **"Không đủ dữ liệu"** | Deny beat: AI từ chối vì KHÔNG CÓ QUYỀN — không bịa | "Beat đắt nhất: permission-aware AI. 95% pilot fail vì bỏ qua cái này (MIT)." | D8 |
| 7 | Mục tiêu (nâng cấp) | 4' | __ | `/goals` → tab "Mục tiêu & báo cáo" → xem OKR tree (công ty→nhóm→cá nhân) → tab "Sơ đồ mục tiêu" → quay lại → mở Ask ✦ chip **"Soạn báo cáo check-in tuần"** (A3, đọc đúng goal `needs_update`) → sửa 1 chữ trong draft → **Duyệt & gửi báo cáo** → card "Design system" nhảy cột sang Đúng tiến độ + báo cáo AI xuất hiện trong Tổng hợp báo cáo | Báo cáo THẬT + trạng thái mục tiêu đổi thật, không phải receipt giả | "A3 giờ commit thẳng vào dữ liệu — không chỉ in ra biên lai. Người vẫn là người duyệt nội dung cuối." | Money moment #3 |
| 8 | Hồ sơ (rebuild) | 3' | __ | `/profile` → lướt 7 khối: header → Tổ chức → Thâm niên & cột mốc → Nghỉ phép & phúc lợi → Thiết bị được cấp → **Hoạt động gần đây** (thấy ngay bài chúc + báo cáo + RSVP vừa làm ở các trạm trên) → mở Ask ✦ chip **"Tôi còn bao nhiêu ngày phép?"** (A2) | Số phép trong câu trả lời AI khớp with số hiển thị ngay bên dưới, và khớp với trạm ⌘K | "Hoạt động gần đây không tĩnh — đây chính là bằng chứng mọi thao tác AI/người ở các trạm trước đều ghi vào state thật." | Live activity (F2) |
| 9 | Manager | 4' | __ | Switch **Manager** → `/manager/overview` → chỉ **Bản tin AI đầu tuần** (A2, không còn badge Concept ở header) → mở Ask ✦ chip **"Soạn tin nhắc 3 người..."** (A3) → sửa 1 chữ trong draft → **Duyệt & gửi** → biên lai "item vẫn ở queue" → đóng panel → bấm **"Đánh dấu đã xử lý"** trên card → queue 3→2, header + brief tự cập nhật, receipt "WUAR +1" | Queue THẬT SỰ vơi; KPI đếm lại; hai bước người-máy rõ ràng | "Attention canvas ≠ BI dashboard: required trước optional. AI soạn, người duyệt, người xác nhận." | D4, WUAR |
| 10 | Đóng `/vision` | 3' | __ | Sidebar → **Tầm nhìn** → cuộn tới thang A1-A4 | Badge A1-A4 vừa thấy ở MỌI module xếp đúng lên thang — pixel-identical | "Chúng ta đứng đây. Foundation A0-A2 là điều kiện để mọi thứ vừa xem thành thật — đó là đề xuất đầu tư." + 3 số | D9 |

**3 số chốt (trạm 10):** Gartner 40% enterprise apps có agent cuối 2026 (từ <5% 2025) · MIT 95% pilot fail vs 5% "design for friction" · FPT 1.000 agent / 84.000 nhân viên (PeopleX).

## Prepared answers

- **"AI này thật chưa?"** — "Chưa — và đó là chủ ý. Cái anh chị vừa thấy là *hợp đồng trải nghiệm* có gắn nhãn Concept từng câu trả lời (A1-A4), dù header module giờ sạch badge. Foundation A0-A2 (permission-aware index, citation, ACL) là điều kiện để nó thật — chính là đề xuất đầu tư hôm nay. Wizard-of-oz là phương pháp research chuẩn."
- **"Sao không mua Viva/ServiceNow?"** — "Gate-thesis: giá trị nằm ở tích hợp permission với iGoal/iWiki/HRIS nội bộ + tiếng Việt + chi phí/ghế. Chúng tôi đã học pattern của họ (benchmark strip ở /vision). MIT: blended/partnership thành công gấp 2x pure-build → không đóng cửa mua-kết-hợp-build."
- **"Bao giờ có thật?"** — Map sang ladder: mỗi bậc A là một milestone ROI đo được bằng WUAR, không phải black-box spend. R1 production core trước, AI read-only (R4) sau khi foundation chứng minh. (Trả lời Gartner 40%-cancellation-2027 bằng chính ladder này.)
- **Partnership stance (MIT 2x)** — "Ưu tiên build lớp Gate + permission (lợi thế riêng), sẵn sàng mua/hợp tác phần model & tooling."
- **"Sao Cộng đồng/Mục tiêu lại có 2 loại AI (A2 đọc và A3 viết)?"** — "Thang trưởng thành 4 bậc dùng chung mọi module: A2 luôn chỉ đọc và tổng hợp; A3 luôn có bước người duyệt trước khi ghi. Không có module nào tự ý viết dữ liệu mà không qua duyệt."

## Kiểm tra trước khi diễn (smoke checklist)

1. `npm run typecheck` và `npm run build` xanh.
2. Sidebar 3 nhóm hiện đúng ở cả 2 perspective (iKamer/Manager).
3. ⌘K từ 3 trang khác nhau: 1 query có seed (VD "OKR") + 1 query không seed (D4 — vẫn ra kết quả + soft note, không "đơ").
4. Cộng đồng: đăng bài, thả reaction, bình luận, "Chúc" sinh nhật — đều cập nhật ngay, không reload.
5. Events: hero countdown chạy, cả 4 tab lọc đúng, 1 RSVP thành công + 1 waitlist thành công.
6. Tri thức: hero search ra kết quả, tài liệu Finance-only KHÔNG hiện với perspective iKamer.
7. Mục tiêu: gửi báo cáo (tay hoặc AI) → card nhảy cột trạng thái + báo cáo lên Tổng hợp báo cáo.
8. Hồ sơ: đủ 7 khối, Hoạt động gần đây phản ánh đúng những gì vừa làm ở trên.
9. Toàn bộ 6 chip mới (`c1`,`c2`,`e2`,`k2`,`g3`,`p2`) + 6 chip v1 (`s1`-`s4`+fallback+deny) đều xuất hiện đúng route của chúng — không rơi vào trang không liên quan.
10. Light/dark mode + băng 1024px (sidebar ẩn, bottom-nav hiện — không phải lỗi).
11. `grep -rn "RBadge" src` chỉ ra `components/RBadge.tsx` + `pages/VisionPage.tsx`.
12. `resetDemo()` → mọi module (feed, reports, registrations, check-in, hội thoại Ask iKame) về đúng trạng thái ban đầu trong <5s.

## Logistics & fallback

- **Thứ tự đóng băng (F14):** push cuối → verify Vercel → **rehearsal ×2 trên đúng URL deploy** (+1 lượt local) → FREEZE, không push tới sau demo. Pin URL vào đầu file này.
- **Phòng họp:** đã QA băng 1024px/125% zoom (sidebar ẩn, bottom-nav hiện — bình thường, không phải lỗi) + dark mode + 390px. Xác nhận máy chiếu/zoom trước rehearsal; chọn sáng/tối theo phòng.
- **Vercel chết:** chạy local (lệnh ở đầu file); mọi flow như nhau (mock-only, không cần mạng).
- **Cháy giờ:** dùng express path ở đầu file — bỏ Tri thức, rút gọn Mục tiêu; KHÔNG bỏ trạm Manager và trạm chốt Vision.
- **Lỡ tay ack/RSVP/Chúc/check-in sớm:** đừng reset — dùng đường phụ: ack sớm → kể lại bằng bài Product Sharing; RSVP nhầm workshop → beat A4 thành "Bạn đã đăng ký rồi"; Chúc/check-in hết người/goal áp dụng → chip AI hiện nhánh "đã xử lý" — vẫn minh hoạ được idempotency, chỉ kể lại theo hướng đó.

## Rehearsal log

| Lượt | Ngày | Môi trường | Tổng thời gian | Ghi chú |
|---|---|---|---|---|
| 1 | __ | Vercel | __ | __ |
| 2 | __ | Vercel | __ | __ |
| local check | __ | localhost | __ | __ |
