import type { AiScript } from './ai-scripts-types';

/**
 * Demo v2 — 6 new module-wide scripts (phase-06 req #1). All paragraphs read LIVE ctx
 * (F2) — never hardcoded counts/names. Two are A3 drafts that COMMIT to app state
 * (`commit: 'post' | 'report'`) instead of only printing a receipt; both carry
 * `isApplicable` derived from live state so a re-ask after commit shows the
 * "already handled" branch instead of duplicating (F2b).
 */
const c1CommunityHot: AiScript = {
  id: 'c1-community-hot',
  chip: 'Tuần này có gì hot?',
  routes: ['/community'],
  level: 'A2',
  paragraphs: (ctx) => {
    const top = [...ctx.posts].sort((a, b) => (b.reactions.heart + b.reactions.clap) - (a.reactions.heart + a.reactions.clap))[0];
    const uncongratulated = ctx.birthdays.filter((b) => !b.congratulated);
    const nextEvent = ctx.upcomingEvents[0];
    return [
      top
        ? `Bài viết được yêu thích nhất tuần này: "${top.body.slice(0, 70)}${top.body.length > 70 ? '…' : ''}" của ${top.authorName} (${top.reactions.heart + top.reactions.clap} lượt tương tác).`
        : 'Cộng đồng chưa có bài viết nào.',
      uncongratulated.length > 0
        ? `Hôm nay có ${uncongratulated.length} người sinh nhật: ${uncongratulated.map((b) => b.name).join(', ')} — đừng quên gửi lời chúc.`
        : 'Không có sinh nhật nào cần chúc hôm nay.',
      nextEvent
        ? `Sự kiện gần nhất: "${nextEvent.title}" · ${nextEvent.dateLabel}.`
        : 'Chưa có sự kiện sắp tới nào.',
    ];
  },
  citations: (ctx) => {
    const citations: { title: string; source: string; href: string }[] = [];
    const top = [...ctx.posts].sort((a, b) => (b.reactions.heart + b.reactions.clap) - (a.reactions.heart + a.reactions.clap))[0];
    if (top) citations.push({ title: top.body.slice(0, 40), source: 'Cộng đồng', href: '/community' });
    const nextEvent = ctx.upcomingEvents[0];
    if (nextEvent) citations.push({ title: nextEvent.title, source: 'Event', href: `/events/${nextEvent.id}` });
    return citations;
  },
  reason: 'Tổng hợp từ bài viết, sinh nhật và sự kiện đang hiển thị thật trên Cộng đồng — thứ tự và số liệu đổi ngay khi trạng thái đổi.',
};

const c2BirthdayWish: AiScript = {
  id: 'c2-birthday-wish',
  chip: 'Soạn lời chúc sinh nhật',
  routes: ['/community'],
  level: 'A3',
  paragraphs: (ctx) => {
    const person = ctx.birthdays.find((b) => !b.congratulated);
    return person
      ? [`Hôm nay có sinh nhật ${person.name} (${person.role} · ${person.team}) — iKame đã soạn sẵn một lời chúc, bạn xem lại và sửa trước khi đăng lên Cộng đồng.`]
      : ['Tất cả sinh nhật hôm nay đã được chúc mừng — không còn ai cần lời chúc mới.'];
  },
  citations: (ctx) => (ctx.birthdays.some((b) => !b.congratulated)
    ? [{ title: 'Sinh nhật hôm nay', source: 'Cộng đồng', href: '/community' }]
    : []),
  action: {
    kind: 'draft',
    // F2b: also true once an AI-authored birthday post already exists in the feed this
    // session — the `congratulated` flag alone doesn't flip on `commit: 'post'` (it's a
    // standalone feed post, not a comment on the existing birthday post).
    isApplicable: (ctx) => ctx.birthdays.some((b) => !b.congratulated)
      && !ctx.posts.some((p) => p.authorName === ctx.userName && p.cover?.pattern === 'confetti' && p.cover.emoji === '🎂'),
    draftText: (ctx) => {
      const person = ctx.birthdays.find((b) => !b.congratulated);
      return person
        ? `Chúc mừng sinh nhật ${person.name}! Chúc bạn một năm mới tràn đầy năng lượng, nhiều sức khoẻ và luôn giữ được nụ cười rạng rỡ trong công việc lẫn cuộc sống. 🎉🎂`
        : '';
    },
    confirmLabel: 'Duyệt & đăng',
    receipt: 'Đã đăng lời chúc lên Cộng đồng · #RCPT-xxxx',
    commit: 'post',
    buildPost: (_ctx, text) => ({ body: text, cover: { pattern: 'confetti', emoji: '🎂' } }),
  },
  reason: 'iKame chỉ soạn nội dung; bạn duyệt và sửa trước khi bài đăng thật xuất hiện trên Cộng đồng.',
};

const e2EventsSuggest: AiScript = {
  id: 'e2-events-suggest',
  chip: 'Tuần này nên tham gia gì?',
  routes: ['/events', '/events/:eventId'],
  level: 'A2',
  paragraphs: (ctx) => {
    const top = ctx.upcomingEvents.slice(0, 3);
    if (top.length === 0) return ['Hiện chưa có sự kiện sắp tới nào phù hợp với bạn.'];
    const lines = top.map((event) => {
      const regLabel = event.myRegistration === 'going'
        ? 'bạn đã đăng ký'
        : event.myRegistration === 'waitlisted' ? 'bạn đang ở danh sách chờ' : 'bạn chưa đăng ký';
      const closing = event.closingSoon ? ' — đăng ký sắp đóng' : '';
      return `${event.title} · ${event.dateLabel} — ${regLabel}${closing}.`;
    });
    return ['Sự kiện gần nhất bạn nên chú ý:', ...lines];
  },
  citations: (ctx) => ctx.upcomingEvents.slice(0, 3).map((event) => ({ title: event.title, source: 'Event', href: `/events/${event.id}` })),
  reason: 'Danh sách lấy từ các sự kiện sắp tới bạn có quyền xem, kèm đúng trạng thái đăng ký hiện tại của bạn — không đề xuất hộ chỗ đã đầy.',
};

const k2NewcomerDocs: AiScript = {
  id: 'k2-newcomer-docs',
  chip: 'Tài liệu cho người mới?',
  routes: ['/knowledge', '/knowledge/:documentId'],
  level: 'A2',
  paragraphs: (ctx) => {
    const docs = ['new-hire-handbook', 'leave-request-process', 'ask-ikame-guide']
      .map((id) => ctx.eligibleDocs.find((doc) => doc.id === id))
      .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));
    if (docs.length === 0) return ['Không tìm thấy tài liệu phù hợp cho người mới.'];
    return ['Tài liệu nên đọc đầu tiên khi mới gia nhập iKame:', ...docs.map((doc) => `${doc.title} — ${doc.summary}`)];
  },
  citations: (ctx) => ['new-hire-handbook', 'leave-request-process', 'ask-ikame-guide']
    .map((id) => ctx.eligibleDocs.find((doc) => doc.id === id))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc))
    .map((doc) => ({ title: doc.title, source: 'iWiki', href: `/knowledge/${doc.id}` })),
  reason: '3 tài liệu curated cố định cho người mới, lọc theo quyền xem của bạn — tài liệu riêng của Finance không xuất hiện ở đây.',
};

const g3CheckinReport: AiScript = {
  id: 'g3-checkin-report',
  chip: 'Soạn báo cáo check-in tuần',
  routes: ['/goals', '/goals/:goalId'],
  level: 'A3',
  paragraphs: (ctx) => {
    const goal = ctx.goals.find((g) => g.status === 'needs_update');
    return goal
      ? [`Mục tiêu "${goal.title}" đang ở ${goal.progress}% và cần check-in (check-in gần nhất: ${goal.lastCheckIn}, ${goal.nextDue}). iKame đã soạn sẵn báo cáo tuần này — bạn xem lại và sửa trước khi gửi.`]
      : ['Không còn mục tiêu nào cần check-in — tất cả đang đúng tiến độ.'];
  },
  citations: (ctx) => {
    const goal = ctx.goals.find((g) => g.status === 'needs_update');
    return goal ? [{ title: goal.title, source: 'iGoal', href: `/goals/${goal.id}` }] : [];
  },
  action: {
    kind: 'draft',
    isApplicable: (ctx) => ctx.goals.some((g) => g.status === 'needs_update'),
    draftText: (ctx) => {
      const goal = ctx.goals.find((g) => g.status === 'needs_update');
      if (!goal) return '';
      const next = Math.min(goal.progress + 10, 100);
      return `Cập nhật tiến độ cho "${goal.title}": đã hoàn thiện thêm phần còn lại theo chuẩn Core DS 1.1 cho các module tiếp theo. Tiến độ hiện tại: ${goal.progress}% → dự kiến đạt ${next}% sau tuần này.`;
    },
    confirmLabel: 'Duyệt & gửi báo cáo',
    receipt: 'Đã gửi báo cáo · #RCPT-xxxx — hiện trong Tổng hợp báo cáo',
    commit: 'report',
    buildReport: (ctx, text) => {
      const goal = ctx.goals.find((g) => g.status === 'needs_update')!;
      return {
        goalId: goal.id,
        goalTitle: goal.title,
        authorName: ctx.userName,
        periodLabel: 'Tuần 33 · 10-16/08',
        progressBefore: goal.progress,
        progressAfter: Math.min(goal.progress + 10, 100),
        content: text,
        source: 'ai',
      };
    },
  },
  reason: 'Nội dung báo cáo do iKame soạn từ tiến độ và lần check-in gần nhất của chính mục tiêu này; gửi sẽ cập nhật cả trạng thái mục tiêu và Tổng hợp báo cáo.',
};

const p2LeaveBalance: AiScript = {
  id: 'p2-leave-balance',
  chip: 'Tôi còn bao nhiêu ngày phép?',
  routes: ['/profile'],
  level: 'A2',
  paragraphs: (ctx) => {
    const lb = ctx.leaveBalance;
    return [
      `Bạn còn ${lb.annualRemaining}/${lb.annualTotal} ngày phép năm (đã dùng ${lb.annualUsed} ngày, ${lb.carriedOver} ngày chuyển từ năm trước) và đã dùng ${lb.sickUsed} ngày nghỉ ốm.`,
      `Bảo hiểm: ${lb.insuranceLabel}.`,
      `Khám sức khoẻ: ${lb.healthCheckLabel}.`,
    ];
  },
  citations: () => [
    { title: 'Quy trình xin nghỉ phép', source: 'iWiki', href: '/knowledge/leave-request-process' },
    { title: 'Hồ sơ của bạn', source: 'Hồ sơ', href: '/profile' },
  ],
  reason: 'Số ngày phép và phúc lợi lấy trực tiếp từ Hồ sơ của bạn — luôn khớp với mục Nghỉ phép & phúc lợi hiển thị bên dưới.',
};

export const V2_SCRIPTS: AiScript[] = [
  c1CommunityHot, c2BirthdayWish, e2EventsSuggest, k2NewcomerDocs, g3CheckinReport, p2LeaveBalance,
];
