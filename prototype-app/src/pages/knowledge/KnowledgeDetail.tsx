import { ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PlatformHandoffButton } from '../../components/PlatformHandoff';
import { SourceLine, StatusPill } from '../../components/UI';
import type { KnowledgeDoc, User } from '../../types';

type KnowledgeDetailProps = { doc: KnowledgeDoc; user: User; relatedDocs: KnowledgeDoc[] };

export function KnowledgeDetail({ doc, user, relatedDocs }: KnowledgeDetailProps) {
  const isScoped = Boolean(doc.audienceTeamIds && doc.audienceTeamIds.length > 0);

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/knowledge"><ArrowLeft size={17} />Quay lại Tri thức</Link>
      <div className="detail-layout">
        <article className="article-card">
          <div className="article-header khub-hero-band">
            <span className="khub-hero-band-emoji" aria-hidden="true">{doc.emoji ?? '📄'}</span>
            <div className="card-badges"><StatusPill>{doc.topic}</StatusPill></div>
            <h1>{doc.title}</h1>
            <p className="article-lead">{doc.summary}</p>
            <div className="khub-hero-band-meta">
              {doc.authorName && <span>{doc.authorName}</span>}
              <SourceLine source={doc.source} time={doc.updatedAt} />
              {doc.readingTime && <span>{doc.readingTime}</span>}
            </div>
          </div>

          <div className="article-body khub-article-body">
            {doc.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          {relatedDocs.length > 0 && (
            <div className="khub-related">
              <h2>Tài liệu liên quan</h2>
              <div className="khub-related-list">
                {relatedDocs.map((related) => (
                  <Link key={related.id} to={`/knowledge/${related.id}`} className="khub-related-item">
                    <span aria-hidden="true">{related.emoji ?? '📄'}</span>
                    <span>{related.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="action-rail">
          <div className="side-info">
            <h2>Nguồn tài liệu</h2>
            <p>{doc.source} · {doc.updatedAt}</p>
            <p className="muted-text">Đọc và tra cứu ngay tại đây — biên tập nội dung thuộc về platform gốc.</p>
            <PlatformHandoffButton platform="iWiki" action="biên tập bài viết này" label="Biên tập trên iWiki" />
          </div>
          <div className="side-info">
            <h2>Vì sao tôi thấy tài liệu này?</h2>
            <p>{isScoped ? `Tài liệu được phân phối riêng cho team ${user.team}.` : 'Tài liệu này áp dụng cho toàn bộ iKamer.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
