import { ArrowRight, BookBookmark, ChatsCircle, CheckCircle, Clock, Newspaper, ShieldWarning, Target, Users } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { AIAssistant } from '../components/AIAssistant';
import { NewsCard } from '../components/ContentCards';
import { EventCardV2 } from './events/EventCardV2';
import { EmptyState, SectionHeader, StatusPill } from '../components/UI';
import { isEligible } from '../lib/audience';
import { rankCards, type RankableCard } from '../lib/ranking';
import type { EventItem, NewsPost } from '../types';

type HomeCard = { kind: 'news'; post: NewsPost } | { kind: 'event'; event: EventItem };

const HOUR_MS = 60 * 60 * 1000;

/** Vietnamese `dd/mm/yyyy` embedded in `dateLabel` + `HH:mm` from `time` — the only real timestamp mock events carry. */
function parseEventStart(event: EventItem): Date | undefined {
  const dateMatch = event.dateLabel.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) return undefined;
  const [, day, month, year] = dateMatch;
  const timeMatch = event.time.match(/(\d{2}):(\d{2})/);
  const hour = timeMatch ? timeMatch[1] : '00';
  const minute = timeMatch ? timeMatch[2] : '00';
  const start = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+07:00`);
  return Number.isNaN(start.getTime()) ? undefined : start;
}

function isOverdue(dueLabel?: string): boolean {
  return !!dueLabel && /quá hạn/i.test(dueLabel);
}

/** Page-local priority-band adapter (spec §13.2) — news/events carry no band, this derives one from existing fields. */
function toRankable(card: HomeCard, now: Date): RankableCard {
  if (card.kind === 'news') {
    const { post } = card;
    const needsAction = !!post.mandatory && !post.acknowledged;
    const overdue = needsAction && isOverdue(post.dueLabel);
    return {
      id: post.id,
      priorityBand: needsAction ? (overdue ? 'P0' : 'P1') : post.official ? 'P4' : 'P5',
      severity: needsAction ? 'critical' : undefined,
      official: post.official,
      updatedAt: post.publishedAt,
    };
  }
  const { event } = card;
  const start = parseEventStart(event);
  const registered = event.myRegistration === 'going' || event.myRegistration === 'waitlisted';
  const startingSoon = !!start && start.getTime() >= now.getTime() && start.getTime() - now.getTime() <= 48 * HOUR_MS;
  const iso = start?.toISOString();
  return {
    id: event.id,
    priorityBand: registered || startingSoon ? 'P2' : 'P5',
    dueAt: iso,
    updatedAt: iso ?? event.dateLabel,
  };
}

function rankHomeCards(cards: HomeCard[], now: Date): HomeCard[] {
  const rankable = cards.map((card) => ({ ...toRankable(card, now), card }));
  return rankCards(rankable).map((entry) => entry.card);
}

function newsFrom(cards: HomeCard[]): NewsPost[] {
  return cards.flatMap((card) => (card.kind === 'news' ? [card.post] : []));
}

function eventsFrom(cards: HomeCard[]): EventItem[] {
  return cards.flatMap((card) => (card.kind === 'event' ? [card.event] : []));
}

function eventStatusLabel(event: EventItem): string {
  const registration = event.myRegistration === 'waitlisted' ? 'Bạn đang chờ danh sách' : 'Bạn đã đăng ký';
  return `${registration} · ${event.dateLabel}`;
}

export function HomePage() {
  const { user, news, events, goals, knowledgeDocs, posts } = useAppState();
  const now = new Date();

  const needsCheckInCount = goals.filter((goal) => goal.status === 'needs_update').length;
  const eligibleDocsCount = knowledgeDocs.filter((doc) => isEligible(user, doc.audienceTeamIds)).length;

  const eligibleNews = news.filter((post) => !post.expired && isEligible(user, post.audienceTeamIds));
  const eligibleEvents = events.filter((event) => event.status !== 'past' && event.status !== 'cancelled' && isEligible(user, event.audienceTeamIds));

  const heroCandidates = eligibleNews.filter((post) => post.mandatory && !post.acknowledged).map((post): HomeCard => ({ kind: 'news', post }));
  const heroCard = rankHomeCards(heroCandidates, now)[0];
  const hero = heroCard?.kind === 'news' ? heroCard.post : undefined;

  const registeredEvents = eligibleEvents.filter((event) => event.myRegistration === 'going' || event.myRegistration === 'waitlisted');
  const targetedUnreadNews = eligibleNews.filter((post) => post.id !== hero?.id && ((post.mandatory && !post.acknowledged) || (!!post.audienceTeamIds?.length && !post.read)));
  const activeCandidates = [
    ...registeredEvents.map((event): HomeCard => ({ kind: 'event', event })),
    ...targetedUnreadNews.map((post): HomeCard => ({ kind: 'news', post })),
  ];
  const activeItems = rankHomeCards(activeCandidates, now).slice(0, 3);

  const newsPreviewCandidates = eligibleNews.filter((post) => post.id !== hero?.id).map((post): HomeCard => ({ kind: 'news', post }));
  const newsPreview = newsFrom(rankHomeCards(newsPreviewCandidates, now)).slice(0, 4);

  const upcomingCandidates = eligibleEvents.map((event): HomeCard => ({ kind: 'event', event }));
  const upcomingEvents = eventsFrom(rankHomeCards(upcomingCandidates, now)).slice(0, 2);

  const activeTotal = registeredEvents.length + targetedUnreadNews.length;

  const statusLine = activeTotal > 0
    ? `Bạn có ${activeTotal} việc cần chú ý và ${eligibleEvents.length} sự kiện sắp diễn ra.`
    : `Bạn đã xử lý hết việc cần chú ý, còn ${eligibleEvents.length} sự kiện sắp diễn ra.`;

  return (
    <div className="page overview-page">
      <AIAssistant subtitle={statusLine} />

      {hero && (
        <section className="priority-hero priority-hero--compact" aria-labelledby="priority-title">
          <div className="priority-icon"><ShieldWarning size={18} weight="duotone" /></div>
          <div className="priority-copy">
            <div className="card-badges">
              <StatusPill tone="error">Cần xác nhận</StatusPill>
              {hero.dueLabel && <StatusPill>{hero.dueLabel}</StatusPill>}
            </div>
            <h2 id="priority-title">{hero.title}</h2>
          </div>
          <Link className="button button--primary" to={`/news/${hero.id}`}>Đọc & xác nhận<ArrowRight size={16} /></Link>
        </section>
      )}

      <div className="home-grid">
        <section className="home-main">
          <SectionHeader title="Việc của tôi" meta="Ưu tiên theo thời hạn và mức độ liên quan" />
          <div className="active-items">
            {activeItems.length === 0 ? (
              <div className="active-item">
                <span className="active-item-icon"><CheckCircle size={20} /></span>
                <div><strong>Bạn đã xử lý hết việc cần chú ý</strong><span>My iKame sẽ đưa việc mới lên đây khi cần.</span></div>
              </div>
            ) : activeItems.map((card) => card.kind === 'event' ? (
              <article key={`event-${card.event.id}`} className="active-item">
                <span className="active-item-icon active-item-icon--time"><Clock size={20} /></span>
                <div><strong>{card.event.title}</strong><span>{eventStatusLabel(card.event)}</span></div>
                <Link className="text-link" to={`/events/${card.event.id}`}>Xem sự kiện<ArrowRight size={16} /></Link>
              </article>
            ) : (
              <article key={`news-${card.post.id}`} className="active-item">
                <span className="active-item-icon"><Newspaper size={20} /></span>
                <div><strong>{card.post.title}</strong><span>{card.post.publisher} · {card.post.readingTime}</span></div>
                <Link className="text-link" to={`/news/${card.post.id}`}>Đọc bài<ArrowRight size={16} /></Link>
              </article>
            ))}
          </div>

          <section className="section-block">
            <SectionHeader title="Tin dành cho bạn" meta="Chính thức và phù hợp với vai trò của bạn" href="/news" />
            {newsPreview.length > 0 ? (
              <div className="news-grid">
                {newsPreview.map((post, index) => <NewsCard key={post.id} post={post} compact={index > 0} />)}
              </div>
            ) : (
              <EmptyState title="Chưa có tin mới" body="Nội dung dành cho bạn sẽ xuất hiện ở đây." />
            )}
          </section>
        </section>

        <aside className="home-rail">
          <section>
            <SectionHeader title="Lối tắt của bạn" />
            <div className="quick-actions">
              <Link className="quick-action" to="/goals">
                <span className="quick-action-icon"><Target size={20} /></span>
                <span><strong>Mục tiêu của tôi</strong><small>{needsCheckInCount > 0 ? `${needsCheckInCount} mục tiêu cần check-in` : 'Tất cả đã cập nhật'}</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link className="quick-action" to="/knowledge">
                <span className="quick-action-icon"><BookBookmark size={20} /></span>
                <span><strong>Tri thức</strong><small>{eligibleDocsCount} tài liệu dành cho bạn</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link className="quick-action" to="/community">
                <span className="quick-action-icon"><ChatsCircle size={20} /></span>
                <span><strong>iKame Feed</strong><small>{posts.length} bài viết từ đồng nghiệp</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link className="quick-action" to="/search">
                <span className="quick-action-icon"><Users size={20} /></span>
                <span><strong>Danh bạ iKame</strong><small>Tìm đồng nghiệp, tin tức, tài liệu</small></span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
          <section className="section-block">
            <SectionHeader title="Sự kiện sắp tới" href="/events" />
            {upcomingEvents.length > 0 ? (
              <div className="rail-stack">
                {upcomingEvents.map((event) => <EventCardV2 key={event.id} event={event} compact />)}
              </div>
            ) : (
              <EmptyState title="Chưa có sự kiện" body="Sự kiện sắp diễn ra sẽ xuất hiện ở đây." />
            )}
          </section>
        </aside>
      </div>

    </div>
  );
}
