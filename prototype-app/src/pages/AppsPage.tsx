import { ArrowRight, MagnifyingGlass } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlatformHandoffButton } from '../components/PlatformHandoff';
import { EmptyState, SectionHeader } from '../components/UI';
import { useAppState } from '../AppState';
import { APP_CATEGORIES, filterApps, visibleApps, type AppCategory, type InternalApp } from '../data/apps-data';

function AppCard({ app }: { app: InternalApp }) {
  return (
    <article className="app-card">
      <div className="app-card-head">
        <span className="app-card-icon" aria-hidden="true">{app.emoji}</span>
        <div>
          <h3>{app.name}</h3>
          <p className="app-card-tagline">{app.tagline}</p>
        </div>
      </div>
      <p className="app-card-description">{app.description}</p>
      <div className="app-card-footer">
        <span className="app-card-category">{app.category}</span>
        {app.kind === 'external' ? (
          <PlatformHandoffButton platform={app.platform} action={app.action} variant="link" />
        ) : (
          <Link className="text-link" to={app.href}>Mở trong My iKame<ArrowRight size={15} /></Link>
        )}
      </div>
    </article>
  );
}

/** Danh bạ ứng dụng nội bộ (MVP): một cửa vào mọi công cụ của iKame. */
export function AppsPage() {
  const { user } = useAppState();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AppCategory | 'all'>('all');

  // Chỉ app user có quyền (role HRIS) — app không có quyền không hiện cả tên (spec D8).
  const allowed = useMemo(() => visibleApps(user), [user]);
  const filtered = useMemo(() => filterApps(allowed, query, category), [allowed, query, category]);
  const resetFilters = () => { setQuery(''); setCategory('all'); };

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">MỘT CỬA VÀO</p>
          <h1>Ứng dụng</h1>
          <p>Toàn bộ công cụ nội bộ của iKame — tìm nhanh, mở đúng nơi làm việc với SSO chung.</p>
        </div>
      </header>

      <div className="collection-toolbar">
        <div className="topic-chips" role="group" aria-label="Lọc theo nhóm ứng dụng">
          <button type="button" aria-pressed={category === 'all'} className={`topic-chip ${category === 'all' ? 'is-active' : ''}`} onClick={() => setCategory('all')}>Tất cả</button>
          {APP_CATEGORIES.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} className={`topic-chip ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <label className="filter-input"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm ứng dụng" placeholder="Tìm ứng dụng" /></label>
      </div>

      {filtered.length > 0 ? (
        <section>
          <SectionHeader title="Ứng dụng của bạn" meta={`${filtered.length} ứng dụng · theo vai trò ${user.role}`} />
          <div className="app-grid">
            {filtered.map((app) => <AppCard key={app.id} app={app} />)}
          </div>
          <p className="app-access-note">
            Thiếu công cụ bạn cần cho công việc? <Link className="text-link" to={`/assistant?q=${encodeURIComponent('Tạo request IT support: xin cấp quyền truy cập công cụ nội bộ')}`}>Gửi yêu cầu cấp quyền qua iRequest<ArrowRight size={14} /></Link>
          </p>
        </section>
      ) : (
        <div className="empty-state">
          <EmptyState title="Không tìm thấy ứng dụng" body="Thử từ khóa khác hoặc xóa bộ lọc hiện tại." />
          <button type="button" className="text-link" onClick={resetFilters}>Xóa bộ lọc</button>
        </div>
      )}
    </div>
  );
}
