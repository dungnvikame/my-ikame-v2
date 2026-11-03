import type { NotificationGroup, NotificationItem, NotificationPreference } from '../types';

/**
 * Notification engine (mock) — một cửa cho mọi sự kiện: bảng rule quyết định nhóm, mức ưu tiên,
 * kênh và lịch nhắc lại; preference của người dùng lọc theo nhóm. Pilot T4 nghẽn vì thiếu
 * notification: lớp này là hạ tầng dùng chung cho Feed, iCheck, Onboarding, Manager, COM.
 */
export type NotificationKind =
  | 'news_mandatory' | 'news_official' | 'news_reminder'
  | 'feed_mention' | 'feed_kudos' | 'feed_comment'
  | 'event_registration' | 'event_reminder'
  | 'icheck_missing' | 'request_decided' | 'request_submitted'
  | 'onboarding_quest_due' | 'onboarding_milestone'
  | 'manager_approval_pending'
  | 'digest_morning';

export type NotificationChannel = 'push' | 'inapp' | 'digest';

export type NotificationRule = {
  group: NotificationGroup;
  priority: NotificationItem['priority'];
  channels: NotificationChannel[];
  /** Nhắc lại sau N giờ nếu chưa xử lý (chỉ nhóm bắt buộc). */
  remindAfterHours?: number;
  maxReminders?: number;
  /** Không tắt được — theo quy định truyền thông chính thức. */
  locked?: boolean;
};

export type NotificationEvent = {
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  groupKey?: string;
  lines?: string[];
  /** Người nhận; bỏ trống = user đang đăng nhập. Khác user hiện tại → không hiện (demo một người). */
  targetPersonId?: string;
};

export const RULES: Record<NotificationKind, NotificationRule> = {
  news_mandatory: { group: 'official', priority: 'critical', channels: ['push', 'inapp'], remindAfterHours: 24, maxReminders: 3, locked: true },
  news_reminder: { group: 'official', priority: 'critical', channels: ['push', 'inapp'], locked: true },
  news_official: { group: 'com', priority: 'required', channels: ['push', 'inapp', 'digest'] },
  feed_mention: { group: 'feed', priority: 'informational', channels: ['inapp'] },
  feed_kudos: { group: 'feed', priority: 'informational', channels: ['push', 'inapp'] },
  feed_comment: { group: 'feed', priority: 'informational', channels: ['digest'] },
  event_registration: { group: 'events', priority: 'transactional', channels: ['inapp'] },
  event_reminder: { group: 'events', priority: 'transactional', channels: ['push', 'inapp', 'digest'] },
  icheck_missing: { group: 'work', priority: 'required', channels: ['push', 'inapp', 'digest'] },
  request_submitted: { group: 'work', priority: 'transactional', channels: ['inapp'] },
  request_decided: { group: 'work', priority: 'transactional', channels: ['push', 'inapp'] },
  onboarding_quest_due: { group: 'onboarding', priority: 'required', channels: ['inapp', 'digest'] },
  onboarding_milestone: { group: 'onboarding', priority: 'informational', channels: ['push', 'inapp'] },
  manager_approval_pending: { group: 'manager', priority: 'required', channels: ['push', 'inapp', 'digest'] },
  digest_morning: { group: 'work', priority: 'informational', channels: ['push', 'inapp'] },
};

export const GROUP_META: Record<NotificationGroup, { label: string; description: string }> = {
  official: { label: 'Thông báo bắt buộc', description: 'Chính sách, quy định cần xác nhận — nhắc lại sau 24h, tối đa 3 lần' },
  com: { label: 'Tin COM', description: 'Tin chính thức không bắt buộc từ kênh truyền thông' },
  feed: { label: 'iKame Feed', description: 'Nhắc tên, ghi nhận (Kudos), bình luận vào bài của bạn' },
  events: { label: 'Sự kiện', description: 'Xác nhận đăng ký, nhắc trước giờ diễn ra' },
  work: { label: 'Công việc & iCheck', description: 'Chấm công, đơn từ, kết quả duyệt, Bản tin sáng' },
  onboarding: { label: 'Hành trình 60 ngày', description: 'Quest đến hạn, cột mốc, huy hiệu (chỉ người mới)' },
  manager: { label: 'Quản lý team', description: 'Đơn chờ duyệt, tín hiệu sớm của thành viên (chỉ manager)' },
};

export const DEFAULT_PREFERENCE: NotificationPreference = {
  groups: { official: true, com: true, feed: true, events: true, work: true, onboarding: true, manager: true },
  digestTime: '08:00',
  quietHours: '21:00 – 07:00',
};

export type NotifyDecision = { deliver: boolean; rule: NotificationRule; reason?: 'group_off' | 'no_inapp' };

/** Quyết định một sự kiện có vào hộp thông báo của người nhận (theo preference của họ) không. */
export function decide(event: NotificationEvent, preference: NotificationPreference): NotifyDecision {
  const rule = RULES[event.kind];
  if (!rule.channels.includes('inapp')) return { deliver: false, rule, reason: 'no_inapp' };
  if (!rule.locked && !preference.groups[rule.group]) return { deliver: false, rule, reason: 'group_off' };
  return { deliver: true, rule };
}

export function toNotificationItem(event: NotificationEvent, rule: NotificationRule, id: string): NotificationItem {
  return { id, title: event.title, body: event.body, time: 'Vừa xong', priority: rule.priority, read: false, href: event.href, groupKey: event.groupKey, lines: event.lines };
}
