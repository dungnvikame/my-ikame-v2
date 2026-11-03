/**
 * Engagement tuần (mock) — nguồn duy nhất cho "Nhịp team" của Manager và tile WAER của COM.
 * WAER (Weekly Active Engagement Rate) = tỷ lệ người có ≥1 hành động CÓ NGHĨA trong tuần:
 * xác nhận thông báo, đăng/ghi nhận, check-in OKR đúng hạn, gửi request. Chấm công không tính
 * (ai cũng phải làm). Dữ liệu kể cùng câu chuyện với roster/attention: Tuấn chùng xuống,
 * Lan/Minh trễ check-in, Hà/Ngọc Anh ổn, Gia Huy (người mới) đang hoà nhập.
 */
export type EngagementActions = {
  ack: number;
  post: number;
  kudosGiven: number;
  kudosReceived: number;
  checkInOnTime: boolean;
  request: number;
};

export type MemberWeekEngagement = { memberId: string; thisWeek: EngagementActions; lastWeek: EngagementActions };

export const ENGAGEMENT_WEEK_LABEL = 'tuần 45';

export const teamEngagement: MemberWeekEngagement[] = [
  { memberId: 'member_lan', thisWeek: { ack: 2, post: 3, kudosGiven: 1, kudosReceived: 1, checkInOnTime: false, request: 1 }, lastWeek: { ack: 1, post: 4, kudosGiven: 1, kudosReceived: 2, checkInOnTime: false, request: 0 } },
  { memberId: 'member_minh', thisWeek: { ack: 1, post: 0, kudosGiven: 0, kudosReceived: 0, checkInOnTime: false, request: 1 }, lastWeek: { ack: 1, post: 1, kudosGiven: 0, kudosReceived: 0, checkInOnTime: true, request: 0 } },
  { memberId: 'member_ha', thisWeek: { ack: 2, post: 1, kudosGiven: 1, kudosReceived: 1, checkInOnTime: true, request: 0 }, lastWeek: { ack: 1, post: 2, kudosGiven: 0, kudosReceived: 1, checkInOnTime: true, request: 0 } },
  { memberId: 'member_tuan', thisWeek: { ack: 0, post: 0, kudosGiven: 0, kudosReceived: 0, checkInOnTime: false, request: 0 }, lastWeek: { ack: 1, post: 0, kudosGiven: 0, kudosReceived: 0, checkInOnTime: false, request: 0 } },
  { memberId: 'member_ngocanh', thisWeek: { ack: 2, post: 1, kudosGiven: 1, kudosReceived: 0, checkInOnTime: true, request: 0 }, lastWeek: { ack: 1, post: 1, kudosGiven: 1, kudosReceived: 1, checkInOnTime: true, request: 1 } },
  { memberId: 'member_giahuy', thisWeek: { ack: 2, post: 1, kudosGiven: 1, kudosReceived: 1, checkInOnTime: true, request: 0 }, lastWeek: { ack: 1, post: 1, kudosGiven: 0, kudosReceived: 0, checkInOnTime: true, request: 1 } },
];

/** Toàn công ty — số liệu nền tảng (GA + SSO + event log), mock cố định cho Tổng quan COM. */
export const companyWeek = {
  label: ENGAGEMENT_WEEK_LABEL,
  headcount: 184,
  active: 131,
  lastActive: 121,
  /** Tỷ lệ iKamer có ít nhất một hành động loại này trong tuần. */
  breakdown: [
    { key: 'ack', label: 'Xác nhận thông báo', percent: 58 },
    { key: 'attendance', label: 'Chấm công qua My iKame (tham chiếu, không tính WAER)', percent: 69 },
    { key: 'post', label: 'Đăng bài / Kudos', percent: 34 },
    { key: 'checkin', label: 'Check-in OKR đúng hạn', percent: 47 },
    { key: 'request', label: 'Gửi request / đơn', percent: 21 },
  ],
};
