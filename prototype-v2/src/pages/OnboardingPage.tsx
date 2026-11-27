import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Circle,
  ExternalLink,
  MessageSquareHeart,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERNAL_APPS } from '../data/mockData';
import { Avatar } from '../components/UI';

const MILESTONES = [
  { id: 'm1' as const, label: 'Welcome Pack', dayLabel: 'Ngày 1' },
  { id: 'm2' as const, label: 'Hoà nhập', dayLabel: 'Tuần 1' },
  { id: 'm3' as const, label: 'Vững vàng', dayLabel: '30 ngày' },
  { id: 'm4' as const, label: 'Tốt nghiệp', dayLabel: '60 ngày' },
];

const PULSE_OPTIONS = [
  { score: 1, label: 'Cần hỗ trợ', emoji: '😟' },
  { score: 2, label: 'Tạm ổn', emoji: '😐' },
  { score: 3, label: 'Thuận lợi', emoji: '🙂' },
  { score: 4, label: 'Rất tốt!', emoji: '😄' },
];

export const OnboardingPage: React.FC = () => {
  const {
    currentPerson,
    people,
    quests,
    toggleQuestComplete,
    onboardingSurvey,
    submitOnboardingSurvey,
    launchApp,
  } = useApp();

  // Progressive disclosure: focus on current active milestone (M3) by default, clickable to inspect others!
  const [selectedMilestone, setSelectedMilestone] = useState<'m1' | 'm2' | 'm3' | 'm4' | 'all'>('m3');

  const day = currentPerson.onboardingDay || 32;
  const buddy = people.find((p) => p.id === currentPerson.buddyId) || people[0];
  const manager = people.find((p) => p.id === currentPerson.managerId) || people[2];
  const doneCount = quests.filter((q) => q.completed).length;
  const pct = Math.round((doneCount / quests.length) * 100);

  const visibleMilestones =
    selectedMilestone === 'all'
      ? MILESTONES
      : MILESTONES.filter((m) => m.id === selectedMilestone);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Clean Hero + Interactive 4-Milestone Stepper */}
      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div>
            <h1 className="page-title">Hành trình 60 ngày</h1>
            <p className="page-desc">
              {currentPerson.name} · Ngày <strong>{day}/60</strong> · Hoàn thành {doneCount}/{quests.length} ({pct}%)
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedMilestone(selectedMilestone === 'all' ? 'm3' : 'all')}
          >
            {selectedMilestone === 'all' ? 'Chỉ xem mốc hiện tại' : 'Xem cả 12 nhiệm vụ'}
          </button>
        </div>

        {/* Clickable 4-Step Milestone Selector */}
        <div className="grid-4" style={{ gap: 10 }}>
          {MILESTONES.map((ms) => {
            const msQuests = quests.filter((q) => q.milestoneId === ms.id);
            const msDone = msQuests.filter((q) => q.completed).length;
            const allDone = msDone === msQuests.length;
            const isSelected = selectedMilestone === ms.id;
            return (
              <button
                key={ms.id}
                type="button"
                onClick={() => setSelectedMilestone(ms.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-10)',
                  border: `1.5px solid ${
                    isSelected
                      ? 'var(--brand-primary)'
                      : allDone
                        ? 'var(--success-border)'
                        : 'var(--border-primary)'
                  }`,
                  background: isSelected
                    ? 'var(--brand-primary-subtle)'
                    : allDone
                      ? 'var(--success-bg)'
                      : 'var(--bg-subtle)',
                  transition: 'border-color 140ms, background 140ms',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{ms.dayLabel}</span>
                  <span className="tabular" style={{ fontSize: 11.5, fontWeight: 700, color: allDone ? 'var(--success-fg)' : 'var(--text-strong)' }}>
                    {allDone ? '✓ Xong' : `${msDone}/${msQuests.length}`}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>{ms.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="layout-with-rail" style={{ gap: 22 }}>
        {/* Focused Milestone Quests (Clean Divider List!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibleMilestones.map((ms) => {
            const msQuests = quests.filter((q) => q.milestoneId === ms.id);
            return (
              <section key={ms.id} className="card">
                <div className="card-header" style={{ marginBottom: 8 }}>
                  <h2 className="card-title">
                    {ms.label} <span className="tab-count">{ms.dayLabel}</span>
                  </h2>
                  {ms.id === 'm3' && (
                    <span className="badge badge-info">
                      <Award size={12} /> Mốc mở huy hiệu 30 ngày
                    </span>
                  )}
                </div>

                <div className="clean-list">
                  {msQuests.map((q) => {
                    const isOverdue = !q.completed && q.dueDay < day;
                    return (
                      <div key={q.id} className="clean-row" style={{ alignItems: 'flex-start', opacity: q.completed ? 0.68 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, flex: 1, minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => toggleQuestComplete(q.id)}
                            aria-label={`Đánh dấu ${q.title}`}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              marginTop: 2,
                              color: q.completed ? 'var(--success-fg)' : 'var(--text-tertiary)',
                            }}
                          >
                            {q.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                          </button>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13.5,
                                color: 'var(--text-strong)',
                                textDecoration: q.completed ? 'line-through' : 'none',
                              }}
                            >
                              {q.title}
                            </div>
                            <div style={{ fontSize: 12, color: isOverdue ? 'var(--error-fg)' : 'var(--text-tertiary)', marginTop: 2 }}>
                              {q.source} · {isOverdue ? `Trễ ${day - q.dueDay} ngày` : `Hạn Ngày ${q.dueDay}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {q.actionRoute && !q.completed && (
                            <Link to={q.actionRoute} className="btn btn-dim btn-sm">
                              Mở
                            </Link>
                          )}
                          {q.externalApp && !q.completed && (
                            <button
                              type="button"
                              className="btn btn-dim btn-sm"
                              onClick={() => {
                                const app = INTERNAL_APPS.find((a) => a.name === q.externalApp);
                                if (app) launchApp(app);
                              }}
                            >
                              {q.externalApp} <ExternalLink size={12} />
                            </button>
                          )}
                          {!q.completed && q.id === 'q9' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => toggleQuestComplete(q.id)}
                            >
                              Hoàn thành
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Calm Right Rail */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card">
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', marginBottom: 10 }}>
              Người đồng hành
            </div>
            <div className="clean-list">
              {[
                { roleLabel: 'Buddy', p: buddy },
                { roleLabel: 'Quản lý', p: manager },
              ].map((row) => (
                <div key={row.roleLabel} className="clean-row" style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar person={row.p} size={34} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{row.p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {row.roleLabel} · {row.p.slack}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to={`/feed?compose=kudos&to=${buddy.id}`}
              className="btn btn-dim btn-sm"
              style={{ width: '100%', marginTop: 10 }}
            >
              <Sparkles size={13} /> Cảm ơn Buddy
            </Link>
          </section>

          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', marginBottom: 4 }}>
              <MessageSquareHeart size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Khảo sát 30 ngày
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-tertiary)' }}>
              1 chạm · Ẩn danh gửi P&OD
            </p>

            {onboardingSurvey.day30 ? (
              <div className="badge badge-success" style={{ width: '100%', height: 32, justifyContent: 'center' }}>
                <CheckCircle2 size={14} /> Đã gửi ({onboardingSurvey.day30}/4)
              </div>
            ) : (
              <div className="grid-2" style={{ gap: 6 }}>
                {PULSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.score}
                    type="button"
                    className="btn btn-dim"
                    style={{ height: 40, flexDirection: 'column', gap: 1, fontSize: 11.5 }}
                    onClick={() => submitOnboardingSurvey('day30', opt.score)}
                  >
                    <span style={{ fontSize: 15 }}>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};
