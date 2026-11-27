import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Maximize2,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppIconGlyph, Drawer, Modal, RichInlineText } from './UI';
import { ActionProposalCard } from './ActionProposalCard';

export const NotificationDrawer: React.FC = () => {
  const { notifDrawerOpen, setNotifDrawerOpen, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useApp();
  const navigate = useNavigate();

  return (
    <Drawer
      open={notifDrawerOpen}
      onClose={() => setNotifDrawerOpen(false)}
      title="Thông báo"
      subtitle={unreadCount > 0 ? `${unreadCount} chưa đọc · Hạ tầng notify()` : 'Bạn đã đọc hết thông báo'}
      headerActions={
        <>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={markAllNotificationsRead}
              title="Đánh dấu đọc tất cả"
            >
              <CheckCheck size={15} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setNotifDrawerOpen(false);
              navigate('/notifications?tab=settings');
            }}
            title="Cài đặt thông báo"
          >
            <Settings size={15} />
          </button>
        </>
      }
    >
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Bell size={20} />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>Chưa có thông báo mới</div>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                markNotificationRead(n.id);
                setNotifDrawerOpen(false);
                navigate(n.actionRoute);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 'var(--r-10)',
                border: `1px solid ${n.priority === 'critical' && !n.read ? 'var(--error-border)' : 'var(--border-primary)'}`,
                background: !n.read
                  ? n.priority === 'critical'
                    ? 'var(--error-bg)'
                    : 'var(--bg-subtle)'
                  : 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span className="source-chip">{n.source} · {n.eventType}</span>
                <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {n.timeLabel}
                  {!n.read && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 'var(--r-full)',
                        background: n.priority === 'critical' ? 'var(--error-solid)' : 'var(--brand-primary)',
                      }}
                    />
                  )}
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{n.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{n.body}</div>
            </button>
          ))
        )}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--border-primary)' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={() => {
            setNotifDrawerOpen(false);
            navigate('/notifications');
          }}
        >
          Mở trung tâm thông báo & Bản tin sáng
        </button>
      </div>
    </Drawer>
  );
};

export const QuickAskDrawer: React.FC = () => {
  const { quickAskOpen, setQuickAskOpen, aiMessages, sendAiMessage, approveAiProposal, cancelAiProposal, lens } =
    useApp();
  const [draft, setDraft] = useState('');
  const navigate = useNavigate();

  const suggestions =
    lens === 'manager'
      ? ['Hôm nay tôi cần làm gì?', 'Tình hình team tuần này', 'Đơn chờ duyệt', 'Soạn tin nhắc check-in']
      : ['Hôm nay tôi cần làm gì?', 'Xin nghỉ phép ngày thứ 6', 'Chính sách nghỉ phép thế nào?', 'Số dư phép năm của tôi'];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendAiMessage(draft);
    setDraft('');
  };

  return (
    <Drawer
      open={quickAskOpen}
      onClose={() => setQuickAskOpen(false)}
      title="Hỏi iKame (Trợ lý AI)"
      subtitle="MCP Client · Đề xuất → Duyệt → Thực thi → Biên nhận"
      headerActions={
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          title="Mở toàn màn hình"
          onClick={() => {
            setQuickAskOpen(false);
            navigate('/assistant');
          }}
        >
          <Maximize2 size={15} />
        </button>
      }
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {aiMessages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'stretch',
              maxWidth: m.role === 'user' ? '85%' : '100%',
              background: m.role === 'user' ? 'var(--bg-inverse)' : 'var(--bg-subtle)',
              color: m.role === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
              padding: '10px 13px',
              borderRadius: 'var(--r-12)',
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            <RichInlineText text={m.text} />

            {m.todayItems && m.todayItems.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {m.todayItems.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--r-8)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{it.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{it.source} · {it.urgencyLabel}</div>
                    </div>
                    {it.actionRoute && (
                      <button
                        type="button"
                        className="btn btn-dim btn-sm"
                        onClick={() => {
                          setQuickAskOpen(false);
                          navigate(it.actionRoute!);
                        }}
                      >
                        Mở
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {m.actionProposal && (
              <ActionProposalCard
                proposal={m.actionProposal}
                onApprove={(fields) => approveAiProposal(m.id, fields)}
                onCancel={() => cancelAiProposal(m.id)}
              />
            )}

            {m.sources && m.sources.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {m.sources.map((src) => (
                  <span key={src} className="source-chip">
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="btn btn-dim btn-sm"
              style={{ fontSize: 11.5, height: 26 }}
              onClick={() => sendAiMessage(s)}
            >
              <Sparkles size={11} /> {s}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Hỏi chính sách, xem việc hôm nay, tạo đơn iCheck..."
          />
          <button type="submit" className="btn btn-primary" aria-label="Gửi tin nhắn">
            <Send size={15} />
          </button>
        </form>
      </div>
    </Drawer>
  );
};

export const SsoHandoffModal: React.FC = () => {
  const { handoffApp, closeHandoff, currentPerson, appLaunchCount, pushToast } = useApp();
  if (!handoffApp) return null;

  const count = appLaunchCount[handoffApp.id] || 1;

  return (
    <Modal
      open={Boolean(handoffApp)}
      onClose={closeHandoff}
      title={`Chuyển tiếp SSO sang ${handoffApp.name}`}
      subtitle="My iKame là cửa vào — nghiệp vụ chuyên sâu mở trực tiếp trên hệ thống gốc"
      maxWidth={460}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={closeHandoff}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              pushToast({
                title: `Đã mở ${handoffApp.name} qua SSO (${currentPerson.email})`,
                description: `Event app_launch đã ghi nhận (lần mở #${count}).`,
                tone: 'success',
              });
              closeHandoff();
            }}
          >
            Tiếp tục sang {handoffApp.name} <ExternalLink size={14} />
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--r-12)',
            background: handoffApp.accentBg,
            color: handoffApp.accentFg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AppIconGlyph iconKey={handoffApp.iconKey} size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-strong)' }}>{handoffApp.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{handoffApp.shortDesc}</div>
        </div>
      </div>

      <div className="card-sunk" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Phiên SSO iKame</span>
          <span style={{ fontWeight: 600, color: 'var(--success-fg)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} /> Hợp lệ · {currentPerson.email}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Đích chuyển tiếp</span>
          <code style={{ fontSize: 12 }}>{handoffApp.ssoUrl}</code>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Đo lường KR3 (app_launch)</span>
          <span className="tabular" style={{ fontWeight: 600 }}>Lượt mở #{count}</span>
        </div>
      </div>
    </Modal>
  );
};
