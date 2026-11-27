// PRD §7.2 Deterministic Card Ranking Engine & Single Source for "Việc hôm nay"
// Shared 1:1 across: Home (/home), AI Assistant ("Hôm nay tôi cần làm gì?"), and Bản tin sáng (08:00).

import {
  EventItem,
  FeedPost,
  ObjectiveItem,
  OnboardingQuest,
  PersonProfile,
  TodayActionItem,
} from '../types';

export function rankTodayItems(items: TodayActionItem[]): TodayActionItem[] {
  return [...items].sort((a, b) => {
    if (a.priorityGroup !== b.priorityGroup) return a.priorityGroup - b.priorityGroup;
    if (a.severity !== b.severity) return b.severity - a.severity;
    if (a.deadlineSort !== b.deadlineSort) return a.deadlineSort - b.deadlineSort;
    if (a.official !== b.official) return a.official ? -1 : 1;
    if (a.recency !== b.recency) return b.recency - a.recency;
    return a.id.localeCompare(b.id);
  });
}

export function buildTodayItems(params: {
  person: PersonProfile;
  posts: FeedPost[];
  events: EventItem[];
  objectives: ObjectiveItem[];
  quests: OnboardingQuest[];
  checkedInToday: boolean;
  isComAdmin: boolean;
}): TodayActionItem[] {
  const { person, posts, events, objectives, quests, checkedInToday, isComAdmin } = params;
  const items: TodayActionItem[] = [];

  // 1. Mandatory announcements not yet confirmed (skip for COM Admin per PRD §7.3)
  if (!isComAdmin) {
    for (const post of posts) {
      const inAudience = post.audience === 'all' || post.audience === person.team;
      if (inAudience && post.mandatoryAck && !post.ackedBy[person.id]) {
        const isOverdue = Boolean(post.ackOverdue);
        items.push({
          id: `ack-${post.id}`,
          priorityGroup: isOverdue ? 0 : 1,
          severity: isOverdue ? 100 : 85,
          deadlineSort: isOverdue ? 0 : 12,
          official: true,
          recency: 95,
          title: post.title || 'Thông báo bắt buộc xác nhận',
          subtitle: post.ackReason || 'Thông báo chính sách cần xác nhận đã đọc',
          source: 'COM',
          urgencyLabel: isOverdue ? 'Quá hạn xác nhận' : `Hạn ${post.ackDeadline}`,
          urgencyTone: isOverdue ? 'error' : 'warning',
          actionLabel: 'Đọc & xác nhận',
          actionRoute: `/feed/article/${post.id}`,
          actionKind: 'ack_post',
          targetId: post.id,
        });
      }
    }
  }

  // 2. Onboarding overdue / due quests (for new joiners < 60 days)
  if (person.onboardingDay && person.onboardingDay <= 60) {
    const dueQuests = quests.filter((q) => !q.completed && q.dueDay <= person.onboardingDay! + 3);
    for (const q of dueQuests.slice(0, 2)) {
      const overdue = q.dueDay < person.onboardingDay!;
      items.push({
        id: `quest-${q.id}`,
        priorityGroup: overdue ? 1 : 2,
        severity: overdue ? 82 : 68,
        deadlineSort: q.dueDay,
        official: false,
        recency: 80,
        title: `Hành trình 60 ngày: ${q.title}`,
        subtitle: `Nguồn: ${q.source} · Hạn Ngày ${q.dueDay}/60`,
        source: 'Hành trình',
        urgencyLabel: overdue ? `Trễ ${person.onboardingDay! - q.dueDay} ngày` : `Ngày ${q.dueDay}`,
        urgencyTone: overdue ? 'error' : 'warning',
        actionLabel: 'Mở hành trình',
        actionRoute: '/onboarding',
        actionKind: 'complete_quest',
        targetId: q.id,
      });
    }
  }

  // 3. iCheck today check-in reminder
  if (!checkedInToday) {
    items.push({
      id: `icheck-today-${person.id}`,
      priorityGroup: 1,
      severity: 78,
      deadlineSort: 2,
      official: false,
      recency: 90,
      title: 'Chưa ghi nhận chấm công sáng nay',
      subtitle: 'iCheck · Ca làm việc 08:30 – 17:30',
      source: 'iCheck',
      urgencyLabel: 'Hôm nay',
      urgencyTone: 'warning',
      actionLabel: 'Chấm công ngay',
      actionKind: 'checkin',
    });
  }

  // 4. HRIS expiring/missing documents
  for (const doc of person.documents) {
    if (doc.status === 'expired' || doc.status === 'missing' || doc.status === 'expiring') {
      items.push({
        id: `doc-${doc.id}`,
        priorityGroup: doc.status === 'expired' ? 1 : 2,
        severity: doc.status === 'expired' ? 80 : 60,
        deadlineSort: doc.status === 'expired' ? 1 : 24,
        official: true,
        recency: 70,
        title: `Hồ sơ cần bổ sung: ${doc.title}`,
        subtitle: doc.note || `HRIS · Hạn ${doc.dueDate || 'trong tuần'}`,
        source: 'HRIS',
        urgencyLabel:
          doc.status === 'expired'
            ? 'Đã hết hạn'
            : doc.status === 'missing'
              ? 'Còn thiếu'
              : 'Sắp hết hạn',
        urgencyTone: doc.status === 'expired' ? 'error' : 'warning',
        actionLabel: 'Cập nhật hồ sơ',
        actionRoute: '/profile?tab=documents',
        actionKind: 'resolve_doc',
        targetId: doc.id,
      });
    }
  }

  // 5. Registered or <48h events
  for (const ev of events) {
    const inAudience = ev.audience === 'all' || ev.audience === person.team;
    if (inAudience && (ev.status === 'upcoming' || ev.status === 'ongoing')) {
      const isRegistered = ev.registeredIds.includes(person.id);
      if (isRegistered || ev.featured) {
        items.push({
          id: `event-${ev.id}`,
          priorityGroup: 2,
          severity: isRegistered ? 65 : 55,
          deadlineSort: 18,
          official: true,
          recency: 75,
          title: ev.title,
          subtitle: `${ev.dateLabel} · ${ev.timeLabel} · ${ev.location}`,
          source: 'Lịch',
          urgencyLabel: isRegistered ? 'Đã đăng ký' : 'Sắp diễn ra',
          urgencyTone: 'info',
          actionLabel: 'Xem sự kiện',
          actionRoute: `/events/${ev.id}`,
          actionKind: 'open_route',
          targetId: ev.id,
        });
      }
    }
  }

  // 6. OKR Check-in due (iGoal)
  const pendingOkr = objectives.find((o) => o.ownerId === person.id && o.needsCheckin);
  if (pendingOkr) {
    items.push({
      id: `okr-${pendingOkr.id}`,
      priorityGroup: 3,
      severity: 58,
      deadlineSort: 30,
      official: false,
      recency: 65,
      title: `Check-in OKR tuần 48: ${pendingOkr.title}`,
      subtitle: `iGoal · Tiến độ hiện tại ${pendingOkr.progress}% · Hạn Thứ 6 17:00`,
      source: 'iGoal',
      urgencyLabel: 'Đến hạn tuần này',
      urgencyTone: 'neutral',
      actionLabel: 'Check-in với AI',
      actionKind: 'open_ai',
      aiPrompt: `Check-in OKR "${pendingOkr.title}" tiến độ mới 78%`,
    });
  }

  // 7. Asana task mock
  items.push({
    id: `asana-sync-${person.id}`,
    priorityGroup: 4,
    severity: 42,
    deadlineSort: 40,
    official: false,
    recency: 50,
    title:
      person.id === 'u-huy'
        ? 'Hoàn thiện PR component Notification Drawer'
        : person.id === 'u-mai'
          ? 'Chốt scope R1 pilot My iKame với COM & Tech'
          : 'Review thiết kế luồng xác nhận thông báo trên Mobile 375px',
    subtitle: 'Asana · Sprint 24 · Hạn 16:00 hôm nay',
    source: 'Asana',
    urgencyLabel: '16:00 hôm nay',
    urgencyTone: 'neutral',
    actionLabel: 'Mở Công việc',
    actionRoute: '/work',
    actionKind: 'open_route',
  });

  return rankTodayItems(items).slice(0, 5);
}

// Deterministic ranking for Feed "Tin dành cho bạn"
export function rankFeedPostsForUser(posts: FeedPost[], person: PersonProfile): FeedPost[] {
  const visible = posts.filter((p) => p.audience === 'all' || p.audience === person.team);
  return [...visible].sort((a, b) => {
    const score = (p: FeedPost) => {
      const unacked = p.mandatoryAck && !p.ackedBy[person.id];
      if (unacked && p.ackOverdue) return 0;
      if (unacked) return 1;
      if (p.pinned) return 2;
      if (p.kind === 'official') return 3;
      if (p.kind === 'kudos') return 4;
      return 5;
    };
    const sa = score(a);
    const sb = score(b);
    if (sa !== sb) return sa - sb;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
