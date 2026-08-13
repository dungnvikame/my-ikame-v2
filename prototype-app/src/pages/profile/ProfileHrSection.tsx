import { useState } from 'react';
import { Eye, EyeSlash, Laptop } from '@phosphor-icons/react';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import { IconButton, SectionHeader, StatusPill } from '../../components/UI';
import type { ContractInfo, Equipment, LeaveBalance, Payslip, SeniorityEntry } from '../../types';

/**
 * 3 fixture-driven cards của Hồ sơ, tách export riêng để bố cục 2 cột xếp tự do:
 * timeline ở cột main, nghỉ phép + thiết bị ở rail. Read-only pass-through fixtures
 * (AppState carries no mutator for them — YAGNI). `p2-leave-balance` chip cites the
 * SAME `leaveBalance` fixture, so numbers here can never drift from the AI answer.
 */

export function ProfileTimeline({ entries }: { entries: SeniorityEntry[] }) {
  return (
    <section className="side-info profile-section">
      <SectionHeader title="Thâm niên & cột mốc" meta={`${entries.length} cột mốc`} />
      <ol className="profile-timeline">
        {entries.map((entry) => (
          <li key={entry.id}>
            <span className="profile-timeline-dot" aria-hidden="true" />
            <div>
              <div className="profile-timeline-head">
                <strong>{entry.title}</strong>
                <small>{entry.dateLabel}</small>
              </div>
              <p>{entry.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ProfileLeave({ leaveBalance }: { leaveBalance: LeaveBalance }) {
  const percent = Math.round((leaveBalance.annualRemaining / leaveBalance.annualTotal) * 100);
  return (
    <section className="side-info profile-section">
      <SectionHeader title="Nghỉ phép & phúc lợi" />
      <p className="profile-leave-summary"><strong>{leaveBalance.annualRemaining}</strong><span>/{leaveBalance.annualTotal} ngày phép năm còn lại</span></p>
      <div className="profile-leave-bar" role="img" aria-label={`Còn ${leaveBalance.annualRemaining} trên ${leaveBalance.annualTotal} ngày phép`}>
        <div className="profile-leave-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <ul className="profile-leave-facts">
        <li><span>Đã dùng</span><strong>{leaveBalance.annualUsed} ngày</strong></li>
        <li><span>Chuyển từ năm trước</span><strong>{leaveBalance.carriedOver} ngày</strong></li>
        <li><span>Nghỉ ốm đã dùng</span><strong>{leaveBalance.sickUsed} ngày</strong></li>
      </ul>
      <p className="profile-benefit-line">{leaveBalance.insuranceLabel}</p>
      <p className="profile-benefit-line">{leaveBalance.healthCheckLabel}</p>
    </section>
  );
}

/** Phiếu lương & hợp đồng — xem nhanh tại My iKame, chi tiết đầy đủ handoff sang iHRM. */
export function ProfilePay({ payslips, contractInfo }: { payslips: Payslip[]; contractInfo: ContractInfo }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="side-info profile-section">
      <SectionHeader title="Lương & hợp đồng" />
      <div className="profile-contract">
        <div className="profile-contract-head">
          <strong>{contractInfo.type}</strong>
          <StatusPill tone="success">{contractInfo.validity}</StatusPill>
        </div>
        <small>Ký ngày {contractInfo.signedAt} · {contractInfo.workMode}</small>
      </div>
      <ul className="profile-payslip-list">
        {payslips.map((payslip) => (
          <li key={payslip.id}>
            <div className="profile-payslip-copy">
              <strong>{payslip.periodLabel}</strong>
              <small>{payslip.statusLabel}</small>
            </div>
            <span className="profile-payslip-amount">{revealed ? payslip.amountRevealed : payslip.amountMasked}</span>
          </li>
        ))}
      </ul>
      <div className="profile-payslip-actions">
        <IconButton label={revealed ? 'Ẩn số tiền' : 'Hiện số tiền'} onClick={() => setRevealed((current) => !current)}>
          {revealed ? <EyeSlash size={18} /> : <Eye size={18} />}
        </IconButton>
        <PlatformHandoffButton platform="iHRM" action="xem phiếu lương chi tiết và hợp đồng" label="Xem chi tiết trên iHRM" />
      </div>
    </section>
  );
}

export function ProfileEquipment({ equipment }: { equipment: Equipment[] }) {
  return (
    <section className="side-info profile-section">
      <SectionHeader title="Thiết bị được cấp" meta={`${equipment.length} thiết bị`} />
      <ul className="profile-equipment-list">
        {equipment.map((item) => (
          <li key={item.id}>
            <span className="profile-equipment-icon" aria-hidden="true"><Laptop size={18} /></span>
            <div>
              <strong>{item.name}</strong>
              <small>{item.model} · SN {item.serial}</small>
              <span className="profile-equipment-meta">Cấp ngày {item.assignedAt} · {item.condition}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
