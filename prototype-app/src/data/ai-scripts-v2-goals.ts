import type { AiScript } from './ai-scripts-types';

/** /goals-scoped scripts split out of `ai-scripts-v2.ts` for the ≤200-line file budget
 * once the Mục tiêu (EKS) rebuild added g4. Both read LIVE ctx only (F2). */
export const g3CheckinReport: AiScript = {
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

export const g4WeekSummary: AiScript = {
  id: 'g4-week-summary',
  chip: 'Tổng hợp công việc tuần của tôi',
  routes: ['/goals', '/goals/:goalId'],
  level: 'A2',
  paragraphs: (ctx) => {
    const avgProgress = ctx.goals.length > 0
      ? Math.round(ctx.goals.reduce((sum, goal) => sum + goal.progress, 0) / ctx.goals.length)
      : 0;
    const attentionGoals = ctx.goals.filter((goal) => goal.status === 'needs_update' || goal.status === 'at_risk');
    return [
      `Bạn có ${ctx.goals.length} mục tiêu cá nhân, tiến độ trung bình ${avgProgress}%` + (attentionGoals.length > 0
        ? `; ${attentionGoals.length} mục tiêu cần chú ý: ${attentionGoals.map((goal) => goal.title).join(', ')}.`
        : ' — tất cả đang đúng tiến độ.'),
      `Đã gửi ${ctx.checkInReports.length} báo cáo check-in · ${ctx.registeredEvents.length} sự kiện sắp tới bạn đã đăng ký tham gia.`,
      ctx.unackedMandatory.length > 0
        ? `Còn ${ctx.unackedMandatory.length} tin bắt buộc chưa xác nhận: ${ctx.unackedMandatory.map((post) => post.title).join(', ')}.`
        : 'Không còn tin bắt buộc nào chưa xác nhận.',
    ];
  },
  citations: (ctx) => {
    const citations: { title: string; source: string; href: string }[] = [{ title: 'Mục tiêu của tôi', source: 'iGoal', href: '/goals' }];
    const nextEvent = ctx.registeredEvents[0];
    if (nextEvent) citations.push({ title: nextEvent.title, source: 'Event', href: `/events/${nextEvent.id}` });
    return citations;
  },
  reason: 'Tổng hợp từ tiến độ mục tiêu, số báo cáo đã gửi, sự kiện đã đăng ký và tin bắt buộc chưa xác nhận — toàn bộ đọc trực tiếp từ trạng thái hiện tại, không có số liệu tự soạn.',
};
