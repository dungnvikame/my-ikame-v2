import { HOLIDAYS, MOCK_MEETINGS_BY_WEEKDAY, TEAM_LEAVE, type TeamLeave } from '../../data/requests-team-leave';
import type { LiveMeeting } from '../../lib/live/live-data';
import { toIsoDay, type DaySession } from '../../lib/request-parser';

/** Hàm ngày + ngữ cảnh (họp trùng, đồng nghiệp nghỉ, kế hoạch nghỉ đã gửi) cho trang Đề xuất. */

export const fromIso = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};
export const addDaysIso = (iso: string, delta: number): string => {
  const date = fromIso(iso);
  date.setDate(date.getDate() + delta);
  return toIsoDay(date);
};
export const isWeekendIso = (iso: string) => [0, 6].includes(fromIso(iso).getDay());
export const holidayName = (iso: string): string | undefined => HOLIDAYS[iso];
export const isWorkday = (iso: string) => !isWeekendIso(iso) && !holidayName(iso);
export const todayIso = () => toIsoDay(new Date());

export const dateLabel = (iso: string) => {
  const [year, month, day] = iso.split('-');
  return `${Number(day)}/${Number(month)}/${year}`;
};
export const shortDate = (iso: string) => {
  const [, month, day] = iso.split('-');
  return `${Number(day)}/${Number(month)}`;
};
const WEEKDAY_NAME = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const weekdayLabel = (iso: string) => WEEKDAY_NAME[fromIso(iso).getDay()];
export const dayCount = (value: number) => value.toLocaleString('vi-VN');

/** Khoảng ngày dạng "12/11" hoặc "12/11 – 14/11". */
export const rangeLabel = (start: string, end: string) => (start === end ? shortDate(start) : `${shortDate(start)} – ${shortDate(end)}`);

/** Số ngày làm việc (bỏ T7/CN và ngày lễ) trong [start, end]. */
export function countWorkdays(start: string, end: string): number {
  let count = 0;
  for (let cursor = start, guard = 0; cursor <= end && guard < 370; cursor = addDaysIso(cursor, 1), guard += 1) {
    if (isWorkday(cursor)) count += 1;
  }
  return count;
}

/** Cộng `days` ngày làm việc kể từ `start` (bao gồm start) → ngày cuối. */
export function endAfterWorkdays(start: string, days: number): string {
  let cursor = start;
  let left = Math.max(1, Math.round(days));
  for (let guard = 0; guard < 370; guard += 1) {
    if (isWorkday(cursor)) left -= 1;
    if (left <= 0) return cursor;
    cursor = addDaysIso(cursor, 1);
  }
  return cursor;
}

/** Ngày phép bị trừ: nửa buổi = 0,5; cả ngày = số ngày làm việc trong khoảng. */
export const leaveDaysOf = (start: string, end: string, session: DaySession) => (session === 'full' ? countWorkdays(start, end) : 0.5);

// ---- Họp trùng ----------------------------------------------------------------------------

export type ConflictMeeting = { id: string; title: string; timeLabel: string; dateIso: string; source: 'Lịch Google' | 'Lịch mẫu' };

const pad = (value: number) => String(value).padStart(2, '0');
const minutesOf = (date: Date) => date.getHours() * 60 + date.getMinutes();
const hm = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** Khung giờ vắng theo buổi (phút trong ngày): sáng 08:30–12:00, chiều 13:30–17:30. */
export function sessionWindow(session: DaySession): [number, number] {
  if (session === 'morning') return [8 * 60 + 30, 12 * 60];
  if (session === 'afternoon') return [13 * 60 + 30, 17 * 60 + 30];
  return [8 * 60 + 30, 17 * 60 + 30];
}

/** Họp trong [startIso, endIso] giao với khung vắng. Lịch thật chỉ dùng cho hôm nay; ngày khác dùng lịch mẫu. */
export function conflictingMeetings(startIso: string, endIso: string, session: DaySession, live?: LiveMeeting[]): ConflictMeeting[] {
  const [from, to] = sessionWindow(session);
  const today = todayIso();
  const result: ConflictMeeting[] = [];
  for (let cursor = startIso, guard = 0; cursor <= endIso && guard < 31; cursor = addDaysIso(cursor, 1), guard += 1) {
    if (!isWorkday(cursor)) continue;
    if (live && cursor === today) {
      for (const meeting of live) {
        if (meeting.allDay || toIsoDay(meeting.start) !== cursor) continue;
        if (minutesOf(meeting.start) < to && minutesOf(meeting.end) > from) {
          result.push({ id: `live-${meeting.id}`, title: meeting.title, timeLabel: `${meeting.startLabel}–${meeting.endLabel}`, dateIso: cursor, source: 'Lịch Google' });
        }
      }
      continue;
    }
    for (const meeting of MOCK_MEETINGS_BY_WEEKDAY[fromIso(cursor).getDay()] ?? []) {
      const start = meeting.startHour * 60 + meeting.startMin;
      const end = start + meeting.durationMin;
      if (start < to && end > from) {
        result.push({ id: `mock-${cursor}-${meeting.title}`, title: meeting.title, timeLabel: `${hm(start)}–${hm(end)}`, dateIso: cursor, source: 'Lịch mẫu' });
      }
    }
  }
  return result;
}

// ---- Đồng nghiệp nghỉ cùng ngày -------------------------------------------------------------

export type TeammateOff = { name: string; label: string };

export function teammatesOff(startIso: string, endIso: string): TeammateOff[] {
  const today = todayIso();
  const seen = new Set<string>();
  const result: TeammateOff[] = [];
  for (const leave of TEAM_LEAVE as TeamLeave[]) {
    const from = addDaysIso(today, leave.offsetDays);
    const to = addDaysIso(from, leave.days - 1);
    if (from > endIso || to < startIso || seen.has(leave.name)) continue;
    seen.add(leave.name);
    const part = leave.session === 'morning' ? 'sáng' : leave.session === 'afternoon' ? 'chiều' : '';
    result.push({ name: leave.name, label: `${rangeLabel(from, to)}${part ? ` · ${part}` : ''}` });
  }
  return result;
}

// ---- Kế hoạch nghỉ đã gửi (cho thẻ "Kỳ nghỉ sắp tới") -------------------------------------------

export type LeavePlan = { start: string; end: string; session: DaySession; days: number };
const PLAN_KEY = 'my-ikame-leave-plans';

export function loadLeavePlans(): LeavePlan[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PLAN_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is LeavePlan => !!item && typeof item.start === 'string' && typeof item.end === 'string')
      : [];
  } catch {
    return [];
  }
}

export function saveLeavePlan(plan: LeavePlan): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify([plan, ...loadLeavePlans()].slice(0, 20)));
  } catch { /* chế độ riêng tư / hết dung lượng — chỉ là tiện ích hiển thị */ }
}
