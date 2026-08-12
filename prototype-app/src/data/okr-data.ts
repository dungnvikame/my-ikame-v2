import type { CheckInReport, EksObjective, MemberEksStat, Objective } from '../types';

// Mục tiêu (Demo v2 iGoal-style OKR) — 7 node hư cấu: company → 2 team → 4 personal (An).
// Cycle decision: OKR nodes dùng 'H2-2026'; Goal.cycle (initialGoals) giữ 'Q3-2026' (Q3 ⊂ H2).
export const okrTree: Objective[] = [
  {
    id: 'okr-company-growth',
    title: 'Tăng trải nghiệm và hiệu suất làm việc nội bộ',
    level: 'company',
    ownerName: 'Ban Lãnh Đạo',
    ownerShort: 'BLĐ',
    progress: 62,
    cycle: 'H2-2026',
    keyResults: [
      { id: 'kr-company-1', title: 'Tăng NPS nội bộ lên 70+', progress: 65, unitLabel: 'điểm NPS', status: 'on_track' },
      { id: 'kr-company-2', title: 'Ra mắt My iKame bản concept cho BLĐ', progress: 80, unitLabel: '% hoàn thành', status: 'on_track' },
      { id: 'kr-company-3', title: 'Giảm thời gian xử lý yêu cầu nội bộ 30%', progress: 40, unitLabel: '% giảm', status: 'at_risk' },
    ],
  },
  {
    id: 'okr-team-product',
    title: 'Nâng cấp trải nghiệm sản phẩm nội bộ Product & Technology',
    level: 'team',
    parentId: 'okr-company-growth',
    ownerName: 'Trần Thanh Mai',
    ownerShort: 'Mai',
    progress: 58,
    cycle: 'H2-2026',
    keyResults: [
      { id: 'kr-product-1', title: 'Hoàn thiện Core DS 1.1 cho 5 module', progress: 55, unitLabel: '% hoàn thành', status: 'needs_update' },
      { id: 'kr-product-2', title: 'Ra mắt prototype My iKame demo v2', progress: 70, unitLabel: '% hoàn thành', status: 'on_track' },
      { id: 'kr-product-3', title: 'Thu thập feedback từ 50 iKamer', progress: 48, unitLabel: '% hoàn thành', status: 'on_track' },
    ],
  },
  {
    id: 'okr-team-people',
    title: 'Xây dựng kết nối và cộng đồng nội bộ',
    level: 'team',
    parentId: 'okr-company-growth',
    ownerName: 'Phạm Thu Hằng',
    ownerShort: 'Hằng',
    progress: 71,
    cycle: 'H2-2026',
    keyResults: [
      { id: 'kr-people-1', title: 'Tăng tỉ lệ hoàn thành onboarding đúng hạn', progress: 78, unitLabel: '% hoàn thành', status: 'on_track' },
      { id: 'kr-people-2', title: 'Triển khai Cộng đồng nội bộ cho 100% iKamer', progress: 64, unitLabel: '% hoàn thành', status: 'on_track' },
    ],
  },
  {
    id: 'okr-personal-design',
    title: 'Hoàn thiện design system Core DS 1.1 cho 5 module chính',
    level: 'personal',
    parentId: 'okr-team-product',
    ownerName: 'Nguyễn Hoàng An',
    ownerShort: 'An',
    progress: 55,
    cycle: 'H2-2026',
    linkedGoalId: 'goal-design-refresh',
    keyResults: [
      { id: 'kr-design-1', title: 'Chuẩn hoá token màu & spacing', progress: 70, unitLabel: '% hoàn thành', status: 'on_track' },
      { id: 'kr-design-2', title: 'Áp dụng Core DS cho 5 module chính', progress: 40, unitLabel: '% hoàn thành', status: 'needs_update' },
    ],
  },
  {
    id: 'okr-personal-onboarding',
    title: 'Tái thiết kế hành trình onboarding nhân viên mới',
    level: 'personal',
    parentId: 'okr-team-product',
    ownerName: 'Nguyễn Hoàng An',
    ownerShort: 'An',
    progress: 70,
    cycle: 'H2-2026',
    linkedGoalId: 'goal-onboarding-journey',
    keyResults: [
      { id: 'kr-onboarding-1', title: 'Thiết kế lại 3 màn hình onboarding chính', progress: 80, unitLabel: '% hoàn thành', status: 'on_track' },
      { id: 'kr-onboarding-2', title: 'Test usability với 8 nhân viên mới', progress: 60, unitLabel: '% hoàn thành', status: 'on_track' },
    ],
  },
  {
    id: 'okr-personal-research',
    title: 'Xây kho research insight dùng chung cho khối Product',
    level: 'personal',
    parentId: 'okr-team-product',
    ownerName: 'Nguyễn Hoàng An',
    ownerShort: 'An',
    progress: 30,
    cycle: 'H2-2026',
    linkedGoalId: 'goal-research-repo',
    keyResults: [
      { id: 'kr-research-1', title: 'Tổng hợp 20 buổi phỏng vấn người dùng', progress: 35, unitLabel: '% hoàn thành', status: 'at_risk' },
      { id: 'kr-research-2', title: 'Xây cấu trúc kho lưu trữ insight dùng chung', progress: 25, unitLabel: '% hoàn thành', status: 'at_risk' },
    ],
  },
  {
    id: 'okr-personal-a11y',
    title: 'Audit accessibility toàn bộ màn hình iKamer Home',
    level: 'personal',
    parentId: 'okr-team-product',
    ownerName: 'Nguyễn Hoàng An',
    ownerShort: 'An',
    progress: 100,
    cycle: 'H2-2026',
    linkedGoalId: 'goal-a11y-audit',
    keyResults: [
      { id: 'kr-a11y-1', title: 'Audit contrast & keyboard nav toàn bộ Home', progress: 100, unitLabel: '% hoàn thành', status: 'done' },
      { id: 'kr-a11y-2', title: 'Ghi nhận & xử lý toàn bộ lỗi P0/P1', progress: 100, unitLabel: '% hoàn thành', status: 'done' },
    ],
  },
];

// 2 báo cáo có sẵn — "Tổng hợp báo cáo" không rỗng trước khi demo submit thêm.
export const initialCheckInReports: CheckInReport[] = [
  {
    id: 'report-onboarding-w32',
    goalId: 'goal-onboarding-journey',
    goalTitle: 'Tái thiết kế hành trình onboarding nhân viên mới',
    authorName: 'Nguyễn Hoàng An',
    periodLabel: 'Tuần 32 · 03-09/08',
    progressBefore: 60,
    progressAfter: 70,
    content: 'Hoàn thành wireframe cho 3 màn hình onboarding chính và thống nhất với team People về nội dung tuần đầu.',
    blockers: 'Chờ xác nhận nội dung đào tạo an toàn thông tin từ Security & IT.',
    submittedAt: '3 ngày trước',
    source: 'manual',
  },
  {
    id: 'report-research-w31',
    goalId: 'goal-research-repo',
    goalTitle: 'Xây kho research insight dùng chung cho khối Product',
    authorName: 'Nguyễn Hoàng An',
    periodLabel: 'Tuần 31 · 27/07-02/08',
    progressBefore: 20,
    progressAfter: 30,
    content: 'Thu thập và phân loại 8 buổi phỏng vấn người dùng gần nhất vào cấu trúc tag chung.',
    blockers: 'Thiếu chuẩn tag thống nhất giữa các team con.',
    submittedAt: '5 ngày trước',
    source: 'manual',
  },
];

// EKS (Employee Key Success) — v2.1, cấu trúc phỏng theo màn "My EKS" của iGoal thật:
// E-objective (E1, E2) với các KS con, progress %, không trọng số hiển thị.
// Nội dung hư cấu cho persona An (Product Designer) — KHÔNG dùng dữ liệu nhân sự thật.
export const eksObjectives: EksObjective[] = [
  {
    id: 'eks-e1',
    code: 'E1',
    title: 'Nâng trải nghiệm các sản phẩm nội bộ My iKame, iGoal và iWiki đạt chất lượng cao',
    progress: 62,
    keySuccesses: [
      {
        id: 'eks-e1-ks1',
        code: 'KS1',
        title: 'Hoàn thiện design system Core DS 1.1 và áp dụng trên 5 module chính của My iKame trước 30/09; điểm hài lòng giao diện ≥4/5',
        progress: 55,
        status: 'needs_update',
        linkedGoalId: 'goal-design-refresh',
      },
      {
        id: 'eks-e1-ks2',
        code: 'KS2',
        title: 'Tái thiết kế hành trình onboarding nhân sự mới 100% trên My iKame, thời gian hoàn tất checklist giảm 30%',
        progress: 70,
        status: 'on_track',
        linkedGoalId: 'goal-onboarding-journey',
      },
      {
        id: 'eks-e1-ks3',
        code: 'KS3',
        title: 'Audit accessibility toàn bộ màn hình chính đạt WCAG AA, hoàn thành trước 31/12',
        progress: 100,
        status: 'done',
        linkedGoalId: 'goal-a11y-audit',
      },
    ],
  },
  {
    id: 'eks-e2',
    code: 'E2',
    title: 'Đưa nghiệp vụ Design của team Product đạt level AI-native, vận hành hiệu quả với AI Agent',
    progress: 25,
    keySuccesses: [
      {
        id: 'eks-e2-ks1',
        code: 'KS1',
        title: 'Áp dụng quy trình thiết kế AI-assisted cho 3 dự án mới, 100% có document chuẩn hoá (problem context, decision log, release evidence)',
        progress: 35,
        status: 'at_risk',
        linkedGoalId: 'goal-research-repo',
      },
      {
        id: 'eks-e2-ks2',
        code: 'KS2',
        title: 'Xây bộ Agents Kit hỗ trợ nghiệp vụ Design (prompt library, component generator) dùng chung cho khối Product',
        progress: 20,
        status: 'on_track',
      },
      {
        id: 'eks-e2-ks3',
        code: 'KS3',
        title: 'Thiết kế Product Health Dashboard cho My iKame/iGoal/iWiki giúp PM và Manager theo dõi sức khỏe sản phẩm, trước 30/09',
        progress: 20,
        status: 'on_track',
      },
    ],
  },
];

// Tab "Thành viên" (Manager Goals view) — EKS status + compliance báo cáo per member.
// Khớp fixture attention: Lan & Minh chưa check-in đúng hạn (item `goal-required`).
export const memberEksStats: MemberEksStat[] = [
  { id: 'mes-lan', name: 'Lan Nguyễn', shortName: 'Lan', role: 'Product Designer', eksStatus: 'needs_update', eksProgress: 45, reportsSubmitted: 4, reportsExpected: 6, lastCheckInLabel: '2 tuần trước' },
  { id: 'mes-minh', name: 'Minh Trần', shortName: 'Minh', role: 'Frontend Developer', eksStatus: 'needs_update', eksProgress: 50, reportsSubmitted: 5, reportsExpected: 6, lastCheckInLabel: '2 tuần trước' },
  { id: 'mes-ha', name: 'Hà Phạm', shortName: 'Hà', role: 'QA Engineer', eksStatus: 'on_track', eksProgress: 68, reportsSubmitted: 6, reportsExpected: 6, lastCheckInLabel: '3 ngày trước' },
  { id: 'mes-tuan', name: 'Tuấn Lê', shortName: 'Tuấn', role: 'Backend Developer', eksStatus: 'at_risk', eksProgress: 38, reportsSubmitted: 5, reportsExpected: 6, lastCheckInLabel: '1 tuần trước' },
  { id: 'mes-ngocanh', name: 'Ngọc Anh', shortName: 'NA', role: 'Business Analyst', eksStatus: 'on_track', eksProgress: 72, reportsSubmitted: 6, reportsExpected: 6, lastCheckInLabel: 'Hôm qua' },
];
