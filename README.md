# My iKame — Prototype v2 (Employee Experience Suite)

Prototype chính thức của **My iKame (Employee Experience Gate)** được triển khai tại [`prototype-v2/`](prototype-v2/README.md) và cấu hình deploy trong [`vercel.json`](vercel.json).

## Chạy cục bộ

```bash
cd prototype-v2
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5175`.

## Kiểm tra & Build

```bash
cd prototype-v2
npm run typecheck
npm run build
```

## Kiến trúc Multi-App Suite

- **My iKame (App tổng):** Trang chủ (`/home`), Đề xuất của tôi (`/my-requests`), Công việc (`/my-tasks`, `/work`), Lịch (`/calendar`), Hành trình hội nhập 60 ngày (`/onboarding`), Trung tâm hỗ trợ (`/support`), Hồ sơ cá nhân (`/profile`).
- **Quản lý (Manager):** Tổng quan nhịp team (`/manager/overview`), Đội ngũ & Hồ sơ 360° (`/manager/team`, `/manager/team/:id`), Công việc nhóm (`/manager/tasks`).
- **Sub-Apps tích hợp:**
  - **iCheck** (`/icheck`, `/icheck/watchers`) — Chấm công & lịch nghỉ phép.
  - **iGoal** (`/igoal/*`) — OKR & My EKS.
  - **iCom** (`/icom/feed`, `/icom/events`, `/icom/clubs`, `/icom/admin`) — Truyền thông, sự kiện, câu lạc bộ & điều phối COM.
  - **iWiki** (`/iwiki/*`) — Kho tri thức nội bộ & iWiki AI.

## 3 Lăng kính + 1 Lớp phủ (Demo Switcher)

Chuyển đổi persona ở góc dưới thanh bên trái:
- **Nguyễn Hoàng An (`iKamer`)**
- **Phạm Gia Huy (`iKamer · Người mới` — Lớp phủ Hành trình 60 ngày)**
- **Trần Thanh Mai (`Manager`)**
- **Lê Bảo Ngọc (`COM Admin`)**

## Tài liệu tham chiếu

Xem thư mục [`docs/`](docs/) gồm đặc tả sản phẩm (`docs/My-iKame-Product-Spec-v0.2.md`), context brief, journey map và kịch bản demo.
