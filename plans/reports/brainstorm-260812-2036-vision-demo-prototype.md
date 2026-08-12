# Brainstorm Summary — My iKame Vision Demo Prototype (BLĐ)

Date: 2026-08-12 | Participants: product owner (dungnv) + brainstormer
Research input: [researcher-260812-2036-ai-ex-platform-trends.md](./researcher-260812-2036-ai-ex-platform-trends.md)
Base asset: R0 prototype (React + mock data, 15 routes, deployed Vercel, repo `dungnvikame/my-ikame-v2`)

## 1. Problem statement

Demo live 15–30' cho toàn bộ BLĐ. Mục tiêu: **chốt tầm nhìn & định hướng My iKame** (không chỉ scope H2) — nếu chốt, scope H2 có thể mở rộng đáng kể. Prototype phải: định hình sản phẩm + lõi vận hành cho iKamer & Manager; phù hợp xu hướng AI; trả lời "tại sao phải làm như vậy". Chuẩn bị: 1–2 tuần. AI: scripted/mô phỏng (nhất quán D9 — không chatbot trước khi có foundation).

## 2. Decisions made (user-confirmed)

| Câu hỏi | Quyết định |
|---|---|
| Mục tiêu demo | Chốt tầm nhìn, "max ping", lược bớt sau khi chốt |
| Hình thức | Live click-through 15–30' |
| AI realism | Scripted golden-path, badge concept — KHÔNG LLM thật |
| Timeline | 1–2 tuần |
| Mạch demo | **B — tour theo module**, nâng cấp thành "mỗi trạm hai thì" (hiện tại → khi có AI) |
| AI scenarios | Cả 4: A1+A2 hỏi đáp có nguồn đúng quyền · A3 AI soạn/người duyệt · A4 AI làm hộ có biên lai · Manager AI-brief |
| `/vision` screen | Có — xây trong app |
| Knowledge/Goals | Nâng từ shell lên mock-demo, nhãn Concept R2/R3 |

## 3. Evaluated approaches

- **A. "Một ngày × 2 thì"** (recommended ban đầu): mạch chuyện mạnh nhất nhưng BLĐ không thấy toàn cảnh cấu trúc sản phẩm. Không chọn.
- **B. Tour theo module** (user chọn): toàn cảnh hệ thống, nhưng nguy cơ phẳng như danh sách tính năng. **Fix đã đồng thuận: mỗi trạm 2 nhịp [thật hôm nay] → [AI concept tại chỗ]** — hấp thụ storytelling của A vào khung B, và làm AI thành LỚP xuyên suốt thay vì trạm cuối (đúng D9, tránh bẫy "chatbot đứng một mình" MIT cảnh báo).
- **C. Đi theo D1–D9**: quá trừu tượng làm mạch chính → dùng làm lớp thuyết minh: mỗi beat buông 1 câu "đây là lý do quyết định X".

## 4. Final solution — Demo tour (~25', 7 trạm)

| # | Trạm | Nhịp "hôm nay" (hàng thật R0) | Nhịp "khi có AI" (scripted, badge) | Thuyết minh |
|---|---|---|---|---|
| 0 | `/vision` mở màn (2') | Vấn đề: N công cụ, iKamer không biết hôm nay cần gì; North Star WUAR; bản đồ R1→R5 | — | "Đây là bản đồ, giờ đi thăm từng vùng" |
| 1 | Home iKamer (4') | Priority hero mandatory > news, ranking giải thích được, "Vì sao tôi thấy?" | Hỏi "Hôm nay tôi cần làm gì?" → A2 tổng hợp xuyên nguồn, có trích dẫn | D3, D5 |
| 2 | News (4') | Đọc ≠ xác nhận; ack + receipt; audience-scoped | A1 tóm tắt bài dài + citation + deep link | Staffbase pattern |
| 3 | Events (3') | RSVP máy trạng thái, waitlist, dual-timezone, .ics | A4 "Đăng ký workshop cho tôi" → confirm → receipt hiện trong lịch | Thang A4: execute low-risk |
| 4 | Knowledge + Goals (3') | Mock-demo R2/R3: search+preview+deep link iWiki; goals 4 trạng thái + check-in | Hỏi ngoài quyền → **"Không đủ dữ liệu"** thay vì bịa | D8: permission-aware AI — beat đắt nhất |
| 5 | Manager (5') | Attention canvas ≠ BI dashboard; queue required-trước-optional; My Team | AI-brief đầu tuần trên canvas; A3 soạn nhắc 3 người chưa ack → Mai sửa 1 chữ → duyệt → gửi → item resolve khỏi queue | D4; human-in-the-loop; WUAR story |
| 6 | Đóng `/vision` (3') | Thu hoạch: các badge A1–A4 vừa thấy xếp lên thang trưởng thành; "chúng ta đứng đây, cần foundation này" | 3 con số: Gartner 40% apps có agent 2026 · MIT 95% pilot fail vs 5% "design for friction" · FPT 84K nhân viên | D9 = câu trả lời "tại sao ours won't fail" |

Express path nếu cháy giờ: bỏ trạm 4, gộp News+Events.

## 5. Build scope (1–2 tuần, trên code R0)

1. **"Ask iKame" scripted engine**: panel hội thoại global; suggested-prompt chips (không free-text → không lệch kịch bản); script store theo route context; citation card, confirmation UI (A3), receipt (A4); badge A1–A4 trên mỗi trả lời; kill-switch/label "Concept".
2. **Knowledge/Goals mock-demo**: thay shell; nhãn Concept R2/R3; fixture iWiki docs + goals 4 trạng thái + quick check-in.
3. **Manager moments**: AI-brief block trên Overview; `resolveAttentionItem` mutator (queue thật sự vơi đi khi resolve); flow A3 end-to-end.
4. **`/vision` screen**: problem→outcome, North Star WUAR + metric tree rút gọn, thang A0→A4, roadmap R1→R5, 3 số liệu thị trường, benchmark logos.
5. **Demo hardening**: R-badge system (R1 shipped-grade vs Concept); nút reset mock state; presenter script (beat → talking point → D-decision → số liệu); fallback chạy local; dark-mode + mobile check các màn mới.

## 6. Risks & mitigations

- **Cháy giờ / phẳng**: express path; mỗi trạm có 1 "money moment" định sẵn; tập dượt với timer.
- **BLĐ hỏi "AI thật chưa?"**: trung thực = điểm cộng (wizard-of-oz research); badge Concept + thang A0→A4 + FPT proof point; câu chuẩn bị: "Cái các anh chị vừa thấy là hợp đồng trải nghiệm; foundation A0–A2 là điều kiện để nó thật — đó chính là đề xuất đầu tư".
- **"Sao không mua Viva/ServiceNow?"**: gate-thesis (tích hợp permission với iGoal/iWiki/HRIS nội bộ), chi phí/ghế, tiếng Việt, benchmark đã học pattern của họ; MIT: blended/partnership 2x success → không đóng cửa mua-kết-hợp-build.
- **Scripted AI bị hỏi ngoài kịch bản**: chỉ suggested prompts, không ô nhập tự do (hoặc ô nhập disabled ghi "R4").
- **Gartner 40% cancellation 2027**: trả lời bằng maturity ladder = ROI milestone theo từng bậc, không black-box spend.

## 7. Success criteria

- BLĐ đồng thuận tầm nhìn + gate-thesis + AI-sau-foundation; hệ quả: duyệt mở rộng scope H2.
- Demo chạy trọn golden path không lỗi ở cả Vercel lẫn local; mỗi trạm ≤ thời lượng định sẵn.
- Sau demo, BLĐ tự click được link mà không cần người dẫn (R-badge tự giải thích).

## 8. Next steps

1. Tạo implementation plan chi tiết (phases: Ask-iKame engine → module upgrades → /vision → hardening/rehearsal).
2. Viết demo script v1 song song với build (không để cuối).
3. Xác nhận ngày demo BLĐ để chốt deadline rehearsal.

## Unresolved questions

1. Ngày demo cụ thể? (quyết định deadline rehearsal + express path có cần không)
2. BLĐ có người kỹ thuật sâu không — cần chuẩn bị phụ lục kiến trúc (BFF/adapters, D7) hay chỉ trải nghiệm?
3. Câu hỏi partnership (MIT 2x): công ty có định hướng mua/hợp tác vendor AI hay pure internal build? Nên có 1 slide-câu-trả-lời dự phòng.
4. Demo trên máy/màn hình nào — cần test độ phân giải phòng họp (font size khi chiếu)?
