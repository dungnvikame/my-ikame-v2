# Demo Presenter Script — BLĐ Executive Tour (v2, click-verified)

> **Trạng thái:** v2 — click path đã verify trên build thật (2026-08-12). Thời lượng là MỤC TIÊU; ghi số đo thật vào cột này khi rehearsal.
> **Tổng thời lượng:** ~25 phút · 7 trạm. **Express path (~15'):** bỏ trạm 4, gộp trạm 2+3 thành 5'.
> **URL:** Vercel production (pin URL đã rehearse vào đây: `______`) · Fallback local: `cd prototype-app && npm run dev` → http://localhost:5173

## Quy tắc vàng (đọc trước MỖI lần chạy)

1. **Reset giữa các lượt:** Profile → **"Đặt lại dữ liệu demo"** TRƯỚC khi bắt đầu lượt mới. KHÔNG reset giữa chừng — reset xoá bằng chứng các trạm đã qua (workshop AI vừa đăng ký sẽ biến mất). Lỗi giữa chừng → kể chuyện tiếp. Theme/perspective không bị reset; refresh giữa demo cũng không mất theme/perspective (đã persist).
2. **Event reservation (F3):** `ai-product-workshop` (Workshop Product Builder with AI) CHỈ để AI đăng ký ở trạm 3. Beat "RSVP tay" dùng **Global Product Webinar** (đăng ký) + **Design Sprint** (waitlist). Lỡ RSVP tay vào workshop → beat A4 sẽ trả lời "Bạn đã đăng ký rồi" (idempotent) — vẫn kể được human-story nhưng mất money moment.
3. **A3 hai bước (quyết định 2026-08-12):** AI chỉ soạn + gửi nhắc; biên lai ghi rõ *"item vẫn ở queue để bạn xác nhận đã xử lý"*. Mai TỰ bấm "Đánh dấu đã xử lý" — kể như tính năng human-in-the-loop, không phải hạn chế.
4. **Scripted AI:** chỉ chip gợi ý; ô nhập tự do disabled ghi "Nhập tự do sẽ mở ở R4". BLĐ hỏi ngoài kịch bản → trả lời miệng bằng thang A0-A4 (xem Prepared answers).
5. **Bắt đầu ở perspective iKamer, giao diện sáng** (chọn trước theo phòng họp). Đóng panel bằng nút X hoặc Esc (Esc bị chặn khi đang có draft A3 — chủ ý).

## 7 trạm

| # | Trạm | Mục tiêu | Đo thật | Click path (verified) | Money moment | Talking point | D / Stat |
|---|---|---|---|---|---|---|---|
| 0 | Mở màn `/vision` | 2' | __ | Sidebar footer → **Tầm nhìn** | Bản đồ R1→R5 + "CHÚNG TA Ở ĐÂY" | "Đây là bản đồ; giờ đi thăm từng vùng. Mọi thứ gắn nhãn thật/concept — chúng tôi không giả vờ." | D1 gate-thesis |
| 1 | Home iKamer | 4' | __ | `/home` → Sparkle ✦ (topbar) → chip **"Hôm nay tôi cần làm gì?"** | A2 đọc ĐÚNG trạng thái màn hình: 1 tin bắt buộc, sự kiện, goal cần check-in — kèm 3 citation bấm được | "Trả lời xuyên nguồn, có trích dẫn, phản ánh đúng state thật — không bịa. Ranking ưu tiên giải thích được." | D3, D5 |
| 2 | News | 4' | __ | `/news` → bài "Cập nhật chính sách bảo mật" → đọc → **Xác nhận đã đọc** → receipt | Ack ≠ đọc; badge đổi toàn hệ thống (Home hero biến mất) | "Staffbase pattern: mandatory có audit trail. AI tóm tắt (A1) vẫn giữ nút xác nhận cho người." | Staffbase |
| 3 | Events | 3' | __ | `/events` → **Global Webinar** đăng ký tay (+dual-timezone) → quay lại → mở Ask ✦ → chip **"Đăng ký workshop... cho tôi"** → **Xác nhận đăng ký** → receipt #RCPT → "Xem trong Sự kiện" | Event card đổi "Đã đăng ký", còn 3/20 chỗ — không reload | "A4 = thực thi tác vụ rủi ro thấp, có confirm + receipt + trạng thái thật. Đây là hợp đồng trải nghiệm." | Thang A4 |
| 4 | Knowledge + Goals | 3' | __ | `/knowledge` → search thử → mở 1 doc (source iWiki + deep link) → mở Ask ✦ → chip **"Ngân sách quý III team Finance?"** → **"Không đủ dữ liệu"** → `/goals` → check-in goal "Design system" → receipt + card nhảy cột | Deny beat: AI từ chối vì KHÔNG CÓ QUYỀN — không bịa | "Beat đắt nhất: permission-aware AI. 95% pilot fail vì bỏ qua cái này (MIT)." | D8 |
| 5 | Manager | 5' | __ | Switch **Manager** → `/manager/overview` → chỉ **Bản tin AI đầu tuần** (A2) → mở Ask ✦ → chip **"Soạn tin nhắc 3 người..."** (A3) → sửa 1 chữ trong draft → **Duyệt & gửi** → biên lai "item vẫn ở queue" → đóng panel → bấm **"Đánh dấu đã xử lý"** trên card → queue 3→2, header + brief tự cập nhật, receipt "WUAR +1" | Queue THẬT SỰ vơi; KPI đếm lại; hai bước người-máy rõ ràng | "Attention canvas ≠ BI dashboard: required trước optional. AI soạn, người duyệt, người xác nhận — WUAR tăng từng hành động hữu ích." | D4, WUAR |
| 6 | Đóng `/vision` | 3' | __ | Sidebar → **Tầm nhìn** → cuộn tới thang A0-A4 | Badge A1-A4 vừa thấy xếp đúng lên thang — pixel-identical | "Chúng ta đứng đây. Foundation A0-A2 là điều kiện để mọi thứ vừa xem thành thật — đó là đề xuất đầu tư." + 3 số | D9 |

**3 số chốt (trạm 6):** Gartner 40% enterprise apps có agent cuối 2026 (từ <5% 2025) · MIT 95% pilot fail vs 5% "design for friction" · FPT 1.000 agent / 84.000 nhân viên (PeopleX).

## Prepared answers

- **"AI này thật chưa?"** — "Chưa — và đó là chủ ý. Cái anh chị vừa thấy là *hợp đồng trải nghiệm* có gắn nhãn Concept từng màn. Foundation A0-A2 (permission-aware index, citation, ACL) là điều kiện để nó thật — chính là đề xuất đầu tư hôm nay. Wizard-of-oz là phương pháp research chuẩn."
- **"Sao không mua Viva/ServiceNow?"** — "Gate-thesis: giá trị nằm ở tích hợp permission với iGoal/iWiki/HRIS nội bộ + tiếng Việt + chi phí/ghế. Chúng tôi đã học pattern của họ (benchmark strip ở /vision). MIT: blended/partnership thành công gấp 2x pure-build → không đóng cửa mua-kết-hợp-build."
- **"Bao giờ có thật?"** — Map sang ladder: mỗi bậc A là một milestone ROI đo được bằng WUAR, không phải black-box spend. R1 production core trước, AI read-only (R4) sau khi foundation chứng minh. (Trả lời Gartner 40%-cancellation-2027 bằng chính ladder này.)
- **Partnership stance (MIT 2x)** — "Ưu tiên build lớp Gate + permission (lợi thế riêng), sẵn sàng mua/hợp tác phần model & tooling."

## Logistics & fallback

- **Thứ tự đóng băng (F14):** push cuối → verify Vercel → **rehearsal ×2 trên đúng URL deploy** (+1 lượt local) → FREEZE, không push tới sau demo. Pin URL vào đầu file này.
- **Phòng họp:** đã QA băng 1024px/125% zoom (sidebar ẩn, bottom-nav hiện — bình thường, không phải lỗi) + dark mode + 390px. Xác nhận máy chiếu/zoom trước rehearsal; chọn sáng/tối theo phòng.
- **Vercel chết:** chạy local (lệnh ở đầu file); mọi flow như nhau (mock-only, không cần mạng).
- **Cháy giờ:** express path — bỏ trạm 4; gộp News+Events còn 5'; KHÔNG bỏ trạm 5 (Manager) và trạm 6 (chốt đầu tư).
- **Lỡ tay ack/RSVP sớm:** đừng reset — dùng đường phụ: ack sớm → kể lại bằng bài Product Sharing; RSVP nhầm workshop → beat A4 thành "Bạn đã đăng ký rồi" (vẫn minh hoạ idempotency).

## Rehearsal log

| Lượt | Ngày | Môi trường | Tổng thời gian | Ghi chú |
|---|---|---|---|---|
| 1 | __ | Vercel | __ | __ |
| 2 | __ | Vercel | __ | __ |
| local check | __ | localhost | __ | __ |
