import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Lock,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type NotifTab = 'inbox' | 'digest' | 'settings';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    notifPrefs,
    toggleNotifPref,
    quietHours,
    setQuietHours,
    todayItems,
    lens,
  } = useApp();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as NotifTab) || 'inbox';
  const [tab, setTab] = useState<NotifTab>(initialTab);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();

  const displayed = unreadOnly ? notifications.filter((n) => !n.read) : notifications;

  const visiblePrefs = notifPrefs.filter((p) => {
    if (p.onlyForNewJoiner && lens !== 'ikamer_new') return false;
    if (p.onlyForManager && lens !== 'manager') return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Thông báo</h1>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={markAllNotificationsRead}>
            <CheckCheck size={15} /> Đọc tất cả ({unreadCount})
          </button>
        )}
      </div>

      <div className="tabs-bar">
        <button type="button" className={`tab-btn ${tab === 'inbox' ? 'active' : ''}`} onClick={() => setTab('inbox')}>
          <Bell size={14} /> Hộp thông báo <span className="tab-count">{notifications.length}</span>
        </button>
        <button type="button" className={`tab-btn ${tab === 'digest' ? 'active' : ''}`} onClick={() => setTab('digest')}>
          <Sun size={14} /> Bản tin sáng (08:00) <span className="tab-count">{todayItems.length}</span>
        </button>
        <button type="button" className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          <Settings size={14} /> Cài đặt quy tắc
        </button>
      </div>

      {tab === 'inbox' && (
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Hiển thị {displayed.length} thông báo
            </span>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
              Chỉ xem chưa đọc
            </label>
          </div>

          {displayed.length === 0 ? (
            <div className="empty-state">Không có thông báo nào phù hợp bộ lọc.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayed.map((n) => (
                <div
                  key={n.id}
                  className="card-compact"
                  style={{
                    borderColor: n.priority === 'critical' && !n.read ? 'var(--error-border)' : 'var(--border-primary)',
                    background: !n.read ? (n.priority === 'critical' ? 'var(--error-bg)' : 'var(--bg-subtle)') : 'var(--bg-surface)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className="source-chip">{n.source} · {n.eventType}</span>
                      <span className="badge badge-neutral" style={{ height: 20, fontSize: 11 }}>
                        Kênh: {n.channels.join(', ')}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{n.timeLabel}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{n.body}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!n.read && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => markNotificationRead(n.id)}>
                        Đã đọc
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        markNotificationRead(n.id);
                        navigate(n.actionRoute);
                      }}
                    >
                      {n.actionLabel || 'Mở xử lý'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Morning Digest Preview synced 1:1 with Home & AI (PRD §7.8 NT-5) */}
      {tab === 'digest' && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Bản tin sáng · Thứ 6, 27/11/2026 (08:00)</h2>
              <p className="card-subtitle">
                Gộp chính xác cùng danh sách "Việc hôm nay" ở Trang chủ & Trợ lý AI — không trùng lặp
              </p>
            </div>
            <span className="badge badge-info">Đồng bộ 1 nguồn</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayItems.map((it, i) => (
              <div
                key={it.id}
                className="card-sunk"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span className="tabular" style={{ fontWeight: 700, color: 'var(--text-tertiary)', width: 18 }}>
                    {i + 1}.
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{it.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      {it.source} · {it.subtitle}
                    </div>
                  </div>
                </div>
                {it.actionRoute && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(it.actionRoute!)}>
                    {it.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notification Settings (PRD §7.8 NT-3, NT-4, NT-7) */}
      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card">
            <h2 className="card-title" style={{ marginBottom: 8 }}>Nhóm thông báo</h2>
            <div className="clean-list">
              {visiblePrefs.map((pref) => (
                <div key={pref.group} className="clean-row">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>
                      {pref.label}
                      {pref.locked && (
                        <span className="badge badge-error" style={{ height: 20, fontSize: 11 }}>
                          <Lock size={11} /> Bắt buộc
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{pref.description}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pref.enabled}
                    disabled={pref.locked}
                    className={`switch ${pref.enabled ? 'on' : ''}`}
                    onClick={() => toggleNotifPref(pref.group)}
                    aria-label={pref.label}
                  >
                    <span className="switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>
                  <Moon size={16} /> Giờ yên lặng (Quiet Hours)
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Tạm hoãn thông báo không khẩn cấp trong khung {quietHours.start} – {quietHours.end} (mặc định 21:00–07:00)
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={quietHours.enabled}
                className={`switch ${quietHours.enabled ? 'on' : ''}`}
                onClick={() => setQuietHours({ ...quietHours, enabled: !quietHours.enabled })}
                aria-label="Bật giờ yên lặng"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
