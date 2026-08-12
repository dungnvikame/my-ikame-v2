import { teamMembers, users } from '../../data/mockData';
import { SectionHeader } from '../../components/UI';
import type { User } from '../../types';

/** "Tổ chức" section — manager card + up to 5 teammates (same `teamId`). Read-only,
 * fixture-driven; direct `mockData` import follows the existing pattern used by
 * ManagerPage/TeamPage/use-search-results (teamMembers has no AppState mutator — YAGNI). */
export function ProfileOrgSection({ user }: { user: User }) {
  const teammates = teamMembers.filter((member) => member.teamId === user.teamId).slice(0, 5);
  const isManager = user.id === users.mai.id;

  return (
    <section className="side-info profile-section">
      <SectionHeader title="Tổ chức" />
      <div className="profile-org-manager">
        <span className="avatar" aria-hidden="true">{isManager ? 'BLĐ' : users.mai.shortName}</span>
        <div>
          <strong>{isManager ? 'Ban Giám Đốc' : users.mai.name}</strong>
          <small>{isManager ? 'Báo cáo trực tiếp' : `Quản lý trực tiếp · ${users.mai.role}`}</small>
        </div>
      </div>
      <p className="profile-org-label">Đồng đội cùng team ({user.team})</p>
      <ul className="profile-teammate-list">
        {teammates.map((member) => (
          <li key={member.id}>
            <span className="avatar" aria-hidden="true">{member.name.split(' ').slice(-1)[0].slice(0, 1)}</span>
            <div>
              <strong>{member.name}</strong>
              <small>{member.role}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
