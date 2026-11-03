import { ArrowRight, ChatsCircle, CheckCircle, Clock, ShieldWarning, SquaresFour, Users } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { AIAssistant } from '../components/AIAssistant';
import { NewsCard } from '../components/ContentCards';
import { ICheckWidget } from '../components/icheck/ICheckWidget';
import { JourneyCard } from '../components/onboarding/JourneyCard';
import { buildDailyDigestItems, HOME_DIGEST_LIMIT } from './assistant/daily-digest';
import { journeyDigestQuests } from '../lib/onboarding';
import { documentReminders } from '../data/profile-data';
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

export function HomePage() {
  const { user, news, events, goals, posts, dailyCheckIn, documents, isNewJoiner, journey } = useAppState();
  const now = new Date();
  // Người mới: quest đến hạn/trễ của hành trình 60 ngày lên Việc hôm nay (tối đa 2).
  const journeyQuests = isNewJoiner ? journeyDigestQuests(journey) : undefined;

  const eligibleNews = news.filter((post) => !post.expired && isEligible(user, post.audienceTeamIds));
  const eligibleEvents = events.filter((event) => event.status !== 'past' && event.status !== 'cancelled' && isEligible(user, event.audienceTeamIds));

  const heroCandidates = eligibleNews.filter((post) => post.mandatory && !post.acknowledged).map((post): HomeCard => ({ kind: 'news', post }));
  const heroCard = rankHomeCards(heroCandidates, now)[0];
  const hero = heroCard?.kind === 'news' ? heroCard.post : undefined;

  // "Việc hôm nay" — cùng nguồn với Trợ lý AI (Daily Work Hub), tối đa 5 mục trên Home.
  const digest = buildDailyDigestItems({ news: eligibleNews, events: eligibleEvents, goals, checkedIn: dailyCheckIn.done, documentReminders: documentReminders(documents), journeyQuests }).slice(0, HOME_DIGEST_LIMIT);
  const urgentCount = digest.filter((item) => item.urgent).length;

  const newsPreviewCandidates = eligibleNews.filter((post) => post.id !== hero?.id).map((post): HomeCard => ({ kind: 'news', post }));
  const newsPreview = newsFrom(rankHomeCards(newsPreviewCandidates, now)).slice(0, 4);

  const upcomingCandidates = eligibleEvents.map((event): HomeCard => ({ kind: 'event', event }));
  const upcomingEvents = eventsFrom(rankHomeCards(upcomingCandidates, now)).slice(0, 2);

  const statusLine = urgentCount > 0
    ? `Bạn có ${urgentCount} việc khẩn hôm nay và ${eligibleEvents.length} sự kiện sắp diễn ra.`
    : `Hôm nay không có việc khẩn, còn ${eligibleEvents.length} sự kiện sắp diễn ra.`;

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
          <Link className="button button--primary" to={`/feed/article/${hero.id}`}>Đọc & xác nhận<ArrowRight size={16} /></Link>
        </section>
      )}

      {/* Overlay Người mới (joinedAt < 60 ngày): thẻ hành trình, gọn lại khi đã có hero bắt buộc. */}
      {isNewJoiner && journey && <JourneyCard journey={journey} compact={!!hero} />}

      <div className="home-grid">
        <section className="home-main">
          <ICheckWidget compact />

          <section className="section-block">
            <SectionHeader title="Việc hôm nay" meta="Gom từ iCheck, COM, iGoal, Asana và lịch của bạn" href="/assistant?q=Hôm nay tôi cần làm gì?" actionLabel="Hỏi Trợ lý AI" />
            <div className="active-items">
              {digest.length === 0 ? (
                <div className="active-item">
                  <span className="active-item-icon"><CheckCircle size={20} /></span>
                  <div><strong>Bạn đã xử lý hết việc hôm nay</strong><span>My iKame sẽ đưa việc mới lên đây khi cần.</span></div>
                </div>
              ) : digest.map((item) => (
                <article key={item.id} className={`active-item ${item.urgent ? 'is-urgent' : ''}`}>
                  <span className={`active-item-icon ${item.urgent ? '' : 'active-item-icon--time'}`}>{item.urgent ? <ShieldWarning size={20} /> : <Clock size={20} />}</span>
                  <div><strong>{item.label}</strong><span>{item.meta} · {item.source}</span></div>
                  <Link className="text-link" to={item.to}>Xử lý<ArrowRight size={16} /></Link>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <SectionHeader title="Tin dành cho bạn" meta="Chính thức và phù hợp với vai trò của bạn" href="/feed" />
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
              <Link className="quick-action" to="/feed">
                <span className="quick-action-icon"><ChatsCircle size={20} /></span>
                <span><strong>iKame Feed</strong><small>{posts.length} bài viết từ đồng nghiệp</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link className="quick-action" to="/apps">
                <span className="quick-action-icon"><SquaresFour size={20} /></span>
                <span><strong>Ứng dụng nội bộ</strong><small>Mở iGoal, iWiki, iHRM... với SSO chung</small></span>
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
