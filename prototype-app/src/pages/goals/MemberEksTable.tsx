import { CaretRight } from '@phosphor-icons/react';
import { useState } from 'react';
import { SectionHeader, StatusPill } from '../../components/UI';
import type { MemberEksStat } from '../../types';
import { STATUS_META } from './build-okr-tree';

/** Manager "Thành viên" tab — one row per `memberEksStats` entry, with a borderless
 * "Xem EKS" toggle that expands a small honest 2-3 line snapshot (no fabricated EKS tree —
 * only fields the fixture actually carries). */
export function MemberEksTable({ members }: { members: MemberEksStat[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="section-block">
      <SectionHeader title="Thành viên" meta={`${members.length} thành viên · chu kỳ H2 2026`} />
      <div className="member-eks-table">
        <div className="member-eks-header member-eks-row">
          <span>Thành viên</span>
          <span>EKS</span>
          <span>Báo cáo</span>
          <span>Check-in cuối</span>
          <span />
        </div>
        {members.map((member) => {
          const meta = STATUS_META[member.eksStatus];
          const behind = member.reportsSubmitted < member.reportsExpected;
          const expanded = expandedId === member.id;
          return (
            <div key={member.id} className="member-eks-item">
              <div className="member-eks-row">
                <div className="person-cell"><span className="avatar" aria-hidden="true">{member.shortName.charAt(0)}</span><span><strong>{member.name}</strong><small>{member.role}</small></span></div>
                <div className="eks-progress">
                  <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  <div className="okr-progress-bar" role="progressbar" aria-valuenow={member.eksProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ EKS ${member.name}`}>
                    <div className="okr-progress-fill" style={{ width: `${member.eksProgress}%` }} />
                  </div>
                  <span>{member.eksProgress}%</span>
                </div>
                <span className={behind ? 'member-eks-reports is-behind' : 'member-eks-reports'}>Báo cáo: {member.reportsSubmitted}/{member.reportsExpected} kỳ</span>
                <span className="muted-text">{member.lastCheckInLabel}</span>
                <button type="button" className="text-link member-eks-toggle" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : member.id)}>
                  Xem EKS<CaretRight size={14} weight="bold" className={expanded ? 'is-expanded' : ''} />
                </button>
              </div>
              {expanded && (
                <div className="member-eks-expand">
                  <p><strong>Trạng thái EKS:</strong> {meta.label} · {member.eksProgress}% hoàn thành.</p>
                  <p><strong>Báo cáo:</strong> {member.reportsSubmitted}/{member.reportsExpected} kỳ đã nộp · Check-in cuối: {member.lastCheckInLabel}.</p>
                  <p><strong>Cần chú ý:</strong> {behind ? `Còn ${member.reportsExpected - member.reportsSubmitted} kỳ báo cáo chưa nộp.` : 'Đã nộp đầy đủ báo cáo kỳ này.'}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
