import { ArrowLeft, ChatCircleText, CheckCircle, MagnifyingGlass, PaperPlaneTilt, SealCheck, ShareNetwork, WarningCircle } from '@phosphor-icons/react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { NewsCard, newsTopicVisual } from '../components/ContentCards';
import { Tabs } from '../components/Tabs';
import { Button, EmptyState, SectionHeader, SourceLine, StatusPill } from '../components/UI';
import { isEligible } from '../lib/audience';
import { rankCards } from '../lib/ranking';
import type { NewsPost, PriorityBand } from '../types';

type Filter = 'all' | 'official' | 'mandatory';

function toRankable(post: NewsPost) {
  const priorityBand: PriorityBand = post.mandatory ? 'P0' : post.official ? 'P4' : 'P5';
  return { ...post, priorityBand, updatedAt: post.publishedAt };
}

export function NewsPage() {
  const { news, user } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const visible = useMemo(
    () => news.filter((post) => isEligible(user, post.audienceTeamIds) && !post.expired),
    [news, user],
  );
  const allTopics = useMemo(() => Array.from(new Set(visible.map((post) => post.topic))), [visible]);

  const toggleTopic = (topic: string) => setTopics((prev) => {
    const next = new Set(prev);
    if (next.has(topic)) next.delete(topic); else next.add(topic);
    return next;
  });
  const resetFilters = () => { setFilter('all'); setTopics(new Set()); setQuery(''); };

  const filtered = useMemo(() => visible.filter((post) => {
    if (filter === 'official' && !post.official) return false;
    if (filter === 'mandatory' && !post.mandatory) return false;
    if (topics.size > 0 && !topics.has(post.topic)) return false;
    return `${post.title} ${post.summary}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'));
  }), [filter, topics, visible, query]);

  const ranked = useMemo(() => rankCards(filtered.map(toRankable)), [filtered]);
  const highlighted = ranked.find((post) => post.highlighted) ?? ranked[0];
  const rest = ranked.filter((post) => post.id !== highlighted?.id);

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div><p className="eyebrow">CẦN BIẾT</p><h1>Tin tức</h1><p>Thông tin chính thức và nội dung phù hợp với bạn.</p></div>
      </header>
      <div className="collection-toolbar">
        <Tabs
          tabs={[
            { key: 'all' as Filter, label: 'Dành cho tôi' },
            { key: 'official' as Filter, label: 'Chính thức' },
            { key: 'mandatory' as Filter, label: 'Bắt buộc' },
          ]}
          active={filter}
          onChange={setFilter}
          ariaLabel="Lọc tin tức"
        />
        <label className="filter-input"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm trong tin tức" placeholder="Tìm trong tin tức" /></label>
      </div>
      {allTopics.length > 1 && (
        <div className="topic-chips" role="group" aria-label="Lọc theo chủ đề">
          <button type="button" aria-pressed={topics.size === 0} className={`topic-chip ${topics.size === 0 ? 'is-active' : ''}`} onClick={() => setTopics(new Set())}>Tất cả chủ đề</button>
          {allTopics.map((topic) => (
            <button key={topic} type="button" aria-pressed={topics.has(topic)} className={`topic-chip ${topics.has(topic) ? 'is-active' : ''}`} onClick={() => toggleTopic(topic)}>
              {newsTopicVisual(topic).emoji} {topic}
            </button>
          ))}
        </div>
      )}

      {highlighted ? (
        <>
          <section className="news-feature" aria-label="Tin nổi bật">
            <div className={`news-feature-visual events-v2-cover events-v2-cover--${newsTopicVisual(highlighted.topic).palette}`} aria-hidden="true">
              <span className="news-feature-emoji">{newsTopicVisual(highlighted.topic).emoji}</span>
              <span className="news-feature-kicker">TIN NỔI BẬT</span>
              <strong>{highlighted.topic}</strong>
            </div>
            <div className="news-feature-copy">
              <div className="card-badges">{highlighted.official && <StatusPill tone="info"><SealCheck size={14} />Chính thức</StatusPill>}<StatusPill>{highlighted.topic}</StatusPill></div>
              <h2>{highlighted.title}</h2>
              <p>{highlighted.summary}</p>
              <SourceLine source={highlighted.publisher} time={highlighted.publishedAt} />
              <Link className="button button--primary" to={`/news/${highlighted.id}`}>Đọc bài viết</Link>
            </div>
          </section>
          <section className="section-block">
            <SectionHeader title="Mới nhất dành cho bạn" meta={`${ranked.length} nội dung phù hợp`} />
            <div className="collection-grid">{rest.map((post) => <NewsCard key={post.id} post={post} />)}</div>
          </section>
        </>
      ) : (
        <div className="empty-state">
          <EmptyState
            title={visible.length === 0 ? 'Chưa có tin tức nào' : 'Không tìm thấy nội dung'}
            body={visible.length === 0 ? 'Nội dung sẽ xuất hiện khi có bản tin mới dành cho bạn.' : 'Thử từ khóa khác hoặc xóa bộ lọc hiện tại.'}
          />
          {visible.length > 0 && <Button onClick={resetFilters}>Xóa bộ lọc</Button>}
        </div>
      )}
    </div>
  );
}

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
      <Link className="back-link" to="/news"><ArrowLeft size={17} />Quay lại Tin tức</Link>
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
