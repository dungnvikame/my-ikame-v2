import { CalendarDots, MagnifyingGlass, Newspaper } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { SectionHeader, StatusPill } from '../components/UI';

export function SearchPage() {
  const { news, events } = useAppState();
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase('vi');

  const results = useMemo(() => ({
    news: normalized ? news.filter((item) => `${item.title} ${item.summary}`.toLocaleLowerCase('vi').includes(normalized)) : [],
    events: normalized ? events.filter((item) => `${item.title} ${item.summary}`.toLocaleLowerCase('vi').includes(normalized)) : [],
  }), [events, news, normalized]);

  const count = results.news.length + results.events.length;

  return (
    <div className="page search-page">
      <header className="page-heading"><div><p className="eyebrow">CẦN TÌM</p><h1>Tìm kiếm</h1><p>Tìm trong nội dung bạn có quyền truy cập.</p></div></header>
      <label className="search-field"><MagnifyingGlass size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thử “iConnect”, “bảo mật” hoặc “workshop”" aria-label="Tìm kiếm toàn cục" /></label>

      {!normalized ? (
        <div className="search-suggestions">
          <SectionHeader title="Gợi ý tìm kiếm" />
          <div><button onClick={() => setQuery('iConnect')}>iConnect</button><button onClick={() => setQuery('bảo mật')}>Chính sách bảo mật</button><button onClick={() => setQuery('workshop')}>Workshop</button></div>
        </div>
      ) : count ? (
        <div className="search-results">
          <p className="result-count">{count} kết quả cho “{query}”</p>
          {results.news.length > 0 && <section><SectionHeader title="Tin tức" meta={`${results.news.length} kết quả`} />{results.news.map((item) => <Link className="search-result" key={item.id} to={`/news/${item.id}`}><span className="result-icon"><Newspaper size={20} /></span><span><span className="card-badges">{item.official && <StatusPill tone="info">Chính thức</StatusPill>}<StatusPill>{item.topic}</StatusPill></span><strong>{item.title}</strong><small>{item.summary}</small></span></Link>)}</section>}
          {results.events.length > 0 && <section><SectionHeader title="Sự kiện" meta={`${results.events.length} kết quả`} />{results.events.map((item) => <Link className="search-result" key={item.id} to={`/events/${item.id}`}><span className="result-icon"><CalendarDots size={20} /></span><span><span className="card-badges"><StatusPill>{item.format}</StatusPill></span><strong>{item.title}</strong><small>{item.dateLabel} · {item.location}</small></span></Link>)}</section>}
        </div>
      ) : (
        <div className="empty-state"><MagnifyingGlass size={44} /><h2>Không tìm thấy kết quả</h2><p>Kiểm tra chính tả hoặc thử một từ khóa rộng hơn.</p></div>
      )}
    </div>
  );
}

