import { ArrowLeft, ArrowSquareOut, MagnifyingGlass } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { RBadge } from '../components/RBadge';
import { Button, EmptyState, SourceLine, StatusPill } from '../components/UI';
import { isEligible } from '../lib/audience';
import type { KnowledgeDoc } from '../types';

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function KnowledgePage() {
  const { knowledgeDocs, user } = useAppState();
  const [query, setQuery] = useState('');

  // Eligibility filter runs BEFORE text match — the Finance-scoped doc never
  // reaches the search index for An/Mai (demo-fidelity permission pattern).
  const eligible = useMemo(
    () => knowledgeDocs.filter((doc) => isEligible(user, doc.audienceTeamIds)),
    [knowledgeDocs, user],
  );
  const normalizedQuery = normalize(query.trim());
  const filtered = useMemo(
    () => eligible.filter((doc) => !normalizedQuery || normalize(`${doc.title} ${doc.summary} ${doc.topic}`).includes(normalizedQuery)),
    [eligible, normalizedQuery],
  );

  return (
    <div className="page collection-page">
      <header className="page-heading">
        <div>
          <h1>Tri thức <RBadge tag="R2" /></h1>
          <p>Tìm kiếm, xem trước và đọc nhanh tài liệu từ iWiki ngay trong My iKame, đúng theo quyền truy cập của bạn. Việc soạn, sửa và duyệt tài liệu vẫn tiếp tục thực hiện trên iWiki.</p>
        </div>
      </header>

      <div className="collection-toolbar">
        <label className="filter-input">
          <MagnifyingGlass size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm tài liệu tri thức" placeholder="Tìm theo tên, chủ đề, nội dung..." />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <EmptyState
            title={eligible.length === 0 ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}
            body={eligible.length === 0 ? 'Tài liệu phù hợp với quyền truy cập của bạn sẽ xuất hiện ở đây.' : 'Thử từ khóa khác hoặc kiểm tra lại chính tả.'}
          />
          {eligible.length > 0 && <Button onClick={() => setQuery('')}>Xóa tìm kiếm</Button>}
        </div>
      ) : (
        <div className="collection-grid">
          {filtered.map((doc) => <KnowledgeCard key={doc.id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}

function KnowledgeCard({ doc }: { doc: KnowledgeDoc }) {
  return (
    <article className="content-card knowledge-card">
      <div className="card-body">
        <div className="card-badges"><StatusPill>{doc.topic}</StatusPill></div>
        <h3><Link to={`/knowledge/${doc.id}`}>{doc.title}</Link></h3>
        <p>{doc.summary}</p>
        <SourceLine source={doc.source} time={doc.updatedAt} />
      </div>
    </article>
  );
}

export function KnowledgeDetailPage() {
  const { documentId } = useParams();
  const { knowledgeDocs, user } = useAppState();
  const doc = knowledgeDocs.find((item) => item.id === documentId);

  if (!doc) return <Navigate to="/not-found" replace />;
  if (!isEligible(user, doc.audienceTeamIds)) return <Navigate to="/forbidden" replace />;

  return <KnowledgeDetail doc={doc} user={user} />;
}

function KnowledgeDetail({ doc, user }: { doc: KnowledgeDoc; user: { team: string } }) {
  const isScoped = Boolean(doc.audienceTeamIds && doc.audienceTeamIds.length > 0);

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/knowledge"><ArrowLeft size={17} />Quay lại Tri thức</Link>
      <div className="detail-layout">
        <article className="article-card">
          <div className="article-header">
            <div className="card-badges"><StatusPill>{doc.topic}</StatusPill></div>
            <h1>{doc.title}</h1>
            <p className="article-lead">{doc.summary}</p>
            <SourceLine source={doc.source} time={doc.updatedAt} />
          </div>
          <div className="article-body">
            {doc.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>

        <aside className="action-rail">
          <div className="side-info">
            <h2>Nguồn tài liệu</h2>
            <p>{doc.source} · {doc.updatedAt}</p>
            <Button variant="borderless" icon={<ArrowSquareOut size={17} />} title="Demo — sẽ deep-link sang hệ thống nguồn">Mở trong iWiki</Button>
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
