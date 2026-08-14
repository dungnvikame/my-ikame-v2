import { ArrowRight, CalendarCheck, ChartLineUp, Clock } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { StatusPill } from '../../components/UI';
import type { MemberProfile360, TeamMember } from '../../types';
import { initials, MiniProgress, riskLabel, riskScore, STATUS_LABEL, STATUS_TONE } from './team-visuals';

/**
 * Thẻ thành viên giàu tín hiệu (pattern roster của Lattice/BambooHR): thay vì
 * một dòng trạng thái chung chung, mỗi thẻ cho thấy tiến độ mục tiêu, nhịp
 * check-in, 1:1 gần nhất và mức ưu tiên — đủ để manager quyết định vào ai trước.
 */
export function MemberCard({ member, profile }: { member: TeamMember; profile?: MemberProfile360 }) {
  const risk = riskLabel(riskScore(profile));
  const eksAverage = profile && profile.eks.length > 0
    ? Math.round(profile.eks.reduce((sum, item) => sum + item.progress, 0) / profile.eks.length)
    : undefined;
  const checkinSignal = profile?.signals.find((signal) => signal.key === 'checkin');
  const oneOnOneSignal = profile?.signals.find((signal) => signal.key === 'oneonone');
  const topConcern = profile?.signals.find((signal) => signal.tone === 'risk')
    ?? profile?.signals.find((signal) => signal.tone === 'watch');

  return (
    <article className={`member-card member-card--${risk.tone}`}>
      <header className="member-card-head">
        <span className="avatar avatar--large" aria-hidden="true">{initials(member.name)}</span>
        <div className="member-card-identity">
          <h3><Link to={`/manager/team/${member.id}`}>{member.name}</Link></h3>
          <small>{member.role}</small>
        </div>
        <StatusPill tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</StatusPill>
      </header>

      {eksAverage !== undefined ? (
        <div className="member-card-progress">
          <div className="member-card-progress-head">
            <span><ChartLineUp size={14} />Tiến độ EKS</span>
            <strong>{eksAverage}%</strong>
          </div>
          <MiniProgress value={eksAverage} tone={eksAverage >= 60 ? 'good' : eksAverage >= 45 ? 'watch' : 'risk'} />
        </div>
      ) : (
        <p className="member-card-empty">Chưa thiết lập mục tiêu — sẽ có sau khi gia nhập.</p>
      )}

      <dl className="member-card-facts">
        <div>
          <dt><CalendarCheck size={13} />Check-in</dt>
          <dd>{checkinSignal?.value ?? '—'}</dd>
        </div>
        <div>
          <dt><Clock size={13} />1:1 gần nhất</dt>
          <dd>{oneOnOneSignal?.value ?? profile?.nextOneOnOneLabel ?? '—'}</dd>
        </div>
      </dl>

      {topConcern && <p className="member-card-concern">{topConcern.label}: {topConcern.hint}</p>}

      <footer className="member-card-foot">
        <StatusPill tone={risk.tone === 'risk' ? 'error' : risk.tone === 'watch' ? 'warning' : 'success'}>{risk.label}</StatusPill>
        <Link className="text-link" to={`/manager/team/${member.id}`}>Xem hồ sơ 360°<ArrowRight size={14} /></Link>
      </footer>
    </article>
  );
}
