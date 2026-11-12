import { parseRequest, REQUEST_KIND_LABEL, type DaySession, type RequestDraft, type RequestKind } from '../../lib/request-parser';
import type { RequestType } from '../../types';
import { addDaysIso, dateLabel, dayCount, endAfterWorkdays, isWorkday, leaveDaysOf, rangeLabel, todayIso } from './request-context';

/** Mô hình form đề xuất: dựng từ câu đã đọc (parser) hoặc từ thẻ "Đề xuất nhanh". */
export type FormKind = Exclude<RequestKind, 'unknown'>;

export type FormState = {
  kind: RequestKind;
  start: string;
  end: string;
  session: DaySession;
  reason: string;
  direction: 'late' | 'early';
  minutes: number;
  /** Mô tả cho đề xuất IT / thiết bị / hành chính. */
  source: string;
  /** Cấp tài khoản: danh sách công cụ cần cấp (rỗng = chưa chọn / không phải cấp tài khoản). */
  accounts: string[];
  accountMode: boolean;
  /** Làm từ xa hay đi công tác. */
  wfhMode: 'remote' | 'trip';
};

export const SESSION_LABEL: Record<DaySession, string> = { full: 'Cả ngày', morning: 'Sáng', afternoon: 'Chiều' };
export const ACCOUNT_TOOLS = ['Google', 'Slack', 'Figma', 'Jira', 'GitHub', 'Notion'];
export const REASON_CHIPS = ['Việc gia đình', 'Khám sức khoẻ', 'Nghỉ ngơi', 'Việc cá nhân'];
export const FORM_KINDS: FormKind[] = ['leave', 'wfh', 'late', 'missing', 'it', 'equipment', 'admin'];

/** Loại đề xuất → nhóm request hiện có, nơi xử lý, hạn xử lý, quy định tóm tắt (nội dung mẫu). */
export const KIND_META: Record<FormKind, { type: RequestType; handler?: string; sla: string; policy: string; desc: string }> = {
  leave: { type: 'Nhân sự', desc: 'Phép năm, nghỉ nửa buổi', sla: 'Quản lý duyệt trong 1 ngày làm việc', policy: 'Nghỉ phép năm cần báo trước 1 ngày làm việc; nghỉ nửa buổi trừ 0,5 ngày phép.' },
  wfh: { type: 'Chấm công', desc: 'Làm ở nhà hoặc đi công tác', sla: 'Quản lý duyệt trước ngày làm từ xa', policy: 'Làm việc từ xa cần quản lý trực tiếp duyệt trước và vẫn chấm công như ngày thường.' },
  late: { type: 'Chấm công', desc: 'Không bị tính muộn trong tháng', sla: 'Quản lý duyệt trong ngày', policy: 'Đi muộn hoặc về sớm có đơn được duyệt thì không tính vào số buổi muộn trong tháng.' },
  missing: { type: 'Chấm công', desc: 'Quên chấm công trong 3 ngày', sla: 'Quản lý duyệt trong 2 ngày làm việc', policy: 'Bổ sung chấm công cần gửi trong vòng 3 ngày làm việc kể từ ngày quên chấm.' },
  it: { type: 'IT support', handler: 'IT Helpdesk', desc: 'Sự cố, phần mềm, tài khoản', sla: 'Phản hồi trong 4 giờ làm việc', policy: 'Sự cố chặn công việc được ưu tiên xử lý trong ngày.' },
  equipment: { type: 'Thiết bị', handler: 'IT Platform', desc: 'Cấp mới, đổi, mượn thiết bị', sla: 'Phản hồi trong 2 ngày làm việc', policy: 'Cấp mới hoặc đổi thiết bị cần quản lý trực tiếp xác nhận nhu cầu.' },
  admin: { type: 'Hành chính', handler: 'Hành chính', desc: 'Chỗ ngồi, gửi xe, văn phòng phẩm', sla: 'Phản hồi trong 1 ngày làm việc', policy: 'Yêu cầu hành chính được xử lý theo thứ tự tiếp nhận.' },
};

export const usesDates = (kind: RequestKind) => kind === 'leave' || kind === 'wfh' || kind === 'late' || kind === 'missing';
export const hasHalfDay = (kind: RequestKind) => kind === 'leave' || kind === 'wfh';

/** Ngày làm việc kế tiếp kể từ `iso` (kể cả chính nó). */
function nextWorkday(iso: string): string {
  let cursor = iso;
  for (let guard = 0; guard < 14 && !isWorkday(cursor); guard += 1) cursor = addDaysIso(cursor, 1);
  return cursor;
}

export function blankState(kind: RequestKind): FormState {
  const today = todayIso();
  const date = kind === 'missing' ? addDaysIso(today, -1) : kind === 'late' ? today : nextWorkday(addDaysIso(today, 1));
  return { kind, start: date, end: date, session: 'full', reason: '', direction: 'late', minutes: 30, source: '', accounts: [], accountMode: false, wfhMode: 'remote' };
}

export function stateFromDraft(draft: RequestDraft): FormState {
  const base = blankState(draft.kind);
  const end = draft.kind === 'leave' && draft.session === 'full' && draft.days > 1 ? endAfterWorkdays(draft.date, draft.days) : draft.date;
  return {
    ...base,
    start: draft.date,
    end,
    session: draft.session,
    reason: draft.reason,
    direction: draft.direction ?? 'late',
    minutes: draft.minutes ?? 30,
    source: draft.kind === 'unknown' || !usesDates(draft.kind) ? draft.source : '',
  };
}

/** Câu tự nhiên (từ ô nhập hoặc `?draft=` do Trợ lý mở sẵn) → form. */
export function stateFromSentence(sentence: string): FormState {
  const state = stateFromDraft(parseRequest(sentence));
  // "Xin cấp tài khoản Slack, Figma" → chế độ cấp tài khoản, tick sẵn công cụ được nhắc.
  if (state.kind === 'it' && /tài khoản/i.test(sentence)) {
    const lower = sentence.toLowerCase();
    return { ...state, accountMode: true, accounts: ACCOUNT_TOOLS.filter((tool) => lower.includes(tool.toLowerCase())), source: '' };
  }
  return state;
}

export function accountState(): FormState {
  return { ...blankState('it'), accountMode: true, accounts: ['Google'] };
}

/** Tiêu đề đơn, ví dụ "Xin nghỉ phép · 2 ngày 12/11 – 13/11" hoặc "Xin nghỉ phép · Sáng 12/11/2026". */
export function titleOf(state: FormState): string {
  const label = REQUEST_KIND_LABEL[state.kind];
  switch (state.kind) {
    case 'leave': {
      if (state.session !== 'full') return `${label} · ${SESSION_LABEL[state.session]} ${dateLabel(state.start)}`;
      const days = leaveDaysOf(state.start, state.end, 'full');
      return `${label} · ${dayCount(days)} ngày ${rangeLabel(state.start, state.end)}`;
    }
    case 'wfh':
      return `${state.wfhMode === 'trip' ? 'Đi công tác' : label} · ${state.session === 'full' ? 'Cả ngày' : SESSION_LABEL[state.session]} ${dateLabel(state.start)}`;
    case 'late':
      return `${state.direction === 'early' ? 'Xin về sớm' : 'Xin đi muộn'} ${state.minutes} phút · ${dateLabel(state.start)}`;
    case 'missing':
      return `${label} · ${dateLabel(state.start)}`;
    default:
      if (state.accountMode) return `Cấp tài khoản: ${state.accounts.join(', ') || 'chưa chọn'}`;
      return `${label}: ${state.source}`;
  }
}
