import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Cake,
  CalendarClock,
  Check,
  CheckCircle2,
  Compass,
  HeartHandshake,
  Info,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { evaluateEarlySignal } from '../lib/signals';
import { Avatar } from '../components/UI';
import { ICheckWidget } from '../components/ICheckWidget';
import { QuickActionsBar } from '../components/QuickActionsBar';

export const ManagerOverviewPage: React.FC = () => {
  const { teamMembers, requests, quests, resolveRequest, schedule1on1, openAiWithPrompt } = useApp();
  const [dismissedAttention, setDismissedAttention] = useState<string[]>([]);

  const pendingApprovals = requests.filter((r) => r.status === 'Chờ duyệt');
  const activeCount = teamMembers.filter((m) => m.pulse?.activeThisWeek).length;
  const teamWaer = Math.round((activeCount / teamMembers.length) * 100);
  const totalKudosWeek = teamMembers.reduce((sum, m) => sum + (m.pulse?.kudosGivenWeek || 0), 0);
  const okrOnTime = teamMembers.filter((m) => m.pulse?.okrCheckinStatus === 'on_time').length;

  const signals = teamMembers
    .map((m) => ({ member: m, signal: evaluateEarlySignal(m) }))
    .filter((x) => x.signal.level !== 'healthy');

  const newJoiner = teamMembers.find((m) => m.onboardingDay && m.onboardingDay <= 60);
  const doneQuests = quests.filter((q) => q.completed).length;

  const attentionQueue = [
    {
      id: 'att-1',
      urgent: true,
      title: 'Đặng Quốc Minh trễ check-in OKR tuần 48 (hơn 10 ngày chưa tương tác)',
      source: 'iGoal + Engagement',
      actionLabel: 'Mở 360°',
      route: '/manager/team/u-minh',
    },
    {
      id: 'att-2',
      urgent: false,
      title: 'Review mốc 30 ngày cho người mới Phạm Gia Huy (Ngày 32/60)',
      source: 'Hành trình 60 ngày',
      actionLabel: 'Xem tiến độ',
      route: '/manager/team/u-huy',
    },
  ].filter((item) => !dismissedAttention.includes(item.id));

  const totalWaiting = pendingApprovals.length + attentionQueue.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header (MG-1) */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">
            Team có <span style={{ color: totalWaiting > 0 ? 'var(--brand-primary-fg)' : 'var(--success-fg)' }}>{totalWaiting} việc</span> chờ bạn
          </h1>
          <p className="page-desc">Trần Thanh Mai · 5 thành viên trực tiếp</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => openAiWithPrompt('Tình hình team tuần này')}
        >
          <Sparkles size={14} style={{ color: 'var(--brand-primary-fg)' }} /> Hỏi AI về team
        </button>
      </div>

      {/* Team Pulse KPI Strip (MG-2) */}
      <QuickActionsBar />

      <section className="grid-3">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Team WAER tuần 48</span>
            <span className="badge badge-success">
              <TrendingUp size={12} /> +6% vs tuần trước
            </span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            {teamWaer}%{' '}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)' }}>
              ({activeCount}/{teamMembers.length} người)
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Hoạt động có nghĩa (không tính chấm công)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Kudos cho / nhận tuần này</span>
            <span className="badge badge-violet">+2 lượt</span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            {totalKudosWeek} / 7
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            2 thành viên chưa nhận Kudos trong 2 tuần
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Check-in OKR đúng hạn</span>
            <span className="source-chip">iGoal</span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            {okrOnTime}/{teamMembers.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Minh & Linh cần nhắc nhẹ trước 17:00
          </div>
        </div>
      </section>

      {/* Weekly AI Brief Banner (MG-6) */}
      <section className="card" style={{ borderColor: 'var(--brand-primary-border)', background: 'var(--brand-primary-subtle)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--brand-primary-fg)', marginBottom: 5 }}>
              <Sparkles size={15} /> Bản tin AI đầu tuần · Gợi ý cho Trần Thanh Mai
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-strong)', lineHeight: 1.55 }}>
              Nhịp đội ngũ nhìn chung ổn định (<strong>{teamWaer}% WAER</strong>). Tuy nhiên,{' '}
              <strong>Đặng Quốc Minh</strong> đang có 3 tín hiệu cần quan tâm sớm (chưa hoạt động tuần này, chưa nhận Kudos 2 tuần và trễ check-in OKR). Ngoài ra, <strong>Phạm Gia Huy</strong> vừa qua Ngày 30 — nên đặt 1 buổi 1:1 ngắn 20 phút trong tuần này.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => openAiWithPrompt('Soạn tin nhắc check-in cho Minh')}
          >
            Nhờ AI soạn tin hỏi thăm
          </button>
        </div>
      </section>

      <div className="layout-with-rail">
        {/* Left Column: Early Signals + Approvals + Attention Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Early Signals (MG-3) */}
          <section className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <HeartHandshake size={16} style={{ color: 'var(--brand-primary-fg)' }} /> Tín hiệu sớm cần quan tâm ({signals.length})
                </h2>
                <p className="card-subtitle">Hành động 2 phút: Gửi ghi nhận hoặc Đặt lịch 1:1 hỗ trợ</p>
              </div>
              <Link to="/manager/team" className="btn btn-ghost btn-sm">
                Xem cả 5 thành viên <ArrowRight size={14} />
              </Link>
            </div>

            <div className="card-sunk" style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--info-fg)' }} />
              <span>
                <strong>Đạo đức dữ liệu (P&OD):</strong> Tín hiệu sớm chỉ là gợi ý để quản lý <em>quan tâm và gỡ vướng kịp thời</em>, tuyệt đối không phải điểm đánh giá hiệu suất hay căn cứ kỷ luật.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {signals.map(({ member, signal }) => (
                <div
                  key={member.id}
                  className="card-compact"
                  style={{
                    borderColor: signal.level === 'risk' ? 'var(--error-border)' : 'var(--warning-border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, flex: 1, minWidth: 230 }}>
                    <Avatar person={member} size={38} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <Link to={`/manager/team/${member.id}`} style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>
                          {member.name}
                        </Link>
                        <span className={`badge ${signal.level === 'risk' ? 'badge-error' : 'badge-warning'}`}>
                          {signal.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                        {member.title} · 1:1 gần nhất {member.pulse?.last1on1}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {signal.reasons.map((r) => (
                          <span key={r} className="source-chip">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Link
                      to={`/feed?compose=kudos&to=${member.id}`}
                      className="btn btn-dim btn-sm"
                    >
                      <Award size={13} /> Gửi ghi nhận
                    </Link>
                    <button
                      type="button"
                      className={`btn btn-sm ${signal.level === 'risk' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => schedule1on1(member.name)}
                    >
                      <CalendarClock size={13} /> Đặt 1:1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pending Approvals (MG-5) */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title">
                Chờ bạn duyệt <span className="tab-count">{pendingApprovals.length}</span>
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>iCheck · iRequest</span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 10px' }}>
                <CheckCircle2 size={22} style={{ color: 'var(--success-fg)', marginBottom: 6 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Đã duyệt hết đơn chờ!</div>
              </div>
            ) : (
              <div className="clean-list">
                {pendingApprovals.map((req) => (
                  <div key={req.id} className="clean-row">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{req.personName}</span>
                        <span className="badge badge-neutral" style={{ height: 20, fontSize: 11 }}>{req.type}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {req.dateRange} · {req.summary}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => resolveRequest(req.id, 'Từ chối')}
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--success-fg)', borderColor: 'var(--success-border)' }}
                        onClick={() => resolveRequest(req.id, 'Đã duyệt')}
                      >
                        <Check size={14} /> Duyệt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Attention Queue (MG-4) */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title">
                <AlertCircle size={15} /> Cần bạn chú ý <span className="tab-count">{attentionQueue.length}</span>
              </h2>
            </div>
            {attentionQueue.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Không còn mục tồn đọng.</div>
            ) : (
              <div className="clean-list">
                {attentionQueue.map((item) => (
                  <div key={item.id} className="clean-row">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>{item.source}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDismissedAttention((prev) => [...prev, item.id])}
                      >
                        Bỏ qua
                      </button>
                      <Link to={item.route} className="btn btn-dim btn-sm">
                        {item.actionLabel}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Rail: Manager's own iCheck + New Joiner Card + Team Moments (MG-1, MG-7, OB-8) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ICheckWidget compact />

          {newJoiner && (
            <section className="card-compact" style={{ borderColor: 'var(--info-border)', background: 'var(--info-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, color: 'var(--info-fg)', marginBottom: 8 }}>
                <Compass size={15} /> Người mới trong team
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar person={newJoiner} size={36} />
                <div>
                  <Link to={`/manager/team/${newJoiner.id}`} style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' }}>
                    {newJoiner.name}
                  </Link>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Ngày {newJoiner.onboardingDay}/60 · {doneQuests}/{quests.length} quest
                  </div>
                </div>
              </div>
              <div className="progress-track" style={{ marginBottom: 10 }}>
                <div className="progress-fill" style={{ width: `${Math.round((doneQuests / quests.length) * 100)}%`, background: 'var(--info-solid)' }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => schedule1on1(`${newJoiner.name} (mốc 30 ngày)`)}
                >
                  Đặt 1:1 mốc 30 ngày
                </button>
                <Link to={`/manager/team/${newJoiner.id}`} className="btn btn-dim btn-sm">
                  360°
                </Link>
              </div>
            </section>
          )}

          <section className="card-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>
              <Cake size={15} style={{ color: 'var(--brand-primary-fg)' }} /> Khoảnh khắc của team
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card-sunk">
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>🎉 Ngô Minh Khoa — Tròn 2 năm</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Hôm nay 27/11 · Đã tự đăng bài trên Feed</div>
              </div>
              <div className="card-sunk">
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>🎂 Vũ Khánh Linh — Sinh nhật</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Còn 2 ngày nữa (29/11)</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
