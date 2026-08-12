import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../AppState';
import { findSeedAnswer } from '../../data/search-answers';
import { AiBadge } from '../AiBadge';
import { IconButton } from '../UI';
import { useSearchResults } from './use-search-results';

/** Matches the topbar search trigger's aria-label — mirrors AskIKamePanel's focus-return pattern. */
const SEARCH_TRIGGER_SELECTOR = 'button[aria-label^="Tìm kiếm"]';
const SUGGESTED_QUERIES = ['nghỉ phép', 'OKR', 'iConnect', 'phúc lợi', 'bảo mật', 'check-in'];

/**
 * ⌘K palette — Phase 1 owned + frozen. Reads AI answers through `findSeedAnswer()`
 * (empty until Phase 6) so this component never changes downstream (D4 no-dead-end).
 */
export function SearchPalette() {
  const { searchOpen, setSearchOpen } = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const { groups, flat, count } = useSearchResults(query);
  const answer = findSeedAnswer(query);

  useEffect(() => {
    if (!searchOpen) return;
    setQuery('');
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  function close() {
    setSearchOpen(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(SEARCH_TRIGGER_SELECTOR)?.focus());
  }

  function go(href: string) {
    close();
    navigate(href);
  }

  function submitQuery() {
    if (!trimmed) return;
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (flat.length ? (index + 1) % flat.length : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (flat.length ? (index - 1 + flat.length) % flat.length : 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = flat[activeIndex];
      if (selected) go(selected.href);
      else submitQuery();
    }
  }

  if (!searchOpen) return null;

  const activeId = flat[activeIndex] ? `search-result-${flat[activeIndex].id}` : undefined;

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={close}>
      <div
        className="search-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <label className="search-palette-field">
          <MagnifyingGlass size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tin tức, sự kiện, tài liệu, mục tiêu, con người…"
            aria-label="Tìm kiếm toàn cục"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
          />
          <IconButton label="Đóng tìm kiếm" onClick={close}><X size={18} /></IconButton>
        </label>

        <div className="search-palette-body">
          {trimmed.length < 2 ? (
            <div className="search-palette-suggestions">
              <p className="nav-label">GỢI Ý TÌM KIẾM</p>
              <div>
                {SUGGESTED_QUERIES.map((item) => (
                  <button key={item} type="button" onClick={() => setQuery(item)}>{item}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {answer ? (
                <div className="search-palette-answer">
                  <AiBadge level={answer.level} />
                  {answer.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  <div className="search-palette-citations">
                    {answer.citations.map((citation) => (
                      <button key={citation.href} type="button" onClick={() => go(citation.href)}>{citation.title}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="search-palette-note">Trả lời AI tổng hợp sẽ mở rộng thêm chủ đề — hiện hiển thị kết quả tìm kiếm.</p>
              )}

              {count === 0 ? (
                <p className="result-count">Không tìm thấy kết quả cho “{trimmed}”.</p>
              ) : groups.map((group) => group.items.length > 0 && (
                <section key={group.key} className="search-palette-group">
                  <p className="nav-label">{group.label.toUpperCase()}</p>
                  {group.items.map((item) => {
                    const flatIndex = flat.findIndex((flatItem) => flatItem.id === item.id);
                    return (
                      <button
                        key={item.id}
                        id={`search-result-${item.id}`}
                        type="button"
                        className={`search-palette-result ${flatIndex === activeIndex ? 'is-active' : ''}`}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        onClick={() => go(item.href)}
                      >
                        <strong>{item.title}</strong>
                        {item.meta && <small>{item.meta}</small>}
                      </button>
                    );
                  })}
                </section>
              ))}

              <button type="button" className="search-palette-viewall" onClick={submitQuery}>
                Xem tất cả kết quả cho “{trimmed}” <kbd>↵</kbd>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
