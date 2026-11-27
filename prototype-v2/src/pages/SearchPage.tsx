import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  FileText,
  Search,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KNOWLEDGE_DOCS } from '../data/mockData';
import { Avatar } from '../components/UI';

type SearchTab = 'all' | 'news' | 'events' | 'knowledge' | 'goals' | 'people';

export const SearchPage: React.FC = () => {
  const { posts, events, objectives, people, currentPerson, lens, recentSearches, addRecentSearch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState<SearchTab>((searchParams.get('tab') as SearchTab) || 'all');

  const q = query.trim().normalize('NFC').toLowerCase();

  const matchedNews = useMemo(
    () =>
      posts.filter(
        (p) =>
          (p.audience === 'all' || p.audience === currentPerson.team || lens === 'com_admin') &&
          (!q || ((p.title || '') + ' ' + p.content + ' ' + p.tags.join(' ')).toLowerCase().includes(q))
      ),
    [posts, currentPerson.team, lens, q]
  );

  const matchedEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          (e.audience === 'all' || e.audience === currentPerson.team || lens === 'com_admin') &&
          (!q || (e.title + ' ' + e.tagline + ' ' + e.location).toLowerCase().includes(q))
      ),
    [events, currentPerson.team, lens, q]
  );

  const matchedKnowledge = useMemo(
    () =>
      KNOWLEDGE_DOCS.filter(
        (d) => !q || (d.title + ' ' + d.summary + ' ' + d.category).toLowerCase().includes(q)
      ),
    [q]
  );

  const matchedGoals = useMemo(
    () =>
      objectives.filter(
        (o) => (lens === 'manager' || o.ownerId === currentPerson.id) && (!q || o.title.toLowerCase().includes(q))
      ),
    [objectives, lens, currentPerson.id, q]
  );

  const matchedPeople = useMemo(
    () =>
      people.filter((p) => !q || (p.name + ' ' + p.title + ' ' + p.team + ' ' + p.email).toLowerCase().includes(q)),
    [people, q]
  );

  const totalCount =
    matchedNews.length + matchedEvents.length + matchedKnowledge.length + matchedGoals.length + matchedPeople.length;

  // Seeded AI answer with citation (SR-4)
  const aiAnswer = useMemo(() => {
    if (!q) return null;
    if (q.includes('bảo hiểm') || q.includes('phúc lợi')) {
      return {
        text: 'Chính sách Bảo hiểm iKame Care 2027 nâng hạn mức ngoại trú lên 18 triệu đồng/năm, bổ sung 6 phiên EAP miễn phí và hỗ trợ 50% cho 1 người thân. Hạn đăng ký người thân trên iHRM là 04/12/2026.',
        sources: ['COM · Bảo hiểm iKame Care 2027', 'P&OD'],
      };
    }
    if (q.includes('nghỉ phép') || q.includes('wfh')) {
      return {
        text: 'Nhân sự chính thức có 12–16 ngày phép năm và tối đa 2 ngày WFH/tuần (mô hình Hybrid). Bạn có thể tạo đơn trực tiếp qua Trợ lý AI (MCP iCheck) chỉ trong 15 giây.',
        sources: ['iWiki · Chính sách Nghỉ phép & WFH', 'iCheck'],
      };
    }
    return null;
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query.trim());
      setSearchParams({ q: query.trim(), tab });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 className="page-title">Tìm kiếm toàn iKame</h1>
        <p className="page-desc">
          Kết quả luôn lọc theo quyền truy cập & đối tượng team của {currentPerson.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="input"
            style={{ paddingLeft: 38, height: 42 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khoá (VD: Bảo hiểm, WFH, Year-End, Phạm Gia Huy)..."
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>
          Tìm kiếm
        </button>
      </form>

      {!q && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Gần đây:</span>
          {recentSearches.map((r) => (
            <button key={r} type="button" className="btn btn-dim btn-sm" onClick={() => setQuery(r)}>
              {r}
            </button>
          ))}
        </div>
      )}

      {/* AI Answer Box with Citations (SR-4) */}
      {aiAnswer && (
        <section className="card" style={{ borderColor: 'var(--brand-primary-border)', background: 'var(--brand-primary-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--brand-primary-fg)', marginBottom: 6 }}>
            <Sparkles size={15} /> Tóm tắt AI có trích nguồn
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--text-strong)', lineHeight: 1.55 }}>
            {aiAnswer.text}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {aiAnswer.sources.map((s) => (
              <span key={s} className="source-chip">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs (SR-1) */}
      <div className="tabs-bar">
        {(
          [
            { id: 'all', label: 'Tất cả', count: totalCount },
            { id: 'news', label: 'Tin tức', count: matchedNews.length },
            { id: 'events', label: 'Sự kiện', count: matchedEvents.length },
            { id: 'knowledge', label: 'Tri thức', count: matchedKnowledge.length },
            { id: 'goals', label: 'Mục tiêu', count: matchedGoals.length },
            { id: 'people', label: 'Con người', count: matchedPeople.length },
          ] as { id: SearchTab; label: string; count: number }[]
        ).map((t) => (
          <button key={t.id} type="button" className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {totalCount === 0 ? (
        <div className="card empty-state">
          <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
            Không có kết quả nào khớp "{query}"
          </div>
          <div style={{ fontSize: 13 }}>Thử từ khoá khác hoặc mở Trợ lý AI để hỏi trực tiếp.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {(tab === 'all' || tab === 'news') && matchedNews.length > 0 && (
            <section className="card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>
                <FileText size={16} /> Tin tức & iKame Feed ({matchedNews.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matchedNews.map((p) => (
                  <Link key={p.id} to={p.kind === 'official' ? `/feed/article/${p.id}` : '/feed'} className="card-sunk" style={{ display: 'block' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{p.title || p.content.slice(0, 80)}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {p.authorName} · {p.timeLabel}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'events') && matchedEvents.length > 0 && (
            <section className="card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>
                <Calendar size={16} /> Sự kiện ({matchedEvents.length})
              </h2>
              <div className="grid-2" style={{ gap: 10 }}>
                {matchedEvents.map((e) => (
                  <Link key={e.id} to={`/events/${e.id}`} className="card-sunk" style={{ display: 'block' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{e.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {e.dateLabel} · {e.location}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'knowledge') && matchedKnowledge.length > 0 && (
            <section className="card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>
                <BookOpen size={16} /> Tri thức iWiki ({matchedKnowledge.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matchedKnowledge.map((d) => (
                  <div key={d.id} className="card-sunk">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <strong style={{ color: 'var(--text-strong)' }}>{d.title}</strong>
                      <span className="source-chip">iWiki · {d.category}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.summary}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'goals') && matchedGoals.length > 0 && (
            <section className="card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>
                <Target size={16} /> Mục tiêu iGoal ({matchedGoals.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matchedGoals.map((o) => (
                  <div key={o.id} className="card-sunk" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{o.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.ownerName} · {o.team}</div>
                    </div>
                    <span className="badge badge-neutral tabular">{o.progress}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'people') && matchedPeople.length > 0 && (
            <section className="card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>
                <User size={16} /> Danh bạ Con người ({matchedPeople.length})
              </h2>
              <div className="grid-2" style={{ gap: 10 }}>
                {matchedPeople.map((p) => {
                  const canOpen360 = lens === 'manager' && p.managerId === 'u-mai';
                  return (
                    <div key={p.id} className="card-sunk" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <Avatar person={p} size={36} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {p.title} · {p.team}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                            {p.email} · {p.slack}
                          </div>
                        </div>
                      </div>
                      {canOpen360 ? (
                        <Link to={`/manager/team/${p.id}`} className="btn btn-secondary btn-sm">
                          Hồ sơ 360°
                        </Link>
                      ) : p.id === currentPerson.id ? (
                        <Link to="/profile" className="btn btn-dim btn-sm">
                          Hồ sơ tôi
                        </Link>
                      ) : (
                        <Link to={`/feed?compose=kudos&to=${p.id}`} className="btn btn-dim btn-sm">
                          Gửi Kudos
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
