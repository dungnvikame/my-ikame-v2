import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  Laptop,
  Lock,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { Avatar, Modal } from '../components/UI';

type ProfileTab = 'hris' | 'sensitive' | 'documents' | 'benefits' | 'devices' | 'settings';

export const ProfilePage: React.FC = () => {
  const {
    currentPerson,
    sensitiveUnlockedUntil,
    unlockSensitiveData,
    lockSensitiveData,
    submitHrDocument,
    reportHrDataIssue,
    launchApp,
    theme,
    toggleTheme,
  } = useApp();

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<ProfileTab>((searchParams.get('tab') as ProfileTab) || 'hris');
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('271126');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportField, setReportField] = useState('Địa điểm làm việc');
  const [reportNote, setReportNote] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const ihrmApp = INTERNAL_APPS.find((a) => a.id === 'app-ihrm')!;
  const isUnlocked = Boolean(sensitiveUnlockedUntil && sensitiveUnlockedUntil > Date.now());

  useEffect(() => {
    const paramTab = searchParams.get('tab') as ProfileTab | null;
    if (paramTab) setTab(paramTab);
  }, [searchParams]);

  // Live countdown timer for 5-minute sensitive session (PF-3)
  useEffect(() => {
    if (!sensitiveUnlockedUntil) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((sensitiveUnlockedUntil - Date.now()) / 1000));
      setSecondsLeft(rem);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sensitiveUnlockedUntil]);

  // PRD §7.9 PF-2: Exact 14 HRIS read-only fields
  const hrisFields: { label: string; value: string }[] = [
    { label: 'Mã nhân viên', value: currentPerson.employeeCode },
    { label: 'Ngày sinh', value: currentPerson.birthDateFull },
    { label: 'Giới tính', value: currentPerson.gender },
    { label: 'Email công ty', value: currentPerson.email },
    { label: 'Slack', value: currentPerson.slack },
    { label: 'Số điện thoại', value: currentPerson.phone },
    { label: 'Chức danh', value: currentPerson.title },
    { label: 'Cấp bậc', value: currentPerson.level },
    { label: 'Đơn vị / Team', value: `${currentPerson.department} · ${currentPerson.team}` },
    { label: 'Quản lý trực tiếp', value: currentPerson.managerName },
    { label: 'Ngày gia nhập', value: currentPerson.joinedAt },
    { label: 'Loại nhân sự', value: currentPerson.employmentType },
    { label: 'Hình thức làm việc', value: currentPerson.workMode },
    { label: 'Địa điểm làm việc', value: currentPerson.location },
  ];

  const pendingDocs = currentPerson.documents.filter((d) => d.status !== 'complete').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hero Profile Card (PF-1) */}
      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar person={currentPerson} size={64} />
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-strong)' }}>
                  {currentPerson.name}
                </h1>
                <span className="badge badge-neutral">{currentPerson.employmentType}</span>
                {currentPerson.badges.map((b) => (
                  <span key={b.id} className="badge badge-info" title={b.description}>
                    <Award size={12} /> {b.label}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                {currentPerson.title} · {currentPerson.team} ({currentPerson.department})
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 3 }}>
                {currentPerson.email} · {currentPerson.slack} · {currentPerson.phone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-dim btn-sm" onClick={() => setReportOpen(true)}>
              <FileWarning size={14} /> Báo sai dữ liệu → P&OD
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => launchApp(ihrmApp)}>
              Sửa trên iHRM <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* Clean Borderless 4-Stat Strip */}
        <div
          className="grid-4"
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Phép năm còn</div>
            <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
              {currentPerson.leaveBalance.annualRemaining}/{currentPerson.leaveBalance.annualTotal}d
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Giấy tờ & hợp đồng</div>
            <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: pendingDocs > 0 ? 'var(--warning-fg)' : 'var(--success-fg)', marginTop: 2 }}>
              {pendingDocs > 0 ? `${pendingDocs} cần xử lý` : 'Đầy đủ'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Thiết bị</div>
            <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
              {currentPerson.devices.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Đồng bộ HRIS</div>
            <div className="tabular" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)', marginTop: 5 }}>
              {currentPerson.hrisSyncedAt}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs-bar">
        {(
          [
            { id: 'hris', label: 'Hồ sơ HRIS' },
            { id: 'sensitive', label: 'Nhạy cảm 🔒' },
            { id: 'documents', label: `Giấy tờ${pendingDocs > 0 ? ` (${pendingDocs})` : ''}` },
            { id: 'benefits', label: 'Phúc lợi' },
            { id: 'devices', label: 'Thiết bị & Mốc' },
            { id: 'settings', label: 'Giao diện' },
          ] as { id: ProfileTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: 14 Read-only HRIS Fields — Clean Linear-style Hairline Grid! */}
      {tab === 'hris' && (
        <section className="card">
          <div className="card-header" style={{ marginBottom: 8 }}>
            <h2 className="card-title">Thông tin nhân sự</h2>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>HRIS · cập nhật {currentPerson.hrisSyncedAt}</span>
          </div>
          <div className="grid-2" style={{ columnGap: 32, rowGap: 0 }}>
            {hrisFields.map((f) => (
              <div
                key={f.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', textAlign: 'right' }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 2: Step-Up Auth Sensitive Data (PF-3) */}
      {tab === 'sensitive' && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Thông tin nhạy cảm của chính bạn</h2>
              <p className="card-subtitle">
                CCCD, BHXH, Tài khoản lương, Dải lương, Phiếu lương · Tự khoá sau 5 phút và ngay khi đổi lăng kính
              </p>
            </div>
            {isUnlocked ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-success tabular">
                  <Unlock size={12} /> Tự khoá sau {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                </span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={lockSensitiveData}>
                  Khoá ngay
                </button>
              </div>
            ) : (
              <span className="badge badge-neutral">
                <Lock size={12} /> Đang khoá bảo mật
              </span>
            )}
          </div>

          {!isUnlocked ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon">
                <Lock size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-strong)', marginBottom: 4 }}>
                Yêu cầu xác thực lại (Step-up Auth)
              </div>
              <div style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 16px' }}>
                Để bảo vệ thông tin lương và giấy tờ định danh của {currentPerson.name}, vui lòng xác thực lại phiên SSO trước khi xem.
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setStepUpOpen(true)}>
                <ShieldCheck size={15} /> Xác thực để mở khoá (5 phút)
              </button>
            </div>
          ) : (
            <div className="grid-2" style={{ gap: 10 }}>
              {[
                { label: 'Số CCCD', value: currentPerson.sensitive.cccd },
                { label: 'Ngày & nơi cấp', value: currentPerson.sensitive.cccdIssued },
                { label: 'Số sổ BHXH', value: currentPerson.sensitive.bhxh },
                { label: 'Tài khoản nhận lương', value: `${currentPerson.sensitive.bankAccount} · ${currentPerson.sensitive.bankName}` },
                { label: 'Dải lương / Ngạch bậc', value: currentPerson.sensitive.salaryBand },
                {
                  label: `Phiếu lương (${currentPerson.sensitive.latestPayslip.month})`,
                  value: `${currentPerson.sensitive.latestPayslip.netMasked} (${currentPerson.sensitive.latestPayslip.status})`,
                },
              ].map((item) => (
                <div key={item.label} className="card-sunk">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
                  <div className="tabular" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginTop: 3 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Documents & Contracts (PF-4) */}
      {tab === 'documents' && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Giấy tờ & hợp đồng nhân sự</h2>
              <p className="card-subtitle">Các giấy tờ sắp hết hạn hoặc còn thiếu tự động xuất hiện ở "Việc hôm nay"</p>
            </div>
            <span className="source-chip">HRIS · Documents</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentPerson.documents.map((doc) => (
              <div
                key={doc.id}
                className="card-compact"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderColor: doc.status === 'complete' ? 'var(--border-primary)' : 'var(--warning-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{doc.title}</span>
                    <span
                      className={`badge ${
                        doc.status === 'complete'
                          ? 'badge-success'
                          : doc.status === 'expired'
                            ? 'badge-error'
                            : 'badge-warning'
                      }`}
                    >
                      {doc.status === 'complete'
                        ? 'Đầy đủ'
                        : doc.status === 'expiring'
                          ? 'Sắp hết hạn'
                          : doc.status === 'expired'
                            ? 'Đã hết hạn'
                            : 'Còn thiếu'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {doc.category} · Cập nhật {doc.updatedAt}
                    {doc.dueDate && doc.status !== 'complete' ? ` · Hạn ${doc.dueDate}` : ''}
                    {doc.note ? ` · ${doc.note}` : ''}
                  </div>
                </div>
                {doc.status !== 'complete' ? (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => submitHrDocument(doc.id)}>
                    Nộp bổ sung ngay
                  </button>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--success-fg)', fontWeight: 600 }}>
                    <CheckCircle2 size={15} /> Đã hoàn tất
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 4: Benefits */}
      {tab === 'benefits' && (
        <section className="card">
          <h2 className="card-title" style={{ marginBottom: 12 }}>Nghỉ phép & Phúc lợi iKame Care</h2>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="card-sunk">
              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 6 }}>
                Bảo hiểm sức khoẻ iKame Care 2027
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Hạn mức ngoại trú 18 triệu/năm · Gói EAP 6 phiên tư vấn tinh thần miễn phí · Hỗ trợ 50% cho 1 người thân.
              </div>
            </div>
            <div className="card-sunk">
              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 6 }}>
                Số dư ngày phép cá nhân
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Phép năm còn <strong>{currentPerson.leaveBalance.annualRemaining}/{currentPerson.leaveBalance.annualTotal}</strong> ngày · Năm cũ chuyển sang <strong>{currentPerson.leaveBalance.carriedOver}</strong> ngày · Phép ốm <strong>{currentPerson.leaveBalance.sickRemaining}</strong> ngày.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 5: Devices & Lifecycle Milestones */}
      {tab === 'devices' && (
        <div className="grid-2">
          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              <Laptop size={16} /> Thiết bị được cấp phát
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentPerson.devices.map((dev) => (
                <div key={dev.id} className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{dev.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      Mã tài sản: {dev.serial} · Bàn giao {dev.assignedAt}
                    </div>
                  </div>
                  <span className="badge badge-success">Đang sử dụng</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>
              <Award size={16} /> Huy hiệu mốc vòng đời (không EXP/coin)
            </h2>
            {currentPerson.badges.length === 0 ? (
              <div className="card-sunk" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Hoàn thành cột mốc 30 ngày trong <strong>Hành trình 60 ngày</strong> để nhận huy hiệu đầu tiên của bạn!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentPerson.badges.map((b) => (
                  <div key={b.id} className="card-sunk">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <strong style={{ color: 'var(--text-strong)' }}>{b.label}</strong>
                      <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{b.earnedAt}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{b.description}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab 6: Settings */}
      {tab === 'settings' && (
        <section className="card">
          <h2 className="card-title" style={{ marginBottom: 12 }}>Giao diện hiển thị</h2>
          <div className="card-sunk" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
                Chế độ tối (Dark Mode)
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Tự động ghi nhớ trên trình duyệt, đảm bảo tương phản WCAG AA
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              className={`switch ${theme === 'dark' ? 'on' : ''}`}
              onClick={toggleTheme}
              aria-label="Chuyển đổi giao diện sáng tối"
            >
              <span className="switch-thumb" />
            </button>
          </div>
        </section>
      )}

      {/* Focus-trapped Step-Up Auth Modal (PF-3 + fixes PRD §13.6!) */}
      <Modal
        open={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        title="Xác thực bảo mật (Step-up Auth)"
        subtitle="Phiên mở khoá kéo dài 5 phút · Không ghi dữ liệu nhạy cảm vào analytics"
        maxWidth={420}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setStepUpOpen(false)}>
              Huỷ
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                unlockSensitiveData();
                setStepUpOpen(false);
              }}
            >
              Xác nhận Passkey / OTP
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card-sunk" style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, color: 'var(--info-fg)', marginTop: 1 }} />
            <span>Tài khoản xác thực: <strong>{currentPerson.email}</strong> (Passkey / OTP nội bộ)</span>
          </div>
          <div>
            <label className="field-label">Mã OTP xác thực (demo điền sẵn)</label>
            <input
              className="input tabular"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Report HRIS Data Issue Modal (PRD §7.9 PF-8) */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Báo sai dữ liệu hồ sơ tới P&OD"
        subtitle="Tạo yêu cầu rà soát và cập nhật trên hệ thống HRIS gốc"
        maxWidth={460}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setReportOpen(false)}>
              Huỷ
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                reportHrDataIssue(reportField, reportNote || 'Đề nghị kiểm tra lại thông tin.');
                setReportNote('');
                setReportOpen(false);
              }}
            >
              Gửi yêu cầu tới P&OD
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label">Trường thông tin cần chỉnh sửa</label>
            <select className="select" value={reportField} onChange={(e) => setReportField(e.target.value)}>
              {hrisFields.map((f) => (
                <option key={f.label} value={f.label}>
                  {f.label} ({f.value})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Nội dung đề xuất cập nhật</label>
            <textarea
              className="textarea"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Mô tả giá trị đúng cần P&OD cập nhật trên HRIS..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
