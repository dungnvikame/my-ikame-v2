import type { SearchSeedAnswer } from '../types';

/**
 * Seeded AI answers for the ~6 demo search queries (D4: never "đơ" off-seed —
 * the palette/SearchPage render a soft note + normal results when this misses).
 * Phase 1 shipped this EMPTY so the palette is complete without hardcoded answers;
 * Phase 6 fills the array — zero edits to the palette itself.
 * Numbers below are copied verbatim from the fixtures they cite (leaveBalance in
 * `people-data.ts`, `knowledgeDocs`/`initialEvents` in `mockData.ts`) so they never
 * contradict the pages the citations link to.
 */
export const searchSeedAnswers: SearchSeedAnswer[] = [
  {
    id: 'answer-leave',
    keywords: ['nghỉ phép', 'ngày phép'],
    question: 'Tôi còn bao nhiêu ngày phép?',
    level: 'A2',
    paragraphs: [
      'Bạn còn 7/12 ngày phép năm (đã dùng 5 ngày, 2 ngày chuyển từ năm trước) và đã dùng 1 ngày nghỉ ốm — số này khớp với mục Nghỉ phép & phúc lợi trong Hồ sơ của bạn.',
      'Gửi đơn xin nghỉ trên HRIS ít nhất 2 ngày làm việc trước ngày nghỉ (trừ nghỉ ốm); quản lý trực tiếp phê duyệt trong vòng 1 ngày làm việc.',
    ],
    citations: [
      { title: 'Quy trình xin nghỉ phép', source: 'iWiki', href: '/knowledge/leave-request-process' },
      { title: 'Hồ sơ của bạn', source: 'Hồ sơ', href: '/profile' },
    ],
  },
  {
    id: 'answer-okr',
    keywords: ['okr', 'mục tiêu'],
    question: 'OKR chu kỳ này là gì?',
    level: 'A2',
    paragraphs: [
      'Chu kỳ OKR hiện tại là H2-2026, cấu trúc theo Objective → tối đa 4 Key Result, mỗi Key Result gắn một số đo cụ thể để chấm điểm khách quan cuối chu kỳ.',
      'Check-in định kỳ trên My iKame ở mục Mục tiêu — cập nhật tiến độ, trạng thái và vướng mắc, không chỉ chờ đến cuối kỳ.',
    ],
    citations: [
      { title: 'Viết OKR chất lượng', source: 'iWiki', href: '/knowledge/okr-writing-guide' },
      { title: 'Mục tiêu', source: 'iGoal', href: '/goals' },
    ],
  },
  {
    id: 'answer-iconnect',
    keywords: ['iconnect'],
    question: 'iConnect tháng 8 diễn ra khi nào?',
    level: 'A2',
    paragraphs: [
      'iConnect tháng 8 diễn ra Thứ Năm, 20/08/2026, 15:30–17:30 tại Town Hall tầng 6 — chủ đề kết nối, học hỏi và chia sẻ cải tiến trải nghiệm làm việc.',
      'Đăng ký ngay trên trang Sự kiện; nếu đã đăng ký, trạng thái "Đã đăng ký" sẽ hiện trên thẻ sự kiện.',
    ],
    citations: [
      { title: 'iConnect tháng 8: Cùng xây trải nghiệm iKame tốt hơn', source: 'Tin tức', href: '/news/iconnect-august' },
      { title: 'iConnect tháng 8', source: 'Event', href: '/events/iconnect-2026-08' },
    ],
  },
  {
    id: 'answer-benefits',
    keywords: ['phúc lợi', 'bảo hiểm'],
    question: 'Phúc lợi và bảo hiểm của iKamer?',
    level: 'A2',
    paragraphs: [
      'Toàn bộ nhân viên chính thức được cấp bảo hiểm sức khoẻ Bảo Việt An Gia, hiệu lực từ ngày ký hợp đồng chính thức, cộng với khám sức khoẻ định kỳ 1 lần/năm qua People Team.',
      'Ngoài bảo hiểm, iKamer còn có phụ cấp gửi xe, ăn trưa và ngân sách học tập hằng năm.',
    ],
    citations: [
      { title: 'Phúc lợi & bảo hiểm', source: 'iWiki', href: '/knowledge/benefits-insurance' },
    ],
  },
  {
    id: 'answer-security',
    keywords: ['bảo mật', 'an toàn thông tin'],
    question: 'Chính sách bảo mật mới cần làm gì?',
    level: 'A2',
    paragraphs: [
      'Chính sách bảo mật tài khoản nội bộ vừa cập nhật quy định mật khẩu, thiết bị và quyền truy cập — cần xác nhận đã đọc trước 17:00 hôm nay.',
      'Mật khẩu tối thiểu 12 ký tự, bật xác thực hai lớp; phát hiện đăng nhập bất thường báo ngay IT qua #security-support.',
    ],
    citations: [
      { title: 'Cập nhật chính sách bảo mật tài khoản nội bộ', source: 'Tin tức', href: '/news/security-update' },
      { title: 'Chính sách bảo mật tài khoản nội bộ (bản đầy đủ)', source: 'iWiki', href: '/knowledge/security-policy-guide' },
    ],
  },
  {
    id: 'answer-checkin',
    keywords: ['check-in'],
    question: 'Nhịp check-in mục tiêu như thế nào?',
    level: 'A2',
    paragraphs: [
      'Check-in mục tiêu theo nhịp tuần trên My iKame — mở mục tiêu cần cập nhật và bấm "Tạo báo cáo" để ghi tiến độ mới, nội dung và vướng mắc (nếu có).',
      'Gửi báo cáo sẽ tự cập nhật trạng thái mục tiêu và lưu vào Tổng hợp báo cáo để xem lại lịch sử check-in.',
    ],
    citations: [
      { title: 'Mục tiêu', source: 'iGoal', href: '/goals' },
      { title: 'Viết OKR chất lượng', source: 'iWiki', href: '/knowledge/okr-writing-guide' },
    ],
  },
];

export function findSeedAnswer(query: string): SearchSeedAnswer | undefined {
  const q = query.trim().toLocaleLowerCase('vi');
  if (q.length < 2) return undefined;
  return searchSeedAnswers.find((answer) => answer.keywords.some((keyword) => q.includes(keyword.toLocaleLowerCase('vi'))));
}
