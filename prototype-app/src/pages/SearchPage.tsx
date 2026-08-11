import { CalendarDots, MagnifyingGlass, Newspaper } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { isEligible } from '../lib/audience';
import { SectionHeader, StatusPill } from '../components/UI';
import type { EventItem, NewsPost } from '../types';

type TypeFilter = 'all' | 'news' | 'events';

const SUGGESTIONS = ['iConnect', 'bảo mật', 'workshop'];

function normalize(text: string) {
  return text.toLocaleLowerCase('vi');
}

function matchesNews(item: NewsPost, term: string) {
  return normalize(`${item.title} ${item.summary} ${item.topic}`).includes(term);
}

function matchesEvent(item: EventItem, term: string) {
  return normalize(`${item.title} ${item.summary} ${item.location} ${item.organizer}`).includes(term);
}

/** Wraps the first case-insensitive match of `term` in <mark>. Never re-cases or drops title text. */
function highlight(text: string, term: string): ReactNode {
  if (!term) return text;
  const idx = normalize(text).indexOf(normalize(term));
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}

export function SearchPage() {
  const { user, news, events } = useAppState();
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [recent, setRecent] = useState<string[]>([]);

  const trimmedQuery = query.trim();

  useEffect(() => {
    const timer = setTimeout(() => setApplied(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (applied.length < 2) return;
    setRecent((prev) => [applied, ...prev.filter((entry) => entry !== applied)].slice(0, 5));
  }, [applied]);

  const term = applied.length >= 2 ? normalize(applied) : '';
  const pending = trimmedQuery.length >= 2 && trimmedQuery !== applied;

  const results = useMemo(() => ({
    news: term ? news.filter((item) => isEligible(user, item.audienceTeamIds)).filter((item) => matchesNews(item, term)) : [],
    events: term ? events.filter((item) => isEligible(user, item.audienceTeamIds)).filter((item) => matchesEvent(item, term)) : [],
  }), [events, news, term, user]);

  const showNews = typeFilter !== 'events';
  const showEvents = typeFilter !== 'news';
  const count = (showNews ? results.news.length : 0) + (showEvents ? results.events.length : 0);

  return (
    <div className="page search-page">
      <header className="page-heading"><div><p className="eyebrow">CẦN TÌM</p><h1>Tìm kiếm</h1><p>Tìm trong nội dung bạn có quyền truy cập.</p></div></header>
      <label className="search-field"><MagnifyingGlass size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thử “iConnect”, “bảo mật” hoặc “workshop”" aria-label="Tìm kiếm toàn cục" /></label>

      <div className="neutral-tabs" role="group" aria-label="Loại kết quả">
        <button className={typeFilter === 'all' ? 'is-active' : ''} onClick={() => setTypeFilter('all')}>Tất cả</button>
        <button className={typeFilter === 'news' ? 'is-active' : ''} onClick={() => setTypeFilter('news')}>Tin tức</button>
        <button className={typeFilter === 'events' ? 'is-active' : ''} onClick={() => setTypeFilter('events')}>Sự kiện</button>
      </div>

      {trimmedQuery.length < 2 ? (
        <div className="search-suggestions">
          <SectionHeader title="Gợi ý tìm kiếm" />
          <div>{SUGGESTIONS.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
          {recent.length > 0 && (
            <>
              <SectionHeader title="Tìm gần đây" />
              <div>{recent.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
            </>
          )}
        </div>
      ) : pending ? (
        <p className="result-count">Đang tìm “{query}”…</p>
      ) : count ? (
        <div className="search-results">
          <p className="result-count">{count} kết quả cho “{applied}”</p>
          {showNews && results.news.length > 0 && (
            <section>
              <SectionHeader title="Tin tức" meta={`${results.news.length} kết quả`} />
              {results.news.map((item) => (
                <Link className="search-result" key={item.id} to={`/news/${item.id}`}>
                  <span className="result-icon"><Newspaper size={20} /></span>
                  <span>
                    <span className="card-badges">{item.official && <StatusPill tone="info">Chính thức</StatusPill>}<StatusPill>{item.topic}</StatusPill></span>
                    <strong>{highlight(item.title, applied)}</strong>
                    <small>{item.summary}</small>
                  </span>
                </Link>
              ))}
            </section>
          )}
          {showEvents && results.events.length > 0 && (
            <section>
              <SectionHeader title="Sự kiện" meta={`${results.events.length} kết quả`} />
              {results.events.map((item) => (
                <Link className="search-result" key={item.id} to={`/events/${item.id}`}>
                  <span className="result-icon"><CalendarDots size={20} /></span>
                  <span>
                    <span className="card-badges"><StatusPill>{item.format}</StatusPill></span>
                    <strong>{highlight(item.title, applied)}</strong>
                    <small>{item.dateLabel} · {item.location}</small>
                  </span>
                </Link>
              ))}
            </section>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <MagnifyingGlass size={44} />
          <h2>Không tìm thấy kết quả</h2>
          <p>Kiểm tra chính tả hoặc thử một từ khóa rộng hơn.</p>
          <div className="search-suggestions"><div>{SUGGESTIONS.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div></div>
        </div>
      )}
    </div>
  );
}
