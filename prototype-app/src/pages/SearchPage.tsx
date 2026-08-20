import { BookBookmark, CalendarDots, MagnifyingGlass, Newspaper, Target, UserCircle } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { AiBadge } from '../components/AiBadge';
import { useSearchResults, type SearchResultGroupKey } from '../components/search/use-search-results';
import { Tabs } from '../components/Tabs';
import { SectionHeader } from '../components/UI';
import { findSeedAnswer } from '../data/search-answers';

type TypeFilter = 'all' | SearchResultGroupKey;

const SUGGESTIONS = ['iConnect', 'bảo mật', 'workshop'];
const RECENT_STORAGE_KEY = 'my-ikame-recent-searches';

const GROUP_ICON: Record<SearchResultGroupKey, typeof Newspaper> = {
  news: Newspaper,
  events: CalendarDots,
  docs: BookBookmark,
  goals: Target,
  people: UserCircle,
};

function normalize(text: string) {
  return text.toLocaleLowerCase('vi');
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

function loadRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 5) : [];
  } catch { return []; }
}

/**
 * Trang tìm kiếm toàn cục — CÙNG nguồn dữ liệu với palette ⌘K (useSearchResults):
 * tin tức, sự kiện, tri thức, mục tiêu, con người. "Tìm gần đây" bền qua
 * localStorage, xóa khi resetDemo.
 */
export function SearchPage() {
  const { demoResetCount } = useAppState();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  // Palette Enter navigates here with `?q=` already answered — seed `applied` too so
  // results render immediately instead of waiting out the 250ms debounce.
  const [applied, setApplied] = useState(initialQuery.trim());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [recent, setRecent] = useState<string[]>(loadRecent);

  const trimmedQuery = query.trim();

  useEffect(() => {
    const timer = setTimeout(() => setApplied(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (applied.length < 2) return;
    setRecent((prev) => {
      const next = [applied, ...prev.filter((entry) => entry !== applied)].slice(0, 5);
      try { localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, [applied]);

  // resetDemo xóa lịch sử tìm kiếm (guard ref-style qua demoResetCount > 0 check đơn giản).
  useEffect(() => {
    if (demoResetCount === 0) return;
    setRecent([]);
    try { localStorage.removeItem(RECENT_STORAGE_KEY); } catch { /* ignore */ }
  }, [demoResetCount]);

  const pending = trimmedQuery.length >= 2 && trimmedQuery !== applied;
  const results = useSearchResults(applied.length >= 2 ? applied : '');
  const answer = applied.length >= 2 ? findSeedAnswer(applied) : undefined;

  const visibleGroups = useMemo(
    () => results.groups.filter((group) => group.items.length > 0 && (typeFilter === 'all' || group.key === typeFilter)),
    [results.groups, typeFilter],
  );
  const count = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="page search-page">
      <header className="page-heading"><div><p className="eyebrow">CẦN TÌM</p><h1>Tìm kiếm</h1><p>Tìm trong nội dung bạn có quyền truy cập — tin tức, sự kiện, tri thức, mục tiêu và con người.</p></div></header>
      <label className="search-field"><MagnifyingGlass size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thử “iConnect”, “bảo mật” hoặc “workshop”" aria-label="Tìm kiếm toàn cục" /></label>

      <Tabs
        tabs={[
          { key: 'all' as TypeFilter, label: 'Tất cả' },
          { key: 'news' as TypeFilter, label: 'Tin tức' },
          { key: 'events' as TypeFilter, label: 'Sự kiện' },
          { key: 'docs' as TypeFilter, label: 'Tri thức' },
          { key: 'goals' as TypeFilter, label: 'Mục tiêu' },
          { key: 'people' as TypeFilter, label: 'Con người' },
        ]}
        active={typeFilter}
        onChange={setTypeFilter}
        ariaLabel="Loại kết quả"
      />

      {applied.length >= 2 && !pending && (
        answer ? (
          <div className="search-palette-answer search-page-answer">
            <AiBadge level={answer.level} />
            {answer.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            <div className="search-palette-citations">
              {answer.citations.map((citation) => (
                <Link key={citation.href} to={citation.href}>{citation.title}</Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="search-palette-note">Trả lời AI tổng hợp sẽ mở rộng thêm chủ đề — hiện hiển thị kết quả tìm kiếm.</p>
        )
      )}

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
          {visibleGroups.map((group) => {
            const Icon = GROUP_ICON[group.key];
            return (
              <section key={group.key}>
                <SectionHeader title={group.label} meta={`${group.items.length} kết quả`} />
                {group.items.map((item) => (
                  <Link className="search-result" key={item.id} to={item.href}>
                    <span className="result-icon"><Icon size={20} /></span>
                    <span>
                      <strong>{highlight(item.title, applied)}</strong>
                      {item.meta && <small>{item.meta}</small>}
                    </span>
                  </Link>
                ))}
              </section>
            );
          })}
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
