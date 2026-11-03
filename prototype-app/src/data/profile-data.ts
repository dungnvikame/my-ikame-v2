import type { HrProfile, PersonalDocument, SensitiveInfo } from '../types';
import { HUY_JOINED_AT } from './onboarding-data';

/**
 * Hồ sơ cá nhân "như thật" — nhân vật hư cấu, dữ liệu theo cấu trúc HRIS. Ngày sinh luôn
 * dd/mm/yyyy (lỗi lộn ngày/tháng 07/10 là bài học). Mọi chỉnh sửa deep-link iHRM.
 */
export const hrProfiles: Record<string, HrProfile> = {
  person_an: {
    personId: 'person_an',
    employeeCode: 'IK-2306-0142',
    birthDate: '14/03/1998',
    gender: 'Nam',
    email: 'an.nguyen@ikameglobal.com',
    slackHandle: '@an.nguyen',
    phone: '0912 345 678',
    title: 'Product Designer',
    level: 'Senior (P3)',
    unit: 'Product & Technology · Team Product',
    managerName: 'Trần Thanh Mai',
    joinedAt: '01/06/2023',
    employmentType: 'Nhân viên chính thức',
    workMode: 'Hybrid · 3 ngày văn phòng',
    location: 'Tầng 19 · Tòa iKame Hà Nội',
    syncedAt: 'HRIS · cập nhật 26/10/2026',
  },
  person_mai: {
    personId: 'person_mai',
    employeeCode: 'IK-2109-0051',
    birthDate: '22/08/1991',
    gender: 'Nữ',
    email: 'mai.tran@ikameglobal.com',
    slackHandle: '@mai.tran',
    phone: '0987 654 321',
    title: 'Product Manager',
    level: 'Manager (M1)',
    unit: 'Product & Technology · Team Product',
    managerName: 'Ban Giám Đốc',
    joinedAt: '13/09/2021',
    employmentType: 'Nhân viên chính thức',
    workMode: 'Hybrid · 3 ngày văn phòng',
    location: 'Tầng 19 · Tòa iKame Hà Nội',
    syncedAt: 'HRIS · cập nhật 26/10/2026',
  },
  person_ngoc: {
    personId: 'person_ngoc',
    employeeCode: 'IK-2203-0088',
    birthDate: '05/11/1994',
    gender: 'Nữ',
    email: 'ngoc.le@ikameglobal.com',
    slackHandle: '@ngoc.le',
    phone: '0909 111 222',
    title: 'Communication Lead',
    level: 'Lead (L2)',
    unit: 'People & Culture · Team Communication',
    managerName: 'Nguyễn Thị Nguyệt',
    joinedAt: '07/03/2022',
    employmentType: 'Nhân viên chính thức',
    workMode: 'Văn phòng',
    location: 'Tầng 9 · Tòa iKame Hà Nội',
    syncedAt: 'HRIS · cập nhật 26/10/2026',
  },
  // Người mới — ngày gia nhập lùi từ ngày máy (onboarding-data) để hành trình luôn ở Ngày 32/60.
  person_huy: {
    personId: 'person_huy',
    employeeCode: 'IK-2610-0231',
    birthDate: '09/07/2001',
    gender: 'Nam',
    email: 'giahuy.pham@ikameglobal.com',
    slackHandle: '@giahuy.pham',
    phone: '0933 777 889',
    title: 'Product Designer',
    level: 'Junior (P1) · thử việc',
    unit: 'Product & Technology · Team Product',
    managerName: 'Trần Thanh Mai',
    joinedAt: HUY_JOINED_AT,
    employmentType: 'Thử việc 2 tháng',
    workMode: 'Hybrid · 3 ngày văn phòng',
    location: 'Tầng 19 · Tòa iKame Hà Nội',
    syncedAt: 'HRIS · cập nhật hôm nay',
  },
};

const anDocuments: PersonalDocument[] = [
  { id: 'doc-contract', name: 'HĐLĐ không xác định thời hạn', kind: 'contract', status: 'valid', note: 'Ký 01/12/2023 · đang hiệu lực' },
  { id: 'doc-annex', name: 'Phụ lục điều chỉnh lương 2026', kind: 'contract', status: 'valid', note: 'Ký 01/04/2026' },
  { id: 'doc-nda', name: 'Cam kết bảo mật thông tin (NDA) 2026', kind: 'policy', status: 'expiring', dueLabel: 'Hết hạn 20/11/2026', dueInDays: 24, action: 'renew', note: 'Ký lại hằng năm theo chính sách bảo mật' },
  { id: 'doc-id', name: 'CCCD gắn chip (bản scan)', kind: 'identity', status: 'valid', note: 'Cập nhật 03/2024' },
  { id: 'doc-degree', name: 'Bằng tốt nghiệp đại học', kind: 'degree', status: 'missing', action: 'submit', note: 'HR cần bản scan để hoàn thiện hồ sơ BHXH' },
  { id: 'doc-insurance', name: 'Sổ BHXH điện tử', kind: 'insurance', status: 'valid', note: 'Đã liên kết VssID' },
  { id: 'doc-health', name: 'Giấy khám sức khoẻ định kỳ', kind: 'insurance', status: 'expiring', dueLabel: 'Hết hạn 12/12/2026', dueInDays: 46, action: 'renew', note: 'Đặt lịch khám qua Sự kiện "Khám sức khoẻ định kỳ"' },
];

/** Giấy tờ theo từng người — không dùng chung giữa các lăng kính (dữ liệu cá nhân). */
export const personalDocumentsByPerson: Record<string, PersonalDocument[]> = {
  person_an: anDocuments,
  person_mai: [
    { id: 'doc-contract', name: 'HĐLĐ không xác định thời hạn', kind: 'contract', status: 'valid', note: 'Ký 13/03/2022 · đang hiệu lực' },
    { id: 'doc-nda', name: 'Cam kết bảo mật thông tin (NDA) 2026', kind: 'policy', status: 'valid', note: 'Ký lại 15/01/2026' },
    { id: 'doc-id', name: 'CCCD gắn chip (bản scan)', kind: 'identity', status: 'valid', note: 'Cập nhật 01/2025' },
    { id: 'doc-insurance', name: 'Sổ BHXH điện tử', kind: 'insurance', status: 'valid', note: 'Đã liên kết VssID' },
    { id: 'doc-health', name: 'Giấy khám sức khoẻ định kỳ', kind: 'insurance', status: 'expiring', dueLabel: 'Hết hạn 12/12/2026', dueInDays: 46, action: 'renew', note: 'Đặt lịch khám qua Sự kiện "Khám sức khoẻ định kỳ"' },
  ],
  person_ngoc: [
    { id: 'doc-contract', name: 'HĐLĐ xác định thời hạn 36 tháng', kind: 'contract', status: 'expiring', dueLabel: 'Hết hạn 06/03/2027', dueInDays: 130, action: 'renew', note: 'Ký 07/03/2024' },
    { id: 'doc-nda', name: 'Cam kết bảo mật thông tin (NDA) 2026', kind: 'policy', status: 'valid', note: 'Ký lại 10/02/2026' },
    { id: 'doc-id', name: 'CCCD gắn chip (bản scan)', kind: 'identity', status: 'valid', note: 'Cập nhật 06/2024' },
    { id: 'doc-insurance', name: 'Sổ BHXH điện tử', kind: 'insurance', status: 'valid', note: 'Đã liên kết VssID' },
  ],
  person_huy: [
    { id: 'doc-contract', name: 'HĐ thử việc 2 tháng', kind: 'contract', status: 'valid', note: `Ký ${HUY_JOINED_AT} · hết thử việc sau 60 ngày` },
    { id: 'doc-nda', name: 'Cam kết bảo mật thông tin (NDA) 2026', kind: 'policy', status: 'valid', note: `Ký ngày đầu tiên ${HUY_JOINED_AT}` },
    { id: 'doc-id', name: 'CCCD gắn chip (bản scan)', kind: 'identity', status: 'valid', note: 'Nộp khi gia nhập' },
    { id: 'doc-degree', name: 'Bằng tốt nghiệp đại học', kind: 'degree', status: 'missing', action: 'submit', note: 'HR cần bản scan trước khi ký HĐLĐ chính thức' },
  ],
};

/** Dữ liệu nhạy cảm theo từng người — số liệu hư cấu. */
export const sensitiveByPerson: Record<string, SensitiveInfo> = {
  person_an: { bankAccount: '0123 4567 8901', bankName: 'Techcombank · CN Hà Nội', insuranceNumber: '0123456789', idNumber: '001098012345', salaryBand: 'P3 · bậc 4' },
  person_mai: { bankAccount: '1900 2233 4455', bankName: 'Vietcombank · CN Ba Đình', insuranceNumber: '0198765432', idNumber: '001091054321', salaryBand: 'M1 · bậc 2' },
  person_ngoc: { bankAccount: '0555 6677 8899', bankName: 'MB Bank · CN Hoàn Kiếm', insuranceNumber: '0112233445', idNumber: '001094067890', salaryBand: 'L2 · bậc 3' },
  person_huy: { bankAccount: '0707 1122 3344', bankName: 'Techcombank · CN Hà Nội', insuranceNumber: 'Chưa cấp', idNumber: '001201033456', salaryBand: 'P1 · thử việc 85%' },
};

/** Giấy tờ cần nhắc trên Home/Trợ lý AI: thiếu hoặc hết hạn ≤30 ngày. */
export function documentReminders(documents: PersonalDocument[]): { id: string; label: string; meta: string }[] {
  return documents
    .filter((doc) => doc.status === 'missing' || doc.status === 'expired' || (doc.status === 'expiring' && (doc.dueInDays ?? 99) <= 30))
    .map((doc) => ({
      id: `doc-${doc.id}`,
      label: doc.status === 'missing' ? `Nộp bổ sung: ${doc.name}` : `Gia hạn: ${doc.name}`,
      meta: doc.dueLabel ?? 'HR đang chờ',
    }));
}
