# Phase 3 — Cá nhân hub, riêng tư, Kết nối, vai, tìm kiếm

Mục tiêu: một trang Cá nhân trả lời mọi câu về bản thân; người xem hiểu dữ liệu đến từ đâu và vì sao mình thấy vai này.

## Việc làm
1. **Cá nhân = hub 6 tab** (`ProfilePage.tsx` + `components/Tabs.tsx`, tab trên URL `?tab=`):
   | Tab | Nội dung | Tái dùng / mới |
   |---|---|---|
   | Mục tiêu | Objective → KR + tiến độ, báo cáo gần nhất, check-in 1:1 | `okr-data.ts`, `OkrTree` |
   | Chấm công và phép | Tháng này, giờ đến trung bình, đi muộn (thống kê nằm ở đây), phép còn lại, đơn gần đây | `icheck-data.ts`, `WeekStrip`, `LeaveBalanceCard` |
   | Hồ sơ | Thông tin HRIS, tổ chức, giấy tờ (đã có) | `ProfileHrisCard`, `ProfileOrgSection`, `ProfileDocuments` |
   | Hành trình | Timeline + huy hiệu mốc; người mới: tiến độ 60 ngày | `ProfileTimeline`, `JourneyCard` |
   | Phát triển | EKS, phản hồi nhận được, tài liệu đang đọc | `EksList`, mới |
   | Thiết bị | 3 thiết bị, 6 license, ticket đang mở | mới: `data/it-assets-data.ts` |
   Mỗi tab: dòng chân "Nguồn: iGoal · cập nhật 09:12" + nút mở công cụ gốc (`PlatformHandoffButton`).
2. **Chế độ riêng tư** toàn cục: công tắc mắt ở thanh trên; che số nhạy cảm (công, phép, lương, điểm) ở Trang chủ, Cá nhân, Trợ lý; tự bật che sau 3 phút không thao tác. Đưa trạng thái `SensitiveGate` lên `AppState`.
3. **Trang Kết nối công cụ** `/connections` (từ menu hồ sơ): 8 nguồn (iCheck, iGoal, iHiring, iWiki, IT Platform, Asana, Lịch, Slack) đọc từ `mcp-registry.ts`: trạng thái, quyền đọc/ghi, lần cập nhật, My iKame dùng nguồn này ở đâu. Đầu trang ghi rõ: "Bản demo, dữ liệu mẫu theo cấu trúc công cụ thật".
4. **Vai có giải thích**: cạnh PerspectiveSwitch thêm dòng "Vì sao tôi thấy vai này" (ví dụ: "Quản lý: iCheck ghi bạn có 5 nhân sự trực tiếp"). Switch tay vẫn giữ cho demo.
5. **Tìm nhanh**: kết quả tài liệu hiện nguồn iWiki + space + ngày cập nhật; thêm nhóm "Việc của tôi" (ứng viên, task, đơn).
6. **Trợ lý khớp số**: `agent-replies.ts` đọc chung các file dữ liệu ở trên cho câu hỏi về KR, phép, thiết bị (không chép số trong chuỗi trả lời).

## File
- Mới: `src/pages/profile/tabs/{GoalsTab,AttendanceTab,DevelopmentTab,DevicesTab}.tsx`, `src/data/it-assets-data.ts`, `src/lib/privacy-mode.ts`, `src/pages/ConnectionsPage.tsx`, `src/lib/role-reason.ts`
- Sửa: `src/pages/ProfilePage.tsx`, `src/pages/profile/*`, `src/AppState.tsx`, `src/components/AppShell.tsx`, `src/App.tsx`, `src/lib/mcp-registry.ts`, `src/components/search/use-search-results.ts`, `src/pages/assistant/agent-replies.ts`

## Xong khi
- [ ] 6 tab đủ nội dung cho An, Mai, Gia Huy; số phép/KR khớp Trang chủ và Trợ lý
- [ ] Riêng tư che đúng ở 3 nơi; để yên 3 phút tự che
- [ ] `/connections` đủ 8 nguồn; dòng giải thích vai đúng cho 3 lăng kính
- [ ] 375px: tab cuộn ngang, không vỡ
