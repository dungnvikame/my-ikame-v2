---
phase: 2
title: "Trang cá nhân như thật (HRIS là nguồn)"
status: pending
priority: P1
effort: "4h"
dependencies: []
---

# Phase 2: Trang cá nhân như thật

## Overview
Hồ sơ = ảnh phản chiếu HRIS + trách nhiệm giấy tờ/hợp đồng + thiết bị + thâm niên; dữ liệu nhạy cảm (C&B) gate xác thực lại. Không sửa trong My iKame — mọi chỉnh sửa deep-link iHRM/HRIS.

## Requirements
**Trường HRIS hiển thị (đề xuất chốt):** họ tên, mã nhân viên, ngày sinh (dd/mm/yyyy — tránh lỗi 07/10), giới tính, email, Slack, số điện thoại nội bộ, chức danh, cấp bậc, team/đơn vị, quản lý trực tiếp, ngày gia nhập, loại nhân sự (chính thức/thử việc), hình thức làm việc (WFO/Hybrid), địa điểm/tầng, múi giờ. Nguồn ghi rõ "HRIS · cập nhật dd/mm".
**Gate xác thực lại:** lương/payslip, phụ cấp, số tài khoản ngân hàng, BHXH số, CCCD số đầy đủ → ẩn, nút *Xác thực để xem* → modal mock (mật khẩu/FaceID) → hiện 5 phút (state).
**Giấy tờ & hợp đồng:** hợp đồng (loại, ngày ký, hiệu lực, hết hạn), phụ lục, CCCD/hộ chiếu, bằng cấp, cam kết bảo mật, sổ BHXH — mỗi mục: trạng thái (đủ/thiếu/sắp hết hạn), hạn, hành động (*Nộp bổ sung* → iRequest, *Gia hạn* → iHRM handoff). Pill đỏ ≤30 ngày, vàng ≤90.
**Thiết bị & thâm niên:** giữ, thêm cảnh báo bảo hành sắp hết.
**Nhắc việc:** tổng hợp lên Home "Việc hôm nay" (giấy tờ thiếu/hết hạn) qua daily-digest.

## Architecture
- `types`: `HrProfile` (các trường trên), `PersonalDocument = { id; name; kind; status: 'valid'|'missing'|'expiring'|'expired'; dueLabel?; dueInDays?; action?: 'submit'|'renew' }`, `SensitiveInfo` (bank, insurance, idNumber, salaryBand).
- `data/profile-data.ts` (mới): hrProfile cho An (và Mai/Ngọc tối thiểu), documents, sensitive.
- `AppState`: `sensitiveUnlockedUntil?: number`, `unlockSensitive()`; resetDemo xoá.
- `pages/profile/ProfileHrisCard.tsx`, `ProfileDocuments.tsx`, `SensitiveGate.tsx` (modal mock); `ProfilePage` xếp lại: hero → tabs (Tổng quan | Hồ sơ HRIS | Giấy tờ & hợp đồng | C&B) hoặc section cuộn; tái dùng `Tabs`.
- `daily-digest.ts` đọc documents expiring/missing.

## Related Code Files
- Create: `src/data/profile-data.ts`, `src/pages/profile/ProfileHrisCard.tsx`, `src/pages/profile/ProfileDocuments.tsx`, `src/pages/profile/SensitiveGate.tsx`
- Modify: `src/types/index.ts`, `src/AppState.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/profile/ProfileHrSection.tsx` (ProfilePay dùng gate), `src/styles/profile-v2.css`, `src/pages/assistant/daily-digest.ts`

## Implementation Steps
1. Types + profile-data.
2. SensitiveGate + unlock state.
3. HRIS card + Documents + tích hợp ProfilePage.
4. Digest đọc giấy tờ.

## Success Criteria
- [x] /profile hiện đủ trường HRIS, nguồn + ngày cập nhật; ngày sinh dd/mm/yyyy
- [x] Giấy tờ: ≥1 "sắp hết hạn" (đỏ) + 1 "thiếu" với nút hành động; Home digest nhắc
- [x] Payslip/bank ẩn → xác thực mock → hiện; reset demo khoá lại

## Risk Assessment
- Tên/nhân vật mock hư cấu, không dùng dữ liệu nhân sự thật.
