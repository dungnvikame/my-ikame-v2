/**
 * Đọc một câu tiếng Việt tự nhiên thành bản nháp đề xuất ("mai em xin nghỉ buổi sáng" →
 * nghỉ phép, ngày mai, buổi sáng). Chỉ dùng luật + từ khoá, chạy ngay trong trình duyệt:
 * người dùng luôn xem lại form trước khi gửi nên đoán sai vẫn sửa được. Không nhận ra loại
 * → `kind: 'unknown'`, giao diện hiện form trống chứ không báo lỗi.
 */
export type RequestKind = 'leave' | 'wfh' | 'late' | 'missing' | 'it' | 'equipment' | 'admin' | 'unknown';
export type DaySession = 'full' | 'morning' | 'afternoon';

export type RequestDraft = {
  kind: RequestKind;
  /** yyyy-mm-dd (giờ máy). */
  date: string;
  session: DaySession;
  /** Số ngày nghỉ khi câu nêu rõ ("nghỉ 2 ngày"); mặc định 1. */
  days: number;
  /** Đi muộn / về sớm: số phút. */
  minutes?: number;
  direction?: 'late' | 'early';
  reason: string;
  /** Câu gốc — dùng làm mô tả cho request IT/thiết bị/hành chính. */
  source: string;
};

export const REQUEST_KIND_LABEL: Record<RequestKind, string> = {
  leave: 'Xin nghỉ phép',
  wfh: 'Làm việc từ xa',
  late: 'Xin đi muộn / về sớm',
  missing: 'Bổ sung chấm công',
  it: 'Hỗ trợ IT',
  equipment: 'Cấp / đổi thiết bị',
  admin: 'Hành chính',
  unknown: 'Chưa rõ loại',
};

const pad = (value: number) => String(value).padStart(2, '0');
export const toIsoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Bỏ dấu + chữ thường để so từ khoá ("Nghỉ" → "nghi", "đi muộn" → "di muon"). */
function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
}

const has = (text: string, ...patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text));

function detectKind(text: string): RequestKind {
  if (has(text, /quen cham cong/, /bo sung (cham )?cong/, /quen check ?in/, /chua cham cong/)) return 'missing';
  if (has(text, /di muon/, /den muon/, /ve som/, /vao muon/, /\bden tre\b/, /\bdi tre\b/)) return 'late';
  if (has(text, /\bwfh\b/, /lam (viec )?tu xa/, /lam (viec )?(o|tai) nha/, /\bremote\b/, /work from home/)) return 'wfh';
  if (has(text, /(xin|cap|doi|muon|them).{0,20}(man hinh|chuot|ban phim|tai nghe|laptop|may tinh|ghe|webcam|thiet bi)/)) return 'equipment';
  if (has(text, /\bnghi\b/, /xin phep vang/)) return 'leave';
  if (has(text, /laptop|may tinh|wifi|\bmang\b|vpn|phan mem|tai khoan|mat khau|khong vao duoc|bi loi|\bhong\b|khong ket noi|may in/)) return 'it';
  if (has(text, /gui xe|cho ngoi|van phong pham|the ra vao|the nhan vien|phong hop|dieu hoa/)) return 'admin';
  return 'unknown';
}

const WEEKDAY_WORDS: [RegExp, number][] = [
  [/\bthu (2|hai)\b/, 1], [/\bthu (3|ba)\b/, 2], [/\bthu (4|tu)\b/, 3], [/\bthu (5|nam)\b/, 4],
  [/\bthu (6|sau)\b/, 5], [/\bthu (7|bay)\b/, 6], [/\bchu nhat\b/, 0],
];

/** Ngày được nhắc trong câu; không có thì trả undefined để người gọi chọn mặc định theo loại. */
function detectDate(text: string, now: Date): Date | undefined {
  const explicit = text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (explicit) {
    const year = explicit[3] ? Number(explicit[3].length === 2 ? `20${explicit[3]}` : explicit[3]) : now.getFullYear();
    const date = new Date(year, Number(explicit[2]) - 1, Number(explicit[1]));
    if (!Number.isNaN(date.getTime())) return date;
  }
  const shift = (days: number) => { const date = new Date(now); date.setDate(now.getDate() + days); return date; };
  if (/\bhom qua\b/.test(text)) return shift(-1);
  if (/\bhom nay\b|\bnay\b/.test(text)) return shift(0);
  if (/\bngay kia\b|\bngay mot\b/.test(text)) return shift(2);
  if (/\bmai\b/.test(text)) return shift(1);

  // "tuần sau" phải tách khỏi "thứ sáu" (không dấu đều là "sau").
  const nextWeek = /\btuan (sau|toi)\b/.test(text);
  const withoutWeek = text.replace(/\btuan (sau|toi)\b/g, ' ');
  for (const [pattern, weekday] of WEEKDAY_WORDS) {
    if (!pattern.test(withoutWeek)) continue;
    let delta = (weekday - now.getDay() + 7) % 7;
    if (delta === 0) delta = 7;
    return shift(delta + (nextWeek && delta < 7 - ((now.getDay() + 6) % 7) ? 7 : 0));
  }
  if (nextWeek) return shift(7 - ((now.getDay() + 6) % 7)); // thứ Hai tuần sau
  return undefined;
}

function detectMinutes(text: string): number | undefined {
  const hours = text.match(/(\d+(?:[.,]\d+)?)\s*(tieng|gio|h)\b/);
  if (hours) return Math.round(Number(hours[1].replace(',', '.')) * 60);
  const minutes = text.match(/(\d+)\s*(phut|p|')(?![a-z])/);
  return minutes ? Number(minutes[1]) : undefined;
}

/** Lý do: phần sau "vì / do / lý do" trong câu gốc (giữ nguyên dấu). */
function detectReason(source: string): string {
  const match = source.match(/(?:^|\s)(?:vì|do|lý do(?: là)?|tại)\s+(.+)$/i);
  return match ? match[1].trim().replace(/[.。]+$/, '') : '';
}

export function parseRequest(source: string, now = new Date()): RequestDraft {
  const text = fold(source);
  const kind = detectKind(text);
  const detected = detectDate(text, now);
  // Mặc định theo loại: quên chấm công thường là hôm qua, đi muộn là hôm nay, nghỉ/WFH là ngày mai.
  const fallback = new Date(now);
  if (kind === 'missing') fallback.setDate(now.getDate() - 1);
  else if (kind === 'leave' || kind === 'wfh') fallback.setDate(now.getDate() + 1);

  const session: DaySession = /\b(buoi )?sang\b/.test(text) && !/ca ngay/.test(text) ? 'morning'
    : /\b(buoi )?chieu\b/.test(text) && !/ca ngay/.test(text) ? 'afternoon' : 'full';
  const dayCount = text.match(/(\d+(?:[.,]5)?)\s*ngay\b/);

  return {
    kind,
    date: toIsoDay(detected ?? fallback),
    session,
    days: dayCount ? Number(dayCount[1].replace(',', '.')) : 1,
    minutes: kind === 'late' ? detectMinutes(text) ?? 30 : undefined,
    direction: kind === 'late' ? (/ve som/.test(text) ? 'early' : 'late') : undefined,
    reason: detectReason(source),
    source: source.trim(),
  };
}

/** Số ngày phép bị trừ của một bản nháp nghỉ phép (nửa buổi = 0,5). */
export function leaveDeduction(draft: RequestDraft): number {
  if (draft.kind !== 'leave') return 0;
  return draft.session === 'full' ? draft.days : 0.5;
}
