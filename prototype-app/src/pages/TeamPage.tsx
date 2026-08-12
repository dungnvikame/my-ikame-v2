import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MagnifyingGlass, UserCircle, X } from '@phosphor-icons/react';
import { teamMembers } from '../data/mockData';
import { Button, EmptyState, IconButton, SectionHeader, StatusPill } from '../components/UI';
import { useAppState } from '../AppState';
import type { TeamMember, TeamMemberStatus } from '../types';

type StatusFilter = 'all' | TeamMemberStatus;

const STATUS_LABEL: Record<TeamMemberStatus, string> = {
  needs_attention: 'Cần chú ý',
  ok: 'Đã ổn',
  no_data: 'Chưa có dữ liệu',
};

const STATUS_TONE: Record<TeamMemberStatus, 'error' | 'success' | 'info'> = {
  needs_attention: 'error',
  ok: 'success',
  no_data: 'info',
};

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function TeamPage() {
  const { user } = useAppState();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Scope boundary: roster never includes members outside this manager's own team.
  const roster = teamMembers.filter((member: TeamMember) => member.teamId === user.teamId);
  const normalizedQuery = normalize(query.trim());
  const visible = roster
    .filter((member) => !normalizedQuery || normalize(member.name).includes(normalizedQuery))
    .filter((member) => statusFilter === 'all' || member.status === statusFilter);
  const selected = roster.find((member) => member.id === selectedId) ?? null;

  const chips: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: roster.length },
    { key: 'needs_attention', label: STATUS_LABEL.needs_attention, count: roster.filter((m) => m.status === 'needs_attention').length },
    { key: 'ok', label: STATUS_LABEL.ok, count: roster.filter((m) => m.status === 'ok').length },
    { key: 'no_data', label: STATUS_LABEL.no_data, count: roster.filter((m) => m.status === 'no_data').length },
  ];

  const openMember = (id: string, row: HTMLElement) => {
    triggerRef.current = row;
    setSelectedId(id);
  };

  const closePanel = () => {
    setSelectedId(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (selectedId) closeButtonRef.current?.focus();
  }, [selectedId]);

  const onDrawerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">MANAGER · {user.team.toUpperCase()}</p>
          <h1>Đội ngũ của tôi</h1>
          <p>{roster.length} thành viên · {visible.length} đang hiển thị</p>
        </div>
      </header>

      <div className="filter-row">
        <label className="filter-input">
          <MagnifyingGlass size={17} />
          <input aria-label="Tìm thành viên" placeholder="Tìm thành viên" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="filter-row" role="group" aria-label="Lọc theo trạng thái">
          {chips.map((chip) => (
            <button
              key={chip.key}
              className={`button button--dim ${statusFilter === chip.key ? 'is-active' : ''}`}
              aria-pressed={statusFilter === chip.key}
              onClick={() => setStatusFilter(chip.key)}
            >
              {chip.label} ({chip.count})
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <>
          <EmptyState title="Không tìm thấy thành viên" body="Không có thành viên phù hợp với bộ lọc hiện tại." />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -8 }}>
            <Button variant="dim" onClick={resetFilters}>Xóa bộ lọc</Button>
          </div>
        </>
      ) : (
        <section className="people-table" aria-label="Danh sách đội ngũ">
          <div className="people-table-header"><span>Thành viên</span><span>Trạng thái</span><span>Cập nhật</span><span /></div>
          {visible.map((member) => (
            <article
              key={member.id}
              className="people-row"
              role="button"
              tabIndex={0}
              aria-label={`Xem chi tiết ${member.name}`}
              onClick={(event) => openMember(member.id, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openMember(member.id, event.currentTarget);
                }
              }}
            >
              <div className="person-cell"><span className="avatar"><UserCircle size={22} /></span><span><strong>{member.name}</strong><small>{member.role}</small></span></div>
              {/* display:contents on desktop keeps these as the grid's 3 trailing columns;
                  the ≤620px override turns this into a real flex row instead of relying on
                  the table's horizontal-scroll fallback, which had no scroll affordance and
                  read as a cut-off "Trạng thái" header on a phone screen. */}
              <div className="people-row-meta">
                <StatusPill tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</StatusPill>
                <span className="muted-text">{member.lastUpdated}</span>
                <span className="text-link" aria-hidden="true">Xem</span>
              </div>
            </article>
          ))}
        </section>
      )}

      {selected && (
        <div className="drawer-layer" role="presentation" onMouseDown={closePanel}>
          <aside ref={drawerRef} className="notification-drawer" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selected.name}`} onKeyDown={onDrawerKeyDown} onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.role}</p>
              </div>
              <IconButton ref={closeButtonRef} label="Đóng" onClick={closePanel}><X size={20} /></IconButton>
            </div>
            <div className="drawer-toolbar">
              <StatusPill tone={STATUS_TONE[selected.status]}>{STATUS_LABEL[selected.status]}</StatusPill>
            </div>
            <div className="notification-list">
              <p className="inline-guidance">{selected.attentionSummary}</p>
              <p className="muted-text">Cập nhật: {selected.lastUpdated}</p>
            </div>
          </aside>
        </div>
      )}

      <SectionHeader title="Nguyên tắc hiển thị" />
      <p className="inline-guidance">Danh sách chỉ hiển thị thành viên thuộc team của bạn ({user.team}).</p>
    </div>
  );
}
