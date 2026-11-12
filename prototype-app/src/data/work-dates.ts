// Tiện ích ngày dùng chung cho trang Công việc và Lịch. Ngày lưu dạng chuỗi 'YYYY-MM-DD' (giờ địa phương).

const pad = (n: number) => String(n).padStart(2, '0');

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayYmd = () => ymd(new Date());

export function addDays(s: string, n: number): string {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

/** a - b tính theo ngày. */
export function diffDays(a: string, b: string): number {
  return Math.round((parseYmd(a).getTime() - parseYmd(b).getTime()) / 86400000);
}

/** Thứ 2 của tuần chứa ngày s. */
export function startOfWeek(s: string): string {
  const wd = parseYmd(s).getDay(); // 0 = CN
  return addDays(s, wd === 0 ? -6 : 1 - wd);
}

export const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const WEEKDAY_LONG = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export const dm = (s: string) => `${pad(parseYmd(s).getDate())}/${pad(parseYmd(s).getMonth() + 1)}`;

/** Nhãn ngày thân thiện: "Hôm nay", "Ngày mai", "Thứ 6, 13/11". */
export function dayLabel(s: string, today = todayYmd()): string {
  const diff = diffDays(s, today);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  if (diff === -1) return 'Hôm qua';
  return `${WEEKDAY_LONG[parseYmd(s).getDay()]}, ${dm(s)}`;
}

/** Bỏ dấu tiếng Việt nhưng giữ nguyên độ dài chuỗi để cắt theo vị trí. */
export function fold(s: string): string {
  return [...s.toLowerCase()].map((c) => (c === 'đ' ? 'd' : c.normalize('NFD')[0])).join('');
}

const WD_WORDS: Record<string, number> = { '2': 1, hai: 1, '3': 2, ba: 2, '4': 3, tu: 3, '5': 4, nam: 4, '6': 5, sau: 5, '7': 6, bay: 6 };

export type DayMatch = { date: string; start: number; end: number };

/** Tìm "hôm nay", "mai", "thứ 6", "chủ nhật", "dd/mm" trong câu. Trả vị trí để cắt khỏi tiêu đề. */
export function parseDayWord(text: string, base = todayYmd()): DayMatch | null {
  const f = fold(text);
  const patterns: [RegExp, (m: RegExpExecArray) => string][] = [
    [/(?<![a-z0-9])(hom nay|nay)(?![a-z0-9])/, () => base],
    [/(?<![a-z0-9])ngay mot(?![a-z0-9])/, () => addDays(base, 2)],
    [/(?<![a-z0-9])(ngay mai|mai)(?![a-z0-9])/, () => addDays(base, 1)],
    [/(?<![a-z0-9])(?:thu|t)\s?(2|3|4|5|6|7|hai|ba|tu|nam|sau|bay)(?![a-z0-9])/, (m) => nextWeekday(base, WD_WORDS[m[1]])],
    [/(?<![a-z0-9])(chu nhat|cn)(?![a-z0-9])/, () => nextWeekday(base, 0)],
    [/(?<![0-9])(\d{1,2})\/(\d{1,2})(?![0-9])/, (m) => {
      const b = parseYmd(base);
      let d = new Date(b.getFullYear(), Number(m[2]) - 1, Number(m[1]));
      if (ymd(d) < base) d = new Date(b.getFullYear() + 1, d.getMonth(), d.getDate());
      return ymd(d);
    }],
  ];
  for (const [re, fn] of patterns) {
    const m = re.exec(f);
    if (m) return { date: fn(m), start: m.index, end: m.index + m[0].length };
  }
  return null;
}

/** Ngày gần nhất (kể cả hôm nay) rơi vào thứ `wd` (0 = CN). */
function nextWeekday(base: string, wd: number): string {
  const cur = parseYmd(base).getDay();
  return addDays(base, (wd - cur + 7) % 7);
}
