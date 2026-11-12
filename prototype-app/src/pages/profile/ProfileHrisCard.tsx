import { ArrowSquareOutIcon as ArrowSquareOut, DatabaseIcon as Database } from '@coreds/react/icons';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import { SectionHeader } from '../../components/UI';
import type { HrProfile, SensitiveInfo } from '../../types';
import { SensitiveGate } from './SensitiveGate';

type Field = { label: string; value: string };

/** Hồ sơ HRIS read-only — ảnh phản chiếu nguồn sự thật, kèm khối nhạy cảm có gate. */
export function ProfileHrisCard({ profile, sensitive, unlocked }: { profile: HrProfile; sensitive: SensitiveInfo; unlocked: boolean }) {
  const groups: { title: string; fields: Field[] }[] = [
    { title: 'Định danh', fields: [
      { label: 'Mã nhân viên', value: profile.employeeCode },
      { label: 'Ngày sinh', value: profile.birthDate },
      { label: 'Giới tính', value: profile.gender },
      { label: 'Email', value: profile.email },
      { label: 'Slack', value: profile.slackHandle },
      { label: 'Điện thoại', value: profile.phone },
    ] },
    { title: 'Công việc', fields: [
      { label: 'Chức danh', value: profile.title },
      { label: 'Cấp bậc', value: profile.level },
      { label: 'Đơn vị', value: profile.unit },
      { label: 'Quản lý trực tiếp', value: profile.managerName },
      { label: 'Ngày gia nhập', value: profile.joinedAt },
      { label: 'Loại nhân sự', value: profile.employmentType },
      { label: 'Hình thức làm việc', value: profile.workMode },
      { label: 'Địa điểm', value: profile.location },
    ] },
  ];
  const sensitiveFields: Field[] = [
    { label: 'Số CCCD', value: sensitive.idNumber },
    { label: 'Số sổ BHXH', value: sensitive.insuranceNumber },
    { label: 'Tài khoản nhận lương', value: `${sensitive.bankAccount} · ${sensitive.bankName}` },
    { label: 'Dải lương', value: sensitive.salaryBand },
  ];

  return (
    <section className="side-info profile-section profile-hris" aria-label="Hồ sơ HRIS">
      <SectionHeader title="Hồ sơ nhân sự" meta={profile.syncedAt} />
      {groups.map((group) => (
        <div key={group.title} className="profile-hris-group">
          <h3>{group.title}</h3>
          <dl className="profile-hris-grid">
            {group.fields.map((field) => (
              <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>
            ))}
          </dl>
        </div>
      ))}
      <div className="profile-hris-group profile-hris-group--sensitive">
        <h3>Thông tin nhạy cảm</h3>
        {unlocked ? (
          <dl className="profile-hris-grid">
            {sensitiveFields.map((field) => (
              <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>
            ))}
          </dl>
        ) : (
          <dl className="profile-hris-grid is-masked" aria-label="Đã ẩn — cần xác thực">
            {sensitiveFields.map((field) => (
              <div key={field.label}><dt>{field.label}</dt><dd>•••• •••• ••••</dd></div>
            ))}
          </dl>
        )}
        <div className="profile-hris-actions">
          <SensitiveGate />
          <PlatformHandoffButton platform="iHRM" action="cập nhật thông tin cá nhân" label="Yêu cầu chỉnh sửa trên iHRM" variant="link" />
        </div>
      </div>
      <p className="profile-source-line"><Database size={13} /> Nguồn sự thật: HRIS · My iKame chỉ hiển thị, không lưu bản sao <ArrowSquareOut size={12} /></p>
    </section>
  );
}
