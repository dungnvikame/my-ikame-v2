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
  /** Link ra công cụ gốc (mở tab mới) — dùng cho việc từ dữ liệu thật, thay cho `to`. */
  href?: string;
  source: 'HRIS' | 'COM' | 'My iKame' | 'iGoal' | 'Asana' | 'Google Calendar' | 'iCheck' | 'Onboarding' | 'iHiring';
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
  /** Quest hành trình 60 ngày đến hạn/trễ của người mới — tối đa 2, lên trước việc thường. */
  journeyQuests?: { id: string; label: string; meta: string; late: boolean }[];
};

export const DIGEST_SOURCES: DigestItem['source'][] = ['HRIS', 'My iKame', 'iGoal', 'Asana', 'Google Calendar'];

/** Home và Bản tin sáng cùng cắt một ngưỡng — số "N việc" ở hai nơi luôn bằng nhau. */
export const HOME_DIGEST_LIMIT = 5;

/** Bản tin sáng — một notification gộp đúng danh sách "Việc hôm nay" trên Home, gửi lúc preference.digestTime. */
export function buildMorningDigest(ctx: DigestCtx, timeLabel = '08:00'): { title: string; body: string; lines: string[] } {
  const items = buildDailyDigestItems(ctx).slice(0, HOME_DIGEST_LIMIT);
  const urgent = items.filter((item) => item.urgent).length;
  return {
    title: `Bản tin sáng ${timeLabel} · ${items.length} việc hôm nay`,
    body: urgent > 0 ? `${urgent} việc khẩn, còn lại theo lịch — mở Trang chủ để xử lý.` : 'Không có việc khẩn — mở Trang chủ để xem lịch hôm nay.',
    lines: items.map((item) => `${item.label} · ${item.meta}`),
  };
}

export function buildDailyDigestItems(ctx: DigestCtx): DigestItem[] {
  const items: DigestItem[] = [];

  if (!ctx.checkedIn) {
    items.push({ id: 'checkin', label: 'Chấm công hôm nay', meta: 'iCheck · chưa ghi nhận giờ vào', to: '/work', source: 'iCheck', urgent: true });
  }
  for (const post of ctx.news.filter((item) => !item.expired && item.mandatory && !item.acknowledged)) {
    items.push({ id: `ack-${post.id}`, label: `Xác nhận: ${post.title}`, meta: post.dueLabel ?? 'Bắt buộc', to: `/feed/article/${post.id}`, source: 'COM', urgent: true });
  }
  // Người mới: quest hành trình đứng ngay sau việc bắt buộc, trước nhắc giấy tờ — 60 ngày đầu là ưu tiên của họ.
  for (const quest of (ctx.journeyQuests ?? []).slice(0, 2)) {
    items.push({ id: `quest-${quest.id}`, label: quest.label, meta: quest.meta, to: '/onboarding', source: 'Onboarding', urgent: quest.late });
  }
  for (const reminder of ctx.documentReminders ?? []) {
    items.push({ id: reminder.id, label: reminder.label, meta: reminder.meta, to: '/profile', source: 'HRIS', urgent: true });
  }
  for (const goal of ctx.goals.filter((item) => item.status === 'needs_update').slice(0, 2)) {
    // nextDue đã có chữ "Hạn" ("Hạn check-in: hôm nay") — không ghép thêm.
    items.push({ id: `okr-${goal.id}`, label: `Check-in OKR: ${goal.title}`, meta: goal.nextDue, to: `/goals/${goal.id}`, source: 'iGoal' });
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
