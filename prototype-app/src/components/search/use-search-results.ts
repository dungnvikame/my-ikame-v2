import { useMemo } from 'react';
import { useAppState } from '../../AppState';
import { teamMembers, users } from '../../data/mockData';
import { isEligible } from '../../lib/audience';

export type SearchResultItem = { id: string; title: string; meta?: string; href: string };
export type SearchResultGroupKey = 'news' | 'events' | 'docs' | 'goals' | 'people';
export type SearchResultGroup = { key: SearchResultGroupKey; label: string; items: SearchResultItem[] };
export type SearchResults = { groups: SearchResultGroup[]; flat: SearchResultItem[]; count: number };

function normalize(text: string) {
  return text.toLocaleLowerCase('vi');
}

function matches(term: string, ...fields: (string | undefined)[]) {
  return normalize(fields.filter(Boolean).join(' ')).includes(term);
}

/**
 * Grouped instant results for the ⌘K palette + `/search` page (Phase 1, frozen).
 * Permission filtering reuses `isEligible` — demo-fidelity only (see `lib/audience.ts`).
 */
export function useSearchResults(query: string): SearchResults {
  const { user, news, events, knowledgeDocs, goals } = useAppState();
  const term = normalize(query.trim());

  return useMemo(() => {
    if (term.length < 2) return { groups: [], flat: [], count: 0 };

    const newsItems: SearchResultItem[] = news
      .filter((item) => isEligible(user, item.audienceTeamIds) && !item.expired)
      .filter((item) => matches(term, item.title, item.summary, item.topic))
      .map((item) => ({ id: `news-${item.id}`, title: item.title, meta: `${item.topic} · ${item.publishedAt}`, href: `/news/${item.id}` }));

    const eventItems: SearchResultItem[] = events
      .filter((item) => isEligible(user, item.audienceTeamIds) && item.status !== 'past' && item.status !== 'cancelled')
      .filter((item) => matches(term, item.title, item.summary, item.location, item.organizer))
      .map((item) => ({ id: `events-${item.id}`, title: item.title, meta: `${item.dateLabel} · ${item.location}`, href: `/events/${item.id}` }));

    const docItems: SearchResultItem[] = knowledgeDocs
      .filter((item) => isEligible(user, item.audienceTeamIds))
      .filter((item) => matches(term, item.title, item.summary, item.topic))
      .map((item) => ({ id: `docs-${item.id}`, title: item.title, meta: item.topic, href: `/knowledge/${item.id}` }));

    const goalItems: SearchResultItem[] = goals
      .filter((item) => matches(term, item.title, item.owner))
      .map((item) => ({ id: `goals-${item.id}`, title: item.title, meta: `Tiến độ ${item.progress}%`, href: `/goals/${item.id}` }));

    const peopleSource = [
      ...Object.values(users).map((entry) => ({ id: entry.id, name: entry.name, role: entry.role })),
      ...teamMembers.map((entry) => ({ id: entry.id, name: entry.name, role: entry.role })),
    ];
    const peopleItems: SearchResultItem[] = peopleSource
      .filter((entry) => matches(term, entry.name, entry.role))
      .map((entry) => ({
        id: `people-${entry.id}`,
        title: entry.name,
        meta: entry.role,
        href: entry.name === user.name ? '/profile' : '/manager/team',
      }));

    const groups: SearchResultGroup[] = [
      { key: 'news', label: 'Tin tức', items: newsItems },
      { key: 'events', label: 'Sự kiện', items: eventItems },
      { key: 'docs', label: 'Tri thức', items: docItems },
      { key: 'goals', label: 'Mục tiêu', items: goalItems },
      { key: 'people', label: 'Con người', items: peopleItems },
    ];
    const flat = groups.flatMap((group) => group.items);
    return { groups, flat, count: flat.length };
  }, [events, goals, knowledgeDocs, news, term, user]);
}
