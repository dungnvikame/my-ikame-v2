import { SectionHeader } from '../../components/UI';
import type { User } from '../../types';

type IkamerGoalsRailProps = {
  user: User;
  checkInCount: number;
  needsUpdateCount: number;
};

/** Right rail (spec — iGoal My EKS screen): person card + 2 stat tiles, both derived
 * from live state only (no fabricated numbers). */
export function IkamerGoalsRail({ user, checkInCount, needsUpdateCount }: IkamerGoalsRailProps) {
  return (
    <aside className="home-rail eks-rail">
      <section className="side-info profile-section profile-header">
        <span className="avatar avatar--large" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
        <div className="profile-header-info">
          <h2>{user.name}</h2>
          <p>{user.role}</p>
          <p>{user.team}</p>
        </div>
      </section>
      <section className="section-block">
        <SectionHeader title="Chỉ số của tôi" />
        <div className="metric-grid metric-grid--rail">
          <article className="metric-card">
            <strong>{checkInCount}</strong>
            <h3>Check-in</h3>
            <p>Báo cáo bạn đã gửi trong chu kỳ này.</p>
          </article>
          <article className="metric-card">
            <strong>{needsUpdateCount}</strong>
            <h3>Mục tiêu cần cập nhật</h3>
            <p>Mục tiêu cá nhân đang chờ check-in.</p>
          </article>
        </div>
      </section>
    </aside>
  );
}
