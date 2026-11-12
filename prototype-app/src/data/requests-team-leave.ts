/**
 * Dữ liệu MẪU cho trang Đề xuất: ai trong team nghỉ, lịch họp mẫu, ngày lễ.
 * Ngày tính theo "số ngày kể từ hôm nay" để demo luôn có chuyện để kể dù mở vào ngày nào.
 */
export type TeamLeave = { name: string; shortName: string; offsetDays: number; days: number; session: 'full' | 'morning' | 'afternoon' };

export const TEAM_LEAVE: TeamLeave[] = [
  { name: 'Lê Minh Quân', shortName: 'Quân', offsetDays: 1, days: 1, session: 'morning' },
  { name: 'Vũ Thuỳ Linh', shortName: 'Linh', offsetDays: 1, days: 2, session: 'full' },
  { name: 'Đỗ Hải Nam', shortName: 'Nam', offsetDays: 2, days: 1, session: 'full' },
  { name: 'Phan Khánh Vy', shortName: 'Vy', offsetDays: 4, days: 3, session: 'full' },
  { name: 'Bùi Đức Anh', shortName: 'Đức Anh', offsetDays: 7, days: 1, session: 'afternoon' },
  { name: 'Ngô Thu Hà', shortName: 'Hà', offsetDays: 8, days: 2, session: 'full' },
  { name: 'Lê Minh Quân', shortName: 'Quân', offsetDays: 14, days: 1, session: 'full' },
];

/** Ngày lễ (mẫu, đối chiếu lại với lịch công ty khi nối dữ liệu thật). yyyy-mm-dd. */
export const HOLIDAYS: Record<string, string> = {
  '2026-09-02': 'Quốc khánh',
  '2027-01-01': 'Tết Dương lịch',
  '2027-02-05': 'Tết Nguyên đán',
  '2027-02-06': 'Tết Nguyên đán',
  '2027-02-07': 'Tết Nguyên đán',
  '2027-02-08': 'Tết Nguyên đán',
  '2027-02-09': 'Tết Nguyên đán',
  '2027-02-10': 'Tết Nguyên đán',
  '2027-04-16': 'Giỗ Tổ Hùng Vương',
  '2027-04-30': 'Giải phóng miền Nam',
  '2027-05-01': 'Quốc tế Lao động',
};

export type MockMeeting = { title: string; startHour: number; startMin: number; durationMin: number };

/** Lịch họp lặp theo thứ (0 = CN) — dùng khi không có lịch thật cho ngày được chọn. */
export const MOCK_MEETINGS_BY_WEEKDAY: Record<number, MockMeeting[]> = {
  1: [{ title: 'Weekly sync Product', startHour: 9, startMin: 30, durationMin: 60 }],
  2: [{ title: 'Sprint planning', startHour: 10, startMin: 0, durationMin: 90 }],
  3: [{ title: '1-1 với quản lý', startHour: 14, startMin: 0, durationMin: 30 }],
  4: [
    { title: 'Product sync', startHour: 9, startMin: 30, durationMin: 45 },
    { title: 'Design review', startHour: 15, startMin: 0, durationMin: 60 },
  ],
  5: [{ title: 'Demo sprint', startHour: 16, startMin: 0, durationMin: 60 }],
};
