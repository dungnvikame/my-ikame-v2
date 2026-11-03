import type { JourneyMilestoneKey, JourneyProgress, JourneyQuest, LifecycleBadge } from '../types';

/**
 * Hành trình 60 ngày của người mới — hàm thuần, không React, để Home, trang Hành trình,
 * Việc hôm nay và Tổng quan Manager cùng tính một kết quả. Ngày hành trình tính từ
 * `hrProfile.joinedAt` (HRIS, dd/mm/yyyy) so với ngày máy — HRIS là nguồn sự thật.
 */
export const JOURNEY_LENGTH_DAYS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDdMmYyyy(label: string): Date | undefined {
  const match = label.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDdMmYyyy(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Ngày máy lùi `days` ngày, 00:00 local — dùng cho mock "gia nhập cách đây N ngày". */
export function daysAgo(days: number, today = new Date()): Date {
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

/** Ngày hành trình 1-based (ngày gia nhập = Ngày 1); 0 nếu chưa gia nhập hoặc không đọc được ngày. */
export function journeyDay(joinedAt: string, today = new Date()): number {
  const joined = parseDdMmYyyy(joinedAt);
  if (!joined) return 0;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  // round (không floor): lệch 1h do DST ở múi giờ khác không làm mất một ngày hành trình.
  const diff = Math.round((start.getTime() - joined.getTime()) / DAY_MS);
  return diff < 0 ? 0 : diff + 1;
}

export function isNewJoiner(joinedAt: string, today = new Date()): boolean {
  const day = journeyDay(joinedAt, today);
  return day >= 1 && day <= JOURNEY_LENGTH_DAYS;
}

export type JourneyMilestone = { key: JourneyMilestoneKey; title: string; day: number; subtitle: string };

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  { key: 'day0', title: 'Welcome Pack', day: 1, subtitle: 'Ngày đầu tiên · tài khoản, thiết bị, buddy' },
  { key: 'week1', title: 'Hoà nhập', day: 7, subtitle: 'Tuần 1 · gặp team, hiểu văn hoá, biết đường đi' },
  { key: 'day30', title: 'Vững vàng', day: 30, subtitle: '30 ngày · mục tiêu thử việc, quy trình, khảo sát' },
  { key: 'day60', title: 'Tốt nghiệp', day: 60, subtitle: '60 ngày · hoàn tất thử việc, chuyển mục tiêu dài hạn' },
];

/** done = qua mốc và xong hết · open = qua mốc nhưng còn việc · current = mốc đang ở · upcoming = chưa tới. */
export type MilestoneStatus = 'done' | 'open' | 'current' | 'upcoming';

export type JourneyView = {
  day: number;
  daysLeft: number;
  percent: number;
  milestones: (JourneyMilestone & { status: MilestoneStatus; done: number; total: number })[];
  quests: (JourneyQuest & { done: boolean; late: boolean })[];
  /** Quest chưa xong, đến hạn (dueDay ≤ hôm nay) — đưa lên Việc hôm nay. */
  due: (JourneyQuest & { done: boolean; late: boolean })[];
  next?: JourneyQuest;
  completed: number;
  total: number;
  buddyMemberId: string;
  managerPersonId: string;
};

export function buildJourney(day: number, progress: JourneyProgress, quests: JourneyQuest[]): JourneyView {
  const doneSet = new Set(progress.completedQuestIds);
  const withStatus = quests.map((quest) => ({ ...quest, done: doneSet.has(quest.id), late: !doneSet.has(quest.id) && quest.dueDay < day }));
  // "current" = mốc cuối cùng đã tới theo ngày; mốc trước đó xong hết = done, còn việc = open.
  const currentIndex = JOURNEY_MILESTONES.reduce((found, milestone, index) => (milestone.day <= day ? index : found), 0);
  const milestones = JOURNEY_MILESTONES.map((milestone, index) => {
    const own = withStatus.filter((quest) => quest.milestone === milestone.key);
    const done = own.filter((quest) => quest.done).length;
    const status: MilestoneStatus = index === currentIndex ? 'current'
      : index > currentIndex ? 'upcoming'
        : done === own.length ? 'done' : 'open';
    return { ...milestone, status, done, total: own.length };
  });
  const pending = withStatus.filter((quest) => !quest.done).sort((a, b) => a.dueDay - b.dueDay);
  const completed = withStatus.length - pending.length;
  return {
    day,
    daysLeft: Math.max(0, JOURNEY_LENGTH_DAYS - day),
    percent: Math.min(100, Math.round((day / JOURNEY_LENGTH_DAYS) * 100)),
    milestones,
    quests: withStatus,
    // Đến hạn hôm nay đứng trước việc đã trễ: cái còn kịp làm trong ngày là cái cần thấy đầu tiên.
    due: pending.filter((quest) => quest.dueDay <= day).sort((a, b) => Number(b.dueDay === day) - Number(a.dueDay === day)),
    next: pending[0],
    completed,
    total: withStatus.length,
    buddyMemberId: progress.buddyMemberId,
    managerPersonId: progress.managerPersonId,
  };
}

/**
 * Huy hiệu đã nhận theo số ngày gắn bó. Huy hiệu onboarding (≤60 ngày) chỉ cho người có hành trình
 * trong hệ thống; huy hiệu thâm niên chỉ hiện mốc cao nhất (iKamer 3 năm không đeo cả 3 cái).
 */
export function earnedBadges(day: number, badges: LifecycleBadge[], hasJourney: boolean): LifecycleBadge[] {
  const earned = badges.filter((badge) => day >= badge.dayRequired);
  const onboarding = hasJourney ? earned.filter((badge) => badge.dayRequired <= JOURNEY_LENGTH_DAYS) : [];
  const tenure = earned.filter((badge) => badge.dayRequired > JOURNEY_LENGTH_DAYS).slice(-1);
  return [...onboarding, ...tenure];
}

/** Quest đến hạn/trễ dưới dạng dòng "Việc hôm nay" — Home, Trợ lý AI và Bản tin sáng dùng chung một mapping. */
export function journeyDigestQuests(journey: JourneyView | undefined): { id: string; label: string; meta: string; late: boolean }[] {
  if (!journey) return [];
  return journey.due.map((quest) => ({
    id: quest.id,
    label: quest.title,
    meta: quest.late ? `Trễ ${journey.day - quest.dueDay} ngày · ${quest.source}` : `Hạn hôm nay · ${quest.source}`,
    late: quest.late,
  }));
}
