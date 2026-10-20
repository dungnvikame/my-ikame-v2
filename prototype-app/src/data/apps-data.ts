import type { PlatformKey } from '../components/PlatformHandoff';

/**
 * Danh bạ ứng dụng nội bộ iKame (MVP /apps + topbar launcher).
 * - kind 'external': mở qua handoff SSO mô phỏng (PlatformHandoffButton).
 * - kind 'internal': module ngay trong My iKame (điều hướng router).
 */
export type AppCategory = 'Công việc' | 'Nhân sự' | 'Tri thức';

export type InternalApp = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  category: AppCategory;
} & (
  | { kind: 'external'; platform: PlatformKey; action: string }
  | { kind: 'internal'; href: string }
);

export const APP_CATEGORIES: AppCategory[] = ['Công việc', 'Nhân sự', 'Tri thức'];

export const internalApps: InternalApp[] = [
  {
    id: 'igoal',
    name: 'iGoal',
    emoji: '🎯',
    tagline: 'Mục tiêu & OKR',
    description: 'Quản trị OKR công ty, team và cá nhân; check-in tiến độ và báo cáo chu kỳ.',
    category: 'Công việc',
    kind: 'external',
    platform: 'iGoal',
    action: 'cập nhật mục tiêu & check-in OKR',
  },
  {
    id: 'irequest',
    name: 'iRequest',
    emoji: '🎫',
    tagline: 'Yêu cầu nội bộ',
    description: 'Gửi và theo dõi yêu cầu IT support, nhân sự, hành chính, thiết bị — ngay trong My iKame.',
    category: 'Công việc',
    kind: 'internal',
    href: '/requests',
  },
  {
    id: 'iwiki',
    name: 'iWiki',
    emoji: '📖',
    tagline: 'Tri thức nội bộ',
    description: 'Kho tài liệu, quy định, hướng dẫn và không gian biên tập nội dung của iKame.',
    category: 'Tri thức',
    kind: 'external',
    platform: 'iWiki',
    action: 'tra cứu và biên tập tài liệu',
  },
  {
    id: 'ihrm',
    name: 'iHRM',
    emoji: '🧾',
    tagline: 'Nhân sự & phúc lợi',
    description: 'Hồ sơ nhân sự, bảng lương, nghỉ phép, bảo hiểm và phúc lợi của bạn.',
    category: 'Nhân sự',
    kind: 'external',
    platform: 'iHRM',
    action: 'xem hồ sơ nhân sự & phúc lợi',
  },
  {
    id: 'ihiring',
    name: 'iHiring',
    emoji: '🧑‍💼',
    tagline: 'Tuyển dụng',
    description: 'Theo dõi vị trí đang mở, lịch phỏng vấn và đánh giá ứng viên cho hiring team.',
    category: 'Nhân sự',
    kind: 'external',
    platform: 'iHiring',
    action: 'xem pipeline tuyển dụng',
  },
  {
    id: 'irefer',
    name: 'iRefer',
    emoji: '🤝',
    tagline: 'Giới thiệu ứng viên',
    description: 'Giới thiệu bạn bè vào iKame, theo dõi trạng thái referral và thưởng giới thiệu.',
    category: 'Nhân sự',
    kind: 'external',
    platform: 'iRefer',
    action: 'gửi referral mới',
  },
];

/** Lọc theo từ khóa (tên/tagline/mô tả, không phân biệt hoa thường) + category. */
export function filterApps(apps: InternalApp[], query: string, category: AppCategory | 'all'): InternalApp[] {
  const q = query.trim().toLocaleLowerCase('vi');
  return apps.filter((app) => {
    if (category !== 'all' && app.category !== category) return false;
    if (!q) return true;
    return `${app.name} ${app.tagline} ${app.description}`.toLocaleLowerCase('vi').includes(q);
  });
}
