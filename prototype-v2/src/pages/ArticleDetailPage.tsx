import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Eye,
  Info,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/UI';

export const ArticleDetailPage: React.FC = () => {
  const { id } = useParams();
  const { posts, people, currentPerson, lens, acknowledgePost, toggleSavePost, addComment } = useApp();
  const [comment, setComment] = useState('');

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="card empty-state">
        <h1 style={{ margin: '0 0 8px', fontSize: 18 }}>Không tìm thấy bài viết</h1>
        <Link to="/feed" className="btn btn-secondary">
          Quay lại iKame Feed
        </Link>
      </div>
    );
  }

  // Enforce audience boundary (R-L4)
  if (post.audience !== 'all' && post.audience !== currentPerson.team && lens !== 'com_admin') {
    return (
      <div className="card empty-state">
        <h1 style={{ margin: '0 0 8px', fontSize: 18 }}>403 · Nội dung ngoài phạm vi đối tượng</h1>
        <p style={{ margin: '0 0 14px' }}>Bài viết này chỉ hiển thị cho thành viên thuộc team {post.audience}.</p>
        <Link to="/feed" className="btn btn-secondary">
          Quay lại iKame Feed
        </Link>
      </div>
    );
  }

  const isAcked = Boolean(post.ackedBy[currentPerson.id]);
  const isSaved = post.savedBy.includes(currentPerson.id);
  const ackedTotal = Object.keys(post.ackedBy).length + (post.id === 'post-policy-cb' ? 159 : 138);
  const ackPct = Math.min(100, Math.round((ackedTotal / post.totalAudienceCount) * 100));

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/feed" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> Quay lại iKame Feed
        </Link>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleSavePost(post.id)}>
          <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'Đã lưu' : 'Lưu bài viết'}
        </button>
      </div>

      <article className="card" style={{ padding: '26px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="badge badge-strong">COM Chính thức</span>
          {post.mandatoryAck && (
            <span className={`badge ${isAcked ? 'badge-success' : post.ackOverdue ? 'badge-error' : 'badge-warning'}`}>
              {isAcked ? 'Bạn đã xác nhận' : post.ackOverdue ? 'Bắt buộc · Quá hạn' : `Bắt buộc · Hạn ${post.ackDeadline}`}
            </span>
          )}
          {post.tags.map((t) => (
            <span key={t} className="badge badge-neutral">
              {t}
            </span>
          ))}
        </div>

        <h1 style={{ margin: '0 0 14px', fontSize: 24, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 18, borderBottom: '1px solid var(--border-primary)', marginBottom: 20 }}>
          <Avatar person={people.find((p) => p.id === post.authorId)} size={36} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-strong)' }}>{post.authorName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {post.authorTitle} · Đăng {post.timeLabel}
            </div>
          </div>
        </div>

        {/* Điều bạn cần biết (PRD §7.3 FD-4) */}
        {post.keyTakeaways && post.keyTakeaways.length > 0 && (
          <div className="card-sunk" style={{ marginBottom: 20, padding: '14px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 8 }}>
              Điều bạn cần biết
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65 }}>
              {post.keyTakeaways.map((k, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {k}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Long-form prose (body_m per Core DS) */}
        <div className="prose-body" style={{ whiteSpace: 'pre-line', marginBottom: 22 }}>
          {post.content}
        </div>

        {/* Hành động cần hoàn tất — OR Distribution Metrics for COM Admin (PRD §7.3 acceptance criteria!) */}
        {post.mandatoryAck && (
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 'var(--r-12)',
              border: `1px solid ${lens === 'com_admin' ? 'var(--info-border)' : isAcked ? 'var(--success-border)' : 'var(--brand-primary-border)'}`,
              background: lens === 'com_admin' ? 'var(--info-bg)' : isAcked ? 'var(--success-bg)' : 'var(--brand-primary-subtle)',
              marginBottom: 18,
            }}
          >
            {lens === 'com_admin' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: 'var(--info-fg)', marginBottom: 8 }}>
                  <BarChart3 size={16} /> Số liệu phân phối (COM Admin không xác nhận hộ)
                </div>
                <div className="grid-3" style={{ gap: 10 }}>
                  <div className="card-compact">
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Phạm vi gửi</div>
                    <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>
                      {post.totalAudienceCount} iKamer
                    </div>
                  </div>
                  <div className="card-compact">
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Đã đọc</div>
                    <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>
                      {post.readCount} ({Math.round((post.readCount / post.totalAudienceCount) * 100)}%)
                    </div>
                  </div>
                  <div className="card-compact">
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Đã xác nhận</div>
                    <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: 'var(--success-fg)' }}>
                      {ackPct}%
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Link to="/admin" className="btn btn-secondary btn-sm">
                    Mở Tổng quan COM để nhắc người chưa xác nhận
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14.5, color: isAcked ? 'var(--success-fg)' : 'var(--text-strong)' }}>
                    {isAcked ? <CheckCircle2 size={17} /> : <ShieldCheck size={17} style={{ color: 'var(--brand-primary-fg)' }} />}
                    {isAcked ? 'Đã hoàn tất xác nhận thông báo' : 'Hành động cần hoàn tất'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                    {isAcked
                      ? `Hệ thống đã ghi nhận trạng thái xác nhận của ${currentPerson.name} lúc ${post.ackedBy[currentPerson.id]}.`
                      : post.actionRequiredText || 'Xác nhận bạn đã đọc và nắm rõ nội dung chính sách này.'}
                  </div>
                </div>
                {!isAcked && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => acknowledgePost(post.id)}
                  >
                    Xác nhận đã đọc
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vì sao bạn thấy bài này (FD-4) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} /> <strong>Vì sao bạn thấy bài này:</strong> {post.whyYouSeeThis || 'Bài viết công khai trên iKame Feed.'}
          </span>
          <span className="tabular" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-tertiary)' }}>
            <Eye size={14} /> {post.readCount} lượt đọc
          </span>
        </div>
      </article>

      {/* Comments Section */}
      <section className="card">
        <h2 className="card-title" style={{ marginBottom: 14 }}>
          <MessageCircle size={16} /> Bình luận ({post.comments.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {post.comments.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Chưa có bình luận nào.</div>
          ) : (
            post.comments.map((c) => (
              <div key={c.id} className="card-sunk">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>
                    {c.authorName} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>· {c.authorTitle}</span>
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.createdAt}</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{c.content}</div>
              </div>
            ))
          )}
        </div>
        <form
          style={{ display: 'flex', gap: 8 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim()) return;
            addComment(post.id, comment);
            setComment('');
          }}
        >
          <input
            className="input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Đặt câu hỏi hoặc chia sẻ góp ý về thông báo này..."
          />
          <button type="submit" className="btn btn-secondary">
            Gửi bình luận
          </button>
        </form>
      </section>
    </div>
  );
};
