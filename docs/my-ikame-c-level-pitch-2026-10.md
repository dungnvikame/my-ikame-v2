# My iKame — Pitch C-Level (tuần 27/10/2026)

Mục tiêu buổi: **lấy 4 quyết định** — (1) chốt định vị & scope bản launch, (2) chốt ngày launch mới + cách đo WAU, (3) COM nhận ownership nội dung/phân quyền, (4) giữ nguồn lực T11–T12 cho My iKame dù toàn team đang "không làm tính năng mới".
Thời lượng gợi ý: 25' = 8' câu chuyện · 10' demo · 7' quyết định.

---

## A. Câu chuyện định hướng (8 phút)

### 1. Mở bài — một ngày của iKamer hôm nay (1')
"Sáng nay một iKamer muốn biết *có gì cần đọc, cần tham gia, cần làm* — phải mở 4 nơi: Facebook Group, Slack, Asana, Google Drive. Nhân sự mới không biết tìm lại thông báo tháng trước ở đâu. Ảnh sự kiện nằm ở 7 link Drive rời rạc." (Trích đúng bài toán COM nêu 06/08.)
→ Kết luận 1 câu: **Thông tin chính thống của iKame chưa có *một* nơi.**

### 2. Vì sao bây giờ (1')
- Meta Workplace đã đóng cửa (dữ liệu xoá 06/2026) — doanh nghiệp khắp nơi đang dồn về "Facebook nội bộ" tự chủ. Facebook Group cá nhân không phải kênh doanh nghiệp.
- Nền móng đã có: HRIS, iGoal V2 (launch cuối T10), iWiki 4.0 (đã live), iHiring/iRefer, SSO chung. Thiếu đúng **lớp cửa vào** gom chúng lại.
- 26/10 anh Nghĩa chốt **MCP framework dùng chung toàn iKame** — My iKame là bề mặt dành cho *con người* của hệ sinh thái đó.

### 3. Chúng ta đã học được gì từ 20/08 → nay (1')
- Thẳng thắn: trượt mốc 30/09 vì **scope chưa chốt**, không phải vì tech.
- 9 vòng vibe-code (Long v2–v9, bản Dũng/Trung) → bài học "nồi cám thập cẩm" làm hỏng trải nghiệm. Bản hôm nay là bản **đã cắt**: giữ đúng cái iKamer dùng mỗi ngày.

### 4. Định vị — "Một cửa vào, không phải một nơi làm mọi việc" (2')
Ba lớp, một nguyên tắc (spec D1): *native chỉ những gì làm xong trong 1 phiên ngắn; còn lại summary + deep-link có SSO.*

| Lớp | Trả lời câu hỏi | Thay thế |
|---|---|---|
| **iKame Feed** | "Có gì chính thức tôi cần biết / xác nhận?" | Facebook Group + kênh thông báo Slack |
| **Sự kiện** | "Có gì sắp diễn ra, tôi đã đăng ký chưa?" | Google Form + ảnh Drive rải rác |
| **Ứng dụng** | "Công cụ tôi cần ở đâu?" | Bookmark cá nhân, hỏi nhau trên Slack |
| *Trợ lý AI* (lớp xuyên suốt) | "Hôm nay tôi cần làm gì?" | — (mới) |

Điểm khác biệt so với Facebook/Slack: **acknowledge bắt buộc + audit** cho thông báo chính sách; **audience theo team/HRIS**; không bị phân tâm bởi nội dung ngoài.

### 5. Hướng đi dài — Daily Work Hub trên Agent Platform (2')
- H2 (bản launch): Feed + Events + Apps. Đo WAU, acknowledge rate.
- 2027 H1: **Daily Work Hub** — Trợ lý AI gọi MCP của iGoal/iWiki/HRIS/Asana để trả lời "hôm nay tôi cần làm gì" và *hành động* (check-in OKR, đặt phòng, gửi request) — không tự build intelligence, dùng framework MCP chung (Tâm PIC).
- 2027 H2: onboarding journey, kudos, album, gamification theo chiến dịch COM — chỉ khi Feed đã là thói quen.
→ Thông điệp: *"My iKame không cạnh tranh với iGoal/iWiki — nó là cửa trước để iKamer đi vào chúng, và là nơi agent của iKame nói chuyện với con người."*

### 6. Kế hoạch ra bản chạy thực tế T11–T12 (1')
| Mốc | Nội dung | Điều kiện |
|---|---|---|
| 07/11 | Chốt UI/UX final + rule phân quyền COM | COM trả lời Admin/Editor/Moderator/Analyst |
| 21/11 | Pilot nội bộ: team BM + COM (~30 người) trên `myikame-dev` | Backend H1 + adapter Feed/Event |
| 05/12 | **Soft launch toàn công ty** gắn với 1 sự kiện lớn (Year-End Party teaser 20/11?) | COM chuyển toàn bộ thông báo chính thức sang Feed |
| 31/12 | Đo WAU 4 tuần, khảo sát hài lòng | — |

Nguồn lực: Dũng 20% + Linh (mobile/vibe) + Chung 20% (UI) như PM Monthly đã duyệt; dev H1 backend tái dùng (Phú/Trung ~1–2 ngày/tuần sau khi iGoal V2 ổn định).

---

## B. Demo flow (10 phút) — chạy trên prototype `prototype-app/` (localhost:5180)

Chuẩn bị: F4 reset demo, giao diện sáng, cửa sổ 1280px, tab thứ 2 ở chế độ mobile 375px. Kịch bản bám persona **An — Product Designer**.

| # | Màn | Thao tác | Câu nói chốt |
|---|---|---|---|
| 1 | `/home` (iKamer) | Chào + **widget iCheck** (bấm *Chấm công ngay* → 08:06 Đúng giờ) + **Việc hôm nay** gom từ iCheck/COM/HRIS/iGoal/Asana/Lịch; banner đỏ *Cần xác nhận* | "Home trả lời đúng một câu: hôm nay tôi cần làm gì — không phải lướt tin." |
| 2 | `/feed` | Carousel bài ghim COM → tab **Thông báo** → mở bài chính sách → *Xác nhận đã đọc* → badge giảm; đăng **Kudos**; thử đăng bài có "mật khẩu" → bộ lọc trả về kèm lý do | "Thông báo chính thống có xác nhận + audit, cộng đồng có kudos, nội dung có bộ lọc — Facebook không có cả ba." |
| 3 | Switch **COM Admin** → `/admin` | Tỷ lệ xác nhận tăng, tên An biến khỏi *chưa xác nhận*; *Nhắc 5 người*, *Gửi push*, *Ghim* | "Vòng lặp đăng → push → xác nhận → đo. Đây là cách đo WAU và acknowledge rate." |
| 4 | `/events` | Timeline đã/đang/sắp, RSVP → *Thêm vào lịch*; mở **Town Hall Q2** → album + khảo sát 1 phút | "Đã – đang – sắp diễn ra; sau sự kiện có ảnh và có phản hồi." |
| 5 | `/work` → `/profile` | Tab Công việc: tuần chấm công, phép 2,5, đề xuất; Hồ sơ: dữ liệu HRIS, giấy tờ *sắp hết hạn* đỏ, **Xác thực để xem** lương | "HRIS/iCheck là nguồn sự thật — My iKame hiển thị, nhắc việc, không nhân bản nghiệp vụ." |
| 6 | `/assistant` | Dòng *Đang kết nối qua MCP* (7 hệ thống); hỏi **"Hôm nay tôi làm việc từ xa"** → form điền sẵn → duyệt → receipt `via MCP · icheck.create_wfh_request`; tab Công việc đổi thành WFH; thẻ **Đo lường** tăng | "Agent đề xuất – người duyệt – MCP thực thi – có audit. My iKame là client của framework MCP chung, không tự xây AI." |
| 7 | Switch **Manager** → `/manager/overview` | Attention queue, đơn chờ duyệt, widget iCheck của chính Mai; `/apps` của Mai có thêm BM Ops/iHiring/iFinance | "Một shell, ba lăng kính — cùng lõi, khác Home/nav/quyền/intent AI." |
| 8 | Tab mobile | Lướt Home + bottom nav 5 mục | "Dùng được trên điện thoại ngay, không cần app store." |

Kết demo bằng 1 slide: *một shell – ba lăng kính – một trợ lý – một MCP*.

---

## C. 4 quyết định cần chốt (7 phút)
1. **Scope launch H2 = Feed + Events + Apps (+ Trợ lý AI đọc).** Album/Push/Analytics dashboard → ngay sau launch (KR1 còn lại), không chặn launch.
2. **Ngày soft launch 05/12** (hoặc gắn Year-End Party) + **đo WAU** = user đăng nhập ≥1 lần/tuần qua GA + SSO log; mục tiêu 80% sau 4 tuần.
3. **COM là owner nội dung**: trả lời rule phân quyền trước 07/11; cam kết *mọi* thông báo chính thức đi qua Feed từ ngày launch (đây là đòn bẩy duy nhất đạt WAU 80%).
4. **Giữ nguồn lực T11–T12** như PM Monthly 02/10 đã ghi — My iKame là ngoại lệ "ra bản chạy thực tế".

---

## D. Phản biện dự kiến & cách trả lời
| Câu hỏi | Trả lời |
|---|---|
| Sao không mua Workvivo/Viva Engage? | Dữ liệu HRIS + SSO + MCP nội bộ; chi phí/user; cần tuỳ biến acknowledge & audience theo team iKame. Benchmark đã học pattern của họ (spec §3). |
| Đã trượt 30/09, sao tin lần này? | Lần trước thiếu scope; lần này scope cắt còn 3 lớp, backend H1 đã chạy, dev ước 1–2 ngày sau khi UI chốt (Tech xác nhận 06/08). |
| T11–T12 "không tính năng mới" mà? | PM Monthly đã ghi My iKame là ngoại lệ "dồn full lực ra bản chạy thực tế". |
| WAU 80% có thực tế? | Chỉ đạt nếu COM *đóng* kênh cũ cho thông báo chính thức + acknowledge bắt buộc; không có cam kết này thì hạ mục tiêu xuống 60% và nói rõ. |
| AI ở đâu trong bức tranh MCP anh Nghĩa chốt? | My iKame là *client* của MCP framework chung, không tự build; phase sau Trợ lý AI thành Daily Work Hub. |

## Unresolved
- Có nên demo trên prototype (mock) hay `myikame-dev` (data thật nhưng UI cũ)? Đề xuất: prototype cho câu chuyện, mở `myikame-dev` 30 giây để chứng minh nền tảng thật đang chạy.
- Ngày Year-End Party để gắn launch — cần COM xác nhận.
