import { matchPath } from 'react-router-dom';
import type { AiLevel, EventItem, Goal, NewsPost, Perspective } from '../types';

/**
 * Ask iKame scripted engine (Phase 2). NO LLM, NO free-text — every response below is
 * 100% authored copy. `ScriptCtx` carries LIVE counts/lists read from AppState so a
 * re-asked chip reflects the CURRENT state (RED TEAM F2) instead of reciting stale facts.
 */
export type ScriptCtx = {
  unackedMandatory: NewsPost[];
  registeredEvents: EventItem[];
  needsUpdateGoals: Goal[];
  /** Derived from the `event-response` attention item's open/resolved state. */
  unresponsiveCount: number;
  /** Full live events list — needed for S4 idempotent lookups by id. */
  events: EventItem[];
  pathname: string;
  /** Resolved from the `:postId` route param against the live news list, for S1. */
  currentNewsPost?: NewsPost;
};

export type Citation = { title: string; source: string; href: string };

export type AiScriptAction =
  | {
    kind: 'draft';
    draftText: (ctx: ScriptCtx) => string;
    confirmLabel: string;
    receipt: string;
    /** F2: no draft offered when there is nothing left to act on (e.g. item already resolved). */
    isApplicable: (ctx: ScriptCtx) => boolean;
  }
  | { kind: 'execute'; targetEventId: string; confirmLabel: string; receipt: string }
  | { kind: 'denied' };

export type AiScript = {
  id: string;
  chip: string;
  /** react-router patterns matched via matchPath; '*' = generic fallback (see scriptsForContext). */
  routes: string[];
  perspective?: Perspective;
  level: AiLevel;
  paragraphs: (ctx: ScriptCtx) => string[];
  citations?: (ctx: ScriptCtx) => Citation[];
  /** "Vì sao trả lời này?" — carries the explainability/feedback story (F11 — no thumbs buttons). */
  reason: string;
  action?: AiScriptAction;
};

const s1SummarizeArticle: AiScript = {
  id: 's1-summarize-article',
  chip: 'Tóm tắt bài này cho tôi',
  routes: ['/news/:postId'],
  level: 'A1',
  paragraphs: (ctx) => {
    if (!ctx.currentNewsPost) return ['Không tìm thấy nội dung bài viết này để tóm tắt.'];
    const { summary, body } = ctx.currentNewsPost;
    return [summary, ...body.slice(0, 2)].slice(0, 3);
  },
  citations: (ctx) => (ctx.currentNewsPost
    ? [{ title: ctx.currentNewsPost.title, source: 'Tin tức', href: `/news/${ctx.currentNewsPost.id}` }]
    : []),
  reason: 'Tóm tắt được trích trực tiếp từ nội dung bài viết đang mở, không suy diễn thêm ngoài phạm vi bài viết.',
};

const s2TodayDigest: AiScript = {
  id: 's2-today-digest',
  chip: 'Hôm nay tôi cần làm gì?',
  routes: ['/home'],
  level: 'A2',
  paragraphs: (ctx) => [
    ctx.unackedMandatory.length > 0
      ? `Còn ${ctx.unackedMandatory.length} tin bắt buộc chưa xác nhận: ${ctx.unackedMandatory.map((n) => n.title).join(', ')}.`
      : 'Bạn đã xác nhận đầy đủ tin bắt buộc — không có việc tồn đọng ở News.',
    ctx.registeredEvents.length > 0
      ? `Bạn đang đăng ký ${ctx.registeredEvents.length} sự kiện sắp tới: ${ctx.registeredEvents.map((e) => e.title).join(', ')}.`
      : 'Hiện bạn chưa đăng ký sự kiện sắp tới nào.',
    ctx.needsUpdateGoals.length > 0
      ? `${ctx.needsUpdateGoals.length} mục tiêu cần check-in: ${ctx.needsUpdateGoals.map((g) => g.title).join(', ')}.`
      : 'Không có mục tiêu nào cần cập nhật lúc này.',
  ],
  citations: (ctx) => {
    const citations: Citation[] = [];
    if (ctx.unackedMandatory[0]) citations.push({ title: ctx.unackedMandatory[0].title, source: 'News', href: `/news/${ctx.unackedMandatory[0].id}` });
    if (ctx.registeredEvents[0]) citations.push({ title: ctx.registeredEvents[0].title, source: 'Event', href: `/events/${ctx.registeredEvents[0].id}` });
    if (ctx.needsUpdateGoals[0]) citations.push({ title: ctx.needsUpdateGoals[0].title, source: 'iGoal', href: `/goals/${ctx.needsUpdateGoals[0].id}` });
    return citations;
  },
  reason: 'Tổng hợp ghép từ 3 nguồn bạn có quyền xem (News, Event, iGoal) tại đúng thời điểm bạn hỏi — không bỏ sót, không suy diễn thêm.',
};

const s2bFinanceBudgetDeny: AiScript = {
  id: 's2b-finance-budget-deny',
  chip: 'Ngân sách quý III của team Finance?',
  routes: [
    '/home', '/news', '/news/:postId', '/events', '/events/:eventId',
    '/knowledge', '/knowledge/:documentId', '/goals', '/goals/:goalId',
    '/manager/overview', '/manager/team',
  ],
  level: 'A2',
  paragraphs: () => [
    'Không đủ dữ liệu — bạn không có quyền truy cập nguồn này.',
    'Tài liệu ngân sách của team Finance được giới hạn theo team sở hữu; My iKame không tổng hợp hay suy diễn nội dung ngoài phạm vi quyền của bạn.',
  ],
  citations: () => [],
  action: { kind: 'denied' },
  reason: 'iKame kiểm tra quyền truy cập theo team sở hữu tài liệu trước khi trả lời — không có nội dung nào bị lộ ra, kể cả dưới dạng tóm tắt.',
};

const s3NudgeUnresponsive: AiScript = {
  id: 's3-nudge-unresponsive',
  chip: 'Soạn tin nhắc 3 người chưa phản hồi iConnect',
  routes: ['/manager/overview'],
  perspective: 'manager',
  level: 'A3',
  paragraphs: (ctx) => (ctx.unresponsiveCount > 0
    ? [
      `Còn ${ctx.unresponsiveCount} thành viên chưa phản hồi iConnect tháng 8: Hà, Tuấn và 1 thành viên khác.`,
      'iKame đã soạn sẵn một tin nhắc nhẹ nhàng — bạn xem lại và sửa trước khi gửi.',
    ]
    : ['Không còn thành viên nào cần nhắc — mục này đã được xử lý.']),
  citations: () => [{ title: '3 thành viên chưa phản hồi iConnect tháng 8', source: 'My iKame Event', href: '/manager/team' }],
  action: {
    kind: 'draft',
    isApplicable: (ctx) => ctx.unresponsiveCount > 0,
    draftText: () => 'Chào cả nhóm, mình thấy bạn chưa xác nhận tham gia iConnect tháng 8 (20/08). Bạn phản hồi giúp mình trước khi RSVP đóng nhé, để team chuẩn bị chỗ chính xác. Cảm ơn bạn!',
    confirmLabel: 'Duyệt & gửi',
    receipt: 'Đã gửi tới 3 người · #RCPT-xxxx · 2 kênh: chat + notification — item vẫn ở queue để bạn xác nhận đã xử lý.',
  },
  reason: 'Bản nhắc được soạn theo mẫu chuẩn của My iKame Event dựa trên danh sách chưa phản hồi hiện tại; bạn luôn duyệt nội dung trước khi gửi.',
};

const s4RegisterWorkshop: AiScript = {
  id: 's4-register-workshop',
  chip: 'Đăng ký workshop Product Builder with AI cho tôi',
  routes: ['/home', '/events', '/events/ai-product-workshop'],
  level: 'A4',
  paragraphs: (ctx) => {
    const event = ctx.events.find((e) => e.id === 'ai-product-workshop');
    if (!event) return ['Không tìm thấy thông tin sự kiện này.'];
    if (event.myRegistration === 'going') {
      return [`Bạn đã đăng ký "${event.title}" rồi — diễn ra ${event.dateLabel}, ${event.time} tại ${event.location}.`];
    }
    return [
      `"${event.title}" diễn ra ${event.dateLabel}, ${event.time} tại ${event.location} (${event.format}).`,
      `Còn ${event.remaining ?? 0}/${event.capacity ?? '—'} chỗ trống. iKame có thể đăng ký giúp bạn ngay.`,
    ];
  },
  citations: (ctx) => {
    const event = ctx.events.find((e) => e.id === 'ai-product-workshop');
    return event ? [{ title: event.title, source: 'Event', href: `/events/${event.id}` }] : [];
  },
  action: {
    kind: 'execute',
    targetEventId: 'ai-product-workshop',
    confirmLabel: 'Xác nhận đăng ký',
    receipt: 'Đã đăng ký thành công · #RCPT-xxxx',
  },
  reason: 'iKame chỉ thực thi hành động rủi ro thấp (đăng ký sự kiện công khai) sau khi bạn xác nhận rõ ràng; thay đổi hiện ngay trên trang Sự kiện.',
};

const fallbackCapabilities: AiScript = {
  id: 'fallback-capabilities',
  chip: 'My iKame làm được gì?',
  routes: ['*'],
  level: 'A2',
  paragraphs: () => [
    'My iKame đang ở giai đoạn Concept: trả lời bằng các câu hỏi dựng sẵn (chip), chưa xử lý văn bản tự do.',
    'Thang trưởng thành gồm 4 bậc: A1 Tóm tắt, A2 Xuyên nguồn, A3 Soạn thảo, A4 Thực thi — bạn vừa thấy ví dụ ở các bậc này qua các chip gợi ý.',
    'Nhập tự do (R4) sẽ mở khi nền tảng quyền truy cập và dữ liệu đã sẵn sàng.',
  ],
  citations: () => [],
  reason: 'Đây là mô tả về chính sản phẩm My iKame, không phải câu trả lời tổng hợp từ nguồn dữ liệu nào.',
};

const ALL_SCRIPTS: AiScript[] = [
  s1SummarizeArticle, s2TodayDigest, s2bFinanceBudgetDeny,
  s3NudgeUnresponsive, s4RegisterWorkshop, fallbackCapabilities,
];

function matchesRoute(script: AiScript, pathname: string): boolean {
  return script.routes.some((pattern) => pattern !== '*' && matchPath(pattern, pathname) !== null);
}

/**
 * (F7) Route/perspective-filtered suggested chips. '*' fallback scripts are appended
 * ONLY when no route-specific chip matched the current pathname.
 */
export function scriptsForContext(pathname: string, perspective: Perspective): AiScript[] {
  const eligible = ALL_SCRIPTS.filter((script) => !script.perspective || script.perspective === perspective);
  const specific = eligible.filter((script) => matchesRoute(script, pathname));
  if (specific.length > 0) return specific;
  return eligible.filter((script) => script.routes.includes('*'));
}

/** Resolves the `:postId` route param for S1's live-article lookup. */
export function matchNewsPostId(pathname: string): string | null {
  return matchPath('/news/:postId', pathname)?.params.postId ?? null;
}
