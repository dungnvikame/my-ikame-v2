import type { EventItem, Goal, NewsPost } from '../../types';

/**
 * "Việc hôm nay" — Daily Work Hub (KR3). Hàm thuần gom việc từ nhiều nguồn (qua MCP ở bản
 * thật) để Home và Trợ lý AI cùng dùng một danh sách; Asana/Calendar là mock cố định.
 */
export type DigestItem = {
  id: string;
  label: string;
  meta: string;
  to: string;
  source: 'HRIS' | 'COM' | 'My iKame' | 'iGoal' | 'Asana' | 'Google Calendar' | 'iCheck';
  urgent?: boolean;
};

export type DigestCtx = {
  news: NewsPost[];
  events: EventItem[];
  goals: Goal[];
  /** Hôm nay chưa chấm công → nhắc đầu danh sách. */
  checkedIn: boolean;
  /** Giấy tờ sắp hết hạn / thiếu (Phase 2) — nhãn ngắn. */
  documentReminders?: { id: string; label: string; meta: string }[];
};

export const DIGEST_SOURCES: DigestItem['source'][] = ['HRIS', 'My iKame', 'iGoal', 'Asana', 'Google Calendar'];

export function buildDailyDigestItems(ctx: DigestCtx): DigestItem[] {
  const items: DigestItem[] = [];

  if (!ctx.checkedIn) {
    items.push({ id: 'checkin', label: 'Chấm công hôm nay', meta: 'iCheck · chưa ghi nhận giờ vào', to: '/work', source: 'iCheck', urgent: true });
  }
  for (const post of ctx.news.filter((item) => !item.expired && item.mandatory && !item.acknowledged)) {
    items.push({ id: `ack-${post.id}`, label: `Xác nhận: ${post.title}`, meta: post.dueLabel ?? 'Bắt buộc', to: `/feed/article/${post.id}`, source: 'COM', urgent: true });
  }
  for (const reminder of ctx.documentReminders ?? []) {
    items.push({ id: reminder.id, label: reminder.label, meta: reminder.meta, to: '/profile', source: 'HRIS', urgent: true });
  }
  for (const goal of ctx.goals.filter((item) => item.status === 'needs_update').slice(0, 2)) {
    items.push({ id: `okr-${goal.id}`, label: `Check-in OKR: ${goal.title}`, meta: `Hạn ${goal.nextDue}`, to: `/goals/${goal.id}`, source: 'iGoal' });
  }
  items.push(
    { id: 'asana-1', label: 'Review flow onboarding (Asana)', meta: 'Hạn hôm nay · Minh Trần giao', to: '/apps', source: 'Asana' },
    { id: 'calendar-1', label: 'Họp nhóm Product 14:00 · Mercury', meta: 'Google Calendar · 6 người', to: '/assistant?q=Đặt phòng họp 14:00 hôm nay cho 6 người', source: 'Google Calendar' },
    { id: 'asana-2', label: 'Cập nhật spec màn Sự kiện (Asana)', meta: 'Hạn thứ Sáu', to: '/apps', source: 'Asana' },
  );
  for (const event of ctx.events.filter((item) => item.status !== 'past' && item.status !== 'cancelled'
    && (item.myRegistration === 'going' || item.myRegistration === 'waitlisted')).slice(0, 2)) {
    items.push({ id: `event-${event.id}`, label: `Sự kiện: ${event.title}`, meta: event.dateLabel, to: `/events/${event.id}`, source: 'My iKame' });
  }
  return items;
}
