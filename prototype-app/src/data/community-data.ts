import type { BirthdayPerson, Milestone, Post, TopFan } from '../types';

// Cộng đồng (Demo v2 social module) — nội dung hư cấu, không dùng dữ liệu/ảnh nhân viên thật.
// Feed order = mảng order (pinned 3 trước, mới nhất trước trong phần còn lại).
export const initialPosts: Post[] = [
  {
    id: 'post-pinned-culture',
    authorName: 'iKame People',
    authorShort: 'People',
    role: 'HR',
    time: '2 ngày trước',
    body: 'Quy tắc văn hoá iKame 2026 đã được cập nhật — 5 giá trị cốt lõi và cách áp dụng vào công việc hằng ngày. Mời mọi người dành 5 phút đọc qua nhé!',
    cover: { pattern: 'aurora', emoji: '🏆', caption: 'Văn hoá iKame 2026' },
    official: true,
    pinned: true,
    pinnedUntilLabel: 'Ghim đến 31/08',
    reactions: { heart: 24, clap: 9 },
    myReactions: [],
    comments: [
      { id: 'comment-culture-1', authorName: 'Lan Nguyễn', authorShort: 'Lan', role: 'Product Designer', text: 'Rất rõ ràng, cảm ơn team People!', time: '1 ngày trước' },
    ],
  },
  {
    id: 'post-pinned-iconnect',
    authorName: 'iKame People',
    authorShort: 'People',
    role: 'HR',
    time: '3 ngày trước',
    body: 'iConnect tháng 8 diễn ra 20/08 tại Town Hall tầng 6 — cùng cập nhật những thay đổi mới và kết nối với các team khác. Đăng ký ngay tại /events/iconnect-2026-08.',
    cover: { pattern: 'confetti', emoji: '🎉', caption: 'iConnect tháng 8' },
    official: true,
    pinned: true,
    pinnedUntilLabel: 'Ghim đến 20/08',
    reactions: { heart: 31, clap: 12 },
    myReactions: [],
    comments: [
      { id: 'comment-iconnect-1', authorName: 'Minh Trần', authorShort: 'Minh', role: 'Frontend Developer', text: 'Đăng ký rồi, hẹn gặp mọi người!', time: '2 ngày trước' },
      { id: 'comment-iconnect-2', authorName: 'Hà Phạm', authorShort: 'Hà', role: 'QA Engineer', text: 'Team mình đi đông đủ luôn.', time: '1 ngày trước' },
    ],
  },
  {
    id: 'post-pinned-wellness',
    authorName: 'iKame People',
    authorShort: 'People',
    role: 'HR',
    time: '4 ngày trước',
    body: 'Khám sức khoẻ định kỳ tháng 9 sẽ được tổ chức tại văn phòng — xem chi tiết gói khám và cách đặt lịch trong tài liệu phúc lợi.',
    cover: { pattern: 'grid', emoji: '🩺', caption: 'Khám sức khoẻ định kỳ' },
    official: true,
    pinned: true,
    pinnedUntilLabel: 'Ghim đến 26/09',
    reactions: { heart: 12, clap: 3 },
    myReactions: [],
    comments: [],
  },
  {
    id: 'post-mention-an',
    authorName: 'Minh Trần',
    authorShort: 'Minh',
    role: 'Frontend Developer',
    time: '6 giờ trước',
    body: '@An nhờ bạn review giúp flow onboarding mới trước khi mình build nhé, có vài chỗ mình chưa chắc về trạng thái rỗng.',
    mentionsMe: true,
    reactions: { heart: 7, clap: 2 },
    myReactions: [],
    comments: [
      { id: 'comment-mention-1', authorName: 'Nguyễn Hoàng An', authorShort: 'An', role: 'Product Designer', text: 'Ok để mình xem trong hôm nay!', time: '5 giờ trước' },
      { id: 'comment-mention-2', authorName: 'Minh Trần', authorShort: 'Minh', role: 'Frontend Developer', text: 'Cảm ơn bạn nhiều!', time: '4 giờ trước' },
    ],
  },
  {
    id: 'post-product-demo',
    authorName: 'Lan Nguyễn',
    authorShort: 'Lan',
    role: 'Product Designer',
    time: '1 ngày trước',
    body: 'Recap Demo Day Core DS 1.1 — cảm ơn mọi người đã tham gia đông đủ, video ghi hình đã có trong tài liệu Design.',
    cover: { pattern: 'grid', emoji: '🎨', caption: 'Demo Day Core DS 1.1' },
    reactions: { heart: 18, clap: 6 },
    myReactions: [],
    comments: [
      { id: 'comment-demo-1', authorName: 'Tuấn Lê', authorShort: 'Tuấn', role: 'Backend Developer', text: 'Component mới đẹp quá!', time: '20 giờ trước' },
      { id: 'comment-demo-2', authorName: 'Ngọc Anh', authorShort: 'Ngọc Anh', role: 'Business Analyst', text: 'Rất hữu ích cho team mình.', time: '18 giờ trước' },
    ],
  },
  {
    id: 'post-birthday-vy',
    authorName: 'iKame People',
    authorShort: 'People',
    role: 'HR',
    time: 'Hôm nay',
    body: 'Sinh nhật hôm nay: Trần Ngọc Vy, Lê Minh Quân và Phạm Thu Hằng 🎂 Cùng gửi lời chúc mừng đến 3 iKamer nhé!',
    cover: { pattern: 'confetti', emoji: '🎂', caption: 'Sinh nhật hôm nay' },
    official: true,
    reactions: { heart: 15, clap: 8 },
    myReactions: [],
    comments: [
      { id: 'comment-birthday-1', authorName: 'Lan Nguyễn', authorShort: 'Lan', role: 'Product Designer', text: 'Chúc mừng sinh nhật cả 3 bạn!', time: '3 giờ trước' },
      { id: 'comment-birthday-2', authorName: 'Hà Phạm', authorShort: 'Hà', role: 'QA Engineer', text: 'Chúc mọi điều tốt lành nhé!', time: '2 giờ trước' },
    ],
  },
  {
    id: 'post-newcomer-huy',
    authorName: 'iKame People',
    authorShort: 'People',
    role: 'HR',
    time: '2 ngày trước',
    body: 'Chào mừng Phạm Gia Huy chính thức gia nhập iKame từ 17/08 ở vai trò Product Designer — cùng chào đón thành viên mới nhé!',
    cover: { pattern: 'aurora', emoji: '👋', caption: 'Chào người mới' },
    official: true,
    reactions: { heart: 21, clap: 5 },
    myReactions: [],
    comments: [
      { id: 'comment-newcomer-1', authorName: 'Minh Trần', authorShort: 'Minh', role: 'Frontend Developer', text: 'Chào mừng Huy đến với team!', time: '1 ngày trước' },
    ],
  },
  {
    id: 'post-running-club',
    authorName: 'Hà Phạm',
    authorShort: 'Hà',
    role: 'QA Engineer',
    time: '2 ngày trước',
    body: 'iKame Running Club cuối tuần này chạy tại Hồ Tây, 05:45 sáng thứ Bảy — mọi cấp độ đều tham gia được, đăng ký ở /events/running-club.',
    cover: { pattern: 'wave', emoji: '🏃', caption: 'Running Club Hồ Tây' },
    reactions: { heart: 9, clap: 4 },
    myReactions: [],
    comments: [
      { id: 'comment-running-1', authorName: 'Tuấn Lê', authorShort: 'Tuấn', role: 'Backend Developer', text: 'Đăng ký rồi, hẹn gặp cả nhóm!', time: '1 ngày trước' },
      { id: 'comment-running-2', authorName: 'Ngọc Anh', authorShort: 'Ngọc Anh', role: 'Business Analyst', text: 'Lần đầu tham gia, mong mọi người chỉ dẫn.', time: '20 giờ trước' },
      { id: 'comment-running-3', authorName: 'Lan Nguyễn', authorShort: 'Lan', role: 'Product Designer', text: 'Trời đẹp chắc chạy sẽ vui lắm.', time: '18 giờ trước' },
    ],
  },
  {
    id: 'post-tip-okr',
    authorName: 'Tuấn Lê',
    authorShort: 'Tuấn',
    role: 'Backend Developer',
    time: '3 ngày trước',
    body: 'Tip nhỏ khi viết Key Result: luôn gắn một số đo cụ thể (%, số lượng, thời gian) — mình có để link template OKR chi tiết trong Tri thức.',
    reactions: { heart: 6, clap: 1 },
    myReactions: [],
    comments: [
      { id: 'comment-tip-1', authorName: 'Nguyễn Hoàng An', authorShort: 'An', role: 'Product Designer', text: 'Đúng cái mình đang cần, cảm ơn Tuấn!', time: '2 ngày trước' },
    ],
  },
];

// Rail: tất cả cùng "Sinh nhật hôm nay" trỏ về 1 bài viết chung — feed lean, `congratulate`
// luôn có mục tiêu comment (RED TEAM tương tự F3: không tạo bài rác cho mỗi người).
export const initialBirthdays: BirthdayPerson[] = [
  { id: 'birthday-vy', name: 'Trần Ngọc Vy', shortName: 'Vy', role: 'Content Creator', team: 'Marketing', dateLabel: 'Hôm nay', postId: 'post-birthday-vy', congratulated: false },
  { id: 'birthday-quan', name: 'Lê Minh Quân', shortName: 'Quân', role: 'Data Analyst', team: 'Data', dateLabel: 'Hôm nay', postId: 'post-birthday-vy', congratulated: false },
  { id: 'birthday-hang', name: 'Phạm Thu Hằng', shortName: 'Hằng', role: 'HR Executive', team: 'People', dateLabel: 'Hôm nay', postId: 'post-birthday-vy', congratulated: false },
];

export const initialMilestones: Milestone[] = [
  { id: 'milestone-lan', name: 'Lan Nguyễn', shortName: 'Lan', years: 3, dateLabel: 'Tháng này', note: 'Product Designer · 3 năm đồng hành cùng iKame' },
  { id: 'milestone-tuan', name: 'Tuấn Lê', shortName: 'Tuấn', years: 5, dateLabel: 'Tháng này', note: 'Backend Developer · 5 năm đồng hành cùng iKame' },
];

export const initialTopFans: TopFan[] = [
  { id: 'fan-lan', name: 'Lan Nguyễn', shortName: 'Lan', points: 120, note: '12 bài chia sẻ tuần này' },
  { id: 'fan-minh', name: 'Minh Trần', shortName: 'Minh', points: 98, note: '9 bình luận hữu ích' },
  { id: 'fan-ha', name: 'Hà Phạm', shortName: 'Hà', points: 76, note: 'Tổ chức Running Club đều đặn' },
  { id: 'fan-tuan', name: 'Tuấn Lê', shortName: 'Tuấn', points: 60, note: 'Chia sẻ tip OKR chất lượng' },
  { id: 'fan-ngocanh', name: 'Ngọc Anh', shortName: 'Ngọc Anh', points: 48, note: 'Tích cực tương tác bài viết mới' },
];
