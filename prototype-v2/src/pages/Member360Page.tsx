import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CalendarClock,
  CheckCircle2,
  Compass,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { evaluateEarlySignal } from '../lib/signals';
import { Avatar } from '../components/UI';

type MemberTab = 'overview' | 'goals' | 'checkin' | 'growth' | 'hris' | 'onboarding';

export const Member360Page: React.FC = () => {
  const { id } = useParams();
  const { teamMembers, objectives, quests, schedule1on1 } = useApp();
  const [tab, setTab] = useState<MemberTab>('overview');

  // Strict scope check (PRD §7.11 MG-11): Manager only sees direct reports!
  const member = teamMembers.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="card empty-state">
        <h1 style={{ margin: '0 0 8px', fontSize: 18 }}>403 · Ngoài phạm vi quản lý trực tiếp</h1>
        <p style={{ margin: '0 0 14px' }}>
          Theo phân quyền HRIS, bạn chỉ có thể xem Hồ sơ 360° của thành viên thuộc phạm vi quản lý trực tiếp.
        </p>
        <Link to="/manager/team" className="btn btn-secondary">
          Quay lại Đội ngũ
        </Link>
      </div>
    );
  }

  const sig = evaluateEarlySignal(member);
  const memberObjectives = objectives.filter((o) => o.ownerId === member.id);
  const isNewJoiner = Boolean(member.onboardingDay && member.onboardingDay <= 60);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link to="/manager/team" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={15} /> Quay lại Đội ngũ
      </Link>

      {/* Header */}
      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar person={member} size={56} />
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: 'var(--text-strong)' }}>{member.name}</h1>
                <span className={`badge ${sig.level === 'risk' ? 'badge-error' : sig.level === 'watch' ? 'badge-warning' : 'badge-success'}`}>
                  {sig.label}
                </span>
                {isNewJoiner && <span className="badge badge-info">Người mới · Ngày {member.onboardingDay}/60</span>}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                {member.title} · {member.level} · {member.team}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {member.email} · {member.slack} · Gia nhập {member.joinedAt}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to={`/feed?compose=kudos&to=${member.id}`} className="btn btn-secondary btn-sm">
              <Award size={14} /> Gửi ghi nhận
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => schedule1on1(isNewJoiner ? `${member.name} (mốc 30 ngày)` : member.name)}
            >
              <CalendarClock size={14} /> {isNewJoiner ? 'Đặt 1:1 mốc 30 ngày' : 'Đặt lịch 1:1'}
            </button>
          </div>
        </div>
      </section>

      {/* 5 Tabs + Onboarding tab for New Joiner (MG-9, OB-8) */}
      <div className="tabs-bar">
        {(
          [
            { id: 'overview', label: 'Tổng quan' },
            { id: 'goals', label: 'Mục tiêu & EKS' },
            { id: 'checkin', label: 'Check-in & 1:1' },
            { id: 'growth', label: 'Ghi nhận & phát triển' },
            { id: 'hris', label: 'Hồ sơ nhân sự' },
            ...(isNewJoiner ? [{ id: 'onboarding' as const, label: 'Hành trình 60 ngày' }] : []),
          ] as { id: MemberTab; label: string }[]
        ).map((t) => (
          <button key={t.id} type="button" className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {tab === 'overview' && (
        <div className="grid-2">
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Sparkles size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Gợi ý AI cho quản lý
              </h2>
              <span className="source-chip">Multi-source MCP</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(member.pulse?.aiSuggestions || []).map((s, i) => (
                <div key={i} className="card-sunk" style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Tín hiệu đa nguồn
              </div>
              <div className="grid-3" style={{ gap: 8 }}>
                <div className="card-sunk">
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>EKS · iGoal</div>
                  <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>{member.pulse?.eksScore}</div>
                </div>
                <div className="card-sunk">
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Tuân thủ · iGoal</div>
                  <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>{member.pulse?.reportCompliance}%</div>
                </div>
                <div className="card-sunk">
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Kudos · Feed</div>
                  <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>{member.pulse?.kudosReceived2Weeks}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>Hoạt động gần đây</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(member.pulse?.recentActivity || []).map((a, i) => (
                <div key={i} className="card-sunk">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span className="source-chip">{a.source}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-strong)' }}>{a.text}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Goals & EKS */}
      {tab === 'goals' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Mục tiêu & EKS kỳ Q4/2026</h2>
            <span className="source-chip">Nguồn: iGoal V2</span>
          </div>
          {memberObjectives.length === 0 ? (
            <div className="card-sunk">EKS hiện tại đạt <strong>{member.pulse?.eksScore}/100</strong> · Tuân thủ báo cáo {member.pulse?.reportCompliance}%.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {memberObjectives.map((obj) => (
                <div key={obj.id} className="card-sunk">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                    <strong style={{ color: 'var(--text-strong)' }}>{obj.title}</strong>
                    <span className="tabular" style={{ fontWeight: 700 }}>{obj.progress}%</span>
                  </div>
                  <div className="progress-track" style={{ marginBottom: 10 }}>
                    <div className="progress-fill" style={{ width: `${obj.progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {obj.keyResults.map((kr) => (
                      <div key={kr.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        <span>• {kr.title}</span>
                        <span className="tabular" style={{ fontWeight: 600 }}>{kr.metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Check-in & 1:1 */}
      {tab === 'checkin' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Lịch sử Check-in & 1:1</h2>
            <span className="source-chip">Nguồn: iGoal · Google Calendar</span>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="card-sunk">
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Buổi 1:1 gần nhất</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>{member.pulse?.last1on1}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                Trọng tâm: Rà soát workload sprint & tháo gỡ vướng mắc liên phòng ban.
              </div>
            </div>
            <div className="card-sunk">
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Buổi 1:1 tiếp theo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
                {member.pulse?.next1on1 || 'Chưa đặt lịch'}
              </div>
              {!member.pulse?.next1on1 && (
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => schedule1on1(member.name)}>
                  Đặt lịch ngay
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Growth & Competencies */}
      {tab === 'growth' && (
        <div className="grid-2">
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Khung năng lực</h2>
              <span className="source-chip">Nguồn: P&OD Competency</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(member.pulse?.competencies || []).map((c) => (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text-strong)' }}>{c.name}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{c.level}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Lộ trình học tập</h2>
              <span className="source-chip">Nguồn: iWiki Learning</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(member.pulse?.learningItems || []).map((l) => (
                <div key={l.title} className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>{l.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{l.source}</div>
                  </div>
                  <span className="badge badge-neutral">{l.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: HRIS non-sensitive profile (Strictly NO salary/CCCD per PRD §7.11 MG-11!) */}
      {tab === 'hris' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Hồ sơ công việc (HRIS · Chỉ đọc)</h2>
            <span className="badge badge-neutral">
              <Lock size={12} /> Ẩn dữ liệu lương & định danh cá nhân
            </span>
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            {[
              { label: 'Mã nhân viên', value: member.employeeCode },
              { label: 'Chức danh & Cấp bậc', value: `${member.title} · ${member.level}` },
              { label: 'Phòng ban / Team', value: `${member.department} · ${member.team}` },
              { label: 'Ngày gia nhập', value: member.joinedAt },
              { label: 'Loại nhân sự', value: member.employmentType },
              { label: 'Hình thức & Địa điểm', value: `${member.workMode} · ${member.location}` },
            ].map((f) => (
              <div key={f.label} className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{f.label}</span>
                <strong style={{ fontSize: 13, color: 'var(--text-strong)' }}>{f.value}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 6: Onboarding 60 Days (only for New Joiner, OB-8) */}
      {tab === 'onboarding' && isNewJoiner && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Compass size={16} /> Hành trình 60 ngày của {member.name} (Ngày {member.onboardingDay}/60)
              </h2>
              <p className="card-subtitle">Theo dõi các quest hội nhập và phối hợp cùng Buddy Nguyễn Hoàng An</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => schedule1on1(`${member.name} (mốc 30 ngày)`)}>
              Đặt 1:1 mốc 30 ngày
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quests.map((q) => (
              <div key={q.id} className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} style={{ color: q.completed ? 'var(--success-fg)' : 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: 13.5, color: 'var(--text-strong)', textDecoration: q.completed ? 'line-through' : 'none' }}>
                    {q.title}
                  </span>
                </div>
                <span className="badge badge-neutral">Ngày {q.dueDay} · {q.source}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
