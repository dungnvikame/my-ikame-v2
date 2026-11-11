import { ArrowRightIcon as ArrowRight, ChatsCircleIcon as ChatsCircle, PaperPlaneTiltIcon as PaperPlaneTilt, SquaresFourIcon as SquaresFour, UsersIcon as Users } from '@coreds/react/icons';
import { Link } from 'react-router-dom';
import { useAppState } from '../AppState';
import { AIAssistant } from '../components/AIAssistant';
import { NewsCard } from '../components/ContentCards';
import { ICheckWidget } from '../components/icheck/ICheckWidget';
import { useLive } from '../lib/live/live-data';
import { buildLiveDigestItems } from '../lib/live/live-digest';
import { DayTimeline, type TimelineMeeting } from '../components/home/DayTimeline';
import { TodayTasks } from '../components/home/TodayTasks';
import { LiveDataBar } from '../components/live/LiveDataBar';
import { JourneyCard } from '../components/onboarding/JourneyCard';
import { buildDailyDigestItems } from './assistant/daily-digest';
import { journeyDigestQuests } from '../lib/onboarding';
import { documentReminders } from '../data/profile-data';
import { EventCardV2 } from './events/EventCardV2';
import { EmptyState, SectionHeader } from '../components/UI';
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
  // Đã nối iCheck thật: "Chấm công hôm nay" trong Việc hôm nay theo bản ghi thật, không theo kịch bản mẫu.
  const live = useLive().data;
  const checkedIn = live?.icheck ? live.icheck.checkIn.done : dailyCheckIn.done;
  // Người mới: quest đến hạn/trễ của hành trình 60 ngày lên Việc hôm nay (tối đa 2).
  const journeyQuests = isNewJoiner ? journeyDigestQuests(journey) : undefined;

  const eligibleNews = news.filter((post) => !post.expired && isEligible(user, post.audienceTeamIds));
  const eligibleEvents = events.filter((event) => event.status !== 'past' && event.status !== 'cancelled' && isEligible(user, event.audienceTeamIds));

  const heroCandidates = eligibleNews.filter((post) => post.mandatory && !post.acknowledged).map((post): HomeCard => ({ kind: 'news', post }));
  const heroCard = rankHomeCards(heroCandidates, now)[0];
  const hero = heroCard?.kind === 'news' ? heroCard.post : undefined;

  // "Việc hôm nay" — cùng nguồn với Trợ lý AI (Daily Work Hub), tối đa 5 mục trên Home.
  const mockDigest = buildDailyDigestItems({ news: eligibleNews, events: eligibleEvents, goals, checkedIn, documentReminders: documentReminders(documents), journeyQuests });
  // Đã nối dữ liệu thật: việc cá nhân lấy từ công cụ thật; chỉ giữ lại việc của chính My iKame
  // (tin cần xác nhận, sự kiện đã đăng ký) từ dữ liệu mẫu — không trộn việc của nhân vật mẫu.
  const fullDigest = live
    ? [...buildLiveDigestItems(live, now), ...mockDigest.filter((item) => item.source === 'COM' || item.source === 'My iKame')]
    : mockDigest;
  const urgentCount = fullDigest.filter((item) => item.urgent).length;

  const newsPreviewCandidates = eligibleNews.filter((post) => post.id !== hero?.id).map((post): HomeCard => ({ kind: 'news', post }));
  const newsPreview = newsFrom(rankHomeCards(newsPreviewCandidates, now)).slice(0, 4);

  const upcomingCandidates = eligibleEvents.map((event): HomeCard => ({ kind: 'event', event }));
  const upcomingEvents = eventsFrom(rankHomeCards(upcomingCandidates, now)).slice(0, 2);

  const statusLine = urgentCount > 0
    ? `Bạn có ${urgentCount} việc gấp hôm nay và ${eligibleEvents.length} sự kiện sắp diễn ra.`
    : `Hôm nay không có việc gấp, còn ${eligibleEvents.length} sự kiện sắp diễn ra.`;

  // Dải thời gian: lịch thật khi đã kết nối, nếu không dùng cuộc họp của kịch bản mẫu (khớp "Việc hôm nay").
  const at = (hour: number, minute = 0) => { const date = new Date(now); date.setHours(hour, minute, 0, 0); return date; };
  const timelineMeetings: TimelineMeeting[] = live
    ? (live.meetings ?? []).filter((meeting) => !meeting.allDay).map((meeting) => ({ id: meeting.id, title: meeting.title, start: meeting.start, end: meeting.end }))
    : [{ id: 'mock-product-sync', title: 'Họp nhóm Product', start: at(14), end: at(15) }];

  return (
    <div className="page overview-page">
      <AIAssistant subtitle={statusLine} compact>
        <DayTimeline meetings={timelineMeetings} now={now} />
      </AIAssistant>

      <LiveDataBar />

      {/* Tin bắt buộc không còn băng riêng: nó đứng đầu "Cần làm ngay" với nhãn Gấp, tránh hiện hai lần. */}
      {/* Overlay Người mới (joinedAt < 60 ngày): thẻ hành trình, gọn lại khi đã có hero bắt buộc. */}
      {isNewJoiner && journey && <JourneyCard journey={journey} />}

      <div className="home-grid">
        <section className="home-main">
          {/* Việc cần làm đứng đầu cột chính: mở trang là thấy, không phải cuộn qua chấm công. */}
          <TodayTasks
            items={fullDigest}
            askHref="/assistant?q=Hôm nay tôi cần làm gì?"
            sourceNote={live ? 'Từ iCheck, iHiring, iGoal và Lịch của bạn, cộng tin cần xác nhận trên My iKame.' : 'Gom từ iCheck, COM, iGoal, Asana và lịch của bạn.'}
          />

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
          <ICheckWidget compact />
          <section className="section-block">
            <SectionHeader title="Lối tắt của bạn" />
            <div className="quick-actions">
              <Link className="quick-action" to="/requests">
                <span className="quick-action-icon"><PaperPlaneTilt size={20} /></span>
                <span><strong>Tạo đề xuất</strong><small>Gõ một câu: xin nghỉ, làm từ xa, báo sự cố</small></span>
                <ArrowRight size={16} />
              </Link>
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
