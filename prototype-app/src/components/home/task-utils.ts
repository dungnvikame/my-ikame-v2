import type { DigestItem } from '../../pages/assistant/daily-digest';

/** Tên nút theo nguồn; id của việc quyết định khi một nguồn có nhiều loại việc. */
export function actionLabel(item: DigestItem): string {
  if (item.id.includes('checkin')) return 'Chấm công';
  if (item.id.includes('weekly-report')) return 'Viết báo cáo';
  if (item.id.includes('candidate-more')) return 'Mở iHiring';
  switch (item.source) {
    case 'iHiring': return 'Đánh giá';
    case 'COM': return 'Đọc và xác nhận';
    case 'iGoal': return 'Check-in';
    case 'HRIS': return 'Bổ sung';
    case 'Onboarding': return 'Làm tiếp';
    case 'Asana': return 'Mở task';
    case 'Google Calendar': return 'Xem lịch';
    case 'My iKame': return 'Xem sự kiện';
    default: return 'Mở';
  }
}

/** Bỏ tên nguồn lặp lại ở đầu/cuối phần mô tả ("iCheck · chưa ghi nhận" → "chưa ghi nhận"). */
export function metaOf(item: DigestItem): string {
  return item.meta.split(' · ').filter((part) => part.trim() !== item.source).join(' · ');
}

/** "Nên làm hôm nay": việc gấp, có hạn hôm nay/quá hạn, hoặc lịch họp trong ngày. */
export function isToday(item: DigestItem): boolean {
  return !!item.urgent || item.source === 'Google Calendar' || /hôm nay|quá hạn/i.test(item.meta);
}

/** Gấp lên trước, rồi việc trong ngày, rồi phần còn lại (giữ thứ tự gốc khi bằng nhau). */
export function byUrgency(items: DigestItem[]): DigestItem[] {
  const score = (item: DigestItem) => (item.urgent ? 2 : 0) + (isToday(item) ? 1 : 0);
  return items.map((item, index) => ({ item, index })).sort((a, b) => score(b.item) - score(a.item) || a.index - b.index).map(({ item }) => item);
}

const pad = (value: number) => String(value).padStart(2, '0');
export const hhmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export type SnoozeOption = { key: 'afternoon' | 'tomorrow' | 'monday' | 'skip'; label: string; until: Date; toast: string };

function at(base: Date, dayOffset: number, hour: number, minute = 0): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

/** Các mốc hoãn tính từ `now`. "Bỏ qua" ẩn việc tới hết hôm nay (nửa đêm). */
export function snoozeOptions(now: Date): SnoozeOption[] {
  const options: SnoozeOption[] = [];
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < 13 * 60 + 30) options.push({ key: 'afternoon', label: 'Chiều nay (14:00)', until: at(now, 0, 14), toast: 'Đã hoãn tới 14:00 chiều nay' });
  else if (minutes < 16 * 60 + 30) options.push({ key: 'afternoon', label: 'Cuối chiều (17:00)', until: at(now, 0, 17), toast: 'Đã hoãn tới 17:00 chiều nay' });
  options.push({ key: 'tomorrow', label: 'Sáng mai (08:30)', until: at(now, 1, 8, 30), toast: 'Đã hoãn tới 08:30 sáng mai' });
  const toMonday = ((8 - now.getDay()) % 7) || 7;
  options.push({ key: 'monday', label: 'Thứ Hai tới (08:30)', until: at(now, toMonday, 8, 30), toast: 'Đã hoãn tới 08:30 Thứ Hai tới' });
  options.push({ key: 'skip', label: 'Bỏ qua hôm nay', until: at(now, 1, 0), toast: 'Đã bỏ qua việc này hôm nay' });
  return options;
}

/** Khoảng trống dài nhất từ bây giờ tới hết giờ làm, bỏ qua các khoảng dưới 30 phút. */
export type Slot = { start: Date; end: Date };
export type SlotMeeting = { start: Date; end: Date };

function longestFreeSlot(meetings: SlotMeeting[], from: Date, to: Date): Slot | undefined {
  let cursor = from;
  let best: Slot | undefined;
  const consider = (start: Date, end: Date) => {
    const minutes = (end.getTime() - start.getTime()) / 60000;
    if (minutes >= 30 && (!best || minutes > (best.end.getTime() - best.start.getTime()) / 60000)) best = { start, end };
  };
  for (const meeting of [...meetings].sort((a, b) => a.start.getTime() - b.start.getTime())) {
    if (meeting.end <= cursor) continue;
    if (meeting.start > cursor) consider(cursor, meeting.start < to ? meeting.start : to);
    if (meeting.end > cursor) cursor = meeting.end;
    if (cursor >= to) break;
  }
  if (cursor < to) consider(cursor, to);
  return best;
}

export const DAY_START = 8;
export const DAY_END = 18;

function atHour(now: Date, hour: number): Date {
  const date = new Date(now);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** Khoảng trống dài nhất còn lại trong ngày làm việc (8h–18h). */
export function freeSlotOf(meetings: SlotMeeting[], now: Date): Slot | undefined {
  const dayStart = atHour(now, DAY_START);
  const dayEnd = atHour(now, DAY_END);
  if (now >= dayEnd) return undefined;
  return longestFreeSlot(meetings.filter((meeting) => meeting.end > dayStart && meeting.start < dayEnd), now > dayStart ? now : dayStart, dayEnd);
}

/** Gợi ý khối tập trung: khoảng trống dài nhất, làm tròn lên 15 phút, tối đa 2 giờ. */
export function focusSlotOf(meetings: SlotMeeting[], now: Date): Slot | undefined {
  const free = freeSlotOf(meetings, now);
  if (!free) return undefined;
  const start = new Date(Math.ceil(free.start.getTime() / 900000) * 900000);
  const end = new Date(Math.min(free.end.getTime(), start.getTime() + 2 * 60 * 60 * 1000));
  return end.getTime() - start.getTime() >= 30 * 60000 ? { start, end } : undefined;
}
