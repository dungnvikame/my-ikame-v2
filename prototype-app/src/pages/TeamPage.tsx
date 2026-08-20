import { useMemo, useState } from 'react';
import { ArrowRight, MagnifyingGlass, Rows, SquaresFour } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { memberProfile, teamMembers } from '../data/mockData';
import { Button, EmptyState, StatusPill } from '../components/UI';
import { useAppState } from '../AppState';
import type { TeamMember, TeamMemberStatus } from '../types';
import { MemberCard } from './team/MemberCard';
import {
  initials, MiniProgress, normalize, riskLabel, riskScore, STATUS_LABEL, STATUS_TONE,
} from './team/team-visuals';

type StatusFilter = 'all' | TeamMemberStatus;
type SortKey = 'attention' | 'name' | 'progress';
type ViewMode = 'cards' | 'table';

const SORT_LABEL: Record<SortKey, string> = {
  attention: 'Cần chú ý nhất',
  name: 'Tên A → Z',
  progress: 'Tiến độ EKS',
};

function eksAverage(member: TeamMember): number {
  const profile = memberProfile(member.id);
  if (!profile || profile.eks.length === 0) return 0;
  return Math.round(profile.eks.reduce((sum, item) => sum + item.progress, 0) / profile.eks.length);
}

/** Dải sức khỏe team — số liệu tổng hợp từ hồ sơ 360° của toàn bộ roster. */
function TeamHealthStrip({ roster }: { roster: TeamMember[] }) {
  const withProfile = roster.map((member) => memberProfile(member.id)).filter(Boolean);
  const active = withProfile.filter((profile) => profile!.eks.length > 0);
  const avgProgress = active.length > 0
    ? Math.round(active.reduce((sum, profile) => sum + profile!.eks.reduce((s, e) => s + e.progress, 0) / profile!.eks.length, 0) / active.length)
    : 0;
  const checkinDone = withProfile.filter((profile) => profile!.reportsSubmitted === profile!.reportsExpected && profile!.reportsExpected > 0).length;
  const needsOneOnOne = withProfile.filter((profile) => profile!.nextOneOnOneLabel === 'Chưa đặt lịch').length;
  const highRisk = roster.filter((member) => riskScore(memberProfile(member.id)) >= 6).length;

  return (
    <div className="team-health" role="list">
      <div role="listitem"><strong>{avgProgress}%</strong><span>Tiến độ EKS trung bình</span></div>
      <div role="listitem"><strong>{checkinDone}/{active.length}</strong><span>Check-in đầy đủ kỳ này</span></div>
      <div role="listitem"><strong>{needsOneOnOne}</strong><span>Chưa đặt lịch 1:1</span></div>
      <div role="listitem"><strong>{highRisk}</strong><span>Thành viên ưu tiên cao</span></div>
    </div>
  );
}

export function TeamPage() {
  const { user } = useAppState();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('attention');
  const [view, setView] = useState<ViewMode>('cards');

  // Scope boundary: roster never includes members outside this manager's own team.
  const roster = useMemo(() => teamMembers.filter((member) => member.teamId === user.teamId), [user.teamId]);
  const normalizedQuery = normalize(query.trim());

  const visible = useMemo(() => {
    const filtered = roster
      .filter((member) => !normalizedQuery || normalize(member.name).includes(normalizedQuery) || normalize(member.role).includes(normalizedQuery))
      .filter((member) => statusFilter === 'all' || member.status === statusFilter);
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'vi');
      if (sortKey === 'progress') return eksAverage(b) - eksAverage(a);
      return riskScore(memberProfile(b.id)) - riskScore(memberProfile(a.id));
    });
  }, [roster, normalizedQuery, statusFilter, sortKey]);

  const chips: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: roster.length },
    { key: 'needs_attention', label: STATUS_LABEL.needs_attention, count: roster.filter((m) => m.status === 'needs_attention').length },
    { key: 'ok', label: STATUS_LABEL.ok, count: roster.filter((m) => m.status === 'ok').length },
    { key: 'no_data', label: STATUS_LABEL.no_data, count: roster.filter((m) => m.status === 'no_data').length },
  ];

  const resetFilters = () => { setQuery(''); setStatusFilter('all'); };

  return (
    <div className="page team-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">MANAGER · {user.team.toUpperCase()}</p>
          <h1>Đội ngũ của tôi</h1>
          <p>{roster.length} thành viên trong phạm vi quản lý · dữ liệu tổng hợp từ iGoal, HRIS, 1:1 và iKame Feed.</p>
        </div>
      </header>

      <TeamHealthStrip roster={roster} />

      <div className="team-toolbar">
        <label className="filter-input">
          <MagnifyingGlass size={17} />
          <input aria-label="Tìm theo tên hoặc vai trò" placeholder="Tìm theo tên hoặc vai trò" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="team-toolbar-right">
          <label className="team-sort">
            <span>Sắp xếp</span>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
              {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => <option key={key} value={key}>{SORT_LABEL[key]}</option>)}
            </select>
          </label>
          <div className="team-view-toggle" role="group" aria-label="Kiểu hiển thị">
            <button type="button" aria-pressed={view === 'cards'} className={view === 'cards' ? 'is-active' : ''} onClick={() => setView('cards')} title="Dạng thẻ">
              <SquaresFour size={17} />
            </button>
            <button type="button" aria-pressed={view === 'table'} className={view === 'table' ? 'is-active' : ''} onClick={() => setView('table')} title="Dạng bảng">
              <Rows size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="team-filter-chips" role="group" aria-label="Lọc theo trạng thái">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={`topic-chip ${statusFilter === chip.key ? 'is-active' : ''}`}
            aria-pressed={statusFilter === chip.key}
            onClick={() => setStatusFilter(chip.key)}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <EmptyState icon={<MagnifyingGlass size={44} weight="duotone" />} title="Không tìm thấy thành viên" body="Không có thành viên phù hợp với bộ lọc hiện tại." />
          <Button variant="dim" onClick={resetFilters}>Xóa bộ lọc</Button>
        </div>
      ) : view === 'cards' ? (
        <div className="member-grid">
          {visible.map((member) => <MemberCard key={member.id} member={member} profile={memberProfile(member.id)} />)}
        </div>
      ) : (
        <section className="member-table" aria-label="Danh sách đội ngũ">
          <div className="member-table-head">
            <span>Thành viên</span><span>Tiến độ EKS</span><span>Check-in</span><span>1:1 gần nhất</span><span>Mức ưu tiên</span><span />
          </div>
          {visible.map((member) => {
            const profile = memberProfile(member.id);
            const risk = riskLabel(riskScore(profile));
            const average = eksAverage(member);
            return (
              <Link key={member.id} className="member-table-row" to={`/manager/team/${member.id}`}>
                <span className="member-table-person">
                  <span className="avatar" aria-hidden="true">{initials(member.name)}</span>
                  <span><strong>{member.name}</strong><small>{member.role}</small></span>
                </span>
                <span className="member-table-progress">
                  {profile?.eks.length ? <><MiniProgress value={average} tone={average >= 60 ? 'good' : average >= 45 ? 'watch' : 'risk'} /><small>{average}%</small></> : <small className="muted-text">Chưa có</small>}
                </span>
                <span>{profile?.signals.find((s) => s.key === 'checkin')?.value ?? '—'}</span>
                <span>{profile?.signals.find((s) => s.key === 'oneonone')?.value ?? '—'}</span>
                <span><StatusPill tone={risk.tone === 'risk' ? 'error' : risk.tone === 'watch' ? 'warning' : 'success'}>{risk.label}</StatusPill></span>
                <span className="member-table-go"><ArrowRight size={16} /></span>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
