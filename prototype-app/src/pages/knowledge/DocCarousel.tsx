import { Link } from 'react-router-dom';
import { SectionHeader, StatusPill } from '../../components/UI';
import type { KnowledgeDoc } from '../../types';

export function DocCarousel({ docs }: { docs: KnowledgeDoc[] }) {
  if (docs.length === 0) return null;

  return (
    <section className="khub-section">
      <SectionHeader title="Dành cho bạn" meta="Gợi ý tài liệu nên đọc trong tuần này" />
      <div className="khub-carousel">
        {docs.map((doc) => (
          <Link key={doc.id} to={`/knowledge/${doc.id}`} className="khub-carousel-card">
            <span className="khub-carousel-tile" aria-hidden="true">{doc.emoji ?? '📄'}</span>
            <div className="card-badges"><StatusPill>{doc.topic}</StatusPill></div>
            <h3>{doc.title}</h3>
            <div className="khub-carousel-meta">
              {doc.authorShort && <span className="khub-avatar" aria-hidden="true">{doc.authorShort.slice(0, 2)}</span>}
              {doc.authorName && <span>{doc.authorName}</span>}
              {doc.readingTime && <span>· {doc.readingTime}</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
