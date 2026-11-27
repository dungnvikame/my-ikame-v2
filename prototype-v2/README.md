# My iKame — Prototype v2 (PRD v1.0 Full-Fidelity)

Bản prototype hoàn chỉnh cho **My iKame (Employee Experience Gate)** xây dựng mới hoàn toàn từ `docs/my-ikame-prd.md` theo triết lý **"Một shell, ba lăng kính"** + lớp phủ **Hành trình 60 ngày** và hệ thống thiết kế **Core DS 1.1** (Warm Stone + iKame Orange `#F76226`, hỗ trợ đầy đủ Light & Dark Mode).

## Chạy cục bộ

```bash
cd prototype-v2
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5175`.

## Điểm nổi bật & luồng demo khuyến nghị

1. **Thao tác nhanh tuỳ chỉnh cá nhân trên Trang chủ (`/home`):**
   - Bấm **Tuỳ chỉnh** (hoặc ô `+ Thêm`) ngay trong mục **Thao tác nhanh** để bật/tắt (2–8 lối tắt) từ 15 tác vụ phân nhóm, kéo thả hoặc bấm mũi tên sắp xếp thứ tự, và lưu riêng theo từng nhân sự vào `localStorage`.
2. **Chuyển 3 lăng kính + 1 lớp phủ qua nút hồ sơ gọn ở góc dưới thanh bên trái:**
   - **Nguyễn Hoàng An (`iKamer`)** → `/home`, Việc hôm nay, banner bắt buộc xác nhận, iKame Feed, Công việc & iCheck, Sự kiện, Ứng dụng theo quyền (6 app), Trợ lý AI MCP.
   - **Phạm Gia Huy (`iKamer · Người mới`)** → Lớp phủ **Hành trình 60 ngày** (Ngày 32/60), hoàn thành quest #9 sẽ tự mở khoá huy hiệu **Vững vàng 30 ngày** và tự động đăng bài chúc mừng lên iKame Feed.
   - **Trần Thanh Mai (`Manager`)** → `/manager/overview` (Nhịp team, Tín hiệu sớm kèm ghi chú đạo đức dữ liệu, Bản tin AI, duyệt đơn trực tiếp cập nhật ngược sang nhân viên), `/manager/team`, Hồ sơ 360° `/manager/team/:id`, `/goals`, và thấy thêm app `iHiring`, `BM Ops`, `iFinance`.
   - **Lê Bảo Ngọc (`COM Admin`)** → `/admin` (4 KPI WAER/WAU/Đọc/Xác nhận cập nhật theo thời gian thực khi iKamer bấm xác nhận, bảng điều phối push/nhắc tối đa 3 lần, danh sách chưa xác nhận, quản lý ghim, và CMS soạn thông báo/sự kiện).
2. **Kiểm chứng các điểm tồn đọng ở PRD §13.6 đã được khắc phục:**
   - Số dư ngày phép riêng biệt theo từng persona (`personId`).
   - Lưu được cả thông báo chính thức COM vào tab **Đã lưu**.
   - Bỏ ghim trực tiếp ngay trên Carousel bài ghim (lăng kính COM Admin).
   - Focus-trap + Escape đầy đủ cho Modal xác thực nhạy cảm (Step-up Auth) kèm đếm ngược 5 phút và tự khoá khi đổi lăng kính.
   - Tìm kiếm người từ lăng kính Manager điều hướng chính xác vào Hồ sơ 360° (nếu là nhân sự trực tiếp) hoặc danh bạ mà không gặp trang lỗi.
   - Bộ lọc tiếng Việt Unicode NFC tự động khi đăng bài (chặn `"mật khẩu"`, `"cccd"`, `"mức lương"`... nhưng **không** chặn `"khen thưởng"`).
