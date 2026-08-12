import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../AppState';
import { isEligible } from '../lib/audience';
import { DocCarousel } from './knowledge/DocCarousel';
import { KnowledgeDetail } from './knowledge/KnowledgeDetail';
import { LatestDocs, RecentlyViewed, ResultsGrid } from './knowledge/DocList';
import { KnowledgeBanner } from './knowledge/KnowledgeBanner';
import { KnowledgeHero } from './knowledge/KnowledgeHero';

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function KnowledgePage() {
  const { knowledgeDocs, user } = useAppState();
  const [term, setTerm] = useState('');
  const [topic, setTopic] = useState<string | null>(null);

  // Single eligibility filter feeds every section below — the Finance-scoped doc
  // never reaches the carousel/recent/results for An (demo-fidelity permission pattern).
  const docs = useMemo(
    () => knowledgeDocs.filter((doc) => isEligible(user, doc.audienceTeamIds)),
    [knowledgeDocs, user],
  );

  const topics = useMemo(() => Array.from(new Set(docs.map((doc) => doc.topic))), [docs]);
  const normalizedTerm = normalize(term.trim());
  const filtering = normalizedTerm.length >= 2 || topic !== null;

  const results = useMemo(() => {
    if (!filtering) return [];
    return docs.filter((doc) => {
      const matchesTerm = !normalizedTerm || normalize(`${doc.title} ${doc.summary} ${doc.topic}`).includes(normalizedTerm);
      const matchesTopic = !topic || doc.topic === topic;
      return matchesTerm && matchesTopic;
    });
  }, [docs, normalizedTerm, topic, filtering]);

  const recommended = useMemo(() => docs.filter((doc) => doc.recommended), [docs]);
  const recentlyViewed = useMemo(() => docs.filter((doc) => doc.recentlyViewedLabel), [docs]);
  // updatedAt labels aren't reliably parseable across fixtures (YAGNI) — keep fixture
  // order for the "remaining" list rather than sorting VN date strings.
  const latest = useMemo(() => docs.filter((doc) => !doc.recommended && !doc.recentlyViewedLabel), [docs]);

  function toggleTopic(nextTopic: string) {
    setTopic((current) => (current === nextTopic ? null : nextTopic));
  }

  function clearFilters() {
    setTerm('');
    setTopic(null);
  }

  return (
    <div className="page khub-page">
      <KnowledgeHero
        greetingName={user.shortName}
        term={term}
        onTermChange={setTerm}
        topics={topics}
        activeTopic={topic}
        onToggleTopic={toggleTopic}
      />

      {filtering ? (
        <ResultsGrid docs={results} count={results.length} onClear={clearFilters} />
      ) : (
        <>
          <DocCarousel docs={recommended} />
          <KnowledgeBanner />
          <RecentlyViewed docs={recentlyViewed} />
          <LatestDocs docs={latest} />
        </>
      )}
    </div>
  );
}

export function KnowledgeDetailPage() {
  const { documentId } = useParams();
  const { knowledgeDocs, user } = useAppState();
  const doc = knowledgeDocs.find((item) => item.id === documentId);

  if (!doc) return <Navigate to="/not-found" replace />;
  if (!isEligible(user, doc.audienceTeamIds)) return <Navigate to="/forbidden" replace />;

  const relatedDocs = knowledgeDocs
    .filter((item) => isEligible(user, item.audienceTeamIds) && item.topic === doc.topic && item.id !== doc.id)
    .slice(0, 2);

  return <KnowledgeDetail doc={doc} user={user} relatedDocs={relatedDocs} />;
}
