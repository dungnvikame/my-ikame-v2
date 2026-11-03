import { ArrowRight, CalendarPlus, HandsClapping, Pulse, Target, UsersThree } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../../components/UI';
import { ENGAGEMENT_WEEK_LABEL, type MemberWeekEngagement } from '../../data/team-engagement';
import { checkInOnTime, earlySignals, kudosStats, teamWaer, trend } from '../../lib/engagement';
import type { TeamMember } from '../../types';

/**
 * "Nhịp team tuần này" — lát mỏng Manager Intelligence: 3 tín hiệu engagement của team + xu hướng,
 * và tín hiệu sớm kèm hành động 2 phút (ghi nhận / đặt 1:1). Mọi số đều nêu nguồn.
 */
export function TeamPulse({ rows, roster }: { rows: MemberWeekEngagement[]; roster: TeamMember[] }) {
  const waer = teamWaer(rows, 'thisWeek');
  const waerTrend = trend(waer.percent, teamWaer(rows, 'lastWeek').percent);
  const kudos = kudosStats(rows);
  const checkIn = checkInOnTime(rows, 'thisWeek');
  const checkInTrend = trend(checkIn.percent, checkInOnTime(rows, 'lastWeek').percent);
  const signals = earlySignals(rows, roster).slice(0, 2);

  const tiles = [
    { icon: Pulse, label: 'Team WAER', value: `${waer.count}/${waer.total} · ${waer.percent}%`, hint: waerTrend.label, tone: waerTrend.tone },
    { icon: HandsClapping, label: 'Kudos tuần này', value: `cho ${kudos.given} · nhận ${kudos.received}`, hint: kudos.unrecognized.length > 0 ? `${kudos.unrecognized.length} người chưa được ghi nhận 2 tuần` : 'Ai cũng đã được ghi nhận', tone: kudos.unrecognized.length > 0 ? 'watch' : 'good' },
    { icon: Target, label: 'Check-in OKR đúng hạn', value: `${checkIn.count}/${checkIn.total}`, hint: checkInTrend.label, tone: checkInTrend.tone },
  ] as const;

  return (
    <section className="team-pulse section-block" aria-label="Nhịp team tuần này">
      <SectionHeader title="Nhịp team tuần này" meta={`Từ iKame Feed · iGoal · iCheck · ${ENGAGEMENT_WEEK_LABEL} · WAER = có ≥1 hành động có nghĩa`} />
      <div className="pulse-tiles" role="list">
        {tiles.map(({ icon: Icon, label, value, hint, tone }) => (
          <article key={label} role="listitem" className={`pulse-tile pulse-tile--${tone}`}>
            <span className="pulse-tile-icon" aria-hidden="true"><Icon size={18} weight="duotone" /></span>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{hint}</p>
          </article>
        ))}
      </div>

      <div className="pulse-signals">
        <p className="pulse-signals-title"><UsersThree size={16} /> Tín hiệu sớm</p>
        {signals.length === 0 ? (
          <p className="inline-guidance">Không có tín hiệu sớm nào — team đang đều nhịp.</p>
        ) : (
          <ul className="pulse-signal-list">
            {signals.map((signal) => (
              <li key={signal.memberId} className="pulse-signal">
                <div className="pulse-signal-copy">
                  <strong>{signal.name}</strong>
                  <span>{signal.reason}</span>
                  <small>Gợi ý: {signal.suggestion}</small>
                </div>
                <div className="pulse-signal-actions">
                  <Link className="button button--primary" to={`/feed?compose=kudos&to=${encodeURIComponent(signal.name)}`}><HandsClapping size={16} />Gửi ghi nhận</Link>
                  <Link className="button" to={`/manager/team/${signal.memberId}`}><CalendarPlus size={16} />Đặt 1:1</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link className="text-link" to="/manager/team">Xem từng thành viên<ArrowRight size={14} /></Link>
      </div>
    </section>
  );
}
