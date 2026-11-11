import { AirplaneTiltIcon as AirplaneTilt, BellRingingIcon as BellRinging, CalendarPlusIcon as CalendarPlus, CheckCircleIcon as CheckCircle, CircleNotchIcon as CircleNotch, ClipboardTextIcon as ClipboardText, ListChecksIcon as ListChecks, NotePencilIcon as NotePencil, SparkleIcon as Sparkle, TargetIcon as Target, UsersThreeIcon as UsersThree, WrenchIcon as Wrench } from '@coreds/react/icons';
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
  return message.workspace?.steps ?? GENERIC_STEPS;
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

export const IKAMER_CAPABILITIES: Capability[] = [
  { icon: ListChecks, title: 'Việc hôm nay', prompt: 'Hôm nay tôi cần làm gì?' },
  { icon: CalendarPlus, title: 'Đặt phòng họp', prompt: 'Đặt phòng họp 14:00 hôm nay cho 6 người' },
  { icon: Wrench, title: 'Request IT support', prompt: 'Tạo request IT support: laptop không kết nối được wifi' },
  { icon: Target, title: 'Mục tiêu & check-in', prompt: 'Mục tiêu nào của tôi cần cập nhật?' },
  { icon: NotePencil, title: 'Viết bài iWiki', prompt: 'Viết bài iWiki về quy trình onboarding thành viên mới' },
  { icon: AirplaneTilt, title: 'Nghỉ phép & HR', prompt: 'Tôi còn bao nhiêu ngày nghỉ phép?' },
  // "Việc cần xác nhận" gộp vào "Việc hôm nay" (daily digest) — intent vẫn chạy khi gõ tay.
];

/** Manager có bộ nghiệp vụ quản lý riêng — team, check-in, OKR, hàng đợi duyệt. */
export const MANAGER_CAPABILITIES: Capability[] = [
  { icon: UsersThree, title: 'Tình hình team', prompt: 'Team tôi hôm nay có gì cần chú ý?' },
  { icon: BellRinging, title: 'Nhắc check-in', prompt: 'Soạn tin nhắn nhắc check-in cho thành viên trễ hạn' },
  { icon: Target, title: 'OKR của team', prompt: 'Tóm tắt tiến độ OKR của team tuần này' },
  { icon: ClipboardText, title: 'Đơn chờ duyệt', prompt: 'Tôi có đơn nào đang chờ duyệt?' },
  { icon: CalendarPlus, title: 'Đặt phòng họp', prompt: 'Đặt phòng họp 14:00 hôm nay cho 6 người' },
  { icon: Wrench, title: 'Request IT support', prompt: 'Tạo request IT support: laptop không kết nối được wifi' },
];

export function capabilitiesFor(perspective: Perspective): Capability[] {
  // COM Admin dùng bộ năng lực cá nhân như iKamer (chưa có intent quản trị nội dung riêng).
  return perspective === 'manager' ? MANAGER_CAPABILITIES : IKAMER_CAPABILITIES;
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
