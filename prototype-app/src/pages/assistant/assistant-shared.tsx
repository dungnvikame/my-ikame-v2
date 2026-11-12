import { AirplaneTiltIcon as AirplaneTilt, BellRingingIcon as BellRinging, CalendarPlusIcon as CalendarPlus, ChatCircleDotsIcon as ChatCircleDots, CheckCircleIcon as CheckCircle, CheckSquareIcon as CheckSquare, CircleNotchIcon as CircleNotch, ClipboardTextIcon as ClipboardText, KeyIcon as Key, ListChecksIcon as ListChecks, NotePencilIcon as NotePencil, SparkleIcon as Sparkle, TargetIcon as Target, UsersThreeIcon as UsersThree, WrenchIcon as Wrench } from '@coreds/react/icons';
import { MCP_SERVERS } from '../../lib/mcp-registry';
import type { Perspective } from '../../types';
import type { ThreadMessage } from './assistant-history';

/**
 * Phần dùng chung giữa trang Trợ lý AI (/assistant) và panel hỏi nhanh (topbar) —
 * một engine, một bộ năng lực, một hiệu ứng AI steps cho cả hai bề mặt.
 */

/** Steps mặc định cho các intent không có workspace (hỏi đáp thuần). */
export const GENERIC_STEPS = ['Đã hiểu yêu cầu của bạn', 'Đã tra cứu dữ liệu liên quan', 'Đã tổng hợp câu trả lời'];

export function stepsOf(message: ThreadMessage): string[] {
  return message.workspace?.steps ?? message.card?.steps ?? GENERIC_STEPS;
}

export function generateReceiptId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/** Id không đụng nhau kể cả khi mở lại phiên cũ từ lịch sử. */
export function generateMessageId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export type Capability = { icon: typeof Sparkle; title: string; prompt: string };

/** Hệ thống nguồn Trợ lý AI đọc/ghi qua MCP framework dùng chung của iKame — từ registry. */
export const CONNECTORS = MCP_SERVERS.map((server) => ({ name: server.name, status: server.status, tools: server.tools.length }));

const TASK_CAP: Capability = { icon: CheckSquare, title: 'Tạo việc', prompt: 'Tạo việc: gửi báo cáo tuần cho quản lý, hạn thứ 6' };
const SLACK_CAP: Capability = { icon: ChatCircleDots, title: 'Soạn tin Slack', prompt: 'Soạn tin Slack cho team: nhắc cập nhật OKR trước thứ 6' };
const MEETING_CAP: Capability = { icon: CalendarPlus, title: 'Tạo lịch họp kèm phòng', prompt: 'Tạo lịch họp team sync 14:00 mai kèm phòng' };
const IT_CAP: Capability = { icon: Wrench, title: 'Request IT support', prompt: 'Tạo request IT support: laptop không kết nối được wifi' };
const TODAY_CAP: Capability = { icon: ListChecks, title: 'Việc hôm nay', prompt: 'Hôm nay tôi cần làm gì?' };
const LEAVE_CAP: Capability = { icon: AirplaneTilt, title: 'Nghỉ phép & HR', prompt: 'Tôi còn bao nhiêu ngày nghỉ phép?' };
const GOAL_CAP: Capability = { icon: Target, title: 'Mục tiêu & check-in', prompt: 'Mục tiêu nào của tôi cần cập nhật?' };
const WIKI_CAP: Capability = { icon: NotePencil, title: 'Viết bài iWiki', prompt: 'Viết bài iWiki về quy trình onboarding thành viên mới' };

export const IKAMER_CAPABILITIES: Capability[] = [
  TODAY_CAP,
  { icon: CalendarPlus, title: 'Đặt phòng họp', prompt: 'Đặt phòng họp 14:00 hôm nay cho 6 người' },
  TASK_CAP,
  GOAL_CAP,
  { icon: AirplaneTilt, title: 'Mở sẵn đề xuất', prompt: 'Mở sẵn đề xuất xin nghỉ mai buổi sáng' },
  LEAVE_CAP,
  SLACK_CAP,
  IT_CAP,
  WIKI_CAP,
  // "Việc cần xác nhận" gộp vào "Việc hôm nay" (daily digest) — intent vẫn chạy khi gõ tay.
];

/** COM Admin: nội dung truyền thông, thông báo toàn công ty. */
export const ADMIN_CAPABILITIES: Capability[] = [
  TODAY_CAP,
  { icon: ChatCircleDots, title: 'Soạn thông báo Slack', prompt: 'Soạn tin Slack kênh #general thông báo lịch họp toàn công ty tuần sau' },
  { icon: CheckSquare, title: 'Tạo việc duyệt bài', prompt: 'Tạo việc: duyệt bài truyền thông chờ đăng, hạn mai' },
  WIKI_CAP,
  MEETING_CAP,
  GOAL_CAP,
];

/** Người mới (60 ngày đầu): tài khoản, làm quen quản lý, hồ sơ. */
export const NEW_JOINER_CAPABILITIES: Capability[] = [
  TODAY_CAP,
  { icon: Key, title: 'Xin cấp tài khoản', prompt: 'Mở sẵn đề xuất cấp tài khoản Slack, Figma, Jira' },
  { icon: CalendarPlus, title: 'Hẹn 1-1 với quản lý', prompt: 'Tạo lịch họp 1-1 với quản lý 15:00 mai' },
  { icon: CheckSquare, title: 'Tạo việc làm quen', prompt: 'Tạo việc: đọc xong tài liệu onboarding, hạn thứ 6' },
  LEAVE_CAP,
  IT_CAP,
];

/** Manager có bộ nghiệp vụ quản lý riêng — team, check-in, OKR, hàng đợi duyệt. */
export const MANAGER_CAPABILITIES: Capability[] = [
  { icon: UsersThree, title: 'Tình hình team', prompt: 'Team tôi hôm nay có gì cần chú ý?' },
  { icon: BellRinging, title: 'Nhắc check-in', prompt: 'Soạn tin nhắn nhắc check-in cho thành viên trễ hạn' },
  { icon: Target, title: 'OKR của team', prompt: 'Tóm tắt tiến độ OKR của team tuần này' },
  { icon: ClipboardText, title: 'Đơn chờ duyệt', prompt: 'Tôi có đơn nào đang chờ duyệt?' },
  MEETING_CAP,
  SLACK_CAP,
];

/** Gợi ý theo góc nhìn; người mới (chỉ ở góc nhìn iKamer) có bộ riêng. */
export function capabilitiesFor(perspective: Perspective, isNewJoiner = false): Capability[] {
  if (perspective === 'manager') return MANAGER_CAPABILITIES;
  if (perspective === 'admin') return ADMIN_CAPABILITIES;
  return isNewJoiner ? NEW_JOINER_CAPABILITIES : IKAMER_CAPABILITIES;
}

/** Nguồn Trợ lý có thể đọc — hiển thị minh bạch quyền truy cập ở chân khung chat. */
export const READABLE_TOOLS = ['Lịch', 'Asana', 'iCheck', 'iGoal', 'iHiring', 'iWiki', 'Slack'];

export function AssistantToolsFooter() {
  return (
    <p className="as-tools" aria-label="Nguồn Trợ lý có thể đọc">
      <span>Trợ lý có thể đọc: {READABLE_TOOLS.join(' · ')}.</span>
      <strong>Trợ lý dùng quyền truy cập của chính bạn.</strong>
    </p>
  );
}

/** Khối "AI steps" trong bong bóng chat: đang xử lý thì tick dần, step cuối quay spinner. */
export function AssistantSteps({ message }: { message: ThreadMessage }) {
  const steps = stepsOf(message);
  const revealed = message.revealedSteps ?? 0;
  const visible = message.processing ? steps.slice(0, Math.min(revealed + 1, steps.length)) : steps;
  return (
    <div className="assistant-steps" aria-label="AI steps">
      <p className="assistant-steps-title"><Sparkle size={13} variant="fill" />AI steps</p>
      <ul>
        {visible.map((step, index) => {
          const running = !!message.processing && revealed < steps.length && index === visible.length - 1;
          return (
            <li key={step} className={running ? 'is-running' : ''}>
              {running ? <CircleNotch size={14} className="assistant-step-spinner" /> : <CheckCircle size={14} variant="fill" />}
              <span>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
