// Customizable Quick Actions catalog & per-person defaults
export type QuickActionCategory = 'Chấm công & Đơn từ' | 'Công việc & AI' | 'Văn hoá & Công cụ';

export interface QuickActionDef {
  id: string;
  label: string;
  category: QuickActionCategory;
  iconKey:
    | 'clock'
    | 'plane'
    | 'home'
    | 'timer'
    | 'calendarClock'
    | 'award'
    | 'door'
    | 'target'
    | 'ticket'
    | 'calendarDays'
    | 'book'
    | 'users'
    | 'calendar'
    | 'user'
    | 'compass';
  accentBg: string;
  accentFg: string;
  kind: 'checkin' | 'ai' | 'route' | 'sso_app';
  aiPrompt?: string;
  route?: string;
  appId?: string;
  onlyNewJoiner?: boolean;
}

export const QUICK_ACTIONS_CATALOG: QuickActionDef[] = [
  {
    id: 'qa-checkin',
    label: 'Chấm công',
    category: 'Chấm công & Đơn từ',
    iconKey: 'clock',
    accentBg: 'var(--brand-primary-subtle)',
    accentFg: 'var(--brand-primary-fg)',
    kind: 'checkin',
  },
  {
    id: 'qa-leave',
    label: 'Xin nghỉ phép',
    category: 'Chấm công & Đơn từ',
    iconKey: 'plane',
    accentBg: 'var(--info-bg)',
    accentFg: 'var(--info-fg)',
    kind: 'ai',
    aiPrompt: 'Xin nghỉ phép năm ngày thứ 6',
  },
  {
    id: 'qa-wfh',
    label: 'Đăng ký WFH',
    category: 'Chấm công & Đơn từ',
    iconKey: 'home',
    accentBg: 'var(--success-bg)',
    accentFg: 'var(--success-fg)',
    kind: 'ai',
    aiPrompt: 'Đăng ký WFH thứ 2 tuần tới',
  },
  {
    id: 'qa-forgot',
    label: 'Quên chấm công',
    category: 'Chấm công & Đơn từ',
    iconKey: 'timer',
    accentBg: 'var(--warning-bg)',
    accentFg: 'var(--warning-fg)',
    kind: 'ai',
    aiPrompt: 'Bổ sung quên chấm công sáng nay',
  },
  {
    id: 'qa-late',
    label: 'Đi muộn / Về sớm',
    category: 'Chấm công & Đơn từ',
    iconKey: 'calendarClock',
    accentBg: 'var(--warning-bg)',
    accentFg: 'var(--warning-fg)',
    kind: 'ai',
    aiPrompt: 'Xin đi muộn 60 phút ngày mai',
  },
  {
    id: 'qa-kudos',
    label: 'Gửi Kudos',
    category: 'Văn hoá & Công cụ',
    iconKey: 'award',
    accentBg: 'var(--violet-bg)',
    accentFg: 'var(--violet-fg)',
    kind: 'route',
    route: '/feed?compose=kudos',
  },
  {
    id: 'qa-room',
    label: 'Đặt phòng họp',
    category: 'Công việc & AI',
    iconKey: 'door',
    accentBg: 'var(--info-bg)',
    accentFg: 'var(--info-fg)',
    kind: 'ai',
    aiPrompt: 'Đặt phòng họp chiều nay',
  },
  {
    id: 'qa-okr',
    label: 'Check-in OKR',
    category: 'Công việc & AI',
    iconKey: 'target',
    accentBg: 'var(--brand-primary-subtle)',
    accentFg: 'var(--brand-primary-fg)',
    kind: 'ai',
    aiPrompt: 'Check-in OKR tuần 48',
  },
  {
    id: 'qa-irequest',
    label: 'Tạo iRequest',
    category: 'Công việc & AI',
    iconKey: 'ticket',
    accentBg: 'var(--violet-bg)',
    accentFg: 'var(--violet-fg)',
    kind: 'ai',
    aiPrompt: 'Tạo request IT hỗ trợ thiết bị',
  },
  {
    id: 'qa-balance',
    label: 'Số dư phép',
    category: 'Chấm công & Đơn từ',
    iconKey: 'calendarDays',
    accentBg: 'var(--success-bg)',
    accentFg: 'var(--success-fg)',
    kind: 'ai',
    aiPrompt: 'Số dư phép năm của tôi',
  },
  {
    id: 'qa-onboarding',
    label: 'Hành trình 60 ngày',
    category: 'Văn hoá & Công cụ',
    iconKey: 'compass',
    accentBg: 'var(--info-bg)',
    accentFg: 'var(--info-fg)',
    kind: 'route',
    route: '/onboarding',
    onlyNewJoiner: true,
  },
  {
    id: 'qa-iwiki',
    label: 'Mở iWiki',
    category: 'Văn hoá & Công cụ',
    iconKey: 'book',
    accentBg: 'var(--success-bg)',
    accentFg: 'var(--success-fg)',
    kind: 'sso_app',
    appId: 'app-iwiki',
  },
  {
    id: 'qa-people',
    label: 'Danh bạ',
    category: 'Văn hoá & Công cụ',
    iconKey: 'users',
    accentBg: 'var(--bg-subtle)',
    accentFg: 'var(--text-strong)',
    kind: 'route',
    route: '/search?tab=people',
  },
  {
    id: 'qa-events',
    label: 'Sự kiện',
    category: 'Văn hoá & Công cụ',
    iconKey: 'calendar',
    accentBg: 'var(--brand-primary-subtle)',
    accentFg: 'var(--brand-primary-fg)',
    kind: 'route',
    route: '/events',
  },
  {
    id: 'qa-profile',
    label: 'Hồ sơ HRIS',
    category: 'Văn hoá & Công cụ',
    iconKey: 'user',
    accentBg: 'var(--bg-subtle)',
    accentFg: 'var(--text-strong)',
    kind: 'route',
    route: '/profile',
  },
];

export const DEFAULT_QUICK_ACTION_IDS: Record<string, string[]> = {
  'u-an': ['qa-checkin', 'qa-leave', 'qa-wfh', 'qa-kudos', 'qa-room', 'qa-okr'],
  'u-huy': ['qa-checkin', 'qa-onboarding', 'qa-kudos', 'qa-irequest', 'qa-iwiki', 'qa-events'],
  'u-mai': ['qa-checkin', 'qa-room', 'qa-kudos', 'qa-okr', 'qa-people', 'qa-iwiki'],
  'u-ngoc': ['qa-checkin', 'qa-events', 'qa-kudos', 'qa-room', 'qa-people', 'qa-iwiki'],
};
