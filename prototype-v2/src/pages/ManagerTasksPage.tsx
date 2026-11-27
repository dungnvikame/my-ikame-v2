import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Check, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { evaluateEarlySignal } from '../lib/signals';
import { Avatar } from '../components/UI';

export const ManagerTasksPage: React.FC = () => {
  const { requests, teamMembers, resolveRequest, schedule1on1 } = useApp();
  const pending = requests.filter((r) => r.status === 'Chờ duyệt');
  const followUps = teamMembers
    .map((m) => ({ member: m, signal: evaluateEarlySignal(m) }))
    .filter((x) => x.signal.level !== 'healthy' || Boolean(x.member.onboardingDay));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Việc cần làm · Quản lý</h1>
          <p className="page-desc">Duyệt yêu cầu đội ngũ và các điểm chạm 1:1 quan trọng trong tuần</p>
        </div>
      </div>

      {/* Pending Approvals */}
      <section className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">
            Đơn chờ duyệt <span className="tab-count">{pending.length}</span>
          </h2>
        </div>

        {pending.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 12px' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--success-fg)', marginBottom: 6 }} />
            <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Đã xử lý toàn bộ đơn chờ duyệt!</div>
          </div>
        ) : (
          <div className="clean-list">
            {pending.map((req) => (
              <div key={req.id} className="clean-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: 'var(--text-strong)' }}>{req.personName}</strong>
                    <span className="badge badge-neutral">{req.type}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {req.dateRange} · {req.summary} — {req.reason}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolveRequest(req.id, 'Từ chối')}>
                    <X size={14} /> Từ chối
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => resolveRequest(req.id, 'Đã duyệt')}>
                    <Check size={14} /> Duyệt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Follow-up 1:1 & Onboarding Check-ins */}
      <section className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">
            Cần trao đổi 1:1 / Đồng hành <span className="tab-count">{followUps.length}</span>
          </h2>
        </div>
        <div className="clean-list">
          {followUps.map(({ member, signal }) => (
            <div key={member.id} className="clean-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, flex: 1 }}>
                <Avatar person={member} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link to={`/manager/team/${member.id}`} style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
                      {member.name}
                    </Link>
                    {member.onboardingDay ? (
                      <span className="badge badge-info">Ngày {member.onboardingDay}/60</span>
                    ) : (
                      <span className={`badge ${signal.level === 'risk' ? 'badge-error' : 'badge-warning'}`}>
                        {signal.label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>
                    {member.onboardingDay
                      ? 'Đặt 1:1 review mốc 30 ngày thử việc'
                      : signal.reasons.join(' · ')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => schedule1on1(member.name)}
              >
                <CalendarClock size={14} /> Đặt 1:1
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
