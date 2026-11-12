import { addDaysIso, dateLabel, todayIso } from '../../components/requests/request-context';
import { parseRequest } from '../../lib/request-parser';
import type { AgentMessage } from './agent-replies';
import { loadTasks, saveTasks } from '../../data/work-tasks';

/**
 * Hành động "làm việc thật" của Trợ lý: nhận ý định bằng luật (không LLM), dựng THẺ XEM TRƯỚC
 * có các trường sửa được, chỉ thực thi sau khi người dùng bấm "Xác nhận".
 *  - task    → tạo việc (lưu trong My iKame, chưa đồng bộ Asana)
 *  - meeting → tạo lịch họp kèm phòng (tải .ics để thêm vào lịch)
 *  - request → mở sẵn form Đề xuất (/requests?draft=...)
 *  - slack   → soạn tin Slack, sao chép để gửi
 * Phòng họp đã có luồng riêng trong agent-replies.ts ("đặt phòng") — giữ nguyên, không trùng.
 */
export type ActionKind = 'task' | 'meeting' | 'request' | 'slack';

export type CardField = {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'textarea' | 'date' | 'time' | 'select';
  options?: string[];
  half?: boolean;
};

export type CardResult = {
  summary: string;
  /** Liên kết đi tiếp trong app. */
  link?: { label: string; to: string };
  /** Slack: nội dung để sao chép. */
  copyText?: string;
  /** Lịch họp: dữ liệu dựng file .ics. */
  ics?: { title: string; startIso: string; endIso: string; location?: string };
};

export type ActionCard = {
  kind: ActionKind;
  title: string;
  confirmLabel: string;
  /** Tool MCP sẽ gọi khi bản thật nối vào — hiện trong receipt. */
  tool: string;
  steps: string[];
  fields: CardField[];
  status: 'preview' | 'editing' | 'done' | 'cancelled';
  result?: CardResult;
};

export type ActionCtx = { userName: string; managerName: string; perspective: string };

const ROOMS = ['Mercury · Tầng 6 · 8 chỗ', 'Venus · Tầng 5 · 4 chỗ', 'Jupiter · Tầng 6 · 20 chỗ', 'Không đặt phòng (họp online)'];
const upperFirst = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);
const DATE_WORDS = /\b(hôm nay|ngày mai|mai|ngày kia|thứ\s*(?:hai|ba|tư|năm|sáu|bảy|[2-7])|chủ nhật|tuần sau|tuần tới|\d{1,2}\/\d{1,2})(?=\s|$|[.,!?])/i;
const TRAILING_DATE = /\s*(?:[,;]\s*)?(?:hạn|trước|vào|deadline|lúc)?\s*(?:hôm nay|ngày mai|mai|ngày kia|thứ\s*(?:hai|ba|tư|năm|sáu|bảy|[2-7])|chủ nhật|tuần sau|tuần tới|\d{1,2}\/\d{1,2})\s*$/i;

/** Ngày được nhắc trong câu; không có thì dùng `fallback`. */
function dateIn(text: string, fallback: string): string {
  return DATE_WORDS.test(text) ? parseRequest(text).date : fallback;
}

function timeIn(text: string): string | undefined {
  const match = text.match(/\b(\d{1,2})\s*(?:h|:|giờ)\s*(\d{2})?(?!\d)/i);
  if (!match || Number(match[1]) > 23) return undefined;
  return `${String(match[1]).padStart(2, '0')}:${match[2] ?? '00'}`;
}

const addMinutes = (time: string, minutes: number) => {
  const [hour, min] = time.split(':').map(Number);
  const total = Math.min(23 * 60 + 59, hour * 60 + min + minutes);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

function message(text: string, card: ActionCard, sources: string[]): AgentMessage {
  return { role: 'assistant', text, card, sources, toolCalls: [card.tool] };
}

function taskCard(question: string, ctx: ActionCtx): AgentMessage {
  const raw = question.replace(/^\s*(?:hãy\s+)?(?:tạo|thêm|giao)\s+(?:cho tôi\s+)?(?:một\s+)?(?:việc|task|công việc)(?:\s+mới)?(?:\s+cho tôi)?\s*[:\-–]?\s*/i, '').replace(/^nhắc tôi\s*/i, '');
  const title = upperFirst(raw.replace(TRAILING_DATE, '').trim().replace(/[.。]+$/, '')) || 'Việc mới';
  const due = dateIn(question, addDaysIso(todayIso(), 1));
  const card: ActionCard = {
    kind: 'task', title: 'Tạo việc mới', confirmLabel: 'Tạo việc', tool: 'asana.create_task', status: 'preview',
    steps: ['Đã hiểu việc cần tạo', 'Đã đoán hạn xử lý từ câu của bạn', 'Chờ bạn xác nhận để tạo việc'],
    fields: [
      { id: 'title', label: 'Tên việc', value: title },
      { id: 'due', label: 'Hạn', value: due, type: 'date', half: true },
      { id: 'priority', label: 'Ưu tiên', value: 'Trung bình', type: 'select', options: ['Cao', 'Trung bình', 'Thấp'], half: true },
      { id: 'assignee', label: 'Người thực hiện', value: ctx.userName, half: true },
      { id: 'project', label: 'Dự án', value: 'Việc cá nhân', type: 'select', options: ['Việc cá nhân', 'Product', 'Onboarding'], half: true },
    ],
  };
  return message('Mình đã soạn sẵn việc này. Kiểm tra rồi xác nhận để tạo nhé.', card, ['Asana']);
}

function meetingCard(question: string, ctx: ActionCtx): AgentMessage {
  const start = timeIn(question) ?? '14:00';
  const withMatch = question.match(/\bvới\s+(.+?)(?:\s+(?:lúc|vào|ngày|mai|hôm nay|kèm)\b|\s*\d{1,2}\s*(?:h|:|giờ)|$)/i);
  const quarter = /quản lý|sếp/i.test(withMatch?.[1] ?? '') ? ctx.managerName : withMatch?.[1]?.trim();
  const topic = question.match(/(?:họp|meeting)\s+(?!1-1)([^\d:]+?)(?:\s+\d|\s+(?:lúc|vào|mai|hôm nay|kèm)\b|$)/i)?.[1]?.trim();
  const title = quarter ? `Họp 1-1 với ${quarter}` : topic && topic.length > 2 ? upperFirst(topic) : 'Cuộc họp mới';
  const card: ActionCard = {
    kind: 'meeting', title: 'Tạo lịch họp kèm phòng', confirmLabel: 'Tạo lịch & giữ phòng', tool: 'calendar.create_event', status: 'preview',
    steps: ['Đã đọc ngày giờ từ câu của bạn', 'Đã kiểm tra phòng trống khung giờ này', 'Chờ bạn xác nhận để tạo lịch'],
    fields: [
      { id: 'title', label: 'Tiêu đề', value: title },
      { id: 'date', label: 'Ngày', value: dateIn(question, todayIso()), type: 'date', half: true },
      { id: 'start', label: 'Bắt đầu', value: start, type: 'time', half: true },
      { id: 'end', label: 'Kết thúc', value: addMinutes(start, /1-1/.test(question) ? 30 : 60), type: 'time', half: true },
      { id: 'room', label: 'Phòng họp (đang trống)', value: ROOMS[0], type: 'select', options: ROOMS, half: true },
      { id: 'guests', label: 'Khách mời', value: quarter ?? `${ctx.userName} + team` },
    ],
  };
  return message('Mình đã chọn khung giờ và phòng còn trống. Bạn xem lại rồi xác nhận để tạo lịch nhé.', card, ['Lịch Google', 'Phòng họp']);
}

function requestCard(question: string): AgentMessage {
  const rest = question.replace(/^\s*(?:hãy\s+)?(?:mở sẵn|mở|soạn|tạo)\s+(?:sẵn\s+)?(?:form\s+)?(?:đề xuất|đơn)\s*/i, '').trim();
  const sentence = upperFirst(rest) || 'Xin nghỉ phép';
  const card: ActionCard = {
    kind: 'request', title: 'Mở sẵn form đề xuất', confirmLabel: 'Mở form đề xuất', tool: 'irequest.open_draft', status: 'preview',
    steps: ['Đã hiểu loại đề xuất', 'Đã điền sẵn ngày, buổi và lý do nếu có', 'Chờ bạn xác nhận để mở form'],
    fields: [{ id: 'sentence', label: 'Nội dung đề xuất', value: sentence, type: 'textarea' }],
  };
  return message('Mình sẽ mở form Đề xuất với nội dung điền sẵn — bạn chỉnh lại và gửi ở đó, mình không gửi thay bạn.', card, ['iRequest']);
}

function slackCard(question: string, ctx: ActionCtx): AgentMessage {
  const channel = question.match(/kênh\s+(#?[\w-]+)/i)?.[1];
  const person = question.match(/\b(?:cho|tới|gửi)\s+([^:,]+?)(?:\s+(?:về|rằng|nhắc|thông báo)\b|\s*:|$)/i)?.[1]?.trim();
  const to = channel ? (channel.startsWith('#') ? channel : `#${channel}`) : person && !/slack|tin/i.test(person) ? person : '#team-product';
  const topic = question.match(/(?:về|rằng|nhắc|thông báo|:)\s*(.+)$/i)?.[1]?.trim().replace(/[.。]+$/, '') ?? question.replace(/^\s*soạn\s+tin(?:\s+nhắn)?(?:\s+slack)?\s*/i, '').trim();
  const body = `Chào ${to.startsWith('#') ? 'cả nhà' : to},\n\n${upperFirst(topic) || 'Mình có một thông báo nhỏ'}.\n\nNhờ mọi người xem giúp mình, có gì vướng cứ nhắn lại nhé. Cảm ơn!\n— ${ctx.userName}`;
  const card: ActionCard = {
    kind: 'slack', title: 'Soạn tin Slack', confirmLabel: 'Chốt bản nháp', tool: 'slack.draft_message', status: 'preview',
    steps: ['Đã hiểu nội dung cần nhắn', 'Đã soạn bản nháp theo giọng thân thiện', 'Chờ bạn chốt để sao chép'],
    fields: [
      { id: 'to', label: 'Gửi tới', value: to },
      { id: 'text', label: 'Nội dung', value: body, type: 'textarea' },
    ],
  };
  return message('Mình soạn sẵn tin Slack rồi. Bạn sửa nếu cần, chốt xong bấm sao chép để gửi — mình không tự gửi.', card, ['Slack']);
}

/** Trả về tin trả lời có thẻ hành động nếu câu hỏi khớp một ý định; không khớp → null (dùng engine cũ). */
export function detectActionCard(question: string, ctx: ActionCtx): AgentMessage | null {
  const q = question.toLowerCase();
  if (/đặt phòng|phòng họp|booking/.test(q)) return null;
  if (ctx.perspective === 'manager' && /check-in/.test(q)) return null;
  if (/(?:tạo|thêm|giao)\s+(?:cho tôi\s+)?(?:một\s+)?(?:việc|task|công việc)\b|^\s*nhắc tôi\b/.test(q)) return taskCard(question, ctx);
  if (/(?:mở|soạn|tạo)\s+(?:sẵn\s+)?(?:form\s+)?đề xuất|cấp tài khoản/.test(q)) {
    return requestCard(question);
  }
  if (/(?:tạo|đặt|lên|sắp)\s+(?:cho tôi\s+)?(?:lịch\s+)?(?:họp|cuộc họp|meeting)|họp 1-1/.test(q)) return meetingCard(question, ctx);
  if (/slack/.test(q) && /soạn|viết|nhắn|gửi|draft/.test(q)) return slackCard(question, ctx);
  return null;
}

const fieldOf = (card: ActionCard, id: string) => card.fields.find((field) => field.id === id)?.value ?? '';

/** Thực thi thẻ đã xác nhận. Việc/lịch/slack chạy cục bộ (demo); request chỉ trả đường dẫn để điều hướng. */
export function executeCard(card: ActionCard): CardResult {
  switch (card.kind) {
    case 'task': {
      const task = { id: `t-${Date.now().toString(36)}`, title: fieldOf(card, 'title'), due: fieldOf(card, 'due'), priority: fieldOf(card, 'priority'), assignee: fieldOf(card, 'assignee'), project: fieldOf(card, 'project') };
      // Ghi thẳng vào danh sách của trang Công việc để việc vừa tạo hiện ở đó.
      saveTasks([{ id: task.id, title: task.title, project: task.project || 'My iKame', due: /^\d{4}-\d{2}-\d{2}$/.test(task.due) ? task.due : undefined, notes: `Tạo từ Trợ lý · ưu tiên ${task.priority.toLowerCase()}`, subtasks: [], done: false }, ...loadTasks()]);
      return { summary: `Đã tạo việc "${task.title}" · hạn ${task.due ? dateLabel(task.due) : 'chưa đặt'} · ưu tiên ${task.priority.toLowerCase()}.` };
    }
    case 'meeting': {
      const date = fieldOf(card, 'date');
      const room = fieldOf(card, 'room');
      return {
        summary: `Đã tạo lịch "${fieldOf(card, 'title')}" ngày ${date ? dateLabel(date) : ''} ${fieldOf(card, 'start')}–${fieldOf(card, 'end')} · ${room}.`,
        ics: { title: fieldOf(card, 'title'), startIso: `${date}T${fieldOf(card, 'start')}:00`, endIso: `${date}T${fieldOf(card, 'end')}:00`, location: room.startsWith('Không') ? undefined : room },
      };
    }
    case 'request':
      return { summary: 'Đã mở sẵn form Đề xuất — bạn kiểm tra và gửi ở đó.', link: { label: 'Mở form đề xuất', to: `/requests?draft=${encodeURIComponent(fieldOf(card, 'sentence'))}` } };
    case 'slack':
      return { summary: `Bản nháp gửi ${fieldOf(card, 'to')} đã sẵn sàng. Sao chép rồi dán vào Slack.`, copyText: fieldOf(card, 'text') };
  }
}
