import { SectionHeader, StatusPill } from '../../components/UI';
import type { Equipment, LeaveBalance, SeniorityEntry } from '../../types';

type ProfileHrSectionProps = {
  seniorityEntries: SeniorityEntry[];
  leaveBalance: LeaveBalance;
  equipment: Equipment[];
};

/** "Thâm niên & cột mốc" + "Nghỉ phép & phúc lợi" + "Thiết bị được cấp" — 3 fixture-driven
 * sections bundled into one file per plan's suggested split (keeps ProfilePage.tsx small
 * without over-fragmenting into one-liner components). All read-only pass-through fixtures
 * (AppState carries no mutator for them — YAGNI). `p2-leave-balance` chip cites the SAME
 * `leaveBalance` fixture, so numbers here can never drift from the AI answer. */
export function ProfileHrSection({ seniorityEntries, leaveBalance, equipment }: ProfileHrSectionProps) {
  const latest = seniorityEntries[seniorityEntries.length - 1];

  return (
    <>
      <section className="side-info profile-section">
        <SectionHeader title="Thâm niên & cột mốc" meta={latest ? `${latest.title} · ${latest.dateLabel}` : undefined} />
        <ol className="profile-timeline">
          {seniorityEntries.map((entry) => (
            <li key={entry.id}>
              <span className="profile-timeline-dot" aria-hidden="true" />
              <div>
                <strong>{entry.title}</strong>
                <small>{entry.dateLabel}</small>
                <p>{entry.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="side-info profile-section">
        <SectionHeader title="Nghỉ phép & phúc lợi" />
        <div className="profile-leave-bar" role="img" aria-label={`Còn ${leaveBalance.annualRemaining} trên ${leaveBalance.annualTotal} ngày phép`}>
          <div className="profile-leave-bar-fill" style={{ width: `${Math.round((leaveBalance.annualRemaining / leaveBalance.annualTotal) * 100)}%` }} />
        </div>
        <p className="profile-leave-summary"><strong>{leaveBalance.annualRemaining}</strong>/{leaveBalance.annualTotal} ngày phép năm còn lại</p>
        <div className="card-badges">
          <StatusPill>Đã dùng {leaveBalance.annualUsed} ngày</StatusPill>
          <StatusPill>Chuyển từ năm trước: {leaveBalance.carriedOver} ngày</StatusPill>
          <StatusPill>Nghỉ ốm đã dùng: {leaveBalance.sickUsed} ngày</StatusPill>
        </div>
        <p>{leaveBalance.insuranceLabel}</p>
        <p>{leaveBalance.healthCheckLabel}</p>
      </section>

      <section className="side-info profile-section">
        <SectionHeader title="Thiết bị được cấp" meta={`${equipment.length} thiết bị`} />
        <ul className="profile-equipment-list">
          {equipment.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong>
              <small>{item.model} · SN {item.serial}</small>
              <span className="profile-equipment-meta">Cấp ngày {item.assignedAt} · {item.condition}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
