# Phase 4 — Tri thức: iWiki-style Learning Hub

## Context Links

- [plan.md](./plan.md) · [phase-01](./phase-01-foundation-shared-surface.md) (12 docs + optional `authorName/emoji/readingTime/recommended/recentlyViewedLabel`) · [brainstorm §5](../reports/brainstorm-260812-2305-demo-v2-social-ai-everywhere.md)
- Read before coding: current `src/pages/KnowledgePages.tsx` (permission filter, search, detail guards, R-badge header), `src/lib/audience.ts`, `src/components/UI.tsx`

## Overview

- **Priority:** P1. **Effort:** 1d. **Status:** pending. **Parallel with 2, 3, 5.**
- Restyle `/knowledge` from a list page into an iWiki-style learning hub: centered hero greeting + big search + topic chips, "Dành cho bạn" carousel, motivational banner + CTA, "Đã xem gần đây" 2-col, "Mới gần đây". Detail page polished, guards intact.

## Key Insights

- **Keep the two demo beats intact**: (a) `isEligible` permission filter hides `finance-budget-guideline` for An — it must stay hidden from every new surface (carousel, recent, search); (b) the detail-page audience guard for direct URL access stays.
- Hero greeting is personalized from live state: `Chào ${user.shortName}, bạn muốn học gì hôm nay?` — works in both perspectives (Mai sees her own name).
- Hub search stays **page-local** (existing filter behavior) — it does NOT open the ⌘K palette. Two search affordances coexist by design: global palette in topbar, in-hub filter here.
- **R-badge removal (D2)**: rebuilt header must NOT render `<RBadge tag="R2" />`. Remove the import too (unused import = build error under strict lint/TS config).
- CSS: append to the existing `src/styles/knowledge-goals.css`. **Do NOT delete the existing `.goal-*` rules** — Phase 5 still ships while this file changes; it adds its own `goals-v2.css`.

## Requirements

### Functional
1. **Hero (centered)**: eyebrow `TRI THỨC`, greeting h1, sub-line, large search input (auto-filter as you type, ≥2 chars), **topic chips** derived from `Array.from(new Set(docs.map(d => d.topic)))` with a color class cycle; chip toggles a topic filter (single-select, click again to clear).
2. **"Dành cho bạn" carousel**: `docs.filter(d => d.recommended)` (4) — horizontal snap cards with emoji tile, topic pill, title, `authorShort` avatar + `authorName`, `readingTime`. Hidden when a search/topic filter is active.
3. **Motivational banner**: "Đừng để kiến thức ngừng chảy" + copy + CTA `Chia sẻ tài liệu của bạn` → local toast "Tính năng đóng góp tài liệu sẽ mở ở bản kế tiếp" (concept CTA, no navigation, no dead button).
4. **"Đã xem gần đây"**: 2-column list of `docs.filter(d => d.recentlyViewedLabel)` (2) + label. Hidden when filtering.
5. **"Mới gần đây"**: remaining docs sorted by `updatedAt` string desc (fixtures use a sortable label — if not sortable, keep fixture order), compact rows w/ topic pill + readingTime.
6. **Filter/search results mode**: when search term ≥2 chars or a topic chip is active → replace sections 2/3/4/5 with a single `Kết quả` grid + result count + `Xoá bộ lọc` action; `EmptyState` when zero.
7. **Detail page**: hero band (emoji + topic pill + title + author + updatedAt + readingTime), body paragraphs in a readable measure (~68ch), `Tài liệu liên quan` (2 same-topic docs), back link, audience guard unchanged.

### Non-functional
- All docs surfaces filter through `isEligible(user, doc.audienceTeamIds)` **once** at the top of the page (single filtered array feeds all sections) — no per-section filter duplication (DRY, and impossible to leak).
- Classes prefixed `khub-`; responsive 3→2→1 columns; dark theme verified.
- Files ≤200 lines → split subcomponents into `src/pages/knowledge/`.

## Architecture

```
src/pages/KnowledgePages.tsx           // KnowledgePage + KnowledgeDetailPage orchestration (<200 lines)
src/pages/knowledge/KnowledgeHero.tsx  // greeting + search + topic chips
src/pages/knowledge/DocCarousel.tsx    // "Dành cho bạn"
src/pages/knowledge/DocList.tsx        // recent-viewed 2-col + "Mới gần đây" rows + results grid
src/styles/knowledge-goals.css         // APPEND `khub-*` rules; keep existing `.goal-*` rules untouched
```

```tsx
const { knowledgeDocs, user } = useAppState();
const docs = useMemo(() => knowledgeDocs.filter(d => isEligible(user, d.audienceTeamIds)), [knowledgeDocs, user]);
const [term, setTerm] = useState(''); const [topic, setTopic] = useState<string | null>(null);
const filtering = term.trim().length >= 2 || topic !== null;
```

## Related Code Files

**Modify:** `src/pages/KnowledgePages.tsx`, `src/styles/knowledge-goals.css` (append only)
**Create:** `src/pages/knowledge/{KnowledgeHero,DocCarousel,DocList}.tsx`
**Must NOT touch:** `GoalPages.tsx` / `src/styles/goals-v2.css` (Phase 5), `AppState.tsx`, `mockData.ts`, `types/index.ts`, `app.css`, `components/RBadge.tsx` (keep the component; only stop rendering it here).

## Implementation Steps

1. Single filtered `docs` array + local filter state; delete the `RBadge` header usage + import.
2. `KnowledgeHero` (greeting, search, topic chips).
3. `DocCarousel` ("Dành cho bạn").
4. `DocList` (recently viewed 2-col, "Mới gần đây" rows, results grid, EmptyState).
5. Banner + CTA toast (local, same lightweight pattern as Phase 2 but its own file-local hook — no cross-phase import).
6. Detail page polish + related docs + guard verification (open `/knowledge/finance-budget-guideline` directly → guard still blocks).
7. Dark + 1024px + mobile pass.
8. `npm run typecheck && npm run build`; commit `feat(knowledge): iWiki-style learning hub with hero search, recommendations and recent docs`.

## Todo List

- [ ] Header R-badge removed (component kept), import cleaned
- [ ] Hero greeting w/ `user.shortName` + big search + topic chips (single-select, clearable)
- [ ] "Dành cho bạn" carousel (4 recommended docs, author + readingTime)
- [ ] Motivational banner + CTA → toast (no dead button)
- [ ] "Đã xem gần đây" 2-col + "Mới gần đây" rows
- [ ] Filter/search results mode + count + clear + EmptyState
- [ ] Detail page: hero band, readable measure, related docs, guard intact
- [ ] Finance doc invisible everywhere for An; permission filter applied once
- [ ] typecheck + build green; committed

## Success Criteria

- 12 docs (11 visible to An) populate every section with no empty-looking areas.
- Searching `nghỉ phép` in the hub finds `leave-request-process`; the same query in ⌘K also works (Phase 6 adds its AI answer).
- Direct-URL access to the Finance doc still blocked; no Finance doc appears in carousel/recent/results.

## Risk Assessment

- **CSS collision with Phase 5 in `knowledge-goals.css`** → append-only + `khub-` prefix; never delete existing rules.
- **Carousel overflow/scrollbar ugliness** → hidden scrollbar + snap; verify on macOS trackpad and at 1024px.
- **`updatedAt` strings not sortable** → fall back to fixture order rather than parsing VN date strings (YAGNI; note in code).
- **Docs missing optional fields** → all optional fields render conditionally; never assume presence.

## Security Considerations

Permission filter is demo-fidelity, not a boundary (see `lib/audience.ts` note). No new inputs are persisted.

## Next Steps

Phase 6 adds the `/knowledge` A2 chip ("Tài liệu cho người mới?") with citations, and keeps the Finance deny script.
