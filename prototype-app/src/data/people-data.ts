import type { ApprovalItem, ContractInfo, DailyCheckIn, Equipment, LeaveBalance, Payslip, RequestItem, SeniorityEntry } from '../types';
import { HUY_JOINED_AT, huyJourneyDateLabel } from './onboarding-data';

// Hồ sơ (Demo v2) — dữ liệu hư cấu của An, không dùng thông tin nhân viên thật.
export const initialDailyCheckIn: DailyCheckIn = { done: false };

// Khớp màn iCheck 27/10/2026: hiện có 2,5 (năm nay 2,5 · năm cũ 0) · phép hỉ 4 · phép hàng năm 11.
export const leaveBalance: LeaveBalance = {
  annualTotal: 11,
  annualUsed: 8.5,
  annualRemaining: 2.5,
  carriedOver: 0,
  sickUsed: 1,
  weddingLeave: 4,
  insuranceLabel: 'Bảo Việt An Gia — hiệu lực đến 31/12/2026',
  healthCheckLabel: 'Khám sức khoẻ định kỳ: 12/09/2026 (đã đặt lịch)',
};

export const equipment: Equipment[] = [
  { id: 'equip-macbook', name: 'MacBook Pro 14" M3', model: 'MacBook Pro 14-inch (M3, 2023)', serial: 'IK-2306-0142', assignedAt: '01/06/2023', condition: 'Đang sử dụng tốt' },
  { id: 'equip-monitor', name: 'Màn hình Dell U2723QE', model: 'Dell UltraSharp U2723QE', serial: 'IK-2306-0143', assignedAt: '01/06/2023', condition: 'Đang sử dụng tốt' },
  { id: 'equip-iphone', name: 'iPhone 13 (test device)', model: 'iPhone 13 128GB', serial: 'IK-2401-0087', assignedAt: '15/01/2024', condition: 'Dùng để test mobile' },
];

export const seniorityEntries: SeniorityEntry[] = [
  { id: 'seniority-join', dateLabel: '01/06/2023', title: 'Gia nhập iKame', note: 'Bắt đầu vai trò Product Designer tại khối Product & Technology.' },
  { id: 'seniority-promo', dateLabel: '01/2024', title: 'Lên Product Designer', note: 'Được xác nhận chính thức vai trò Product Designer sau giai đoạn thử việc.' },
  { id: 'seniority-award', dateLabel: 'Q4-2025', title: 'Giải iKame Star Q4-2025', note: 'Ghi nhận đóng góp nổi bật trong dự án Core DS 1.1.' },
  { id: 'seniority-2years', dateLabel: '06/2025', title: 'Tròn 2 năm đồng hành', note: 'Kỷ niệm 2 năm gắn bó cùng iKame.' },
];

/** Thâm niên theo personId — người mới chỉ có 2 cột mốc; người không có entry riêng dùng mặc định của An. */
export const seniorityByPerson: Record<string, SeniorityEntry[]> = {
  person_an: seniorityEntries,
  person_huy: [
    { id: 'seniority-join', dateLabel: HUY_JOINED_AT, title: 'Gia nhập iKame', note: 'Bắt đầu vai trò Product Designer (thử việc) tại team Product.' },
    { id: 'seniority-30d', dateLabel: huyJourneyDateLabel(30), title: 'Huy hiệu 30 ngày đầu', note: 'Hoàn thành mốc Vững vàng của hành trình 60 ngày.' },
  ],
};

/** Hợp đồng, phiếu lương, thiết bị theo personId — người mới (thử việc) không được thấy dữ liệu của An. */
export const contractByPerson: Record<string, ContractInfo> = {
  person_huy: {
    type: 'HĐ thử việc 2 tháng',
    signedAt: HUY_JOINED_AT,
    validity: 'Đang thử việc · ký HĐLĐ chính thức sau ngày 60',
    workMode: 'Toàn thời gian · Hybrid (3 ngày văn phòng)',
  },
};

export const payslipsByPerson: Record<string, Payslip[]> = {
  person_huy: [
    { id: 'payslip-huy-1', periodLabel: 'Kỳ lương tháng đầu (thử việc 85%)', amountMasked: '•• ••• ••• đ', amountRevealed: '14.450.000 đ', statusLabel: 'Đã thanh toán' },
  ],
};

export const equipmentByPerson: Record<string, Equipment[]> = {
  person_huy: [
    { id: 'equip-huy-macbook', name: 'MacBook Air 13" M3', model: 'MacBook Air 13-inch (M3, 2024)', serial: 'IK-2610-0231', assignedAt: HUY_JOINED_AT, condition: 'Cấp ngày đầu tiên · đang sử dụng tốt' },
  ],
};

/** Phép năm theo personId — người mới tích luỹ 1 ngày/tháng trong thử việc. */
export const leaveBalanceByPerson: Record<string, LeaveBalance> = {
  person_huy: {
    annualTotal: 12,
    annualUsed: 0,
    annualRemaining: 1,
    carriedOver: 0,
    sickUsed: 0,
    weddingLeave: 4,
    insuranceLabel: 'Bảo hiểm sức khoẻ: cấp sau khi ký HĐLĐ chính thức',
    healthCheckLabel: 'Khám sức khoẻ đầu vào: đã hoàn tất',
  },
};

// Lương & hợp đồng — số liệu hư cấu; số tiền che mặc định, xem đầy đủ qua handoff iHRM.
export const contractInfo: ContractInfo = {
  type: 'HĐLĐ không xác định thời hạn',
  signedAt: '01/12/2023',
  validity: 'Đang hiệu lực',
  workMode: 'Toàn thời gian · Hybrid (3 ngày văn phòng)',
};

export const payslips: Payslip[] = [
  { id: 'payslip-07', periodLabel: 'Kỳ lương tháng 7/2026', amountMasked: '•• ••• ••• đ', amountRevealed: '32.400.000 đ', statusLabel: 'Đã thanh toán' },
  { id: 'payslip-06', periodLabel: 'Kỳ lương tháng 6/2026', amountMasked: '•• ••• ••• đ', amountRevealed: '31.850.000 đ', statusLabel: 'Đã thanh toán' },
  { id: 'payslip-05', periodLabel: 'Kỳ lương tháng 5/2026', amountMasked: '•• ••• ••• đ', amountRevealed: '31.850.000 đ', statusLabel: 'Đã thanh toán' },
];

// Hàng đợi duyệt của manager (Mai) — đơn từ thành viên team Product, khớp mạch demo iRequest.
export const initialApprovals: ApprovalItem[] = [
  {
    id: 'appr-lan-leave', kind: 'Nghỉ phép', memberName: 'Lan Nguyễn', memberShort: 'Lan',
    title: 'Đơn nghỉ phép 2 ngày (18–19/08)', detail: 'Lý do: việc gia đình · Còn 6/12 ngày phép · Bàn giao cho An',
    submittedAtLabel: 'Hôm nay · 08:20', state: 'open',
  },
  {
    id: 'appr-minh-device', kind: 'Thiết bị', memberName: 'Minh Trần', memberShort: 'Minh',
    title: 'Xin cấp màn hình phụ 27"', detail: 'Lý do: làm việc với design file lớn · IT Assets đã xác nhận còn hàng',
    submittedAtLabel: 'Hôm qua · 16:45', state: 'open',
  },
  {
    id: 'appr-ha-remote', kind: 'Làm từ xa', memberName: 'Hà Phạm', memberShort: 'Hà',
    title: 'Làm từ xa tuần 34 (17–21/08)', detail: 'Lý do: sửa nhà · Cam kết online đầy đủ các buổi họp sprint',
    submittedAtLabel: 'Hôm nay · 09:05', state: 'open',
  },
];

// iRequest — seed 3 request ở 3 trạng thái để danh sách có chuyện để kể ngay khi mở.
export const initialRequests: RequestItem[] = [
  { id: 'req-hr-leave', type: 'Nhân sự', title: 'Đơn nghỉ phép 2 ngày (05–06/08)', status: 'done', createdAtLabel: '04/08 · 09:12', handlerLabel: 'HRBP đã duyệt' },
  { id: 'req-admin-parking', type: 'Hành chính', title: 'Đăng ký chỗ gửi xe ô tô tầng B2', status: 'in_progress', createdAtLabel: '11/08 · 14:30', slaLabel: 'Phản hồi trong 2 ngày làm việc', handlerLabel: 'Office Operations' },
  { id: 'req-device-monitor', type: 'Thiết bị', title: 'Xin cấp thêm màn hình phụ 27"', status: 'pending', createdAtLabel: 'Hôm nay · 08:45', slaLabel: 'Chờ quản lý duyệt', handlerLabel: 'IT Assets' },
];
