# Demo Presenter Script — BLĐ Executive Tour (Skeleton v1)

> **Trạng thái:** Skeleton v1 (Phase 1). Phases 2-5 build đúng theo script này; Phase 6 verify, bấm giờ và mở rộng talking points.
> **Tổng thời lượng mục tiêu:** ~25 phút · 7 trạm. Express path nếu cháy giờ: bỏ trạm 4, gộp News+Events.

## Quy tắc vàng (đọc trước mỗi lần chạy)

1. **Event reservation (RED TEAM F3):** event `ai-product-workshop` DÀNH RIÊNG cho kịch bản A4 của Ask iKame. Beat "RSVP hàng thật" ở trạm 3 dùng `global-webinar-us` (đăng ký) + `design-sprint-full` (waitlist). KHÔNG RSVP tay lên workshop trước beat A4 — nếu lỡ, beat A4 sẽ "fizzle" vì trạng thái đã đăng ký sẵn.
2. **A3 hai bước (quyết định 2026-08-12):** AI chỉ **soạn + gửi nhắc** và trả receipt; item **vẫn nằm trong queue** (copy receipt nói rõ điều này). Mai **tự tay** bấm "Đánh dấu đã xử lý" để resolve — human-in-the-loop là điểm nhấn thuyết minh, không phải hạn chế.
3. **Reset giữa các lần chạy:** dùng nút reset (Profile, Phase 6) TRƯỚC khi bắt đầu lượt mới — không reset giữa chừng (mất bằng chứng các trạm đã đi qua — RED TEAM F13). Theme/perspective không bị reset.
4. **Scripted AI:** chỉ suggested-prompt chips. Ô nhập tự do disabled, ghi "Nhập tự do mở ở R4". Nếu BLĐ hỏi ngoài kịch bản → trả lời miệng bằng thang A0-A4.

## 7 trạm

| # | Trạm | Thời lượng | Click path | Nhịp "hôm nay" (R1 thật) | Nhịp "khi có AI" (concept, badge) | Money moment | D-decision / Stat |
|---|---|---|---|---|---|---|---|
| 0 | Mở màn `/vision` | 2' | Sidebar footer → **Tầm nhìn** (`/vision`) | Vấn đề N công cụ; North Star WUAR; bản đồ R1→R5 | — | "Đây là bản đồ, giờ đi thăm từng vùng" | — |
| 1 | Home iKamer | 4' | `/home` (perspective iKamer) | Priority hero: mandatory > news; ranking giải thích được; "Vì sao tôi thấy?" | Sparkle → Ask iKame → chip "Hôm nay tôi cần làm gì?" → **A2** tổng hợp xuyên nguồn + trích dẫn | AI trả lời có citation trỏ đúng item trên màn hình | D3, D5 |
| 2 | News | 4' | `/news` → `/news/security-update` | Đọc ≠ xác nhận; ack + receipt; audience-scoped | Chip "Tóm tắt bài này" → **A1** tóm tắt + citation + deep link | Ack xong badge đổi trạng thái toàn hệ thống | Staffbase pattern |
| 3 | Events | 3' | `/events` → `global-webinar-us` (đăng ký thật) → quay lại list | RSVP máy trạng thái; waitlist (`design-sprint-full`); dual-timezone; .ics | Chip "Đăng ký workshop cho tôi" → confirm → **A4** receipt; `ai-product-workshop` chuyển "Đã đăng ký" | Receipt + trạng thái event đổi ngay không reload | Thang A4: execute low-risk |
| 4 | Knowledge + Goals | 3' | `/knowledge` → search + preview → `/goals` → check-in goal `goal-design-refresh` | Mock-demo R2/R3: search + preview + deep link iWiki; goals 4 trạng thái + check-in flip | Chip hỏi tài liệu Finance (ngoài quyền) → **A2 "Không đủ dữ liệu"** thay vì bịa | Permission-aware AI — beat đắt nhất | D8 |
| 5 | Manager | 5' | Switch perspective → `/manager/overview` | Attention canvas ≠ BI dashboard; queue required-trước; My Team | AI-brief đầu tuần; chip **A3** soạn nhắc 3 người chưa ack → Mai sửa 1 chữ → duyệt → gửi → receipt; Mai bấm resolve → queue vơi | Queue thật sự vơi đi + KPI cập nhật | D4; human-in-the-loop; WUAR story |
| 6 | Đóng `/vision` | 3' | Sidebar → **Tầm nhìn** | Thu hoạch: badge A1-A4 vừa thấy xếp lên thang trưởng thành; "chúng ta đứng đây, cần foundation này" | — | 3 con số: Gartner 40% apps có agent 2026 · MIT 95% pilot fail vs 5% design-for-friction · FPT 84K nhân viên | D9 = "tại sao ours won't fail" |

## Câu trả lời chuẩn bị sẵn

- **"AI thật chưa?"** → "Cái các anh chị vừa thấy là hợp đồng trải nghiệm; foundation A0-A2 là điều kiện để nó thật — đó chính là đề xuất đầu tư." (badge Concept + thang A0-A4 + FPT proof point)
- **"Sao không mua Viva/ServiceNow?"** → gate-thesis (permission tích hợp iGoal/iWiki/HRIS), chi phí/ghế, tiếng Việt; MIT: blended/partnership 2x success — không đóng cửa mua-kết-hợp-build.
- **"Gartner 40% cancellation 2027?"** → maturity ladder = ROI milestone theo từng bậc, không black-box spend.

## Fallback vận hành

- **Vercel chết ngày demo** → chạy local: `cd prototype-app && npm run dev` (rehearse cả hai đường).
- **Cháy giờ** → express path: bỏ trạm 4, gộp News+Events (trạm 2+3 → 5').

## TODO Phase 6

- [ ] Bấm giờ từng trạm với timer, điều chỉnh thời lượng
- [ ] Mở rộng talking points per trạm (beat → talking point → D-decision → số liệu)
- [ ] Phụ lục kiến trúc (D7 BFF/adapters) nếu BLĐ có người kỹ thuật sâu
- [ ] Xác nhận độ phân giải phòng họp; QA band 1024px/125% zoom
- [ ] 2 lần rehearsal (ring-fenced 0.5d) — push → verify Vercel → rehearse → freeze
