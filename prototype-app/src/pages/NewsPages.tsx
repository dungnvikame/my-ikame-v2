import { ArrowLeft, ChatCircleText, CheckCircle, PaperPlaneTilt, SealCheck, ShareNetwork, WarningCircle } from '@phosphor-icons/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { newsTopicVisual } from '../components/ContentCards';
import { Button, SourceLine, StatusPill } from '../components/UI';
import { isEligible } from '../lib/audience';
import type { NewsPost } from '../types';

// MVP: danh sách Tin tức đã gộp vào iKame Feed (/feed) — file này chỉ còn trang đọc bài viết.

export function ArticlePage() {
  const { postId } = useParams();
  const { news, user } = useAppState();
  const post = news.find((item) => item.id === postId);

  if (!post) return <Navigate to="/not-found" replace />;
  if (!isEligible(user, post.audienceTeamIds)) return <Navigate to="/forbidden" replace />;

  return <ArticleDetail post={post} />;
}

/** Bình luận trên bài Tin tức — cùng contract Comment với iKame Feed. */
function ArticleComments({ post }: { post: NewsPost }) {
  const { user, addNewsComment } = useAppState();
  const [text, setText] = useState('');
  const comments = post.comments ?? [];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addNewsComment(post.id, trimmed);
    setText('');
  }

  return (
    <section className="article-comments" aria-label="Bình luận">
      <h2><ChatCircleText size={18} />Bình luận ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="muted-text">Chưa có bình luận nào — hãy là người đầu tiên chia sẻ ý kiến.</p>
      ) : (
        <ul className="article-comment-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <span className="avatar" aria-hidden="true">{comment.authorShort.slice(0, 1)}</span>
              <div className="article-comment-body">
                <p className="article-comment-meta"><strong>{comment.authorName}</strong>{comment.role && <span> · {comment.role}</span>}<span> · {comment.time}</span></p>
                <p>{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form className="article-comment-form" onSubmit={handleSubmit}>
        <span className="avatar" aria-hidden="true">{user.shortName.slice(0, 1)}</span>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Viết bình luận..."
          aria-label="Viết bình luận"
        />
        <button type="submit" className="assistant-send" aria-label="Gửi bình luận" disabled={!text.trim()}>
          <PaperPlaneTilt size={16} weight="fill" />
        </button>
      </form>
    </section>
  );
}

function ArticleDetail({ post }: { post: NewsPost }) {
  const { acknowledgeNews, markNewsRead } = useAppState();
  const [receipt, setReceipt] = useState(false);

  useEffect(() => {
    if (!post.read) markNewsRead(post.id);
  }, [post.id, post.read, markNewsRead]);

  const acknowledge = () => {
    acknowledgeNews(post.id);
    setReceipt(true);
  };

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/feed"><ArrowLeft size={17} />Quay lại iKame Feed</Link>
      <div className="detail-layout">
        <article className="article-card">
          <div className="article-header">
            <div className="card-badges">
              {post.official && <StatusPill tone="info"><SealCheck size={14} />Chính thức</StatusPill>}
              {post.mandatory && <StatusPill tone={post.acknowledged ? 'success' : 'error'}>{post.acknowledged ? 'Đã xác nhận' : 'Cần xác nhận'}</StatusPill>}
              {post.mandatory && post.read && !post.acknowledged && <StatusPill tone="info">Đã đọc</StatusPill>}
              <StatusPill>{post.topic}</StatusPill>
            </div>
            <h1>{post.title}</h1>
            <p className="article-lead">{post.summary}</p>
            <SourceLine source={post.publisher} time={`${post.publishedAt} · ${post.readingTime}`} />
          </div>
          <div className={`article-visual events-v2-cover events-v2-cover--${newsTopicVisual(post.topic).palette}`} aria-hidden="true">
            <span className="news-feature-emoji">{newsTopicVisual(post.topic).emoji}</span>
            <span>{post.official ? 'OFFICIAL UPDATE' : 'iKAME NEWS'}</span>
            <strong>{post.topic}</strong>
          </div>
          <div className="article-body">
            <h2>Điều bạn cần biết</h2>
            {post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <h2>Hành động cần hoàn tất</h2>
            <ul>
              <li>Kiểm tra các thiết bị đang đăng nhập bằng tài khoản iKame.</li>
              <li>Không chia sẻ mã xác thực hoặc thông tin đăng nhập.</li>
              <li>Chọn “Xác nhận đã đọc” sau khi hoàn tất.</li>
            </ul>
          </div>
          <ArticleComments post={post} />
        </article>

        <aside className="action-rail">
          {post.mandatory ? (
            <div className={`ack-panel ${post.acknowledged ? 'is-complete' : ''}`} role="status">
              {post.acknowledged ? <CheckCircle size={28} weight="duotone" /> : <WarningCircle size={28} weight="duotone" />}
              <h2>{post.acknowledged ? 'Đã xác nhận' : 'Xác nhận bắt buộc'}</h2>
              <p>{post.acknowledged ? 'Trạng thái của bạn đã được ghi nhận.' : (post.mandatoryReason ?? `Hãy đọc kỹ và xác nhận trước ${post.dueLabel?.replace('Hạn ', '')}.`)}</p>
              {!post.acknowledged && <Button variant="primary" onClick={acknowledge}>Xác nhận đã đọc</Button>}
              {receipt && <span className="receipt" role="status"><CheckCircle size={16} />Đã lưu lúc này</span>}
            </div>
          ) : (
            <div className="side-info"><h2>Vì sao bạn thấy bài này?</h2><p>Nội dung được phân phối cho team Product & Technology.</p></div>
          )}
          <Button variant="borderless" icon={<ShareNetwork size={17} />}>Sao chép liên kết</Button>
        </aside>
      </div>
    </div>
  );
}
