import { Link } from 'react-router-dom';
import { EmptyState, StatusPill } from '../../components/UI';
import type { KnowledgeDoc } from '../../types';

export function RecentlyViewed({ docs }: { docs: KnowledgeDoc[] }) {
  if (docs.length === 0) return null;

  return (
    <section className="khub-section">
      <div className="section-header"><div><h2>Đã xem gần đây</h2></div></div>
      <div className="khub-recent-grid">
        {docs.map((doc) => (
          <Link key={doc.id} to={`/knowledge/${doc.id}`} className="khub-recent-card">
            <span className="khub-recent-emoji" aria-hidden="true">{doc.emoji ?? '📄'}</span>
            <div>
              <h3>{doc.title}</h3>
              <p>{doc.recentlyViewedLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LatestDocs({ docs }: { docs: KnowledgeDoc[] }) {
  if (docs.length === 0) return null;

  return (
    <section className="khub-section">
      <div className="section-header"><div><h2>Mới gần đây</h2></div></div>
      <div className="khub-row-list">
        {docs.map((doc) => (
          <Link key={doc.id} to={`/knowledge/${doc.id}`} className="khub-doc-row">
            <div className="card-badges"><StatusPill>{doc.topic}</StatusPill></div>
            <h3>{doc.title}</h3>
            <span className="khub-doc-row-meta">{doc.readingTime ?? doc.updatedAt}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

type ResultsGridProps = { docs: KnowledgeDoc[]; count: number; onClear: () => void };

export function ResultsGrid({ docs, count, onClear }: ResultsGridProps) {
  return (
    <section className="khub-section">
      <div className="section-header">
        <div>
          <h2>Kết quả</h2>
          <p>{count} tài liệu phù hợp</p>
        </div>
        <button type="button" className="text-link" onClick={onClear}>Xoá bộ lọc</button>
      </div>

      {docs.length === 0 ? (
        <EmptyState title="Không tìm thấy tài liệu" body="Thử từ khóa khác hoặc chọn chủ đề khác." />
      ) : (
        <div className="collection-grid">
          {docs.map((doc) => (
            <article key={doc.id} className="content-card knowledge-card">
              <div className="card-body">
                <div className="card-badges"><StatusPill>{doc.topic}</StatusPill></div>
                <h3><Link to={`/knowledge/${doc.id}`}>{doc.title}</Link></h3>
                <p>{doc.summary}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
