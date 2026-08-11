import { ArrowLeft, CheckCircle, MagnifyingGlass, SealCheck, ShareNetwork, WarningCircle } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { NewsCard } from '../components/ContentCards';
import { Button, SectionHeader, SourceLine, StatusPill } from '../components/UI';

type Filter = 'all' | 'official' | 'mandatory';

export function NewsPage() {
  const { news } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => news.filter((post) => {
    if (filter === 'official' && !post.official) return false;
    if (filter === 'mandatory' && !post.mandatory) return false;
    return `${post.title} ${post.summary}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'));
  }), [filter, news, query]);

  const highlighted = filtered.find((post) => post.highlighted) ?? filtered[0];
  const rest = filtered.filter((post) => post.id !== highlighted?.id);

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div><p className="eyebrow">CẦN BIẾT</p><h1>Tin tức</h1><p>Thông tin chính thức và nội dung phù hợp với bạn.</p></div>
      </header>
      <div className="collection-toolbar">
        <div className="neutral-tabs" role="tablist" aria-label="Lọc tin tức">
          <button role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Dành cho tôi</button>
          <button role="tab" aria-selected={filter === 'official'} className={filter === 'official' ? 'is-active' : ''} onClick={() => setFilter('official')}>Chính thức</button>
          <button role="tab" aria-selected={filter === 'mandatory'} className={filter === 'mandatory' ? 'is-active' : ''} onClick={() => setFilter('mandatory')}>Bắt buộc</button>
        </div>
        <label className="filter-input"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm trong tin tức" placeholder="Tìm trong tin tức" /></label>
      </div>

      {highlighted ? (
        <>
          <section className="news-feature" aria-label="Tin nổi bật">
            <div className="news-feature-visual" aria-hidden="true"><span>MY iKAME</span><strong>INSIDE</strong><small>Official updates for everyone</small></div>
            <div className="news-feature-copy">
              <div className="card-badges">{highlighted.official && <StatusPill tone="info"><SealCheck size={14} />Chính thức</StatusPill>}<StatusPill>{highlighted.topic}</StatusPill></div>
              <h2>{highlighted.title}</h2>
              <p>{highlighted.summary}</p>
              <SourceLine source={highlighted.publisher} time={highlighted.publishedAt} />
              <Link className="button button--primary" to={`/news/${highlighted.id}`}>Đọc bài viết</Link>
            </div>
          </section>
          <section className="section-block">
            <SectionHeader title="Mới nhất dành cho bạn" meta={`${filtered.length} nội dung phù hợp`} />
            <div className="collection-grid">{rest.map((post) => <NewsCard key={post.id} post={post} />)}</div>
          </section>
        </>
      ) : (
        <div className="empty-state"><MagnifyingGlass size={44} /><h2>Không tìm thấy nội dung</h2><p>Thử từ khóa khác hoặc xóa bộ lọc hiện tại.</p><Button onClick={() => { setQuery(''); setFilter('all'); }}>Xóa bộ lọc</Button></div>
      )}
    </div>
  );
}

export function ArticlePage() {
  const { postId } = useParams();
  const { news, acknowledgeNews } = useAppState();
  const post = news.find((item) => item.id === postId);
  const [receipt, setReceipt] = useState(false);

  if (!post) return <Navigate to="/not-found" replace />;

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
              <StatusPill>{post.topic}</StatusPill>
            </div>
            <h1>{post.title}</h1>
            <p className="article-lead">{post.summary}</p>
            <SourceLine source={post.publisher} time={`${post.publishedAt} · ${post.readingTime}`} />
          </div>
          <div className="article-visual" aria-hidden="true"><span>OFFICIAL UPDATE</span><strong>iKame<br />Security</strong></div>
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
        </article>

        <aside className="action-rail">
          {post.mandatory ? (
            <div className={`ack-panel ${post.acknowledged ? 'is-complete' : ''}`}>
              {post.acknowledged ? <CheckCircle size={28} weight="duotone" /> : <WarningCircle size={28} weight="duotone" />}
              <h2>{post.acknowledged ? 'Đã xác nhận' : 'Xác nhận bắt buộc'}</h2>
              <p>{post.acknowledged ? 'Trạng thái của bạn đã được ghi nhận.' : `Hãy đọc kỹ và xác nhận trước ${post.dueLabel?.replace('Hạn ', '')}.`}</p>
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
