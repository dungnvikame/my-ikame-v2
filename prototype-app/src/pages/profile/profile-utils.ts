import { DEMO_TODAY, HOLIDAYS } from '../../data/profile-extras';

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

/** Parse dd/mm/yyyy (HRIS). Trả undefined nếu sai định dạng. */
export function parseVnDate(label: string | undefined): Date | undefined {
  const match = label?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return undefined;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const formatDm = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
export const formatMy = (date: Date) => `${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
export const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / DAY_MS);

/** Số năm/tháng/ngày đầy đủ giữa hai mốc. */
export function diffYmd(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) { months -= 1; days += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

export function formatTenure(from: Date, to: Date = DEMO_TODAY): string {
  const { years, months, days } = diffYmd(from, to);
  const parts = [years > 0 && `${years} năm`, months > 0 && `${months} tháng`].filter(Boolean);
  if (parts.length === 0) parts.push(`${days} ngày`);
  return `Gắn bó ${parts.join(' ')}`;
}

/** Mốc tròn năm kế tiếp và tiến độ từ mốc trước đó. */
export function nextAnniversary(joined: Date, today: Date = DEMO_TODAY) {
  const { years } = diffYmd(joined, today);
  const prev = new Date(joined.getFullYear() + years, joined.getMonth(), joined.getDate());
  const next = new Date(joined.getFullYear() + years + 1, joined.getMonth(), joined.getDate());
  const span = Math.max(1, daysBetween(prev, next));
  return { years: years + 1, daysLeft: daysBetween(today, next), percent: Math.min(100, Math.round((daysBetween(prev, today) / span) * 100)), date: next };
}

/** Số ngày tới sinh nhật kế tiếp (0 = hôm nay). */
export function daysToBirthday(birth: Date, today: Date = DEMO_TODAY): number {
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return daysBetween(today, next);
}

// ---------- Chấm công dạng nhiệt ----------
export type DayStatus = 'on_time' | 'late' | 'leave' | 'absent' | 'holiday' | 'future';
export type HeatDay = { date: Date; status: DayStatus };

export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  on_time: 'Đúng giờ', late: 'Đi muộn', leave: 'Nghỉ phép', absent: 'Vắng', holiday: 'Ngày lễ', future: 'Chưa tới',
};
const WEEKDAY_LABEL = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];
export const weekdayLabel = (index: number) => WEEKDAY_LABEL[index] ?? '';

/** PRNG cố định theo seed để mỗi người luôn ra cùng một bảng (mulberry32). */
function seededRandom(seed: string) {
  let h = 1779033703;
  for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lưới 12 tuần (mỗi cột một tuần, 5 hàng Thứ Hai–Thứ Sáu), kết thúc ở tuần chứa `today`. */
export function buildHeatmap(seed: string, today: Date = DEMO_TODAY, weeks = 12): HeatDay[][] {
  const rand = seededRandom(seed);
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset - (weeks - 1) * 7);
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 5 }, (_, d): HeatDay => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
    if (date > today) return { date, status: 'future' };
    if (HOLIDAYS.includes(formatDm(date))) return { date, status: 'holiday' };
    const r = rand();
    const status: DayStatus = r < 0.74 ? 'on_time' : r < 0.9 ? 'late' : r < 0.96 ? 'leave' : 'absent';
    return { date, status };
  }));
}

/** Tóm tắt 30 ngày gần nhất: % đúng giờ trên số buổi đi làm và số buổi muộn. */
export function summarizeHeatmap(grid: HeatDay[][], today: Date = DEMO_TODAY) {
  let onTime = 0;
  let late = 0;
  for (const day of grid.flat()) {
    if (daysBetween(day.date, today) >= 30 || day.date > today) continue;
    if (day.status === 'on_time') onTime += 1;
    if (day.status === 'late') late += 1;
  }
  const worked = onTime + late;
  return { percent: worked === 0 ? null : Math.round((onTime / worked) * 100), late, worked };
}

/** Đọc màu của một token CSS thành chuỗi màu cụ thể để vẽ canvas. */
export function resolveToken(token: string, fallback: string): string {
  try {
    const probe = document.createElement('span');
    probe.style.color = `var(${token})`;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color || fallback;
  } catch {
    return fallback;
  }
}
