import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BellRing,
  Eye,
  Pin,
  PinOff,
  Plus,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeedPost } from '../types';
import { Avatar, Modal } from '../components/UI';

export const AdminPage: React.FC = () => {
  const {
    posts,
    people,
    togglePinPost,
    sendComPush,
    sendComReminder,
    createPost,
  } = useApp();

  const [inspectPost, setInspectPost] = useState<FeedPost | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [mandatoryAck, setMandatoryAck] = useState(true);
  const [ackDeadline, setAckDeadline] = useState('05/12/2026');

  const officialPosts = posts.filter((p) => p.kind === 'official');
  const mandatoryPosts = officialPosts.filter((p) => p.mandatoryAck);

  // Live calculation so confirming in iKamer lens immediately updates COM Admin metrics!
  const policyPost = posts.find((p) => p.id === 'post-policy-cb');
  const extraLiveAcks = policyPost ? Object.keys(policyPost.ackedBy).length - 3 : 0; // baseline had 3 seeded demo acks
  const liveAckedCount = Math.min(184, 162 + Math.max(0, extraLiveAcks));
  const liveUnackedCount = Math.max(0, 184 - liveAckedCount);
  const liveAckPct = Math.round((liveAckedCount / 184) * 100);

  const waerBreakdown = [
    { label: 'Xác nhận thông báo bắt buộc', count: 162 + Math.max(0, extraLiveAcks), pct: liveAckPct, meaningful: true },
    { label: 'Đăng bài / Gửi Kudos trên Feed', count: 96, pct: 52, meaningful: true },
    { label: 'Check-in OKR đúng hạn (iGoal)', count: 118, pct: 64, meaningful: true },
    { label: 'Gửi đề xuất / đơn từ (MCP)', count: 74, pct: 40, meaningful: true },
    { label: 'Chấm công iCheck (chỉ tham chiếu — không tính WAER)', count: 179, pct: 97, meaningful: false },
  ];

  const unconfirmedPeopleForPost = (post: FeedPost) =>
    people.filter((p) => p.lensKey !== 'com_admin' && !post.ackedBy[p.id]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createPost({
      kind: 'official',
      title: title.trim(),
      content: content.trim(),
      audience,
      mandatoryAck,
      ackDeadline,
      pinned: true,
    });
    setTitle('');
    setContent('');
    setShowCompose(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Tổng quan COM</h1>
          <p className="page-desc">Lê Bảo Ngọc · Toàn công ty (184 iKamer)</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowCompose(true)}>
          <Plus size={15} /> Soạn thông báo
        </button>
      </div>

      {/* 4 KPI Cards (PRD §7.12 CM-1) */}
      <section className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>WAER tuần (North Star)</span>
            <span className="badge badge-success">
              <TrendingUp size={11} /> +5%
            </span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            71%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
            Mục tiêu ≥65% · 131/184 iKamer
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>WAU (Tham chiếu OKR)</span>
            <span className="badge badge-neutral">≥80%</span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            78%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
            144/184 iKamer mở app tuần này
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>% Đọc tin chính thức</span>
            <span className="badge badge-success">Đạt KR1</span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            83%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
            Mục tiêu ≥70% trên 3 tin tháng 11
          </div>
        </div>

        <div className="card" style={{ borderColor: liveUnackedCount > 0 ? 'var(--warning-border)' : 'var(--success-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>% Xác nhận bắt buộc</span>
            <span className="badge badge-warning tabular">Còn {liveUnackedCount} người</span>
          </div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-strong)' }}>
            {liveAckPct}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
            Cập nhật tức thì khi iKamer bấm xác nhận
          </div>
        </div>
      </section>

      {/* WAER Breakdown (CM-2) */}
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <BarChart3 size={16} /> Phân rã WAER tuần 48
            </h2>
            <p className="card-subtitle">Hành động có nghĩa trong tuần (chấm công chỉ theo dõi tham chiếu)</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {waerBreakdown.map((row) => (
            <div key={row.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                <span style={{ fontWeight: row.meaningful ? 600 : 500, color: row.meaningful ? 'var(--text-strong)' : 'var(--text-tertiary)' }}>
                  {row.label}
                </span>
                <span className="tabular" style={{ fontWeight: 700, color: row.meaningful ? 'var(--text-strong)' : 'var(--text-tertiary)' }}>
                  {row.pct}% ({row.count}/184)
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${row.pct}%`,
                    background: row.meaningful ? 'var(--brand-primary)' : 'var(--border-strong)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Announcements Table (CM-3) */}
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Bảng điều phối Thông báo chính thức ({officialPosts.length})</h2>
            <p className="card-subtitle">Gửi push, nhắc người chưa xác nhận (trần 3 lần theo quy tắc NT-6) và xem danh sách chi tiết</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', textAlign: 'left', color: 'var(--text-tertiary)', fontSize: 12 }}>
                <th style={{ padding: '12px 16px' }}>Thông báo</th>
                <th style={{ padding: '12px 12px' }}>Reach / Đọc</th>
                <th style={{ padding: '12px 12px' }}>Xác nhận</th>
                <th style={{ padding: '12px 12px' }}>Nhắc lại</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác COM</th>
              </tr>
            </thead>
            <tbody>
              {officialPosts.map((p) => {
                const unackedDemo = unconfirmedPeopleForPost(p).length;
                const readPct = Math.round((p.readCount / p.totalAudienceCount) * 100);
                const ackPct = p.mandatoryAck
                  ? Math.min(100, Math.round(((p.id === 'post-policy-cb' ? liveAckedCount : 140 + Object.keys(p.ackedBy).length) / p.totalAudienceCount) * 100))
                  : null;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '13px 16px', maxWidth: 320 }}>
                      <Link to={`/feed/article/${p.id}`} style={{ fontWeight: 600, color: 'var(--text-strong)', display: 'block' }}>
                        {p.title}
                      </Link>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        {p.mandatoryAck && <span className="badge badge-error" style={{ height: 19, fontSize: 10.5 }}>Bắt buộc · {p.ackDeadline}</span>}
                        {p.pinned && <span className="badge badge-neutral" style={{ height: 19, fontSize: 10.5 }}>Đang ghim</span>}
                      </div>
                    </td>
                    <td style={{ padding: '13px 12px' }} className="tabular">
                      <div><strong>{p.readCount}</strong>/{p.totalAudienceCount}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{readPct}% đã đọc</div>
                    </td>
                    <td style={{ padding: '13px 12px' }} className="tabular">
                      {p.mandatoryAck ? (
                        <>
                          <strong style={{ color: (ackPct || 0) >= 95 ? 'var(--success-fg)' : 'var(--warning-fg)' }}>
                            {ackPct}%
                          </strong>
                          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                            {p.id === 'post-policy-cb' ? `Còn ${liveUnackedCount} người` : `${unackedDemo} persona demo chưa ack`}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>Không bắt buộc</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 12px' }} className="tabular">
                      {p.mandatoryAck ? (
                        <span className={`badge ${p.reminderCount >= 3 ? 'badge-error' : 'badge-neutral'}`}>
                          {p.reminderCount} / 3 lần
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-dim btn-sm"
                          onClick={() => sendComPush(p.id)}
                          title="Gửi push thông báo"
                        >
                          <Send size={13} /> {p.pushSent ? 'Đã push' : 'Gửi push'}
                        </button>
                        {p.mandatoryAck && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={p.reminderCount >= 3}
                              onClick={() => sendComReminder(p.id)}
                            >
                              <BellRing size={13} /> Nhắc ({p.reminderCount}/3)
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setInspectPost(p)}
                            >
                              <Eye size={13} /> Chưa xác nhận
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pin Management (CM-4) */}
      <section className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <h2 className="card-title">
            <Pin size={16} /> Bài ghim trên Feed
          </h2>
        </div>
        <div className="clean-list">
          {officialPosts.map((p) => (
            <div key={p.id} className="clean-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {p.pinned ? `Đang ghim tới ${p.pinExpiresAt || '05/12/2026'}` : 'Chưa ghim'}
                </div>
              </div>
              <button type="button" className="btn btn-dim btn-sm" onClick={() => togglePinPost(p.id)}>
                {p.pinned ? <><PinOff size={13} /> Bỏ ghim</> : <><Pin size={13} /> Ghim</>}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Unconfirmed Users Modal (CM-3) */}
      <Modal
        open={Boolean(inspectPost)}
        onClose={() => setInspectPost(null)}
        title="Danh sách chưa xác nhận (mẫu nhân sự)"
        subtitle={inspectPost?.title}
        footer={
          inspectPost && (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setInspectPost(null)}>
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={inspectPost.reminderCount >= 3}
                onClick={() => {
                  sendComReminder(inspectPost.id);
                  setInspectPost(null);
                }}
              >
                <BellRing size={14} /> Gửi nhắc xác nhận ({inspectPost.reminderCount}/3)
              </button>
            </>
          )
        }
      >
        {inspectPost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unconfirmedPeopleForPost(inspectPost).length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 10px' }}>
                Tất cả nhân sự mẫu đều đã xác nhận bài viết này!
              </div>
            ) : (
              unconfirmedPeopleForPost(inspectPost).map((p) => (
                <div key={p.id} className="card-sunk" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar person={p} size={32} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.title} · {p.team}</div>
                    </div>
                  </div>
                  <span className="badge badge-warning">Chưa xác nhận</span>
                </div>
              ))
            )}
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} /> Lưu ý: Quy tắc NT-6 giới hạn tối đa 3 lần nhắc cách nhau 24h.
            </div>
          </div>
        )}
      </Modal>

      {/* Create Official Announcement Modal */}
      <Modal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        title="Soạn thông báo chính thức (COM)"
        subtitle="Phát hành trực tiếp tới iKame Feed và kích hoạt engine notify()"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCompose(false)}>
              Huỷ
            </button>
            <button type="submit" form="admin-com-form" className="btn btn-primary">
              Xuất bản ngay
            </button>
          </>
        }
      >
        <form id="admin-com-form" onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label">Tiêu đề</label>
            <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Thông báo lịch nghỉ Tết Dương lịch 2027" />
          </div>
          <div>
            <label className="field-label">Nội dung thông báo</label>
            <textarea className="textarea" required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung chính thức..." />
          </div>
          <div className="grid-2">
            <div>
              <label className="field-label">Đối tượng nhận</label>
              <select className="select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="all">Toàn công ty (184)</option>
                <option value="Product Design">Product Design</option>
                <option value="Product Engineering">Product Engineering</option>
              </select>
            </div>
            <div>
              <label className="field-label">Hạn xác nhận</label>
              <input className="input" value={ackDeadline} onChange={(e) => setAckDeadline(e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={mandatoryAck} onChange={(e) => setMandatoryAck(e.target.checked)} />
            Yêu cầu xác nhận đã đọc (bắt buộc)
          </label>
        </form>
      </Modal>
    </div>
  );
};
