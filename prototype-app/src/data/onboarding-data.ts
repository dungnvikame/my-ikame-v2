import type { JourneyProgress, JourneyQuest, LifecycleBadge } from '../types';
import { daysAgo, formatDdMmYyyy } from '../lib/onboarding';

/**
 * Hành trình 60 ngày — dữ liệu mock cho người mới Phạm Gia Huy. Ngày gia nhập tính lùi từ
 * ngày máy để demo luôn ở "Ngày 32/60" (mốc 30 vừa qua: huy hiệu đã nhận, khảo sát 30 ngày
 * đến hạn, 1:1 mốc 30 chưa đặt). Đổi một hằng số nếu muốn kịch bản khác.
 */
export const JOURNEY_DEMO_DAY = 32;
export const HUY_JOINED_AT = formatDdMmYyyy(daysAgo(JOURNEY_DEMO_DAY - 1));
/** Nhãn dd/mm/yyyy của một ngày hành trình (1-based) — dùng cho timeline/huy hiệu. */
export function huyJourneyDateLabel(day: number): string {
  return formatDdMmYyyy(daysAgo(JOURNEY_DEMO_DAY - day));
}

export const ONBOARDING_QUESTS: JourneyQuest[] = [
  { id: 'q-welcome', title: 'Mở Welcome Pack: tài khoản, thiết bị, sơ đồ văn phòng', milestone: 'day0', dueDay: 1, source: 'HRIS', href: '/profile' },
  { id: 'q-directory', title: 'Làm quen danh bạ team Product (6 người)', milestone: 'week1', dueDay: 3, source: 'My iKame', href: '/search' },
  { id: 'q-culture-quiz', title: 'Quiz văn hoá iKame — 5 giá trị cốt lõi', milestone: 'week1', dueDay: 5, source: 'iWiki', platform: 'iWiki' },
  { id: 'q-app-tour', title: 'Tour My iKame: Feed, Sự kiện, Ứng dụng, Trợ lý AI', milestone: 'week1', dueDay: 5, source: 'My iKame', href: '/apps' },
  { id: 'q-buddy-coffee', title: 'Cà phê với buddy Lan — hỏi 3 điều bạn còn thắc mắc', milestone: 'week1', dueDay: 7, source: 'Buddy' },
  { id: 'q-first-1on1', title: '1:1 đầu tiên với manager Mai', milestone: 'week1', dueDay: 7, source: 'Manager' },
  { id: 'q-processes', title: 'Đọc 3 quy trình thiết kế nội bộ trên iWiki', milestone: 'day30', dueDay: 14, source: 'iWiki', platform: 'iWiki' },
  { id: 'q-probation-goal', title: 'Thiết lập mục tiêu thử việc trên iGoal', milestone: 'day30', dueDay: 14, source: 'iGoal', platform: 'iGoal' },
  { id: 'q-security-course', title: 'Khoá An toàn thông tin 2026 (bắt buộc)', milestone: 'day30', dueDay: 30, source: 'iWiki', platform: 'iWiki' },
  { id: 'q-survey-30', title: 'Khảo sát 30 ngày: bạn đang cảm thấy thế nào?', milestone: 'day30', dueDay: 32, source: 'My iKame', href: '/onboarding#survey' },
  { id: 'q-okr-checkin-30', title: 'Check-in mục tiêu thử việc mốc 30 ngày', milestone: 'day60', dueDay: 35, source: 'iGoal', platform: 'iGoal' },
  { id: 'q-showcase', title: 'Trình bày một dự án nhỏ trước team', milestone: 'day60', dueDay: 55, source: 'Manager' },
];

/** Huy hiệu mốc vòng đời — không coin/EXP; chỉ ghi nhận thời gian và cột mốc. */
export const LIFECYCLE_BADGES: LifecycleBadge[] = [
  { id: 'badge-30d', title: '30 ngày đầu', description: 'Hoàn thành mốc Vững vàng của hành trình onboarding', dayRequired: 30, emoji: '🌱' },
  { id: 'badge-60d', title: 'Tốt nghiệp 60 ngày', description: 'Hoàn tất thử việc và hành trình 60 ngày', dayRequired: 60, emoji: '🎓' },
  { id: 'badge-1y', title: '1 năm đồng hành', description: 'Tròn 1 năm gắn bó cùng iKame', dayRequired: 365, emoji: '⭐' },
  { id: 'badge-2y', title: '2 năm đồng hành', description: 'Tròn 2 năm gắn bó cùng iKame', dayRequired: 730, emoji: '🏅' },
  { id: 'badge-3y', title: '3 năm đồng hành', description: 'Tròn 3 năm gắn bó cùng iKame', dayRequired: 1095, emoji: '💎' },
];

/** Tiến độ theo personId — 7/12 quest xong ở Ngày 32; buddy/manager lấy từ roster team Product. */
export const initialJourneyProgress: Record<string, JourneyProgress> = {
  person_huy: {
    personId: 'person_huy',
    completedQuestIds: ['q-welcome', 'q-directory', 'q-culture-quiz', 'q-app-tour', 'q-first-1on1', 'q-processes', 'q-probation-goal'],
    buddyMemberId: 'member_lan',
    managerPersonId: 'person_mai',
  },
};
