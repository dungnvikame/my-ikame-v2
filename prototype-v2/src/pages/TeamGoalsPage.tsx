import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { Avatar } from '../components/UI';

export const TeamGoalsPage: React.FC = () => {
  const { objectives, teamMembers, launchApp } = useApp();
  const [tab, setTab] = useState<'okr' | 'members' | 'reports'>('okr');
  const igoalApp = INTERNAL_APPS.find((a) => a.id === 'app-igoal')!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Mục tiêu team (OKR & EKS)</h1>
          <p className="page-desc">
            Tổng quan tiến độ mục tiêu đội ngũ từ iGoal V2 · Chỉnh sửa sâu mở trực tiếp hệ thống gốc
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => launchApp(igoalApp)}>
          Mở iGoal V2 đầy đủ <ExternalLink size={13} />
        </button>
      </div>

      <div className="tabs-bar">
        <button type="button" className={`tab-btn ${tab === 'okr' ? 'active' : ''}`} onClick={() => setTab('okr')}>
          OKR của team <span className="tab-count">{objectives.length}</span>
        </button>
        <button type="button" className={`tab-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          Thành viên (EKS & Tuân thủ) <span className="tab-count">{teamMembers.length}</span>
        </button>
        <button type="button" className={`tab-btn ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
          Báo cáo tuần 48
        </button>
      </div>

      {tab === 'okr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {objectives.map((o) => (
            <section key={o.id} className="card">
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Target size={15} style={{ color: 'var(--brand-primary-fg)' }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-strong)' }}>{o.title}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Owner: {o.ownerName} · Team {o.team} · Check-in gần nhất {o.lastCheckin}
                  </div>
                </div>
                <span className={`badge ${o.status === 'on_track' ? 'badge-success' : o.status === 'at_risk' ? 'badge-warning' : 'badge-error'}`}>
                  {o.status === 'on_track' ? 'Đúng tiến độ' : o.status === 'at_risk' ? 'Cần lưu ý' : 'Chậm tiến độ'} · {o.progress}%
                </span>
              </div>
              <div className="progress-track" style={{ marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${o.progress}%` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {o.keyResults.map((kr) => (
                  <div key={kr.id} className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{kr.title}</span>
                    <strong className="tabular">{kr.metric}</strong>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <section className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', textAlign: 'left', color: 'var(--text-tertiary)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Thành viên</th>
                <th style={{ padding: '12px 12px' }}>Điểm EKS</th>
                <th style={{ padding: '12px 12px' }}>Tuân thủ báo cáo</th>
                <th style={{ padding: '12px 12px' }}>Check-in tuần 48</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Hồ sơ</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar person={m} size={30} />
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px' }} className="tabular"><strong>{m.pulse?.eksScore}</strong>/100</td>
                  <td style={{ padding: '12px 12px' }} className="tabular">{m.pulse?.reportCompliance}%</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span className={`badge ${m.pulse?.okrCheckinStatus === 'on_time' ? 'badge-success' : 'badge-warning'}`}>
                      {m.pulse?.okrCheckinStatus === 'on_time' ? 'Đúng hạn' : 'Chưa / Trễ'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link to={`/manager/team/${m.id}`} className="btn btn-dim btn-sm">Xem 360°</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'reports' && (
        <section className="card">
          <h2 className="card-title" style={{ marginBottom: 10 }}>Tổng hợp báo cáo tuân thủ OKR Tuần 48</h2>
          <div className="grid-3">
            <div className="card-sunk">
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>EKS trung bình team</div>
              <div className="tabular" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-strong)' }}>80.6</div>
            </div>
            <div className="card-sunk">
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Tỷ lệ tuân thủ báo cáo</div>
              <div className="tabular" style={{ fontSize: 24, fontWeight: 700, color: 'var(--success-fg)' }}>91%</div>
            </div>
            <div className="card-sunk">
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Số OKR đang On-track</div>
              <div className="tabular" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-strong)' }}>2 / 4</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
