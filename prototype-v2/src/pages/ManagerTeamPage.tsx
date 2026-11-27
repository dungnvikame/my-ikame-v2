import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { evaluateEarlySignal } from '../lib/signals';
import { Avatar } from '../components/UI';

type FilterStatus = 'all' | 'risk' | 'watch' | 'healthy' | 'new';

export const ManagerTeamPage: React.FC = () => {
  const { teamMembers } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filtered = useMemo(() => {
    return teamMembers.filter((m) => {
      const sig = evaluateEarlySignal(m);
      if (filter === 'risk' && sig.level !== 'risk') return false;
      if (filter === 'watch' && sig.level !== 'watch') return false;
      if (filter === 'healthy' && sig.level !== 'healthy') return false;
      if (filter === 'new' && !m.onboardingDay) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.team.toLowerCase().includes(q);
      }
      return true;
    });
  }, [teamMembers, filter, query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Đội ngũ trực tiếp ({teamMembers.length})</h1>
          <p className="page-desc">
            Chỉ hiển thị thành viên thuộc phạm vi quản lý trên HRIS của Trần Thanh Mai · Không bao gồm dữ liệu lương/nhạy cảm
          </p>
        </div>
        <span className="badge badge-success">
          <ShieldCheck size={13} /> HRIS Manager Scope
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'risk', label: 'Cần quan tâm sớm' },
              { id: 'watch', label: 'Cần theo dõi' },
              { id: 'healthy', label: 'Ổn định' },
              { id: 'new', label: 'Người mới (<60 ngày)' },
            ] as { id: FilterStatus; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn btn-sm ${filter === f.id ? 'btn-secondary' : 'btn-dim'}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              className="input"
              style={{ paddingLeft: 32, height: 34 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm thành viên..."
            />
          </div>
          <div style={{ display: 'flex', border: '1px solid var(--border-primary)', borderRadius: 'var(--r-6)', overflow: 'hidden' }}>
            <button
              type="button"
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ background: viewMode === 'grid' ? 'var(--active-neutral)' : 'transparent', borderRadius: 0 }}
              onClick={() => setViewMode('grid')}
              aria-label="Xem dạng thẻ"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
              style={{ background: viewMode === 'table' ? 'var(--active-neutral)' : 'transparent', borderRadius: 0 }}
              onClick={() => setViewMode('table')}
              aria-label="Xem dạng bảng"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid-3">
          {filtered.map((m) => {
            const sig = evaluateEarlySignal(m);
            return (
              <Link key={m.id} to={`/manager/team/${m.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar person={m} size={40} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-strong)' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.title}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span
                    className={`badge ${
                      sig.level === 'risk' ? 'badge-error' : sig.level === 'watch' ? 'badge-warning' : 'badge-success'
                    }`}
                  >
                    {sig.label}
                  </span>
                  {m.onboardingDay && <span className="badge badge-info">Ngày {m.onboardingDay}/60</span>}
                </div>

                <div className="grid-2" style={{ gap: 8 }}>
                  <div className="card-sunk" style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>EKS (iGoal)</div>
                    <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>
                      {m.pulse?.eksScore ?? 80}/100
                    </div>
                  </div>
                  <div className="card-sunk" style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Kudos (2 tuần)</div>
                    <div className="tabular" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>
                      {m.pulse?.kudosReceived2Weeks ?? 0} lượt
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <span>1:1 gần nhất: {m.pulse?.last1on1 || '—'}</span>
                  <span style={{ color: 'var(--info-fg)', fontWeight: 600 }}>Xem 360° →</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', textAlign: 'left', color: 'var(--text-tertiary)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Thành viên</th>
                <th style={{ padding: '12px 12px' }}>Trạng thái</th>
                <th style={{ padding: '12px 12px' }}>EKS (iGoal)</th>
                <th style={{ padding: '12px 12px' }}>Check-in OKR</th>
                <th style={{ padding: '12px 12px' }}>1:1 gần nhất</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const sig = evaluateEarlySignal(m);
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar person={m} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{m.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{m.title} · {m.team}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span className={`badge ${sig.level === 'risk' ? 'badge-error' : sig.level === 'watch' ? 'badge-warning' : 'badge-success'}`}>
                        {sig.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px' }} className="tabular">
                      <strong>{m.pulse?.eksScore}</strong>/100
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      {m.pulse?.okrCheckinStatus === 'on_time' ? 'Đúng hạn' : 'Trễ hạn'}
                    </td>
                    <td style={{ padding: '12px 12px' }} className="tabular">
                      {m.pulse?.last1on1}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link to={`/manager/team/${m.id}`} className="btn btn-secondary btn-sm">
                        Hồ sơ 360°
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
