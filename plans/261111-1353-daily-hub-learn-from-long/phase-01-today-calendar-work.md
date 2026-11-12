# Phase 1 — Hôm nay, Lịch và phòng họp, Công việc

Mục tiêu: mở Trang chủ là biết việc cần làm ngay, từ nhiều nguồn hơn, có lịch trong ngày.

## Việc làm
1. **Dữ liệu mẫu mới** (hình dạng theo công cụ thật, ngày tính theo ngày máy):
   - `data/hiring-data.ts`: 4 ứng viên chờ An đánh giá (vị trí, vòng, số ngày chờ: 1 người 14 ngày), CV tóm tắt, tiêu chí vòng.
   - `data/calendar-data.ts`: lịch hôm nay 3–4 cuộc họp, 11 phòng họp + lịch bận → tính phòng trống.
   - `data/asana-data.ts`: task của An (hôm nay / quá hạn / tuần này), thay mock cố định trong `daily-digest.ts`.
   - `data/okr-data.ts`: thêm báo cáo tuần đến hạn; `data/search-answers.ts` hoặc knowledge: bài iWiki chờ duyệt.
2. **"Cần làm ngay"** — mở rộng `pages/assistant/daily-digest.ts`:
   - Nguồn mới: iHiring, báo cáo tuần iGoal, iWiki chờ duyệt, Asana quá hạn, đơn chờ duyệt (lăng kính Manager).
   - Bảng quy tắc ngay trong file: nguồn → điều kiện → ưu tiên → số tối đa. Thống kê không lên.
   - Tối đa 5 dòng + dòng "N việc cũ hơn" mở danh sách đầy đủ (`/work`).
   - Chuông thông báo dùng cùng danh sách (đi qua `notify()` hiện có).
3. **Thẻ lịch hôm nay** `components/calendar/TodayCalendarCard.tsx` trên Trang chủ: cuộc họp kế tiếp, khoảng trống dài nhất ("Trống 11:50–18:00"), nút "Tìm phòng" → danh sách phòng trống theo giờ + sức chứa; giữ phòng = thao tác mô phỏng (nối Phase 2).
4. **Công việc** (`WorkPage.tsx`): khối Asana 3 nhóm + gợi ý "xếp vào khoảng trống 14:00–15:30"; khối ứng viên chờ đánh giá; giữ iCheck + Mục tiêu + Đề xuất.
5. Trợ lý: câu "Hôm nay tôi cần làm gì?" trả đúng danh sách mới (đã dùng chung `buildDailyDigestItems`).

## File
- Mới: `src/data/{hiring-data,calendar-data,asana-data}.ts`, `src/lib/free-slots.ts`, `src/components/calendar/{TodayCalendarCard,RoomFinder}.tsx`
- Sửa: `src/pages/assistant/daily-digest.ts`, `src/pages/HomePage.tsx`, `src/pages/WorkPage.tsx`, `src/data/okr-data.ts`, `src/types/index.ts`, `src/AppState.tsx`, CSS

## Xong khi
- [ ] An: 5 dòng đúng thứ tự ưu tiên, có ứng viên chờ 14 ngày ở đầu nhóm thường; Mai (Manager) thấy đơn chờ duyệt; Gia Huy vẫn thấy quest
- [ ] Số việc trên chuông = Hôm nay = Bản tin sáng
- [ ] Thẻ lịch đúng với dữ liệu; Tìm phòng ra phòng trống đúng giờ chọn
- [ ] Home mobile không dài quá 2 màn trước "Tin dành cho bạn"
