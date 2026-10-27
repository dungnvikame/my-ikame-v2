import type { AttendanceStatus, DailyCheckIn, WeekDayAttendance } from '../types';

/**
 * iCheck mỏng trong My iKame — legend + dải tuần hiện tại. iCheck thật là nguồn sự thật;
 * đây chỉ là lớp hiển thị để người dùng chạm mỗi ngày, nghiệp vụ sâu deep-link sang iCheck.
 */
export const ATTENDANCE_LEGEND: Record<AttendanceStatus, { label: string; tone: string; symbol: string }> = {
  on_time: { label: 'Đúng giờ', tone: 'success', symbol: '✓' },
  late: { label: 'Muộn', tone: 'warning', symbol: '!' },
  leave_full: { label: 'Nghỉ phép cả ngày', tone: 'info', symbol: 'P' },
  leave_half: { label: 'Nghỉ phép nửa ngày', tone: 'info', symbol: '½' },
  wfh: { label: 'Work from home', tone: 'accent', symbol: 'H' },
  holiday: { label: 'Nghỉ lễ / cuối tuần', tone: 'neutral', symbol: '·' },
  absent: { label: 'Vắng / nghỉ không phép', tone: 'error', symbol: '×' },
  none: { label: 'Chưa có dữ liệu', tone: 'neutral', symbol: '' },
};

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Kịch bản các ngày đã qua trong tuần (T2 → T6) — lặp lại để tuần nào demo cũng có dữ liệu. */
const PAST_WEEKDAY_PATTERN: AttendanceStatus[] = ['on_time', 'late', 'on_time', 'wfh', 'on_time'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Dải T2–CN của tuần chứa `today`: ngày đã qua theo kịch bản, hôm nay theo dailyCheckIn,
 * ngày tới chưa có dữ liệu, cuối tuần = nghỉ. Override (WFH đăng ký qua AI) đè lên.
 */
export function buildWeekAttendance(today: Date, checkIn: DailyCheckIn, overrides: Record<string, AttendanceStatus> = {}): WeekDayAttendance[] {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateLabel = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
    const isToday = date.toDateString() === today.toDateString();
    const weekend = index >= 5;
    let status: AttendanceStatus;
    if (overrides[dateLabel]) status = overrides[dateLabel];
    else if (weekend) status = 'holiday';
    else if (isToday) status = checkIn.done ? (checkIn.status ?? 'on_time') : 'none';
    else if (date < today) status = PAST_WEEKDAY_PATTERN[index] ?? 'on_time';
    else status = 'none';
    return { dateLabel, weekday: WEEKDAY_LABELS[date.getDay()], status, isToday };
  });
}

/** 4 nút nhanh của iCheck — mỗi nút là một câu hỏi gửi Trợ lý AI (hành động qua MCP iCheck). */
export type ICheckQuickActionKey = 'late' | 'leave' | 'missing' | 'wfh';
export const ICHECK_QUICK_ACTIONS: { key: ICheckQuickActionKey; label: string; prompt: string }[] = [
  { key: 'late', label: 'Xin đi muộn/ về sớm', prompt: 'Xin đi muộn 30 phút sáng mai vì có việc gia đình' },
  { key: 'leave', label: 'Xin nghỉ phép', prompt: 'Xin nghỉ phép 2 ngày tuần sau' },
  { key: 'missing', label: 'Quên chấm công', prompt: 'Tôi quên chấm công sáng nay, bổ sung giúp tôi' },
  { key: 'wfh', label: 'Work from home', prompt: 'Hôm nay tôi làm việc từ xa (WFH)' },
];

/** "Thứ ba, ngày 27 tháng 10 năm 2026" — chuẩn tiêu đề iCheck. */
export function fullDateLabel(date: Date): string {
  const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
}
