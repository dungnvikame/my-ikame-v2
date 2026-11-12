import type { LiveMeeting } from '../lib/live/live-data';
import { parseYmd, ymd } from './work-dates';
import { ROOMS, type Room } from './calendar-rooms';

/** Thời gian trong ngày tính bằng phút từ 0h. */
export const DAY_START = 8 * 60;
export const DAY_END = 18 * 60;

export type CalMeeting = {
  id: string;
  title: string;
  date: string;
  start: number;
  end: number;
  online: boolean;
  roomId?: string;
  url?: string;
  docUrl?: string;
  guestIds: string[];
  guestCount: number;
  kind: 'meeting' | 'focus';
};

export type CalPerson = { id: string; name: string; role: string };

export const PEOPLE: CalPerson[] = [
  { id: 'p-lan', name: 'Lan Nguyễn', role: 'Product Manager' },
  { id: 'p-minh', name: 'Minh Trần', role: 'Frontend Engineer' },
  { id: 'p-ha', name: 'Hà Phạm', role: 'UX Researcher' },
  { id: 'p-tuan', name: 'Tuấn Lê', role: 'Backend Engineer' },
  { id: 'p-binh', name: 'Bình Đỗ', role: 'Design Lead' },
  { id: 'p-ngoc', name: 'Ngọc Vũ', role: 'QA Engineer' },
  { id: 'p-huy', name: 'Huy Phạm', role: 'Product Designer' },
  { id: 'p-linh', name: 'Linh Hoàng', role: 'Data Analyst' },
  { id: 'p-duc', name: 'Đức Bùi', role: 'Engineering Manager' },
  { id: 'p-thao', name: 'Thảo Đặng', role: 'Content Designer' },
];

export const fmtTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} phút`;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export const nowMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

/** Hash đơn giản để sinh lịch bận cố định cho người/phòng theo thứ trong tuần. */
function hash(s: string): number {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100003;
  return h;
}

type Block = [number, number];

function busyBlocks(key: string, date: string, count: number): Block[] {
  const wd = parseYmd(date).getDay();
  if (wd === 0 || wd === 6) return [];
  const slots = [9 * 60, 10 * 60, 11 * 60, 14 * 60, 15 * 60, 16 * 60, 17 * 60];
  const out: Block[] = [];
  let h = hash(`${key}${wd}`);
  for (let i = 0; i < count; i += 1) {
    h = (h * 17 + 11) % 100003;
    const start = slots[h % slots.length];
    const len = h % 3 === 0 ? 90 : 60;
    if (!out.some(([s, e]) => start < e && start + len > s)) out.push([start, start + len]);
  }
  return out;
}

export const personBusy = (personId: string, date: string) => busyBlocks(personId, date, 3);
export const roomBusy = (roomId: string, date: string) => busyBlocks(roomId, date, 3);

type Template = Omit<CalMeeting, 'id' | 'date' | 'kind' | 'guestCount'>;
const MEET = 'https://meet.google.com/';
const DOC = 'https://drive.google.com/';
const standup: Template = { title: 'Daily standup Product', start: 9 * 60 + 30, end: 10 * 60, online: true, url: MEET, guestIds: ['p-lan', 'p-minh', 'p-binh', 'p-ngoc'] };

const TEMPLATES: Record<number, Template[]> = {
  1: [standup, { title: 'Design review Core DS', start: 14 * 60, end: 15 * 60, online: false, roomId: 'r-sapphire', docUrl: DOC, guestIds: ['p-binh', 'p-minh', 'p-thao'] }],
  2: [standup, { title: 'Workshop onboarding vòng 2', start: 10 * 60 + 30, end: 12 * 60, online: false, roomId: 'r-emerald', docUrl: DOC, guestIds: ['p-lan', 'p-ha', 'p-binh', 'p-thao', 'p-linh'] }, { title: '1:1 với quản lý', start: 15 * 60, end: 16 * 60, online: true, url: MEET, guestIds: ['p-duc'] }],
  3: [standup, { title: 'Đồng bộ với dev My iKame', start: 13 * 60 + 30, end: 14 * 60 + 30, online: true, url: MEET, docUrl: DOC, guestIds: ['p-minh', 'p-tuan', 'p-ngoc'] }, { title: 'Sprint planning', start: 16 * 60, end: 17 * 60, online: false, roomId: 'r-ruby', guestIds: ['p-lan', 'p-minh', 'p-tuan', 'p-duc', 'p-ngoc'] }],
  4: [standup, { title: 'Sync PM: lịch và công việc', start: 10 * 60 + 30, end: 11 * 60, online: true, url: MEET, docUrl: DOC, guestIds: ['p-lan', 'p-minh'] }, { title: 'Nghiên cứu người dùng: debrief', start: 14 * 60 + 30, end: 16 * 60, online: false, roomId: 'r-amber', docUrl: DOC, guestIds: ['p-ha', 'p-lan', 'p-linh', 'p-thao', 'p-binh', 'p-huy'] }],
  5: [standup, { title: 'Demo tuần', start: 11 * 60, end: 12 * 60, online: false, roomId: 'r-ocean', docUrl: DOC, guestIds: ['p-lan', 'p-minh', 'p-tuan', 'p-binh', 'p-duc', 'p-ha', 'p-linh', 'p-ngoc'] }, { title: 'Retro Product', start: 15 * 60, end: 16 * 60, online: true, url: MEET, guestIds: ['p-lan', 'p-minh', 'p-binh', 'p-ngoc'] }],
};

export function mockMeetings(date: string): CalMeeting[] {
  const list = TEMPLATES[parseYmd(date).getDay()] ?? [];
  return list.map((t, i) => ({ ...t, id: `m-${date}-${i}`, date, kind: 'meeting' as const, guestCount: t.guestIds.length + 1 }));
}

export function liveToCal(list: LiveMeeting[]): CalMeeting[] {
  return list.filter((m) => !m.allDay).map((m) => ({
    id: `live-${m.id}`,
    title: m.title,
    date: ymd(m.start),
    start: m.start.getHours() * 60 + m.start.getMinutes(),
    end: m.end.getHours() * 60 + m.end.getMinutes() || 24 * 60,
    online: !!m.url,
    url: m.url,
    guestIds: [],
    guestCount: m.guests,
    kind: 'meeting' as const,
  }));
}

const EXTRA_KEY = 'my-ikame-calendar-extra';

export function loadExtra(): CalMeeting[] {
  try {
    const raw = localStorage.getItem(EXTRA_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as CalMeeting[]) : [];
  } catch { return []; }
}

export function saveExtra(list: CalMeeting[]) {
  try { localStorage.setItem(EXTRA_KEY, JSON.stringify(list)); } catch { /* bỏ qua */ }
}

/** Họp trong ngày = mẫu (hoặc lịch thật nếu là hôm nay và có) + việc thêm cục bộ, sắp theo giờ. */
export function meetingsForDate(date: string, extra: CalMeeting[] = [], live?: CalMeeting[]): CalMeeting[] {
  const base = live && date === ymd(new Date()) ? live.filter((m) => m.date === date) : mockMeetings(date);
  return [...base, ...extra.filter((m) => m.date === date)].sort((a, b) => a.start - b.start);
}

export function mergeBlocks(blocks: Block[]): Block[] {
  const sorted = [...blocks].sort((a, b) => a[0] - b[0]);
  const out: Block[] = [];
  for (const b of sorted) {
    const last = out[out.length - 1];
    if (last && b[0] <= last[1]) last[1] = Math.max(last[1], b[1]); else out.push([b[0], b[1]]);
  }
  return out;
}

/** Khoảng trống giữa các khối bận trong [from, to], dài tối thiểu minLen phút. */
export function freeGaps(blocks: Block[], from = DAY_START, to = DAY_END, minLen = 30): Block[] {
  const gaps: Block[] = [];
  let cursor = from;
  for (const [s, e] of mergeBlocks(blocks)) {
    if (s > cursor) gaps.push([cursor, Math.min(s, to)]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < to) gaps.push([cursor, to]);
  return gaps.filter(([s, e]) => e - s >= minLen);
}

export const meetingBlocks = (list: CalMeeting[]): Block[] => list.map((m) => [m.start, m.end]);

export function meetingHours(list: CalMeeting[]): number {
  return list.reduce((sum, m) => sum + (m.end - m.start), 0) / 60;
}

const overlaps = (blocks: Block[], s: number, e: number) => blocks.some(([bs, be]) => s < be && e > bs);

function roomBlocks(room: Room, date: string, extra: CalMeeting[]): Block[] {
  return [...roomBusy(room.id, date), ...extra.filter((m) => m.date === date && m.roomId === room.id).map((m): Block => [m.start, m.end])];
}

/** Phòng nhỏ nhất đủ chỗ và trống trong khung giờ. */
export function bestRoom(count: number, date: string, start: number, end: number, extra: CalMeeting[]): Room | null {
  return [...ROOMS].sort((a, b) => a.capacity - b.capacity)
    .find((r) => r.capacity >= count && !overlaps(roomBlocks(r, date, extra), start, end)) ?? null;
}

export type Slot = { start: number; end: number; room: Room | null };

export type SlotQuery = {
  date: string;
  attendeeIds: string[];
  /** Tổng số người dự họp (gồm bạn), để chọn phòng. */
  headcount: number;
  duration: number;
  from: number;
  to: number;
  own: CalMeeting[];
  extra: CalMeeting[];
};

/** Tìm khung giờ mà bạn và mọi người cùng rảnh (bỏ giờ nghỉ trưa), tối đa `limit` gợi ý. */
export function findSlots(q: SlotQuery, limit = 3): Slot[] {
  const isToday = q.date === ymd(new Date());
  const startFrom = isToday ? Math.max(q.from, Math.ceil(nowMinutes() / 30) * 30) : q.from;
  const busy: Block[] = [...meetingBlocks(q.own), ...q.attendeeIds.flatMap((id) => personBusy(id, q.date)), [12 * 60, 13 * 60]];
  const all: Slot[] = [];
  for (let s = Math.ceil(startFrom / 30) * 30; s + q.duration <= q.to; s += 30) {
    if (overlaps(busy, s, s + q.duration)) continue;
    all.push({ start: s, end: s + q.duration, room: bestRoom(q.headcount, q.date, s, s + q.duration, q.extra) });
  }
  const picked: Slot[] = [];
  for (const slot of all) {
    if (picked.length < limit && picked.every((p) => Math.abs(p.start - slot.start) >= 60)) picked.push(slot);
  }
  for (const slot of all) {
    if (picked.length >= limit) break;
    if (!picked.includes(slot)) picked.push(slot);
  }
  return picked.sort((a, b) => a.start - b.start);
}

export type RoomStatus = { room: Room; free: boolean; from: number; until: number };

/** Trạng thái phòng tại mốc `ref`: đang trống đến mấy giờ, hoặc trống từ mấy giờ. */
export function roomStatuses(date: string, ref: number, extra: CalMeeting[]): RoomStatus[] {
  return ROOMS.map((room) => {
    const blocks = mergeBlocks(roomBlocks(room, date, extra));
    const cur = blocks.find(([s, e]) => ref >= s && ref < e);
    const from = cur ? cur[1] : ref;
    const next = blocks.find(([s]) => s >= from);
    return { room, free: !cur, from, until: next ? next[0] : DAY_END };
  });
}

export function autoTitle(headcount: number): string {
  if (headcount <= 2) return 'Trao đổi nhanh 1:1';
  if (headcount <= 4) return 'Họp nhóm nhỏ';
  return `Họp đồng bộ ${headcount} người`;
}
