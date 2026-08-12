import type { DailyCheckIn, Equipment, LeaveBalance, SeniorityEntry } from '../types';

// Hồ sơ (Demo v2) — dữ liệu hư cấu của An, không dùng thông tin nhân viên thật.
export const initialDailyCheckIn: DailyCheckIn = { done: false };

export const leaveBalance: LeaveBalance = {
  annualTotal: 12,
  annualUsed: 5,
  annualRemaining: 7,
  carriedOver: 2,
  sickUsed: 1,
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
