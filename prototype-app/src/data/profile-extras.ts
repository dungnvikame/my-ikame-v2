/**
 * Dữ liệu mẫu cho trang Cá nhân (hành trình, giá trị cốt lõi, DISC, thiết bị, ticket IT).
 * Toàn bộ là dữ liệu hư cấu để demo, không phải số liệu thật.
 */

/** Ngày "hôm nay" (đầu ngày theo giờ máy) — mọi mốc gắn bó, sinh nhật, chấm công tính từ đây. */
export const DEMO_TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

/** Ngày lễ trong 12 tuần gần nhất của bản demo (dd/mm). */
export const HOLIDAYS = ['01/09', '02/09'];

// ---------- Hành trình ----------
export type JourneyKind = 'join' | 'official' | 'project' | 'award' | 'event';
export type JourneyItem = { id: string; kind: JourneyKind; dateLabel: string; title: string; note: string };

export const JOURNEY_KIND_LABEL: Record<JourneyKind, string> = {
  join: 'Ngày vào', official: 'Lên chính thức', project: 'Dự án lớn', award: 'Giải thưởng', event: 'Sự kiện',
};

/** Hành trình mẫu của An; người khác dùng cột mốc thâm niên có sẵn. */
export const journeyByPerson: Record<string, JourneyItem[]> = {
  person_an: [
    { id: 'j-join', kind: 'join', dateLabel: '01/06/2023', title: 'Gia nhập iKame', note: 'Ngày đầu tiên tại khối Product & Technology.' },
    { id: 'j-official', kind: 'official', dateLabel: '01/2024', title: 'Lên chính thức', note: 'Được xác nhận vai trò Product Designer.' },
    { id: 'j-event', kind: 'event', dateLabel: '09/2024', title: 'iKame Summit 2024', note: 'Lần đầu lên sân khấu chia sẻ về trải nghiệm người dùng.' },
    { id: 'j-project', kind: 'project', dateLabel: '03/2025', title: 'Ra mắt Core DS 1.0', note: 'Đồng thiết kế bộ giao diện chung cho toàn công ty.' },
    { id: 'j-2y', kind: 'event', dateLabel: '06/2025', title: 'Tròn 2 năm đồng hành', note: 'Kỷ niệm 2 năm gắn bó cùng iKame.' },
    { id: 'j-award', kind: 'award', dateLabel: 'Q4-2025', title: 'Giải iKame Star Q4-2025', note: 'Ghi nhận đóng góp nổi bật trong dự án Core DS 1.1.' },
    { id: 'j-3y', kind: 'event', dateLabel: '06/2026', title: 'Tròn 3 năm đồng hành', note: 'Cột mốc 3 năm cùng đội Product.' },
    { id: 'j-project2', kind: 'project', dateLabel: '10/2026', title: 'My iKame MVP', note: 'Tham gia thiết kế cổng làm việc chung My iKame.' },
  ],
};

// ---------- Giá trị cốt lõi ----------
// Giá trị mẫu để demo — thay bằng bộ giá trị cốt lõi chính thức khi có.
export type CoreValue = {
  id: string;
  label: string;
  short: string;
  weeks: { title: string; tasks: string[] }[];
};

export const CORE_VALUES: CoreValue[] = [
  { id: 'customer', label: 'Khách hàng là trọng tâm', short: 'Khách hàng', weeks: [
    { title: 'Lắng nghe người dùng', tasks: ['Đọc 5 phản hồi mới nhất của người dùng nội bộ', 'Ghi lại 2 điều bạn chưa hiểu về nhu cầu của họ'] },
    { title: 'Biến phản hồi thành việc làm', tasks: ['Chọn 1 phản hồi và đề xuất cách cải thiện', 'Hẹn 15 phút trò chuyện với một người dùng thật'] },
  ] },
  { id: 'proactive', label: 'Chủ động', short: 'Chủ động', weeks: [
    { title: 'Nhìn trước một bước', tasks: ['Liệt kê 3 rủi ro của việc đang làm', 'Báo trước cho người liên quan trước khi bị hỏi'] },
    { title: 'Tự nhận việc nhỏ', tasks: ['Nhận 1 việc tồn đọng không ai phụ trách', 'Đề xuất 1 cải tiến quy trình cho nhóm'] },
  ] },
  { id: 'learning', label: 'Học hỏi không ngừng', short: 'Học hỏi', weeks: [
    { title: 'Lịch học đều đặn', tasks: ['Dành 30 phút mỗi ngày cho một chủ đề mới', 'Đọc 1 bài trên iWiki ngoài chuyên môn'] },
    { title: 'Chia sẻ lại điều đã học', tasks: ['Viết 5 dòng tóm tắt điều học được trên iCOM', 'Trình bày nhanh 10 phút cho đồng nghiệp'] },
  ] },
  { id: 'collab', label: 'Hợp tác', short: 'Hợp tác', weeks: [
    { title: 'Mở rộng kết nối', tasks: ['Cà phê 15 phút với một người ở team khác', 'Hỏi một đồng nghiệp xem bạn có thể hỗ trợ gì'] },
    { title: 'Cùng làm, cùng chịu trách nhiệm', tasks: ['Chia sẻ tiến độ công khai trong kênh nhóm', 'Nhờ góp ý sớm cho một sản phẩm đang dang dở'] },
  ] },
  { id: 'integrity', label: 'Chính trực', short: 'Chính trực', weeks: [
    { title: 'Nói đúng sự thật', tasks: ['Báo cáo tiến độ đúng thực tế, kể cả khi chậm', 'Nhận một sai sót nhỏ và nêu cách khắc phục'] },
    { title: 'Giữ lời hứa', tasks: ['Chỉ hứa những gì chắc làm được trong tuần này', 'Kiểm tra lại các cam kết đang mở và cập nhật'] },
  ] },
  { id: 'efficiency', label: 'Hiệu quả', short: 'Hiệu quả', weeks: [
    { title: 'Tập trung vào điều quan trọng', tasks: ['Chọn 3 việc ưu tiên cao nhất cho mỗi ngày', 'Chặn 2 khung giờ làm việc sâu trong tuần'] },
    { title: 'Bỏ bớt việc thừa', tasks: ['Tìm 1 cuộc họp hoặc báo cáo có thể bỏ hoặc gộp', 'Tự động hoá một việc lặp lại'] },
  ] },
];

// ---------- DISC ----------
export type DiscType = 'D' | 'I' | 'S' | 'C';
export type DiscQuestion = { id: string; prompt: string; options: { type: DiscType; text: string }[] };

export const DISC_QUESTIONS: DiscQuestion[] = [
  { id: 'q1', prompt: 'Khi nhóm gặp vấn đề gấp, bạn thường:', options: [
    { type: 'D', text: 'Nhận quyền quyết định và hành động ngay' },
    { type: 'I', text: 'Kêu gọi mọi người cùng nghĩ cách và giữ tinh thần' },
    { type: 'S', text: 'Giữ bình tĩnh, hỗ trợ từng người xử lý phần của họ' },
    { type: 'C', text: 'Phân tích nguyên nhân kỹ rồi mới đề xuất giải pháp' },
  ] },
  { id: 'q2', prompt: 'Trong một cuộc họp, bạn là người:', options: [
    { type: 'D', text: 'Đi thẳng vào kết luận và việc cần làm' },
    { type: 'I', text: 'Khuấy động, kết nối ý tưởng của nhiều người' },
    { type: 'S', text: 'Lắng nghe và đảm bảo ai cũng được nói' },
    { type: 'C', text: 'Chuẩn bị số liệu, hỏi kỹ các chi tiết' },
  ] },
  { id: 'q3', prompt: 'Điều khiến bạn hào hứng nhất ở công việc:', options: [
    { type: 'D', text: 'Đạt được kết quả lớn và vượt thử thách' },
    { type: 'I', text: 'Được làm việc cùng nhiều người thú vị' },
    { type: 'S', text: 'Môi trường ổn định, đồng đội tin cậy' },
    { type: 'C', text: 'Làm ra sản phẩm chính xác, chất lượng cao' },
  ] },
  { id: 'q4', prompt: 'Khi nhận góp ý chưa thuận tai, bạn:', options: [
    { type: 'D', text: 'Phản biện thẳng nếu thấy chưa đúng' },
    { type: 'I', text: 'Trao đổi cởi mở và giữ không khí vui vẻ' },
    { type: 'S', text: 'Im lặng suy nghĩ rồi mới phản hồi' },
    { type: 'C', text: 'Đòi dẫn chứng cụ thể trước khi đồng ý' },
  ] },
  { id: 'q5', prompt: 'Bạn bắt đầu một dự án mới bằng cách:', options: [
    { type: 'D', text: 'Đặt mục tiêu táo bạo và chia việc nhanh' },
    { type: 'I', text: 'Tổ chức buổi brainstorm sôi nổi' },
    { type: 'S', text: 'Xác định vai trò rõ để mọi người yên tâm' },
    { type: 'C', text: 'Lập kế hoạch chi tiết, tính trước rủi ro' },
  ] },
  { id: 'q6', prompt: 'Đồng nghiệp hay nhận xét bạn là người:', options: [
    { type: 'D', text: 'Quyết đoán, thẳng thắn' },
    { type: 'I', text: 'Nhiệt tình, truyền cảm hứng' },
    { type: 'S', text: 'Kiên nhẫn, đáng tin cậy' },
    { type: 'C', text: 'Cẩn thận, logic' },
  ] },
  { id: 'q7', prompt: 'Khi deadline đến gần, bạn:', options: [
    { type: 'D', text: 'Tăng tốc, cắt phần không cần thiết' },
    { type: 'I', text: 'Động viên cả nhóm cùng về đích' },
    { type: 'S', text: 'Làm đều tay, không bỏ ai lại phía sau' },
    { type: 'C', text: 'Rà soát lại để không sót lỗi' },
  ] },
  { id: 'q8', prompt: 'Bạn muốn được ghi nhận vì:', options: [
    { type: 'D', text: 'Kết quả và tốc độ' },
    { type: 'I', text: 'Năng lượng và sự gắn kết' },
    { type: 'S', text: 'Sự bền bỉ và tận tâm' },
    { type: 'C', text: 'Độ chính xác và chuyên sâu' },
  ] },
];

export const DISC_RESULT: Record<DiscType, { name: string; summary: string; tips: string }> = {
  D: { name: 'D · Quyết đoán', summary: 'Hướng kết quả, ra quyết định nhanh, thích thử thách và dẫn dắt.', tips: 'Nhớ dành thời gian lắng nghe và giải thích lý do để đồng đội đi cùng.' },
  I: { name: 'I · Truyền cảm hứng', summary: 'Giao tiếp tốt, lạc quan, giỏi kết nối và tạo năng lượng cho nhóm.', tips: 'Ghi lại cam kết và theo dõi đến cùng để ý tưởng thành kết quả.' },
  S: { name: 'S · Ổn định', summary: 'Kiên nhẫn, đáng tin cậy, giỏi hỗ trợ và giữ sự hài hoà của nhóm.', tips: 'Mạnh dạn nêu ý kiến sớm, đừng đợi đến khi được hỏi.' },
  C: { name: 'C · Cẩn trọng', summary: 'Chính xác, phân tích sâu, coi trọng chất lượng và quy trình.', tips: 'Chấp nhận mức đủ tốt ở việc nhỏ để giữ nhịp cho cả nhóm.' },
};

// ---------- Thiết bị ----------
/** Thông tin bảo hành mẫu theo id thiết bị; thiết bị khác mặc định bảo hành 36 tháng từ ngày cấp. */
export const deviceExtras: Record<string, { warrantyEnd: string; health: number }> = {
  'equip-macbook': { warrantyEnd: '03/2027', health: 88 },
  'equip-monitor': { warrantyEnd: '06/2026', health: 95 },
  'equip-iphone': { warrantyEnd: '01/2027', health: 72 },
};

export type TicketStepKey = 'sent' | 'received' | 'processing' | 'done';
export const TICKET_STEPS: { key: TicketStepKey; label: string }[] = [
  { key: 'sent', label: 'Đã gửi' },
  { key: 'received', label: 'Đã tiếp nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'done', label: 'Hoàn tất' },
];

export type ItTicket = {
  id: string;
  title: string;
  device: string;
  /** Mốc thời gian đã đạt theo từng bước (dd/mm HH:mm); bước chưa tới thì thiếu. */
  times: Partial<Record<TicketStepKey, string>>;
  assignee?: string;
};

/** Ticket mẫu của An. */
export const seedTickets: ItTicket[] = [
  { id: 'IT-2611-0318', title: 'Màn hình chập chờn khi cắm cổng USB-C', device: 'Màn hình Dell U2723QE',
    times: { sent: '10/11 09:12', received: '10/11 09:40', processing: '11/11 14:05' }, assignee: 'Phạm Đức Anh · IT Helpdesk' },
  { id: 'IT-2610-0245', title: 'Cấp lại license Figma sau khi đổi máy', device: 'MacBook Pro 14" M3',
    times: { sent: '21/10 10:02', received: '21/10 10:15', processing: '21/10 11:30', done: '21/10 15:48' }, assignee: 'Lê Hải Yến · IT Helpdesk' },
];
