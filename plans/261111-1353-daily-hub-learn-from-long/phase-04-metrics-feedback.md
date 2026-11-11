# Phase 4 — Đo lường, Góp ý, trang Hiệu quả

Mục tiêu: cho stakeholder thấy sản phẩm tự đo được hiệu quả; thu góp ý ngay trong bản demo.

## Việc làm
1. `src/lib/track.ts`: `track(name, props)` lưu localStorage (cộng dồn lên số nền mẫu). Sự kiện: `open`, `flow_start` / `flow_done` / `flow_exit` cho 5 luồng: xem việc hôm nay, tạo đề xuất, đánh giá ứng viên, xác nhận đã đọc, đăng ký sự kiện.
2. **Nút Góp ý** nổi mọi trang: loại (lỗi / ý tưởng / khó dùng) + nội dung, tự kèm trang đang đứng + lăng kính. Sau `flow_done`: hỏi 1 câu mức dễ (1–5), tối đa 1 lần mỗi luồng.
3. **Trang Hiệu quả** trong COM Admin (mở rộng `AdminMetrics`, `AdminWaerBreakdown`): người dùng, DAU/WAU, WAER, tỷ lệ hoàn tất từng luồng, mức dễ dùng, NPS, danh sách góp ý. Số = nền mẫu + sự kiện thật của phiên. Chỉ hiện trong menu lăng kính COM Admin.
4. **Xuất góp ý**: nút "Sao chép góp ý" (văn bản) để stakeholder gửi lại qua Slack, vì bản demo không có backend.

## File
- Mới: `src/lib/track.ts`, `src/components/feedback/{FeedbackButton,EasePrompt}.tsx`, `src/pages/admin/EffectivenessPanel.tsx`
- Sửa: `src/lib/engagement.ts`, `src/pages/AdminPage.tsx`, `src/components/AppShell.tsx`, các trang thuộc 5 luồng

## Xong khi
- [ ] Đi hết 1 luồng → tỷ lệ hoàn tất luồng đó đổi; bỏ giữa chừng → tính `flow_exit`
- [ ] Góp ý gửi ở lăng kính iKamer hiện trong trang Hiệu quả; sao chép được
- [ ] F4 reset xoá sự kiện + góp ý về số nền
