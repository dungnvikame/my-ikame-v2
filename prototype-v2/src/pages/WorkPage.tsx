import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Sparkles,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildCurrentWeekStrip, INTERNAL_APPS } from '../data/mockData';
import { ICheckWidget } from '../components/ICheckWidget';
import { DayAttendanceCode } from '../types';

const LEGEND_MAP: Record<DayAttendanceCode, { label: string; bg: string; fg: string; border: string }> = {
  on_time: { label: 'Đúng giờ', bg: 'var(--success-bg)', fg: 'var(--success-fg)', border: 'var(--success-border)' },
  late: { label: 'Đi muộn', bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', border: 'var(--warning-border)' },
  leave: { label: 'Nghỉ phép', bg: 'var(--info-bg)', fg: 'var(--info-fg)', border: 'var(--info-border)' },
  half_day: { label: 'Nửa ngày', bg: 'var(--violet-bg)', fg: 'var(--violet-fg)', border: 'var(--violet-border)' },
  wfh: { label: 'WFH', bg: 'var(--info-bg)', fg: 'var(--info-fg)', border: 'var(--info-border)' },
  holiday: { label: 'Nghỉ lễ', bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)', border: 'var(--border-primary)' },
  absent: { label: 'Chưa chấm', bg: 'var(--error-bg)', fg: 'var(--error-fg)', border: 'var(--error-border)' },
  future: { label: 'Cuối tuần', bg: 'var(--bg-subtle)', fg: 'var(--text-tertiary)', border: 'var(--border-subtle)' },
};

export const WorkPage: React.FC = () => {
  const { currentPerson, isCheckedInToday, objectives, requests, openAiWithPrompt, launchApp } = useApp();
  const weekStrip = buildCurrentWeekStrip(isCheckedInToday);
  const myObjectives = objectives.filter((o) => o.ownerId === currentPerson.id);
  const myRequests = requests.filter((r) => r.personId === currentPerson.id).slice(0, 4);
  const lb = currentPerson.leaveBalance;
  const icheckApp = INTERNAL_APPS.find((a) => a.id === 'app-icheck')!;
  const igoalApp = INTERNAL_APPS.find((a) => a.id === 'app-igoal')!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Công việc & iCheck</h1>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => launchApp(icheckApp)}>
          Mở iCheck đầy đủ <ExternalLink size={13} />
        </button>
      </div>

      {/* Top Row: iCheck Widget + Leave Balance Card */}
      <div className="grid-2">
        <ICheckWidget />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h2 className="card-title">
                <CalendarDays size={16} /> Ngày phép
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{currentPerson.employeeCode}</span>
            </div>

            <div className="grid-2" style={{ gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Phép năm còn</div>
                <div className="tabular" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
                  {lb.annualRemaining}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)' }}> / {lb.annualTotal}d</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Năm cũ chuyển</div>
                <div className="tabular" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-strong)', marginTop: 2 }}>
                  {lb.carriedOver}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)' }}>d</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Phép ốm</div>
                <div className="tabular" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-strong)', marginTop: 2 }}>
                  {lb.sickRemaining} ngày
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Phép hỉ</div>
                <div className="tabular" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-strong)', marginTop: 2 }}>
                  {lb.weddingLeave} ngày
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => openAiWithPrompt('Chính sách nghỉ phép thế nào?')}
            >
              Xem quy định phép →
            </button>
          </div>
        </div>
      </div>

      {/* Week Attendance Strip (WK-2) */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Clock size={16} /> Tuần này (23/11 – 29/11)
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(['on_time', 'late', 'wfh', 'leave', 'absent'] as DayAttendanceCode[]).map((code) => (
              <span
                key={code}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 7px',
                  borderRadius: 'var(--r-full)',
                  background: LEGEND_MAP[code].bg,
                  color: LEGEND_MAP[code].fg,
                  border: `1px solid ${LEGEND_MAP[code].border}`,
                }}
              >
                {LEGEND_MAP[code].label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: 8 }}>
          {weekStrip.map((d) => {
            const meta = LEGEND_MAP[d.code];
            return (
              <div
                key={d.dateLabel}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--r-10)',
                  background: meta.bg,
                  border: `1px solid ${d.isToday ? 'var(--brand-primary)' : meta.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>
                    {d.dayLabel} · {d.dateLabel}
                  </span>
                  {d.isToday && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-primary-fg)' }}>Hôm nay</span>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: meta.fg }}>{meta.label}</div>
                <div className="tabular" style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  {d.checkIn ? `${d.checkIn} – ${d.checkOut || '...'}` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: My Objectives (WK-4) + My Recent Requests (WK-5) */}
      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Target size={16} /> Mục tiêu của tôi
              </h2>
              <p className="card-subtitle">Tóm tắt từ iGoal V2 · Check-in nhanh qua MCP</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => launchApp(igoalApp)}>
              Mở iGoal <ExternalLink size={13} />
            </button>
          </div>

          {myObjectives.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 10px' }}>
              Chưa có OKR cá nhân nào gắn trong kỳ này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myObjectives.map((obj) => (
                <div key={obj.id} className="card-sunk" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{obj.title}</div>
                    <span className={`badge ${obj.needsCheckin ? 'badge-warning' : 'badge-success'}`}>
                      {obj.needsCheckin ? 'Cần check-in' : 'Đã check-in'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${obj.progress}%` }} />
                    </div>
                    <span className="tabular" style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>
                      {obj.progress}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                      Cập nhật gần nhất: {obj.lastCheckin}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openAiWithPrompt(`Check-in OKR "${obj.title}" tiến độ mới 82%`)}
                    >
                      <Sparkles size={13} /> Check-in với AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header" style={{ marginBottom: 8 }}>
            <h2 className="card-title">
              <FileText size={16} /> Đề xuất gần đây
            </h2>
            <button
              type="button"
              className="btn btn-dim btn-sm"
              onClick={() => openAiWithPrompt('Tạo request IT hỗ trợ thiết bị')}
            >
              + Tạo mới
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 10px' }}>
              Chưa có đề xuất nào.
            </div>
          ) : (
            <div className="clean-list">
              {myRequests.map((r) => (
                <div key={r.id} className="clean-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>
                      {r.type} · {r.dateRange}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>
                      {r.summary}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      r.status === 'Đã duyệt'
                        ? 'badge-success'
                        : r.status === 'Từ chối'
                          ? 'badge-error'
                          : 'badge-warning'
                    }`}
                  >
                    {r.status === 'Đã duyệt' && <CheckCircle2 size={12} />}
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
