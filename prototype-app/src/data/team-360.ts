import type { MemberProfile360 } from '../types';

/**
 * Hồ sơ 360° của team Product & Technology — dữ liệu hư cấu, không dùng thông
 * tin nhân viên thật. Mỗi hồ sơ gộp 6 nguồn (HRIS · iGoal · 1:1 · iKame Feed ·
 * Learning · iRequest) để manager thấy bức tranh đầy đủ thay vì một trạng thái
 * chung chung. Số liệu phải nhất quán với `memberEksStats` và `attentionItems`.
 */
export const memberProfiles: Record<string, MemberProfile360> = {
  member_lan: {
    memberId: 'member_lan',
    email: 'lan.nguyen@ikameglobal.com',
    slack: '@lan.nguyen',
    location: 'Hà Nội · Tầng 5',
    joinedAt: '15/03/2024',
    tenureLabel: '2 năm 5 tháng',
    contractType: 'HĐLĐ không xác định thời hạn',
    managerName: 'Trần Thanh Mai',
    leaveRemaining: 6,
    leaveTotal: 12,
    upcomingLeaveLabel: 'Nghỉ phép 18–19/08 (chờ bạn duyệt)',
    signals: [
      { key: 'eks', label: 'Tiến độ EKS', value: '45%', hint: 'Dưới mức trung bình team (55%)', tone: 'watch', source: 'iGoal' },
      { key: 'checkin', label: 'Check-in', value: '4/6 kỳ', hint: 'Trễ 2 tuần liên tiếp', tone: 'risk', source: 'iGoal' },
      { key: 'oneonone', label: '1:1 gần nhất', value: '3 tuần trước', hint: 'Nhịp khuyến nghị: 2 tuần/lần', tone: 'watch', source: '1:1' },
      { key: 'workload', label: 'Khối lượng việc', value: 'Cao', hint: '3 dự án song song trong sprint này', tone: 'risk', source: 'iGoal' },
      { key: 'recognition', label: 'Ghi nhận 90 ngày', value: '4 lượt', hint: 'Được đồng nghiệp đánh giá cao', tone: 'good', source: 'iKame Feed' },
    ],
    aiInsight: {
      headline: 'Lan đang quá tải chứ không phải giảm động lực',
      bullets: [
        'Tiến độ EKS chậm lại đúng lúc nhận thêm dự án Core DS 1.1 (từ 20/07).',
        'Vẫn nhận 4 lượt ghi nhận trong 90 ngày — chất lượng công việc không giảm.',
        '1:1 gần nhất cách đây 3 tuần, dài hơn nhịp khuyến nghị của team.',
      ],
      suggestion: 'Đặt 1:1 trong tuần này để rà lại thứ tự ưu tiên và cân nhắc giãn deadline 1 trong 3 dự án.',
      suggestionPrompt: 'Soạn agenda 1:1 với Lan Nguyễn về cân bằng khối lượng công việc',
    },
    eks: [
      { id: 'eks-lan-1', code: 'KS1', title: 'Hoàn thiện design system Core DS 1.1 cho 5 module chính', progress: 55, status: 'needs_update', lastCheckIn: '2 tuần trước' },
      { id: 'eks-lan-2', code: 'KS2', title: 'Tái thiết kế hành trình onboarding nhân sự mới', progress: 40, status: 'at_risk', lastCheckIn: '2 tuần trước' },
      { id: 'eks-lan-3', code: 'KS3', title: 'Chuẩn hoá thư viện icon nội bộ', progress: 40, status: 'on_track', lastCheckIn: '1 tuần trước' },
    ],
    reportsSubmitted: 4,
    reportsExpected: 6,
    nextOneOnOneLabel: 'Chưa đặt lịch',
    oneOnOnes: [
      { id: 'oo-lan-1', dateLabel: '24/07/2026', topics: ['Ưu tiên Core DS 1.1', 'Hỗ trợ từ team FE'], outcome: 'Thống nhất tách phase 2 sang tháng 9.', mood: 'neutral' },
      { id: 'oo-lan-2', dateLabel: '10/07/2026', topics: ['Định hướng phát triển', 'Cơ hội mentor'], outcome: 'Lan muốn thử vai trò mentor cho designer mới.', mood: 'positive' },
    ],
    recognitions: [
      { id: 'rc-lan-1', fromName: 'Minh Trần', message: 'Bộ token màu mới giúp team FE giảm hẳn thời gian tranh luận style. Cảm ơn Lan!', dateLabel: '05/08', kind: 'praise' },
      { id: 'rc-lan-2', fromName: 'Ngọc Anh', message: 'Cảm ơn Lan đã hỗ trợ workshop research tuần trước.', dateLabel: '28/07', kind: 'praise' },
      { id: 'rc-lan-3', fromName: 'Ban Giám Đốc', message: 'iKame Star Q2-2026 — đóng góp nổi bật cho Core DS.', dateLabel: '30/06', kind: 'award' },
    ],
    skills: [
      { name: 'Design system', level: 4, target: 5 },
      { name: 'User research', level: 3, target: 4 },
      { name: 'Prototyping', level: 4, target: 4 },
      { name: 'Mentoring', level: 2, target: 3 },
    ],
    learning: [
      { id: 'ln-lan-1', title: 'Advanced Design Tokens', status: 'in_progress', progress: 60, dueLabel: 'Hạn 30/09' },
      { id: 'ln-lan-2', title: 'An toàn thông tin 2026 (bắt buộc)', status: 'done', progress: 100 },
      { id: 'ln-lan-3', title: 'Kỹ năng mentor 1:1', status: 'not_started', progress: 0, dueLabel: 'Gợi ý theo định hướng' },
    ],
    careerNote: 'Định hướng 12 tháng: Senior Product Designer, bổ sung năng lực mentoring và dẫn dắt design critique.',
    activities: [
      { id: 'ac-lan-1', source: 'iGoal', text: 'Cập nhật tiến độ KS3 lên 40%', timeLabel: '1 tuần trước' },
      { id: 'ac-lan-2', source: 'iKame Feed', text: 'Chia sẻ bài "Design tokens ở iKame sau 6 tháng"', timeLabel: '05/08' },
      { id: 'ac-lan-3', source: 'iRequest', text: 'Gửi đơn nghỉ phép 18–19/08', timeLabel: 'Hôm nay · 08:20' },
      { id: 'ac-lan-4', source: 'iWiki', text: 'Cập nhật tài liệu "Nguyên tắc sử dụng màu"', timeLabel: '02/08' },
      { id: 'ac-lan-5', source: 'Event', text: 'Đăng ký iConnect tháng 8', timeLabel: '01/08' },
    ],
  },

  member_minh: {
    memberId: 'member_minh',
    email: 'minh.tran@ikameglobal.com',
    slack: '@minh.tran',
    location: 'Hà Nội · Tầng 5',
    joinedAt: '02/01/2023',
    tenureLabel: '3 năm 7 tháng',
    contractType: 'HĐLĐ không xác định thời hạn',
    managerName: 'Trần Thanh Mai',
    leaveRemaining: 8,
    leaveTotal: 12,
    signals: [
      { key: 'eks', label: 'Tiến độ EKS', value: '50%', hint: 'Sát mức trung bình team (55%)', tone: 'watch', source: 'iGoal' },
      { key: 'checkin', label: 'Check-in', value: '5/6 kỳ', hint: 'Bỏ lỡ kỳ gần nhất', tone: 'watch', source: 'iGoal' },
      { key: 'oneonone', label: '1:1 gần nhất', value: '1 tuần trước', hint: 'Đúng nhịp 2 tuần/lần', tone: 'good', source: '1:1' },
      { key: 'workload', label: 'Khối lượng việc', value: 'Vừa phải', hint: '2 dự án trong sprint', tone: 'good', source: 'iGoal' },
      { key: 'recognition', label: 'Ghi nhận 90 ngày', value: '2 lượt', hint: 'Ổn định', tone: 'neutral', source: 'iKame Feed' },
    ],
    aiInsight: {
      headline: 'Minh ổn định, chỉ cần nhắc nhẹ nhịp check-in',
      bullets: [
        'Chỉ bỏ lỡ 1 kỳ check-in gần nhất, các kỳ trước đều đúng hạn.',
        '1:1 duy trì đều đặn, tinh thần tích cực trong buổi gần nhất.',
        'Đề xuất cấp màn hình phụ đang chờ bạn duyệt — ảnh hưởng hiệu suất làm việc.',
      ],
      suggestion: 'Duyệt đơn cấp màn hình và nhắc Minh cập nhật check-in kỳ này.',
      suggestionPrompt: 'Soạn tin nhắn nhắc check-in cho Minh Trần',
    },
    eks: [
      { id: 'eks-minh-1', code: 'KS1', title: 'Áp dụng Core DS 1.1 lên 5 module chính của My iKame', progress: 55, status: 'needs_update', lastCheckIn: '2 tuần trước' },
      { id: 'eks-minh-2', code: 'KS2', title: 'Giảm thời gian tải trang chủ xuống dưới 1.2s', progress: 45, status: 'on_track', lastCheckIn: '1 tuần trước' },
    ],
    reportsSubmitted: 5,
    reportsExpected: 6,
    nextOneOnOneLabel: 'Thứ Năm, 20/08 · 14:00',
    oneOnOnes: [
      { id: 'oo-minh-1', dateLabel: '06/08/2026', topics: ['Hiệu năng trang chủ', 'Thiết bị làm việc'], outcome: 'Minh cần thêm màn hình phụ để làm việc với design file lớn.', mood: 'positive' },
    ],
    recognitions: [
      { id: 'rc-minh-1', fromName: 'Hà Phạm', message: 'Minh fix bug regression cực nhanh trước đợt release.', dateLabel: '01/08', kind: 'praise' },
      { id: 'rc-minh-2', fromName: 'Lan Nguyễn', message: 'Cảm ơn Minh đã pair review toàn bộ component mới.', dateLabel: '18/07', kind: 'praise' },
    ],
    skills: [
      { name: 'React / TypeScript', level: 5, target: 5 },
      { name: 'Performance tuning', level: 3, target: 4 },
      { name: 'Accessibility', level: 3, target: 4 },
      { name: 'Code review', level: 4, target: 4 },
    ],
    learning: [
      { id: 'ln-minh-1', title: 'Web Performance Deep Dive', status: 'in_progress', progress: 35, dueLabel: 'Hạn 15/10' },
      { id: 'ln-minh-2', title: 'An toàn thông tin 2026 (bắt buộc)', status: 'done', progress: 100 },
    ],
    careerNote: 'Định hướng 12 tháng: Tech Lead mảng frontend, cần củng cố năng lực performance và dẫn dắt kỹ thuật.',
    activities: [
      { id: 'ac-minh-1', source: 'iRequest', text: 'Gửi đề xuất cấp màn hình phụ 27"', timeLabel: 'Hôm qua · 16:45' },
      { id: 'ac-minh-2', source: 'iGoal', text: 'Cập nhật tiến độ KS2 lên 45%', timeLabel: '1 tuần trước' },
      { id: 'ac-minh-3', source: 'iKame Feed', text: 'Bình luận bài chia sẻ về design tokens', timeLabel: '05/08' },
    ],
  },

  member_ha: {
    memberId: 'member_ha',
    email: 'ha.pham@ikameglobal.com',
    slack: '@ha.pham',
    location: 'Hà Nội · Tầng 5',
    joinedAt: '10/09/2024',
    tenureLabel: '1 năm 11 tháng',
    contractType: 'HĐLĐ 3 năm',
    managerName: 'Trần Thanh Mai',
    leaveRemaining: 9,
    leaveTotal: 12,
    upcomingLeaveLabel: 'Làm từ xa tuần 34 (chờ bạn duyệt)',
    signals: [
      { key: 'eks', label: 'Tiến độ EKS', value: '68%', hint: 'Trên mức trung bình team (55%)', tone: 'good', source: 'iGoal' },
      { key: 'checkin', label: 'Check-in', value: '6/6 kỳ', hint: 'Đầy đủ, gần nhất 3 ngày trước', tone: 'good', source: 'iGoal' },
      { key: 'oneonone', label: '1:1 gần nhất', value: '2 tuần trước', hint: 'Đúng nhịp', tone: 'good', source: '1:1' },
      { key: 'event', label: 'Sự kiện', value: 'Chưa phản hồi', hint: 'iConnect tháng 8 — RSVP đóng sau 2 ngày', tone: 'watch', source: 'Event' },
      { key: 'recognition', label: 'Ghi nhận 90 ngày', value: '3 lượt', hint: 'Được ghi nhận về chất lượng QA', tone: 'good', source: 'iKame Feed' },
    ],
    aiInsight: {
      headline: 'Hà đang là điểm sáng về kỷ luật thực thi',
      bullets: [
        'Check-in đủ 6/6 kỳ, tiến độ EKS cao nhất nhóm QA.',
        'Chưa phản hồi iConnect tháng 8 — hạn RSVP còn 2 ngày.',
        'Đơn làm từ xa tuần 34 đang chờ bạn duyệt.',
      ],
      suggestion: 'Ghi nhận công khai trên iKame Feed và xử lý đơn làm từ xa để Hà chủ động sắp xếp.',
      suggestionPrompt: 'Tôi có đơn nào đang chờ duyệt?',
    },
    eks: [
      { id: 'eks-ha-1', code: 'KS1', title: 'Audit accessibility toàn bộ màn hình chính đạt WCAG AA', progress: 100, status: 'done', lastCheckIn: '3 ngày trước' },
      { id: 'eks-ha-2', code: 'KS2', title: 'Xây bộ test regression tự động cho 3 luồng quan trọng', progress: 36, status: 'on_track', lastCheckIn: '3 ngày trước' },
    ],
    reportsSubmitted: 6,
    reportsExpected: 6,
    nextOneOnOneLabel: 'Thứ Ba, 18/08 · 10:00',
    oneOnOnes: [
      { id: 'oo-ha-1', dateLabel: '30/07/2026', topics: ['Kế hoạch automation', 'Sắp xếp làm từ xa'], outcome: 'Hà sẽ thử nghiệm Playwright cho luồng đăng ký sự kiện.', mood: 'positive' },
    ],
    recognitions: [
      { id: 'rc-ha-1', fromName: 'Tuấn Lê', message: 'Hà phát hiện lỗi dữ liệu trước khi lên production, cứu cả team một phen.', dateLabel: '08/08', kind: 'praise' },
      { id: 'rc-ha-2', fromName: 'Trần Thanh Mai', message: 'Chất lượng QA quý này rất đáng tin cậy.', dateLabel: '20/07', kind: 'praise' },
    ],
    skills: [
      { name: 'Test automation', level: 3, target: 5 },
      { name: 'Accessibility testing', level: 4, target: 4 },
      { name: 'Quy trình QA', level: 4, target: 4 },
    ],
    learning: [
      { id: 'ln-ha-1', title: 'Playwright cho kiểm thử E2E', status: 'in_progress', progress: 70, dueLabel: 'Hạn 20/09' },
      { id: 'ln-ha-2', title: 'An toàn thông tin 2026 (bắt buộc)', status: 'done', progress: 100 },
    ],
    careerNote: 'Định hướng 12 tháng: QA Automation Engineer, ưu tiên hoàn tất lộ trình automation.',
    activities: [
      { id: 'ac-ha-1', source: 'iRequest', text: 'Gửi đơn làm từ xa tuần 34', timeLabel: 'Hôm nay · 09:05' },
      { id: 'ac-ha-2', source: 'iGoal', text: 'Hoàn thành KS1 — audit accessibility đạt 100%', timeLabel: '3 ngày trước' },
      { id: 'ac-ha-3', source: 'iWiki', text: 'Viết tài liệu "Checklist QA trước release"', timeLabel: '29/07' },
    ],
  },

  member_tuan: {
    memberId: 'member_tuan',
    email: 'tuan.le@ikameglobal.com',
    slack: '@tuan.le',
    location: 'Hà Nội · Tầng 5',
    joinedAt: '05/06/2023',
    tenureLabel: '3 năm 2 tháng',
    contractType: 'HĐLĐ không xác định thời hạn',
    managerName: 'Trần Thanh Mai',
    leaveRemaining: 2,
    leaveTotal: 12,
    signals: [
      { key: 'eks', label: 'Tiến độ EKS', value: '38%', hint: 'Thấp nhất team — cần can thiệp', tone: 'risk', source: 'iGoal' },
      { key: 'checkin', label: 'Check-in', value: '5/6 kỳ', hint: 'Gần nhất 1 tuần trước', tone: 'watch', source: 'iGoal' },
      { key: 'oneonone', label: '1:1 gần nhất', value: '4 tuần trước', hint: 'Vượt nhịp khuyến nghị', tone: 'risk', source: '1:1' },
      { key: 'leave', label: 'Phép còn lại', value: '2/12 ngày', hint: 'Dùng gần hết — dấu hiệu cần nghỉ ngơi', tone: 'watch', source: 'HRIS' },
      { key: 'recognition', label: 'Ghi nhận 90 ngày', value: '1 lượt', hint: 'Ít tương tác trên iKame Feed', tone: 'watch', source: 'iKame Feed' },
    ],
    aiInsight: {
      headline: 'Tuấn cần được ưu tiên trao đổi sớm nhất trong team',
      bullets: [
        'Tiến độ EKS 38% — thấp nhất team và đang ở trạng thái rủi ro.',
        '1:1 gần nhất cách đây 4 tuần, dài gấp đôi nhịp khuyến nghị.',
        'Chỉ còn 2/12 ngày phép và ít tương tác trên iKame Feed 90 ngày qua.',
      ],
      suggestion: 'Đặt 1:1 riêng trong 48 giờ tới, tập trung lắng nghe trở ngại thay vì rà tiến độ.',
      suggestionPrompt: 'Soạn agenda 1:1 với Tuấn Lê về trở ngại đang gặp phải',
    },
    eks: [
      { id: 'eks-tuan-1', code: 'KS1', title: 'Chuẩn hoá API layer cho 4 module nội bộ', progress: 35, status: 'at_risk', lastCheckIn: '1 tuần trước' },
      { id: 'eks-tuan-2', code: 'KS2', title: 'Giảm thời gian phản hồi API xuống dưới 300ms', progress: 40, status: 'at_risk', lastCheckIn: '1 tuần trước' },
    ],
    reportsSubmitted: 5,
    reportsExpected: 6,
    nextOneOnOneLabel: 'Chưa đặt lịch',
    oneOnOnes: [
      { id: 'oo-tuan-1', dateLabel: '17/07/2026', topics: ['Phụ thuộc team hạ tầng', 'Tiến độ API layer'], outcome: 'Tuấn nêu việc chờ team hạ tầng cấp môi trường test.', mood: 'concern' },
    ],
    recognitions: [
      { id: 'rc-tuan-1', fromName: 'Minh Trần', message: 'Cảm ơn Tuấn đã hỗ trợ debug lỗi timeout cuối tuần.', dateLabel: '12/07', kind: 'praise' },
    ],
    skills: [
      { name: 'API design', level: 4, target: 5 },
      { name: 'Database tuning', level: 3, target: 4 },
      { name: 'Giao tiếp chủ động', level: 2, target: 4 },
    ],
    learning: [
      { id: 'ln-tuan-1', title: 'An toàn thông tin 2026 (bắt buộc)', status: 'in_progress', progress: 40, dueLabel: 'Hạn 31/08' },
      { id: 'ln-tuan-2', title: 'Giao tiếp trong môi trường kỹ thuật', status: 'not_started', progress: 0, dueLabel: 'Gợi ý theo định hướng' },
    ],
    careerNote: 'Định hướng 12 tháng: Senior Backend Engineer, cần cải thiện giao tiếp chủ động khi gặp vật cản.',
    activities: [
      { id: 'ac-tuan-1', source: 'iGoal', text: 'Cập nhật KS2 — ghi nhận vướng mắc môi trường test', timeLabel: '1 tuần trước' },
      { id: 'ac-tuan-2', source: 'Event', text: 'Chưa phản hồi iConnect tháng 8', timeLabel: '3 ngày trước' },
    ],
  },

  member_ngocanh: {
    memberId: 'member_ngocanh',
    email: 'ngoc.anh@ikameglobal.com',
    slack: '@ngoc.anh',
    location: 'Hà Nội · Tầng 5',
    joinedAt: '20/02/2025',
    tenureLabel: '1 năm 6 tháng',
    contractType: 'HĐLĐ 3 năm',
    managerName: 'Trần Thanh Mai',
    leaveRemaining: 10,
    leaveTotal: 12,
    signals: [
      { key: 'eks', label: 'Tiến độ EKS', value: '72%', hint: 'Cao nhất team', tone: 'good', source: 'iGoal' },
      { key: 'checkin', label: 'Check-in', value: '6/6 kỳ', hint: 'Gần nhất hôm qua', tone: 'good', source: 'iGoal' },
      { key: 'oneonone', label: '1:1 gần nhất', value: '1 tuần trước', hint: 'Đúng nhịp', tone: 'good', source: '1:1' },
      { key: 'event', label: 'Sự kiện', value: 'Chưa phản hồi', hint: 'iConnect tháng 8 — RSVP đóng sau 2 ngày', tone: 'watch', source: 'Event' },
      { key: 'recognition', label: 'Ghi nhận 90 ngày', value: '5 lượt', hint: 'Nhiều nhất team', tone: 'good', source: 'iKame Feed' },
    ],
    aiInsight: {
      headline: 'Ngọc Anh sẵn sàng cho trách nhiệm lớn hơn',
      bullets: [
        'Tiến độ EKS 72% — cao nhất team, check-in đủ 6/6 kỳ.',
        'Nhận 5 lượt ghi nhận trong 90 ngày, nhiều nhất team.',
        'Đã hoàn tất toàn bộ khoá học bắt buộc trước hạn.',
      ],
      suggestion: 'Trao đổi về cơ hội dẫn dắt một sáng kiến nhỏ trong quý tới để giữ đà phát triển.',
      suggestionPrompt: 'Soạn agenda 1:1 với Ngọc Anh về lộ trình phát triển',
    },
    eks: [
      { id: 'eks-na-1', code: 'KS1', title: 'Chuẩn hoá tài liệu nghiệp vụ cho 6 luồng chính', progress: 80, status: 'on_track', lastCheckIn: 'Hôm qua' },
      { id: 'eks-na-2', code: 'KS2', title: 'Xây kho research insight dùng chung cho khối Product', progress: 64, status: 'on_track', lastCheckIn: 'Hôm qua' },
    ],
    reportsSubmitted: 6,
    reportsExpected: 6,
    nextOneOnOneLabel: 'Thứ Tư, 19/08 · 15:00',
    oneOnOnes: [
      { id: 'oo-na-1', dateLabel: '07/08/2026', topics: ['Kho research insight', 'Mong muốn phát triển'], outcome: 'Ngọc Anh quan tâm tới vai trò dẫn dắt phân tích nghiệp vụ.', mood: 'positive' },
    ],
    recognitions: [
      { id: 'rc-na-1', fromName: 'Lan Nguyễn', message: 'Tài liệu nghiệp vụ của Ngọc Anh giúp design đỡ đoán mò rất nhiều.', dateLabel: '10/08', kind: 'praise' },
      { id: 'rc-na-2', fromName: 'Hà Phạm', message: 'Cảm ơn Ngọc Anh đã làm rõ luồng dữ liệu cho ca kiểm thử.', dateLabel: '02/08', kind: 'praise' },
    ],
    skills: [
      { name: 'Phân tích nghiệp vụ', level: 4, target: 5 },
      { name: 'Data storytelling', level: 3, target: 4 },
      { name: 'Điều phối bên liên quan', level: 3, target: 4 },
    ],
    learning: [
      { id: 'ln-na-1', title: 'Data storytelling cho BA', status: 'in_progress', progress: 80, dueLabel: 'Hạn 30/08' },
      { id: 'ln-na-2', title: 'An toàn thông tin 2026 (bắt buộc)', status: 'done', progress: 100 },
    ],
    careerNote: 'Định hướng 12 tháng: Senior Business Analyst, sẵn sàng nhận vai trò dẫn dắt sáng kiến.',
    activities: [
      { id: 'ac-na-1', source: 'iGoal', text: 'Gửi báo cáo check-in tuần 33', timeLabel: 'Hôm qua' },
      { id: 'ac-na-2', source: 'iKame Feed', text: 'Chia sẻ tổng hợp insight người dùng tháng 7', timeLabel: '06/08' },
      { id: 'ac-na-3', source: 'Event', text: 'Chưa phản hồi iConnect tháng 8', timeLabel: '3 ngày trước' },
    ],
  },

  member_giahuy: {
    memberId: 'member_giahuy',
    email: 'giahuy.pham@ikameglobal.com',
    slack: 'Chưa kích hoạt',
    location: 'Hà Nội · Tầng 5 (dự kiến)',
    joinedAt: '17/08/2026 (sắp tới)',
    tenureLabel: 'Chưa gia nhập',
    contractType: 'HĐLĐ thử việc 2 tháng',
    managerName: 'Trần Thanh Mai',
    leaveRemaining: 0,
    leaveTotal: 12,
    signals: [
      { key: 'onboarding', label: 'Chuẩn bị onboarding', value: '3/6 mục', hint: 'Còn thiết bị, tài khoản và buddy', tone: 'watch', source: 'HRIS' },
      { key: 'start', label: 'Ngày bắt đầu', value: 'Còn 4 ngày', hint: '17/08/2026', tone: 'neutral', source: 'HRIS' },
      { key: 'eks', label: 'Mục tiêu thử việc', value: 'Chưa thiết lập', hint: 'Cần thống nhất trong tuần đầu', tone: 'watch', source: 'iGoal' },
    ],
    aiInsight: {
      headline: 'Còn 4 ngày nữa Gia Huy gia nhập — 3 việc chuẩn bị chưa xong',
      bullets: [
        'Thiết bị và tài khoản nội bộ chưa được cấp.',
        'Chưa chỉ định buddy đồng hành 30 ngày đầu.',
        'Mục tiêu thử việc chưa được thiết lập trên iGoal.',
      ],
      suggestion: 'Hoàn tất checklist onboarding trước 16/08 để ngày đầu tiên của Gia Huy trọn vẹn.',
      suggestionPrompt: 'Tạo request IT support: cấp thiết bị và tài khoản cho thành viên mới Gia Huy',
    },
    eks: [],
    reportsSubmitted: 0,
    reportsExpected: 0,
    nextOneOnOneLabel: 'Ngày đầu tiên · 17/08 · 09:30',
    oneOnOnes: [],
    recognitions: [],
    skills: [
      { name: 'Product design', level: 3, target: 4 },
      { name: 'Design system', level: 2, target: 3 },
    ],
    learning: [
      { id: 'ln-gh-1', title: 'Onboarding iKame 101', status: 'not_started', progress: 0, dueLabel: 'Tuần đầu tiên' },
      { id: 'ln-gh-2', title: 'An toàn thông tin 2026 (bắt buộc)', status: 'not_started', progress: 0, dueLabel: 'Trong 30 ngày' },
    ],
    careerNote: 'Giai đoạn thử việc 2 tháng: tập trung hoà nhập team và nắm quy trình thiết kế nội bộ.',
    activities: [
      { id: 'ac-gh-1', source: 'HRIS', text: 'Hồ sơ nhân sự đã hoàn tất, chờ ngày gia nhập', timeLabel: '10/08' },
    ],
  },
};

export function memberProfile(memberId: string): MemberProfile360 | undefined {
  return memberProfiles[memberId];
}
