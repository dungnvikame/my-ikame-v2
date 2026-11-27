import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { rankFeedPostsForUser } from '../lib/ranking';
import { ICheckWidget } from '../components/ICheckWidget';
import { QuickActionsBar } from '../components/QuickActionsBar';

export const HomePage: React.FC = () => {
  const {
    currentPerson,
    posts,
    events,
    todayItems,
    quests,
    performCheckIn,
    openAiWithPrompt,
    lens,
  } = useApp();
  const [aiQuery, setAiQuery] = useState('');
  const navigate = useNavigate();

  const pendingMandatory = posts
    .filter(
      (p) =>
        p.mandatoryAck &&
        (p.audience === 'all' || p.audience === currentPerson.team) &&
        !p.ackedBy[currentPerson.id]
    )
    .sort((a, b) => Number(Boolean(b.ackOverdue)) - Number(Boolean(a.ackOverdue)));

  const topMandatory = pendingMandatory[0];
  const urgentCount = todayItems.filter((i) => i.priorityGroup <= 1).length;
  const upcomingEvents = events
    .filter(
      (e) =>
        (e.audience === 'all' || e.audience === currentPerson.team) &&
        (e.status === 'upcoming' || e.status === 'ongoing')
    )
    .slice(0, 2);

  const recommendedFeed = rankFeedPostsForUser(posts, currentPerson).slice(0, 4);
  const completedQuests = quests.filter((q) => q.completed).length;
  const nextQuest = quests.find((q) => !q.completed);
  const firstName = currentPerson.name.split(' ').slice(-1)[0];

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    openAiWithPrompt(aiQuery);
    setAiQuery('');
  };

  const handleItemAction = (item: (typeof todayItems)[number]) => {
    if (item.actionKind === 'checkin') {
      performCheckIn();
    } else if (item.actionKind === 'open_ai' && item.aiPrompt) {
      openAiWithPrompt(item.aiPrompt);
    } else if (item.actionRoute) {
      navigate(item.actionRoute);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Clean, Airy Greeting + Inline AI Search */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 26 }}>
              Chào buổi sáng, {firstName}
            </h1>
            <p className="page-desc" style={{ marginTop: 4 }}>
              Thứ 6, 27/11 ·{' '}
              <strong style={{ color: urgentCount > 0 ? 'var(--error-fg)' : 'var(--text-strong)' }}>
                {urgentCount} việc khẩn
              </strong>{' '}
              · {upcomingEvents.length} sự kiện sắp diễn ra
            </p>
          </div>
          {lens === 'ikamer_new' && (
            <Link to="/onboarding" className="badge badge-info" style={{ height: 26 }}>
              <Compass size={13} /> Ngày {currentPerson.onboardingDay}/60 · {completedQuests}/{quests.length}
            </Link>
          )}
        </div>

        <form onSubmit={handleAsk} style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Sparkles
              size={15}
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--brand-primary-fg)',
              }}
            />
            <input
              className="input"
              style={{ paddingLeft: 38, height: 42, borderRadius: 'var(--r-10)' }}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder='Hỏi Trợ lý AI — VD: "Hôm nay tôi cần làm gì?", "Xin nghỉ phép thứ 6"...'
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ height: 42, padding: '0 16px', borderRadius: 'var(--r-10)' }}>
            <Send size={14} /> Hỏi AI
          </button>
        </form>
      </section>

      {/* Customizable Quick Actions Section (User Requested!) */}
      <QuickActionsBar />

      {/* Urgent Mandatory Banner (only when needed — sole orange Primary CTA) */}
      {topMandatory && (
        <section className={`banner ${topMandatory.ackOverdue ? 'banner-urgent' : 'banner-warning'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <AlertTriangle
              size={18}
              style={{
                color: topMandatory.ackOverdue ? 'var(--error-fg)' : 'var(--warning-fg)',
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topMandatory.title}
              </div>
              <div style={{ fontSize: 12.5, color: topMandatory.ackOverdue ? 'var(--error-fg)' : 'var(--warning-fg)' }}>
                {topMandatory.ackOverdue ? 'Quá hạn xác nhận' : `Hạn ${topMandatory.ackDeadline}`} · COM
              </div>
            </div>
          </div>
          <Link to={`/feed/article/${topMandatory.id}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            Đọc & xác nhận
          </Link>
        </section>
      )}

      {/* Compact New Joiner Bar */}
      {lens === 'ikamer_new' && (
        <section className="card-compact" style={{ borderColor: 'var(--info-border)', background: 'var(--info-bg)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 6 }}>
              <Compass size={15} style={{ color: 'var(--info-fg)' }} />
              Hành trình 60 ngày · {completedQuests}/{quests.length} nhiệm vụ
            </div>
            <div className="progress-track" style={{ maxWidth: 360 }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.round((completedQuests / quests.length) * 100)}%`, background: 'var(--info-solid)' }}
              />
            </div>
            {nextQuest && (
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 6 }}>
                Tiếp theo: {nextQuest.title}
              </div>
            )}
          </div>
          <Link to="/onboarding" className="btn btn-secondary btn-sm">
            Mở hành trình <ArrowRight size={13} />
          </Link>
        </section>
      )}

      {/* Main Content + Calm Right Rail */}
      <div className="layout-with-rail" style={{ gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Việc hôm nay — Clean Divider Rows (no box-in-box noise!) */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title">
                Việc hôm nay <span className="tab-count">{todayItems.length}</span>
              </h2>
              <Link to="/notifications?tab=digest" className="btn btn-ghost btn-sm">
                Bản tin sáng
              </Link>
            </div>

            {todayItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 12px' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--success-fg)', marginBottom: 6 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Xong hết việc hôm nay!</div>
              </div>
            ) : (
              <div className="clean-list">
                {todayItems.map((item) => (
                  <div key={item.id} className="clean-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, flex: 1 }}>
                      <span
                        className={
                          item.urgencyTone === 'error'
                            ? 'dot-urgent'
                            : item.urgencyTone === 'warning'
                              ? 'dot-warning'
                              : item.urgencyTone === 'info'
                                ? 'dot-info'
                                : 'dot-neutral'
                        }
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>
                          {item.source} · {item.urgencyLabel}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${!topMandatory && item.priorityGroup <= 1 ? 'btn-primary' : 'btn-dim'}`}
                      onClick={() => handleItemAction(item)}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tin dành cho bạn — Clean 2-col minimal list */}
          <section className="card">
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title">Tin mới nổi bật</h2>
              <Link to="/icom/feed" className="btn btn-ghost btn-sm">
                iCom Feed <ArrowRight size={13} />
              </Link>
            </div>

            <div className="clean-list">
              {recommendedFeed.map((post) => {
                const isUnacked = post.mandatoryAck && !post.ackedBy[currentPerson.id];
                return (
                  <Link
                    key={post.id}
                    to={post.kind === 'official' ? `/feed/article/${post.id}` : '/feed'}
                    className="clean-row clean-row-interactive"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.title ||
                          (post.kind === 'kudos'
                            ? `${post.authorName} gửi Kudos cho ${post.kudosRecipientName}`
                            : post.content.slice(0, 72))}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {post.authorName} · {post.timeLabel}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        isUnacked
                          ? 'badge-error'
                          : post.kind === 'official'
                            ? 'badge-neutral'
                            : post.kind === 'kudos'
                              ? 'badge-violet'
                              : 'badge-neutral'
                      }`}
                    >
                      {isUnacked ? 'Cần xác nhận' : post.kind === 'official' ? 'COM' : post.kind === 'kudos' ? 'Kudos' : 'Feed'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* Calm Right Rail */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ICheckWidget compact />

          <section className="card">
            <div className="card-header" style={{ marginBottom: 8 }}>
              <h2 className="card-title" style={{ fontSize: 14 }}>
                <Calendar size={15} /> Sự kiện sắp tới
              </h2>
              <Link to="/icom/events" className="btn btn-ghost btn-sm">
                Tất cả
              </Link>
            </div>
            <div className="clean-list">
              {upcomingEvents.map((ev) => {
                const isReg = ev.registeredIds.includes(currentPerson.id);
                return (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="clean-row clean-row-interactive" style={{ alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.35 }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {ev.dateLabel} · {ev.format}
                      </div>
                    </div>
                    {isReg && <span className="badge badge-success">Đã ĐK</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
