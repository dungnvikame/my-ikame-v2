# Phase 2 — Đề xuất một câu, đánh giá ứng viên, nhãn DEMO

Mục tiêu: tạo đề xuất bằng một câu tại chỗ; làm xong việc chờ (đánh giá ứng viên) ngay trong My iKame.

## Việc làm
1. **Parser** `src/lib/request-parser.ts`: câu tự nhiên → `{ loại, ngày, buổi, phút, lý do }` bằng luật + từ khoá tiếng Việt (mai, thứ 6, tuần sau, sáng/chiều, 30 phút…). Loại: nghỉ phép, WFH, đi muộn/về sớm, bổ sung công, IT, hành chính, thiết bị. Không nhận ra → `unknown`, không báo lỗi.
2. **Ô nhập nhanh** `components/requests/QuickRequestInput.tsx`: đặt đầu `/requests` và một dòng trên Trang chủ; có 3 câu gợi ý bấm được.
3. **Form xác nhận tại chỗ** `components/requests/RequestConfirmForm.tsx`: loại, ngày, buổi (sửa được), người duyệt (quản lý từ roster), phép còn lại sau khi trừ (iCheck mock), **trích quy định liên quan** (1 đoạn + link bài knowledge). `unknown` → form trống + 4 thẻ loại.
4. Gửi → vào `requests` (trạng thái Chờ duyệt), receipt, notification; Mai (Manager) thấy đơn trong việc chờ duyệt.
5. 4 thẻ loại hiện có trên `/requests`: đổi từ nhảy sang Trợ lý thành điền sẵn câu vào ô nhập. Trợ lý vẫn tạo được đơn, dùng chung parser + form.
6. **Ghi một cửa** `src/lib/write-actions.ts`: mọi thao tác ghi (đơn, giữ phòng, check-in mục tiêu, đánh giá ứng viên) đi qua `runWrite(action, payload)`; gắn `demo: true` → nhãn **DEMO** thống nhất trên nút, receipt, dòng danh sách. Chú thích 1 câu: "Bản demo: thao tác được mô phỏng, chưa ghi vào công cụ gốc".
7. **Đánh giá ứng viên** `pages/CandidateEvaluationPage.tsx` (`/hiring/:candidateId`): CV tóm tắt, vị trí, vòng, tiêu chí của vòng, phân tích AI tóm tắt; form kết quả (Đạt/Cân nhắc/Không đạt) + điểm theo tiêu chí + nhận xét, **không chọn sẵn**; bước xem lại → lưu → ứng viên rời "Cần làm ngay".

## File
- Mới: `src/lib/{request-parser,write-actions}.ts`, `src/components/requests/{QuickRequestInput,RequestConfirmForm}.tsx`, `src/pages/CandidateEvaluationPage.tsx`, `src/components/DemoBadge.tsx`
- Sửa: `src/pages/RequestsPage.tsx`, `src/pages/HomePage.tsx`, `src/pages/assistant/agent-replies.ts`, `src/AppState.tsx`, `src/App.tsx`, `src/lib/mcp-registry.ts` (thêm server iHiring)

## Xong khi
- [ ] 6 câu mẫu ra đúng form: nghỉ sáng mai, WFH thứ 6, đi muộn 30 phút, quên chấm công hôm qua, laptop không vào wifi, xin màn hình phụ
- [ ] Câu lạ → form trống có gợi ý, không lỗi
- [ ] Đơn của An xuất hiện ở việc chờ duyệt của Mai
- [ ] Mọi thao tác ghi có nhãn DEMO; không còn chỗ ghi nào ngoài `write-actions.ts`
- [ ] Lưu đánh giá → số ứng viên chờ giảm ở Trang chủ, Công việc, chuông
