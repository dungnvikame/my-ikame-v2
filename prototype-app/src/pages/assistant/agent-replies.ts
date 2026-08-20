import type {
  ApprovalItem, AttentionItem, EventItem, Goal, KnowledgeDoc, LeaveBalance,
  MemberEksStat, NewsPost, Perspective, RequestType, User,
} from '../../types';

/**
 * Trợ lý AI page — keyword-routed intent engine over LIVE mock data.
 * Không LLM: mọi câu trả lời là kịch bản dựng sẵn nhưng đọc số liệu thật từ
 * AppState nên không nói sai trạng thái.
 *
 * `workspace` là GIAO DIỆN NGHIỆP VỤ hiển thị ở khung phải, đúng loại tác vụ:
 * - form   → form thao tác chỉnh sửa được (đặt phòng họp, ticket IT)
 * - editor → trình soạn thảo tài liệu (viết bài iWiki)
 * - okr    → trình tạo báo cáo check-in OKR (gửi THẬT qua submitReport)
 * - info   → thẻ thông tin read-only (nghỉ phép, xác nhận tin bắt buộc)
 */
export type AgentAction =
  | { kind: 'ack-news'; targetId: string; label: string; receipt: string }
  | {
    kind: 'confirm';
    label: string;
    receipt: string;
    commit?: 'report' | 'request';
    /** commit 'request' → addRequest thật vào iRequest center. */
    request?: { type: RequestType; title: string; slaLabel?: string; handlerLabel?: string };
  };

export type WorkspaceField = { label: string; value: string; multiline?: boolean };

export type FormFieldSpec = {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select';
  options?: string[];
  /** true → chiếm nửa hàng (xếp 2 cột) */
  half?: boolean;
};

export type EditorBlock = { type: 'h2' | 'p' | 'ul'; text?: string; items?: string[] };

type WorkspaceBase = { breadcrumb: string; title: string; badge?: string; steps: string[] };

export type AgentWorkspace =
  | (WorkspaceBase & { kind: 'info'; fields: WorkspaceField[] })
  | (WorkspaceBase & { kind: 'form'; formFields: FormFieldSpec[] })
  | (WorkspaceBase & { kind: 'editor'; docTitle: string; blocks: EditorBlock[] })
  | (WorkspaceBase & {
    kind: 'okr';
    goalId: string;
    goalTitle: string;
    progressBefore: number;
    suggestedProgress: number;
    periodLabel: string;
    draftContent: string;
  });

export type AgentMessage = {
  role: 'user' | 'assistant';
  text: string;
  links?: { label: string; to: string }[];
  action?: AgentAction;
  workspace?: AgentWorkspace;
};

export type AgentCtx = {
  user: User;
  news: NewsPost[];
  events: EventItem[];
  goals: Goal[];
  knowledgeDocs: KnowledgeDoc[];
  leaveBalance: LeaveBalance;
  // Manager scope — dùng cho các intent quản lý (chỉ khi perspective = 'manager').
  perspective: Perspective;
  attention: AttentionItem[];
  memberEksStats: MemberEksStat[];
  approvals: ApprovalItem[];
};

const MEETING_ROOMS = [
  'Mercury · Tầng 6 · 8 chỗ · TV trình chiếu',
  'Venus · Tầng 5 · 4 chỗ · màn hình 27"',
  'Jupiter · Tầng 6 · 20 chỗ · hội trường nhỏ',
];

const IT_CATEGORIES = ['Mạng & WiFi', 'Thiết bị / phần cứng', 'Phần mềm & license', 'Tài khoản & truy cập'];
const IT_PRIORITIES = ['1 — Cao (ảnh hưởng công việc ngay)', '2 — Trung bình', '3 — Thấp'];

/** Phân loại ticket từ mô tả — đúng nghiệp vụ helpdesk thay vì gán cứng một loại. */
function classifyItRequest(q: string): string {
  if (/wifi|mạng|internet|vpn/.test(q)) return IT_CATEGORIES[0];
  if (/phần mềm|cài đặt|license|figma|slack/.test(q)) return IT_CATEGORIES[2];
  if (/mật khẩu|tài khoản|đăng nhập|truy cập|quyền/.test(q)) return IT_CATEGORIES[3];
  return IT_CATEGORIES[1];
}

/** "Viết bài iWiki về quy trình onboarding..." → "Quy trình onboarding..." */
function extractDocTitle(question: string): string {
  const stripped = question.trim()
    .replace(/^(viết bài|soạn tài liệu|viết|soạn)\s+/i, '')
    .replace(/^(trên\s+)?i?wiki\s+/i, '')
    .replace(/^(về|cho|hướng dẫn)\s+/i, '')
    .trim();
  if (!stripped) return 'Tài liệu mới';
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

const GOAL_STATUS_SHORT: Record<Goal['status'], string> = {
  needs_update: 'Trễ check-in',
  on_track: 'Đúng tiến độ',
  at_risk: 'Có rủi ro',
  done: 'Hoàn thành',
};

/** Các intent quản lý — chỉ chạy ở góc nhìn manager, đặt TRƯỚC intent cá nhân
 * vì regex giao nhau (check-in, OKR, duyệt). */
function buildManagerReply(q: string, ctx: AgentCtx): AgentMessage | null {
  if (ctx.perspective !== 'manager') return null;

  if (/team.*chú ý|chú ý.*team|tình hình team/.test(q)) {
    const scoped = ctx.attention.filter((item) => item.teamId === ctx.user.teamId && item.state === 'open');
    const openApprovals = ctx.approvals.filter((item) => item.state === 'open').length;
    if (scoped.length === 0 && openApprovals === 0) {
      return { role: 'assistant', text: 'Team của bạn đang sạch việc tồn đọng — không có mục cần chú ý hay đơn chờ duyệt nào. 🎉' };
    }
    return {
      role: 'assistant',
      text: `Team ${ctx.user.team} đang có ${scoped.length} việc cần chú ý${openApprovals > 0 ? ` và ${openApprovals} đơn chờ bạn duyệt` : ''}. Chi tiết ở khung bên phải — mở Tổng quan để xử lý từng mục.`,
      links: [{ label: 'Mở Tổng quan để xử lý', to: '/manager/overview' }],
      workspace: {
        kind: 'info',
        breadcrumb: 'Manager / Tình hình team',
        title: `Việc cần chú ý · ${ctx.user.team}`,
        badge: `${scoped.length + openApprovals} mục`,
        fields: [
          ...scoped.map((item) => ({
            label: `${item.severity === 'critical' ? 'Nghiêm trọng' : 'Cần xử lý'} · ${item.source} · ${item.freshness}`,
            value: `${item.title} — ${item.people}`,
          })),
          ...(openApprovals > 0 ? [{ label: 'Hàng đợi duyệt', value: `${openApprovals} đơn từ thành viên đang chờ quyết định của bạn` }] : []),
        ],
        steps: [
          'Đã quét iGoal · Event · HRIS trong scope team',
          'Đã xếp hạng theo mức nghiêm trọng và hạn xử lý',
          'Đã gộp hàng đợi duyệt vào bức tranh chung',
        ],
      },
    };
  }

  if (/nhắc.*check-in|check-in.*nhắc|soạn tin nhắn nhắc/.test(q)) {
    const behind = ctx.memberEksStats.filter((member) => member.eksStatus === 'needs_update' || member.eksStatus === 'at_risk');
    if (behind.length === 0) return { role: 'assistant', text: 'Cả team đã check-in đầy đủ — không ai cần nhắc cả. 🎉' };
    const names = behind.map((member) => member.name).join(', ');
    return {
      role: 'assistant',
      text: `Có ${behind.length} thành viên trễ nhịp check-in (${names}). Mình đã soạn sẵn lời nhắc thân thiện — bạn sửa lại giọng điệu nếu muốn rồi gửi.`,
      action: { kind: 'confirm', label: `Gửi lời nhắc tới ${behind.length} thành viên`, receipt: 'Đã gửi lời nhắc qua Slack DM. Mình sẽ báo bạn khi từng người hoàn tất check-in.' },
      workspace: {
        kind: 'form',
        breadcrumb: 'Manager / Nhắc check-in',
        title: 'Soạn lời nhắc check-in',
        badge: `${behind.length} người nhận`,
        formFields: [
          { id: 'to', label: 'Người nhận', value: names },
          { id: 'channel', label: 'Kênh gửi', value: 'Slack DM (từng người)', type: 'select', options: ['Slack DM (từng người)', 'Email', 'Slack channel team'], half: true },
          { id: 'when', label: 'Thời điểm gửi', value: 'Ngay bây giờ', type: 'select', options: ['Ngay bây giờ', '09:00 sáng mai'], half: true },
          {
            id: 'message', label: 'Nội dung (AI soạn — bạn hiệu chỉnh)', type: 'textarea',
            value: `Chào bạn, tuần 33 sắp khép lại mà check-in EKS của bạn chưa được cập nhật. Bạn dành 5 phút cập nhật tiến độ trên My iKame nhé — có vướng mắc gì cứ nhắn mình trực tiếp. Cảm ơn bạn!`,
          },
        ],
        steps: [
          'Đã lọc thành viên trễ check-in từ iGoal',
          `Đã tìm thấy ${behind.length} người: ${names}`,
          'Đã soạn lời nhắc theo giọng hỗ trợ, không tạo áp lực',
          'Chờ bạn duyệt để gửi',
        ],
      },
    };
  }

  if (/(okr|tiến độ|mục tiêu).*(team|đội)|((team|đội).*(okr|tiến độ))/.test(q)) {
    const stats = ctx.memberEksStats;
    const average = Math.round(stats.reduce((sum, member) => sum + member.eksProgress, 0) / Math.max(stats.length, 1));
    const behind = stats.filter((member) => member.eksStatus === 'needs_update' || member.eksStatus === 'at_risk').length;
    return {
      role: 'assistant',
      text: `Tiến độ EKS trung bình của team là ${average}%, có ${behind}/${stats.length} thành viên cần theo sát. Bảng chi tiết ở khung bên phải.`,
      links: [{ label: 'Mở OKR team đầy đủ', to: '/goals' }],
      workspace: {
        kind: 'info',
        breadcrumb: 'Manager / OKR team',
        title: `Tiến độ EKS · ${ctx.user.team}`,
        badge: `TB ${average}%`,
        fields: stats.map((member) => ({
          label: `${member.role} · ${member.reportsSubmitted}/${member.reportsExpected} báo cáo · check-in ${member.lastCheckInLabel}`,
          value: `${member.name} — ${member.eksProgress}% (${GOAL_STATUS_SHORT[member.eksStatus]})`,
        })),
        steps: [
          'Đã tổng hợp EKS của từng thành viên từ iGoal',
          'Đã đối chiếu nhịp báo cáo tuần (6 kỳ gần nhất)',
          `Đã đánh dấu ${behind} thành viên cần theo sát`,
        ],
      },
    };
  }

  if (/chờ duyệt|duyệt đơn|đơn nào/.test(q)) {
    const open = ctx.approvals.filter((item) => item.state === 'open');
    if (open.length === 0) return { role: 'assistant', text: 'Không còn đơn nào chờ duyệt. Hàng đợi của bạn đang sạch!' };
    return {
      role: 'assistant',
      text: `Bạn có ${open.length} đơn chờ duyệt. Xem tóm tắt bên phải — bấm Duyệt/Từ chối ngay trên trang Tổng quan.`,
      links: [{ label: 'Mở hàng đợi duyệt trên Tổng quan', to: '/manager/overview' }],
      workspace: {
        kind: 'info',
        breadcrumb: 'Manager / Hàng đợi duyệt',
        title: 'Đơn chờ bạn quyết định',
        badge: `${open.length} đơn`,
        fields: open.map((item) => ({
          label: `${item.kind} · ${item.memberName} · ${item.submittedAtLabel}`,
          value: `${item.title} — ${item.detail}`,
        })),
        steps: [
          'Đã gom đơn từ iRequest trong scope team',
          'Đã kiểm tra tính hợp lệ (số dư phép, chính sách cấp phát)',
          'Chờ bạn quyết định trên Tổng quan',
        ],
      },
    };
  }

  return null;
}

export function buildAgentReply(question: string, ctx: AgentCtx): AgentMessage {
  const q = question.toLowerCase();

  const managerReply = buildManagerReply(q, ctx);
  if (managerReply) return managerReply;

  if (/đặt phòng|phòng họp|booking/.test(q)) {
    return {
      role: 'assistant',
      text: 'Mình đã kiểm tra lịch phòng và điền sẵn form đặt phòng theo yêu cầu của bạn — phòng Mercury tầng 6 đang trống khung 14:00. Bạn chỉnh lại nếu cần rồi xác nhận nhé.',
      action: { kind: 'confirm', label: 'Đặt phòng & gửi lời mời', receipt: 'Đã đặt phòng và gửi lời mời lịch tới người tham dự. Phòng sẽ tự hủy nếu không check-in sau 15 phút.' },
      workspace: {
        kind: 'form',
        breadcrumb: 'Workplace / Đặt phòng họp',
        title: 'Đặt phòng họp',
        badge: 'Bản nháp',
        formFields: [
          { id: 'title', label: 'Tiêu đề cuộc họp', value: 'Họp nhóm Product — sync tuần' },
          { id: 'date', label: 'Ngày', value: '2026-08-13', type: 'date', half: true },
          { id: 'start', label: 'Bắt đầu', value: '14:00', type: 'time', half: true },
          { id: 'end', label: 'Kết thúc', value: '15:00', type: 'time', half: true },
          { id: 'attendees', label: 'Số người tham dự', value: '6', type: 'number', half: true },
          { id: 'room', label: 'Phòng họp (đang trống khung giờ này)', value: MEETING_ROOMS[0], type: 'select', options: MEETING_ROOMS },
          { id: 'guests', label: 'Khách mời', value: `${ctx.user.name} + Team Product (5 người)` },
          { id: 'note', label: 'Ghi chú', value: question, type: 'textarea' },
        ],
        steps: [
          'Đã kiểm tra lịch 6 phòng họp tầng 5–6',
          'Đã lọc phòng đủ 6 chỗ, có TV trình chiếu',
          'Đã điền sẵn form với khung giờ trống 14:00',
          'Chờ bạn xác nhận để giữ phòng & gửi lời mời',
        ],
      },
    };
  }

  if (/đơn nghỉ|xin nghỉ|tạo đơn.*nghỉ/.test(q)) {
    return {
      role: 'assistant',
      text: `Mình đã soạn đơn nghỉ phép — bạn còn ${ctx.leaveBalance.annualRemaining} ngày phép năm nên đơn này hợp lệ. Kiểm tra form rồi gửi, đơn sẽ chuyển tới quản lý trực tiếp duyệt.`,
      links: [{ label: 'Theo dõi request của tôi', to: '/requests' }],
      action: {
        kind: 'confirm', label: 'Gửi đơn nghỉ phép',
        receipt: 'Đơn nghỉ phép đã gửi tới quản lý trực tiếp — theo dõi trạng thái tại iRequest.',
        commit: 'request',
        request: { type: 'Nhân sự', title: 'Đơn nghỉ phép 2 ngày (21–22/08)', slaLabel: 'Quản lý duyệt trong 1 ngày', handlerLabel: 'Trần Thanh Mai' },
      },
      workspace: {
        kind: 'form',
        breadcrumb: 'iRequest / Nhân sự',
        title: 'Đơn nghỉ phép',
        badge: 'Chưa gửi',
        formFields: [
          { id: 'leave-type', label: 'Loại nghỉ', value: 'Nghỉ phép năm (còn 7 ngày)', type: 'select', options: ['Nghỉ phép năm (còn 7 ngày)', 'Nghỉ ốm', 'Nghỉ không lương'] },
          { id: 'from', label: 'Từ ngày', value: '2026-08-21', type: 'date', half: true },
          { id: 'to', label: 'Đến ngày', value: '2026-08-22', type: 'date', half: true },
          { id: 'reason', label: 'Lý do', value: 'Việc gia đình', type: 'textarea' },
          { id: 'handover', label: 'Bàn giao công việc cho', value: 'Lan Nguyễn · Product Designer' },
        ],
        steps: [
          'Đã kiểm tra số dư phép năm (7/12 ngày)',
          'Đã đối chiếu lịch sprint — không trùng deadline',
          'Đã điền sẵn đơn theo yêu cầu của bạn',
          'Chờ bạn xác nhận để gửi quản lý duyệt',
        ],
      },
    };
  }

  if (/xin cấp|cấp thêm|mượn thiết bị/.test(q)) {
    return {
      role: 'assistant',
      text: 'Mình đã soạn request cấp thiết bị. Yêu cầu này cần quản lý duyệt trước khi IT Assets xử lý — kiểm tra form rồi gửi nhé.',
      links: [{ label: 'Theo dõi request của tôi', to: '/requests' }],
      action: {
        kind: 'confirm', label: 'Gửi request cấp thiết bị',
        receipt: 'Request đã gửi — chờ quản lý duyệt, sau đó IT Assets sẽ liên hệ hẹn ngày nhận. Theo dõi tại iRequest.',
        commit: 'request',
        request: { type: 'Thiết bị', title: question.length > 70 ? `${question.slice(0, 70)}…` : question, slaLabel: 'Chờ quản lý duyệt', handlerLabel: 'IT Assets' },
      },
      workspace: {
        kind: 'form',
        breadcrumb: 'iRequest / Thiết bị',
        title: 'Request cấp thiết bị',
        badge: 'Chưa gửi',
        formFields: [
          { id: 'device', label: 'Thiết bị đề nghị', value: 'Màn hình phụ 27" (Dell U2723QE hoặc tương đương)' },
          { id: 'reason', label: 'Lý do / mục đích', value: question, type: 'textarea' },
          { id: 'current', label: 'Thiết bị hiện có', value: '1 màn hình Dell U2723QE · IK-2306-0143', half: true },
          { id: 'approver', label: 'Người duyệt', value: 'Trần Thanh Mai · Quản lý trực tiếp', half: true },
        ],
        steps: [
          'Đã tra danh sách thiết bị đang được cấp của bạn',
          'Đã kiểm tra chính sách cấp phát (đủ điều kiện màn hình thứ 2)',
          'Đã định tuyến: quản lý duyệt → IT Assets',
          'Chờ bạn xác nhận để gửi request',
        ],
      },
    };
  }

  if (/hành chính|gửi xe|chỗ ngồi|văn phòng phẩm/.test(q)) {
    return {
      role: 'assistant',
      text: 'Mình đã soạn request hành chính gửi Office Operations — kiểm tra thông tin rồi gửi nhé.',
      links: [{ label: 'Theo dõi request của tôi', to: '/requests' }],
      action: {
        kind: 'confirm', label: 'Gửi request hành chính',
        receipt: 'Request đã gửi tới Office Operations — theo dõi trạng thái tại iRequest.',
        commit: 'request',
        request: { type: 'Hành chính', title: question.length > 70 ? `${question.slice(0, 70)}…` : question, slaLabel: 'Phản hồi trong 2 ngày làm việc', handlerLabel: 'Office Operations' },
      },
      workspace: {
        kind: 'form',
        breadcrumb: 'iRequest / Hành chính',
        title: 'Request hành chính',
        badge: 'Chưa gửi',
        formFields: [
          { id: 'req', label: 'Nội dung yêu cầu', value: question, type: 'textarea' },
          { id: 'area', label: 'Khu vực', value: 'Tầng 5 · khu Product', half: true },
          { id: 'need-by', label: 'Cần trước ngày', value: '2026-08-20', type: 'date', half: true },
        ],
        steps: [
          'Đã phân loại yêu cầu: Hành chính / văn phòng',
          'Đã định tuyến tới Office Operations',
          'Đã điền sẵn form từ mô tả của bạn',
          'Chờ bạn xác nhận để gửi request',
        ],
      },
    };
  }

  if (/it support|request it| it |wifi|máy tính|laptop|phần mềm|mật khẩu|màn hình|bàn phím|máy in/.test(q)) {
    const category = classifyItRequest(q);
    return {
      role: 'assistant',
      text: `Mình đã tạo ticket IT support và phân loại vào nhóm "${category}" dựa trên mô tả. Kiểm tra form bên phải, bổ sung chi tiết nếu cần rồi gửi nhé.`,
      links: [{ label: 'Theo dõi request của tôi', to: '/requests' }],
      action: {
        kind: 'confirm',
        label: 'Gửi ticket cho IT Helpdesk',
        receipt: 'Ticket đã vào hàng đợi IT Helpdesk — theo dõi tại iRequest. Kỹ thuật viên sẽ liên hệ qua Slack trong SLA 4 giờ.',
        commit: 'request',
        request: {
          type: 'IT support',
          title: question.length > 70 ? `${question.slice(0, 70)}…` : question,
          slaLabel: 'SLA phản hồi 4 giờ',
          handlerLabel: 'IT Helpdesk',
        },
      },
      workspace: {
        kind: 'form',
        breadcrumb: 'IT Helpdesk / Ticket mới',
        title: 'Ticket — IT Support',
        badge: 'Chưa gửi',
        formFields: [
          { id: 'subject', label: 'Tiêu đề', value: question.length > 60 ? `${question.slice(0, 60)}…` : question },
          { id: 'desc', label: 'Mô tả chi tiết', value: `${question}\n\nThời điểm bắt đầu gặp lỗi: sáng nay\nĐã thử: khởi động lại thiết bị`, type: 'textarea' },
          { id: 'category', label: 'Phân loại', value: category, type: 'select', options: IT_CATEGORIES, half: true },
          { id: 'priority', label: 'Mức ưu tiên', value: IT_PRIORITIES[1], type: 'select', options: IT_PRIORITIES, half: true },
          {
            id: 'device', label: 'Thiết bị liên quan', type: 'select', half: true,
            value: 'MacBook Pro 14" M3 · IK-2306-0142',
            options: ['MacBook Pro 14" M3 · IK-2306-0142', 'Màn hình Dell U2723QE · IK-2306-0143', 'iPhone 13 (test) · IK-2401-0087', 'Khác'],
          },
          { id: 'location', label: 'Vị trí chỗ ngồi', value: 'Tầng 5 · khu Product', half: true },
        ],
        steps: [
          'Đã đọc và tóm tắt mô tả sự cố',
          `Đã phân loại: ${category}`,
          'Đã gắn thiết bị từ danh sách được cấp của bạn',
          'Chờ bạn duyệt để gửi vào hàng đợi Helpdesk',
        ],
      },
    };
  }

  if (/iwiki|viết bài|soạn tài liệu|wiki/.test(q)) {
    const docTitle = extractDocTitle(question);
    return {
      role: 'assistant',
      text: `Mình đã dựng bản nháp "${docTitle}" trên trình soạn thảo iWiki, tham chiếu ${Math.min(ctx.knowledgeDocs.length, 3)} tài liệu liên quan. Bạn chỉnh trực tiếp trong editor rồi lưu bản nháp nhé.`,
      action: { kind: 'confirm', label: 'Lưu bản nháp lên iWiki', receipt: 'Bản nháp đã lưu trên iWiki (chế độ riêng tư). Mở iWiki để tiếp tục chỉnh sửa hoặc mời người review.' },
      workspace: {
        kind: 'editor',
        breadcrumb: 'iWiki / Bản nháp mới',
        title: 'Trình soạn thảo iWiki',
        badge: 'Bản nháp · riêng tư',
        docTitle,
        blocks: [
          { type: 'p', text: `Tài liệu mô tả ${docTitle.toLowerCase()} áp dụng cho toàn bộ iKamer, cập nhật theo quy trình hiện hành của khối Product & Technology.` },
          { type: 'h2', text: '1. Bối cảnh & mục tiêu' },
          { type: 'p', text: 'Giúp thành viên mới nắm được lộ trình 30-60-90 ngày, các hệ thống nội bộ cần truy cập và đầu mối hỗ trợ trong giai đoạn đầu.' },
          { type: 'h2', text: '2. Các bước thực hiện' },
          { type: 'ul', items: [
            'Tuần 1: nhận thiết bị, kích hoạt tài khoản (email, Slack, iWiki, iGoal)',
            'Tuần 2: thống nhất mục tiêu thử việc với quản lý trực tiếp',
            'Tuần 3–4: hoàn thành khóa học bắt buộc trên Learning Hub',
            'Cuối tháng: check-in 1-1 với HRBP',
          ] },
          { type: 'h2', text: '3. Vai trò liên quan & đầu mối' },
          { type: 'p', text: 'Quản lý trực tiếp chịu trách nhiệm mục tiêu thử việc; HRBP hỗ trợ thủ tục; IT Helpdesk cấp quyền hệ thống.' },
          { type: 'h2', text: '4. Câu hỏi thường gặp' },
          { type: 'p', text: 'Bổ sung các câu hỏi thực tế từ thành viên mới trong 3 tháng gần nhất…' },
        ],
        steps: [
          'Đã quét các tài liệu iWiki liên quan',
          'Đã dựng khung bài theo template quy trình',
          'Đã soạn nội dung nháp cho từng mục',
          'Chờ bạn hiệu chỉnh và lưu bản nháp',
        ],
      },
    };
  }

  if (/mục tiêu|okr|check-in|goal|báo cáo/.test(q)) {
    const needsUpdate = ctx.goals.filter((goal) => goal.status === 'needs_update');
    if (needsUpdate.length === 0) {
      return {
        role: 'assistant',
        text: 'Tất cả mục tiêu của bạn đều đã được cập nhật. Mình sẽ nhắc khi tới kỳ check-in tiếp theo.',
        links: [{ label: 'Xem Mục tiêu của tôi', to: '/goals' }],
      };
    }
    const goal = needsUpdate[0];
    return {
      role: 'assistant',
      text: `Mục tiêu "${goal.title}" đã quá hạn check-in (${goal.nextDue}). Mình đã soạn sẵn báo cáo check-in với tiến độ đề xuất — bạn chỉnh số liệu và nội dung rồi gửi, hệ thống iGoal sẽ cập nhật ngay.`,
      links: [{ label: 'Mở mục tiêu trên iGoal', to: `/goals/${goal.id}` }],
      action: { kind: 'confirm', label: 'Gửi báo cáo check-in', receipt: 'Đã gửi báo cáo check-in lên iGoal — tiến độ và trạng thái mục tiêu đã được cập nhật.', commit: 'report' },
      workspace: {
        kind: 'okr',
        breadcrumb: 'iGoal / Báo cáo check-in',
        title: 'Tạo báo cáo check-in OKR',
        badge: 'Quá hạn check-in',
        goalId: goal.id,
        goalTitle: goal.title,
        progressBefore: goal.progress,
        suggestedProgress: Math.min(100, goal.progress + 10),
        periodLabel: 'Tuần 33 · 10-16/08',
        draftContent: `Hoàn thiện bộ token màu & typography cho Core DS 1.1, áp dụng thử trên module Trang chủ và Tin tức. Điểm hài lòng giao diện nội bộ đạt 4.1/5 sau đợt khảo sát nhanh. Kế hoạch tuần tới: phủ nốt 2 module còn lại và chốt guideline component.`,
        steps: [
          'Đã đối chiếu chu kỳ OKR hiện tại (H2-2026)',
          `Đã phát hiện mục tiêu quá hạn: ${goal.nextDue}`,
          `Đã soạn nháp báo cáo từ check-in gần nhất (${goal.lastCheckIn})`,
          'Chờ bạn duyệt số liệu và gửi lên iGoal',
        ],
      },
    };
  }

  if (/nghỉ phép|phép năm|ngày phép|leave/.test(q)) {
    const { annualRemaining, annualTotal, annualUsed, carriedOver, insuranceLabel, healthCheckLabel } = ctx.leaveBalance;
    return {
      role: 'assistant',
      text: `Bạn còn ${annualRemaining}/${annualTotal} ngày phép năm. Chi tiết số dư ở khung bên phải — cần soạn đơn nghỉ phép thì nói ngày cụ thể nhé.`,
      links: [{ label: 'Xem chi tiết trong Hồ sơ', to: '/profile' }],
      workspace: {
        kind: 'info',
        breadcrumb: 'HR / Nghỉ phép',
        title: 'Số dư nghỉ phép của bạn',
        fields: [
          { label: 'Phép năm còn lại', value: `${annualRemaining} / ${annualTotal} ngày` },
          { label: 'Đã sử dụng', value: `${annualUsed} ngày (gồm ${carriedOver} ngày chuyển từ năm trước)` },
          { label: 'Bảo hiểm', value: insuranceLabel },
          { label: 'Khám sức khoẻ', value: healthCheckLabel },
        ],
        steps: [
          'Đã đọc dữ liệu từ hệ thống HRM',
          'Đã đối chiếu chu kỳ phép 2026',
        ],
      },
    };
  }

  if (/xác nhận|bắt buộc|chính sách bảo mật/.test(q)) {
    const pending = ctx.news.find((post) => post.mandatory && !post.acknowledged);
    if (!pending) return { role: 'assistant', text: 'Bạn không còn thông báo bắt buộc nào cần xác nhận. Mọi thứ đã ổn!' };
    return {
      role: 'assistant',
      text: `Bạn có 1 thông báo bắt buộc: "${pending.title}". Nội dung tóm tắt ở khung bên phải — đọc xong bấm xác nhận là hoàn tất.`,
      links: [{ label: 'Mở bài viết đầy đủ', to: `/news/${pending.id}` }],
      action: { kind: 'ack-news', targetId: pending.id, label: 'Xác nhận đã đọc', receipt: 'Đã ghi nhận xác nhận của bạn. Cảm ơn đã hoàn tất đúng hạn!' },
      workspace: {
        kind: 'info',
        breadcrumb: 'Tin tức / Thông báo bắt buộc',
        title: pending.title,
        badge: pending.dueLabel ?? 'Cần xác nhận',
        fields: [
          { label: 'Đơn vị phát hành', value: pending.publisher },
          { label: 'Tóm tắt', value: pending.summary, multiline: true },
          { label: 'Trạng thái', value: 'Chưa xác nhận' },
        ],
        steps: [
          'Đã lọc thông báo bắt buộc dành cho bạn',
          'Đã tóm tắt nội dung chính',
          'Chờ bạn xác nhận đã đọc',
        ],
      },
    };
  }

  if (/sự kiện|lịch/.test(q)) {
    const upcoming = ctx.events.filter((event) => event.status !== 'past' && event.status !== 'cancelled');
    const registered = upcoming.filter((event) => event.myRegistration === 'going' || event.myRegistration === 'waitlisted');
    const list = (registered.length > 0 ? registered : upcoming).slice(0, 3);
    if (list.length === 0) return { role: 'assistant', text: 'Hiện chưa có sự kiện nào phù hợp với bạn.' };
    return {
      role: 'assistant',
      text: registered.length > 0 ? `Bạn đã đăng ký ${registered.length} sự kiện sắp tới:` : `Có ${list.length} sự kiện sắp diễn ra:`,
      links: list.map((event) => ({ label: `${event.title} · ${event.dateLabel}`, to: `/events/${event.id}` })),
    };
  }

  if (/tin tức|chưa đọc/.test(q)) {
    const unread = ctx.news.filter((post) => !post.expired && !post.read);
    if (unread.length === 0) return { role: 'assistant', text: 'Bạn đã đọc hết tin tức dành cho mình.' };
    return {
      role: 'assistant',
      text: `Bạn có ${unread.length} bài viết chưa đọc, ưu tiên các bài này:`,
      links: unread.slice(0, 3).map((post) => ({ label: post.title, to: `/news/${post.id}` })),
    };
  }

  if (/nhân sự|lương|chính sách|hr|onboarding/.test(q)) {
    const docs = ctx.knowledgeDocs.slice(0, 2);
    return {
      role: 'assistant',
      text: 'Mình tìm thấy các tài liệu iWiki liên quan — bản đầy đủ sẽ trả lời trực tiếp kèm trích dẫn nguồn:',
      links: [
        ...docs.map((doc) => ({ label: `${doc.title} · ${doc.topic}`, to: `/knowledge/${doc.id}` })),
        { label: 'Mở Tri thức', to: '/knowledge' },
      ],
    };
  }

  if (/đồng nghiệp|danh bạ|liên hệ/.test(q)) {
    return {
      role: 'assistant',
      text: 'Bạn có thể tìm đồng nghiệp, tin tức và sự kiện tại Tìm kiếm toàn hệ thống.',
      links: [{ label: 'Mở Tìm kiếm', to: '/search' }],
    };
  }

  return {
    role: 'assistant',
    text: 'Trong bản demo, mình xử lý tốt nhất các nghiệp vụ: đặt phòng họp, request IT support, báo cáo check-in OKR, viết bài iWiki, nghỉ phép và tin tức/sự kiện. Bạn thử một gợi ý bên dưới nhé — bản đầy đủ sẽ hiểu ý định tự do và kết nối thẳng vào các hệ thống nội bộ.',
  };
}
